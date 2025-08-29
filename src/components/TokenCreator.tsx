'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRandomEthereumValidatorsAsCreators } from '../lib/blockchain/blockchainUtils';

interface CreatorToken {
    id: string;
    name: string;
    logoUrl: string;
    time: string;
    chain: string;
}

export default function TokenCreator() {
    const [tokens, setTokens] = useState<CreatorToken[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const creators = await getRandomEthereumValidatorsAsCreators(5);
                setTokens(creators);
            } catch (error) {
                console.error('Error fetching token creators:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreators();
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
                                <p className="text-sm text-gray-400">{token.time}</p>
                            </div>
                        </div>
                        <div>
                            {/* <div className="text-right">{token.price}</div> */}
                            <div className="token-percentage percentage-positive">
                                <p>{token.chain}</p>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
