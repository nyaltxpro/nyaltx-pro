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
 * @title NYALTXStaking
 * @notice Lock-based staking contract producing vote-weighted staking receipts (non-transferable).
 */
contract NYALTXStaking is ERC20, ERC20Permit, ERC20Votes, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    error NonTransferable();
    error InvalidLock();
    error StakeLocked();

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    struct StakePosition {
        uint128 amount;
        uint128 votingPower;
        uint64 unlockTime;
        bool withdrawn;
    }

    IERC20 public immutable governanceToken;
    uint64 public constant MIN_LOCK = 7 days;
    uint64 public constant MAX_LOCK = 1095 days; // 3 years
    uint256 public constant BASE_MULTIPLIER_BPS = 10_000; // 1x
    uint256 public constant WEEKLY_BONUS_BPS = 50; // +0.5% per week
    uint256 public constant MAX_MULTIPLIER_BPS = 25_000; // 2.5x cap

    mapping(address => StakePosition[]) private _stakes;
    uint256 public totalStaked;
    bool public emergencyUnlock;

    event Staked(address indexed account, uint256 stakeId, uint256 amount, uint256 votingPower, uint64 unlockTime);
    event Unstaked(address indexed account, uint256 stakeId, uint256 amount, uint256 votingPower);
    event EmergencyUnlockSet(bool enabled);

    constructor(IERC20 token, address admin)
        ERC20("Staked NYALTX", "sNYAX")
        ERC20Permit("Staked NYALTX")
    {
        require(address(token) != address(0), "token zero");
        governanceToken = token;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    

    function stake(uint256 amount, uint64 lockDuration, address delegatee)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 stakeId, uint256 votingPower)
    {
        require(amount > 0, "amount zero");
        if (lockDuration < MIN_LOCK || lockDuration > MAX_LOCK) revert InvalidLock();

        uint256 multiplier = _multiplier(lockDuration);
        votingPower = Math.mulDiv(amount, multiplier, 10_000);

        governanceToken.safeTransferFrom(_msgSender(), address(this), amount);
        _mint(_msgSender(), votingPower);

        StakePosition memory position = StakePosition({
            amount: amount.toUint128(),
            votingPower: votingPower.toUint128(),
            unlockTime: (block.timestamp + lockDuration).toUint64(),
            withdrawn: false
        });

        _stakes[_msgSender()].push(position);
        stakeId = _stakes[_msgSender()].length - 1;
        totalStaked += amount;

        if (delegatee != address(0)) {
            _delegate(_msgSender(), delegatee);
        }

        emit Staked(_msgSender(), stakeId, amount, votingPower, position.unlockTime);
    }

    function extendLock(uint256 stakeId, uint64 additionalDuration) external whenNotPaused {
        StakePosition storage position = _stakeOf(_msgSender(), stakeId);
        require(!position.withdrawn, "withdrawn");
        uint64 newUnlock = position.unlockTime + additionalDuration;
        require(newUnlock - uint64(block.timestamp) <= MAX_LOCK, "too long");
        position.unlockTime = newUnlock;
    }

    function unstake(uint256 stakeId, address recipient) external nonReentrant {
        StakePosition storage position = _stakeOf(_msgSender(), stakeId);
        require(!position.withdrawn, "withdrawn");
        if (!emergencyUnlock && block.timestamp < position.unlockTime) revert StakeLocked();

        position.withdrawn = true;
        totalStaked -= position.amount;
        _burn(_msgSender(), position.votingPower);
        governanceToken.safeTransfer(recipient == address(0) ? _msgSender() : recipient, position.amount);
        emit Unstaked(_msgSender(), stakeId, position.amount, position.votingPower);
    }

    function toggleEmergencyUnlock(bool enabled) external onlyRole(MANAGER_ROLE) {
        emergencyUnlock = enabled;
        emit EmergencyUnlockSet(enabled);
    }

    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    function stakeCount(address account) external view returns (uint256) {
        return _stakes[account].length;
    }

    function stakeInfo(address account, uint256 stakeId) external view returns (StakePosition memory) {
        return _stakes[account][stakeId];
    }

    function _stakeOf(address account, uint256 stakeId) internal view returns (StakePosition storage) {
        require(stakeId < _stakes[account].length, "bad id");
        return _stakes[account][stakeId];
    }

    function _multiplier(uint64 lockDuration) internal pure returns (uint256) {
        uint256 weeksLocked = lockDuration / 1 weeks;
        uint256 bonus = weeksLocked * WEEKLY_BONUS_BPS;
        uint256 multiplier = BASE_MULTIPLIER_BPS + bonus;
        if (multiplier > MAX_MULTIPLIER_BPS) multiplier = MAX_MULTIPLIER_BPS;
        return multiplier;
    }

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        if (from != address(0) && to != address(0)) revert NonTransferable();
        super._update(from, to, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}