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
        uint256 totalAllocation;
        uint256 claimed;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        bool paused;
        bool cancelled;
        string walletName;
    }

    // Mapping of wallet -> Beneficiary
    mapping(address => Beneficiary) public beneficiaries;

    // Array of beneficiary addresses
    address[] public beneficiaryList;

    // Mapping of wallet name hash -> wallet address
    mapping(bytes32 => address) public walletByNameHash;

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
        require(beneficiaries[wallet].totalAllocation == 0, "Already exists");

        bytes32 nameHash = keccak256(abi.encodePacked(walletName));
        require(walletByNameHash[nameHash] == address(0), "Wallet name already used");

        beneficiaries[wallet] = Beneficiary(
            totalAllocation,
            0,
            start,
            cliff,
            duration,
            false,
            false,
            walletName
        );

        beneficiaryList.push(wallet);
        walletByNameHash[nameHash] = wallet;

        emit BeneficiaryAdded(wallet, walletName, totalAllocation, start, cliff, duration);
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

    // ------------------------
    // Claiming
    // ------------------------
    function claim() external whenNotPaused {
        Beneficiary storage b = beneficiaries[msg.sender];
        require(!b.paused, "Beneficiary paused");
        require(!b.cancelled, "Beneficiary cancelled");
        require(block.timestamp >= b.start + b.cliff, "Cliff not reached");

        uint256 vested = _vestedAmount(msg.sender);
        uint256 claimable = vested - b.claimed;
        require(claimable > 0, "Nothing to claim");

        b.claimed += claimable;
        token.transfer(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    // ------------------------
    // Vesting Calculation
    // ------------------------
    function _vestedAmount(address wallet) public view returns (uint256) {
        Beneficiary memory b = beneficiaries[wallet];
        if (block.timestamp < b.start + b.cliff) return 0;

        uint256 elapsed = block.timestamp - b.start;
        if (elapsed >= b.duration) return b.totalAllocation;

        return (b.totalAllocation * elapsed) / b.duration;
    }

    // ------------------------
    // Views
    // ------------------------
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaryList;
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
        Beneficiary memory b = beneficiaries[wallet];
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

    function getWalletByName(string calldata walletName) external view returns (address) {
        bytes32 nameHash = keccak256(abi.encodePacked(walletName));
        return walletByNameHash[nameHash];
    }

    function updateWalletName(address wallet, string calldata newName) external onlyRole(FOLDER_ADMIN_ROLE) {
        require(beneficiaries[wallet].totalAllocation > 0, "Wallet not found");
        require(bytes(newName).length > 0, "Name cannot be empty");

        bytes32 newNameHash = keccak256(abi.encodePacked(newName));
        require(walletByNameHash[newNameHash] == address(0), "Name already used");

        string memory oldName = beneficiaries[wallet].walletName;
        bytes32 oldNameHash = keccak256(abi.encodePacked(oldName));
        
        delete walletByNameHash[oldNameHash];
        walletByNameHash[newNameHash] = wallet;
        beneficiaries[wallet].walletName = newName;

        emit WalletNameUpdated(wallet, oldName, newName);
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
