import React, { useState } from 'react';
import { usePumpFunTokensMoralis } from '../hooks/usePumpFunTokensMoralis';
import PumpFunTokenCard from './PumpFunTokenCard';
import { FaSync, FaPlus, FaWifi, FaWifiSlash, FaFire, FaRocket } from 'react-icons/fa';

interface NewestMemesSectionProps {
  title?: string;
  showHeader?: boolean;
  limit?: number;
  compact?: boolean;
}

const NewestMemesSection: React.FC<NewestMemesSectionProps> = ({
  title = "🔥 Newest Pump.fun Tokens",
  showHeader = true,
  limit = 20,
  compact = false
}) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const {
    tokens,
    loading,
    error,
    connected,
    hasMore,
    loadMore,
    refresh
  } = usePumpFunTokensMoralis({
    limit,
    autoRefresh,
    refreshInterval: 30000 // 30 seconds
  });

  const handleRefresh = () => {
    refresh();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (error && tokens.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">❌ Failed to load tokens</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <div className="flex items-center gap-1">
              {connected ? (
                <FaWifi className="w-4 h-4 text-green-400" title="Connected to Moralis API" />
              ) : (
                <FaWifiSlash className="w-4 h-4 text-red-400" title="Disconnected" />
              )}
              <span className="text-xs text-gray-400">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoRefresh}
              className={`p-2 rounded transition-colors ${
                autoRefresh
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <FaRocket className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh tokens"
            >
              <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && tokens.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-700 border border-gray-600 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-600 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-600 rounded"></div>
                <div className="h-8 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tokens Grid */}
      {tokens.length > 0 && (
        <>
          <div className={`grid gap-4 ${
            compact 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {tokens.map((token, index) => (
              <PumpFunTokenCard
                key={`${token.mint}-${index}`}
                token={token}
                compact={compact}
                showPricing={true}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4" />
                    Load More Tokens
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Info */}
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {tokens.length} tokens • 
            {autoRefresh ? ' Auto-refreshing every 30s' : ' Auto-refresh disabled'} • 
            Powered by Moralis API
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && tokens.length === 0 && !error && (
        <div className="text-center py-8">
          <FaFire className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <div className="text-gray-400 mb-2">No new tokens found</div>
          <div className="text-gray-500 text-sm">Check back soon for the latest Pump.fun launches!</div>
        </div>
      )}
    </div>
  );
};

export default NewestMemesSection;
