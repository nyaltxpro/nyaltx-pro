'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { BiArrowBack, BiCopy } from 'react-icons/bi';
import { FiExternalLink } from 'react-icons/fi';
import { PumpFunToken } from '../../../../../types/token';
import TradingViewChart from '../../../../../components/TradingViewChart';

// Function to extract token fields from PumpFun data
function pickTokenFields(ev: any): PumpFunToken {
  const name = ev?.name || ev?.token?.name || ev?.token?.metadata?.name || ev?.metadata?.name;
  const symbol = ev?.symbol || ev?.token?.symbol || ev?.token?.metadata?.symbol || ev?.metadata?.symbol;
  const mint = ev?.mint || ev?.ca || ev?.tokenMint || ev?.token?.mint || ev?.token_address || ev?.address;
  const creator = ev?.creator || ev?.token?.creator || ev?.owner || ev?.creatorAddress;
  const ts = (ev?.timestamp || ev?.blockTime || ev?.ts || (ev?.slot_time ? Date.parse(ev.slot_time) : undefined));
  let image = ev?.logoURI || ev?.token?.metadata?.image || ev?.metadata?.image;
  let uri = ev?.uri || ev?.token?.uri || ev?.metadata_uri;
  
  return { name, symbol, mint, creator, ts, image, uri };
}

// Function to fetch metadata from URI
async function fetchMetadata(tokenData: PumpFunToken): Promise<PumpFunToken> {
  if (!tokenData.uri || typeof tokenData.uri !== 'string') return tokenData;
  
  try {
    const response = await fetch(tokenData.uri);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const metadata = await response.json();
    
    if (metadata.image) {
      let imageUrl = metadata.image;
      
      if (imageUrl.startsWith('ipfs://')) {
        const ipfsHash = imageUrl.replace('ipfs://', '');
        imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      } else if (imageUrl.includes('eu-dev.uxento.io/data/')) {
        if (!imageUrl.startsWith('http')) {
          imageUrl = `https://${imageUrl}`;
        }
      }
      
      tokenData.image = imageUrl;
    }
    
    if (metadata.name && !tokenData.name) tokenData.name = metadata.name;
    if (metadata.symbol && !tokenData.symbol) tokenData.symbol = metadata.symbol;
    
    tokenData.metadataFetched = true;
    
  } catch (error) {
    console.error('Error fetching metadata:', error);
    tokenData.metadataFetched = true;
  }
  
  return tokenData;
}

const TokenDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const mint = params?.mint as string;
  
  const [token, setToken] = useState<PumpFunToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chartSymbol, setChartSymbol] = useState('SOLUSDT');
  const [chartInterval, setChartInterval] = useState('1D');

  useEffect(() => {
    if (!mint) return;

    const fetchTokenData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from PumpFun WebSocket or API
        // For now, we'll create a mock token or try to get it from localStorage/cache
        const mockToken: PumpFunToken = {
          name: "Sample PumpFun Token",
          symbol: "SAMPLE",
          mint: mint,
          creator: "Creator123...",
          ts: Date.now(),
          image: "https://picsum.photos/200",
          uri: undefined
        };
        
        // If we have metadata URI, fetch it
        const enrichedToken = await fetchMetadata(mockToken);
        setToken(enrichedToken);
        
        // Set chart symbol based on token symbol
        if (enrichedToken.symbol) {
          setChartSymbol(`${enrichedToken.symbol}USDT`);
        }
        
      } catch (error) {
        console.error('Error fetching token data:', error);
        // Set a basic token with just the mint
        setToken({
          name: "Unknown Token",
          symbol: "UNKNOWN",
          mint: mint,
          creator: "Unknown",
          ts: Date.now()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [mint]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number | undefined) => {
    if (!ts) return "Unknown";
    return new Date(ts).toLocaleString();
  };

  const truncateAddress = (address: string | undefined, length = 8) => {
    if (!address) return "Unknown";
    return address.length > length * 2 
      ? `${address.slice(0, length)}...${address.slice(-length)}`
      : address;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      {/* <div className="header border-b p-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <BiArrowBack size={24} />
          </button>
          <h1 className="text-xl font-bold">Token Details</h1>
        </div>
      </div> */}

      <div className="max-w-6xl mx-auto p-6">
        {/* Token Header */}
        <div className="card-bg rounded-xl p-6 mb-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-start gap-6">
            {/* Token Image */}
            <div className="flex-shrink-0">
              {token.image ? (
                <img 
                  src={token.image} 
                  alt={token.symbol || 'Token'} 
                  className="w-24 h-24 rounded-full object-cover border-4"
                  style={{ borderColor: 'var(--primary)' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--nitro-color) 100%)',
                    borderColor: 'var(--primary)'
                  }}
                >
                  {token.symbol?.[0] || '?'}
                </div>
              )}
            </div>

            {/* Token Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{token.name || 'Unknown Token'}</h1>
                <span 
                  className="text-white px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  PumpFun
                </span>
              </div>
              
              <div className="text-xl mb-4" style={{ color: 'var(--secondary)' }}>
                ${token.symbol || 'UNKNOWN'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: 'var(--secondary)' }}>Contract Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">{truncateAddress(token.mint)}</span>
                    <button 
                      onClick={() => copyToClipboard(token.mint || '')}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy address"
                    >
                      <BiCopy size={16} />
                    </button>
                    <a 
                      href={`https://solscan.io/token/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="View on Solscan"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Creator</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">{truncateAddress(token.creator)}</span>
                    <button 
                      onClick={() => copyToClipboard(token.creator || '')}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy creator address"
                    >
                      <BiCopy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Created</label>
                  <div className="text-sm mt-1">{formatTime(token.ts)}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="text-sm mt-1">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {token.launched ? 'Launched' : 'Pre-Launch'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => router.push(`/trade?base=${token.symbol}&quote=USDT`)}
            className="btn-primary px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            Trade Token
          </button>
          <button 
            onClick={() => window.open(`https://pump.fun/coin/${token.mint}`, '_blank')}
            className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            View on Pump.fun
          </button>
        </div>

        {/* TradingView Chart Section */}
        <div className="mb-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Price Chart</h3>
              <div className="flex items-center gap-2">
                <select 
                  value={chartInterval}
                  onChange={(e) => setChartInterval(e.target.value)}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                >
                  <option value="1">1m</option>
                  <option value="5">5m</option>
                  <option value="15">15m</option>
                  <option value="30">30m</option>
                  <option value="60">1H</option>
                  <option value="240">4H</option>
                  <option value="1D">1D</option>
                  <option value="1W">1W</option>
                </select>
                <select 
                  value={chartSymbol}
                  onChange={(e) => setChartSymbol(e.target.value)}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                >
                  <option value={`${token.symbol}USDT`}>{token.symbol}/USDT</option>
                  <option value={`${token.symbol}USD`}>{token.symbol}/USD</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-4">
            <TradingViewChart
              symbol={chartSymbol}
              theme="dark"
              width="100%"
              height={500}
              interval={chartInterval}
              allow_symbol_change={true}
              enable_publishing={false}
              container_id={`tradingview-${token.mint}`}
            />
          </div>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="section-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-4">Token Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Name:</span>
                <span>{token.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Symbol:</span>
                <span>{token.symbol || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Mint:</span>
                <span className="font-mono text-sm">{truncateAddress(token.mint, 6)}</span>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-4">Market Data</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Price:</span>
                <span>Loading...</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Market Cap:</span>
                <span>Loading...</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--secondary)' }}>Volume 24h:</span>
                <span>Loading...</span>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <div className="space-y-3">
              <a 
                href={`https://solscan.io/token/${token.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                <FiExternalLink size={16} />
                Solscan
              </a>
              <a 
                href={`https://pump.fun/coin/${token.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-colors"
                style={{ color: 'var(--nitro-color)' }}
              >
                <FiExternalLink size={16} />
                Pump.fun
              </a>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="section-card mb-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-xl font-semibold mb-4">About {token.name || token.symbol}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--primary)' }}>Description</h4>
              <p className="leading-relaxed" style={{ color: 'var(--secondary)' }}>
                {token.name || token.symbol} is a token launched on the Solana blockchain through Pump.fun. 
                This is a community-driven project that aims to provide value to its holders through various 
                mechanisms and utilities. The token represents an innovative approach to decentralized finance 
                and community governance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-purple-400">Token Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Blockchain:</span>
                    <span className="text-green-400">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Standard:</span>
                    <span>SPL Token</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Launch Platform:</span>
                    <span className="text-purple-400">Pump.fun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={token.launched ? "text-green-400" : "text-yellow-400"}>
                      {token.launched ? "Launched" : "Pre-Launch"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-purple-400">Key Features</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Community-driven governance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Decentralized trading on Solana
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Low transaction fees
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Fast transaction processing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Latest News & Updates</h3>
          <div className="space-y-4">
            {/* News Item 1 */}
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Token Launch Announcement</h4>
                <span className="text-xs text-gray-400">{formatTime(token.ts)}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {token.name || token.symbol} has been successfully launched on Pump.fun platform. 
                The token is now available for trading and community participation.
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">Launch</span>
                <span className="text-purple-400 text-xs">Official</span>
              </div>
            </div>

            {/* News Item 2 */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Community Building Phase</h4>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                The project is actively building its community and establishing partnerships 
                within the Solana ecosystem. Join the community to stay updated on developments.
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Community</span>
                <span className="text-blue-400 text-xs">Update</span>
              </div>
            </div>

            {/* News Item 3 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Trading Now Available</h4>
                <span className="text-xs text-gray-400">5 hours ago</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {token.symbol} is now available for trading on decentralized exchanges. 
                Users can buy, sell, and provide liquidity for the token.
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Trading</span>
                <span className="text-green-400 text-xs">Live</span>
              </div>
            </div>

            {/* Load More Button */}
            <div className="text-center pt-4">
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
                Load More News
              </button>
            </div>
          </div>
        </div>

        {/* Copy notification */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDetailPage;
