import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PumpFunToken } from '../types/token';
import { FaExternalLinkAlt, FaFire, FaDollarSign, FaChartLine } from 'react-icons/fa';

interface PumpFunTokenCardProps {
  token: PumpFunToken;
  showPricing?: boolean;
  compact?: boolean;
}

const PumpFunTokenCard: React.FC<PumpFunTokenCardProps> = ({
  token,
  showPricing = true,
  compact = false
}) => {
  const router = useRouter();

  const handleTradeClick = () => {
    const params = new URLSearchParams();
    params.set('base', (token.symbol || 'UNKNOWN').toUpperCase());
    params.set('chain', 'solana');
    if (token.mint) {
      params.set('address', token.mint);
    }
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (token.mint) {
      window.open(`https://solscan.io/token/${token.mint}`, '_blank');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    if (price < 0.000001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  const formatLiquidity = (liquidity?: number) => {
    if (!liquidity) return 'N/A';
    if (liquidity >= 1000000) return `$${(liquidity / 1000000).toFixed(1)}M`;
    if (liquidity >= 1000) return `$${(liquidity / 1000).toFixed(1)}K`;
    return `$${liquidity.toFixed(0)}`;
  };

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (compact) {
    return (
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-purple-500 transition-all cursor-pointer group"
        onClick={handleTradeClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image
                src={token.image || '/crypto-icons/color/generic.svg'}
                alt={token.name || 'Token'}
                width={32}
                height={32}
                className="rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
                }}
              />
            </div>
            <div>
              <div className="font-medium text-white text-sm">{token.name || 'Unknown'}</div>
              <div className="text-xs text-gray-400">{token.symbol || 'N/A'}</div>
            </div>
          </div>
          
          {showPricing && token.priceUsd && (
            <div className="text-right">
              <div className="text-sm text-white">${formatPrice(token.priceUsd)}</div>
              <div className="text-xs text-gray-400">{formatMarketCap(token.marketCap)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer group"
      onClick={handleTradeClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <Image
              src={token.image || '/crypto-icons/color/generic.svg'}
              alt={token.name || 'Token'}
              width={48}
              height={48}
              className="rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
              }}
            />
          </div>
          <div>
            <div className="font-medium text-white">{token.name || 'Unknown Token'}</div>
            <div className="text-sm text-gray-400">{token.symbol || 'N/A'}</div>
            <div className="text-xs text-gray-500">{getTimeAgo(token.ts)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
            PumpFun
          </span>
          <button
            onClick={handleExternalClick}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="View on Solscan"
          >
            <FaExternalLinkAlt className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showPricing && (
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <FaDollarSign className="w-3 h-3" />
              <span>Price USD</span>
            </div>
            <div className="text-white font-medium">
              ${formatPrice(token.priceUsd)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <FaChartLine className="w-3 h-3" />
              <span>Market Cap</span>
            </div>
            <div className="text-white font-medium">
              {formatMarketCap(token.marketCap)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <FaFire className="w-3 h-3" />
              <span>Liquidity</span>
            </div>
            <div className="text-white font-medium">
              {formatLiquidity(token.liquidity)}
            </div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Price SOL</div>
            <div className="text-white font-medium">
              {token.priceNative ? `◎${formatPrice(token.priceNative)}` : 'N/A'}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleTradeClick}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-medium transition-colors group-hover:bg-purple-700"
      >
        TRADE NOW
      </button>
    </div>
  );
};

export default PumpFunTokenCard;
