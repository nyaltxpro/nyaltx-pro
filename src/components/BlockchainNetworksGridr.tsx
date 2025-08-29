import React from 'react';
import Image from 'next/image';

// Define blockchain information
export const blockchainInfo = {
  blockchains: [
    "ethereum",
    "filecoin",
    "fio",
    "gochain",
    "groestlcoin",
    "harmony",
    "icon",
    "iost",
    "iotex",
    "kava",
    "kin",
    "kusama",
    "litecoin",
    "lkscoin",
    "loom",
    "nano",
    "near",
    "nebulas",
    "neo",
    "nervos",
    "nimiq",
    "nuls",
    "ontology",
    "poa",
    "polkadot",
    "qtum",
    "ravencoin",
    "ripple",
    "smartchain",
    "solana",
    "steem",
    "stellar",
    "terra",
    "tezos",
    "theta",
    "thundertoken",
    "tomochain",
    "ton",
    "tron",
    "vechain",
    "viacoin",
    "wanchain",
    "waves",
    "xdai",
    "xdc",
    "xrp",
    "zcash",
    "zcoin",
    "zelcash",
    "zilliqa"
  ]
};

interface BlockchainNetwork {
  id: string;
  name: string;
  symbol: string;
  logoPath: string;
  folderPath: string;
}

// Create a mapping of blockchain names and their details
const blockchainNetworks: BlockchainNetwork[] = [];

// Convert string IDs to BlockchainNetwork objects
blockchainInfo.blockchains.forEach(id => {
  // Create a capitalized name from the ID
  const name = id.charAt(0).toUpperCase() + id.slice(1);
  
  blockchainNetworks.push({
    id: id,
    name: name,
    symbol: name.substring(0, 3).toUpperCase(),
    logoPath: `/${id}.svg`,
    folderPath: id
  });
});

interface BlockchainNetworksGridProps {
  onSelectNetwork?: (networkId: string) => void;
  className?: string;
}

const BlockchainNetworksGrid: React.FC<BlockchainNetworksGridProps> = ({
  onSelectNetwork,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {blockchainNetworks.map((network) => (
          <div
            key={network.id}
            className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onSelectNetwork && onSelectNetwork(network.id)}
          >
            <div className="w-12 h-12 relative mb-2">
              <Image
                src={network.logoPath}
                alt={network.name}
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  // Fallback for missing images
                  (e.target as HTMLImageElement).src = '/globe.svg';
                }}
              />
            </div>
            <span className="text-sm text-white text-center">{network.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainNetworksGrid;
