// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FolderEscrow is AccessControl, Pausable {
    bytes32 public constant FOLDER_ADMIN_ROLE = keccak256("FOLDER_ADMIN_ROLE");

    IERC20 public token;

    struct Beneficiary {
        uint256 totalAllocation;
        uint256 claimed;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        bool paused;
        bool cancelled;
    }

    mapping(address => Beneficiary) public beneficiaries;

    event BeneficiaryAdded(address wallet, uint256 amount, uint256 start, uint256 cliff, uint256 duration);
    event Claimed(address wallet, uint256 amount);
    event BeneficiaryPaused(address wallet);
    event BeneficiaryResumed(address wallet);
    event BeneficiaryCancelled(address wallet);

    constructor(IERC20 _token, address admin) {
        token = _token;
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(FOLDER_ADMIN_ROLE, admin);
    }

    function addBeneficiary(
        address wallet,
        uint256 totalAllocation,
        uint256 start,
        uint256 cliff,
        uint256 duration
    ) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaries[wallet].totalAllocation == 0, "Already exists");
        beneficiaries[wallet] = Beneficiary(totalAllocation, 0, start, cliff, duration, false, false);
        emit BeneficiaryAdded(wallet, totalAllocation, start, cliff, duration);
    }

    function claim() external whenNotPaused {
        Beneficiary storage b = beneficiaries[msg.sender];
        require(!b.paused, "Paused");
        require(!b.cancelled, "Cancelled");
        require(block.timestamp >= b.start + b.cliff, "Cliff not reached");

        uint256 vested = _vestedAmount(msg.sender);
        uint256 claimable = vested - b.claimed;
        require(claimable > 0, "Nothing to claim");

        b.claimed += claimable;
        token.transfer(msg.sender, claimable);
        emit Claimed(msg.sender, claimable);
    }

    function _vestedAmount(address wallet) public view returns (uint256) {
        Beneficiary memory b = beneficiaries[wallet];
        if (block.timestamp < b.start + b.cliff) return 0;
        uint256 elapsed = block.timestamp - b.start;
        if (elapsed >= b.duration) return b.totalAllocation;
        return (b.totalAllocation * elapsed) / b.duration;
    }

    function pauseBeneficiary(address wallet) external onlyRole(FOLDER_ADMIN_ROLE) {
        beneficiaries[wallet].paused = true;
        emit BeneficiaryPaused(wallet);
    }

    function resumeBeneficiary(address wallet) external onlyRole(FOLDER_ADMIN_ROLE) {
        beneficiaries[wallet].paused = false;
        emit BeneficiaryResumed(wallet);
    }

    function cancelBeneficiary(address wallet) external onlyRole(FOLDER_ADMIN_ROLE) {
        beneficiaries[wallet].cancelled = true;
        emit BeneficiaryCancelled(wallet);
    }

    function pauseFolder() external onlyRole(FOLDER_ADMIN_ROLE) {
        _pause();
    }

    function unpauseFolder() external onlyRole(FOLDER_ADMIN_ROLE) {
        _unpause();
    }
}
