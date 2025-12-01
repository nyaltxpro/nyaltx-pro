

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title TreasuryBridge
 * @notice Bridges treasury actions between timelock (Governor) and multisig controllers.
 */
contract TreasuryBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_CONTROLLER_ROLE = keccak256("TREASURY_CONTROLLER_ROLE");

    address public immutable treasuryMultisig;
    address public immutable timelockController;
    address public immutable governor;

    event TreasuryTransfer(address indexed token, address indexed to, uint256 amount, bytes32 referenceId);

    constructor(address multisig, address timelock, address governorAddress, address admin) {
        require(multisig != address(0) && timelock != address(0) && governorAddress != address(0), "zero");
        treasuryMultisig = multisig;
        timelockController = timelock;
        governor = governorAddress;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TREASURY_CONTROLLER_ROLE, multisig);
        _grantRole(TREASURY_CONTROLLER_ROLE, timelock);
        _grantRole(TREASURY_CONTROLLER_ROLE, governorAddress);
    }

    modifier onlyController() {
        require(
            hasRole(TREASURY_CONTROLLER_ROLE, _msgSender()) ||
            _msgSender() == treasuryMultisig,
            "unauthorized"
        );
        _;
    }

    function transferTreasuryToken(IERC20 token, address to, uint256 amount, bytes32 referenceId)
        external
        nonReentrant
        onlyController
    {
        require(address(token) != address(0), "token zero");
        require(to != address(0), "to zero");
        token.safeTransfer(to, amount);
        emit TreasuryTransfer(address(token), to, amount, referenceId);
    }

    function transferTreasuryETH(address payable to, uint256 amount, bytes32 referenceId)
        external
        nonReentrant
        onlyController
    {
        require(to != address(0), "to zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "send fail");
        emit TreasuryTransfer(address(0), to, amount, referenceId);
    }

    receive() external payable {}
}