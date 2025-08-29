'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getMixedTokensForSocialUpdates } from '../lib/blockchain/blockchainUtils';

interface SocialUpdate {
    id: string;
    name: string;
    logoUrl: string;
    time: string;
    chain: string;
    platforms: string[];
}

export default function RecentSocials() {
    const [updates, setUpdates] = useState<SocialUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSocialUpdates = async () => {
            try {
                const socialUpdates = await getMixedTokensForSocialUpdates(5);
                setUpdates(socialUpdates);
            } catch (error) {
                console.error('Error fetching social updates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSocialUpdates();
    }, []);

    // Platform icons mapping
    const platformIcons: Record<string, string> = {
        website: '🌐',
        telegram: '📱',
        twitter: '🐦',
        discord: '💬',
        medium: '📝',
        github: '🔧'
    };

    return (

        <>
            <div className="section-header">
                <div className="section-title">Daily gainers</div>
                <div className="view-more">More ›</div>
            </div>

            <div>
                {updates.map((update) => (
                    <div key={update.id} className="gainer-item">
                        <div className="token-info my-2 ">
                            {/* <div className="token-icon">{index + 1}</div> */}
                            <div className='flex    items-center'>
                                <Image
                                    src={update.logoUrl}
                                    alt={update.name}
                                    width={22}
                                    height={22}
                                    className="object-contain  bg-white mr-2 rounded-full"
                                    unoptimized
                                />
                                <div className="token-name">{update.name}</div>
                                <p className="text-sm text-gray-400">{update.time}</p>
                            </div>
                        </div>
                        <div>
                            {/* <div className="text-right">{token.price}</div> */}
                            <div className="token-percentage percentage-positive">
                                <p>{update.chain}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
