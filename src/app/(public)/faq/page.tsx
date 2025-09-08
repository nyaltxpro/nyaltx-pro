'use client'

import React, { useState } from 'react';
import Header from '../../../components/Header';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "What is Cryptic?",
      answer: "Cryptic is a comprehensive cryptocurrency tracking platform that provides real-time data, charts, and insights for various cryptocurrencies and tokens. Our platform helps users make informed decisions about their crypto investments."
    },
    {
      question: "How do I connect my wallet?",
      answer: "You can connect your wallet by clicking on the 'Connect' button in the top right corner of the page. We support multiple wallet providers including MetaMask, WalletConnect, and more."
    },
    {
      question: "Is my data safe?",
      answer: "Yes, we take data privacy very seriously. We do not store your private keys or sensitive wallet information. All connections are encrypted and secure. For more information, please refer to our Privacy Policy."
    },
    {
      question: "How often is the price data updated?",
      answer: "Our price data is updated in real-time through reliable cryptocurrency APIs and blockchain data sources to ensure you have the most current information."
    },
    {
      question: "Can I track my portfolio performance?",
      answer: "Yes, once you connect your wallet, you can track your portfolio performance, including gains, losses, and transaction history."
    },
    {
      question: "How do I report issues or bugs?",
      answer: "If you encounter any issues or bugs, please visit our Contact page and submit a detailed report. Our team will address it as soon as possible."
    },
    {
      question: "Are there any fees for using Cryptic?",
      answer: "Basic features of Cryptic are free to use. Premium features may require a subscription. Please check our pricing page for more details."
    },
    {
      question: "Which blockchains do you support?",
      answer: "We currently support Ethereum, Arbitrum, Base, Scroll, and Polygon networks, with plans to add more in the future."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className="mb-4 border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left bg-gray-800 hover:bg-gray-750 flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-lg">{item.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-850 border-t border-gray-700">
                  <p className="text-gray-300">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
