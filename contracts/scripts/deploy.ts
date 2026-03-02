import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CivicBadge with account:", deployer.address);

  const baseURI =
    process.env.NEXT_PUBLIC_APP_URL || "https://civicwallet.vercel.app";
  const metadataURI = `${baseURI}/api/metadata/{id}`;

  const CivicBadge = await ethers.getContractFactory("CivicBadge");
  const contract = await CivicBadge.deploy(metadataURI, deployer.address);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("CivicBadge deployed to:", address);
  console.log("Metadata URI:", metadataURI);
  console.log(
    "\nUpdate NEXT_PUBLIC_CONTRACT_ADDRESS in your .env with:",
    address,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
