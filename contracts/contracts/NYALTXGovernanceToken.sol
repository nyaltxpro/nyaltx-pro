// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract NYALTXGovernanceToken is
    ERC20,
    ERC20Permit,
    ERC20Votes,
    Ownable2Step,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MIGRATION_ROLE = keccak256("MIGRATION_ROLE");
    bytes32 public constant STAKING_ROLE = keccak256("STAKING_ROLE");

    address public treasury;

    // Track authorized migration contracts
    mapping(address => bool) public migrationContracts;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event MigrationContractUpdated(address indexed migrationContract, bool authorized);

    constructor(address admin, address treasuryAddress)
        ERC20("NYALTX Governance", "gNYAX")
        ERC20Permit("NYALTX Governance")
        Ownable(admin)
    {
        require(admin != address(0), "Invalid admin address");
        require(treasuryAddress != address(0), "Invalid treasury address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(MIGRATION_ROLE, admin);
        _grantRole(STAKING_ROLE, admin);

        treasury = treasuryAddress;
    }

    // Set migration contract authorization
    function setMigrationContract(address migrationContract, bool authorized) 
        external 
        onlyRole(MIGRATION_ROLE) 
    {
        require(migrationContract != address(0), "Invalid migration contract");
        migrationContracts[migrationContract] = authorized;
        emit MigrationContractUpdated(migrationContract, authorized);
    }

    // Mint from authorized migration contracts
    function mintFromMigration(address to, uint256 amount) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(migrationContracts[msg.sender], "Not authorized migration contract");
        require(to != address(0), "Invalid recipient");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // Minting function with max supply check
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // Burn function for token holders
    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
    }

    // Burn from another address (with approval)
    function burnFrom(address from, uint256 amount) external whenNotPaused {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }

    // Migration function for token migration scenarios
    function migrateTo(address to, uint256 amount) 
        external 
        onlyRole(MIGRATION_ROLE) 
        nonReentrant 
    {
        require(to != address(0), "Invalid address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // Update treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    // Pause functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Override _update to add pause functionality
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused
    {
        super._update(from, to, amount);
    }

    // Override nonces for ERC20Permit
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    // Required override for AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}