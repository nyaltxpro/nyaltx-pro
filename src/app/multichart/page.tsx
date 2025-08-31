"use client";

import React, { useState, useEffect } from 'react';
import Banner from '../../components/Banner';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Header from '@/components/Header';

// Define types
type ChartItem = {
  id: string;
  symbol: string;
  price: string;
  change: string;
  position: number;
};

type HotPair = {
  id: number;
  symbol: string;
  price: string;
  change: string;
};

// Mock data for hot pairs
const hotPairs: HotPair[] = [
  { id: 1, symbol: "PEPE/ETH", price: "$0.00000123", change: "+5.67%" },
  { id: 2, symbol: "SHIB/ETH", price: "$0.00000789", change: "-2.34%" },
  { id: 3, symbol: "DOGE/ETH", price: "$0.07123", change: "+1.23%" },
  { id: 4, symbol: "FLOKI/ETH", price: "$0.00001234", change: "+12.34%" },
  { id: 5, symbol: "ELON/ETH", price: "$0.00000045", change: "-3.45%" },
  { id: 6, symbol: "WOJAK/ETH", price: "$0.00000078", change: "+8.92%" },
  { id: 7, symbol: "BONK/ETH", price: "$0.00000012", change: "+15.67%" },
  { id: 8, symbol: "CAT/ETH", price: "$0.00000567", change: "-1.23%" },
];

export default function MultichartPage() {
  const [darkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "normal">("normal");
  const [charts, setCharts] = useState<ChartItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<HotPair[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const maxCharts = 10;
  const remainingSlots = maxCharts - charts.length;

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim() === '') return;
    
    // Simulate search results
    const results = hotPairs.filter(pair => 
      pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    setShowSearchResults(true);
  };
  
  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Add chart
  const addChart = (pair: HotPair) => {
    if (charts.length >= maxCharts) return;
    
    const newChart: ChartItem = {
      id: `chart-${Date.now()}`,
      symbol: pair.symbol,
      price: pair.price,
      change: pair.change,
      position: charts.length
    };
    
    setCharts([...charts, newChart]);
    setShowSearchResults(false);
    setSearchTerm('');
  };
  
  // Remove chart
  const removeChart = (id: string) => {
    setCharts(charts.filter(chart => chart.id !== id));
  };
  
  // Handle drag start
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;
    
    const draggedIndex = charts.findIndex(chart => chart.id === draggedItem);
    const targetIndex = charts.findIndex(chart => chart.id === id);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Reorder charts
    const newCharts = [...charts];
    const [removed] = newCharts.splice(draggedIndex, 1);
    newCharts.splice(targetIndex, 0, removed);
    
    // Update positions
    newCharts.forEach((chart, index) => {
      chart.position = index;
    });
    
    setCharts(newCharts);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Top banner ad */}
     <Header/>

      {/* Hot pairs ticker */}
      <div className="bg-gray-800 bg-opacity-70 py-1 px-4 flex items-center">
        <div className="flex items-center mr-4">
          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mr-1">
            <span className="text-xs">🔥</span>
          </div>
          <span className="text-yellow-500 font-medium text-sm">HOT PAIRS</span>
          <span className="ml-1 text-yellow-500 text-xs">ℹ️</span>
        </div>
        <div className="overflow-x-auto flex-1">
          <div className="flex animate-scroll">
            {hotPairs.concat(hotPairs).map((pair, index) => (
              <div key={`${pair.id}-${index}`} className="flex items-center mr-6 whitespace-nowrap">
                <span className="font-medium text-sm">{pair.symbol}</span>
                <span className="mx-1 text-sm">{pair.price}</span>
                <span className={`text-xs ${pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {pair.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">Multichart</div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-700">
            ⚙️
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            ⭐
          </button>
          <ConnectWalletButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Multichart</h1>
            <p className="text-gray-400 text-sm">Find and add up to ten pairs in this view to display them at once.</p>
            <p className="text-gray-500 text-xs mt-1">
              <span className="inline-block mr-1">🔄</span>
              Note that you can drag any element to a different position
            </p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-yellow-800 bg-opacity-30 px-2 py-1 rounded flex items-center">
              <span className="text-yellow-500 mr-1">🔥</span>
              <span className="text-yellow-500 font-medium">SUPPLY</span>
              <span className="ml-1 text-yellow-500">$900</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1 mr-4 search-container">
            <input
              type="text"
              placeholder="Search pair by symbol, name, contract or token"
              className="w-full py-2 px-10 rounded-lg bg-opacity-10 bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <span 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-primary"
              onClick={handleSearch}
            >
              🔍
            </span>
            
            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 animate-fadeIn max-h-80 overflow-y-auto">
                {searchResults.map(result => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                    onClick={() => addChart(result)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white mr-2">
                        {result.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{result.symbol}</div>
                        <div className="text-xs text-gray-400">Ethereum</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{result.price}</div>
                      <div className={`text-xs ${result.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {result.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Select the size of the boxes:</span>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 rounded ${selectedSize === 'small' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setSelectedSize('small')}
              >
                Small
              </button>
              <button 
                className={`px-3 py-1 rounded ${selectedSize === 'medium' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setSelectedSize('medium')}
              >
                Medium
              </button>
              <button 
                className={`px-3 py-1 rounded ${selectedSize === 'normal' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setSelectedSize('normal')}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Chart grid */}
        <div className={`grid gap-4 ${selectedSize === 'small' ? 'grid-cols-3' : selectedSize === 'medium' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {charts.map(chart => (
            <div 
              key={chart.id}
              className={`
                bg-gray-800 bg-opacity-30 rounded-lg border border-gray-700 
                flex flex-col relative
                ${selectedSize === 'small' ? 'h-64' : selectedSize === 'medium' ? 'h-80' : 'h-96'}
                ${draggedItem === chart.id ? 'border-primary border-2' : ''}
              `}
              draggable
              onDragStart={() => handleDragStart(chart.id)}
              onDragOver={(e) => handleDragOver(e, chart.id)}
              onDragEnd={handleDragEnd}
            >
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white mr-2">
                    {chart.symbol.charAt(0)}
                  </div>
                  <span className="font-medium">{chart.symbol}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <span className="text-xs">⚙️</span>
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-500"
                    onClick={() => removeChart(chart.id)}
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-500 relative overflow-hidden">
                <div className="text-center z-10">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Chart will appear here</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 opacity-20"></div>
              </div>
              <div className="p-3 border-t border-gray-700 flex items-center justify-between">
                <div>{chart.price}</div>
                <div className={`${chart.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {chart.change}
                </div>
              </div>
            </div>
          ))}
          
          {remainingSlots > 0 && (
            <div 
              className={`
                bg-gray-800 bg-opacity-30 rounded-lg border border-gray-700 
                flex flex-col items-center justify-center p-10
                ${selectedSize === 'small' ? 'h-64' : selectedSize === 'medium' ? 'h-80' : 'h-96'}
                transition-all duration-300 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer
                group
              `}
              onClick={handleSearch}
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">+</span>
              </div>
              <h3 className="text-lg font-medium mb-1">Add new chart</h3>
              <p className="text-gray-400 text-sm">{remainingSlots} of {maxCharts} slots remaining</p>
            </div>
          )}
        </div>
        
        {/* Screenshot button */}
        <div className="flex justify-center mt-6">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded text-gray-300 border border-gray-700">
            Screenshot
          </button>
        </div>
      </main>
    </div>
  );
}
