'use client';

import { useNYAXToken } from '@/hooks/useNYAXContracts';
import React, { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';
import { Card, CardContent, CardHeader } from '@/components/reui/card';
import { Input } from '@/components/reui/input';
import { Progress } from '@/components/reui/progress';

import {
    Clock,
    Coins,
    CreditCard,
    Shield,
    TrendingUp,
    Wallet,
    Zap
} from 'lucide-react';

export function TokenSalePage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { balance } = useNYAXToken();

    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdt' | 'card'>('eth');
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock sale data
    const saleData = {
        totalSupply: 1000000000,
        soldTokens: 250000000,
        price: 0.001, // ETH per NYAX
        minPurchase: 100,
        maxPurchase: 100000,
        saleEnds: new Date('2024-12-31'),
        bonusTier: 15 // 15% bonus
    };

    const progress = (saleData.soldTokens / saleData.totalSupply) * 100;
    const ethAmount = parseFloat(purchaseAmount) * saleData.price;

    const handlePurchase = async () => {
        if (!isConnected) return;

        setIsProcessing(true);
        try {
            // Simulate purchase process
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert(`Successfully purchased ${purchaseAmount} NYAX tokens!`);
            setPurchaseAmount('');
        } catch (error) {
            alert('Purchase failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">NYAX Token Sale</h1>
                    <p className="text-xl text-gray-300">Join the future of decentralized finance</p>
                    <Badge className="bg-green-600 text-white px-4 py-2">
                        <Zap className="w-4 h-4 mr-2" />
                        Live Sale - {saleData.bonusTier}% Bonus
                    </Badge>
                </div>

                {/* Sale Progress */}
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">Sale Progress</h2>
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                    {progress.toFixed(1)}% Complete
                                </Badge>
                            </div>

                            <Progress value={progress} className="h-4" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {saleData.soldTokens.toLocaleString()}
                                    </p>
                                    <p className="text-gray-400">Tokens Sold</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {(saleData.totalSupply - saleData.soldTokens).toLocaleString()}
                                    </p>
                                    <p className="text-gray-400">Tokens Remaining</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {saleData.price} ETH
                                    </p>
                                    <p className="text-gray-400">Price per NYAX</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Purchase Form */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader>
                            <h3 className="flex items-center text-lg font-semibold text-white">
                                <Coins className="w-6 h-6 mr-2" />
                                Purchase NYAX Tokens
                            </h3>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!isConnected ? (
                                <div className="text-center space-y-4">
                                    <Wallet className="w-12 h-12 text-gray-500 mx-auto" />
                                    <p className="text-gray-400">Connect your wallet to purchase tokens</p>
                                    {connectors.map((connector) => (
                                        <Button
                                            key={connector.id}
                                            onClick={() => connect({ connector })}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            Connect {connector.name}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* Amount Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">Amount (NYAX)</label>
                                        <Input
                                            type="number"
                                            value={purchaseAmount}
                                            onChange={(e) => setPurchaseAmount(e.target.value)}
                                            placeholder={`Min: ${saleData.minPurchase}, Max: ${saleData.maxPurchase}`}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                        {purchaseAmount && (
                                            <p className="text-sm text-gray-400">
                                                Cost: {ethAmount.toFixed(4)} ETH
                                                {saleData.bonusTier > 0 && (
                                                    <span className="text-green-400 ml-2">
                                                        (+{saleData.bonusTier}% bonus)
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-3">
                                        <label className="text-sm text-gray-300">Payment Method</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                variant={paymentMethod === 'eth' ? 'default' : 'outline'}
                                                onClick={() => setPaymentMethod('eth')}
                                                className="flex flex-col items-center p-4 h-auto"
                                            >
                                                <Coins className="w-6 h-6 mb-1" />
                                                <span className="text-xs">ETH</span>
                                            </Button>
                                            <Button
                                                variant={paymentMethod === 'usdt' ? 'default' : 'outline'}
                                                onClick={() => setPaymentMethod('usdt')}
                                                className="flex flex-col items-center p-4 h-auto"
                                            >
                                                <Shield className="w-6 h-6 mb-1" />
                                                <span className="text-xs">USDT</span>
                                            </Button>
                                            <Button
                                                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                                onClick={() => setPaymentMethod('card')}
                                                className="flex flex-col items-center p-4 h-auto"
                                            >
                                                <CreditCard className="w-6 h-6 mb-1" />
                                                <span className="text-xs">Card</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <Button
                                        onClick={handlePurchase}
                                        disabled={!purchaseAmount || isProcessing}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <Coins className="w-4 h-4 mr-2" />
                                                Purchase {purchaseAmount || '0'} NYAX
                                            </>
                                        )}
                                    </Button>

                                    {/* Current Balance */}
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Your NYAX Balance</span>
                                            <span className="text-white font-bold">{balance}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sale Information */}
                    <div className="space-y-6">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <h3 className="flex items-center text-lg font-semibold text-white">
                                    <Clock className="w-6 h-6 mr-2" />
                                    Sale Details
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Sale Ends</span>
                                    <span className="text-white">{saleData.saleEnds.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Min Purchase</span>
                                    <span className="text-white">{saleData.minPurchase.toLocaleString()} NYAX</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Max Purchase</span>
                                    <span className="text-white">{saleData.maxPurchase.toLocaleString()} NYAX</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Bonus</span>
                                    <span className="text-green-400">{saleData.bonusTier}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <h3 className="flex items-center text-lg font-semibold text-white">
                                    <TrendingUp className="w-6 h-6 mr-2" />
                                    Token Utility
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-white font-medium">Governance Rights</p>
                                        <p className="text-sm text-gray-400">Vote on platform decisions</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-white font-medium">Staking Rewards</p>
                                        <p className="text-sm text-gray-400">Earn rewards by staking tokens</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-white font-medium">Platform Access</p>
                                        <p className="text-sm text-gray-400">Access premium features</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
