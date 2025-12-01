import { CheckCircle, Coins, TrendingUp, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function NYALTXGovernance() {
    const [activeTab, setActiveTab] = useState('overview');
    const [proposals, setProposals] = useState([
        { id: 1, title: 'Increase staking rewards', status: 'active', votesFor: 15420, votesAgainst: 8340, ends: '2d 5h', quorum: 65 },
        { id: 2, title: 'Update treasury allocation', status: 'passed', votesFor: 22100, votesAgainst: 5200, ends: 'Ended', quorum: 85 },
        { id: 3, title: 'New partnership proposal', status: 'active', votesFor: 9800, votesAgainst: 12400, ends: '5d 12h', quorum: 45 },
        { id: 4, title: 'Governance parameter change', status: 'pending', votesFor: 0, votesAgainst: 0, ends: 'Starts in 1d', quorum: 0 },
    ]);

    const [transfers, setTransfers] = useState([
        { id: 1, from: '0x742d...a8f3', to: '0x9c21...4b7e', amount: 1500, timestamp: '2 mins ago', type: 'transfer' },
        { id: 2, from: '0x1a3c...2f91', to: 'Treasury', amount: 5000, timestamp: '15 mins ago', type: 'stake' },
        { id: 3, from: '0x8e4d...6c2a', to: '0x7f1b...3d9e', amount: 750, timestamp: '1 hour ago', type: 'transfer' },
        { id: 4, from: 'Treasury', to: '0x5d2e...8a4c', amount: 2200, timestamp: '3 hours ago', type: 'reward' },
    ]);

    const [legacyDeposit, setLegacyDeposit] = useState<any>({
        address: '',
        amount: '',
        status: null
    });

    const stats = {
        totalSupply: 1000000,
        circulatingSupply: 750000,
        stakedTokens: 425000,
        holders: 12847,
        activeProposals: 2,
        avgVoterTurnout: 58
    };

    const votingPowerData = [
        { range: '0-100', holders: 8240 },
        { range: '100-1K', holders: 3120 },
        { range: '1K-10K', holders: 1180 },
        { range: '10K-100K', holders: 267 },
        { range: '100K+', holders: 40 },
    ];

    const tokenDistribution = [
        { name: 'Staked', value: 42.5, color: '#3b82f6' },
        { name: 'Circulating', value: 32.5, color: '#8b5cf6' },
        { name: 'Treasury', value: 15, color: '#10b981' },
        { name: 'Locked', value: 10, color: '#f59e0b' },
    ];

    const volumeData = [
        { day: 'Mon', volume: 45000 },
        { day: 'Tue', volume: 52000 },
        { day: 'Wed', volume: 48000 },
        { day: 'Thu', volume: 61000 },
        { day: 'Fri', volume: 58000 },
        { day: 'Sat', volume: 43000 },
        { day: 'Sun', volume: 39000 },
    ];

    const handleLegacyDeposit = () => {
        if (!legacyDeposit.address || !legacyDeposit.amount) {
            setLegacyDeposit({ ...legacyDeposit, status: 'error' });
            return;
        }

        // Simulate deposit
        setLegacyDeposit({ ...legacyDeposit, status: 'success' });
        setTimeout(() => {
            setLegacyDeposit({ address: '', amount: '', status: null });
        }, 3000);
    };

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'active': return 'bg-blue-500';
            case 'passed': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            case 'pending': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        NYALTX Governance
                    </h1>
                    <p className="text-gray-400">Decentralized governance for token holders</p>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                    {['overview', 'proposals', 'transfers', 'deposit'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-t-lg transition-all ${activeTab === tab
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Total Supply</span>
                                    <Coins className="text-blue-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{stats.totalSupply.toLocaleString()}</p>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Staked Tokens</span>
                                    <TrendingUp className="text-green-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{stats.stakedTokens.toLocaleString()}</p>
                                <p className="text-sm text-green-400 mt-1">
                                    {((stats.stakedTokens / stats.totalSupply) * 100).toFixed(1)}% of supply
                                </p>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Token Holders</span>
                                    <Users className="text-purple-400" size={20} />
                                </div>
                                <p className="text-3xl font-bold">{stats.holders.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={tokenDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }: any) => `${name}: ${value}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {tokenDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <h3 className="text-xl font-semibold mb-4">7-Day Transfer Volume</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="day" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                        <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Voting Power Distribution */}
                        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">Voting Power Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={votingPowerData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="range" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Bar dataKey="holders" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Proposals Tab */}
                {activeTab === 'proposals' && (
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <div key={proposal.id} className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)} bg-opacity-20 ${getStatusColor(proposal.status).replace('bg-', 'text-')}`}>
                                                {proposal.status.toUpperCase()}
                                            </span>
                                            <h3 className="text-xl font-semibold">{proposal.title}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm">Proposal #{proposal.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Time remaining</p>
                                        <p className="font-semibold">{proposal.ends}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-400">For: {proposal.votesFor.toLocaleString()}</span>
                                            <span className="text-red-400">Against: {proposal.votesAgainst.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                                                style={{
                                                    width: '100%',
                                                    background: `linear-gradient(to right, #10b981 ${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%, #ef4444 ${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%)`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">
                                            Quorum: {proposal.quorum}% {proposal.quorum >= 50 ? '✓' : ''}
                                        </span>
                                        {proposal.status === 'active' && (
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors">
                                                    Vote For
                                                </button>
                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors">
                                                    Vote Against
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transfers Tab */}
                {activeTab === 'transfers' && (
                    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">From</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">To</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {transfers.map((transfer) => (
                                        <tr key={transfer.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-300">{transfer.from}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-300">{transfer.to}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">{transfer.amount.toLocaleString()} NYALTX</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${transfer.type === 'stake' ? 'bg-blue-500/20 text-blue-400' :
                                                    transfer.type === 'reward' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    {transfer.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{transfer.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Legacy Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-2">Legacy Token Deposit</h2>
                            <p className="text-gray-400 mb-6">
                                Deposit your legacy NYALTX tokens into the new governance system. No restrictions apply.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Legacy Token Address</label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        value={legacyDeposit.address}
                                        onChange={(e) => setLegacyDeposit({ ...legacyDeposit, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={legacyDeposit.amount}
                                        onChange={(e) => setLegacyDeposit({ ...legacyDeposit, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    />
                                </div>

                                <button
                                    onClick={handleLegacyDeposit}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                                >
                                    Deposit Legacy Tokens
                                </button>

                                {legacyDeposit.status === 'success' && (
                                    <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                                        <CheckCircle className="text-green-400" size={20} />
                                        <span className="text-green-400 font-semibold">Deposit successful!</span>
                                    </div>
                                )}

                                {legacyDeposit.status === 'error' && (
                                    <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                                        <XCircle className="text-red-400" size={20} />
                                        <span className="text-red-400 font-semibold">Please fill in all fields</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>Note:</strong> Legacy deposits are processed immediately with no restrictions.
                                    Once deposited, your tokens will be eligible for governance participation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}