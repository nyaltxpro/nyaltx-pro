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
 * @title FolderRegistry
 * @notice On-chain representation of off-chain folder/permission/vesting structure for dashboards.
 */
contract FolderRegistry is AccessControl, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeCast for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint32 public constant PERMISSION_VIEW = 1 << 0;
    uint32 public constant PERMISSION_VOTE = 1 << 1;
    uint32 public constant PERMISSION_PROPOSE = 1 << 2;
    uint32 public constant PERMISSION_TRANSFER = 1 << 3;
    uint32 public constant PERMISSION_ADMIN = 1 << 4;
    uint32 public constant PERMISSION_MULTISIG_REQUIRED = 1 << 5;

    struct VestingTemplate {
        uint64 cliff;
        uint64 duration;
        bool revocable;
    }

    struct VestingSchedule {
        uint64 start;
        uint64 cliff;
        uint64 duration;
        bool revocable;
        bool revoked;
        uint64 revokedAt;
    }

    struct Folder {
        string name;
        uint32 defaultPermissions;
        VestingTemplate template;
        uint256 totalAllocated;
        bool locked;
        bool exists;
    }

    struct Allocation {
        uint256 amount;
        uint256 claimed;
        VestingSchedule vesting;
        uint32 permissions;
        bool exists;
    }

    uint256 public folderCount;
    mapping(uint256 => Folder) public folders;
    mapping(uint256 => mapping(address => Allocation)) private _allocations;
    mapping(uint256 => EnumerableSet.AddressSet) private _folderMembers;

    event FolderCreated(uint256 indexed folderId, string name, uint32 permissions);
    event FolderUpdated(uint256 indexed folderId, uint32 permissions, VestingTemplate template);
    event FolderLockStateChanged(uint256 indexed folderId, bool locked);
    event AllocationSet(uint256 indexed folderId, address indexed account, uint256 amount, VestingSchedule vesting, uint32 permissions);
    event AllocationClaimed(uint256 indexed folderId, address indexed account, uint256 amount);
    event AllocationRevoked(uint256 indexed folderId, address indexed account);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    function createFolder(string calldata name, uint32 permissions, VestingTemplate calldata template)
        external
        onlyRole(MANAGER_ROLE)
        returns (uint256 folderId)
    {
        folderId = ++folderCount;
        folders[folderId] = Folder({
            name: name,
            defaultPermissions: permissions,
            template: template,
            totalAllocated: 0,
            locked: false,
            exists: true
        });
        emit FolderCreated(folderId, name, permissions);
    }

    function updateFolder(uint256 folderId, uint32 permissions, VestingTemplate calldata template)
        external
        onlyRole(MANAGER_ROLE)
    {
        Folder storage folder = folders[folderId];
        require(folder.exists, "missing");
        folder.defaultPermissions = permissions;
        folder.template = template;
        emit FolderUpdated(folderId, permissions, template);
    }

    function setFolderLocked(uint256 folderId, bool locked) external onlyRole(MANAGER_ROLE) {
        Folder storage folder = folders[folderId];
        require(folder.exists, "missing");
        folder.locked = locked;
        emit FolderLockStateChanged(folderId, locked);
    }

    function setAllocation(
        uint256 folderId,
        address account,
        uint256 amount,
        VestingSchedule calldata schedule,
        uint32 permissions
    ) external onlyRole(MANAGER_ROLE) {
        Folder storage folder = folders[folderId];
        require(folder.exists, "missing");
        require(!folder.locked, "locked");
        require(account != address(0), "account zero");
        Allocation storage allocation = _allocations[folderId][account];
        if (!allocation.exists) {
            allocation.exists = true;
            _folderMembers[folderId].add(account);
        }

        folder.totalAllocated = folder.totalAllocated + amount - allocation.amount;
        allocation.amount = amount;
        allocation.permissions = permissions == 0 ? folder.defaultPermissions : permissions;
        allocation.vesting = schedule;
        emit AllocationSet(folderId, account, amount, schedule, allocation.permissions);
    }

    function claim(uint256 folderId, address account, uint256 amount) external onlyRole(MANAGER_ROLE) {
        Folder storage folder = folders[folderId];
        require(!folder.locked, "locked");
        Allocation storage allocation = _allocations[folderId][account];
        require(allocation.exists, "missing");
        uint256 unlocked = unlockedTokens(folderId, account, uint64(block.timestamp));
        require(unlocked >= allocation.claimed + amount, "insufficient");
        allocation.claimed += amount;
        emit AllocationClaimed(folderId, account, amount);
    }

    function revoke(uint256 folderId, address account) external onlyRole(MANAGER_ROLE) {
        Allocation storage allocation = _allocations[folderId][account];
        require(allocation.exists, "missing");
        require(allocation.vesting.revocable && !allocation.vesting.revoked, "not revocable");
        allocation.vesting.revoked = true;
        allocation.vesting.revokedAt = uint64(block.timestamp);
        emit AllocationRevoked(folderId, account);
    }

    function unlockedTokens(uint256 folderId, address account, uint64 timestamp) public view returns (uint256) {
        Allocation storage allocation = _allocations[folderId][account];
        if (!allocation.exists) return 0;
        VestingSchedule memory vesting = allocation.vesting;
        if (vesting.duration == 0) return allocation.amount;
        if (timestamp < vesting.start + vesting.cliff) return 0;

        uint64 effective = vesting.revoked && vesting.revokedAt < timestamp ? vesting.revokedAt : timestamp;
        if (effective >= vesting.start + vesting.duration) return allocation.amount;
        return Math.mulDiv(allocation.amount, effective - vesting.start, vesting.duration);
    }

    function permissionsOf(uint256 folderId, address account) public view returns (uint32) {
        Allocation storage allocation = _allocations[folderId][account];
        if (!allocation.exists) return folders[folderId].defaultPermissions;
        return allocation.permissions;
    }

    function folderMembers(uint256 folderId) external view returns (address[] memory) {
        return _folderMembers[folderId].values();
    }
}