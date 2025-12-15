// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Treasury is AccessControl, Pausable {
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    IERC20 public token;
    address[] public folders;

    event SentToFolder(address folder, uint256 amount);

    constructor(IERC20 _token, address admin) {
        token = _token;
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(TREASURY_ROLE, admin);
    }

    function sendToFolder(address folder, uint256 amount) external onlyRole(TREASURY_ROLE) whenNotPaused {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        token.transfer(folder, amount);
        folders.push(folder);
        emit SentToFolder(folder, amount);
    }

    function pauseTreasury() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpauseTreasury() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function getFolders() external view returns (address[] memory) {
        return folders;
    }
}
