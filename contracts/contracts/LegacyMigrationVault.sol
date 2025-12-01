// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./NYALTXGovernanceToken.sol";

interface ILegacyBurnable is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/**
 * @title LegacyMigrationVault
 * @notice Converts deprecated NYALTX tokens into the governance token at a configurable ratio.
 */
contract LegacyMigrationVault is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event LegacyDeposited(address indexed account, uint256 legacyAmount, uint256 governanceMinted);
    event ConversionRatioUpdated(uint256 ratio);
    event DepositsToggled(bool enabled);

    IERC20 public immutable legacyToken;
    NYALTXGovernanceToken public immutable governanceToken;
    uint256 public conversionRatio; // 1e18 == 1:1
    bool public depositsEnabled = true;

    constructor(
        IERC20 legacy, 
        NYALTXGovernanceToken gov, 
        uint256 ratio, 
        address admin
    ) Ownable(admin) {
        require(address(legacy) != address(0) && address(gov) != address(0), "zero address");
        require(ratio > 0, "ratio zero");
        
        legacyToken = legacy;
        governanceToken = gov;
        conversionRatio = ratio;
    }

    function setConversionRatio(uint256 ratio) external onlyOwner {
        require(ratio > 0, "ratio zero");
        conversionRatio = ratio;
        emit ConversionRatioUpdated(ratio);
    }

    function setDepositsEnabled(bool enabled) external onlyOwner {
        depositsEnabled = enabled;
        emit DepositsToggled(enabled);
    }

    function authorizeMigrationContract(bool authorized) external onlyOwner {
        governanceToken.setMigrationContract(address(this), authorized);
    }

    function depositLegacy(uint256 amount, address beneficiary) external nonReentrant returns (uint256 minted) {
        require(depositsEnabled, "disabled");
        require(amount > 0, "amount zero");

        address recipient = beneficiary == address(0) ? _msgSender() : beneficiary;
        legacyToken.safeTransferFrom(_msgSender(), address(this), amount);
        _tryBurn(amount);

        minted = Math.mulDiv(amount, conversionRatio, 1e18);
        governanceToken.mintFromMigration(recipient, minted);
        emit LegacyDeposited(recipient, amount, minted);
    }

    function _tryBurn(uint256 amount) internal {
        try ILegacyBurnable(address(legacyToken)).burn(amount) {
            return;
        } catch {}

        try ILegacyBurnable(address(legacyToken)).burnFrom(address(this), amount) {
            return;
        } catch {}
    }
}