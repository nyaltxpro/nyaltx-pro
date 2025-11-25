// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VestingWalletFlexible.sol";

/**
 * @title VestingFactory
 * @dev Factory contract for creating and managing multiple vesting contracts
 * 
 * Features:
 * - Deploy new vesting contracts
 * - Track all deployed contracts
 * - Batch operations
 * - Category-based organization
 */
contract VestingFactory is Ownable, ReentrancyGuard {
    // State variables
    address public immutable nyaxToken;
    
    mapping(string => address[]) public categoryVestingContracts; // category => contracts
    mapping(address => bool) public isVestingContract;
    mapping(address => string) public contractCategory;
    
    address[] public allVestingContracts;
    string[] public categories;
    mapping(string => bool) public categoryExists;

    // Events
    event VestingContractCreated(
        address indexed vestingContract,
        string indexed category,
        address indexed creator
    );
    event CategoryAdded(string indexed category);

    /**
     * @dev Constructor
     * @param _nyaxToken NYAX token address
     * @param _owner Factory owner address
     */
    constructor(address _nyaxToken, address _owner) Ownable(_owner) {
        require(_nyaxToken != address(0), "VestingFactory: Invalid token address");
        require(_owner != address(0), "VestingFactory: Invalid owner address");
        
        nyaxToken = _nyaxToken;
    }

    /**
     * @dev Create a new vesting contract
     * @param category Category for the vesting contract
     * @return vestingContract Address of the created vesting contract
     */
    function createVestingContract(string memory category) 
        external 
        onlyOwner 
        returns (address vestingContract) 
    {
        require(bytes(category).length > 0, "VestingFactory: Category cannot be empty");

        // Add category if it doesn't exist
        if (!categoryExists[category]) {
            categories.push(category);
            categoryExists[category] = true;
            emit CategoryAdded(category);
        }

        // Deploy new vesting contract
        VestingWalletFlexible newVesting = new VestingWalletFlexible(nyaxToken, owner());
        vestingContract = address(newVesting);

        // Track the contract
        allVestingContracts.push(vestingContract);
        categoryVestingContracts[category].push(vestingContract);
        isVestingContract[vestingContract] = true;
        contractCategory[vestingContract] = category;

        emit VestingContractCreated(vestingContract, category, msg.sender);
        
        return vestingContract;
    }

    /**
     * @dev Get all vesting contracts for a category
     * @param category Category name
     * @return Array of vesting contract addresses
     */
    function getCategoryContracts(string memory category) 
        external 
        view 
        returns (address[] memory) 
    {
        return categoryVestingContracts[category];
    }

    /**
     * @dev Get all vesting contracts
     * @return Array of all vesting contract addresses
     */
    function getAllContracts() external view returns (address[] memory) {
        return allVestingContracts;
    }

    /**
     * @dev Get all categories
     * @return Array of category names
     */
    function getCategories() external view returns (string[] memory) {
        return categories;
    }

    /**
     * @dev Get contract count for a category
     * @param category Category name
     * @return Number of contracts in category
     */
    function getCategoryContractCount(string memory category) 
        external 
        view 
        returns (uint256) 
    {
        return categoryVestingContracts[category].length;
    }

    /**
     * @dev Get total contract count
     * @return Total number of vesting contracts
     */
    function getTotalContractCount() external view returns (uint256) {
        return allVestingContracts.length;
    }

    /**
     * @dev Check if address is a vesting contract created by this factory
     * @param contractAddress Address to check
     * @return Whether address is a vesting contract
     */
    function isFactoryContract(address contractAddress) external view returns (bool) {
        return isVestingContract[contractAddress];
    }

    /**
     * @dev Get category for a contract
     * @param contractAddress Vesting contract address
     * @return Category name
     */
    function getContractCategory(address contractAddress) 
        external 
        view 
        returns (string memory) 
    {
        require(isVestingContract[contractAddress], "VestingFactory: Not a factory contract");
        return contractCategory[contractAddress];
    }
}
