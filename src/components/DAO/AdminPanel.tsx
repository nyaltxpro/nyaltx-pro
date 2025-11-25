import { useDAO } from '@/hooks/useDAO';
import React, { useState } from 'react';
import { FaBan, FaCoins, FaExclamationTriangle, FaFire, FaRocket, FaShieldAlt } from 'react-icons/fa';

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
    const { isConnected, isInitialized } = useDAO();

    const [mintAmount, setMintAmount] = useState('');
    const [mintTo, setMintTo] = useState('');
    const [burnAmount, setBurnAmount] = useState('');
    const [burnFrom, setBurnFrom] = useState('');
    const [blacklistAddress, setBlacklistAddress] = useState('');
    const [transfersEnabled, setTransfersEnabled] = useState(true);
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
            // const daoService = getDAOService();
            // await daoService.mintTokens(mintTo, mintAmount);

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Successfully minted ${mintAmount} NYAX to ${mintTo}`);
            setMintAmount('');
            setMintTo('');
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
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Successfully burned ${burnAmount} NYAX from ${burnFrom}`);
            setBurnAmount('');
            setBurnFrom('');
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
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(`Successfully updated blacklist status for ${blacklistAddress}`);
            setBlacklistAddress('');
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
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newState = !transfersEnabled;
            setTransfersEnabled(newState);
            setSuccess(`Transfers ${newState ? 'enabled' : 'disabled'} successfully`);
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
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess('ETH recovered successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to recover ETH');
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
                    <div className="text-yellow-400 text-4xl mb-4">🔐</div>
                    <h2 className="text-xl font-semibold text-white mb-2">Admin Access Required</h2>
                    <p className="text-gray-400 mb-4">
                        Connect your admin wallet to access the DAO administration panel.
                    </p>
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
