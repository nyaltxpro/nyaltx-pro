import React from 'react'
import HotPairsTicker from './HotPairsTicker'
import Banner from './Banner'
import ConnectWalletButton from './ConnectWalletButton';
import BlockchainDropdown from './BlockchainDropdown';
import './animations.css';
import { SlStar } from 'react-icons/sl';
import { BiSearch } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';


type HotPair = {
    id: number;
    symbol: string;
    price: string;
    change: string;
  };

const Header = () => {


    const hotPairs: HotPair[] = [
        { id: 1, symbol: "PEPE/ETH", price: "$0.00000123", change: "+5.67%" },
        { id: 2, symbol: "SHIB/ETH", price: "$0.00000789", change: "-2.34%" },
        { id: 3, symbol: "DOGE/ETH", price: "$0.07123", change: "+1.23%" },
        { id: 4, symbol: "FLOKI/ETH", price: "$0.00001234", change: "+12.34%" },
        { id: 5, symbol: "ELON/ETH", price: "$0.00000045", change: "-3.45%" },
        { id: 6, symbol: "WOJAK/ETH", price: "$0.00000078", change: "+8.92%" },
        { id: 7, symbol: "BONK/ETH", price: "$0.00000012", change: "+15.67%" },
        { id: 8, symbol: "CAT/ETH", price: "$0.00000567", change: "-1.23%" },
        { id: 9, symbol: "DEGEN/ETH", price: "$0.00000345", change: "+4.56%" },
        { id: 10, symbol: "APE/ETH", price: "$1.23", change: "-0.78%" },
      ];

    const [searchTerm, setSearchTerm] = React.useState('');
   
  return (
    <div className='flex flex-col w-full items-center justify-center'>
       <Banner />
      
            {/* Hot pairs ticker */}
  
            
            {/* Header */}
            <div className="flex  w-full items-center  justify-between p-4 border-b border-gray-800">
              <div className="flex w-[25%] items-center space-x-4">
              <BlockchainDropdown 
                  onSelectNetwork={(networkId) => console.log(`Selected network: ${networkId}`)} 
                />
              </div>
              
              <div className="flex w-[60%] mx-4">
                <div className=" w-[80%] relative">
                  <input
                    type="text"
                    placeholder="Search pair by symbol, name, contract or token"
                    className="w-full py-2 px-10 rounded-lg bg-opacity-10 bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
                        <BiSearch/>
                  </span>
                </div>
              </div>
              
              <div className="flex w-[15%] items-center justify-between space-x-3">
            
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <FiSettings/>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <SlStar/>
                </button>
                <ConnectWalletButton />
              </div>
            </div>
            <HotPairsTicker pairs={hotPairs} />
    </div>
  )
}

export default Header
