'use client';
import {
    fetchTokenPairData,
    formatCurrency,
    TokenPairData
} from '@/api/coingecko/api';
import Faq from '@/components/Faq';
import InfoWidget from '@/components/InfoWidget';
import TokenAvatar from '@/components/TokenAvatar';
import tokens from '@/data/tokens.json';
import useMoralisTokenMetadata from '@/hooks/useMoralisTokenMetadata';
import { useSolanaTokenData } from '@/hooks/useSolanaTokenData';
import {
    fetchContractAddresses,
    logContractAddressInfo,
    updateUrlWithContractAddress,
} from '@/utils/contractAddressUtils';
import { getCryptoIconUrl, getCryptoIconUrlWithFallback } from '@/utils/cryptoIcons';
import { getCryptoName } from '@/utils/cryptoNames';
import { geckoTerminalAPI } from '@/utils/geckoTerminalApi';
import { fetchMoralisTokenData, fetchMoralisTokenPrice, isMoralisSupportedChain } from '@/utils/moralisApi';
import { fetchNYAXPrice, isNYAXToken } from '@/utils/nyaxPriceApi';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaChartBar,
    FaChevronDown,
    FaDiscord,
    FaEllipsisV,
    FaGithub,
    FaGlobe,
    FaInfoCircle,
    FaRegCopy,
    FaStar,
    FaSyncAlt,
    FaTelegram,
    FaTwitter,
    FaWallet,
    FaYoutube
} from 'react-icons/fa';
import { useAccount } from 'wagmi';
import nyaxTokensData from '../../nyax-tokens-data.json';
import CryptocurrencyIcon, { type CryptocurrencyIconName } from '../components/CryptocurrencyIcon';

// Dynamic SwapPage component to reduce bundle size
const DynamicSwapPage = () => {
    const [SwapComponent, setSwapComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        import('@/components/SwapCard').then(mod => {
            setSwapComponent(() => mod.default);
        });
    }, []);

    if (!SwapComponent) {
        return (
            <div className="bg-[#222227] rounded-xl p-4 animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return <SwapComponent />;
};

// Chain name mapping utility
const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
        1: 'ethereum',
        56: 'bsc',
        137: 'polygon',
        42161: 'arbitrum',
        10: 'optimism',
        8453: 'base',
        43114: 'avalanche',
        250: 'fantom',
        25: 'cronos',
        100: 'xdai',
        1284: 'moonbeam',
        1285: 'moonriver',
        42220: 'celo',
        1666600000: 'harmony',
        128: 'heco',
        66: 'okex',
        321: 'kcc',
        1313161554: 'aurora',
        2000: 'dogechain',
        199: 'bttc',
        1088: 'metis',
        1101: 'polygon-zkevm',
        324: 'zksync',
        59144: 'linea',
        534352: 'scroll',
        5000: 'mantle',
        7777777: 'zora',
        81457: 'blast',
    };
    return chainNames[chainId] || 'ethereum';
};

const mapChainToIconName = (chain?: string | null): CryptocurrencyIconName => {
    if (!chain) return 'solana';

    switch (chain.toLowerCase()) {
        case 'ethereum':
            return 'ethereum';
        case 'solana':
            return 'solana';
        case 'binance':
        case 'bsc':
            return 'binance';
        case 'polygon':
        case 'matic':
            return 'polygon';
        case 'avalanche':
        case 'avax':
            return 'avalanche';
        case 'base':
            return 'base';
        case 'arbitrum':
            return 'arbitrum';
        case 'optimism':
            return 'optimism';
        case 'abstract':
            return 'abstract';
        case 'balancer':
            return 'balancer';
        case 'cronos':
            return 'cronos';
        case 'hyperevm':
            return 'hyperevm';
        case 'linea':
            return 'linea';
        case 'near':
            return 'near';
        case 'pumpswap':
            return 'pumpswap';
        case 'sonic':
            return 'sonic';
        case 'starknet':
            return 'starknet';
        case 'sui':
            return 'sui';
        case 'sushiswap':
            return 'sushiswap';
        case 'unichain':
            return 'unichain';
        case 'zksync':
            return 'zksync';
        default:
            return 'solana';
    }
};

// Helper function to compare addresses (case-sensitive for Solana, case-insensitive for EVM)
const compareAddresses = (addr1: string, addr2: string, chain?: string): boolean => {
    if (!addr1 || !addr2) return false;

    if (chain === 'solana') {
        // Solana addresses are case-sensitive
        return addr1 === addr2;
    } else {
        // EVM addresses are case-insensitive
        return addr1.toLowerCase() === addr2.toLowerCase();
    }
};

// Helper function to generate DEXTools widget URL
const generateDEXToolsUrl = (address: string, chain: string = 'solana'): string => {
    const baseUrl = 'https://www.dextools.io/widget-chart/en';
    const chainMapping: { [key: string]: string } = {
        'solana': 'solana',
        'ethereum': 'ether',
        'bsc': 'bsc',
        'polygon': 'polygon',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base'
    };

    const mappedChain = chainMapping[chain.toLowerCase()] || 'solana';
    const style = 'pe-light'; // Can be 'pe-light' or 'pe-dark'
    const theme = 'dark'; // Match the app's dark theme

    return `${baseUrl}/${mappedChain}/${style}/${address}?theme=${theme}&chartType=2&chartResolution=30&drawingToolbars=false`;
};

// Helper function to normalize chain IDs for DexScreener compatibility
// DexScreener uses "bsc" instead of "binance"
const normalizeDexScreenerChainId = (chain: string): string => {
    const chainMapping: { [key: string]: string } = {
        'binance': 'bsc',
        'bnb': 'bsc',
        'binance-smart-chain': 'bsc',
    };

    const lowerChain = chain.toLowerCase();
    return chainMapping[lowerChain] || lowerChain;
};

const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Move useSearchParams into a child and wrap with Suspense to satisfy Next.js requirements
function TradePageContent() {
    const searchParams = useSearchParams();
    const baseToken = (searchParams?.get('base') || '').toUpperCase();
    const chainParam = searchParams?.get('chain')?.toLowerCase() || '';
    const addressParam = searchParams?.get('address') || ''; // Preserve case for Solana addresses
    const quoteToken = searchParams?.get('quote') || 'USDT';
    const videoId = searchParams?.get('video') || 'VNTK2Bwyq7s';
    const imageUriParam = searchParams?.get('imageUri') || '';
    const nameParam = searchParams?.get('name') || '';
    const priceParam = searchParams?.get('price') || '';

    // Scroll to top when route changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [baseToken, chainParam, addressParam]);

    return (
        <TradingViewWithParams
            baseToken={baseToken}
            quoteToken={quoteToken}
            chainParam={chainParam}
            addressParam={addressParam}
            videoId={videoId}
            imageUriParam={imageUriParam}
            nameParam={nameParam}
            priceParam={priceParam}
        />
    );
}

export default function Page() {
    return (
        <>

            <Suspense fallback={<div className="p-4 text-white">Loading trade page…</div>}>
                <TradePageContent />
            </Suspense>
        </>
    );
}

// Main component that accepts params directly
function TradingViewWithParams({
    baseToken,
    quoteToken,
    chainParam,
    addressParam,
    videoId,
    imageUriParam,
    nameParam,
    priceParam,
}: {
    baseToken: string;
    quoteToken: string;
    chainParam?: string;
    addressParam?: string;
    videoId?: string;
    imageUriParam?: string;
    nameParam?: string;
    priceParam?: string;
}) {
    const { address, isConnected } = useAccount();
    const [favorited, setFavorited] = useState(false);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState('trades');
    const [dexEmbedUrl, setDexEmbedUrl] = useState<string>('');

    const [transactionDexEmbedUrl, setTransactionDexEmbedUrl] = useState<string>('');
    const [infoDexEmbedUrl, setInfoDexEmbedUrl] = useState<string>('');

    // Iframe load status states
    const [chartIframeLoaded, setChartIframeLoaded] = useState(false);
    const [chartIframeError, setChartIframeError] = useState(false);
    const [tradesIframeLoaded, setTradesIframeLoaded] = useState(false);
    const [tradesIframeError, setTradesIframeError] = useState(false);
    const [infoIframeLoaded, setInfoIframeLoaded] = useState(false);
    const [infoIframeError, setInfoIframeError] = useState(false);
    const [dexScreenerDataExists, setDexScreenerDataExists] = useState<boolean | null>(null);
    // Token pair data state
    const [pairData, setPairData] = useState<TokenPairData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
    const [dexPriceUsd, setDexPriceUsd] = useState<string | null>(null);
    const [dexChange24h, setDexChange24h] = useState<number | null>(null);
    const [priceSource, setPriceSource] = useState<
        'dexscreener' | 'geckoterminal' | 'coingecko' | 'moralis' | null
    >(null);
    const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
    const [userFavorites, setUserFavorites] = useState<any[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

    // Moralis token data state
    const [moralisTokenData, setMoralisTokenData] = useState<any>(null);
    const [isLoadingMoralisData, setIsLoadingMoralisData] = useState(false);

    // Token social links and admin settings state
    const [tokenSocialLinks, setTokenSocialLinks] = useState<{
        imageUri?: string;
        website?: string;
        telegram?: string;
        twitter?: string;
        youtube?: string;
        discord?: string;
        github?: string;
        tokenName?: string;
        tokenSymbol?: string;
        blockchain?: string;
        contractAddress?: string;
    } | null>(null);
    const [adminSocialLinksEnabled, setAdminSocialLinksEnabled] = useState<boolean>(false);
    const [isRegisteredToken, setIsRegisteredToken] = useState<boolean>(false);
    const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
    const [showMoralisChart, setShowMoralisChart] = useState<boolean>(false);
    const [chartType, setChartType] = useState<'dexscreener' | 'moralis'>('dexscreener');
    const [tradeVideos, setTradeVideos] = useState<Array<{
        id: string;
        title: string;
        videoId: string;
        description?: string;
        thumbnailUrl?: string;
    }>>([]);
    const [selectedTradeVideo, setSelectedTradeVideo] = useState<{ id: string; title: string; videoId: string } | null>(null);
    const [tradeVideosLoading, setTradeVideosLoading] = useState<boolean>(false);

    // Use Moralis token metadata hook
    const { metadata: moralisMetadata, loading: metadataLoading, error: metadataError } = useMoralisTokenMetadata(
        addressParam || '',
        chainParam === 'solana' ? 'mainnet' : chainParam || 'mainnet'
    );

    // Use Solana token data hook for Solana tokens
    const {
        tokenData: solanaTokenData,
        chartData: solanaChartData,
        loading: solanaLoading,
        error: solanaError
    } = useSolanaTokenData(
        chainParam === 'solana' && addressParam ? addressParam : null,
        '24h'
    );

    console.log('Solana Tracker', solanaError, solanaTokenData, solanaChartData);

    // Debug log for Solana data
    useEffect(() => {
        if (chainParam === 'solana' && addressParam) {
            console.log('🟣 Solana token data:', {
                loading: solanaLoading,
                error: solanaError,
                tokenData: solanaTokenData,
                chartDataPoints: solanaChartData?.length || 0
            });
        }
    }, [chainParam, addressParam, solanaLoading, solanaError, solanaTokenData, solanaChartData]);


    // Fetch token social links and admin settings with contract address fallback
    useEffect(() => {
        const fetchTokenData = async () => {
            try {
                console.log('🔍 Fetching token data for:', { baseToken, addressParam, chainParam });

                // Check if token is registered and fetch social links by contract address
                if (addressParam) {
                    console.log('📍 Looking up registered token by address:', addressParam);
                    try {
                        const tokenResponse = await fetch(`/api/tokens/by-address/${addressParam}`);

                        if (tokenResponse.ok) {
                            const tokenData = await tokenResponse.json();
                            console.log('✅ Found registered token data:', tokenData);
                            setIsRegisteredToken(true);
                            setTokenSocialLinks({
                                imageUri: tokenData.imageUri,
                                website: tokenData.website,
                                telegram: tokenData.telegram,
                                twitter: tokenData.twitter,
                                youtube: tokenData.youtube,
                                discord: tokenData.discord,
                                github: tokenData.github,
                                tokenName: tokenData.tokenName,
                                tokenSymbol: tokenData.tokenSymbol,
                                blockchain: tokenData.blockchain,
                                contractAddress: tokenData.contractAddress,
                            });
                            setCustomVideoUrl(tokenData.youtube);
                        } else {
                            console.log('⚠️ Token not found by address, trying symbol lookup');
                            throw new Error('Token not found by address');
                        }
                    } catch (err) {
                        console.log('❌ Address lookup failed:', err);
                        // Fallback to symbol lookup
                        await trySymbolLookup();
                    }
                } else {
                    // No address provided, try symbol-based lookup
                    await trySymbolLookup();
                }

                // If we still don't have contract address but have baseToken, try CoinGecko fallback
                if (
                    !addressParam &&
                    baseToken &&
                    baseToken !== 'USDT' &&
                    baseToken !== 'USDC' &&
                    baseToken !== 'ETH' &&
                    baseToken !== 'BTC'
                ) {
                    console.log(`⚠️ No contract address for ${baseToken}, attempting CoinGecko fallback...`);
                    await tryCoingeckoFallback();
                }

                async function trySymbolLookup() {
                    try {
                        const tokenResponse = await fetch(`/api/tokens/by-symbol/${baseToken}`);
                        if (tokenResponse.ok) {
                            const tokenData = await tokenResponse.json();
                            console.log('✅ Found token by symbol:', tokenData);
                            setIsRegisteredToken(true);
                            setTokenSocialLinks({
                                imageUri: tokenData.imageUri,
                                website: tokenData.website,
                                telegram: tokenData.telegram,
                                twitter: tokenData.twitter,
                                youtube: tokenData.youtube,
                                discord: tokenData.discord,
                                github: tokenData.github,
                                tokenName: tokenData.tokenName,
                                tokenSymbol: tokenData.tokenSymbol,
                                blockchain: tokenData.blockchain,
                                contractAddress: tokenData.contractAddress,
                            });
                            setCustomVideoUrl(tokenData.youtube);
                        } else {
                            console.log('⚠️ Token not found by symbol either');
                            setIsRegisteredToken(false);
                            // Use imageUriParam as fallback if available
                            if (imageUriParam) {
                                setTokenSocialLinks({
                                    imageUri: imageUriParam,
                                    tokenName: nameParam || baseToken,
                                    tokenSymbol: baseToken,
                                });
                            } else {
                                setTokenSocialLinks(null);
                            }
                        }
                    } catch (error) {
                        console.log('❌ Symbol lookup failed:', error);
                        setIsRegisteredToken(false);
                        // Use imageUriParam as fallback if available
                        if (imageUriParam) {
                            setTokenSocialLinks({
                                imageUri: imageUriParam,
                                tokenName: nameParam || baseToken,
                                tokenSymbol: baseToken,
                            });
                        } else {
                            setTokenSocialLinks(null);
                        }
                    }
                }

                async function tryCoingeckoFallback() {
                    try {
                        console.log(`🦎 Attempting CoinGecko fallback for ${baseToken}...`);

                        // First search for the coin
                        const searchResponse = await fetch(
                            `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(baseToken)}`,
                            {
                                headers: {
                                    Accept: 'application/json',
                                    'User-Agent': 'NYALTX-Search/1.0',
                                },
                            }
                        );

                        if (searchResponse.ok) {
                            const searchData = await searchResponse.json();
                            const matchingCoin = searchData.coins?.find(
                                (coin: any) => coin.symbol.toLowerCase() === baseToken.toLowerCase()
                            );

                            if (matchingCoin) {
                                console.log(`🎯 Found matching coin: ${matchingCoin.id}`);

                                // Use utility function to fetch contract addresses
                                const contractResult = await fetchContractAddresses(matchingCoin.id);

                                if (contractResult.primaryAddress) {
                                    console.log(`✅ CoinGecko fallback success for ${baseToken}`);

                                    // Log contract address information
                                    logContractAddressInfo(baseToken, contractResult);

                                    // Update URL with found contract address
                                    updateUrlWithContractAddress(contractResult, matchingCoin.id);
                                }
                            }
                        }
                    } catch (error) {
                        console.log(`❌ CoinGecko fallback failed for ${baseToken}:`, error);
                    }
                }

                // Fetch admin settings for social links
                const adminResponse = await fetch('/api/admin/settings');
                if (adminResponse.ok) {
                    const adminData = await adminResponse.json();
                    setAdminSocialLinksEnabled(adminData.socialLinksEnabled || false);
                }
            } catch (error) {
                console.error('❌ Error fetching token data:', error);
                setIsRegisteredToken(false);
                // Use imageUriParam as fallback if available
                if (imageUriParam) {
                    setTokenSocialLinks({
                        imageUri: imageUriParam,
                        tokenName: nameParam || baseToken,
                        tokenSymbol: baseToken,
                    });
                } else {
                    setTokenSocialLinks(null);
                }
            }
        };

        if (addressParam || baseToken) {
            fetchTokenData();
        }
    }, [addressParam, baseToken]);

    useEffect(() => {
        const fetchTradeVideos = async () => {
            try {
                setTradeVideosLoading(true);
                const response = await fetch('/api/trade-videos');
                if (!response.ok) {
                    throw new Error('Failed to load trade videos');
                }
                const data = await response.json();
                if (Array.isArray(data?.videos)) {
                    setTradeVideos(data.videos);
                    if (data.videos.length > 0) {
                        const firstVideo = data.videos[0];
                        setSelectedTradeVideo({
                            id: firstVideo.id,
                            title: firstVideo.title,
                            videoId: firstVideo.videoId,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch trade videos:', error);
            } finally {
                setTradeVideosLoading(false);
            }
        };

        fetchTradeVideos();
    }, []);

    // Fetch user favorites
    useEffect(() => {
        const fetchUserFavorites = async () => {
            if (!isConnected || !address) {
                setUserFavorites([]);
                return;
            }

            setIsLoadingFavorites(true);
            try {
                const response = await fetch(`/api/favorites?wallet=${address}`);
                if (response.ok) {
                    const { favorites } = await response.json();
                    setUserFavorites(favorites.slice(0, 4)); // Limit to 4 items
                }
            } catch (error) {
                console.error('Error fetching user favorites:', error);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        fetchUserFavorites();
    }, [isConnected, address]);

    // Check if token is favorited on component mount
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!isConnected || !address || !addressParam) return;

            try {
                const response = await fetch(`/api/favorites?wallet=${address}`);
                if (response.ok) {
                    const { favorites } = await response.json();
                    const isFavorited = favorites.some(
                        (fav: any) => compareAddresses(fav.token_address, addressParam, chainParam)
                    );
                    setFavorited(isFavorited);
                }
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        checkFavoriteStatus();
    }, [isConnected, address, addressParam]);

    // Fetch comprehensive token data from Moralis
    useEffect(() => {
        const fetchMoralisData = async () => {
            if (!addressParam || !chainParam) return;

            if (!isMoralisSupportedChain(chainParam)) {
                console.log(`⚠️ Chain "${chainParam}" not supported by Moralis for token data`);
                return;
            }

            setIsLoadingMoralisData(true);
            try {
                console.log(`🟣 Fetching comprehensive token data from Moralis for ${chainParam}:${addressParam}`);
                const response = await fetchMoralisTokenData(chainParam, addressParam);

                if (response.success && response.data) {
                    setMoralisTokenData(response.data);
                    console.log('✅ Moralis token data loaded:', response.data);

                    // If we have metadata with logo and no header image yet, use it
                    if (response.data.metadata?.logo && !headerImageUrl) {
                        setHeaderImageUrl(response.data.metadata.logo);
                        console.log('🖼️ Using Moralis logo as header image');
                    }
                } else {
                    console.log('❌ Failed to fetch Moralis token data:', response.error);
                    setMoralisTokenData(null);
                }
            } catch (error) {
                console.error('❌ Error fetching Moralis token data:', error);
                setMoralisTokenData(null);
            } finally {
                setIsLoadingMoralisData(false);
            }
        };

        fetchMoralisData();
    }, [addressParam, chainParam, headerImageUrl]);

    // Handle favorite toggle
    const handleFavorite = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet to add favorites');
            return;
        }

        if (!address || !addressParam) {
            toast.error('Missing wallet or token information');
            return;
        }

        setIsLoadingFavorite(true);

        try {
            const resolvedToken = resolveToken();
            const tokenName = resolvedToken?.name || getCryptoName(baseToken);
            const chainId = chainParam ? getChainId(chainParam) : 1;

            if (favorited) {
                // Remove from favorites
                const response = await fetch(
                    `/api/favorites?wallet=${address}&token=${addressParam}&chain=${chainId}`,
                    {
                        method: 'DELETE',
                    }
                );

                if (response.ok) {
                    setFavorited(false);
                    toast.success('Removed from favorites');
                    // Refresh favorites list
                    const favResponse = await fetch(`/api/favorites?wallet=${address}`);
                    if (favResponse.ok) {
                        const { favorites } = await favResponse.json();
                        setUserFavorites(favorites.slice(0, 4));
                    }
                } else {
                    const { error } = await response.json();
                    toast.error(error || 'Failed to remove favorite');
                }
            } else {
                // Add to favorites
                const imageUri = tokenSocialLinks?.imageUri || headerImageUrl || null;
                const response = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: address,
                        tokenAddress: addressParam,
                        tokenSymbol: baseToken,
                        tokenName: tokenName,
                        chainId: chainId,
                        imageUri: imageUri,
                    }),
                });

                if (response.ok) {
                    setFavorited(true);
                    toast.success('Added to favorites');
                    // Refresh favorites list
                    const favResponse = await fetch(`/api/favorites?wallet=${address}`);
                    if (favResponse.ok) {
                        const { favorites } = await favResponse.json();
                        setUserFavorites(favorites.slice(0, 4));
                    }
                } else {
                    const { error } = await response.json();
                    if (response.status === 409) {
                        toast.error('Token already in favorites');
                    } else {
                        toast.error(error || 'Failed to add favorite');
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Something went wrong');
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    // Helper function to get chain ID from chain parameter
    const getChainId = (chain: string): number => {
        const chainMap: { [key: string]: number } = {
            ethereum: 1,
            polygon: 137,
            bsc: 56,
            arbitrum: 42161,
            optimism: 10,
            avalanche: 43114,
            solana: 101,
        };
        return chainMap[chain.toLowerCase()] || 1;
    };

    // Helper: pick token metadata from catalog
    const resolveToken = React.useCallback(() => {
        const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;

        // If explicit address is provided, resolve by address (and optional chain)
        if (addressParam) {
            const byAddress = list.filter(t => compareAddresses(t.address, addressParam, chainParam));
            if (byAddress.length) {
                if (chainParam) {
                    const byChain = byAddress.find(t => t.chain.toLowerCase() === chainParam.toLowerCase());
                    if (byChain) return byChain;
                }
                return byAddress[0];
            }
        }

        // Fallback: resolve by symbol (as before)
        const symbolMatches = list.filter(t => t.symbol.toUpperCase() === baseToken.toUpperCase());
        if (!symbolMatches.length) return null;
        if (chainParam) {
            const byChain = symbolMatches.find(t => t.chain.toLowerCase() === chainParam.toLowerCase());
            if (byChain) return byChain;
        }
        const eth = symbolMatches.find(t => t.chain === 'ethereum');
        return eth || symbolMatches[0];
    }, [baseToken, chainParam, addressParam]);

    // Map NYAX network labels to our chain slugs
    const mapNetworkToChain = (network: string | null | undefined): string | undefined => {
        if (!network) return undefined;
        const key = network.toLowerCase();
        const mapping: Record<string, string> = {
            ethereum: 'ethereum',
            eth: 'ethereum',
            bsc: 'binance',
            binance: 'binance',
            'binance smart chain': 'binance',
            polygon: 'polygon',
            matic: 'polygon',
            avalanche: 'avalanche',
            avax: 'avalanche',
            arbitrum: 'arbitrum',
            'arbitrum one': 'arbitrum',
            optimism: 'optimism',
            base: 'base',
            fantom: 'fantom',
            solana: 'solana',
        };
        return mapping[key];
    };

    // Resolve NYAX image URL for the current token with GeckoTerminal fallback
    useEffect(() => {
        const fetchHeaderImage = async () => {
            try {
                const nyaxList = (nyaxTokensData as any).tokens as Array<{
                    symbol?: string;
                    network?: string;
                    contractAddress?: string;
                    logo?: string;
                }>;
                if (nyaxList && nyaxList.length > 0) {
                    let found: any = null;
                    if (addressParam) {
                        found = nyaxList.find(t => compareAddresses(t.contractAddress || '', addressParam, chainParam));
                    }
                    if (!found) {
                        const desiredChain = chainParam;
                        found = nyaxList.find(
                            t =>
                                (t.symbol || '').toUpperCase() === baseToken.toUpperCase() &&
                                (!desiredChain || mapNetworkToChain(t.network) === desiredChain)
                        );
                    }

                    // If found in local data, use that
                    if (found?.logo) {
                        setHeaderImageUrl(found.logo);
                        return;
                    }
                }

                // Try GeckoTerminal fallback if we have chain and address
                if (chainParam && addressParam) {
                    console.log(`🔍 Trade Page: Trying GeckoTerminal for token icon ${baseToken}`);
                    try {
                        const iconUrl = await getCryptoIconUrlWithFallback(baseToken, chainParam, addressParam);
                        if (iconUrl && !iconUrl.includes('/crypto-icons/')) {
                            console.log(`✅ Trade Page: Using GeckoTerminal icon for ${baseToken}:`, iconUrl);
                            setHeaderImageUrl(iconUrl);
                            return;
                        }
                    } catch (error) {
                        console.warn('Failed to get icon from GeckoTerminal:', error);
                    }
                }

                // Fallback to local crypto icons
                const fallbackIcon = getCryptoIconUrl(baseToken);
                setHeaderImageUrl(fallbackIcon);
            } catch (e) {
                console.warn('Error fetching header image:', e);
                // Final fallback
                setHeaderImageUrl(getCryptoIconUrl(baseToken));
            }
        };

        fetchHeaderImage();
    }, [baseToken, chainParam, addressParam]);

    // Extract price fetching logic into a reusable function
    const fetchPriceData = React.useCallback(
        async (isManualRefresh = false) => {
            let aborted = false;

            if (isManualRefresh) {
                setIsRefreshingPrice(true);
            }

            try {
                // Don't reset price if DexScreener already set it (unless manual refresh)
                if (!isManualRefresh && priceSource === 'dexscreener' && dexPriceUsd) {
                    console.log('⏭️ Skipping price fetch - DexScreener price already set:', dexPriceUsd);
                    setIsRefreshingPrice(false);
                    return;
                }

                // Reset price data when starting new fetch
                setDexPriceUsd(null);
                setDexChange24h(null);
                setPriceSource(null);

                // Priority 1: Use price from URL parameter if available (from search modal)
                if (priceParam && !isManualRefresh) {
                    const urlPrice = parseFloat(priceParam);
                    if (!isNaN(urlPrice) && urlPrice > 0) {
                        console.log('🎯 Using price from URL parameter:', urlPrice);
                        setDexPriceUsd(urlPrice.toString());
                        setPriceSource('geckoterminal'); // Set a source for consistency
                        return; // Success, use URL price
                    }
                }

                let chain = chainParam;
                let address = addressParam;
                if (!chain || !address) {
                    const t = resolveToken();
                    chain = chain || t?.chain;
                    address = address || t?.address;
                }
                if (!chain || !address) return;

                console.log(
                    `🔄 Fetching price for ${chain}:${address} ${isManualRefresh ? '(Manual Refresh)' : ''}`
                );

                // Special handling for NYAX token - use dedicated API endpoint
                if (isNYAXToken(baseToken, address)) {
                    try {
                        console.log('🟦 Trying NYAX dedicated price API...');
                        const nyaxResponse = await fetchNYAXPrice();
                        if (nyaxResponse.success && nyaxResponse.data) {
                            if (aborted) return;
                            console.log('✅ NYAX API: Price found', nyaxResponse.data.price_usd);
                            setDexPriceUsd(nyaxResponse.data.price_usd);
                            setPriceSource('geckoterminal');
                            const change24h = parseFloat(nyaxResponse.data.price_change_24h);
                            setDexChange24h(isNaN(change24h) ? null : change24h);
                            return; // Success, exit early
                        } else {
                            console.log('❌ NYAX API returned error:', nyaxResponse.error || nyaxResponse.message);
                        }
                    } catch (e) {
                        console.log('❌ NYAX dedicated API failed:', e);
                    }
                }

                // Method 2: Try GeckoTerminal as fallback
                try {
                    console.log('🟩 Trying GeckoTerminal API...');
                    console.log(
                        `🔍 Trade Page: Calling GeckoTerminal with chain="${chain}", address="${address}"`
                    );
                    const geckoData = await geckoTerminalAPI.getTokenPrice(chain, address);
                    if (geckoData && geckoData.price_usd && geckoData.price_usd !== '0') {
                        if (aborted) return;
                        console.log('✅ GeckoTerminal: Price found', geckoData.price_usd);
                        setDexPriceUsd(geckoData.price_usd);
                        setPriceSource('geckoterminal');
                        const change24h = parseFloat(geckoData.price_change_24h);
                        setDexChange24h(isNaN(change24h) ? null : change24h);
                        return; // Success, exit early
                    }
                } catch (e) {
                    console.log('❌ GeckoTerminal failed:', e);
                }

                // Method 3: Try Moralis API as fallback (supports Solana and EVM chains)
                if (isMoralisSupportedChain(chain)) {
                    try {
                        console.log('🟣 Trying Moralis API...');
                        console.log(
                            `🔍 Trade Page: Calling Moralis with chain="${chain}", address="${address}" (case preserved)`
                        );

                        // Use comprehensive token data if available, otherwise fetch price only
                        let moralisResponse;
                        if (moralisTokenData?.price) {
                            console.log('🟣 Using cached Moralis token data for price');
                            moralisResponse = {
                                success: true,
                                data: moralisTokenData.price
                            };
                        } else {
                            moralisResponse = await fetchMoralisTokenPrice(chain, address);
                        }

                        if (moralisResponse.success && moralisResponse.data && moralisResponse.data.usdPrice > 0) {
                            if (aborted) return;
                            console.log('✅ Moralis: Price found', moralisResponse.data.usdPrice);
                            setDexPriceUsd(moralisResponse.data.usdPrice.toString());
                            setPriceSource('moralis');
                            const change24h = moralisResponse.data.usdPrice24hrPercentChange;
                            setDexChange24h(change24h && !isNaN(change24h) ? change24h : null);
                            return; // Success, exit early
                        } else {
                            console.log('❌ Moralis API returned no valid price data:', moralisResponse.error);
                        }
                    } catch (e) {
                        console.log('❌ Moralis failed:', e);
                    }
                } else {
                    console.log(`⚠️ Chain "${chain}" not supported by Moralis API`);
                }

                // Method 4: If all fail, the existing CoinGecko fallback in pairData will be used
                console.log('⚠️ All price APIs failed, falling back to CoinGecko pair data');
            } catch (e) {
                console.error('💥 Price fetching error:', e);
            } finally {
                if (isManualRefresh) {
                    setIsRefreshingPrice(false);
                }
            }

            return () => {
                aborted = true;
            };
        },
        [chainParam, addressParam, resolveToken, baseToken, moralisTokenData, priceParam, priceSource, dexPriceUsd]
    );

    // Manual refresh function
    const handleRefreshPrice = () => {
        fetchPriceData(true);
    };

    // Fetch price data with multiple fallbacks: NYAX -> GeckoTerminal -> Moralis -> CoinGecko
    useEffect(() => {
        fetchPriceData();
    }, [fetchPriceData]);

    // Build dexscreener embed URL for token address
    const buildDexUrl = React.useCallback(() => {
        // If explicit chain/address provided, use them directly
        if (addressParam && chainParam) {
            const normalizedChain = normalizeDexScreenerChainId(chainParam);
            return `https://dexscreener.com/${normalizedChain}/${addressParam}?embed=1&theme=dark&trades=0&info=0`;
        }
        const t = resolveToken();
        if (!t) return '';
        const normalizedChain = normalizeDexScreenerChainId(t.chain);
        return `https://dexscreener.com/${normalizedChain}/${t.address}?embed=1&theme=dark&trades=0&info=0`;
    }, [resolveToken, addressParam, chainParam]);

    const buildTransactionDexUrl = React.useCallback(() => {
        if (addressParam && chainParam) {
            const normalizedChain = normalizeDexScreenerChainId(chainParam);
            return `https://dexscreener.com/${normalizedChain}/${addressParam}?embed=1&theme=dark&chart=0&info=0`;
        }
        const t = resolveToken();
        if (!t) return '';
        const normalizedChain = normalizeDexScreenerChainId(t.chain);
        return `https://dexscreener.com/${normalizedChain}/${t.address}?embed=1&theme=dark&chart=0&info=0`;
    }, [resolveToken, addressParam, chainParam]);

    const buildInfonDexUrl = React.useCallback(() => {
        if (addressParam && chainParam) {
            const normalizedChain = normalizeDexScreenerChainId(chainParam);
            return `https://dexscreener.com/${normalizedChain}/${addressParam}?embed=1&theme=dark&chart=0&trades=0`;
        }
        const t = resolveToken();
        if (!t) return '';
        const normalizedChain = normalizeDexScreenerChainId(t.chain);
        return `https://dexscreener.com/${normalizedChain}/${t.address}?embed=1&theme=dark&chart=0&trades=0`;
    }, [resolveToken, addressParam, chainParam]);

    // Fetch token pair data
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchTokenPairData(baseToken, quoteToken);

                if (isMounted && data) {
                    setPairData(data);
                    // Only set CoinGecko as source if no other price source is available
                    if (!dexPriceUsd) {
                        setPriceSource('coingecko');
                    }
                    setError(null);
                } else if (isMounted) {
                    console.log(
                        `CoinGecko data not available for ${baseToken}/${quoteToken}, will rely on other price sources`
                    );
                    setPairData(null);
                    setError(null); // Don't show error, just rely on other price sources
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error fetching token data');
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
        setDexEmbedUrl(buildDexUrl());
        setTransactionDexEmbedUrl(buildTransactionDexUrl());
        setInfoDexEmbedUrl(buildInfonDexUrl());

        // Set up interval to refresh data every minute
        const intervalId = setInterval(fetchData, 60000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [baseToken, quoteToken, buildDexUrl, buildTransactionDexUrl, buildInfonDexUrl]);

    // Reset iframe states when URLs change
    useEffect(() => {
        // setChartIframeLoaded(false);
        // setChartIframeError(false);
        // setTradesIframeLoaded(false);
        // setTradesIframeError(false);
        // setInfoIframeLoaded(false);
        // setInfoIframeError(false);
        // setDexScreenerDataExists(null);
    }, [dexEmbedUrl, transactionDexEmbedUrl, infoDexEmbedUrl]);

    // Check DexScreener API to see if token data exists
    useEffect(() => {
        // Skip DexScreener check for NYAX token
        // if (baseToken === 'NYAX') {
        //     console.log('⏭️ Skipping DexScreener API check for NYAX token');
        //     return;
        // }

        const checkDexScreenerData = async () => {
            if (addressParam && chainParam) {
                try {
                    const normalizedChain = normalizeDexScreenerChainId(chainParam);
                    const apiUrl = `https://api.dexscreener.com/token-pairs/v1/${normalizedChain}/${addressParam}`;
                    console.log('🔍 Checking DexScreener API:', apiUrl);

                    const response = await fetch(apiUrl);
                    const data = await response.json();

                    if (data && Array.isArray(data) && data.length > 0) {
                        console.log('✅ DexScreener data exists:', data.length, 'pairs found');

                        // Extract priceUsd and imageUrl from first pair (highest priority)
                        const firstPair = data[0];
                        if (firstPair.priceUsd) {
                            setDexPriceUsd(firstPair.priceUsd);
                            setPriceSource('dexscreener');
                            console.log('💰 DexScreener Price USD:', firstPair.priceUsd);
                        }
                        if (firstPair.info?.imageUrl) {
                            setHeaderImageUrl(firstPair.info.imageUrl);
                            console.log('🖼️ DexScreener Image URL:', firstPair.info.imageUrl);
                        }

                        // setDexScreenerDataExists(true);
                        // setInfoIframeError(false);
                        // setChartIframeError(false);
                        // setTradesIframeError(false);
                    } else {
                        console.log('❌ DexScreener returned null/empty - showing fallback widgets');
                        // setDexScreenerDataExists(false);
                        // setInfoIframeError(true);
                        // setChartIframeError(true);
                        // setTradesIframeError(true);
                    }
                } catch (error) {
                    console.error('❌ DexScreener API error:', error);
                    // setDexScreenerDataExists(false);
                    // setInfoIframeError(true);
                    // setChartIframeError(true);
                    // setTradesIframeError(true);
                }
            }
        };

        if (addressParam && chainParam) {
            checkDexScreenerData();
        }
    }, [addressParam, chainParam, baseToken]);

    // Add timeout for info iframe - if it doesn't load within 5 seconds, show InfoWidget
    useEffect(() => {
        if (infoDexEmbedUrl && !infoIframeLoaded && !infoIframeError && dexScreenerDataExists === true) {
            const timeout = setTimeout(() => {
                if (!infoIframeLoaded) {
                    console.log('Info iframe timeout - showing InfoWidget fallback');
                    setInfoIframeError(true);
                }
            }, 5000); // 5 second timeout

            return () => clearTimeout(timeout);
        }
    }, [infoDexEmbedUrl, infoIframeLoaded, infoIframeError, dexScreenerDataExists]);

    // Get TradingView symbol

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="p-2 sm:p-4 text-white min-h-screen" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            {/* Token Header */}
            {/* <Header /> */}
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-4 md:mt-6 lg:mt-8 gap-3 md:gap-4">
                {/* Left Column - Stats and Order Panel */}
                <div className="col-span-1 md:col-span-1 lg:col-span-1 order-2 md:order-1">
                    <div className="bg-[#2222s27] rounded-xl overflow-hidden mb-4" style={{ minHeight: '600px', position: 'relative' }}>
                        {chartType === 'moralis' && addressParam && ['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chainParam || '') ? (
                            <div className="w-full rounded-lg" style={{ maxHeight: '600px', overflow: 'auto' }}>
                                <InfoWidget data={chainParam === 'solana' && solanaTokenData ? solanaTokenData : undefined} />
                            </div>
                        ) : (
                            <iframe
                                src={infoDexEmbedUrl}
                                width="100%"
                                height="600"
                                style={{
                                    border: 0,
                                    display: 'block'
                                }}
                                onLoad={() => setInfoIframeLoaded(true)}
                                onError={() => setInfoIframeError(true)}
                            />
                        )}
                    </div>
                    <DynamicSwapPage />

                </div>

                {/* Middle Column - Chart and Trades */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 order-1 md:order-2">
                    {/* Chart */}
                    <div className="bg-[#222227] shadow-md rounded-xl p-4 mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                            {/* Token Header Bar */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <TokenAvatar
                                    src={
                                        tokenSocialLinks?.imageUri?.replace('gateway.pinata.cloud', 'ipfs.io') ||
                                        moralisTokenData?.metadata?.logo ||
                                        headerImageUrl
                                    }
                                    symbol={baseToken}
                                    name={
                                        tokenSocialLinks?.tokenName ||
                                        moralisTokenData?.metadata?.name ||
                                        getCryptoName(baseToken)
                                    }
                                    size={40}
                                    className="flex-shrink-0"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-semibold">
                                            {tokenSocialLinks?.tokenName ||
                                                moralisTokenData?.metadata?.name ||
                                                getCryptoName(baseToken)}
                                        </h3>

                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {/* {tokenSocialLinks?.tokenSymbol || baseToken}{' '}
                                        <span className="text-gray-500">/</span> {quoteToken} */}
                                        {tokenSocialLinks?.blockchain && (
                                            <span className="ml-2 text-xs bg-[#1a2932] px-2 py-1 rounded capitalize">
                                                {tokenSocialLinks.blockchain}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                                <button
                                    className={`p-2 rounded-full transition-all duration-200 ${favorited
                                        ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                                        : 'text-gray-400 hover:text-white bg-[#1a2932] hover:bg-[#243540]'
                                        } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleFavorite}
                                    disabled={isLoadingFavorite}
                                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <FaStar className={isLoadingFavorite ? 'animate-pulse' : ''} />
                                </button>
                                <button
                                    className="p-2 rounded-full text-gray-400 hover:text-white bg-[#1a2932]"
                                    onClick={() => {
                                        try {
                                            const params = new URLSearchParams();
                                            params.set('base', baseToken);
                                            if (chainParam) params.set('chain', chainParam);
                                            if (addressParam) params.set('address', addressParam);
                                            if (typeof window !== 'undefined') {
                                                const url = `${window.location.origin}/dashboard/trade?${params.toString()}`;
                                                navigator.clipboard?.writeText(url);
                                            }
                                        } catch (e) {
                                            console.error('Failed to copy link', e);
                                        }
                                    }}
                                    title="Copy trade link"
                                >
                                    <FaRegCopy />
                                </button>
                                <div className="ml-2 sm:ml-4 text-right">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="text-lg sm:text-2xl font-bold">
                                            {dexPriceUsd
                                                ? formatCurrency(
                                                    parseFloat(dexPriceUsd),
                                                    'USD',
                                                    parseFloat(dexPriceUsd) < 1 ? 6 : 2
                                                )
                                                : pairData
                                                    ? formatCurrency(pairData.price, 'USD', pairData.price < 1 ? 6 : 2)
                                                    : '$0.00'}
                                        </div>
                                        {/* {priceSource && (
                                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${priceSource === 'dexscreener'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : priceSource === 'geckoterminal'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : priceSource === 'moralis'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {priceSource === 'dexscreener' ? 'DexScreener' :
                                                    priceSource === 'geckoterminal' ? 'GeckoTerminal' :
                                                        priceSource === 'moralis' ? 'Moralis' : 'CoinGecko'}
                                            </div>
                                        )} */}
                                        <button
                                            onClick={handleRefreshPrice}
                                            disabled={isRefreshingPrice}
                                            className={`p-1 rounded-full transition-all duration-200 ${isRefreshingPrice
                                                ? 'text-gray-500 cursor-not-allowed'
                                                : 'text-gray-400 hover:text-[#00b8d8] hover:bg-[#00b8d8]/10'
                                                }`}
                                            title="Refresh price data"
                                        >
                                            <FaSyncAlt className={`text-sm ${isRefreshingPrice ? 'animate-spin' : ''}`} />
                                        </button>
                                        <FaInfoCircle className="text-gray-500" />
                                    </div>
                                    <div
                                        className={`${(dexChange24h ?? pairData?.priceChangePercentage24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}
                                    >
                                        {dexChange24h !== null && dexChange24h !== undefined
                                            ? `${dexChange24h >= 0 ? '+' : ''}${dexChange24h.toFixed(2)}% 24h`
                                            : pairData?.priceChangePercentage24h !== undefined
                                                ? `${pairData.priceChangePercentage24h >= 0 ? '+' : ''}${pairData.priceChangePercentage24h.toFixed(2)}% 24h`
                                                : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Quick Links Row */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 text-gray-300 flex-wrap">
                            {(() => {
                                const t = resolveToken();
                                const pairLink =
                                    addressParam && chainParam
                                        ? `https://dexscreener.com/${chainParam}/${addressParam}`
                                        : t
                                            ? `https://dexscreener.com/${t.chain}/${t.address}`
                                            : '';

                                // Show social links only if token is registered and admin has enabled them
                                const showSocialLinks =
                                    isRegisteredToken && adminSocialLinksEnabled && tokenSocialLinks;

                                return (
                                    <>
                                        {pairLink && (
                                            <a
                                                href={pairLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="View on Dexscreener"
                                            >
                                                <CryptocurrencyIcon name={mapChainToIconName(chainParam)} className='h-4 w-4' />
                                            </a>
                                        )}

                                        {/* Website Link */}
                                        {showSocialLinks && tokenSocialLinks.website ? (
                                            <a
                                                href={tokenSocialLinks.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="Visit Website"
                                            >
                                                <FaGlobe />
                                            </a>
                                        ) : (
                                            <a
                                                className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed"
                                                title="Website (not provided)"
                                            >
                                                <FaGlobe />
                                            </a>
                                        )}

                                        {/* Telegram Link */}
                                        {showSocialLinks && tokenSocialLinks.telegram ? (
                                            <a
                                                href={tokenSocialLinks.telegram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="Join Telegram"
                                            >
                                                <FaTelegram />
                                            </a>
                                        ) : (
                                            <a
                                                className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed"
                                                title="Telegram (not provided)"
                                            >
                                                <FaTelegram />
                                            </a>
                                        )}

                                        {/* Twitter Link */}
                                        {showSocialLinks && tokenSocialLinks.twitter ? (
                                            <a
                                                href={tokenSocialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="Follow on Twitter"
                                            >
                                                <FaTwitter />
                                            </a>
                                        ) : (
                                            <a
                                                className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed"
                                                title="Twitter (not provided)"
                                            >
                                                <FaTwitter />
                                            </a>
                                        )}

                                        {/* YouTube Link (if available) */}
                                        {showSocialLinks && tokenSocialLinks.youtube && (
                                            <a
                                                href={tokenSocialLinks.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="Watch on YouTube"
                                            >
                                                <FaYoutube />
                                            </a>
                                        )}

                                        {/* Discord Link (if available) */}
                                        {showSocialLinks && tokenSocialLinks.discord && (
                                            <a
                                                href={tokenSocialLinks.discord}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="Join Discord"
                                            >
                                                <FaDiscord />
                                            </a>
                                        )}

                                        {/* GitHub Link (if available) */}
                                        {showSocialLinks && tokenSocialLinks.github && (
                                            <a
                                                href={tokenSocialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]"
                                                title="View on GitHub"
                                            >
                                                <FaGithub />
                                            </a>
                                        )}

                                        <button
                                            className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed"
                                            title="More"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Chart Type Toggle */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-gray-400">Chart:</span>
                            <button
                                onClick={() => setChartType('dexscreener')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${chartType === 'dexscreener'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                DexScreener
                            </button>
                            <button
                                onClick={() => setChartType('moralis')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${chartType === 'moralis'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                disabled={!addressParam || !['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chainParam || '')}
                                title={!addressParam ? 'Contract address required for DEXTools charts' : !['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chainParam || '') ? 'DEXTools charts available for Solana, Ethereum, BSC, Polygon, Arbitrum, Optimism, and Base' : ''}
                            >
                                NYALTX Chart
                            </button>
                        </div>

                        {/* Chart Container */}
                        <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg relative">

                            {chartType === 'moralis' && addressParam && ['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chainParam || '') ? (
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex flex-col items-center justify-center p-6">
                                    <FaChartBar className="text-gray-500 text-5xl mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                        Advanced Chart
                                    </h3>
                                    <p className="text-gray-400 text-center text-sm">
                                        Chart visualization temporarily unavailable.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {!dexEmbedUrl || (dexScreenerDataExists === false) || chartIframeError ? (
                                        ['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chainParam || '') && addressParam ? (
                                            <iframe
                                                title="DEXTools Trading Chart"
                                                width="100%"
                                                height="100%"
                                                src={generateDEXToolsUrl(addressParam, chainParam)}
                                                style={{
                                                    border: 0,
                                                    backgroundColor: 'transparent'
                                                }}
                                                className="rounded-lg"
                                                onLoad={() => setChartIframeLoaded(true)}
                                                onError={() => setChartIframeError(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex flex-col items-center justify-center p-6">
                                                <FaChartBar className="text-gray-500 text-5xl mb-3" />
                                                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                                    Chart Unavailable
                                                </h3>
                                                <p className="text-gray-400 text-center text-sm">
                                                    Chart data not available for this token.
                                                </p>
                                            </div>
                                        )
                                    ) : (
                                        <iframe
                                            src={dexEmbedUrl}
                                            width="100%"
                                            height="100%"
                                            style={{
                                                border: 0,
                                                backgroundColor: 'transparent'
                                            }}
                                            className="rounded-lg"
                                            onLoad={() => setChartIframeLoaded(true)}
                                            onError={() => setChartIframeError(true)}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Trades/Info Tabs */}
                    <div className=" rounded-xl overflow-hidden">
                        {/* <div className="flex border-b border-gray-800">
                            <button
                                className={`px-6 py-3 text-sm font-medium ${activeTab === 'trades'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('trades')}
                            >
                                Trades
                            </button>
                        </div> */}


                        {/* <div className="flex justify-between items-center mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="pl-9 pr-4 py-2 bg-[#1a2932] rounded-md text-white w-64 focus:outline-none"
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <button className="p-2 bg-[#1a2932] rounded hover:bg-[#253440]">
                                <FaFilter className="text-gray-400" />
                            </button>
                        </div> */}

                        <div className="overflow-x-auto">
                            <div style={{ backgroundColor: '#0f1923', padding: '0px', borderRadius: '8px', minHeight: '300px' }}>
                                {!transactionDexEmbedUrl || (dexScreenerDataExists === false) || tradesIframeError ? (
                                    <div className="w-full h-[300px] rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex flex-col items-center justify-center p-6">
                                        <FaChartBar className="text-gray-500 text-5xl mb-3" />
                                        <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                            Trades Not Available
                                        </h3>
                                        <p className="text-gray-400 text-center text-sm">
                                            This token is not tracked on DexScreener yet.
                                        </p>
                                    </div>
                                ) : (
                                    <iframe
                                        src={transactionDexEmbedUrl}
                                        width="100%"
                                        height="300"
                                        style={{
                                            border: 0,
                                            display: 'block',
                                            width: '100%'
                                        }}
                                        onLoad={() => setTradesIframeLoaded(true)}
                                        onError={() => setTradesIframeError(true)}
                                    />
                                )}
                            </div>
                        </div>




                    </div>

                    <div className="mt-4">
                        <Faq baseToken={baseToken} quoteToken={quoteToken} />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-1 order-3">
                    {/* <DynamicSwapPage /> */}
                    <div className="bg-[#222227] rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <h2 className="text-base sm:text-lg font-semibold">FAVORITES</h2>
                                <FaInfoCircle className="text-gray-400 ml-2" size={14} />
                            </div>
                            <div className="flex items-center">
                                <button className="p-2 text-gray-400 hover:text-white">
                                    <FaChartBar size={18} />
                                </button>
                                {/* <button className="p-2 text-gray-400 hover:text-white">
                  <FaTimes size={18} />
                </button> */}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
                            <div className="bg-[#1a2932] rounded-md px-3 sm:px-4 py-2 flex-grow sm:mr-2">
                                <div className="flex items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Last added</span>
                                    <FaChevronDown className="ml-1 text-gray-400" size={10} />
                                </div>
                            </div>
                            <div className="bg-[#1a2932] rounded-md px-3 sm:px-4 py-2 w-full sm:w-24">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm sm:text-base">All</span>
                                    <FaChevronDown className="text-gray-400" size={10} />
                                </div>
                            </div>
                        </div>

                        {isLoadingFavorites ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading favorites...</p>
                            </div>
                        ) : userFavorites.length > 0 ? (
                            <div className="space-y-3">
                                {userFavorites.map((favorite, index) => (
                                    <div
                                        key={favorite._id || index}
                                        className="bg-[#1a2932] rounded-lg p-3 hover:bg-[#243540] transition-colors cursor-pointer"
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            params.set('base', favorite.token_symbol);
                                            params.set('address', favorite.token_address);
                                            if (favorite.chain_id !== 1) {
                                                const chainName = getChainName(favorite.chain_id);
                                                if (chainName) params.set('chain', chainName);
                                            }
                                            window.location.href = `/dashboard/trade?${params.toString()}`;
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="mr-3">
                                                    <TokenAvatar
                                                        symbol={favorite.token_symbol}
                                                        name={favorite.token_name}
                                                        size={32}
                                                        className="flex-shrink-0"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-white">{favorite.token_symbol}</span>
                                                        <span className="text-gray-400 ml-2 text-sm">
                                                            / {favorite.token_name}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {getChainName(favorite.chain_id) || 'Ethereum'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <FaStar className="text-yellow-400 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {userFavorites.length >= 4 && (
                                    <div className="text-center pt-2">
                                        <button
                                            onClick={() => (window.location.href = '/dashboard/favorites')}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                                        >
                                            View all favorites →
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : !isConnected ? (
                            <div className="text-center py-8">
                                <FaWallet className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-xl mb-2">Connect your wallet</p>
                                <p className="text-gray-400">Connect your wallet to view your favorite tokens</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaStar className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-xl mb-2">Your favorite list is empty!</p>
                                <p className="text-gray-400">Start building your favorite list by adding tokens.</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <div>
                            <div className="w-full min-h-[250px] sm:min-h-[350px] lg:min-h-[500px] aspect-video">
                                {(() => {
                                    let videoId: string | null = null;
                                    let videoTitle = 'Featured Video';

                                    if (customVideoUrl && isRegisteredToken && adminSocialLinksEnabled) {
                                        videoId = extractYouTubeVideoId(customVideoUrl);
                                        if (videoId) {
                                            videoTitle = `${baseToken} Token Video`;
                                        }
                                    }

                                    if (!videoId && selectedTradeVideo) {
                                        videoId = selectedTradeVideo.videoId;
                                        videoTitle = selectedTradeVideo.title || videoTitle;
                                    }

                                    if (!videoId) {
                                        const defaultVideo = tradeVideos.find(v => v.videoId);
                                        if (defaultVideo) {
                                            videoId = defaultVideo.videoId;
                                            videoTitle = defaultVideo.title || videoTitle;
                                        }
                                    }

                                    if (!videoId) {
                                        videoId = 'z8uiTA1cdWA';
                                        videoTitle = 'NYALTX Overview';
                                    }

                                    return (
                                        <iframe
                                            className="min-h-[250px] sm:min-h-[350px] lg:min-h-[500px] inset-0 w-full h-full rounded-lg"
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                                            title={videoTitle}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />
                                    );
                                })()}
                            </div>
                            {/* <div className="mt-3">
                                {tradeVideosLoading ? (
                                    <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                                        Loading curated videos…
                                    </div>
                                ) : tradeVideos.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-white">Featured Videos</h3>
                                            <span className="text-xs text-gray-500">{tradeVideos.length} video{tradeVideos.length === 1 ? '' : 's'}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {tradeVideos.map(video => {
                                                const isActive = selectedTradeVideo?.id === video.id;
                                                const buttonClasses = isActive
                                                    ? 'border-[#00b8d8]/70 bg-[#00b8d8]/10 text-[#00b8d8] shadow-[0_0_12px_rgba(0,184,216,0.25)]'
                                                    : 'border-gray-700 hover:border-[#00b8d8]/50 text-gray-300 hover:text-white';

                                                return (
                                                    <button
                                                        key={video.id}
                                                        onClick={() => setSelectedTradeVideo({ id: video.id, title: video.title, videoId: video.videoId })}
                                                        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${buttonClasses}`}
                                                    >
                                                        {video.thumbnailUrl ? (
                                                            <img
                                                                src={video.thumbnailUrl}
                                                                alt={video.title}
                                                                className="h-14 w-24 rounded-md object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-14 w-24 rounded-md bg-[#1a2932] flex items-center justify-center text-gray-500 text-xs">
                                                                No Thumbnail
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium truncate">{video.title}</div>
                                                            {video.description && (
                                                                <div className="text-xs text-gray-400 truncate">{video.description}</div>
                                                            )}
                                                        </div>
                                                        {isActive && (
                                                            <span className="text-xs font-semibold text-[#00b8d8] uppercase tracking-wider">Now Playing</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 bg-[#1a2932] border border-gray-800 rounded-lg p-3">
                                        No curated videos available yet. Registered tokens can supply a custom YouTube link from their dashboard.
                                    </div>
                                )}
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #374151',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}
