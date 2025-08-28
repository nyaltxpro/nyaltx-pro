"use client";

import React from 'react';

export default function Banner() {
  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-red-800 py-2">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="text-white font-bold mr-4 text-lg">RUSH</div>
          <div className="text-white font-bold text-lg">UNDERDOGCOM</div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="text-white font-bold text-2xl">RACE & EARN</div>
            <button className="bg-red-500 text-white text-sm font-bold px-4 py-1 rounded-md mt-1">
              START EARNING NOW
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-white text-sm mr-2">
            <div>WIN TROPHIES &</div>
            <div>LEADERBOARD PRIZES</div>
          </div>
          <div className="w-12 h-12 bg-gray-300 rounded-md flex items-center justify-center">
            🏆
          </div>
        </div>
      </div>
    </div>
  );
}
