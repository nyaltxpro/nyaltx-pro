// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface INYAXToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

/**
 * @title Treasury
 * @notice Manages token minting, transfers, and category allocations for the NYALTX ecosystem.
 */
contract Treasury is Ownable2Step {
    using SafeERC20 for IERC20;

    struct Category {
        address wallet;
        uint256 allocation; // basis points
        uint256 distributed; // amount in wei
        bool exists;
    }

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant MULTISIG_THRESHOLD = 1_000_000 ether;

    address public immutable nyax;
    address public multisig;

    string[] private _categoryList;
    mapping(bytes32 => Category) private _categories;
    mapping(bytes32 => uint256) private _categoryIndex; // index + 1

    uint256 public totalAllocation;

    event CategorySet(string indexed category, address indexed wallet, uint256 allocation);
    event CategoryRemoved(string indexed category);
    event TransferExecuted(address indexed to, uint256 amount, string reason, string category);
    event MultisigTransferExecuted(address indexed to, uint256 amount, string reason, string category);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(uint256 amount, string reason);
    event MultisigUpdated(address indexed previousMultisig, address indexed newMultisig);

    modifier onlyMultisig() {
        require(msg.sender == multisig, "Treasury: caller not multisig");
        _;
    }

    constructor(address nyaxToken, address multisigWallet, address initialOwner) Ownable(initialOwner) {
        require(nyaxToken != address(0), "Treasury: nyax zero");
        require(multisigWallet != address(0), "Treasury: multisig zero");
        require(initialOwner != address(0), "Treasury: owner zero");

        nyax = nyaxToken;
        multisig = multisigWallet;
    }

    // --------------------------------------------------
    // Category management
    // --------------------------------------------------

    function setCategoryWallet(string calldata category, address wallet, uint256 allocation) external onlyOwner {
        require(bytes(category).length > 0, "Treasury: category empty");
        require(wallet != address(0), "Treasury: wallet zero");
        require(allocation <= BASIS_POINTS, "Treasury: allocation > 100%");

        bytes32 key = _categoryKey(category);
        Category storage cat = _categories[key];

        if (!cat.exists) {
            require(totalAllocation + allocation <= BASIS_POINTS, "Treasury: total allocation > 100%");
            cat.exists = true;
            _categoryIndex[key] = _categoryList.length + 1;
            _categoryList.push(category);
            totalAllocation += allocation;
        } else {
            totalAllocation = totalAllocation - cat.allocation;
            require(totalAllocation + allocation <= BASIS_POINTS, "Treasury: total allocation > 100%");
            totalAllocation += allocation;
        }

        cat.wallet = wallet;
        cat.allocation = allocation;

        emit CategorySet(category, wallet, allocation);
    }

    function removeCategory(string calldata category) external onlyOwner {
        bytes32 key = _categoryKey(category);
        Category storage cat = _categories[key];
        require(cat.exists, "Treasury: category missing");

        totalAllocation -= cat.allocation;
        delete _categories[key];

        uint256 index = _categoryIndex[key];
        if (index > 0) {
            uint256 idx = index - 1;
            uint256 lastIdx = _categoryList.length - 1;
            if (idx != lastIdx) {
                string memory lastCategory = _categoryList[lastIdx];
                _categoryList[idx] = lastCategory;
                _categoryIndex[_categoryKey(lastCategory)] = index;
            }
            _categoryList.pop();
            delete _categoryIndex[key];
        }

        emit CategoryRemoved(category);
    }

    function categoryWallet(string calldata category) external view returns (address) {
        return _categories[_categoryKey(category)].wallet;
    }

    function categoryAllocation(string calldata category) external view returns (uint256) {
        return _categories[_categoryKey(category)].allocation;
    }

    function categoryDistributed(string calldata category) external view returns (uint256) {
        return _categories[_categoryKey(category)].distributed;
    }

    function categoryExists(string calldata category) external view returns (bool) {
        return _categories[_categoryKey(category)].exists;
    }

    function getCategories() external view returns (string[] memory) {
        string[] memory list = new string[](_categoryList.length);
        for (uint256 i = 0; i < _categoryList.length; i++) {
            list[i] = _categoryList[i];
        }
        return list;
    }

    function getCategoryInfo(string calldata category)
        external
        view
        returns (address wallet, uint256 allocation, uint256 distributed, uint256 remaining)
    {
        Category storage cat = _categories[_categoryKey(category)];
        require(cat.exists, "Treasury: category missing");

        wallet = cat.wallet;
        allocation = cat.allocation;
        distributed = cat.distributed;

        uint256 allowance = (getTreasuryBalance() * allocation) / BASIS_POINTS;
        if (allowance > distributed) {
            remaining = allowance - distributed;
        } else {
            remaining = 0;
        }
    }

    function getTotalAllocation() external view returns (uint256) {
        return totalAllocation;
    }

    // --------------------------------------------------
    // Token operations
    // --------------------------------------------------

    function mintToTreasury(uint256 amount, string calldata reason) external onlyOwner {
        require(amount > 0, "Treasury: amount zero");
        INYAXToken(nyax).mint(address(this), amount);
        emit TokensMinted(address(this), amount, reason);
    }

    function mintTo(address to, uint256 amount, string calldata reason, string calldata category) external onlyOwner {
        require(to != address(0), "Treasury: to zero");
        require(amount > 0, "Treasury: amount zero");

        INYAXToken(nyax).mint(to, amount);
        _incrementDistributed(category, amount);

        emit TokensMinted(to, amount, reason);
    }

    function burnFromTreasury(uint256 amount, string calldata reason) external onlyOwner {
        require(amount > 0, "Treasury: amount zero");
        require(amount <= IERC20(nyax).balanceOf(address(this)), "Treasury: insufficient balance");

        INYAXToken(nyax).burn(amount);
        emit TokensBurned(amount, reason);
    }

    function transferTo(address to, uint256 amount, string calldata reason, string calldata category) external onlyOwner {
        require(to != address(0), "Treasury: to zero");
        require(amount > 0, "Treasury: amount zero");
        require(!requiresMultisig(amount), "Treasury: amount exceeds multisig threshold");

        IERC20(nyax).safeTransfer(to, amount);
        _incrementDistributed(category, amount);

        emit TransferExecuted(to, amount, reason, category);
    }

    function multisigTransfer(address to, uint256 amount, string calldata reason, string calldata category)
        external
        onlyMultisig
    {
        require(to != address(0), "Treasury: to zero");
        require(amount > 0, "Treasury: amount zero");

        IERC20(nyax).safeTransfer(to, amount);
        _incrementDistributed(category, amount);

        emit MultisigTransferExecuted(to, amount, reason, category);
    }

    // --------------------------------------------------
    // View helpers
    // --------------------------------------------------

    function getTreasuryBalance() public view returns (uint256) {
        return IERC20(nyax).balanceOf(address(this));
    }

    function requiresMultisig(uint256 amount) public pure returns (bool) {
        return amount >= MULTISIG_THRESHOLD;
    }

    // --------------------------------------------------
    // Admin utilities
    // --------------------------------------------------

    function setMultisig(address newMultisig) external onlyOwner {
        require(newMultisig != address(0), "Treasury: multisig zero");
        address previous = multisig;
        multisig = newMultisig;
        emit MultisigUpdated(previous, newMultisig);
    }

    function emergencyRecoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != nyax, "Treasury: Cannot recover NYAX tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }

    function emergencyRecoverETH(uint256 amount) external onlyOwner {
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "Treasury: ETH transfer failed");
    }

    // --------------------------------------------------
    // Internal helpers
    // --------------------------------------------------

    function _categoryKey(string memory category) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(category));
    }

    function _incrementDistributed(string memory category, uint256 amount) private {
        if (amount == 0 || bytes(category).length == 0) return;

        bytes32 key = _categoryKey(category);
        Category storage cat = _categories[key];
        if (cat.exists) {
            cat.distributed += amount;
        }
    }

    receive() external payable {}
}
