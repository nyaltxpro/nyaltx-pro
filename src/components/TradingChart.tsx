import React from 'react';

interface TradingChartProps {
  pair: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ pair }) => {
  // In a real application, you would integrate with a charting library like TradingView
  // For now, we'll create a simple placeholder chart
  
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg p-4 relative">
      <div className="absolute top-4 left-4 text-sm text-gray-400">
        {pair} Price Chart
      </div>
      
      {/* Mock chart lines */}
      <div className="w-full h-full flex items-end">
        {Array.from({ length: 30 }).map((_, index) => {
          const height = 30 + Math.random() * 50;
          const isUp = Math.random() > 0.5;
          
          return (
            <div 
              key={index} 
              className="flex-1"
              style={{ height: `${height}%` }}
            >
              <div 
                className={`w-full h-full ${isUp ? 'bg-green-500' : 'bg-red-500'} opacity-20`}
              ></div>
              <div 
                className={`w-1 h-full mx-auto ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 left-4 text-sm text-gray-400">
        Chart data will be integrated with TradingView or similar service
      </div>
    </div>
  );
};

export default TradingChart;
