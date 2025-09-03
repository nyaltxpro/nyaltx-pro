import { useState, useEffect } from 'react';
import { PumpFunToken } from '../types/token';

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

export const usePumpFunTokens = () => {
  const [tokens, setTokens] = useState<PumpFunToken[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      ws = new WebSocket("wss://pumpportal.fun/api/data");

      ws.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        ws?.send(JSON.stringify({ method: "subscribeNewToken" }));
        ws?.send(JSON.stringify({ method: "subscribeMigration" }));
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          
          if (data?.method === "newToken" || data?.name || data?.token || data?.mint) {
            const tokenFields = pickTokenFields(data);
            
            setTokens(prev => {
              // Avoid duplicates
              const exists = prev.some(token => token.mint === tokenFields.mint && tokenFields.mint);
              if (exists) return prev;
              
              return [tokenFields, ...prev].slice(0, 100); // Keep latest 100 tokens
            });
          }
        } catch (err) {
          console.error("Error parsing PumpFun message:", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, []);

  return { tokens, connected };
};
