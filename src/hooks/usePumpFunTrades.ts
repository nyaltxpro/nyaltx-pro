import { useEffect, useMemo, useRef, useState } from 'react'
import { PumpFunTrade, PumpFunToken } from '../types/token'

export type PumpFunLiveToken = Required<Pick<PumpFunToken, 'name' | 'symbol' | 'mint'>> & {
  image?: string
  price?: number
  marketCap?: number
  lastTradeTs?: number
}

export function usePumpFunTrades() {
  const [connected, setConnected] = useState(false)
  const [trades, setTrades] = useState<PumpFunTrade[]>([])
  const tokensRef = useRef<Map<string, PumpFunLiveToken>>(new Map())

  useEffect(() => {
    let ws: WebSocket | null = null
    let cancelled = false

    const connect = () => {
      ws = new WebSocket('wss://pumpportal.fun/api/data')

      ws.onopen = () => {
        if (cancelled) return
        setConnected(true)
        // Subscribe to all token trades
        ws?.send(
          JSON.stringify({
            method: 'subscribeTokenTrade',
            keys: ['ALL']
          })
        )
      }

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)

          // Heuristic: consider messages that contain price and possibly mint as trades
          const mint = data?.mint || data?.tokenMint || data?.ca || data?.address
          const price = typeof data?.price === 'number' ? data.price : undefined
          const marketCap = typeof data?.marketCap === 'number' ? data.marketCap : undefined
          const ts =
            (typeof data?.ts === 'number' && data.ts) ||
            (typeof data?.timestamp === 'number' && data.timestamp) ||
            (data?.slot_time ? Date.parse(data.slot_time) : undefined)

          if (mint && (price !== undefined || marketCap !== undefined)) {
            const trade: PumpFunTrade = {
              mint,
              price,
              marketCap,
              ts,
              name: data?.name || data?.token?.name || data?.metadata?.name,
              symbol: data?.symbol || data?.token?.symbol || data?.metadata?.symbol,
              image: data?.logoURI || data?.token?.metadata?.image || data?.metadata?.image
            }

            // Keep a rolling list of recent trades (max 100)
            setTrades((prev) => [trade, ...prev].slice(0, 100))

            // Update tokens map
            const m = tokensRef.current
            const prevToken = m.get(mint)
            const nextToken: PumpFunLiveToken = {
              name: trade.name || prevToken?.name || 'Unknown',
              symbol: trade.symbol || prevToken?.symbol || 'UNK',
              mint,
              image: trade.image || prevToken?.image,
              price: trade.price ?? prevToken?.price,
              marketCap: trade.marketCap ?? prevToken?.marketCap,
              lastTradeTs: ts || prevToken?.lastTradeTs
            }
            m.set(mint, nextToken)
          }
        } catch (err) {
          console.error('Error parsing PumpFun trade message:', err)
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (!cancelled) setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        // Let onclose handle reconnect
      }
    }

    connect()

    return () => {
      cancelled = true
      ws?.close()
    }
  }, [])

  const topByMarketCap = useMemo(() => {
    return Array.from(tokensRef.current.values())
      .filter((t) => typeof t.marketCap === 'number')
      .sort((a, b) => (b.marketCap! - a.marketCap!))
      .slice(0, 20)
  }, [trades])

  const allTokens = useMemo(() => Array.from(tokensRef.current.values()), [trades])

  return { connected, trades, topByMarketCap, allTokens }
}
