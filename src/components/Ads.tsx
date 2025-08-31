import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const bannerItems = [
    { 
      id: 1, 
      title: "DEXTools x Nibiru Chain AMA", 
      subtitle: "Join Us Here!",
    //   date: "Wed August 27th",
    //   time: "7PM CEST / 5PM UTC",
      image: "/banner/1.png"
    },
    { 
      id: 2, 
      title: "DEXTools API V2", 
      subtitle: "Powering The Future Of DeFi",
      image: "/banner/2.png"
    },
    { 
      id: 3, 
      title: "DEXTools Meme Board", 
      subtitle: "Discover Hottest Meme Tokens",
      image: "/banner/3.png"
    },
    { 
      id: 4, 
      title: "Follow Us On TikTok!", 
      subtitle: "Official DEXTools Account",
      image: "/banner/4.png"
    },
    { 
      id: 5, 
      title: "Follow Us On X!", 
      subtitle: "Official DEXTools Account",
      image: "/banner/5.png"
    },
];

const Ads = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const totalBanners = bannerItems.length;
  
  // Calculate visible items based on screen size
  const [visibleItems, setVisibleItems] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else if (window.innerWidth < 1280) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-play functionality
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => (prevIndex + 1) % totalBanners);
      }, 5000); // Change slide every 5 seconds
    };
    
    startAutoPlay();
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [totalBanners]);
  
  const handleNext = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalBanners);
  };
  
  const handlePrev = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalBanners - 1 : prevIndex - 1));
  };
  
  // Calculate indices for visible items
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = 0; i < visibleItems; i++) {
      indices.push((currentIndex + i) % totalBanners);
    }
    return indices;
  };
  
  const visibleIndices = getVisibleIndices();
  
  return (
    <div className="relative w-full h-full py-4">
      <div className="max-w-7xl mx-auto ">

        
        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            // initial={{ x: 0 }}
            // animate={{ x: 0 }}
            // transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
  
              {visibleIndices.map((itemIndex, i) => {
                const item = bannerItems[itemIndex];
                return (
                  <div
                   
                    className="  overflow-hidden shadow-lg  transition-all duration-300 h-full flex flex-col"
                  >
                    {/* Banner Image */}
                    <div className="h-48  w-full relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.subtitle}</p>
                      </div>
                      
                      {/* {item.date && (
                        <div className="mt-4 pt-3 border-t border-gray-700">
                          <p className="text-sm text-gray-400">{item.date}</p>
                          {item.time && <p className="text-sm text-blue-400">{item.time}</p>}
                        </div>
                      )} */}
                    </div>
                  </div>
                );
              })}
      
          </div>
          
          {/* Navigation Arrows */}
          {/* <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full z-10 shadow-lg"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full z-10 shadow-lg"
            aria-label="Next slide"
          >
            <FiChevronRight size={24} />
          </button> */}
        </div>
        
        {/* Dots Indicator */}
        {/* <div className="flex justify-center mt-6 space-x-2">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                if (autoPlayRef.current) {
                  clearInterval(autoPlayRef.current);
                }
              }}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
}

export default Ads
