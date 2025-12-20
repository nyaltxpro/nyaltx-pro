// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract FolderEscrow is AccessControl, Pausable {
    bytes32 public constant FOLDER_ADMIN_ROLE = keccak256("FOLDER_ADMIN_ROLE");

    IERC20 public immutable token;
    string public folderName;
    address public immutable registry;

    struct Beneficiary {
        uint256 id;
        address wallet;
        uint256 totalAllocation;
        uint256 claimed;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        bool paused;
        bool cancelled;
        string walletName;
    }

    // Array of all beneficiaries (supports multiple entries per wallet)
    Beneficiary[] public beneficiaries;

    // Mapping of wallet -> array of beneficiary IDs
    mapping(address => uint256[]) public walletToBeneficiaryIds;

    // Mapping of wallet name hash -> beneficiary ID
    mapping(bytes32 => uint256) public walletByNameHash;

    // Counter for beneficiary IDs
    uint256 public nextBeneficiaryId;

    // Mapping to track folder balance (total tokens received from treasury)
    uint256 public folderBalance;

    // ------------------------
    // Events
    // ------------------------
    event BeneficiaryAdded(address wallet, string walletName, uint256 amount, uint256 start, uint256 cliff, uint256 duration);
    event Claimed(address wallet, uint256 amount);
    event BeneficiaryPaused(address wallet);
    event BeneficiaryResumed(address wallet);
    event BeneficiaryCancelled(address wallet);
    event FolderFunded(uint256 amount, uint256 newBalance);
    event WalletNameUpdated(address wallet, string oldName, string newName);

    // ------------------------
    // Constructor
    // ------------------------
    constructor(
        IERC20 _token,
        address admin,
        string memory _folderName,
        address _registry
    ) {
        token = _token;
        folderName = _folderName;
        registry = _registry;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FOLDER_ADMIN_ROLE, admin);
    }

    // ------------------------
    // Beneficiary Management
    // ------------------------
    function addBeneficiary(
        address wallet,
        uint256 totalAllocation,
        uint256 start,
        uint256 cliff,
        uint256 duration,
        string calldata walletName
    ) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(wallet != address(0), "Invalid wallet");
        require(totalAllocation > 0, "Allocation cannot be zero");
        require(bytes(walletName).length > 0, "Wallet name required");

        bytes32 nameHash = keccak256(abi.encodePacked(walletName));
        require(walletByNameHash[nameHash] == 0, "Wallet name already used");

        // Check that total allocations don't exceed folder balance
        uint256 currentTotalAllocated = _getTotalAllocated();
        uint256 folderTokenBalance = token.balanceOf(address(this));
        require(currentTotalAllocated + totalAllocation <= folderTokenBalance, "Insufficient folder balance");

        uint256 beneficiaryId = nextBeneficiaryId++;

        beneficiaries.push(Beneficiary(
            beneficiaryId,
            wallet,
            totalAllocation,
            0,
            start,
            cliff,
            duration,
            false,
            false,
            walletName
        ));

        walletToBeneficiaryIds[wallet].push(beneficiaryId);
        walletByNameHash[nameHash] = beneficiaryId;

        emit BeneficiaryAdded(wallet, walletName, totalAllocation, start, cliff, duration);
    }

    function pauseBeneficiary(uint256 beneficiaryId) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        beneficiaries[beneficiaryId].paused = true;
        emit BeneficiaryPaused(beneficiaries[beneficiaryId].wallet);
    }

    function resumeBeneficiary(uint256 beneficiaryId) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        beneficiaries[beneficiaryId].paused = false;
        emit BeneficiaryResumed(beneficiaries[beneficiaryId].wallet);
    }

    function cancelBeneficiary(uint256 beneficiaryId) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        beneficiaries[beneficiaryId].cancelled = true;
        emit BeneficiaryCancelled(beneficiaries[beneficiaryId].wallet);
    }

    // ------------------------
    // Claiming
    // ------------------------
    function claim() external whenNotPaused {
        uint256[] memory beneficiaryIds = walletToBeneficiaryIds[msg.sender];
        require(beneficiaryIds.length > 0, "No beneficiary entries");

        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < beneficiaryIds.length; i++) {
            uint256 beneficiaryId = beneficiaryIds[i];
            Beneficiary storage b = beneficiaries[beneficiaryId];

            if (b.paused || b.cancelled) continue;
            if (block.timestamp < b.start + b.cliff) continue;

            uint256 vested = _vestedAmount(beneficiaryId);
            uint256 claimable = vested - b.claimed;

            if (claimable > 0) {
                b.claimed += claimable;
                totalClaimable += claimable;
            }
        }

        require(totalClaimable > 0, "Nothing to claim");
        token.transfer(msg.sender, totalClaimable);

        emit Claimed(msg.sender, totalClaimable);
    }

    // ------------------------
    // Vesting Calculation
    // ------------------------
    function _vestedAmount(uint256 beneficiaryId) public view returns (uint256) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        Beneficiary memory b = beneficiaries[beneficiaryId];
        if (block.timestamp < b.start + b.cliff) return 0;

        uint256 elapsed = block.timestamp - b.start;
        if (elapsed >= b.duration) return b.totalAllocation;

        return (b.totalAllocation * elapsed) / b.duration;
    }

    // ------------------------
    // Internal Helper Functions
    // ------------------------
    function _getTotalAllocated() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            total += beneficiaries[i].totalAllocation;
        }
        return total;
    }

    // ------------------------
    // Views
    // ------------------------
    function getTotalAllocated() external view returns (uint256) {
        return _getTotalAllocated();
    }

    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }

    function getBeneficiaryById(uint256 beneficiaryId) external view returns (
        uint256 id,
        address wallet,
        uint256 totalAllocation,
        uint256 claimed,
        uint256 start,
        uint256 cliff,
        uint256 duration,
        bool paused,
        bool cancelled,
        string memory walletName
    ) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        Beneficiary memory b = beneficiaries[beneficiaryId];
        return (
            b.id,
            b.wallet,
            b.totalAllocation,
            b.claimed,
            b.start,
            b.cliff,
            b.duration,
            b.paused,
            b.cancelled,
            b.walletName
        );
    }

    function getBeneficiaryIdsByWallet(address wallet) external view returns (uint256[] memory) {
        return walletToBeneficiaryIds[wallet];
    }

    function getBeneficiaryInfo(address wallet) external view returns (
        uint256 totalAllocation,
        uint256 claimed,
        uint256 start,
        uint256 cliff,
        uint256 duration,
        bool paused,
        bool cancelled,
        string memory walletName
    ) {
        uint256[] memory beneficiaryIds = walletToBeneficiaryIds[wallet];
        require(beneficiaryIds.length > 0, "No beneficiary entries");
        
        // Return info for the first beneficiary entry (for backward compatibility)
        Beneficiary memory b = beneficiaries[beneficiaryIds[0]];
        return (
            b.totalAllocation,
            b.claimed,
            b.start,
            b.cliff,
            b.duration,
            b.paused,
            b.cancelled,
            b.walletName
        );
    }

    function getWalletByName(string calldata walletName) external view returns (uint256) {
        bytes32 nameHash = keccak256(abi.encodePacked(walletName));
        return walletByNameHash[nameHash];
    }

    function updateWalletName(uint256 beneficiaryId, string calldata newName) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaryId < beneficiaries.length, "Invalid beneficiary ID");
        require(bytes(newName).length > 0, "Name cannot be empty");

        bytes32 newNameHash = keccak256(abi.encodePacked(newName));
        require(walletByNameHash[newNameHash] == 0, "Name already used");

        string memory oldName = beneficiaries[beneficiaryId].walletName;
        bytes32 oldNameHash = keccak256(abi.encodePacked(oldName));
        
        delete walletByNameHash[oldNameHash];
        walletByNameHash[newNameHash] = beneficiaryId;
        beneficiaries[beneficiaryId].walletName = newName;

        emit WalletNameUpdated(beneficiaries[beneficiaryId].wallet, oldName, newName);
    }

    function getFolderBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function trackFunding(uint256 amount) external {
        require(msg.sender == address(token) || hasRole(FOLDER_ADMIN_ROLE, msg.sender), "Unauthorized");
        folderBalance += amount;
        emit FolderFunded(amount, folderBalance);
    }

    // ------------------------
    // Pause Folder
    // ------------------------
    function pauseFolder() external onlyRole(FOLDER_ADMIN_ROLE) {
        _pause();
    }

    function unpauseFolder() external onlyRole(FOLDER_ADMIN_ROLE) {
        _unpause();
    }
}
