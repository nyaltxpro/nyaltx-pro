// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TreasuryMultisig
 * @notice Minimal multi-signature wallet tailored for NYALTX treasury management.
 */
contract TreasuryMultisig {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event TransactionSubmitted(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event TransactionConfirmed(address indexed owner, uint256 indexed txIndex);
    event TransactionRevoked(address indexed owner, uint256 indexed txIndex);
    event TransactionExecuted(uint256 indexed txIndex);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event ThresholdChanged(uint256 threshold);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    address[] private _owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    Transaction[] private _transactions;
    mapping(uint256 => mapping(address => bool)) private _confirmations;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint256 txIndex) {
        require(txIndex < _transactions.length, "tx missing");
        _;
    }

    modifier notExecuted(uint256 txIndex) {
        require(!_transactions[txIndex].executed, "executed");
        _;
    }

    modifier notConfirmed(uint256 txIndex) {
        require(!_confirmations[txIndex][msg.sender], "confirmed");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "only self");
        _;
    }

    constructor(address[] memory owners_, uint256 threshold_) {
        require(owners_.length > 0, "owners required");
        require(threshold_ > 0 && threshold_ <= owners_.length, "bad threshold");

        for (uint256 i = 0; i < owners_.length; i++) {
            address owner = owners_[i];
            require(owner != address(0), "owner zero");
            require(!isOwner[owner], "owner dup");
            isOwner[owner] = true;
            _owners.push(owner);
            emit OwnerAdded(owner);
        }

        threshold = threshold_;
        emit ThresholdChanged(threshold_);
    }

    // --- Owner management (must be executed via multisig) ---
    function addOwner(address newOwner) external onlySelf {
        require(newOwner != address(0), "owner zero");
        require(!isOwner[newOwner], "exists");
        isOwner[newOwner] = true;
        _owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address owner, uint256 newThreshold) external onlySelf {
        require(isOwner[owner], "not owner");
        require(newThreshold > 0 && newThreshold <= _owners.length - 1, "bad threshold");

        isOwner[owner] = false;
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == owner) {
                _owners[i] = _owners[_owners.length - 1];
                _owners.pop();
                break;
            }
        }

        threshold = newThreshold;
        emit OwnerRemoved(owner);
        emit ThresholdChanged(newThreshold);
    }

    function changeThreshold(uint256 newThreshold) external onlySelf {
        require(newThreshold > 0 && newThreshold <= _owners.length, "bad threshold");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }

    // --- Transaction lifecycle ---
    function submitTransaction(address to, uint256 value, bytes calldata data)
        external
        onlyOwner
        returns (uint256 txIndex)
    {
        require(to != address(0), "to zero");

        txIndex = _transactions.length;
        _transactions.push(Transaction({ to: to, value: value, data: data, executed: false, confirmations: 0 }));

        emit TransactionSubmitted(txIndex, to, value, data);
    }

    function confirmTransaction(uint256 txIndex)
        external
        onlyOwner
        txExists(txIndex)
        notExecuted(txIndex)
        notConfirmed(txIndex)
    {
        _confirmations[txIndex][msg.sender] = true;
        _transactions[txIndex].confirmations += 1;
        emit TransactionConfirmed(msg.sender, txIndex);
    }

    function revokeConfirmation(uint256 txIndex)
        external
        onlyOwner
        txExists(txIndex)
        notExecuted(txIndex)
    {
        require(_confirmations[txIndex][msg.sender], "not confirmed");
        _confirmations[txIndex][msg.sender] = false;
        _transactions[txIndex].confirmations -= 1;
        emit TransactionRevoked(msg.sender, txIndex);
    }

    function executeTransaction(uint256 txIndex)
        public
        onlyOwner
        txExists(txIndex)
        notExecuted(txIndex)
    {
        Transaction storage txn = _transactions[txIndex];
        require(txn.confirmations >= threshold, "confirmations");

        txn.executed = true;
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "exec fail");
        emit TransactionExecuted(txIndex);
    }

    // --- Views used by dashboard/services ---
    function transactions(uint256 txIndex)
        external
        view
        txExists(txIndex)
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmations)
    {
        Transaction storage txn = _transactions[txIndex];
        return (txn.to, txn.value, txn.data, txn.executed, txn.confirmations);
    }

    function getTransaction(uint256 txIndex)
        external
        view
        txExists(txIndex)
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmations)
    {
        Transaction storage txn = _transactions[txIndex];
        return (txn.to, txn.value, txn.data, txn.executed, txn.confirmations);
    }

    function getTransactionCount() external view returns (uint256) {
        return _transactions.length;
    }

    function transactionCount() external view returns (uint256) {
        return _transactions.length;
    }

    function getOwners() external view returns (address[] memory) {
        return _owners;
    }

    function owners(uint256 index) external view returns (address) {
        return _owners[index];
    }

    function getOwnerCount() external view returns (uint256) {
        return _owners.length;
    }

    function isConfirmed(uint256 txIndex, address owner)
        external
        view
        txExists(txIndex)
        returns (bool)
    {
        return _confirmations[txIndex][owner];
    }

    // --- Ether handling ---
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
}
