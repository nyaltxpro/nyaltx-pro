// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Treasury is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    IERC20 public immutable token;

    // Approved FolderEscrow contracts
    mapping(address => bool) public approvedFolders;
    address[] public folders;
    
    // Track total amount sent to each folder
    mapping(address => uint256) public folderBalances;

    event FolderApproved(address folder);
    event FolderRemoved(address folder);
    event TokensSentToFolder(address indexed folder, uint256 amount, uint256 totalSent);

    constructor(IERC20 _token, address governance) {
        token = _token;

        _grantRole(DEFAULT_ADMIN_ROLE, governance);
        _grantRole(GOVERNANCE_ROLE, governance);
        _grantRole(TREASURY_ADMIN_ROLE, governance);
    }

    // -----------------------
    // Folder Management
    // -----------------------

    function approveFolder(address folder)
        external
        onlyRole(TREASURY_ADMIN_ROLE)
    {
        require(!approvedFolders[folder], "Already approved");
        approvedFolders[folder] = true;
        folders.push(folder);

        emit FolderApproved(folder);
    }

    function removeFolder(address folder)
        external
        onlyRole(TREASURY_ADMIN_ROLE)
    {
        approvedFolders[folder] = false;
        emit FolderRemoved(folder);
    }

    // -----------------------
    // Treasury Actions
    // -----------------------

    function sendToFolder(address folder, uint256 amount)
        external
        onlyRole(GOVERNANCE_ROLE)
        whenNotPaused
    {
        require(approvedFolders[folder], "Folder not approved");
        require(amount > 0, "Invalid amount");

        folderBalances[folder] += amount;
        token.safeTransfer(folder, amount);
        
        emit TokensSentToFolder(folder, amount, folderBalances[folder]);
    }

    // -----------------------
    // Emergency Controls
    // -----------------------

    function pauseTreasury()
        external
        onlyRole(TREASURY_ADMIN_ROLE)
    {
        _pause();
    }

    function unpauseTreasury()
        external
        onlyRole(TREASURY_ADMIN_ROLE)
    {
        _unpause();
    }

    // -----------------------
    // Views
    // -----------------------

    function getFolders() external view returns (address[] memory) {
        return folders;
    }

    function treasuryBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getFolderBalance(address folder) external view returns (uint256) {
        return folderBalances[folder];
    }

    function getAllFolderBalances() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory balances = new uint256[](folders.length);
        for (uint256 i = 0; i < folders.length; i++) {
            balances[i] = folderBalances[folders[i]];
        }
        return (folders, balances);
    }
}
