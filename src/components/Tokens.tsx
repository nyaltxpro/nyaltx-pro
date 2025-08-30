import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getTronNewTokens, getTronPreLaunchedTokens } from '../lib/blockchain/blockchainUtils'

const Tokens = () => {
  const [isLoadingTronTokens, setIsLoadingTronTokens] = useState(true);
  const [tronNewTokens, setTronNewTokens] = useState<any[]>([]);
  const [tronPreLaunchedTokens, setTronPreLaunchedTokens] = useState<any[]>([]);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const newTokens = await getTronNewTokens(5);
        const preLaunchedTokens = await getTronPreLaunchedTokens(5);
        
        setTronNewTokens(newTokens);
        setTronPreLaunchedTokens(preLaunchedTokens);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setIsLoadingTronTokens(false);
      }
    };

    loadTokens();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    {/* NEW Category */}
    <div className="border border-[#23323c] rounded-lg overflow-hidden">
      <div className="flex items-center p-3 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-white font-bold mr-2">🆕 NEW</span>
          <span className="text-xs text-blue-400 ml-2">Tron</span>
        </div>
      </div>
      
      {isLoadingTronTokens ? (
        <div className="p-4 text-center text-gray-400">Loading Tron tokens...</div>
      ) : tronNewTokens.length > 0 ? (
        tronNewTokens.map((token) => (
          <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                  <Image 
                    src={token.logoUrl} 
                    alt={token.name} 
                    width={32} 
                    height={32} 
                    unoptimized 
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-white font-medium">{token.name}</span>
                    <span className="text-blue-400 text-xs ml-2 px-1 rounded bg-blue-900">TRX</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{token.id.substring(0, 8)}...</span>
                    <span className="ml-2">🔍</span>
                  </div>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Price</div>
                <div className="text-white">{token.price}</div>
              </div>
              <div>
                <div className="text-gray-500">Chain</div>
                <div className="text-white">{token.chain}</div>
              </div>
              <div>
                <div className="text-gray-500">Time</div>
                <div className="text-white">{token.time}</div>
              </div>
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-white">{token.time}</div>
              <div className="text-xs text-green-500">{token.percentage}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-400">No Tron tokens found</div>
      )}
    </div>
    
    {/* PRE LAUNCHED Category */}
    <div className="border border-[#23323c] rounded-lg overflow-hidden">
      <div className="flex items-center p-3 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-white font-bold mr-2">🚀 PRE LAUNCHED</span>
          <span className="text-xs text-blue-400 ml-2">Tron</span>
        </div>
      </div>
      
      {isLoadingTronTokens ? (
        <div className="p-4 text-center text-gray-400">Loading Tron tokens...</div>
      ) : tronPreLaunchedTokens.length > 0 ? (
        tronPreLaunchedTokens.map((token) => (
          <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                  <Image 
                    src={token.logoUrl} 
                    alt={token.name} 
                    width={32} 
                    height={32} 
                    unoptimized 
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-white font-medium">{token.name}</span>
                    <span className="text-blue-400 text-xs ml-2 px-1 rounded bg-blue-900">TRX</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{token.id.substring(0, 8)}...</span>
                    <span className="ml-2">🔍</span>
                  </div>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Launch</div>
                <div className="text-white">{token.launchDate}</div>
              </div>
              <div>
                <div className="text-gray-500">Chain</div>
                <div className="text-white">{token.chain}</div>
              </div>
              <div>
                <div className="text-gray-500">Holders</div>
                <div className="text-white">{token.holders}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-400">No Tron tokens found</div>
      )}
    </div>
    
    {/* LAUNCHED Category */}
    <div className="border border-[#23323c] rounded-lg overflow-hidden">
      <div className="flex items-center p-3 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-white font-bold mr-2">🚀 LAUNCHED</span>
        </div>
      </div>
      
      {tronPreLaunchedTokens.map((token) => (
        <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
            <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                  <Image 
                    src={token.logoUrl} 
                    alt={token.name} 
                    width={32} 
                    height={32} 
                    unoptimized 
                  />
                </div>
              <div>
                <div className="flex items-center">
                  <span className="text-white font-medium">{token.name}</span>
                  {/* <span className="text-gray-500 text-xs ml-2">{token.fullName}</span> */}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{token.chain}</span>
                </div>
              </div>
            </div>
            <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* <div>
              <div className="text-gray-500">MCap.</div>
              <div className="text-white">{token.mcap}</div>
            </div>
            <div>
              <div className="text-gray-500">Vol.</div>
              <div className="text-white">{token.volume}</div>
            </div> */}
            <div>
              <div className="text-gray-500">Holders</div>
              <div className="text-white">{token.holders}</div>
            </div>
          </div>
          
          {token.launchDate && (
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-white">{token.launchDate}</div>
              {token.holders && (
                <div className="text-xs text-green-500">{token.holders}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
  )
}

export default Tokens
