'use client';
import { useChainFilter } from '@/hooks/useChainFilter';
import * as Avatar from '@radix-ui/react-avatar';
import { InfoCircledIcon, RocketIcon, UpdateIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChainFilterIndicator from './ChainFilterIndicator';
import CryptocurrencyIcon from './CryptocurrencyIcon';

function formatTime(ts: number | string | undefined) {
  if (!ts) return '';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString();
}

function truncate(s: string | undefined, n = 6) {
  if (!s) return '';
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
  const symbol =
    ev?.symbol || ev?.token?.symbol || ev?.token?.metadata?.symbol || ev?.metadata?.symbol;
  const mint =
    ev?.mint || ev?.ca || ev?.tokenMint || ev?.token?.mint || ev?.token_address || ev?.address;
  const creator = ev?.creator || ev?.token?.creator || ev?.owner || ev?.creatorAddress;
  const ts =
    ev?.timestamp ||
    ev?.blockTime ||
    ev?.ts ||
    (ev?.slot_time ? Date.parse(ev.slot_time) : undefined);
  let image = ev?.logoURI || ev?.token?.metadata?.image || ev?.metadata?.image;
  let uri = ev?.uri || ev?.token?.uri || ev?.metadata_uri;

  // Handle different URI formats
  if (uri && typeof uri === 'string') {
    // Handle rapidlaunch.io URIs
    if (
      !uri.startsWith('http') &&
      (uri.includes('rapidlaunch.io') ||
        uri.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i))
    ) {
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

    // Use our API proxy to avoid CORS issues
    const proxyUrl = `/api/metadata?uri=${encodeURIComponent(tokenData.uri)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch: ${response.status} - ${errorData.error || 'Unknown error'}`
      );
    }

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
          const updatedData = await fetchMetadata({ ...tokenData });
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

  const router = useRouter();

  const handleClick = (t: any) => {
    const params = new URLSearchParams();
    params.set('base', (t.symbol || t.name || '').toUpperCase());
    params.set('chain', 'solana');
    if (t.mint) params.set('address', t.mint);
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="group relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4aa]/20 via-[#3b82f6]/20 to-[#f59e0b]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

      <div className="relative bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-gray-700/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Avatar.Root className="w-full h-full">
                {isLoading ? (
                  <div className="w-full h-full bg-gray-700/50  rounded-md animate-pulse"></div>
                ) : tokenData.image ? (
                  <Avatar.Image
                    src={tokenData.image}
                    alt={tokenData.symbol || 'icon'}
                    className="w-full h-full object-cover shadow-md rounded-md"
                  />
                ) : (
                  <Avatar.Fallback className="w-full h-full border-dashed border-gray-500 border flex items-center justify-center text-white font-bold text-sm rounded-md">
                    {tokenData.symbol?.[0] || '?'}
                  </Avatar.Fallback>
                )}
              </Avatar.Root>

              {/* PumpSap icon overlay */}
              <CryptocurrencyIcon className='absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full  shadow-md' name={'pumpswap'} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {tokenData.name || '—'}
                </h4>
                <span className="px-2 py-1 bg-gray-800/50 rounded-md text-xs font-mono text-gray-300" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                  {tokenData.symbol || '—'}
                </span>
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {formatTime(tokenData.ts)}
              </div>
              <div className="px-2 py-1  rounded-md text-xs font-mono text-gray-300" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                {tokenData.mint
                  ? `${tokenData.mint.slice(0, 4)}...${tokenData.mint.slice(-4)}`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => handleClick(tokenData)}
                  className="px-3 py-2 border-gradient-to-r from-[#00d4aa] to-[#00b894] border text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00d4aa]/25 flex items-center gap-1"
                  style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                >
                  <CryptocurrencyIcon className='h-4 w-4' name={'solana'} />
                  Trade
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                  View token details
                  <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => onInspect(item)}
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
                >
                  <InfoCircledIcon className="w-4 h-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                  View raw data
                  <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PumpPortalSimpleUI() {
  const [connected, setConnected] = useState(false);
  const [messagesPerSec, setMessagesPerSec] = useState(0);
  const [newTokens, setNewTokens] = useState<any[]>([]);
  const [preLaunched, setPreLaunched] = useState<Record<string, any>>({});
  const [launched, setLaunched] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState('');
  const [inspect, setInspect] = useState<any | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const msgCounter = useRef(0);
  const ticker = useRef<number | null>(null);

  // Function to simulate a launched token (for testing)
  const simulateLaunchedToken = () => {
    const mockToken = {
      method: 'migration',
      event: {
        type: 'migration',
        token: {
          mint: `mock-${Date.now()}`,
          name: 'Mock Token',
          symbol: 'MOCK',
          creator: 'mockCreator123',
          timestamp: Date.now(),
          image: 'https://picsum.photos/200', // Direct image URL for testing
          uri: 'https://ipfs.io/ipfs/bafkreidpz3m4tbc7yicftzin4u3wdbq5dxwomwt36lviaswlacbczwfcky',
        },
        poolAddress: 'mockPool123',
      },
    };

    console.log('🧪 Simulating launched token:', mockToken);

    // Process the mock token as if it came from websocket
    const tokenFields = pickTokenFields(mockToken.event.token);
    const key = tokenFields.mint || crypto.randomUUID();

    // Add to launched tokens
    setLaunched(cur => {
      console.log('📊 Current launched tokens before adding mock:', Object.keys(cur).length);
      const updated = { ...cur, [key]: mockToken };
      console.log('📈 Updated launched tokens:', Object.keys(updated).length);
      return updated;
    });

    // Force a re-render by updating a timestamp
    setLastUpdate(Date.now());
  };

  // Function to simulate a pre-launched token (for testing)
  const simulatePreLaunchedToken = () => {
    const mockToken = {
      method: 'newToken',
      name: 'Pre-Launch Test',
      symbol: 'PRE',
      mint: `pre-${Date.now()}`,
      creator: 'testCreator',
      timestamp: Date.now(),
      image: 'https://picsum.photos/200?random=1', // Direct image URL for testing
      uri: 'https://rapidlaunch.io/temp/metadata/62c2c4fc-e327-47ea-9c2a-a87ae4557142.json',
    };

    console.log('💼 Simulating pre-launched token:', mockToken);

    // Process the mock token
    const tokenFields = pickTokenFields(mockToken);
    const key = tokenFields.mint || crypto.randomUUID();

    // Add to pre-launched tokens
    setPreLaunched(cur => {
      console.log('📊 Current pre-launched tokens before adding mock:', Object.keys(cur).length);
      const updated = { ...cur, [key]: mockToken };
      console.log('📈 Updated pre-launched tokens:', Object.keys(updated).length);
      return updated;
    });

    // Also add to new tokens list
    setNewTokens(cur => [mockToken, ...cur].slice(0, 200));

    // Force a re-render by updating a timestamp
    setLastUpdate(Date.now());
  };

  const preList = useMemo(() => Object.values(preLaunched), [preLaunched, lastUpdate]);
  const launchedList = useMemo(() => Object.values(launched), [launched, lastUpdate]);

  // Apply chain filtering to token lists
  const filteredNewTokens = useChainFilter(newTokens, {
    chainField: 'blockchain',
    includeUnknown: true,
  });
  const filteredPreList = useChainFilter(preList, {
    chainField: 'blockchain',
    includeUnknown: true,
  });
  const filteredLaunchedList = useChainFilter(launchedList, {
    chainField: 'blockchain',
    includeUnknown: true,
  });

  // Debug the current state of tokens
  useEffect(() => {
    console.log('🔄 Launched tokens updated:', Object.keys(launched).length);
    console.log('📋 Launched list updated:', launchedList.length);
  }, [launched, launchedList]);

  useEffect(() => {
    console.log('📝 Pre-launched tokens updated:', Object.keys(preLaunched).length);
    console.log('📚 Pre-launched list updated:', preList.length);
    console.log('🔎 Pre-launched data:', preLaunched);
  }, [preLaunched, preList]);

  useEffect(() => {
    if (ticker.current) window.clearInterval(ticker.current);
    ticker.current = window.setInterval(() => {
      setMessagesPerSec(msgCounter.current);
      msgCounter.current = 0;
    }, 1000);
    return () => {
      if (ticker.current) window.clearInterval(ticker.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    function connect() {
      const ws = new WebSocket('wss://pumpportal.fun/api/data');
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        console.log('✅ WebSocket connected');
        setConnected(true);
        ws.send(JSON.stringify({ method: 'subscribeNewToken' }));
        ws.send(JSON.stringify({ method: 'subscribeMigration' }));
      };

      ws.onmessage = async evt => {
        msgCounter.current += 1;
        console.log('📩 Raw message:', evt.data); // log raw event

        try {
          const data = JSON.parse(evt.data as any);
          console.log('🔍 Parsed message:', data); // log parsed data

          if (
            data?.method === 'newToken' ||
            data?.type === 'newToken' ||
            data?.eventType === 'newToken' ||
            data?.name ||
            data?.token ||
            data?.mint
          ) {
            console.log('🆕 New Token Event:', data);

            // Extract token fields and add to new tokens list
            const tokenFields = pickTokenFields(data);
            const key = tokenFields.mint || crypto.randomUUID();

            // Always add to new tokens list to avoid duplicates
            console.log(
              '✨ Processing new token:',
              tokenFields.name || tokenFields.symbol || tokenFields.mint
            );

            // Add to new tokens list, avoiding duplicates by mint address
            setNewTokens(cur => {
              // Check if this token already exists in our list
              const isDuplicate = cur.some(token => {
                const existingFields = pickTokenFields(token);
                return existingFields.mint === tokenFields.mint && tokenFields.mint;
              });

              if (isDuplicate) {
                console.log('❗ Duplicate token in newTokens, not adding again:', tokenFields.mint);
                return cur;
              }

              console.log('✨ Adding new token to list');
              return [data, ...cur].slice(0, 200);
            });

            // Always update pre-launched tokens
            if (tokenFields.mint) {
              console.log('📝 Adding/updating token in pre-launched:', tokenFields.mint);
              setPreLaunched(cur => {
                // Force update with the latest data
                const updated = { ...cur, [key]: data };
                // Force a re-render
                setLastUpdate(Date.now());
                return updated;
              });
            } else {
              console.log('⚠️ Token has no mint address, cannot add to pre-launched');
            }
          }

          // Handle migration/launch events with more flexible detection
          if (
            data?.method === 'migration' ||
            data?.type === 'migration' ||
            data?.event === 'migration' ||
            data?.eventType === 'migration' ||
            data?.migrated ||
            data?.raydiumPool ||
            data?.poolAddress ||
            data?.pool ||
            data?.launched ||
            data?.token?.launched === true ||
            data?.event?.token?.launched === true ||
            (data?.event && typeof data.event === 'object' && data.event.type === 'migration')
          ) {
            console.log('🚀 Migration/Launch Event:', data);

            // Extract data from different possible structures
            const eventData = data.event || data;
            const tokenData = eventData.token || eventData;

            // Get token fields from the appropriate object
            const tokenFields = pickTokenFields(tokenData);

            // Generate a consistent key
            const key =
              tokenFields.mint || data?.token?.mint || data?.address || crypto.randomUUID();

            console.log('🔑 Using key for launched token:', key);

            // Add to launched tokens
            setLaunched(cur => {
              console.log('📊 Current launched tokens:', Object.keys(cur).length);
              const updated = { ...cur, [key]: data };
              console.log('📈 Updated launched tokens count:', Object.keys(updated).length);
              return updated;
            });

            // Remove from pre-launched if exists
            setPreLaunched(cur => {
              const copy = { ...cur };
              if (key in copy) {
                console.log('🔄 Moving token from pre-launched to launched:', key);
                delete copy[key];
              }
              return copy;
            });

            // Force a re-render by updating timestamp
            setLastUpdate(Date.now());
          }
        } catch (err) {
          console.error('❌ Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
        setConnected(false);
        if (!cancelled) setTimeout(connect, 1200);
      };
    }

    connect();
    return () => {
      cancelled = true;
      console.log('🛑 Cleaning up WebSocket');
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const filtered = (items: any[]) => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => {
      const f = pickTokenFields(it.event || it);
      return (
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.symbol && f.symbol.toLowerCase().includes(q)) ||
        (f.mint && String(f.mint).toLowerCase().includes(q))
      );
    });
  };

  return (
    <Tooltip.Provider>
      <div className="text-gray-100" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        <div className="mx-auto px-2 py-6">
          <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
            <div className="flex items-center gap-3">
              <RocketIcon className="w-6 h-6 text-[#00d4aa]" />
              <h1 className="font-bold text-2xl text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Newest Memes
              </h1>
              {connected && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Live</span>
                </div>
              )}
            </div>
          </header>

          {/* Chain Filter Indicator */}
          <div className="mb-6">
            <ChainFilterIndicator />
          </div>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <section className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <RocketIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  New Tokens
                </h2>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                  {filteredNewTokens.length}
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-[70vh] overflow-auto pr-1">
                {filtered(filteredNewTokens).map((it, idx) => {
                  // Use mint as key to prevent duplicate rendering
                  const tokenFields = pickTokenFields(it.event?.token || it.event || it);
                  const key = tokenFields.mint || `new-${idx}-${Math.random()}`;
                  return <Row key={key} item={it} onInspect={setInspect} />;
                })}
                {newTokens.length === 0 && (
                  <p className="text-sm opacity-60">Listening for new tokens…</p>
                )}
              </div>
            </section>

            {/* <section className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
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
          </section> */}

            <section className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <UpdateIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  Launched Tokens
                </h2>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                  {filteredLaunchedList.length}
                </span>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() =>
                        console.log('Launched tokens:', launched, 'List:', filteredLaunchedList)
                      }
                      className="p-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-all duration-200"
                      title="Log launched tokens to console"
                    >
                      <InfoCircledIcon className="w-3 h-3" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                      Debug console log
                      <Tooltip.Arrow className="fill-black/90" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-[70vh] overflow-auto pr-1">
                {filteredLaunchedList.length > 0 ? (
                  filtered(filteredLaunchedList).map((it: any, index: number) => {
                    // Extract the appropriate data structure for the Row component
                    const tokenFields = pickTokenFields(it.event?.token || it.event || it);
                    const key = tokenFields.mint || `launched-${index}-${Math.random()}`;
                    return <Row key={key} item={it} onInspect={setInspect} />;
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UpdateIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      Listening for migrations...
                    </p>
                    <button
                      onClick={simulateLaunchedToken}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-green-600/25 transition-all duration-200"
                      style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                    >
                      Add Test Token
                    </button>
                  </div>
                )}
              </div>
            </section>
          </main>

          {inspect && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
              <div className="bg-black/90 backdrop-blur-lg border border-gray-800/50 rounded-2xl w-full max-w-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Raw Event JSON
                  </h3>
                  <button
                    onClick={() => setInspect(null)}
                    className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-all duration-200"
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    Close
                  </button>
                </div>
                <pre className="text-xs overflow-auto max-h-[70vh] whitespace-pre-wrap break-words bg-gray-900/50 p-4 rounded-lg text-gray-300" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                  {JSON.stringify(inspect, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
