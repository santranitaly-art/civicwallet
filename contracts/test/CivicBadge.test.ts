import { expect } from "chai";
import { ethers } from "hardhat";
import { CivicBadge } from "../artifacts/contracts/CivicBadge.sol/CivicBadge";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CivicBadge", function () {
  let contract: any;
  let admin: SignerWithAddress;
  let volunteer1: SignerWithAddress;
  let volunteer2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const METADATA_URI = "https://civicwallet.test/api/metadata/{id}";
  const HASHED_ID = "0xabcdef1234567890";

  beforeEach(async function () {
    [admin, volunteer1, volunteer2, unauthorized] = await ethers.getSigners();
    const CivicBadge = await ethers.getContractFactory("CivicBadge");
    contract = await CivicBadge.deploy(METADATA_URI, admin.address);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await contract.name()).to.equal("CivicWallet Badge");
      expect(await contract.symbol()).to.equal("CIVIC");
    });

    it("should register initial badge types", async function () {
      expect(await contract.validBadgeTypes(1)).to.be.true; // BRONZE
      expect(await contract.validBadgeTypes(2)).to.be.true; // SILVER
      expect(await contract.validBadgeTypes(3)).to.be.true; // GOLD
      expect(await contract.validBadgeTypes(10)).to.be.true; // SAFE_HANDS
      expect(await contract.validBadgeTypes(11)).to.be.true; // LOGISTICS_PRO
      expect(await contract.validBadgeTypes(12)).to.be.true; // TEAM_LEADER
      expect(await contract.validBadgeTypes(20)).to.be.true; // HERO_EVENT
      expect(await contract.validBadgeTypes(21)).to.be.true; // MENTOR
    });

    it("should grant admin all roles", async function () {
      const DEFAULT_ADMIN = await contract.DEFAULT_ADMIN_ROLE();
      const MINTER = await contract.MINTER_ROLE();
      const PAUSER = await contract.PAUSER_ROLE();
      expect(await contract.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await contract.hasRole(MINTER, admin.address)).to.be.true;
      expect(await contract.hasRole(PAUSER, admin.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should mint a badge to a volunteer", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      expect(await contract.balanceOf(volunteer1.address, 1)).to.equal(1);
      expect(await contract.hasBadge(volunteer1.address, 1)).to.be.true;
    });

    it("should emit BadgeMinted event", async function () {
      await expect(contract.mintBadge(volunteer1.address, 1, HASHED_ID))
        .to.emit(contract, "BadgeMinted")
        .withArgs(volunteer1.address, 1, HASHED_ID);
    });

    it("should reject duplicate mint", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      await expect(
        contract.mintBadge(volunteer1.address, 1, HASHED_ID),
      ).to.be.revertedWithCustomError(contract, "BadgeAlreadyOwned");
    });

    it("should reject invalid badge type", async function () {
      await expect(
        contract.mintBadge(volunteer1.address, 999, HASHED_ID),
      ).to.be.revertedWithCustomError(contract, "InvalidBadgeType");
    });

    it("should reject minting from unauthorized account", async function () {
      await expect(
        contract
          .connect(unauthorized)
          .mintBadge(volunteer1.address, 1, HASHED_ID),
      ).to.be.reverted;
    });
  });

  describe("Batch Minting", function () {
    it("should batch mint multiple badges", async function () {
      await contract.mintBadgeBatch(volunteer1.address, [1, 10, 20], HASHED_ID);
      expect(await contract.balanceOf(volunteer1.address, 1)).to.equal(1);
      expect(await contract.balanceOf(volunteer1.address, 10)).to.equal(1);
      expect(await contract.balanceOf(volunteer1.address, 20)).to.equal(1);
    });
  });

  describe("Soulbound (Transfer Blocking)", function () {
    it("should block transfers between wallets", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      await expect(
        contract
          .connect(volunteer1)
          .safeTransferFrom(volunteer1.address, volunteer2.address, 1, 1, "0x"),
      ).to.be.revertedWithCustomError(contract, "TransferBlocked");
    });

    it("should block batch transfers", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      await expect(
        contract
          .connect(volunteer1)
          .safeBatchTransferFrom(
            volunteer1.address,
            volunteer2.address,
            [1],
            [1],
            "0x",
          ),
      ).to.be.revertedWithCustomError(contract, "TransferBlocked");
    });

    it("should block setApprovalForAll", async function () {
      await expect(
        contract
          .connect(volunteer1)
          .setApprovalForAll(volunteer2.address, true),
      ).to.be.revertedWithCustomError(contract, "TransferBlocked");
    });
  });

  describe("Revoking", function () {
    it("should allow admin to revoke a badge", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      await contract.revokeBadge(volunteer1.address, 1, "Misconduct");
      expect(await contract.balanceOf(volunteer1.address, 1)).to.equal(0);
      expect(await contract.hasBadge(volunteer1.address, 1)).to.be.false;
    });

    it("should emit BadgeRevoked event", async function () {
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      await expect(contract.revokeBadge(volunteer1.address, 1, "Misconduct"))
        .to.emit(contract, "BadgeRevoked")
        .withArgs(volunteer1.address, 1, "Misconduct");
    });
  });

  describe("Admin Functions", function () {
    it("should allow adding new badge types", async function () {
      await contract.addBadgeType(100);
      expect(await contract.validBadgeTypes(100)).to.be.true;
    });

    it("should allow pausing and unpausing", async function () {
      await contract.pause();
      await expect(
        contract.mintBadge(volunteer1.address, 1, HASHED_ID),
      ).to.be.reverted;
      await contract.unpause();
      await contract.mintBadge(volunteer1.address, 1, HASHED_ID);
      expect(await contract.balanceOf(volunteer1.address, 1)).to.equal(1);
    });

    it("should allow updating URI", async function () {
      await contract.setURI("https://new-uri.com/{id}");
      expect(await contract.uri(1)).to.equal("https://new-uri.com/{id}");
    });
  });
});
