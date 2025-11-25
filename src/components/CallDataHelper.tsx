'use client';
import { useState } from 'react';
import { Address, isAddress } from 'viem';
import {
    generateAddOwnerCallData,
    generateChangeThresholdCallData
} from '../utils/addMultisigOwner';
import {
    CONTRACT_ADDRESSES,
    generateApprovalCallData,
    generateMintCallData,
    generateTransferCallData,
    TRANSACTION_EXAMPLES
} from '../utils/callDataGenerator';

interface TransactionData {
    to: string;
    value: string;
    callData: string;
}

export default function CallDataHelper() {
    const [transactionType, setTransactionType] = useState<string>('transfer');
    const [recipient, setRecipient] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>(CONTRACT_ADDRESSES.NYAX_TOKEN);
    const [result, setResult] = useState<TransactionData | null>(null);
    const [error, setError] = useState<string>('');

    const generateCallData = () => {
        setError('');
        setResult(null);

        try {
            // Validate addresses
            if (!isAddress(recipient)) {
                throw new Error('Invalid recipient address');
            }
            if (!isAddress(contractAddress)) {
                throw new Error('Invalid contract address');
            }
            if (!amount || parseFloat(amount) <= 0) {
                throw new Error('Invalid amount');
            }

            let callData: `0x${string}`;

            switch (transactionType) {
                case 'transfer':
                    callData = generateTransferCallData(recipient as Address, amount);
                    break;
                case 'approve':
                    callData = generateApprovalCallData(recipient as Address, amount);
                    break;
                case 'mint':
                    callData = generateMintCallData(recipient as Address, amount);
                    break;
                case 'transferDirect':
                    // For direct transfer, automatically set contract address to NYAX token
                    setContractAddress(CONTRACT_ADDRESSES.NYAX_TOKEN);
                    callData = generateTransferCallData(recipient as Address, amount);
                    break;
                case 'addOwner':
                    callData = generateAddOwnerCallData(recipient as Address);
                    break;
                case 'changeThreshold':
                    callData = generateChangeThresholdCallData(parseInt(amount));
                    break;
                default:
                    throw new Error('Invalid transaction type');
            }

            setResult({
                to: contractAddress,
                value: '0',
                callData
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    const useExample = (exampleKey: keyof typeof TRANSACTION_EXAMPLES) => {
        const example = TRANSACTION_EXAMPLES[exampleKey]();
        setResult(example);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
            <h2 className="text-2xl font-bold mb-6">🔧 Call Data Generator</h2>

            {/* Transaction Type Selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Transaction Type</label>
                <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                    <option value="transfer">Transfer NYAX Tokens</option>
                    <option value="approve">Approve NYAX Tokens</option>
                    <option value="mint">Mint NYAX Tokens</option>
                    <option value="transferDirect">Direct NYAX Transfer (Simple)</option>
                    <option value="addOwner">Add Multisig Owner</option>
                    <option value="changeThreshold">Change Multisig Threshold</option>
                </select>
            </div>

            {/* Contract Address */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contract Address (To Address)</label>
                <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x9b3C66f562EA32496bA19D9C7174613c37A91F98"
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm"
                />
            </div>

            {/* Recipient Address */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    {transactionType === 'approve' ? 'Spender Address' : 'Recipient Address'}
                </label>
                <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x0344cD31a3385830c9Fa4d9d5b0e22288279C231"
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm"
                />
            </div>

            {/* Amount */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount (in ETH/Token units)</label>
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                />
            </div>

            {/* Address Hints */}
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
                <h4 className="text-yellow-400 font-semibold mb-2">💡 Address Guide:</h4>
                <div className="text-sm text-yellow-200 space-y-1">
                    {transactionType === 'transferDirect' && (
                        <>
                            <p><strong>To Address:</strong> Automatically set to NYAX Token</p>
                            <p><strong>Recipient:</strong> Who receives the tokens</p>
                        </>
                    )}
                    {(transactionType === 'transfer' || transactionType === 'approve' || transactionType === 'mint') && (
                        <>
                            <p><strong>To Address:</strong> NYAX Token ({CONTRACT_ADDRESSES.NYAX_TOKEN})</p>
                            <p><strong>Recipient/Spender:</strong> Who receives/can spend the tokens</p>
                        </>
                    )}
                    {transactionType === 'addOwner' && (
                        <>
                            <p><strong>To Address:</strong> Multisig Contract ({CONTRACT_ADDRESSES.MULTISIG})</p>
                            <p><strong>Recipient:</strong> New owner address to add</p>
                        </>
                    )}
                    {transactionType === 'changeThreshold' && (
                        <>
                            <p><strong>To Address:</strong> Multisig Contract ({CONTRACT_ADDRESSES.MULTISIG})</p>
                            <p><strong>Amount:</strong> New threshold number (not address)</p>
                        </>
                    )}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateCallData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Generate Call Data
            </button>

            {/* Quick Examples */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Quick Examples:</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => useExample('transferTokens')}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
                    >
                        Transfer 100 Tokens
                    </button>
                    <button
                        onClick={() => useExample('approveTokens')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm"
                    >
                        Approve Tokens
                    </button>
                    <button
                        onClick={() => useExample('mintTokens')}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm"
                    >
                        Mint 1000 Tokens
                    </button>
                    <button
                        onClick={() => useExample('sendEth')}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded text-sm"
                    >
                        Send 0.1 ETH
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded">
                    <p className="text-red-200">❌ {error}</p>
                </div>
            )}

            {/* Result Display */}
            {result && (
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">✅ Generated Transaction Data:</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">To Address:</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-gray-700 rounded font-mono text-sm break-all">
                                    {result.to}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(result.to)}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Value (ETH):</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-gray-700 rounded font-mono text-sm">
                                    {result.value}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(result.value)}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Call Data:</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-gray-700 rounded font-mono text-xs break-all">
                                    {result.callData}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(result.callData)}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-900 border border-green-600 rounded">
                        <p className="text-green-200 text-sm">
                            ✅ This call data is properly formatted and ready to use in your multisig transaction!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
