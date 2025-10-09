// Multi-blockchain address validation utility
// Supports Ethereum, Solana, and other major blockchain address formats

export interface AddressValidationResult {
  isValid: boolean;
  blockchain: string;
  format: string;
  error?: string;
}

/**
 * Validate Ethereum-style addresses (EVM chains)
 * Format: 0x followed by 40 hexadecimal characters (42 total)
 */
export function validateEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Must start with 0x and be exactly 42 characters
  if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
    return false;
  }
  
  // Check if remaining 40 characters are valid hexadecimal
  const hexPart = cleanAddress.slice(2);
  return /^[0-9a-fA-F]{40}$/.test(hexPart);
}

/**
 * Validate Solana addresses
 * Format: Base58 encoded, typically 32-44 characters
 */
export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Solana addresses are typically 32-44 characters in Base58 format
  if (cleanAddress.length < 32 || cleanAddress.length > 44) {
    return false;
  }
  
  // Base58 alphabet (no 0, O, I, l to avoid confusion)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(cleanAddress);
}

/**
 * Validate Bitcoin addresses
 * Supports Legacy (P2PKH), SegWit (P2SH), and Bech32 formats
 */
export function validateBitcoinAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Legacy P2PKH (starts with 1)
  if (cleanAddress.startsWith('1')) {
    return /^[1][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(cleanAddress);
  }
  
  // P2SH (starts with 3)
  if (cleanAddress.startsWith('3')) {
    return /^[3][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(cleanAddress);
  }
  
  // Bech32 (starts with bc1)
  if (cleanAddress.startsWith('bc1')) {
    return /^bc1[a-z0-9]{39,59}$/.test(cleanAddress);
  }
  
  return false;
}

/**
 * Validate Cardano addresses
 * Format: Bech32 encoded, starts with addr1
 */
export function validateCardanoAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Cardano addresses start with addr1 and are bech32 encoded
  return /^addr1[a-z0-9]{50,100}$/.test(cleanAddress);
}

/**
 * Validate Polkadot/Substrate addresses
 * Format: SS58 encoded, typically starts with 1, 5, or other prefixes
 */
export function validatePolkadotAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Polkadot addresses are SS58 encoded, typically 47-48 characters
  if (cleanAddress.length < 47 || cleanAddress.length > 48) {
    return false;
  }
  
  // SS58 uses Base58 alphabet
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(cleanAddress);
}

/**
 * Validate Cosmos ecosystem addresses
 * Format: Bech32 encoded with specific prefixes
 */
export function validateCosmosAddress(address: string, prefix: string = 'cosmos'): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const cleanAddress = address.trim();
  
  // Cosmos addresses start with specific prefix and are bech32 encoded
  const regex = new RegExp(`^${prefix}1[a-z0-9]{38,58}$`);
  return regex.test(cleanAddress);
}

/**
 * Main validation function that detects blockchain and validates address
 */
export function validateContractAddress(address: string, blockchain: string): AddressValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      blockchain,
      format: 'unknown',
      error: 'Address is required'
    };
  }
  
  const cleanAddress = address.trim();
  
  if (!cleanAddress) {
    return {
      isValid: false,
      blockchain,
      format: 'unknown',
      error: 'Address cannot be empty'
    };
  }
  
  // Validate based on blockchain
  switch (blockchain.toLowerCase()) {
    case 'ethereum':
    case 'binance':
    case 'bsc':
    case 'polygon':
    case 'avalanche':
    case 'arbitrum':
    case 'optimism':
    case 'base':
    case 'fantom':
      if (validateEthereumAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'EVM (0x...)',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'EVM (0x...)',
        error: 'Invalid EVM address format. Must start with 0x and be 42 characters long.'
      };
      
    case 'solana':
      if (validateSolanaAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'Base58',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'Base58',
        error: 'Invalid Solana address format. Must be 32-44 characters in Base58 format.'
      };
      
    case 'bitcoin':
    case 'btc':
      if (validateBitcoinAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'Bitcoin',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'Bitcoin',
        error: 'Invalid Bitcoin address format. Must be Legacy (1...), P2SH (3...), or Bech32 (bc1...).'
      };
      
    case 'cardano':
    case 'ada':
      if (validateCardanoAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'Bech32 (addr1...)',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'Bech32 (addr1...)',
        error: 'Invalid Cardano address format. Must start with addr1.'
      };
      
    case 'polkadot':
    case 'dot':
      if (validatePolkadotAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'SS58',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'SS58',
        error: 'Invalid Polkadot address format. Must be 47-48 characters in SS58 format.'
      };
      
    case 'cosmos':
    case 'atom':
      if (validateCosmosAddress(cleanAddress, 'cosmos')) {
        return {
          isValid: true,
          blockchain,
          format: 'Bech32 (cosmos1...)',
        };
      }
      return {
        isValid: false,
        blockchain,
        format: 'Bech32 (cosmos1...)',
        error: 'Invalid Cosmos address format. Must start with cosmos1.'
      };
      
    default:
      // For unknown blockchains, try to detect format
      if (validateEthereumAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'EVM (0x...)',
        };
      } else if (validateSolanaAddress(cleanAddress)) {
        return {
          isValid: true,
          blockchain,
          format: 'Base58',
        };
      } else {
        return {
          isValid: false,
          blockchain,
          format: 'unknown',
          error: `Unsupported blockchain: ${blockchain}. Please use a supported blockchain.`
        };
      }
  }
}

/**
 * Get address format description for UI display
 */
export function getAddressFormatDescription(blockchain: string): string {
  switch (blockchain.toLowerCase()) {
    case 'ethereum':
    case 'binance':
    case 'bsc':
    case 'polygon':
    case 'avalanche':
    case 'arbitrum':
    case 'optimism':
    case 'base':
    case 'fantom':
      return 'EVM address starting with 0x (42 characters)';
      
    case 'solana':
      return 'Base58 encoded address (32-44 characters)';
      
    case 'bitcoin':
    case 'btc':
      return 'Bitcoin address (Legacy: 1..., P2SH: 3..., Bech32: bc1...)';
      
    case 'cardano':
    case 'ada':
      return 'Bech32 address starting with addr1';
      
    case 'polkadot':
    case 'dot':
      return 'SS58 encoded address (47-48 characters)';
      
    case 'cosmos':
    case 'atom':
      return 'Bech32 address starting with cosmos1';
      
    default:
      return 'Blockchain-specific address format';
  }
}

/**
 * Get example address for UI placeholder
 */
export function getExampleAddress(blockchain: string): string {
  switch (blockchain.toLowerCase()) {
    case 'ethereum':
    case 'binance':
    case 'bsc':
    case 'polygon':
    case 'avalanche':
    case 'arbitrum':
    case 'optimism':
    case 'base':
    case 'fantom':
      return '0x742d35Cc6634C0532925a3b8D4C9db4C2b7e9';
      
    case 'solana':
      return 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
    case 'bitcoin':
    case 'btc':
      return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      
    case 'cardano':
    case 'ada':
      return 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a';
      
    case 'polkadot':
    case 'dot':
      return '1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWx1CrKTyrVYhV24fg';
      
    case 'cosmos':
    case 'atom':
      return 'cosmos1depk54cuajgkzea6zpgkq36tnjwdzv4afc3d27';
      
    default:
      return 'Enter contract address...';
  }
}
