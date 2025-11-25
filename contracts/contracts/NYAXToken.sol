// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NYAXToken
 * @dev NYAX token with governance capabilities, permit functionality, and controlled minting
 */
contract NYAXToken is ERC20, ERC20Permit, ERC20Votes, Ownable, ReentrancyGuard {

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    address public treasury;
    bool public transfersEnabled = true;
    mapping(address => bool) public blacklisted;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TransfersToggled(bool enabled);
    event AddressBlacklisted(address indexed account, bool blacklisted);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    modifier onlyTreasuryOrOwner() {
        require(msg.sender == treasury || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier whenTransfersEnabled() {
        require(transfersEnabled, "Transfers disabled");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Blacklisted");
        _;
    }

    constructor(address _treasury, address _owner)
        ERC20("NYAX", "NYAX")
        ERC20Permit("NYAX")
        Ownable(_owner)
    {
        require(_treasury != address(0), "Treasury zero address");
        treasury = _treasury;
        emit TreasuryUpdated(address(0), _treasury);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Zero");
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    function mint(address to, uint256 amount) external onlyTreasuryOrOwner nonReentrant {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(address from, uint256 amount) external onlyTreasuryOrOwner nonReentrant {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    function burnSelf(uint256 amount) external nonReentrant {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }

    function setBlacklisted(address account, bool isBlacklisted) external onlyOwner {
        blacklisted[account] = isBlacklisted;
        emit AddressBlacklisted(account, isBlacklisted);
    }

    function batchSetBlacklisted(address[] calldata accounts, bool isBlacklisted)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            blacklisted[accounts[i]] = isBlacklisted;
            emit AddressBlacklisted(accounts[i], isBlacklisted);
        }
    }

    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function nonces(address owner)
    public
    view
    override(ERC20Permit, Nonces)
    returns (uint256)
    {
    return super.nonces(owner);
    }


    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        require(!blacklisted[from] && !blacklisted[to], "Blacklisted");
        require(transfersEnabled || from == address(0) || to == address(0), "Transfers disabled");

        super._update(from, to, amount);
    }

    // Recover ERC20 tokens
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot recover NYAX itself");
        IERC20(token).transfer(owner(), amount);
    }

    // Recover ETH
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
