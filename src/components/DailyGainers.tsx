'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRandomSolanaValidatorsAsGainers } from '../lib/blockchain/blockchainUtils';

interface GainerToken {
    id: string;
    name: string;
    logoUrl: string;
    price: number;
    percentChange: number;
    priceChange: number;
    volume: number;
}

export default function DailyGainers() {
    const [tokens, setTokens] = useState<GainerToken[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGainers = async () => {
            try {
                const gainers = await getRandomSolanaValidatorsAsGainers(10);
                setTokens(gainers);
            } catch (error) {
                console.error('Error fetching daily gainers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGainers();
    }, []);

    return (
        <>

 <div className="section-header">
                <div className="section-title">Daily gainers</div>
                <div className="view-more">More ›</div>
            </div> 

            <div>
                {tokens.map((token, index) => (
                    <div key={token.id} className="gainer-item">
                        <div className="token-info my-2 ">
                            {/* <div className="token-icon">{index + 1}</div> */}
                            <div className='flex    items-center'>
                                <Image
                                    src={token.logoUrl}
                                    alt={token.name}
                                    width={22}
                                    height={22}
                                    className="object-contain  bg-white mr-2 rounded-full"
                                    unoptimized
                                />
                                <div className="token-name">{token.name}</div>
                                <div className="token-chain">${token.price.toFixed(4)}</div>
                            </div>
                        </div>
                        <div>
                            {/* <div className="text-right">{token.price}</div> */}
                            <div className="token-percentage percentage-positive"> <p className={`font-medium ${token.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {token.percentChange >= 0 ? '+' : ''}{token.percentChange.toFixed(2)}%
                            </p>
                                <p className="text-sm text-gray-400">
                                    Vol: ${(token.volume / 1000000).toFixed(2)}M
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
