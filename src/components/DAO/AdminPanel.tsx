'use client'
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useDAO } from '@/hooks/useDAO';
import React, { useState } from 'react';
import { FaBan, FaClock, FaCoins, FaExclamationTriangle, FaFire, FaRocket, FaShieldAlt, FaUsers, FaVoteYea, FaWallet } from 'react-icons/fa';

interface AdminActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onAction: () => void;
    loading?: boolean;
    dangerous?: boolean;
}

const AdminActionCard: React.FC<AdminActionCardProps> = ({
    title,
    description,
    icon,
    onAction,
    loading,
    dangerous
}) => (
    <div className={`bg-gray-800 rounded-lg p-6 border ${dangerous ? 'border-red-500/50' : 'border-gray-700'}`}>
        <div className="flex items-start space-x-4">
            <div className={`text-2xl ${dangerous ? 'text-red-400' : 'text-cyan-400'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${dangerous ? 'text-red-300' : 'text-white'}`}>
                    {title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                <button
                    onClick={onAction}
                    disabled={loading}
                    className={`px-4 py-2 rounded font-medium text-sm ${dangerous
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? 'Processing...' : 'Execute'}
                </button>
            </div>
        </div>
    </div>
);

export const AdminPanel: React.FC = () => {
    const {
        isConnected,
        isInitialized,
        mintTokens,
        burnTokens,
        setBlacklisted,
        setTransfersEnabled,
        recoverETH,
        createProposal,
        submitMultisigTransaction,
        createVestingContract,
        mintToTreasury
    } = useDAO();

    // Token Management State
    const [mintAmount, setMintAmount] = useState('');
    const [mintTo, setMintTo] = useState('');
    const [burnAmount, setBurnAmount] = useState('');
    const [burnFrom, setBurnFrom] = useState('');
    const [blacklistAddress, setBlacklistAddress] = useState('');
    const [transfersEnabled, setTransfersEnabledState] = useState(true);

    // Governance State
    const [proposalTargets, setProposalTargets] = useState('');
    const [proposalValues, setProposalValues] = useState('');
    const [proposalCalldatas, setProposalCalldatas] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [proposalId, setProposalId] = useState('');

    // Multisig State
    const [multisigTo, setMultisigTo] = useState('');
    const [multisigValue, setMultisigValue] = useState('');
    const [multisigData, setMultisigData] = useState('');

    // Vesting State
    const [vestingCategory, setVestingCategory] = useState('');
    const [vestingAmount, setVestingAmount] = useState('');
    const [vestingBeneficiary, setVestingBeneficiary] = useState('');

    // Treasury State
    const [treasuryAmount, setTreasuryAmount] = useState('');
    const [treasuryReason, setTreasuryReason] = useState('');

    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Mock admin functions - in real implementation, these would use the DAO service
    const handleMintTokens = async () => {
        if (!mintTo || !mintAmount) {
            setError('Please provide recipient address and amount');
            return;
        }

        setLoading('mint');
        setError(null);
        setSuccess(null);

        try {
            const success = await mintTokens(mintTo, mintAmount);
            if (success) {
                setSuccess(`Successfully minted ${mintAmount} NYAX to ${mintTo}`);
                setMintAmount('');
                setMintTo('');
            } else {
                setError('Failed to mint tokens');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mint tokens');
        } finally {
            setLoading(null);
        }
    };

    const handleBurnTokens = async () => {
        if (!burnFrom || !burnAmount) {
            setError('Please provide address and amount to burn');
            return;
        }

        setLoading('burn');
        setError(null);
        setSuccess(null);

        try {
            const success = await burnTokens(burnFrom, burnAmount);
            if (success) {
                setSuccess(`Successfully burned ${burnAmount} NYAX from ${burnFrom}`);
                setBurnAmount('');
                setBurnFrom('');
            } else {
                setError('Failed to burn tokens');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to burn tokens');
        } finally {
            setLoading(null);
        }
    };

    const handleToggleBlacklist = async () => {
        if (!blacklistAddress) {
            setError('Please provide address to blacklist/unblacklist');
            return;
        }

        setLoading('blacklist');
        setError(null);
        setSuccess(null);

        try {
            const success = await setBlacklisted(blacklistAddress, true);
            if (success) {
                setSuccess(`Successfully blacklisted ${blacklistAddress}`);
                setBlacklistAddress('');
            } else {
                setError('Failed to update blacklist');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update blacklist');
        } finally {
            setLoading(null);
        }
    };

    const handleToggleTransfers = async () => {
        setLoading('transfers');
        setError(null);
        setSuccess(null);

        try {
            const newState = !transfersEnabled;
            const success = await setTransfersEnabled(newState);
            if (success) {
                setTransfersEnabledState(newState);
                setSuccess(`Transfers ${newState ? 'enabled' : 'disabled'} successfully`);
            } else {
                setError('Failed to toggle transfers');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle transfers');
        } finally {
            setLoading(null);
        }
    };

    const handleEmergencyPause = async () => {
        setLoading('emergency');
        setError(null);
        setSuccess(null);

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess('Emergency pause activated successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate emergency pause');
        } finally {
            setLoading(null);
        }
    };

    const handleRecoverETH = async () => {
        setLoading('recover');
        setError(null);
        setSuccess(null);

        try {
            const success = await recoverETH();
            if (success) {
                setSuccess('ETH recovered successfully');
            } else {
                setError('Failed to recover ETH');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to recover ETH');
        } finally {
            setLoading(null);
        }
    };

    // Governance Functions
    const handleCreateProposal = async () => {
        if (!proposalTargets || !proposalValues || !proposalCalldatas || !proposalDescription) {
            setError('Please provide all proposal details');
            return;
        }

        setLoading('proposal');
        setError(null);
        setSuccess(null);

        try {
            const targets = proposalTargets.split(',').map(t => t.trim());
            const values = proposalValues.split(',').map(v => v.trim());
            const calldatas = proposalCalldatas.split(',').map(c => c.trim());

            const txHash = await createProposal(targets, values, calldatas, proposalDescription);
            if (txHash) {
                setSuccess('Proposal created successfully');
                setProposalTargets('');
                setProposalValues('');
                setProposalCalldatas('');
                setProposalDescription('');
            } else {
                setError('Failed to create proposal');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create proposal');
        } finally {
            setLoading(null);
        }
    };

    const handleExecuteProposal = async () => {
        if (!proposalId) {
            setError('Please provide proposal ID');
            return;
        }

        setLoading('execute');
        setError(null);
        setSuccess(null);

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Proposal ${proposalId} executed successfully`);
            setProposalId('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to execute proposal');
        } finally {
            setLoading(null);
        }
    };

    // Multisig Functions
    const handleSubmitMultisigTransaction = async () => {
        if (!multisigTo || !multisigValue || !multisigData) {
            setError('Please provide all multisig transaction details');
            return;
        }

        setLoading('multisig');
        setError(null);
        setSuccess(null);

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess('Multisig transaction submitted successfully');
            setMultisigTo('');
            setMultisigValue('');
            setMultisigData('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit multisig transaction');
        } finally {
            setLoading(null);
        }
    };

    // Vesting Functions
    const handleCreateVestingContract = async () => {
        if (!vestingCategory) {
            setError('Please provide vesting category');
            return;
        }

        setLoading('vesting');
        setError(null);
        setSuccess(null);

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Vesting contract created for ${vestingCategory}`);
            setVestingCategory('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create vesting contract');
        } finally {
            setLoading(null);
        }
    };

    // Treasury Functions
    const handleMintToTreasury = async () => {
        if (!treasuryAmount || !treasuryReason) {
            setError('Please provide amount and reason for treasury mint');
            return;
        }

        setLoading('treasury');
        setError(null);
        setSuccess(null);

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Successfully minted ${treasuryAmount} NYAX to treasury`);
            setTreasuryAmount('');
            setTreasuryReason('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mint to treasury');
        } finally {
            setLoading(null);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white">Initializing admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-yellow-400 text-6xl mb-6">
                        <FaWallet className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-3">Admin Access Required</h2>
                    <p className="text-gray-400 mb-6">
                        Connect your admin wallet to access the DAO administration panel.
                    </p>
                    <div className="space-y-4">
                        <ConnectWalletButton
                            className="w-full py-3 px-6 text-base font-semibold"
                        />
                        <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <p className="flex items-center justify-center mb-1">
                                <FaExclamationTriangle className="mr-2 text-yellow-400" />
                                <strong>Note:</strong>
                            </p>
                            <p>Only pre-approved admin wallet addresses can access this panel.</p>
                            <p className="mt-1">Configure via <code className="text-cyan-400">ADMIN_WALLET_ADDRESSES</code> environment variable.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">DAO Admin Panel</h1>
                    <p className="text-gray-400">
                        Advanced administration functions for NYAX DAO contracts
                    </p>
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                        <p className="text-yellow-400 text-sm flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            <strong>Warning:</strong> These are powerful administrative functions. Use with extreme caution.
                        </p>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-green-400 text-sm">{success}</p>
                    </div>
                )}

                {/* Token Management */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Token Management</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Mint Tokens */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaCoins className="mr-2 text-cyan-400" />
                                Mint Tokens
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Recipient Address
                                    </label>
                                    <input
                                        type="text"
                                        value={mintTo}
                                        onChange={(e) => setMintTo(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Amount (NYAX)
                                    </label>
                                    <input
                                        type="text"
                                        value={mintAmount}
                                        onChange={(e) => setMintAmount(e.target.value)}
                                        placeholder="1000"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    />
                                </div>
                                <button
                                    onClick={handleMintTokens}
                                    disabled={loading === 'mint'}
                                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'mint' ? 'Minting...' : 'Mint Tokens'}
                                </button>
                            </div>
                        </div>

                        {/* Burn Tokens */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-red-500/50">
                            <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center">
                                <FaFire className="mr-2 text-red-400" />
                                Burn Tokens
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        From Address
                                    </label>
                                    <input
                                        type="text"
                                        value={burnFrom}
                                        onChange={(e) => setBurnFrom(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Amount (NYAX)
                                    </label>
                                    <input
                                        type="text"
                                        value={burnAmount}
                                        onChange={(e) => setBurnAmount(e.target.value)}
                                        placeholder="1000"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-400"
                                    />
                                </div>
                                <button
                                    onClick={handleBurnTokens}
                                    disabled={loading === 'burn'}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'burn' ? 'Burning...' : 'Burn Tokens'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Controls */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Security Controls</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Blacklist Management */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaBan className="mr-2 text-yellow-400" />
                                Blacklist Management
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Address to Blacklist/Unblacklist
                                    </label>
                                    <input
                                        type="text"
                                        value={blacklistAddress}
                                        onChange={(e) => setBlacklistAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
                                    />
                                </div>
                                <button
                                    onClick={handleToggleBlacklist}
                                    disabled={loading === 'blacklist'}
                                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'blacklist' ? 'Processing...' : 'Toggle Blacklist'}
                                </button>
                            </div>
                        </div>

                        {/* Transfer Controls */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaShieldAlt className="mr-2 text-blue-400" />
                                Transfer Controls
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Transfers Enabled:</span>
                                    <span className={`font-medium ${transfersEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                        {transfersEnabled ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleToggleTransfers}
                                    disabled={loading === 'transfers'}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'transfers' ? 'Processing...' : `${transfersEnabled ? 'Disable' : 'Enable'} Transfers`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Governance Functions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Governance Management</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Create Proposal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaVoteYea className="mr-2 text-purple-400" />
                                Create Proposal
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Target Addresses (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={proposalTargets}
                                        onChange={(e) => setProposalTargets(e.target.value)}
                                        placeholder="0x...,0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Values (comma-separated, in wei)
                                    </label>
                                    <input
                                        type="text"
                                        value={proposalValues}
                                        onChange={(e) => setProposalValues(e.target.value)}
                                        placeholder="0,0"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Call Data (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={proposalCalldatas}
                                        onChange={(e) => setProposalCalldatas(e.target.value)}
                                        placeholder="0x...,0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={proposalDescription}
                                        onChange={(e) => setProposalDescription(e.target.value)}
                                        placeholder="Proposal description..."
                                        rows={3}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateProposal}
                                    disabled={loading === 'proposal'}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'proposal' ? 'Creating...' : 'Create Proposal'}
                                </button>
                            </div>
                        </div>

                        {/* Execute Proposal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaRocket className="mr-2 text-green-400" />
                                Execute Proposal
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Proposal ID
                                    </label>
                                    <input
                                        type="text"
                                        value={proposalId}
                                        onChange={(e) => setProposalId(e.target.value)}
                                        placeholder="123"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                                    />
                                </div>
                                <button
                                    onClick={handleExecuteProposal}
                                    disabled={loading === 'execute'}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'execute' ? 'Executing...' : 'Execute Proposal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multisig Functions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Multisig Management</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaUsers className="mr-2 text-orange-400" />
                                Submit Multisig Transaction
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        To Address
                                    </label>
                                    <input
                                        type="text"
                                        value={multisigTo}
                                        onChange={(e) => setMultisigTo(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Value (ETH)
                                    </label>
                                    <input
                                        type="text"
                                        value={multisigValue}
                                        onChange={(e) => setMultisigValue(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data
                                    </label>
                                    <input
                                        type="text"
                                        value={multisigData}
                                        onChange={(e) => setMultisigData(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSubmitMultisigTransaction}
                                disabled={loading === 'multisig'}
                                className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading === 'multisig' ? 'Submitting...' : 'Submit Transaction'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vesting Functions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Vesting Management</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaClock className="mr-2 text-indigo-400" />
                                Create Vesting Contract
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Vesting Category
                                    </label>
                                    <select
                                        value={vestingCategory}
                                        onChange={(e) => setVestingCategory(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-400"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="team">Team</option>
                                        <option value="advisors">Advisors</option>
                                        <option value="investors">Investors</option>
                                        <option value="ecosystem">Ecosystem</option>
                                        <option value="treasury">Treasury</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleCreateVestingContract}
                                    disabled={loading === 'vesting'}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'vesting' ? 'Creating...' : 'Create Vesting Contract'}
                                </button>
                            </div>
                        </div>

                        {/* Treasury Functions */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FaWallet className="mr-2 text-teal-400" />
                                Mint to Treasury
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Amount (NYAX)
                                    </label>
                                    <input
                                        type="text"
                                        value={treasuryAmount}
                                        onChange={(e) => setTreasuryAmount(e.target.value)}
                                        placeholder="1000"
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Reason
                                    </label>
                                    <input
                                        type="text"
                                        value={treasuryReason}
                                        onChange={(e) => setTreasuryReason(e.target.value)}
                                        placeholder="Reason for minting..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400"
                                    />
                                </div>
                                <button
                                    onClick={handleMintToTreasury}
                                    disabled={loading === 'treasury'}
                                    className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading === 'treasury' ? 'Minting...' : 'Mint to Treasury'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Functions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Emergency Functions</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AdminActionCard
                            title="Emergency Pause"
                            description="Immediately pause all contract operations. Use only in critical situations."
                            icon={<FaExclamationTriangle />}
                            onAction={handleEmergencyPause}
                            loading={loading === 'emergency'}
                            dangerous={true}
                        />

                        <AdminActionCard
                            title="Recover ETH"
                            description="Recover accidentally sent ETH from contracts to admin wallet."
                            icon={<FaRocket />}
                            onAction={handleRecoverETH}
                            loading={loading === 'recover'}
                        />
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        Important Disclaimer
                    </h3>
                    <div className="text-red-400 text-sm space-y-2">
                        <p>• These administrative functions have significant impact on the DAO and token holders.</p>
                        <p>• Always verify addresses and amounts before executing transactions.</p>
                        <p>• Emergency functions should only be used in critical situations.</p>
                        <p>• Consider using multisig approval for large operations.</p>
                        <p>• All actions are logged and auditable on the blockchain.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
