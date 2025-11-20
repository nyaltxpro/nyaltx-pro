'use client';

import { useTreasury } from '@/hooks/useNYAXContracts';
import {
    Clock,
    Coins,
    Minus,
    Plus,
    Send,
    Shield,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useAccount } from 'wagmi';

// Simple UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ children, className = '', variant = 'default', size = 'default', onClick, disabled, ...props }: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm';
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: any;
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
    const variantClasses = variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90';
    const sizeClasses = size === 'sm' ? 'h-9 rounded-md px-3' : 'h-10 px-4 py-2';
    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
const Input = ({ className = '', type = 'text', value, onChange, placeholder, ...props }: {
    className?: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    [key: string]: any;
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-lg border border-gray-600/50 bg-black/20 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);
const Label = ({ children, className = '', htmlFor }: {
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
}) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);
const Badge = ({ children, className = '', variant = 'default' }: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'secondary';
}) => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantClasses = variant === 'outline'
        ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
        : variant === 'secondary'
            ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
            : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80';
    return <div className={`${baseClasses} ${variantClasses} ${className}`}>{children}</div>;
};
const Tabs = ({ value, onValueChange, children, className = '' }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={className}>{children}</div>
);
const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>
);
const TabsTrigger = ({ value, children, className = '', onClick }: {
    value: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);
const TabsContent = ({ value, children, className = '' }: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
        {children}
    </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-black/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export function AdminDashboard() {
    const { address } = useAccount();
    const { treasuryBalance, categories } = useTreasury();
    const [selectedTab, setSelectedTab] = useState('overview');

    // Mint/Burn state
    const [mintAmount, setMintAmount] = useState('');
    const [mintAddress, setMintAddress] = useState('');
    const [burnAmount, setBurnAmount] = useState('');

    // Category management state
    const [newCategory, setNewCategory] = useState({ name: '', wallet: '', allocation: '' });

    // Vesting creation state
    const [vestingForm, setVestingForm] = useState({
        beneficiary: '',
        amount: '',
        category: '',
        cliffMonths: '',
        durationMonths: ''
    });

    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        type: '',
        data: null as any
    });

    const openModal = (title: string, type: string, data?: any) => {
        setModalState({ isOpen: true, title, type, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, title: '', type: '', data: null });
    };

    return (
        <div className="flex flex-col min-h-screen" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <div className="max-w-7xl mx-auto w-full space-y-6 p-4">
                {/* Header */}
                <div className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">NYAX Admin Dashboard</h1>
                            <p className="text-gray-400 mt-2">Manage NYAX token operations and platform governance</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge className="bg-[#00d4aa] text-black font-semibold">Admin Mode</Badge>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Connected Wallet</p>
                                <p className="text-white font-mono text-sm">
                                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Treasury Balance</p>
                                    <p className="text-2xl font-bold text-white">{treasuryBalance}</p>
                                </div>
                                <Coins className="w-8 h-8 text-[#00d4aa]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Supply</p>
                                    <p className="text-2xl font-bold text-white">1,000,000,000</p>
                                </div>
                                <Shield className="w-8 h-8 text-[#00d4aa]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Users</p>
                                    <p className="text-2xl font-bold text-white">15,432</p>
                                </div>
                                <Users className="w-8 h-8 text-[#00d4aa]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Vesting</p>
                                    <p className="text-2xl font-bold text-white">12</p>
                                </div>
                                <Clock className="w-8 h-8 text-[#00d4aa]" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
                            <TabsTrigger
                                value="overview"
                                className={`text-white transition-all duration-200 rounded-lg ${selectedTab === 'overview' ? 'bg-[#00d4aa] text-black font-semibold' : 'hover:bg-gray-700/50'}`}
                                onClick={() => setSelectedTab('overview')}
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="tokens"
                                className={`text-white transition-all duration-200 rounded-lg ${selectedTab === 'tokens' ? 'bg-[#00d4aa] text-black font-semibold' : 'hover:bg-gray-700/50'}`}
                                onClick={() => setSelectedTab('tokens')}
                            >
                                Token Management
                            </TabsTrigger>
                            <TabsTrigger
                                value="treasury"
                                className={`text-white transition-all duration-200 rounded-lg ${selectedTab === 'treasury' ? 'bg-[#00d4aa] text-black font-semibold' : 'hover:bg-gray-700/50'}`}
                                onClick={() => setSelectedTab('treasury')}
                            >
                                Treasury
                            </TabsTrigger>
                            <TabsTrigger
                                value="vesting"
                                className={`text-white transition-all duration-200 rounded-lg ${selectedTab === 'vesting' ? 'bg-[#00d4aa] text-black font-semibold' : 'hover:bg-gray-700/50'}`}
                                onClick={() => setSelectedTab('vesting')}
                            >
                                Vesting
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        {selectedTab === 'overview' && (
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                        <CardHeader>
                                            <CardTitle className="text-white">Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Button className="w-full bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold transition-all duration-200">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Mint Tokens
                                            </Button>
                                            <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200">
                                                <Minus className="w-4 h-4 mr-2" />
                                                Burn Tokens
                                            </Button>
                                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-200">
                                                <Send className="w-4 h-4 mr-2" />
                                                Treasury Transfer
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                        <CardHeader>
                                            <CardTitle className="text-white">System Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Transfers Enabled</span>
                                                <Badge className="bg-[#00d4aa] text-black font-semibold">Active</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">MultiSig Status</span>
                                                <Badge className="bg-[#00d4aa] text-black font-semibold">Operational</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Governance</span>
                                                <Badge className="bg-[#00d4aa] text-black font-semibold">Active</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        )}

                        {/* Token Management Tab */}
                        {selectedTab === 'tokens' && (
                            <TabsContent value="tokens" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Mint Tokens */}
                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                        <CardHeader>
                                            <CardTitle className="text-white">Mint Tokens</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="mintAddress" className="text-gray-300">Recipient Address</Label>
                                                <Input
                                                    id="mintAddress"
                                                    value={mintAddress}
                                                    onChange={(e) => setMintAddress(e.target.value)}
                                                    placeholder="0x..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="mintAmount" className="text-gray-300">Amount (NYAX)</Label>
                                                <Input
                                                    id="mintAmount"
                                                    value={mintAmount}
                                                    onChange={(e) => setMintAmount(e.target.value)}
                                                    placeholder="1000"
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold transition-all duration-200"
                                                onClick={() => openModal('Confirm Token Mint', 'mint')}
                                                disabled={!mintAddress || !mintAmount}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Mint Tokens
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Burn Tokens */}
                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                        <CardHeader>
                                            <CardTitle className="text-white">Burn Tokens</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="burnAmount" className="text-gray-300">Amount to Burn (NYAX)</Label>
                                                <Input
                                                    id="burnAmount"
                                                    value={burnAmount}
                                                    onChange={(e) => setBurnAmount(e.target.value)}
                                                    placeholder="1000"
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200"
                                                onClick={() => openModal('Confirm Token Burn', 'burn')}
                                                disabled={!burnAmount}
                                            >
                                                <Minus className="w-4 h-4 mr-2" />
                                                Burn from Treasury
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        )}

                        {/* Treasury Tab */}
                        {selectedTab === 'treasury' && (
                            <TabsContent value="treasury" className="space-y-6">
                                <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                    <CardHeader>
                                        <CardTitle className="text-white">Category Management</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Add New Category */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <Input
                                                placeholder="Category Name"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Wallet Address"
                                                value={newCategory.wallet}
                                                onChange={(e) => setNewCategory({ ...newCategory, wallet: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Allocation %"
                                                value={newCategory.allocation}
                                                onChange={(e) => setNewCategory({ ...newCategory, allocation: e.target.value })}
                                            />
                                            <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold transition-all duration-200">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Category
                                            </Button>
                                        </div>

                                        {/* Existing Categories */}
                                        <div className="space-y-4">
                                            {categories.map((category) => (
                                                <div key={category} className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                                    <div>
                                                        <h3 className="text-white font-medium capitalize">{category}</h3>
                                                        <p className="text-sm text-gray-400">Active category</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200">
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200">
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* Vesting Tab */}
                        {selectedTab === 'vesting' && (
                            <TabsContent value="vesting" className="space-y-6">
                                <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                    <CardHeader>
                                        <CardTitle className="text-white">Create Vesting Schedule</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-gray-300">Beneficiary Address</Label>
                                                <Input
                                                    value={vestingForm.beneficiary}
                                                    onChange={(e) => setVestingForm({ ...vestingForm, beneficiary: e.target.value })}
                                                    placeholder="0x..."
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Amount (NYAX)</Label>
                                                <Input
                                                    value={vestingForm.amount}
                                                    onChange={(e) => setVestingForm({ ...vestingForm, amount: e.target.value })}
                                                    placeholder="10000"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Category</Label>
                                                <Input
                                                    value={vestingForm.category}
                                                    onChange={(e) => setVestingForm({ ...vestingForm, category: e.target.value })}
                                                    placeholder="team"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Cliff Period (Months)</Label>
                                                <Input
                                                    value={vestingForm.cliffMonths}
                                                    onChange={(e) => setVestingForm({ ...vestingForm, cliffMonths: e.target.value })}
                                                    placeholder="12"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold transition-all duration-200"
                                            onClick={() => openModal('Confirm Vesting Schedule', 'vesting')}
                                            disabled={!vestingForm.beneficiary || !vestingForm.amount}
                                        >
                                            <Clock className="w-4 h-4 mr-2" />
                                            Create Vesting Schedule
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
            >
                {modalState.type === 'mint' && (
                    <div className="space-y-4">
                        <p className="text-gray-300">
                            Are you sure you want to mint <span className="text-[#00d4aa] font-semibold">{mintAmount} NYAX</span> tokens to:
                        </p>
                        <p className="text-white font-mono text-sm bg-black/20 p-2 rounded-lg">
                            {mintAddress}
                        </p>
                        <div className="flex space-x-3">
                            <Button
                                className="flex-1 bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold"
                                onClick={() => {
                                    // Add mint logic here
                                    console.log('Minting tokens...');
                                    closeModal();
                                }}
                            >
                                Confirm Mint
                            </Button>
                            <Button
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {modalState.type === 'burn' && (
                    <div className="space-y-4">
                        <p className="text-gray-300">
                            Are you sure you want to burn <span className="text-red-400 font-semibold">{burnAmount} NYAX</span> tokens from the treasury?
                        </p>
                        <p className="text-yellow-400 text-sm">⚠️ This action cannot be undone.</p>
                        <div className="flex space-x-3">
                            <Button
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold"
                                onClick={() => {
                                    // Add burn logic here
                                    console.log('Burning tokens...');
                                    closeModal();
                                }}
                            >
                                Confirm Burn
                            </Button>
                            <Button
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {modalState.type === 'vesting' && (
                    <div className="space-y-4">
                        <p className="text-gray-300">
                            Create vesting schedule for <span className="text-[#00d4aa] font-semibold">{vestingForm.amount} NYAX</span>?
                        </p>
                        <div className="bg-black/20 p-3 rounded-lg space-y-2 text-sm">
                            <div><span className="text-gray-400">Beneficiary:</span> <span className="text-white font-mono">{vestingForm.beneficiary}</span></div>
                            <div><span className="text-gray-400">Category:</span> <span className="text-white">{vestingForm.category}</span></div>
                            <div><span className="text-gray-400">Cliff:</span> <span className="text-white">{vestingForm.cliffMonths} months</span></div>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                className="flex-1 bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold"
                                onClick={() => {
                                    // Add vesting logic here
                                    console.log('Creating vesting schedule...');
                                    closeModal();
                                }}
                            >
                                Create Schedule
                            </Button>
                            <Button
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
