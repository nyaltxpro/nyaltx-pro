// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VestingWalletFlexible
 * @dev Flexible vesting contract for NYAX tokens
 * 
 * Features:
 * - Cliff period support
 * - Linear vesting after cliff
 * - Milestone-based releases
 * - Revocable vesting (optional)
 * - Emergency pause functionality
 * - Multiple beneficiaries support
 */
contract VestingWalletFlexible is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Structs
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        uint256 released;
        bool revoked;
        bool revocable;
        string category; // e.g., "team", "advisors", "marketing"
    }

    struct Milestone {
        uint256 timestamp;
        uint256 percentage; // In basis points (10000 = 100%)
        bool released;
        string description;
    }

    // State variables
    IERC20 public immutable token;
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(bytes32 => VestingSchedule) public vestingSchedules;
    mapping(bytes32 => Milestone[]) public milestones;
    mapping(address => bytes32[]) public beneficiarySchedules;
    
    bytes32[] public allScheduleIds;
    bool public paused = false;
    
    // Events
    event VestingScheduleCreated(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliff,
        uint256 duration,
        string category
    );
    event TokensReleased(bytes32 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event VestingRevoked(bytes32 indexed scheduleId, address indexed beneficiary, uint256 unreleased);
    event MilestoneAdded(bytes32 indexed scheduleId, uint256 timestamp, uint256 percentage, string description);
    event MilestoneReleased(bytes32 indexed scheduleId, uint256 amount, string description);
    event PauseToggled(bool paused);
    event EmergencyWithdrawal(address indexed token, uint256 amount);

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "VestingWallet: Contract is paused");
        _;
    }

    modifier validSchedule(bytes32 scheduleId) {
        require(vestingSchedules[scheduleId].beneficiary != address(0), "VestingWallet: Invalid schedule");
        _;
    }

    /**
     * @dev Constructor
     * @param _token NYAX token address
     * @param _owner Contract owner address
     */
    constructor(address _token, address _owner) Ownable(_owner) {
        require(_token != address(0), "VestingWallet: Invalid token address");
        require(_owner != address(0), "VestingWallet: Invalid owner address");
        
        token = IERC20(_token);
    }

    /**
     * @dev Create a new vesting schedule
     * @param beneficiary Address of the beneficiary
     * @param totalAmount Total amount of tokens to vest
     * @param start Start timestamp
     * @param cliffDuration Cliff duration in seconds
     * @param duration Total vesting duration in seconds
     * @param revocable Whether the vesting is revocable
     * @param category Category of the vesting (e.g., "team", "advisors")
     * @return scheduleId Unique identifier for the vesting schedule
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliffDuration,
        uint256 duration,
        bool revocable,
        string memory category
    ) external onlyOwner returns (bytes32 scheduleId) {
        require(beneficiary != address(0), "VestingWallet: Invalid beneficiary");
        require(totalAmount > 0, "VestingWallet: Amount must be greater than 0");
        require(duration > 0, "VestingWallet: Duration must be greater than 0");
        require(cliffDuration <= duration, "VestingWallet: Cliff cannot exceed duration");
        require(start > 0, "VestingWallet: Start time must be set");

        scheduleId = keccak256(abi.encodePacked(beneficiary, totalAmount, start, block.timestamp));
        
        require(vestingSchedules[scheduleId].beneficiary == address(0), "VestingWallet: Schedule already exists");

        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            start: start,
            cliff: start + cliffDuration,
            duration: duration,
            released: 0,
            revoked: false,
            revocable: revocable,
            category: category
        });

        beneficiarySchedules[beneficiary].push(scheduleId);
        allScheduleIds.push(scheduleId);

        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), totalAmount);

        emit VestingScheduleCreated(
            scheduleId,
            beneficiary,
            totalAmount,
            start,
            start + cliffDuration,
            duration,
            category
        );

        return scheduleId;
    }

    /**
     * @dev Add milestone to a vesting schedule
     * @param scheduleId Vesting schedule ID
     * @param timestamp Milestone timestamp
     * @param percentage Percentage to release at milestone (basis points)
     * @param description Milestone description
     */
    function addMilestone(
        bytes32 scheduleId,
        uint256 timestamp,
        uint256 percentage,
        string memory description
    ) external onlyOwner validSchedule(scheduleId) {
        require(timestamp > block.timestamp, "VestingWallet: Milestone must be in future");
        require(percentage <= BASIS_POINTS, "VestingWallet: Percentage exceeds 100%");
        require(bytes(description).length > 0, "VestingWallet: Description required");

        milestones[scheduleId].push(Milestone({
            timestamp: timestamp,
            percentage: percentage,
            released: false,
            description: description
        }));

        emit MilestoneAdded(scheduleId, timestamp, percentage, description);
    }

    /**
     * @dev Calculate vested amount for a schedule at given time
     * @param scheduleId Vesting schedule ID
     * @param timestamp Time to calculate vesting for
     * @return Vested amount
     */
    function vestedAmount(bytes32 scheduleId, uint256 timestamp) 
        public 
        view 
        validSchedule(scheduleId) 
        returns (uint256) 
    {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];
        
        if (schedule.revoked) {
            return schedule.released;
        }

        if (timestamp < schedule.cliff) {
            return 0;
        }

        // Check milestones first
        uint256 milestoneVested = getMilestoneVested(scheduleId, timestamp);
        if (milestoneVested > 0) {
            return milestoneVested;
        }

        // Linear vesting after cliff
        if (timestamp >= schedule.start + schedule.duration) {
            return schedule.totalAmount;
        }

        uint256 elapsed = timestamp - schedule.start;
        return (schedule.totalAmount * elapsed) / schedule.duration;
    }

    /**
     * @dev Get milestone vested amount
     * @param scheduleId Vesting schedule ID
     * @param timestamp Current timestamp
     * @return Milestone vested amount
     */
    function getMilestoneVested(bytes32 scheduleId, uint256 timestamp) 
        public 
        view 
        returns (uint256) 
    {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];
        Milestone[] memory scheduleMilestones = milestones[scheduleId];
        
        if (scheduleMilestones.length == 0) {
            return 0;
        }

        uint256 totalMilestonePercentage = 0;
        for (uint256 i = 0; i < scheduleMilestones.length; i++) {
            if (timestamp >= scheduleMilestones[i].timestamp) {
                totalMilestonePercentage += scheduleMilestones[i].percentage;
            }
        }

        return (schedule.totalAmount * totalMilestonePercentage) / BASIS_POINTS;
    }

    /**
     * @dev Release vested tokens for a schedule
     * @param scheduleId Vesting schedule ID
     */
    function release(bytes32 scheduleId) 
        external 
        nonReentrant 
        whenNotPaused 
        validSchedule(scheduleId) 
    {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(
            msg.sender == schedule.beneficiary || msg.sender == owner(),
            "VestingWallet: Not authorized"
        );

        uint256 vested = vestedAmount(scheduleId, block.timestamp);
        uint256 unreleased = vested - schedule.released;
        require(unreleased > 0, "VestingWallet: No tokens to release");

        schedule.released += unreleased;
        token.safeTransfer(schedule.beneficiary, unreleased);

        // Mark milestones as released
        _markMilestonesReleased(scheduleId);

        emit TokensReleased(scheduleId, schedule.beneficiary, unreleased);
    }

    /**
     * @dev Revoke a vesting schedule
     * @param scheduleId Vesting schedule ID
     */
    function revoke(bytes32 scheduleId) 
        external 
        onlyOwner 
        validSchedule(scheduleId) 
    {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.revocable, "VestingWallet: Not revocable");
        require(!schedule.revoked, "VestingWallet: Already revoked");

        uint256 vested = vestedAmount(scheduleId, block.timestamp);
        uint256 unreleased = vested - schedule.released;
        uint256 refund = schedule.totalAmount - vested;

        schedule.revoked = true;

        if (unreleased > 0) {
            schedule.released += unreleased;
            token.safeTransfer(schedule.beneficiary, unreleased);
        }

        if (refund > 0) {
            token.safeTransfer(owner(), refund);
        }

        emit VestingRevoked(scheduleId, schedule.beneficiary, refund);
    }

    /**
     * @dev Mark milestones as released
     * @param scheduleId Vesting schedule ID
     */
    function _markMilestonesReleased(bytes32 scheduleId) internal {
        Milestone[] storage scheduleMilestones = milestones[scheduleId];
        
        for (uint256 i = 0; i < scheduleMilestones.length; i++) {
            if (block.timestamp >= scheduleMilestones[i].timestamp && !scheduleMilestones[i].released) {
                scheduleMilestones[i].released = true;
                
                VestingSchedule memory schedule = vestingSchedules[scheduleId];
                uint256 milestoneAmount = (schedule.totalAmount * scheduleMilestones[i].percentage) / BASIS_POINTS;
                
                emit MilestoneReleased(scheduleId, milestoneAmount, scheduleMilestones[i].description);
            }
        }
    }

    /**
     * @dev Get releasable amount for a schedule
     * @param scheduleId Vesting schedule ID
     * @return Releasable amount
     */
    function releasableAmount(bytes32 scheduleId) 
        external 
        view 
        validSchedule(scheduleId) 
        returns (uint256) 
    {
        uint256 vested = vestedAmount(scheduleId, block.timestamp);
        return vested - vestingSchedules[scheduleId].released;
    }

    /**
     * @dev Get beneficiary's schedule IDs
     * @param beneficiary Beneficiary address
     * @return Array of schedule IDs
     */
    function getBeneficiarySchedules(address beneficiary) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return beneficiarySchedules[beneficiary];
    }

    /**
     * @dev Get all schedule IDs
     * @return Array of all schedule IDs
     */
    function getAllSchedules() external view returns (bytes32[] memory) {
        return allScheduleIds;
    }

    /**
     * @dev Get milestones for a schedule
     * @param scheduleId Vesting schedule ID
     * @return Array of milestones
     */
    function getMilestones(bytes32 scheduleId) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        return milestones[scheduleId];
    }

    /**
     * @dev Toggle pause state
     */
    function togglePause() external onlyOwner {
        paused = !paused;
        emit PauseToggled(paused);
    }

    /**
     * @dev Emergency withdrawal function
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= token.balanceOf(address(this)), "VestingWallet: Insufficient balance");
        
        token.safeTransfer(owner(), amount);
        emit EmergencyWithdrawal(address(token), amount);
    }

    /**
     * @dev Get contract token balance
     * @return Token balance
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
