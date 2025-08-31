import React, { useEffect } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQ {
    question: string;
    answer: string;
    isOpen: boolean;
}

interface FaqProps {
    baseToken?: string;
    quoteToken?: string;
    className?: string;
}

const Faq: React.FC<FaqProps> = ({ baseToken = '', quoteToken = '', className = '' }) => {
    // Get token-specific FAQs based on the provided tokens
    const getTokenSpecificFaqs = (): FAQ[] => {
        // Bitcoin specific FAQs
        if (baseToken === 'BTC') {
            return [
                {
                    question: `What is Bitcoin (${baseToken})?`,
                    answer: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by an unknown person or group using the pseudonym Satoshi Nakamoto. It operates on a blockchain, a distributed ledger that records all transactions.',
                    isOpen: false
                },
                {
                    question: `How volatile is ${baseToken}/${quoteToken} trading pair?`,
                    answer: `The ${baseToken}/${quoteToken} pair is one of the most liquid trading pairs in crypto, but can still experience significant price volatility. It's important to use proper risk management when trading.`,
                    isOpen: false
                },
                {
                    question: 'What factors affect Bitcoin price?',
                    answer: 'Bitcoin price is affected by supply and demand, market sentiment, regulatory news, macroeconomic factors, technological developments, and institutional adoption.',
                    isOpen: false
                },
                {
                    question: 'Is Bitcoin a good investment?',
                    answer: 'Bitcoin has historically shown strong returns but also significant volatility. Whether it\'s a good investment depends on your risk tolerance, investment horizon, and portfolio diversification strategy.',
                    isOpen: false
                }
            ];
        }
        
        // Ethereum specific FAQs
        else if (baseToken === 'ETH') {
            return [
                {
                    question: `What is Ethereum (${baseToken})?`,
                    answer: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin.',
                    isOpen: false
                },
                {
                    question: 'What are gas fees in Ethereum?',
                    answer: 'Gas fees are payments made by users to compensate for the computing energy required to process and validate transactions on the Ethereum blockchain. Fees vary based on network congestion.',
                    isOpen: false
                },
                {
                    question: 'What is ETH 2.0?',
                    answer: 'ETH 2.0 (now called "The Merge") was a major upgrade to the Ethereum network that transitioned from proof-of-work to proof-of-stake consensus, significantly reducing energy consumption and laying groundwork for future scaling solutions.',
                    isOpen: false
                },
                {
                    question: 'What are smart contracts?',
                    answer: 'Smart contracts are self-executing contracts with the terms directly written into code. They automatically execute when predetermined conditions are met, enabling trustless agreements without intermediaries.',
                    isOpen: false
                }
            ];
        }
        
        // Stablecoin specific FAQs
        else if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(baseToken) || ['USDT', 'USDC', 'DAI', 'BUSD'].includes(quoteToken)) {
            const stablecoin = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(baseToken) ? baseToken : quoteToken;
            return [
                {
                    question: `What is ${stablecoin}?`,
                    answer: `${stablecoin} is a type of cryptocurrency known as a stablecoin, designed to maintain a stable value by being pegged to a reserve asset like the US dollar.`,
                    isOpen: false
                },
                {
                    question: `How does ${stablecoin} maintain its peg?`,
                    answer: stablecoin === 'DAI' 
                        ? 'DAI maintains its peg through a system of smart contracts and collateralization. Users lock up crypto assets as collateral to generate DAI.' 
                        : `${stablecoin} maintains its peg by holding reserves equal to the value of tokens in circulation. For each ${stablecoin} token, there should be $1 in reserve.`,
                    isOpen: false
                },
                {
                    question: 'What are stablecoins used for?',
                    answer: 'Stablecoins are used for trading, reducing volatility exposure, remittances, earning yield in DeFi protocols, and as a medium of exchange in the crypto ecosystem.',
                    isOpen: false
                },
                {
                    question: 'What are the risks of stablecoins?',
                    answer: 'Risks include depegging events, regulatory challenges, counterparty risk (for centralized stablecoins), smart contract vulnerabilities (for decentralized stablecoins), and liquidity issues during market stress.',
                    isOpen: false
                }
            ];
        }
        
        // Default to general crypto FAQs if no specific token match
        return [
            {
                question: `What should I know about the ${baseToken || 'token'}/${quoteToken || 'token'} trading pair?`,
                answer: `The ${baseToken || 'token'}/${quoteToken || 'token'} trading pair allows you to exchange these assets directly. Trading volumes and liquidity may vary based on market conditions.`,
                isOpen: false
            },
            {
                question: 'How do I start trading on this platform?',
                answer: 'To start trading, connect your wallet, select the tokens you want to trade, enter the amount, and confirm the transaction. Make sure you have enough funds to cover the trade and gas fees.',
                isOpen: false
            },
            {
                question: 'What are the fees for trading?',
                answer: 'Trading fees vary by the exchange or liquidity pool being used. Our platform aggregates multiple sources to find you the best price including fees. Network gas fees also apply for on-chain transactions.',
                isOpen: false
            },
            {
                question: 'How secure is this platform?',
                answer: 'Our platform is non-custodial, meaning we never take control of your funds. All transactions happen directly from your wallet. We implement industry-standard security practices and regular audits.',
                isOpen: false
            },
            {
                question: 'What is slippage and why does it matter?',
                answer: 'Slippage is the difference between the expected price of a trade and the price when the trade executes. It occurs due to market volatility and liquidity. Setting an appropriate slippage tolerance helps ensure your trade completes at an acceptable price.',
                isOpen: false
            }
        ];
    };

    // Initialize with token-specific FAQs
    const [faqs, setFaqs] = React.useState<FAQ[]>(() => getTokenSpecificFaqs());

    // Update FAQs when tokens change
    useEffect(() => {
        setFaqs(getTokenSpecificFaqs());
    }, [baseToken, quoteToken]);

    const toggleFAQ = (index: number) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
        setFaqs(updatedFaqs);
    };
    return (
        <div className={`bg-[#0f1923] my-5 rounded-lg shadow-lg p-6 ${className}`}>
                <h2 className="text-xl font-semibold text-white mb-4">
                    {baseToken && quoteToken 
                        ? `Frequently Asked Questions about ${baseToken}/${quoteToken}` 
                        : "Frequently Asked Questions"}
                </h2>

                <p className="text-gray-300 mb-4">
                    {baseToken && quoteToken 
                        ? `Find answers to common questions about trading ${baseToken} against ${quoteToken} and using our platform.` 
                        : "Our platform is easy to use, has low fees, and is trusted by thousands of users for cryptocurrency trading."}
                </p>

                <div className="space-y-4 mt-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-800 pb-3">
                            <button
                                className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="font-medium">{faq.question}</span>
                                {faq.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            {faq.isOpen && (
                                <p className="mt-2 text-gray-400 text-sm">
                                    {faq.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
     
    )
}

export default Faq
