// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FolderEscrow.sol";

contract FolderRegistryFactory is AccessControl {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    struct FolderInfo {
        string name;
        address folder;
        uint256 createdAt;
    }

    mapping(bytes32 => address) public folderByNameHash;
    mapping(address => FolderInfo) public folderInfo;
    address[] public allFolders;

    event FolderCreated(string name, address indexed folder, address indexed token);

    constructor(address governance) {
        _grantRole(DEFAULT_ADMIN_ROLE, governance);
        _grantRole(GOVERNANCE_ROLE, governance);
    }

    function createFolder(
        string calldata name,
        address token,
        address folderAdmin
    ) external onlyRole(GOVERNANCE_ROLE) returns (address) {
        require(bytes(name).length > 0, "Empty name");
        bytes32 nameHash = keccak256(abi.encodePacked(name));
        require(folderByNameHash[nameHash] == address(0), "Name already used");

        FolderEscrow folder = new FolderEscrow(
            IERC20(token),
            folderAdmin,
            name,
            address(this)
        );

        address folderAddress = address(folder);
        folderByNameHash[nameHash] = folderAddress;
        folderInfo[folderAddress] = FolderInfo(name, folderAddress, block.timestamp);
        allFolders.push(folderAddress);

        emit FolderCreated(name, folderAddress, token);
        return folderAddress;
    }

    // -------------------------
    // Token Stats
    // -------------------------

    function totalSupply() external view returns (uint256 total) {
        for (uint i = 0; i < allFolders.length; i++) {
            FolderEscrow folder = FolderEscrow(allFolders[i]);
            uint256 beneficiaryCount = folder.getBeneficiaryCount();
            for (uint j = 0; j < beneficiaryCount; j++) {
                uint256 vested = folder._vestedAmount(j);
                total += vested;
            }
        }
    }

    function circulating() external view returns (uint256 totalClaimed) {
        for (uint i = 0; i < allFolders.length; i++) {
            FolderEscrow folder = FolderEscrow(allFolders[i]);
            uint256 beneficiaryCount = folder.getBeneficiaryCount();
            for (uint j = 0; j < beneficiaryCount; j++) {
                (,,, uint256 claimed,,,,,,) = folder.beneficiaries(j);
                totalClaimed += claimed;
            }
        }
    }

    function stakedValue() external view returns (uint256 totalLocked) {
        for (uint i = 0; i < allFolders.length; i++) {
            FolderEscrow folder = FolderEscrow(allFolders[i]);
            uint256 beneficiaryCount = folder.getBeneficiaryCount();
            for (uint j = 0; j < beneficiaryCount; j++) {
                (,,, uint256 claimed,,,,,,) = folder.beneficiaries(j);
                uint256 vested = folder._vestedAmount(j);
                totalLocked += vested - claimed;
            }
        }
    }

    function totalHolders() external view returns (uint256 holders) {
        for (uint i = 0; i < allFolders.length; i++) {
            FolderEscrow folder = FolderEscrow(allFolders[i]);
            holders += folder.getBeneficiaryCount();
        }
    }

    // -------------------------
    // Views
    // -------------------------

    function getFolderByName(string calldata name) external view returns (address) {
        return folderByNameHash[keccak256(abi.encodePacked(name))];
    }

    function getAllFolders() external view returns (address[] memory) {
        return allFolders;
    }

    function totalFolders() external view returns (uint256) {
        return allFolders.length;
    }
}
