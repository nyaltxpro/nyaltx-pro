'use client';

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0f1923] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Cryptic</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              At Cryptic, we're on a mission to make cryptocurrency trading accessible, transparent, and efficient for everyone. 
              We believe in the power of decentralized finance to transform the global economy and create new opportunities for people worldwide.
            </p>
            <p>
              Our platform aggregates data from multiple decentralized exchanges to provide you with the best possible trading experience, 
              ensuring you always get the best rates and lowest fees when swapping your digital assets.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="mb-6">
              Cryptic was founded by a team of blockchain enthusiasts, developers, and financial experts who saw the need for a more 
              user-friendly approach to DeFi. Our diverse team brings together expertise from traditional finance, blockchain technology, 
              and user experience design.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team member cards would go here in a real implementation */}
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                </div>
                <h3 className="font-semibold text-xl">Alex Chen</h3>
                <p className="text-gray-300">Co-Founder & CEO</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                </div>
                <h3 className="font-semibold text-xl">Sarah Johnson</h3>
                <p className="text-gray-300">Co-Founder & CTO</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                </div>
                <h3 className="font-semibold text-xl">Michael Rodriguez</h3>
                <p className="text-gray-300">Head of Product</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
            <p className="mb-4">
              Cryptic leverages cutting-edge blockchain technology to provide a seamless trading experience across multiple chains and protocols.
              Our platform integrates with leading DEXs including Uniswap, SushiSwap, PancakeSwap, and more to ensure you always get the best rates.
            </p>
            <p>
              We're committed to security, transparency, and continuous improvement. Our smart contract integrations are regularly audited,
              and we're constantly working to add new features and support for additional chains and protocols.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              Have questions, suggestions, or just want to say hello? We'd love to hear from you!
            </p>
            <div className="flex flex-col space-y-2">
              <p>
                <span className="font-semibold">Email:</span> hello@cryptic.finance
              </p>
              <p>
                <span className="font-semibold">Twitter:</span> @CrypticFinance
              </p>
              <p>
                <span className="font-semibold">Discord:</span> discord.gg/cryptic
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
