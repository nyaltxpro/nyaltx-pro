'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";

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
}

function pickTokenFields(ev: any): TokenData {
  const name = ev?.name || ev?.token?.name || ev?.token?.metadata?.name || ev?.metadata?.name;
  const symbol = ev?.symbol || ev?.token?.symbol || ev?.token?.metadata?.symbol || ev?.metadata?.symbol;
  const mint = ev?.mint || ev?.ca || ev?.tokenMint || ev?.token?.mint || ev?.token_address || ev?.address;
  const creator = ev?.creator || ev?.token?.creator || ev?.owner || ev?.creatorAddress;
  const ts = (ev?.timestamp || ev?.blockTime || ev?.ts || (ev?.slot_time ? Date.parse(ev.slot_time) : undefined));
  let image = ev?.logoURI || ev?.token?.metadata?.image || ev?.metadata?.image;
  let uri = ev?.uri || ev?.token?.uri || ev?.metadata_uri;
  
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
  }
  
  // Handle image URLs directly if present
  if (image && typeof image === 'string') {
    if (image.includes('eu-dev.uxento.io/data/') && !image.startsWith('http')) {
      image = `https://${image}`;
      console.log('Formatted EU dev image URL:', image);
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
    
    if (metadata.image) {
      let imageUrl = metadata.image;
      
      // Handle different URI formats
      if (imageUrl.startsWith('ipfs://')) {
        const ipfsHash = imageUrl.replace('ipfs://', '');
        imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      } 
      // Handle EU development URIs
      else if (imageUrl.includes('eu-dev.uxento.io/data/')) {
        console.log('Detected EU development URI:', imageUrl);
        // Ensure the URL is properly formatted
        if (!imageUrl.startsWith('http')) {
          imageUrl = `https://${imageUrl}`;
        }
      }
      
      tokenData.image = imageUrl;
      console.log('Final image URL:', imageUrl);
    }
    
    if (metadata.name && !tokenData.name) tokenData.name = metadata.name;
    if (metadata.symbol && !tokenData.symbol) tokenData.symbol = metadata.symbol;
    
    // Mark as fetched to avoid duplicate requests
    tokenData.metadataFetched = true;
    
  } catch (error) {
    console.error('Error fetching metadata from URI:', tokenData.uri, error);
    // Mark as fetched even on error to prevent retry loops
    tokenData.metadataFetched = true;
  }
  
  return tokenData;
}

const Row: React.FC<{ item: any; onInspect: (o: any) => void }> = ({ item, onInspect }) => {
  // Extract token data from potentially nested structures
  const extractTokenData = (data: any): any => {
    // Handle different data structures
    if (data?.event?.token) return data.event.token;
    if (data?.token) return data.token;
    if (data?.event) return data.event;
    return data;
  };
  
  const [tokenData, setTokenData] = useState<TokenData>(() => {
    const extractedData = extractTokenData(item);
    return pickTokenFields(extractedData);
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug the token data
  useEffect(() => {
    console.log('Row mounted with item:', item);
    console.log('Extracted token data:', tokenData);
  }, []);
  
  // Fetch metadata when component mounts if URI is available
  useEffect(() => {
    const loadMetadata = async () => {
      if (tokenData.uri && !tokenData.metadataFetched) {
        setIsLoading(true);
        try {
          const updatedData = await fetchMetadata({...tokenData});
          updatedData.metadataFetched = true;
          setTokenData(updatedData);
        } catch (error) {
          console.error('Error loading metadata:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadMetadata();
  }, [tokenData.uri]);
  
  return (
    <div className="grid grid-cols-6 gap-2 items-center border-b border-gray-700 py-2">
      <div className="flex items-center gap-2 col-span-6 truncate" title={tokenData.name || ""}>
        {isLoading ? (
          <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse"></div>
        ) : tokenData.image ? (
          <img src={tokenData.image} alt={tokenData.symbol || "icon"} className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs">{tokenData.symbol?.[0] || '?'}</div>
        )}
        <span className="font-medium truncate">{tokenData.name || "—"}</span>
        <div className="text-sm opacity-80">{tokenData.symbol || "—"}</div>
        <button onClick={() => onInspect(item)} className="col-span-6 mt-2 text-xs px-2 py-1 rounded bg-cyan-400 hover:bg-gray-700 w-max">Trade</button>
        <div className="text-xs text-right opacity-60">{formatTime(tokenData.ts)}</div>
     
      </div>
     
      {/* <div className="text-xs font-mono opacity-80" title={tokenData.mint || ""}>{truncate(tokenData.mint, 8)}</div>
      <div className="text-xs font-mono opacity-60" title={tokenData.creator || ""}>{truncate(tokenData.creator, 6)}</div>
      */}
      <button onClick={() => onInspect(item)} className="col-span-1 mt-2 text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 w-max">Details</button>

   
    </div>
  );
};

export default function PumpPortalSimpleUI() {
  const [connected, setConnected] = useState(false);
  const [messagesPerSec, setMessagesPerSec] = useState(0);
  const [newTokens, setNewTokens] = useState<any[]>([]);
  const [preLaunched, setPreLaunched] = useState<Record<string, any>>({});
  const [launched, setLaunched] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState("");
  const [inspect, setInspect] = useState<any | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const msgCounter = useRef(0);
  const ticker = useRef<number | null>(null);
  
  // Function to simulate a launched token (for testing)
  const simulateLaunchedToken = () => {
    const mockToken = {
      method: "migration",
      event: {
        type: "migration",
        token: {
          mint: `mock-${Date.now()}`,
          name: "Mock Token",
          symbol: "MOCK",
          creator: "mockCreator123",
          timestamp: Date.now(),
          image: "https://picsum.photos/200", // Direct image URL for testing
          uri: "https://ipfs.io/ipfs/bafkreidpz3m4tbc7yicftzin4u3wdbq5dxwomwt36lviaswlacbczwfcky"
        },
        poolAddress: "mockPool123"
      }
    };
    
    console.log("🧪 Simulating launched token:", mockToken);
    
    // Process the mock token as if it came from websocket
    const tokenFields = pickTokenFields(mockToken.event.token);
    const key = tokenFields.mint || crypto.randomUUID();
    
    // Add to launched tokens
    setLaunched(cur => {
      console.log("📊 Current launched tokens before adding mock:", Object.keys(cur).length);
      const updated = { ...cur, [key]: mockToken };
      console.log("📈 Updated launched tokens:", Object.keys(updated).length);
      return updated;
    });
    
    // Force a re-render by updating a timestamp
    setLastUpdate(Date.now());
  };
  
  // Function to simulate a pre-launched token (for testing)
  const simulatePreLaunchedToken = () => {
    const mockToken = {
      method: "newToken",
      name: "Pre-Launch Test",
      symbol: "PRE",
      mint: `pre-${Date.now()}`,
      creator: "testCreator",
      timestamp: Date.now(),
      image: "https://picsum.photos/200?random=1", // Direct image URL for testing
      uri: "https://rapidlaunch.io/temp/metadata/62c2c4fc-e327-47ea-9c2a-a87ae4557142.json"
    };
    
    console.log("💼 Simulating pre-launched token:", mockToken);
    
    // Process the mock token
    const tokenFields = pickTokenFields(mockToken);
    const key = tokenFields.mint || crypto.randomUUID();
    
    // Add to pre-launched tokens
    setPreLaunched(cur => {
      console.log("📊 Current pre-launched tokens before adding mock:", Object.keys(cur).length);
      const updated = { ...cur, [key]: mockToken };
      console.log("📈 Updated pre-launched tokens:", Object.keys(updated).length);
      return updated;
    });
    
    // Also add to new tokens list
    setNewTokens(cur => [mockToken, ...cur].slice(0, 200));
    
    // Force a re-render by updating a timestamp
    setLastUpdate(Date.now());
  };

  const preList = useMemo(() => Object.values(preLaunched), [preLaunched, lastUpdate]);
  const launchedList = useMemo(() => Object.values(launched), [launched, lastUpdate]);
  
  // Debug the current state of tokens
  useEffect(() => {
    console.log("🔄 Launched tokens updated:", Object.keys(launched).length);
    console.log("📋 Launched list updated:", launchedList.length);
  }, [launched, launchedList]);
  
  useEffect(() => {
    console.log("📝 Pre-launched tokens updated:", Object.keys(preLaunched).length);
    console.log("📚 Pre-launched list updated:", preList.length);
    console.log("🔎 Pre-launched data:", preLaunched);
  }, [preLaunched, preList]);

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
  
      ws.onopen = () => {
        if (cancelled) return;
        console.log("✅ WebSocket connected");
        setConnected(true);
        ws.send(JSON.stringify({ method: "subscribeNewToken" }));
        ws.send(JSON.stringify({ method: "subscribeMigration" }));
      };
  
      ws.onmessage = async (evt) => {
        msgCounter.current += 1;
        console.log("📩 Raw message:", evt.data); // log raw event
  
        try {
          const data = JSON.parse(evt.data as any);
          console.log("🔍 Parsed message:", data); // log parsed data
  
          if (
            data?.method === "newToken" ||
            data?.type === "newToken" ||
            data?.eventType === "newToken" ||
            data?.name ||
            data?.token ||
            data?.mint
          ) {
            console.log("🆕 New Token Event:", data);
            
            // Extract token fields and add to new tokens list
            const tokenFields = pickTokenFields(data);
            const key = tokenFields.mint || crypto.randomUUID();
            
            // Always add to new tokens list to avoid duplicates
            console.log("✨ Processing new token:", tokenFields.name || tokenFields.symbol || tokenFields.mint);
            
            // Add to new tokens list, avoiding duplicates by mint address
            setNewTokens((cur) => {
              // Check if this token already exists in our list
              const isDuplicate = cur.some(token => {
                const existingFields = pickTokenFields(token);
                return existingFields.mint === tokenFields.mint && tokenFields.mint;
              });
              
              if (isDuplicate) {
                console.log("❗ Duplicate token in newTokens, not adding again:", tokenFields.mint);
                return cur;
              }
              
              console.log("✨ Adding new token to list");
              return [data, ...cur].slice(0, 200);
            });
            
            // Always update pre-launched tokens
            if (tokenFields.mint) {
              console.log("📝 Adding/updating token in pre-launched:", tokenFields.mint);
              setPreLaunched((cur) => {
                // Force update with the latest data
                const updated = { ...cur, [key]: data };
                // Force a re-render
                setLastUpdate(Date.now());
                return updated;
              });
            } else {
              console.log("⚠️ Token has no mint address, cannot add to pre-launched");
            }
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
            console.log("🚀 Migration/Launch Event:", data);
            
            // Extract data from different possible structures
            const eventData = data.event || data;
            const tokenData = eventData.token || eventData;
            
            // Get token fields from the appropriate object
            const tokenFields = pickTokenFields(tokenData);
            
            // Generate a consistent key
            const key = tokenFields.mint || 
                      (data?.token?.mint) || 
                      (data?.address) || 
                      crypto.randomUUID();
            
            console.log("🔑 Using key for launched token:", key);
            
            // Add to launched tokens
            setLaunched((cur) => {
              console.log("📊 Current launched tokens:", Object.keys(cur).length);
              const updated = { ...cur, [key]: data };
              console.log("📈 Updated launched tokens count:", Object.keys(updated).length);
              return updated;
            });
            
            // Remove from pre-launched if exists
            setPreLaunched((cur) => {
              const copy = { ...cur };
              if (key in copy) {
                console.log("🔄 Moving token from pre-launched to launched:", key);
                delete copy[key];
              }
              return copy;
            });
            
            // Force a re-render by updating timestamp
            setLastUpdate(Date.now());
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
  

  const filtered = (items: any[]) => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const f = pickTokenFields(it.event || it);
      return (
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.symbol && f.symbol.toLowerCase().includes(q)) ||
        (f.mint && String(f.mint).toLowerCase().includes(q))
      );
    });
  };

  return (
    <div className=" text-gray-100">
      <div className=" mx-auto px-2 py-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
              <p className={`text-xs mt-1 ${connected ? "text-green-400" : "text-red-400"}`}>
              WebSocket: {connected ? "connected" : "disconnected"} · {messagesPerSec} msg/s
            </p>
          </div>
        
        </header>

        <main className="grid md:grid-cols-3 gap-6 mt-6">
          <section className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
            <h2 className="text-lg font-semibold mb-3">
              New 
              <span className="text-xs ml-2 text-gray-400">{newTokens.length} tokens</span>
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
              {filtered(newTokens).map((it, idx) => {
                // Use mint as key to prevent duplicate rendering
                const tokenFields = pickTokenFields(it.event?.token || it.event || it);
                const key = tokenFields.mint || `new-${idx}-${Math.random()}`;
                return <Row key={key} item={it} onInspect={setInspect} />;
              })}
              {newTokens.length === 0 && <p className="text-sm opacity-60">Listening for new tokens…</p>}
            </div>
          </section>

          <section className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
            <h2 className="text-lg font-semibold mb-3">
              Pre‑launched 
              <span className="text-xs ml-2 text-gray-400">{Object.keys(preLaunched).length} tokens</span>
              <button 
                onClick={() => console.log('Pre-launched tokens:', preLaunched, 'List:', preList)}
                className="text-xs ml-2 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
                title="Log pre-launched tokens to console"
              >
                Debug
              </button>
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
              {preList.length > 0 ? (
                filtered(preList).map((it: any, index: number) => {
                  const tokenFields = pickTokenFields(it.event?.token || it.event || it);
                  const key = tokenFields.mint || `pre-${index}-${Math.random()}`;
                  return <Row key={key} item={it} onInspect={setInspect} />;
                })
              ) : (
                <p className="text-sm opacity-60">Waiting for creations…</p>
              )}
            </div>
          </section>

          <section className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
            <h2 className="text-lg font-semibold mb-3">
              Launched 
              <span className="text-xs ml-2 text-gray-400">{Object.keys(launched).length} tokens</span>
              <button 
                onClick={() => console.log('Launched tokens:', launched, 'List:', launchedList)}
                className="text-xs ml-2 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
                title="Log launched tokens to console"
              >
                Debug
              </button>
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
              {launchedList.length > 0 ? (
                filtered(launchedList).map((it: any, index: number) => {
                  // Extract the appropriate data structure for the Row component
                  const tokenFields = pickTokenFields(it.event?.token || it.event || it);
                  const key = tokenFields.mint || `launched-${index}-${Math.random()}`;
                  return <Row key={key} item={it} onInspect={setInspect} />;
                })
              ) : (
                <div>
                  <p className="text-sm opacity-60 mb-2">Listening for migrations... Click "Test Launch" to add a test token.</p>
                  <button
                    onClick={simulateLaunchedToken}
                    className="text-xs px-3 py-1 rounded-xl bg-green-800 border border-green-700 hover:bg-green-700"
                  >
                    Add Test Token
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>

        {inspect && (
          <div className="fixed inset-0  backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Raw event JSON</h3>
                <button onClick={() => setInspect(null)} className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700">Close</button>
              </div>
              <pre className="text-xs overflow-auto max-h-[70vh] whitespace-pre-wrap break-words">
                {JSON.stringify(inspect, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* <footer className="text-xs opacity-60 mt-8">
          Data via PumpPortal websocket. To stream PumpSwap data, connect with an API key as a query parameter. This demo only listens and does not trade.
        </footer> */}
      </div>
    </div>
  );
}
