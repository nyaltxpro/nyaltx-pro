import React, { useEffect, useRef, useState } from 'react';

// Helper functions for token data processing
function formatTime(ts: number | string | undefined) {
  if (!ts) return "";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString();
}

function truncate(s: string | undefined, n = 6) {
  if (!s) return "";
  return s.length > n * 2 ? `${s.slice(0, n)}…${s.slice(-n)}` : s;
}

// Define interface for token data
interface TokenData {
  name?: string;
  symbol?: string;
  mint?: string;
  creator?: string;
  ts?: number;
  image?: string;
  uri?: string;
  metadataFetched?: boolean;
  price?: string;
  change24h?: string;
  chain?: string;
}

function pickTokenFields(ev: any): TokenData {
  // Extract data from nested structures
  const tokenData = ev?.token || ev;
  const metadata = tokenData?.metadata || ev?.metadata || {};
  
  // Extract basic token information
  const name = ev?.name || tokenData?.name || metadata?.name;
  const symbol = ev?.symbol || tokenData?.symbol || metadata?.symbol;
  const mint = ev?.mint || ev?.ca || ev?.tokenMint || tokenData?.mint || ev?.token_address || ev?.address;
  const creator = ev?.creator || tokenData?.creator || ev?.owner || ev?.creatorAddress;
  const ts = (ev?.timestamp || ev?.blockTime || ev?.ts || (ev?.slot_time ? Date.parse(ev.slot_time) : undefined));
  
  // Handle image URLs with more comprehensive extraction
  let image = ev?.logoURI || tokenData?.logoURI || metadata?.image || ev?.image;
  
  // Extract URI for metadata
  let uri = ev?.uri || tokenData?.uri || ev?.metadata_uri;
  
  // Handle different URI formats
  if (uri && typeof uri === 'string') {
    // Handle rapidlaunch.io URIs
    if (!uri.startsWith('http') && (uri.includes('rapidlaunch.io') || uri.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i))) {
      // This looks like a rapidlaunch UUID format
      uri = `https://rapidlaunch.io/temp/metadata/${uri.includes('/') ? uri.split('/').pop() : uri}.json`;
      console.log('Formatted rapidlaunch URI:', uri);
    }
    // Handle EU development URIs
    else if (uri.includes('eu-dev.uxento.io/data/')) {
      if (!uri.startsWith('http')) {
        uri = `https://${uri}`;
        console.log('Formatted EU dev URI:', uri);
      }
    }
    // Handle IPFS URIs
    else if (uri.startsWith('ipfs://')) {
      const ipfsHash = uri.replace('ipfs://', '');
      uri = `https://ipfs.io/ipfs/${ipfsHash}`;
      console.log('Formatted IPFS URI:', uri);
    }
  }
  
  // Handle image URLs directly if present
  if (image && typeof image === 'string') {
    // Handle IPFS image URLs
    if (image.startsWith('ipfs://')) {
      const ipfsHash = image.replace('ipfs://', '');
      image = `https://ipfs.io/ipfs/${ipfsHash}`;
      console.log('Formatted IPFS image URL:', image);
    }
    // Handle EU development image URLs
    else if (image.includes('eu-dev.uxento.io/data/') && !image.startsWith('http')) {
      image = `https://${image}`;
      console.log('Formatted EU dev image URL:', image);
    }
    // Handle relative URLs
    else if (image.startsWith('./') || image.startsWith('/') || !image.includes('://')) {
      // If we have a URI that's a URL, try to resolve relative to that
      if (uri && uri.startsWith('http')) {
        try {
          const baseUrl = new URL(uri);
          baseUrl.pathname = image.startsWith('/') ? image : `/${image}`;
          image = baseUrl.toString();
          console.log('Resolved relative image URL:', image);
        } catch (e) {
          console.error('Failed to resolve relative image URL:', e);
        }
      }
    }
  }
  
  // Return object with URI for async fetching
  return { name, symbol, mint, creator, ts, image, uri };
}

// Function to fetch metadata from URI and update the token data
async function fetchMetadata(tokenData: TokenData): Promise<TokenData> {
  if (!tokenData.uri || typeof tokenData.uri !== 'string') return tokenData;
  
  try {
    console.log('Fetching metadata from URI:', tokenData.uri);
    const response = await fetch(tokenData.uri);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const metadata = await response.json();
    console.log('Metadata fetched:', metadata);
    
    // Update token name and symbol if available in metadata
    if (metadata.name && !tokenData.name) tokenData.name = metadata.name;
    if (metadata.symbol && !tokenData.symbol) tokenData.symbol = metadata.symbol;
    
    // Handle image URL from metadata
    if (metadata.image) {
      let imageUrl = metadata.image;
      
      // Handle different URI formats
      if (imageUrl.startsWith('ipfs://')) {
        const ipfsHash = imageUrl.replace('ipfs://', '');
        imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        console.log('Converted IPFS image URL:', imageUrl);
      } 
      // Handle EU development URIs
      else if (imageUrl.includes('eu-dev.uxento.io/data/')) {
        // Ensure the URL is properly formatted
        if (!imageUrl.startsWith('http')) {
          imageUrl = `https://${imageUrl}`;
          console.log('Formatted EU dev image URL:', imageUrl);
        }
      }
      // Handle relative URLs
      else if (imageUrl.startsWith('./') || imageUrl.startsWith('/') || !imageUrl.includes('://')) {
        // Try to resolve relative to the metadata URI
        try {
          const baseUrl = new URL(tokenData.uri);
          const urlPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          baseUrl.pathname = new URL(urlPath, baseUrl.origin).pathname;
          imageUrl = baseUrl.toString();
          console.log('Resolved relative image URL:', imageUrl);
        } catch (e) {
          console.error('Failed to resolve relative image URL:', e);
        }
      }
      
      tokenData.image = imageUrl;
      console.log('Final image URL set to:', imageUrl);
    }
    
    // Mark as fetched to avoid duplicate requests
    tokenData.metadataFetched = true;
    
  } catch (error) {
    console.error('Error fetching metadata from URI:', tokenData.uri, error);
    // Mark as fetched even on error to prevent retry loops
    tokenData.metadataFetched = true;
  }
  
  return tokenData;
}

interface TokenSectionProps {
  isLoadingTronTokens?: boolean;
  tronTokens?: any[];
  isLoadingEthTokens?: boolean;
  ethTokens?: any[];
  isLoadingBscTokens?: boolean;
  bscTokens?: any[];
}

const TokenSection: React.FC<TokenSectionProps> = ({
  isLoadingTronTokens: initialLoadingTronTokens = false,
  tronTokens: initialTronTokens = [],
  isLoadingEthTokens: initialLoadingEthTokens = false,
  ethTokens: initialEthTokens = [],
  isLoadingBscTokens: initialLoadingBscTokens = false,
  bscTokens: initialBscTokens = []
}) => {
  // WebSocket connection state
  const [connected, setConnected] = useState(false);
  const [messagesPerSec, setMessagesPerSec] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const msgCounter = useRef(0);
  const ticker = useRef<number | null>(null);
  
  // Token state from WebSocket
  const [newTokens, setNewTokens] = useState<any[]>([]);
  const [preLaunched, setPreLaunched] = useState<Record<string, any>>({});
  const [launched, setLaunched] = useState<Record<string, any>>({});
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Combined token state (WebSocket + props)
  const [tronTokens, setTronTokens] = useState<any[]>(initialTronTokens);
  const [ethTokens, setEthTokens] = useState<any[]>(initialEthTokens);
  const [bscTokens, setBscTokens] = useState<any[]>(initialBscTokens);
  
  // Loading states
  const [isLoadingTronTokens, setIsLoadingTronTokens] = useState<boolean>(initialLoadingTronTokens);
  const [isLoadingEthTokens, setIsLoadingEthTokens] = useState<boolean>(initialLoadingEthTokens);
  const [isLoadingBscTokens, setIsLoadingBscTokens] = useState<boolean>(initialLoadingBscTokens);
  
  // Process WebSocket data into token categories
  useEffect(() => {
    // Convert preLaunched object to array and update tronTokens
    const preTokens = Object.values(preLaunched).map((token: any) => {
      const fields = pickTokenFields(token);
      return {
        id: fields.mint || crypto.randomUUID(),
        name: fields.name || 'Unknown',
        symbol: fields.symbol || '???',
        image: fields.image,
        price: '$0.00', // Pre-launched tokens don't have price yet
        change24h: '0.00',
        chain: 'TRX'
      };
    });
    
    // Convert launched object to array and update ethTokens
    const launchTokens = Object.values(launched).map((token: any) => {
      // Use enhanced token data if available, otherwise extract from event
      const fields = token.enhancedToken || pickTokenFields(token.event?.token || token.event || token);
      return {
        id: fields.mint || crypto.randomUUID(),
        name: fields.name || 'Unknown',
        symbol: fields.symbol || '???',
        image: fields.image, // This should now have the properly formatted image URL
        price: '$0.00', // We could add price data if available
        change24h: '0.00',
        chain: 'ETH'
      };
    });
    
    // Convert newTokens array and update bscTokens
    const bscNewTokens = newTokens.slice(0, 5).map((token: any) => {
      // Token data should already be processed by the WebSocket handler
      return {
        id: token.mint || crypto.randomUUID(),
        name: token.name || 'Unknown',
        symbol: token.symbol || '???',
        image: token.image, // This should now have the properly formatted image URL
        price: '$0.00', // New tokens don't have price yet
        change24h: '0.00',
        chain: 'BSC'
      };
    });
    
    // Update token states with WebSocket data
    setTronTokens(prevTokens => {
      // Combine WebSocket data with initial data
      const combinedTokens = [...preTokens, ...prevTokens.filter(t => 
        !preTokens.some(pt => pt.id === t.id)
      )];
      return combinedTokens.slice(0, 10); // Limit to 10 tokens
    });
    
    setEthTokens(prevTokens => {
      const combinedTokens = [...launchTokens, ...prevTokens.filter(t => 
        !launchTokens.some(lt => lt.id === t.id)
      )];
      return combinedTokens.slice(0, 10);
    });
    
    setBscTokens(prevTokens => {
      const combinedTokens = [...bscNewTokens, ...prevTokens.filter(t => 
        !bscNewTokens.some(nt => nt.id === t.id)
      )];
      return combinedTokens.slice(0, 10);
    });
    
  }, [preLaunched, launched, newTokens, lastUpdate]);
  
  // Set up WebSocket connection
  useEffect(() => {
    if (ticker.current) window.clearInterval(ticker.current);
    ticker.current = window.setInterval(() => {
      setMessagesPerSec(msgCounter.current);
      msgCounter.current = 0;
    }, 1000);
    return () => { if (ticker.current) window.clearInterval(ticker.current); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    function connect() {
      const ws = new WebSocket("wss://pumpportal.fun/api/data");
      wsRef.current = ws;
      setIsLoadingTronTokens(true);
      setIsLoadingEthTokens(true);
      setIsLoadingBscTokens(true);
  
      ws.onopen = () => {
        if (cancelled) return;
        console.log("✅ WebSocket connected");
        setConnected(true);
        ws.send(JSON.stringify({ method: "subscribeNewToken" }));
        ws.send(JSON.stringify({ method: "subscribeMigration" }));
      };
  
      ws.onmessage = async (evt) => {
        msgCounter.current += 1;

        try {
          const data = JSON.parse(evt.data);
          setMessagesPerSec((prev) => prev + 1);
            
          // Handle new token events
          if (
            data?.method === "newToken" ||
            data?.type === "newToken" ||
            data?.event === "newToken" ||
            data?.eventType === "newToken" ||
            data?.newToken ||
            (data?.token?.new === true) ||
            (data?.event?.token?.new === true) ||
            (data?.event && typeof data.event === 'object' && data.event.type === 'newToken')
          ) {
            // Extract token data
            let tokenData = pickTokenFields(data.token || data.event?.token || data);
            
            // Fetch metadata if URI exists but no image
            if (tokenData.uri && (!tokenData.image || !tokenData.name) && !tokenData.metadataFetched) {
              console.log('Fetching metadata for new token:', tokenData.mint);
              tokenData = await fetchMetadata(tokenData);
            }
            
            // Add to newTokens if not already present
            setNewTokens((prev) => {
              if (prev.some(t => t.mint === tokenData.mint)) return prev;
              return [tokenData, ...prev].slice(0, 10); // Keep only the 10 most recent
            });
            
            setIsLoadingBscTokens(false);
            setIsLoadingTronTokens(false);
          }
  
          // Handle migration/launch events with more flexible detection
          if (
            data?.method === "migration" ||
            data?.type === "migration" ||
            data?.event === "migration" ||
            data?.eventType === "migration" ||
            data?.migrated ||
            data?.raydiumPool ||
            data?.poolAddress ||
            data?.pool ||
            data?.launched ||
            (data?.token?.launched === true) ||
            (data?.event?.token?.launched === true) ||
            (data?.event && typeof data.event === 'object' && data.event.type === 'migration')
          ) {
            // Extract data from different possible structures
            const eventData = data.event || data;
            const tokenData = eventData.token || eventData;
            
            // Get token fields from the appropriate object
            let tokenFields = pickTokenFields(tokenData);
            
            // Fetch metadata if URI exists but no image
            if (tokenFields.uri && (!tokenFields.image || !tokenFields.name) && !tokenFields.metadataFetched) {
              console.log('Fetching metadata for launched token:', tokenFields.mint);
              tokenFields = await fetchMetadata(tokenFields);
            }
            
            // Generate a consistent key
            const key = tokenFields.mint || 
                      (data?.token?.mint) || 
                      (data?.address) || 
                      crypto.randomUUID();
            
            // Add to launched tokens
            setLaunched((cur) => {
              // Store the enhanced token data with image
              const updated = { ...cur, [key]: { ...data, enhancedToken: tokenFields } };
              return updated;
            });
            
            // Remove from pre-launched if exists
            setPreLaunched((cur) => {
              const copy = { ...cur };
              if (key in copy) {
                delete copy[key];
              }
              return copy;
            });
            
            // Force a re-render by updating timestamp
            setLastUpdate(Date.now());
            setIsLoadingEthTokens(false);
          }
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      };
  
      ws.onclose = () => {
        console.log("⚠️ WebSocket disconnected");
        setConnected(false);
        if (!cancelled) setTimeout(connect, 1200);
      };
    }
  
    connect();
    return () => {
      cancelled = true;
      console.log("🛑 Cleaning up WebSocket");
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);
  
  // Simulate tokens for testing if needed
  const simulateTokens = () => {
    // Create mock tokens for each category
    const mockTronToken = {
      id: `tron-${Date.now()}`,
      name: "TronTest",
      symbol: "TTT",
      image: "https://picsum.photos/200?random=1",
      price: "$0.0045",
      change24h: "12.5",
      chain: "TRX"
    };
    
    const mockEthToken = {
      id: `eth-${Date.now()}`,
      name: "EthTest",
      symbol: "ETT",
      image: "https://picsum.photos/200?random=2",
      price: "$0.0078",
      change24h: "8.3",
      chain: "ETH"
    };
    
    const mockBscToken = {
      id: `bsc-${Date.now()}`,
      name: "BscTest",
      symbol: "BTT",
      image: "https://picsum.photos/200?random=3",
      price: "$0.0023",
      change24h: "-4.2",
      chain: "BSC"
    };
    
    // Add mock tokens to the respective arrays
    setTronTokens(prev => [mockTronToken, ...prev]);
    setEthTokens(prev => [mockEthToken, ...prev]);
    setBscTokens(prev => [mockBscToken, ...prev]);
  };
  // Add a small connection status indicator
  const connectionStatus = (
    <div className="text-xs mb-2 flex items-center gap-2">
      <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="opacity-70">{connected ? `Connected (${messagesPerSec}/s)` : 'Connecting...'}</span>
    </div>
  );
  
  return (
    <div>
      {/* WebSocket connection status indicator */}
      <div className="flex justify-end mb-2">
        {connectionStatus}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* NEW Category */}
      <div className="border border-[#23323c] rounded-lg overflow-hidden">
        <div className="flex items-center p-3 border-b border-gray-800">
          <div className="flex items-center">
            <span className="text-white font-bold mr-2">🆕 NEW</span>
            <span className="text-xs text-blue-400 ml-2">Tron</span>
          </div>
        </div>
        
        {isLoadingTronTokens ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading tokens...</p>
          </div>
        ) : tronTokens && tronTokens.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {tronTokens.map((token, index) => (
              <div key={token.id || index} className="p-3 border-b border-gray-800 hover:bg-gray-800/30">
                <div className="flex items-center">
                  {token.image ? (
                    <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      {token.symbol?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{token.name || 'Unknown Token'}</h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{token.symbol || '???'}</span>
                      {token.price && (
                        <span className="ml-2">${parseFloat(token.price).toFixed(6)}</span>
                      )}
                    </div>
                  </div>
                  {token.change24h && (
                    <span className={`ml-auto text-sm ${parseFloat(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(token.change24h) >= 0 ? '+' : ''}{parseFloat(token.change24h).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">No tokens found</div>
        )}
      </div>

      {/* HOT Category */}
      <div className="border border-[#23323c] rounded-lg overflow-hidden">
        <div className="flex items-center p-3 border-b border-gray-800">
          <div className="flex items-center">
            <span className="text-white font-bold mr-2">🔥 HOT</span>
            <span className="text-xs text-green-400 ml-2">Ethereum</span>
          </div>
        </div>
        
        {isLoadingEthTokens ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading tokens...</p>
          </div>
        ) : ethTokens && ethTokens.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {ethTokens.map((token, index) => (
              <div key={token.id || index} className="p-3 border-b border-gray-800 hover:bg-gray-800/30">
                <div className="flex items-center">
                  {token.image ? (
                    <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      {token.symbol?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{token.name || 'Unknown Token'}</h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{token.symbol || '???'}</span>
                      {token.price && (
                        <span className="ml-2">${parseFloat(token.price).toFixed(6)}</span>
                      )}
                    </div>
                  </div>
                  {token.change24h && (
                    <span className={`ml-auto text-sm ${parseFloat(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(token.change24h) >= 0 ? '+' : ''}{parseFloat(token.change24h).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">No tokens found</div>
        )}
      </div>

      {/* TRENDING Category */}
      <div className="border border-[#23323c] rounded-lg overflow-hidden">
        <div className="flex items-center p-3 border-b border-gray-800">
          <div className="flex items-center">
            <span className="text-white font-bold mr-2">📈 TRENDING</span>
            <span className="text-xs text-yellow-400 ml-2">BSC</span>
          </div>
        </div>
        
        {isLoadingBscTokens ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading tokens...</p>
          </div>
        ) : bscTokens && bscTokens.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {bscTokens.map((token, index) => (
              <div key={token.id || index} className="p-3 border-b border-gray-800 hover:bg-gray-800/30">
                <div className="flex items-center">
                  {token.image ? (
                    <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      {token.symbol?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{token.name || 'Unknown Token'}</h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{token.symbol || '???'}</span>
                      {token.price && (
                        <span className="ml-2">${parseFloat(token.price).toFixed(6)}</span>
                      )}
                    </div>
                  </div>
                  {token.change24h && (
                    <span className={`ml-auto text-sm ${parseFloat(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(token.change24h) >= 0 ? '+' : ''}{parseFloat(token.change24h).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">No tokens found</div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TokenSection;
