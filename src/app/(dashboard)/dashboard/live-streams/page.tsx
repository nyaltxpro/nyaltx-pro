"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import LiveStreamDiscovery from '@/components/LiveStreamDiscovery';
import { FaVideo, FaUsers, FaFire, FaRocket } from 'react-icons/fa';

export default function LiveStreamsPage() {
  const { address, isConnected } = useAccount();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <FaVideo className="text-white text-2xl" />
              </div>
              <h1 className="text-5xl font-bold text-white">
                NYALTX <span className="text-red-500">Live</span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The first crypto-native live streaming platform. Stream, chat, and earn with real-time blockchain integration.
              No replays, no recordings - just pure live interaction.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FaRocket className="text-red-400 text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">Instant Streaming</h3>
                <p className="text-gray-400 text-sm">
                  Go live instantly with wallet authentication. No complex setup required.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FaUsers className="text-cyan-400 text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">Real-time Chat</h3>
                <p className="text-gray-400 text-sm">
                  Chat with viewers in real-time. Wallet-based identity and crypto donations.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FaFire className="text-orange-400 text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">No Replays</h3>
                <p className="text-gray-400 text-sm">
                  Streams are destroyed when ended. Pure live experience like pump.fun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Streams Discovery */}
      <LiveStreamDiscovery />
      
      {/* Footer Info */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <h4 className="text-white font-bold mb-3">🎥 For Streamers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Instant go-live with wallet</li>
                <li>• Real-time viewer analytics</li>
                <li>• Crypto donations & tips</li>
                <li>• No platform fees</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3">👥 For Viewers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Watch live crypto content</li>
                <li>• Chat with wallet identity</li>
                <li>• Send crypto donations</li>
                <li>• Discover new projects</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3">🔐 Web3 Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Wallet-based authentication</li>
                <li>• On-chain donations</li>
                <li>• NFT-gated streams</li>
                <li>• Token-based access</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3">⚡ Technology</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• WebRTC streaming</li>
                <li>• WebSocket chat</li>
                <li>• Real-time destruction</li>
                <li>• Decentralized identity</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Built on NYALTX • Powered by Web3 • {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect wallet to stream'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
