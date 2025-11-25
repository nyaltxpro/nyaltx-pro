// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./NYAXToken.sol";
import "./SimpleMultiSig.sol";

/**
 * @title Treasury
 * @dev NYAX Treasury contract for managing token allocations and distributions
 * 
 * Features:
 * - Category-based wallet management
 * - Integration with MultiSig for large transfers
 * - Token minting and burning capabilities
 * - Allocation tracking and limits
 * - Emergency functions
 * - Vesting contract integration
 */
contract Treasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    NYAXToken public nyax;
    SimpleMultiSig public multisig;

    // Category management
    mapping(string => address) public categoryWallet;
    mapping(string => uint256) public categoryAllocation; // Percentage allocation (basis points)
    mapping(string => uint256) public categoryDistributed; // Amount already distributed
    mapping(string => bool) public categoryExists;
    string[] public categories;

    // Constants
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MULTISIG_THRESHOLD = 1000000 * 10**18; // 1M tokens threshold for multisig

    // Events
    event CategorySet(string indexed category, address indexed wallet, uint256 allocation);
    event CategoryRemoved(string indexed category);
    event TransferExecuted(address indexed to, uint256 amount, string reason, string category);
    event MultisigTransferExecuted(address indexed to, uint256 amount, string reason, string category);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(uint256 amount, string reason);
    event MultisigUpdated(address indexed oldMultisig, address indexed newMultisig);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    // Modifiers
    modifier onlyMultisig() {
        require(msg.sender == address(multisig), "Treasury: Only multisig can call this");
        _;
    }

    modifier categoryExistsModifier(string memory category) {
        require(categoryExists[category], "Treasury: Category does not exist");
        _;
    }

    /**
     * @dev Constructor
     * @param _nyax NYAX token address
     * @param _multisig MultiSig wallet address
     * @param _owner Treasury owner address
     */
    constructor(
        address _nyax,
        address _multisig,
        address _owner
    ) Ownable(_owner) {
        require(_nyax != address(0), "Treasury: Invalid NYAX address");
        require(_multisig != address(0), "Treasury: Invalid multisig address");
        require(_owner != address(0), "Treasury: Invalid owner address");

        nyax = NYAXToken(_nyax);
        multisig = SimpleMultiSig(payable(_multisig));
    }

    /**
     * @dev Set category wallet and allocation
     * @param category Category name
     * @param wallet Wallet address for the category
     * @param allocation Allocation percentage in basis points (e.g., 2000 = 20%)
     */
    function setCategoryWallet(
        string calldata category,
        address wallet,
        uint256 allocation
    ) external onlyOwner {
        require(wallet != address(0), "Treasury: Invalid wallet address");
        require(allocation <= BASIS_POINTS, "Treasury: Allocation exceeds 100%");
        require(bytes(category).length > 0, "Treasury: Category cannot be empty");

        // Add to categories array if new
        if (!categoryExists[category]) {
            categories.push(category);
            categoryExists[category] = true;
        }

        categoryWallet[category] = wallet;
        categoryAllocation[category] = allocation;

        emit CategorySet(category, wallet, allocation);
    }

    /**
     * @dev Remove a category
     * @param category Category name to remove
     */
    function removeCategory(string calldata category) external onlyOwner categoryExistsModifier(category) {
        require(categoryDistributed[category] == 0, "Treasury: Cannot remove category with distributions");

        delete categoryWallet[category];
        delete categoryAllocation[category];
        delete categoryDistributed[category];
        categoryExists[category] = false;

        // Remove from categories array
        for (uint256 i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(category))) {
                categories[i] = categories[categories.length - 1];
                categories.pop();
                break;
            }
        }

        emit CategoryRemoved(category);
    }

    /**
     * @dev Direct transfer for small amounts (owner only)
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param reason Reason for transfer
     * @param category Category for tracking
     */
    function transferTo(
        address to,
        uint256 amount,
        string calldata reason,
        string calldata category
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Treasury: Invalid recipient");
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(amount < MULTISIG_THRESHOLD, "Treasury: Amount exceeds multisig threshold");
        require(nyax.balanceOf(address(this)) >= amount, "Treasury: Insufficient treasury balance");

        // Update category tracking if category exists
        if (categoryExists[category]) {
            categoryDistributed[category] += amount;
        }

        IERC20(address(nyax)).safeTransfer(to, amount);
        emit TransferExecuted(to, amount, reason, category);
    }

    /**
     * @dev Multisig transfer for large amounts
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param reason Reason for transfer
     * @param category Category for tracking
     */
    function multisigTransfer(
        address to,
        uint256 amount,
        string calldata reason,
        string calldata category
    ) external onlyMultisig nonReentrant {
        require(to != address(0), "Treasury: Invalid recipient");
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(nyax.balanceOf(address(this)) >= amount, "Treasury: Insufficient treasury balance");

        // Update category tracking if category exists
        if (categoryExists[category]) {
            categoryDistributed[category] += amount;
        }

        IERC20(address(nyax)).safeTransfer(to, amount);
        emit MultisigTransferExecuted(to, amount, reason, category);
    }

    /**
     * @dev Mint tokens to treasury
     * @param amount Amount to mint
     * @param reason Reason for minting
     */
    function mintToTreasury(uint256 amount, string calldata reason) external onlyOwner {
        require(amount > 0, "Treasury: Amount must be greater than 0");
        
        nyax.mint(address(this), amount);
        emit TokensMinted(address(this), amount, reason);
    }

    /**
     * @dev Mint tokens to specific address
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting
     * @param category Category for tracking
     */
    function mintTo(
        address to,
        uint256 amount,
        string calldata reason,
        string calldata category
    ) external onlyOwner {
        require(to != address(0), "Treasury: Invalid recipient");
        require(amount > 0, "Treasury: Amount must be greater than 0");

        // Update category tracking if category exists
        if (categoryExists[category]) {
            categoryDistributed[category] += amount;
        }

        nyax.mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Burn tokens from treasury
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnFromTreasury(uint256 amount, string calldata reason) external onlyOwner {
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(nyax.balanceOf(address(this)) >= amount, "Treasury: Insufficient treasury balance");

        nyax.burn(address(this), amount);
        emit TokensBurned(amount, reason);
    }

    /**
     * @dev Update multisig address
     * @param _multisig New multisig address
     */
    function setMultisig(address _multisig) external onlyOwner {
        require(_multisig != address(0), "Treasury: Invalid multisig address");
        address oldMultisig = address(multisig);
        multisig = SimpleMultiSig(payable(_multisig));
        emit MultisigUpdated(oldMultisig, _multisig);
    }

    /**
     * @dev Get category information
     * @param category Category name
     * @return wallet Category wallet address
     * @return allocation Category allocation in basis points
     * @return distributed Amount already distributed
     * @return remaining Remaining allocation amount
     */
    function getCategoryInfo(string calldata category)
        external
        view
        categoryExistsModifier(category)
        returns (
            address wallet,
            uint256 allocation,
            uint256 distributed,
            uint256 remaining
        )
    {
        wallet = categoryWallet[category];
        allocation = categoryAllocation[category];
        distributed = categoryDistributed[category];
        
        uint256 totalSupply = nyax.totalSupply();
        uint256 maxAllocation = (totalSupply * allocation) / BASIS_POINTS;
        remaining = maxAllocation > distributed ? maxAllocation - distributed : 0;
    }

    /**
     * @dev Get all categories
     * @return Array of category names
     */
    function getCategories() external view returns (string[] memory) {
        return categories;
    }

    /**
     * @dev Get treasury balance
     * @return NYAX token balance of treasury
     */
    function getTreasuryBalance() external view returns (uint256) {
        return nyax.balanceOf(address(this));
    }

    /**
     * @dev Get total allocated percentage
     * @return Total allocation in basis points
     */
    function getTotalAllocation() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < categories.length; i++) {
            total += categoryAllocation[categories[i]];
        }
        return total;
    }

    /**
     * @dev Check if amount requires multisig approval
     * @param amount Amount to check
     * @return Whether multisig approval is required
     */
    function requiresMultisig(uint256 amount) external pure returns (bool) {
        return amount >= MULTISIG_THRESHOLD;
    }

    /**
     * @dev Emergency function to recover accidentally sent ERC20 tokens
     * @param token Token address to recover
     * @param amount Amount to recover
     */
    function emergencyRecoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(nyax), "Treasury: Cannot recover NYAX tokens");
        require(token != address(0), "Treasury: Invalid token address");
        
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdrawal(token, owner(), amount);
    }

    /**
     * @dev Emergency function to recover accidentally sent ETH
     */
    function emergencyRecoverETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Treasury: No ETH to recover");
        
        payable(owner()).transfer(balance);
        emit EmergencyWithdrawal(address(0), owner(), balance);
    }

    /**
     * @dev Receive function to accept ETH (for emergency recovery)
     */
    receive() external payable {}
}
