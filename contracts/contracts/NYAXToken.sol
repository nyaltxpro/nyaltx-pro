// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title NYAXToken
 * @dev NYAX token with governance capabilities, permit functionality, and controlled minting
 * 
 * Features:
 * - ERC20 standard compliance
 * - ERC20Permit for gasless approvals
 * - ERC20Votes for governance voting power
 * - Controlled minting by Treasury or Owner
 * - Burn functionality
 * - Transfer restrictions (optional)
 * - Maximum supply cap
 */
contract NYAXToken is ERC20, ERC20Permit, ERC20Votes, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 0; // Mint on demand to Treasury

    // State variables
    address public treasury; // Treasury address allowed to mint
    bool public transfersEnabled = true; // Can disable transfers if needed
    mapping(address => bool) public blacklisted; // Blacklist functionality
    
    // Events
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TransfersToggled(bool enabled);
    event AddressBlacklisted(address indexed account, bool blacklisted);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    // Modifiers
    modifier onlyTreasuryOrOwner() {
        require(
            msg.sender == treasury || msg.sender == owner(),
            "NYAXToken: Not authorized to mint/burn"
        );
        _;
    }

    modifier whenTransfersEnabled() {
        require(transfersEnabled, "NYAXToken: Transfers are disabled");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "NYAXToken: Account is blacklisted");
        _;
    }

    /**
     * @dev Constructor
     * @param _treasury Initial treasury address
     * @param _owner Initial owner address
     */
    constructor(
        address _treasury,
        address _owner
    ) ERC20("NYAX", "NYAX") ERC20Permit("NYAX") {
        require(_treasury != address(0), "NYAXToken: Treasury cannot be zero address");
        require(_owner != address(0), "NYAXToken: Owner cannot be zero address");
        
        treasury = _treasury;
        _transferOwnership(_owner);
        
        emit TreasuryUpdated(address(0), _treasury);
    }

    /**
     * @dev Set new treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "NYAXToken: Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Mint tokens to specified address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyTreasuryOrOwner nonReentrant {
        require(to != address(0), "NYAXToken: Cannot mint to zero address");
        require(amount > 0, "NYAXToken: Amount must be greater than 0");
        require(
            totalSupply().add(amount) <= MAX_SUPPLY,
            "NYAXToken: Minting would exceed max supply"
        );

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from specified address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyTreasuryOrOwner nonReentrant {
        require(from != address(0), "NYAXToken: Cannot burn from zero address");
        require(amount > 0, "NYAXToken: Amount must be greater than 0");
        require(balanceOf(from) >= amount, "NYAXToken: Insufficient balance to burn");

        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burnSelf(uint256 amount) external nonReentrant {
        require(amount > 0, "NYAXToken: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "NYAXToken: Insufficient balance to burn");

        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Toggle transfers on/off
     * @param enabled Whether transfers should be enabled
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }

    /**
     * @dev Add or remove address from blacklist
     * @param account Address to blacklist/unblacklist
     * @param _blacklisted Whether to blacklist the address
     */
    function setBlacklisted(address account, bool _blacklisted) external onlyOwner {
        require(account != address(0), "NYAXToken: Cannot blacklist zero address");
        blacklisted[account] = _blacklisted;
        emit AddressBlacklisted(account, _blacklisted);
    }

    /**
     * @dev Batch blacklist multiple addresses
     * @param accounts Array of addresses to blacklist
     * @param _blacklisted Whether to blacklist the addresses
     */
    function batchSetBlacklisted(address[] calldata accounts, bool _blacklisted) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "NYAXToken: Cannot blacklist zero address");
            blacklisted[accounts[i]] = _blacklisted;
            emit AddressBlacklisted(accounts[i], _blacklisted);
        }
    }

    /**
     * @dev Get remaining mintable supply
     * @return Remaining tokens that can be minted
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY.sub(totalSupply());
    }

    // Override required functions

    /**
     * @dev Override transfer to add blacklist and transfer enabled checks
     */
    function transfer(address to, uint256 amount)
        public
        override
        whenTransfersEnabled
        notBlacklisted(msg.sender)
        notBlacklisted(to)
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to add blacklist and transfer enabled checks
     */
    function transferFrom(address from, address to, uint256 amount)
        public
        override
        whenTransfersEnabled
        notBlacklisted(from)
        notBlacklisted(to)
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Override _afterTokenTransfer for ERC20Votes compatibility
     */
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Override _mint for ERC20Votes compatibility
     */
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    /**
     * @dev Override _burn for ERC20Votes compatibility
     */
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }

    /**
     * @dev Emergency function to recover accidentally sent ERC20 tokens
     * @param token Address of the token to recover
     * @param amount Amount of tokens to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "NYAXToken: Cannot recover NYAX tokens");
        IERC20(token).transfer(owner(), amount);
    }

    /**
     * @dev Emergency function to recover accidentally sent ETH
     */
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
