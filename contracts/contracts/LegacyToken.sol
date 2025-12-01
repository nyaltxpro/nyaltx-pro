// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title LegacyToken
 * @notice Simple ERC20 implementation representing the deprecated NYALTX token that
 *         can be burned by the LegacyMigrationVault during migration.
 */
contract LegacyToken is ERC20, ERC20Burnable, Ownable2Step {
    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(owner_) {
        require(owner_ != address(0), "owner zero");
        if (initialSupply > 0) {
            _mint(owner_, initialSupply);
        }
    }

    /**
     * @notice Mint additional legacy tokens. Restricted to owner for legacy migrations/tests.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "to zero");
        _mint(to, amount);
    }
}
