'use client';

import { useTreasury } from '@/hooks/useNYAXContracts';
import {
    Clock,
    Coins,
    Minus,
    Plus,
    Send,
    Settings,
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
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">NYAX Admin Dashboard</h1>
                        <p className="text-gray-300">Platform administration and management</p>
                    </div>
                    <Badge variant="outline" className="text-red-400 border-red-400">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin Access
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Treasury Balance</p>
                                    <p className="text-2xl font-bold text-white">{treasuryBalance}</p>
                                </div>
                                <Coins className="w-8 h-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Categories</p>
                                    <p className="text-2xl font-bold text-white">{categories.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Vesting</p>
                                    <p className="text-2xl font-bold text-white">12</p>
                                </div>
                                <Clock className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Pending Proposals</p>
                                    <p className="text-2xl font-bold text-white">3</p>
                                </div>
                                <Settings className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                        <TabsTrigger
                            value="overview"
                            className={`text-white ${selectedTab === 'overview' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('overview')}
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="tokens"
                            className={`text-white ${selectedTab === 'tokens' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('tokens')}
                        >
                            Token Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="treasury"
                            className={`text-white ${selectedTab === 'treasury' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('treasury')}
                        >
                            Treasury
                        </TabsTrigger>
                        <TabsTrigger
                            value="vesting"
                            className={`text-white ${selectedTab === 'vesting' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSelectedTab('vesting')}
                        >
                            Vesting
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    {selectedTab === 'overview' && (
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button className="w-full bg-green-600 hover:bg-green-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Mint Tokens
                                        </Button>
                                        <Button className="w-full bg-red-600 hover:bg-red-700">
                                            <Minus className="w-4 h-4 mr-2" />
                                            Burn Tokens
                                        </Button>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            <Send className="w-4 h-4 mr-2" />
                                            Treasury Transfer
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">System Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Transfers Enabled</span>
                                            <Badge className="bg-green-600">Active</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">MultiSig Status</span>
                                            <Badge className="bg-green-600">Operational</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Governance</span>
                                            <Badge className="bg-green-600">Active</Badge>
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
                                <Card className="bg-gray-800/50 border-gray-700">
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
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="mintAmount" className="text-gray-300">Amount (NYAX)</Label>
                                            <Input
                                                id="mintAmount"
                                                value={mintAmount}
                                                onChange={(e) => setMintAmount(e.target.value)}
                                                placeholder="1000"
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Mint Tokens
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Burn Tokens */}
                                <Card className="bg-gray-800/50 border-gray-700">
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
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <Button className="w-full bg-red-600 hover:bg-red-700">
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
                            <Card className="bg-gray-800/50 border-gray-700">
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
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                        <Input
                                            placeholder="Wallet Address"
                                            value={newCategory.wallet}
                                            onChange={(e) => setNewCategory({ ...newCategory, wallet: e.target.value })}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                        <Input
                                            placeholder="Allocation %"
                                            value={newCategory.allocation}
                                            onChange={(e) => setNewCategory({ ...newCategory, allocation: e.target.value })}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Category
                                        </Button>
                                    </div>

                                    {/* Existing Categories */}
                                    <div className="space-y-4">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                                                <div>
                                                    <h3 className="text-white font-medium capitalize">{category}</h3>
                                                    <p className="text-sm text-gray-400">Active category</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-red-600 text-red-400">
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
                            <Card className="bg-gray-800/50 border-gray-700">
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
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-300">Amount (NYAX)</Label>
                                            <Input
                                                value={vestingForm.amount}
                                                onChange={(e) => setVestingForm({ ...vestingForm, amount: e.target.value })}
                                                placeholder="10000"
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-300">Category</Label>
                                            <Input
                                                value={vestingForm.category}
                                                onChange={(e) => setVestingForm({ ...vestingForm, category: e.target.value })}
                                                placeholder="team"
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-300">Cliff Period (Months)</Label>
                                            <Input
                                                value={vestingForm.cliffMonths}
                                                onChange={(e) => setVestingForm({ ...vestingForm, cliffMonths: e.target.value })}
                                                placeholder="12"
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
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
    );
}
