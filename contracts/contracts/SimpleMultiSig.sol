// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleMultiSig
 * @dev A simple multi-signature wallet for NYAX Treasury operations
 * 
 * Features:
 * - Multiple owners with configurable threshold
 * - Transaction submission, confirmation, and execution
 * - Support for ETH and ERC20 token transfers
 * - Emergency functions
 * - Owner management
 * 
 * Note: For production, consider using Gnosis Safe instead
 */
contract SimpleMultiSig is ReentrancyGuard {

    // Events
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event ThresholdChanged(uint256 threshold);
    event TransactionSubmitted(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event TransactionConfirmed(address indexed owner, uint256 indexed txIndex);
    event TransactionRevoked(address indexed owner, uint256 indexed txIndex);
    event TransactionExecuted(uint256 indexed txIndex);
    event Deposit(address indexed sender, uint256 amount, uint256 balance);

    // State variables
    uint256 public threshold;
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public transactionCount;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) isConfirmed;
    }

    mapping(uint256 => Transaction) public transactions;

    // Modifiers
    modifier onlyOwner() {
        require(isOwner[msg.sender], "SimpleMultiSig: Not an owner");
        _;
    }

    modifier txExists(uint256 txIndex) {
        require(txIndex < transactionCount, "SimpleMultiSig: Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 txIndex) {
        require(!transactions[txIndex].executed, "SimpleMultiSig: Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 txIndex) {
        require(!transactions[txIndex].isConfirmed[msg.sender], "SimpleMultiSig: Transaction already confirmed");
        _;
    }

    /**
     * @dev Constructor
     * @param _owners Array of owner addresses
     * @param _threshold Number of confirmations required
     */
    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length > 0, "SimpleMultiSig: Owners required");
        require(
            _threshold > 0 && _threshold <= _owners.length,
            "SimpleMultiSig: Invalid threshold"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "SimpleMultiSig: Invalid owner address");
            require(!isOwner[owner], "SimpleMultiSig: Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
            emit OwnerAdded(owner);
        }

        threshold = _threshold;
        emit ThresholdChanged(_threshold);
    }

    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    /**
     * @dev Submit a new transaction
     * @param to Destination address
     * @param value ETH value to send
     * @param data Transaction data
     * @return txIndex Index of the submitted transaction
     */
    function submitTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) public onlyOwner returns (uint256 txIndex) {
        txIndex = transactionCount;
        
        Transaction storage transaction = transactions[txIndex];
        transaction.to = to;
        transaction.value = value;
        transaction.data = data;
        transaction.executed = false;
        transaction.confirmations = 0;

        transactionCount += 1;

        emit TransactionSubmitted(txIndex, to, value, data);
        
        // Auto-confirm by submitter
        confirmTransaction(txIndex);
        
        return txIndex;
    }

    /**
     * @dev Confirm a transaction
     * @param txIndex Transaction index
     */
    function confirmTransaction(uint256 txIndex)
        public
        onlyOwner
        txExists(txIndex)
        notConfirmed(txIndex)
        notExecuted(txIndex)
    {
        Transaction storage transaction = transactions[txIndex];
        transaction.isConfirmed[msg.sender] = true;
        transaction.confirmations += 1;

        emit TransactionConfirmed(msg.sender, txIndex);

        // Auto-execute if threshold is met
        if (transaction.confirmations >= threshold) {
            executeTransaction(txIndex);
        }
    }

    /**
     * @dev Revoke confirmation for a transaction
     * @param txIndex Transaction index
     */
    function revokeConfirmation(uint256 txIndex)
        public
        onlyOwner
        txExists(txIndex)
        notExecuted(txIndex)
    {
        Transaction storage transaction = transactions[txIndex];
        require(transaction.isConfirmed[msg.sender], "SimpleMultiSig: Transaction not confirmed");

        transaction.isConfirmed[msg.sender] = false;
        transaction.confirmations -= 1;

        emit TransactionRevoked(msg.sender, txIndex);
    }

    /**
     * @dev Execute a confirmed transaction
     * @param txIndex Transaction index
     */
    function executeTransaction(uint256 txIndex)
        public
        onlyOwner
        txExists(txIndex)
        notExecuted(txIndex)
        nonReentrant
    {
        Transaction storage transaction = transactions[txIndex];
        require(
            transaction.confirmations >= threshold,
            "SimpleMultiSig: Insufficient confirmations"
        );

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "SimpleMultiSig: Transaction execution failed");

        emit TransactionExecuted(txIndex);
    }

    /**
     * @dev Get transaction details
     * @param txIndex Transaction index
     * @return to Destination address
     * @return value ETH value
     * @return data Transaction data
     * @return executed Whether transaction is executed
     * @return confirmations Number of confirmations
     */
    function getTransaction(uint256 txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations
        )
    {
        Transaction storage transaction = transactions[txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.confirmations
        );
    }

    /**
     * @dev Check if transaction is confirmed by owner
     * @param txIndex Transaction index
     * @param owner Owner address
     * @return Whether transaction is confirmed by owner
     */
    function isConfirmed(uint256 txIndex, address owner) public view returns (bool) {
        return transactions[txIndex].isConfirmed[owner];
    }

    /**
     * @dev Get all owners
     * @return Array of owner addresses
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev Get number of owners
     * @return Number of owners
     */
    function getOwnerCount() public view returns (uint256) {
        return owners.length;
    }

    /**
     * @dev Get transaction count
     * @return Total number of transactions
     */
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }

    /**
     * @dev Add a new owner (requires multisig approval)
     * @param owner New owner address
     */
    function addOwner(address owner) external {
        require(msg.sender == address(this), "SimpleMultiSig: Only multisig can add owners");
        require(owner != address(0), "SimpleMultiSig: Invalid owner address");
        require(!isOwner[owner], "SimpleMultiSig: Owner already exists");

        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAdded(owner);
    }

    /**
     * @dev Remove an owner (requires multisig approval)
     * @param owner Owner address to remove
     */
    function removeOwner(address owner) external {
        require(msg.sender == address(this), "SimpleMultiSig: Only multisig can remove owners");
        require(isOwner[owner], "SimpleMultiSig: Not an owner");
        require(owners.length > threshold, "SimpleMultiSig: Cannot remove owner below threshold");

        isOwner[owner] = false;
        
        // Remove from owners array
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        emit OwnerRemoved(owner);
    }

    /**
     * @dev Change the threshold (requires multisig approval)
     * @param _threshold New threshold
     */
    function changeThreshold(uint256 _threshold) external {
        require(msg.sender == address(this), "SimpleMultiSig: Only multisig can change threshold");
        require(
            _threshold > 0 && _threshold <= owners.length,
            "SimpleMultiSig: Invalid threshold"
        );

        threshold = _threshold;
        emit ThresholdChanged(_threshold);
    }

    /**
     * @dev Emergency function to recover stuck ETH (requires multisig approval)
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function emergencyWithdraw(address payable to, uint256 amount) external {
        require(msg.sender == address(this), "SimpleMultiSig: Only multisig can emergency withdraw");
        require(to != address(0), "SimpleMultiSig: Invalid recipient");
        require(amount <= address(this).balance, "SimpleMultiSig: Insufficient balance");

        to.transfer(amount);
    }
}
