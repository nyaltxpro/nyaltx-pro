'use client';

import { useTreasury } from '@/hooks/useNYAXContracts';
import {
    Building2,
    Clock,
    Coins,
    Grid3X3,
    Home,
    Minus,
    Plus,
    Send,
    Settings,
    Shield,
    Users,
    Vote,
    Wallet
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
    const [selectedTab, setSelectedTab] = useState('home');

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
        <div className="flex min-h-screen bg-gray-900" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            {/* Sidebar */}
            <div className="w-64 bg-black/80 backdrop-blur-sm border-r border-gray-800/50 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#00d4aa] rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-sm">N</span>
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">thematrix.aragon.eth</h2>
                            <p className="text-gray-400 text-xs">0xD79F...dcTc</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">APPS</h3>

                        <button
                            onClick={() => setSelectedTab('home')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'home' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Home</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('tokens')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'tokens' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Coins className="w-5 h-5" />
                            <span className="font-medium">Tokens</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('voting')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'voting' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Vote className="w-5 h-5" />
                            <span className="font-medium">Voting</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('finance')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'finance' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium">Finance</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('permissions')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'permissions' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Permissions</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('app-center')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'app-center' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Grid3X3 className="w-5 h-5" />
                            <span className="font-medium">App Center</span>
                        </button>

                        <button
                            onClick={() => setSelectedTab('organization')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTab === 'organization' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">Organization</span>
                        </button>
                    </div>

                    {/* System Section */}
                    <div className="mt-8 space-y-2">
                        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">SYSTEM</h3>

                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
                        </button>
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#00d4aa] rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-xs">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">Admin</p>
                            <p className="text-gray-400 text-xs">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <div className="bg-black/60 backdrop-blur-sm border-b border-gray-800/50 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">NYAX Admin Dashboard</h1>
                            <p className="text-gray-400 mt-1">Manage NYAX token operations and platform governance</p>
                        </div>
                        <Badge className="bg-[#00d4aa] text-black font-semibold px-3 py-1">Admin Mode</Badge>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 space-y-6">

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

                    {/* Main Content */}
                    <div className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
                        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">

                            {/* Home Tab */}
                            {selectedTab === 'home' && (
                                <TabsContent value="home" className="space-y-6">
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

                            {/* Tokens Tab */}
                            {selectedTab === 'tokens' && (
                                <TabsContent value="tokens" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">Tokens</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            Add tokens
                                        </Button>
                                    </div>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-700/30">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-[#00d4aa] rounded-full flex items-center justify-center">
                                                            <span className="text-black font-bold text-sm">FRB</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-medium">Fireball (FRB)</h3>
                                                            <p className="text-gray-400 text-sm">0xD79F...dcTc</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-medium">75,000</div>
                                                        <div className="text-gray-400 text-sm">Balance</div>
                                                    </div>
                                                </div>

                                                <div className="bg-black/10 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-3">Token Info</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">Total supply:</span>
                                                            <span className="text-white ml-2">200,000</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Transferable:</span>
                                                            <span className="text-white ml-2">YES</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Token:</span>
                                                            <span className="text-white ml-2">Fireball (FRB)</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h5 className="text-white font-medium mb-2">Ownership Distribution</h5>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <span className="text-white text-xs font-bold">YOU</span>
                                                                    </div>
                                                                    <span className="text-white text-sm">YOU</span>
                                                                </div>
                                                                <span className="text-white text-sm">100%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Voting Tab */}
                            {selectedTab === 'voting' && (
                                <TabsContent value="voting" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">Voting</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            New vote
                                        </Button>
                                    </div>

                                    <div className="flex space-x-4 mb-6">
                                        <Button variant="outline" className="text-white border-gray-600">
                                            Status
                                        </Button>
                                        <Button variant="outline" className="text-white border-gray-600">
                                            Outcome
                                        </Button>
                                        <Button variant="outline" className="text-white border-gray-600">
                                            App
                                        </Button>
                                        <Button variant="outline" className="text-white border-gray-600">
                                            Start day
                                        </Button>
                                        <Button variant="outline" className="text-white border-gray-600">
                                            End day
                                        </Button>
                                    </div>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <h3 className="text-white font-medium mb-2">Closed votes</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-700/30">
                                                        <div className="flex items-center space-x-4">
                                                            <Coins className="w-8 h-8 text-[#00d4aa]" />
                                                            <div className="text-left">
                                                                <h4 className="text-white font-medium">Tokens</h4>
                                                                <p className="text-gray-400 text-sm">#0: Tokens (FRB): Mint 100000 tokens for 0xD79F4ce4c7033FA20...</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-center">
                                                                <div className="text-white font-medium">YES</div>
                                                                <div className="w-16 h-2 bg-green-500 rounded-full mt-1"></div>
                                                            </div>
                                                            <div className="text-gray-400 text-sm">0%</div>
                                                            <div className="text-gray-400 text-sm">NO</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center text-gray-400 text-sm mt-4">
                                                        Proposal completed
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Finance Tab */}
                            {selectedTab === 'finance' && (
                                <TabsContent value="finance" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">Finance</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            New transfer
                                        </Button>
                                    </div>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardHeader>
                                            <CardTitle className="text-white">Token Balances</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-8">
                                                <p className="text-gray-400">No token balances yet.</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardHeader>
                                            <CardTitle className="text-white">Transfers</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex space-x-4 mb-4">
                                                <Button variant="outline" className="text-white border-gray-600">
                                                    Type
                                                </Button>
                                                <Button variant="outline" className="text-white border-gray-600">
                                                    Token
                                                </Button>
                                                <Button variant="outline" className="text-white border-gray-600">
                                                    Start day
                                                </Button>
                                                <Button variant="outline" className="text-white border-gray-600">
                                                    End day
                                                </Button>
                                            </div>
                                            <div className="text-center py-8">
                                                <p className="text-gray-400">No transfers yet.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Permissions Tab */}
                            {selectedTab === 'permissions' && (
                                <TabsContent value="permissions" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">Permissions</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            New permission
                                        </Button>
                                    </div>

                                    {/* Permission Type Tabs */}
                                    <div className="flex space-x-4 mb-6">
                                        <Button variant="outline" className="text-white border-gray-600 bg-black/20">
                                            App permissions
                                        </Button>
                                        <Button variant="outline" className="text-white border-gray-600">
                                            System permissions
                                        </Button>
                                    </div>

                                    {/* Permission Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        {/* Tokens Permission */}
                                        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Coins className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-white font-medium mb-1">Tokens</h3>
                                                <p className="text-gray-400 text-sm">FRB</p>
                                            </CardContent>
                                        </Card>

                                        {/* Voting Permission */}
                                        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Vote className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-white font-medium mb-1">Voting</h3>
                                                <p className="text-gray-400 text-sm">FRB (FRB)</p>
                                            </CardContent>
                                        </Card>

                                        {/* Finance Permission */}
                                        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Wallet className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-white font-medium mb-1">Finance</h3>
                                                <p className="text-gray-400 text-sm">OFFICER_ROLE</p>
                                            </CardContent>
                                        </Card>

                                        {/* Agent Permission */}
                                        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-300">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-white font-medium mb-1">Agent</h3>
                                                <p className="text-gray-400 text-sm">OFFICER_ROLE</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* All Assigned Permissions Table */}
                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-white">All assigned permissions</CardTitle>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-gray-400 text-sm">Entity</div>
                                                    <div className="text-gray-400 text-sm">Search by app or role</div>
                                                    <Button variant="outline" size="sm" className="text-white border-gray-600">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Table Header */}
                                            <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700/50 text-gray-400 text-sm font-medium">
                                                <div>ACTION</div>
                                                <div>ON APP</div>
                                                <div>ASSIGNED TO ENTITY</div>
                                                <div>MANAGED BY</div>
                                            </div>

                                            {/* Table Rows */}
                                            <div className="space-y-2 mt-4">
                                                {/* Mint Tokens Permission */}
                                                <div className="grid grid-cols-4 gap-4 p-4 bg-black/20 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
                                                    <div className="text-white font-medium">Mint tokens</div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                                            <Coins className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Tokens</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                                            <Vote className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Voting</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                                            <Vote className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Voting</span>
                                                    </div>
                                                </div>

                                                {/* Burn Tokens Permission */}
                                                <div className="grid grid-cols-4 gap-4 p-4 bg-black/20 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
                                                    <div className="text-white font-medium">Burn tokens</div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                                            <Coins className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Tokens</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                                            <Vote className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Voting</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                                            <Vote className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-white">Voting</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* App Center Tab */}
                            {selectedTab === 'app-center' && (
                                <TabsContent value="app-center" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">App Center</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            Install App
                                        </Button>
                                    </div>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-white font-medium mb-2">No Apps Installed</h3>
                                                <p className="text-gray-400">Browse and install apps to extend functionality</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Organization Tab */}
                            {selectedTab === 'organization' && (
                                <TabsContent value="organization" className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-white">Organization</h2>
                                        <Button className="bg-[#00d4aa] hover:bg-[#00d4aa]/80 text-black font-semibold">
                                            Edit Settings
                                        </Button>
                                    </div>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-white font-medium mb-4">Organization Details</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-gray-300">Organization Name</Label>
                                                            <Input value="NYAX DAO" className="mt-1" readOnly />
                                                        </div>
                                                        <div>
                                                            <Label className="text-gray-300">Network</Label>
                                                            <Input value="Ethereum Mainnet" className="mt-1" readOnly />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-white font-medium mb-4">Members</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-[#00d4aa] rounded-full flex items-center justify-center">
                                                                    <span className="text-black font-bold text-xs">AD</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium">Admin</p>
                                                                    <p className="text-gray-400 text-sm">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</p>
                                                                </div>
                                                            </div>
                                                            <Badge className="bg-[#00d4aa] text-black">Owner</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Legacy Token Management Tab */}
                            {selectedTab === 'token-management' && (
                                <TabsContent value="token-management" className="space-y-6">
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
        </div>

    );
}
