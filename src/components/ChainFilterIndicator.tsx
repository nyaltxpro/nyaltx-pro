import React from 'react';
import { useChainFilterStatus } from '@/hooks/useChainFilter';
import { useAppDispatch } from '@/store';
import { resetChainState } from '@/store/slices/chainSlice';
import { FiX, FiFilter } from 'react-icons/fi';

interface ChainFilterIndicatorProps {
  className?: string;
  showClearButton?: boolean;
}

const ChainFilterIndicator: React.FC<ChainFilterIndicatorProps> = ({ 
  className = '',
  showClearButton = true 
}) => {
  const dispatch = useAppDispatch();
  const { isFiltering, selectedChain, chainName } = useChainFilterStatus();

  const handleClearFilter = () => {
    dispatch(resetChainState());
  };

  if (!isFiltering || !selectedChain || selectedChain.id === 'all-networks') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 ${className}`}>
      <FiFilter className="w-4 h-4" />
      <span className="text-sm font-medium">
        Filtering by: <span className="text-blue-400 font-semibold">{chainName}</span>
      </span>
      {showClearButton && (
        <button
          onClick={handleClearFilter}
          className="ml-2 p-1 hover:bg-blue-800/30 rounded-full transition-colors"
          title="Clear chain filter"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChainFilterIndicator;
