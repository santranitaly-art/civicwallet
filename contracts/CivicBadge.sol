// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CivicBadge
 * @notice Soulbound ERC-1155 badges for Italian volunteer recognition.
 *         Tokens are NON-transferable and NON-monetary.
 *         Only minting (from address(0)) and burning (to address(0)) are allowed.
 */
contract CivicBadge is ERC1155, ERC1155Supply, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Token ID constants - Presence badges
    uint256 public constant BRONZE_PRESENCE = 1;
    uint256 public constant SILVER_PRESENCE = 2;
    uint256 public constant GOLD_PRESENCE = 3;

    // Skill badges
    uint256 public constant SAFE_HANDS = 10;
    uint256 public constant LOGISTICS_PRO = 11;
    uint256 public constant TEAM_LEADER = 12;

    // Special badges
    uint256 public constant HERO_EVENT = 20;
    uint256 public constant MENTOR = 21;

    string public name = "CivicWallet Badge";
    string public symbol = "CIVIC";

    mapping(uint256 => bool) public validBadgeTypes;
    mapping(address => mapping(uint256 => bool)) public hasBadge;

    event BadgeMinted(
        address indexed to,
        uint256 indexed tokenId,
        string hashedVolunteerId
    );
    event BadgeRevoked(
        address indexed from,
        uint256 indexed tokenId,
        string reason
    );
    event BadgeTypeAdded(uint256 indexed tokenId);

    error TransferBlocked();
    error InvalidBadgeType(uint256 tokenId);
    error BadgeAlreadyOwned(address account, uint256 tokenId);

    constructor(string memory uri_, address admin) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        validBadgeTypes[BRONZE_PRESENCE] = true;
        validBadgeTypes[SILVER_PRESENCE] = true;
        validBadgeTypes[GOLD_PRESENCE] = true;
        validBadgeTypes[SAFE_HANDS] = true;
        validBadgeTypes[LOGISTICS_PRO] = true;
        validBadgeTypes[TEAM_LEADER] = true;
        validBadgeTypes[HERO_EVENT] = true;
        validBadgeTypes[MENTOR] = true;
    }

    /**
     * @notice Mint a soulbound badge to a volunteer
     * @param to The volunteer's wallet address
     * @param tokenId The badge type ID
     * @param hashedVolunteerId Keccak256 hash of volunteer ID (no PII on-chain)
     */
    function mintBadge(
        address to,
        uint256 tokenId,
        string calldata hashedVolunteerId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        if (!validBadgeTypes[tokenId]) revert InvalidBadgeType(tokenId);
        if (hasBadge[to][tokenId]) revert BadgeAlreadyOwned(to, tokenId);

        hasBadge[to][tokenId] = true;
        _mint(to, tokenId, 1, "");
        emit BadgeMinted(to, tokenId, hashedVolunteerId);
    }

    /**
     * @notice Batch mint multiple badges
     */
    function mintBadgeBatch(
        address to,
        uint256[] calldata tokenIds,
        string calldata hashedVolunteerId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256[] memory amounts = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (!validBadgeTypes[tokenIds[i]])
                revert InvalidBadgeType(tokenIds[i]);
            if (hasBadge[to][tokenIds[i]])
                revert BadgeAlreadyOwned(to, tokenIds[i]);
            hasBadge[to][tokenIds[i]] = true;
            amounts[i] = 1;
        }
        _mintBatch(to, tokenIds, amounts, "");
    }

    /**
     * @notice Revoke (burn) a badge from a volunteer
     */
    function revokeBadge(
        address from,
        uint256 tokenId,
        string calldata reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        hasBadge[from][tokenId] = false;
        _burn(from, tokenId, 1);
        emit BadgeRevoked(from, tokenId, reason);
    }

    /**
     * @notice Add a new badge type
     */
    function addBadgeType(
        uint256 tokenId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validBadgeTypes[tokenId] = true;
        emit BadgeTypeAdded(tokenId);
    }

    /**
     * @notice Soulbound: only mint (from == 0) and burn (to == 0) allowed
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            revert TransferBlocked();
        }
        super._update(from, to, ids, values);
    }

    /**
     * @notice Disable approvals (soulbound tokens cannot be approved)
     */
    function setApprovalForAll(address, bool) public pure override {
        revert TransferBlocked();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setURI(
        string memory newuri
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }
}
