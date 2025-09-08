import { Blockchain, Token, BlockchainTokens } from '../types/blockchain';
import { getCryptoIconUrl } from '../../utils/cryptoIcons';

// Define supported blockchains with their metadata
export const supportedBlockchains: Blockchain[] = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        logoURI: getCryptoIconUrl('eth'),
        chainId: 1,
        explorerURL: 'https://etherscan.io'
    },
    {
        id: 'smartchain',
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        logoURI: getCryptoIconUrl('bnb'),
        chainId: 56,
        explorerURL: 'https://bscscan.com'
    },
    {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        logoURI: getCryptoIconUrl('sol'),
        chainId: 101,
        explorerURL: 'https://explorer.solana.com'
    },
    {
        id: 'arbitrum',
        name: 'Arbitrum',
        symbol: 'ARB',
        logoURI: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
        chainId: 42161,
        explorerURL: 'https://arbiscan.io'
    },
    {
        id: 'avalanche',
        name: 'Avalanche',
        symbol: 'AVAX',
        logoURI: getCryptoIconUrl('avax'),
        chainId: 43114,
        explorerURL: 'https://snowtrace.io'
    },
    {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        logoURI: getCryptoIconUrl('matic'),
        chainId: 137,
        explorerURL: 'https://polygonscan.com'
    }
];


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


// Function to get blockchain by ID
export function getBlockchainByName(id: string): Blockchain | undefined {
    return supportedBlockchains.find(blockchain => blockchain.id === id);
}

export function loadBlockchainIcon(blockchain: string): string {
    // Map blockchain IDs to their corresponding crypto symbol
    const blockchainToSymbol: Record<string, string> = {
        'ethereum': 'eth',
        'smartchain': 'bnb',
        'solana': 'sol',
        'arbitrum': 'arb',
        'avalanche': 'avax',
        'polygon': 'matic',
        'optimism': 'op',
        'tron': 'trx',
        'filecoin': 'fil',
        'near': 'near',
        'polkadot': 'dot',
        'kusama': 'ksm',
        'ripple': 'xrp',
        'stellar': 'xlm',
        'tezos': 'xtz',
        'litecoin': 'ltc',
        'zcash': 'zec'
    };
    
    const symbol = blockchainToSymbol[blockchain.toLowerCase()];
    
    if (symbol) {
        return getCryptoIconUrl(symbol);
    } else {
        // Fallback to a generic blockchain icon
        return '/blockchain-generic.svg';
    }
}


export function getMeByName(id: string): Blockchain | undefined {
    return supportedBlockchains.find(blockchain => blockchain.id === id);
}

/**
 * Generate a random token name from a validator address
 * @param address Validator address
 * @returns Random token name
 */
export function generateTokenNameFromAddress(address: string): string {
    // Use parts of the address to create a name
    const prefixes = ['Sol', 'Luna', 'Star', 'Cosmic', 'Nova', 'Orbit', 'Galaxy', 'Nebula', 'Astro', 'Quantum'];
    const suffixes = ['Coin', 'Token', 'Cash', 'Money', 'Finance', 'Pay', 'Chain', 'Swap', 'Dao', 'Verse'];
    
    // Use the first character of the address to select a prefix
    const prefixIndex = parseInt(address.charAt(0), 36) % prefixes.length;
    // Use the last character of the address to select a suffix
    const suffixIndex = parseInt(address.charAt(address.length - 1), 36) % suffixes.length;
    
    return `${prefixes[prefixIndex]}${suffixes[suffixIndex]}`;
}

/**
 * Generate random price data for a token
 * @returns Random price data
 */
export function generateRandomPriceData() {
    // Generate a random base price between $0.01 and $100
    const basePrice = Math.random() * 100 + 0.01;
    
    // Generate a random percentage change between -15% and +40%
    const percentChange = (Math.random() * 55) - 15;
    
    // Calculate the price change
    const priceChange = basePrice * (percentChange / 100);
    
    // Format the values
    return {
        price: parseFloat(basePrice.toFixed(4)),
        percentChange: parseFloat(percentChange.toFixed(2)),
        priceChange: parseFloat(priceChange.toFixed(4)),
        volume: parseFloat((Math.random() * 10000000 + 100000).toFixed(2))
    };
}

/**
 * Get random Solana validators as daily gainers
 * @param count Number of validators to return
 * @returns Array of validator tokens with price data
 */
export async function getRandomSolanaValidatorsAsGainers(count: number = 10): Promise<{
    id: string;
    name: string;
    logoUrl: string;
    price: number;
    percentChange: number;
    priceChange: number;
    volume: number;
}[]> {
    // Get all validator logos
    const allValidators = await getSolanaValidatorLogos();
    
    // Shuffle the array to get random validators
    const shuffled = [...allValidators].sort(() => 0.5 - Math.random());
    
    // Take the first 'count' validators
    const selectedValidators = shuffled.slice(0, count);
    
    // Generate token data for each validator
    return selectedValidators.map(validator => {
        const name = generateTokenNameFromAddress(validator.id);
        const priceData = generateRandomPriceData();
        
        return {
            id: validator.id,
            name,
            logoUrl: validator.logoUrl,
            ...priceData
        };
    });
}

/**
 * Get random Ethereum validators as token creators
 * @param count Number of validators to return
 * @returns Array of validator tokens with creation data
 */
export async function getRandomEthereumValidatorsAsCreators(count: number = 5): Promise<{
    id: string;
    name: string;
    logoUrl: string;
    time: string;
    chain: string;
}[]> {
    // Get all validator logos
    const allValidators = await getEthereumValidatorLogos();
    
    // Shuffle the array to get random validators
    const shuffled = [...allValidators].sort(() => 0.5 - Math.random());
    
    // Take the first 'count' validators
    const selectedValidators = shuffled.slice(0, count);
    
    // Time periods for token creation
    const timePeriods = ['1 h ago', '3 h ago', '6 h ago', '12 h ago', '1 d ago', '2 d ago'];
    
    // Generate token data for each validator
    return selectedValidators.map(validator => {
        const name = generateTokenNameFromAddress(validator.id);
        const randomTimeIndex = Math.floor(Math.random() * timePeriods.length);
        
        return {
            id: validator.id,
            name,
            logoUrl: validator.logoUrl,
            time: timePeriods[randomTimeIndex],
            chain: 'ETH'
        };
    });
}

/**
 * Gets a mixture of Ethereum and Solana tokens for social updates
 * @param count Total number of tokens to return
 * @returns Promise resolving to an array of mixed tokens with social update data
 */
export async function getMixedTokensForSocialUpdates(count: number = 5): Promise<{
    id: string;
    name: string;
    logoUrl: string;
    time: string;
    chain: string;
    platforms: string[];
}[]> {
    // Get validators from both chains
    const ethValidators = await getEthereumValidatorLogos();
    const solValidators = await getSolanaValidatorLogos();
    
    // Combine and shuffle
    const allValidators = [...ethValidators, ...solValidators];
    const shuffled = [...allValidators].sort(() => 0.5 - Math.random());
    
    // Take the requested number of validators
    const selectedValidators = shuffled.slice(0, count);
    
    // Time periods for social updates
    const timePeriods = ['10 min ago', '30 min ago', '1 h ago', '2 h ago', '5 h ago'];
    
    // Social platforms that might be updated
    const allPlatforms = ['website', 'telegram', 'twitter', 'discord', 'medium', 'github'];
    
    // Generate social update data for each validator
    return selectedValidators.map(validator => {
        const name = generateTokenNameFromAddress(validator.id);
        const randomTimeIndex = Math.floor(Math.random() * timePeriods.length);
        
        // Determine which chain this validator belongs to
        const isEthValidator = validator.id.startsWith('0x');
        const chain = isEthValidator ? 'ETH' : 'SOL';
        
        // Randomly select 1-4 platforms that were updated
        const platformCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 platforms
        const shuffledPlatforms = [...allPlatforms].sort(() => 0.5 - Math.random());
        const platforms = shuffledPlatforms.slice(0, platformCount);
        
        return {
            id: validator.id,
            name,
            logoUrl: validator.logoUrl,
            time: timePeriods[randomTimeIndex],
            chain,
            platforms
        };
    });
}

// First implementation of getTronNewTokens is removed to avoid duplication

// First implementation of getTronPreLaunchedTokens is removed to avoid duplication

/**
 * Gets all Solana validator logos from the assets directory
 * @returns Promise resolving to an array of validator IDs and their logo URLs
 */
export async function getSolanaValidatorLogos(): Promise<{ id: string, logoUrl: string }[]> {
    // Known validator IDs from the assets directory
    // This list can be expanded as new validators are added
    const validatorIds = [
        '2het6nBRLq9LLZER8fqUEk7j5pbLxq2mVGqSse2nS3tf',
        '3r5ZXC1yFqMmk8VwDdUJbEdPmZ8KZvEkzd5ThEYRetTk',
        '49DJjUX3cwFvaZD5rCAwubiz7qdRWDez9xmB381XdHru',
        '4PsiLMyoUQ7QRn1FFiFCvej4hsUTFzfvJnyN4bj1tmSN',
        '51JBzSTU5rAM8gLAVQKgp4WoZerQcSqWC7BitBzgUNAm',
        '6UDU4Z9TTbYy8gcRKBd7RX3Lm2qMsSR4PMuzoyYPzLma',
        '76nwV8zz8tLz97SBRXH6uwHvgHXtqJDLQfF66jZhQ857',
        '7Hs9z4qsGCbQE9cy2aqgsvWupeZZGiKJgeb1eG4ZKYUH',
        '7PmWxxiTneGteGxEYvzj5pGDVMQ4nuN9DfUypEXmaA8o',
        '7VGU4ZwR1e1AFekqbqv2gvjeg47e1PwMPm4BfLt6rxNk',
        '9GJmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD1Bs',
        '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
        '9iEFfC6qCU6DBTWxL84YQdpNmpZ9yBBu4sW62yeiEVKe',
        '9sWYTuuR4s12Q4SuSfo5CfWaFggQwA6Z8pf8dWowN5rk',
        '9tedbEYypEKXAMkHcg42rn3fXY1B8hB6cdE3ZTFouXLL',
        'BxFf75Vtzro2Hy3coFHKxFMZo5au8W7J8BmLC3gCMjLh',
        'CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1',
        'DumiCKHVqoCQKD8roLApzR5Fit8qGV5fVQsJV9sTZk4a',
        'Ev8cZfU9SQAzwQRfaiGSW9TGdaRcy1MRQEuE6FeuPq6d',
        'EvnRmnMrd69kFdbLMxWkTn1icZ7DCceRhvmb2SJXqDo4',
        'GHRvDXj9BfACkJ9CoLWbpi2UkMVti9DwXJGsaFT9XDcD',
        'GdnSyH3YtwcxFvQrVVJMm1JhTS4QVX7MFsX56uJLUfiZ',
        'SFundNVpuWk89g211WKUZGkuu4BsKSp7PbnmRsPZLos',
        'beefKGBWeSpHzYBHZXwp5So7wdQGX6mu4ZHCsH3uTar',
        'dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92',
        'dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV',
        'dv3qDFk1DTF36Z62bNvrCXe9sKATA6xvVy6A798xxAS',
        'dv4ACNkpYPcE3aKmYDnV5iVbWmJtapHfUVB6Vy2Kad5',
        'hoAk6JNCoG2QBh4Qmcy6hukDCtvLtkNmZDq1fwqEsn9'
    ];

    // Generate placeholder logos instead of dynamic imports
    return validatorIds.map(id => ({
        id,
        logoUrl: getCryptoIconUrl('sol') // Use SOL icon as placeholder
    }));
}

/**
 * Gets Ethereum validator logos from the assets directory
 * @returns Promise resolving to an array of validator IDs and their logo URLs
 */
export async function getEthereumValidatorLogos(): Promise<{ id: string, logoUrl: string }[]> {
    // Known validator IDs from the assets directory
    const validatorIds = [
        '0xc34Ef872a751A10E2a80243eF826ec0942fE3F14',
        '0xd7FC2Da6B1e60748F18dA01A80360B696518991A',
        '0xA4F9CEC920cA520a7FEB2c3A63050e08967bc111',
        '0xb4eA1e0E82814B8D357Dcf864083980972CE62AA',
        '0xC12820Bc0B40fC085e8A6Dc94809f435d099dEa2',
        '0xB8DdC930c2bAB6c71610A2BE639036E829F9C10b',
        '0xa0d440C6DA37892Dc06Ee7930B2eedE0634FD681',
        '0xd8FcAb3cB8c766Ea1aE85c624c650588958F9666',
        '0xfB3909c720516aCfA0cFf103BA228c3F2c5a815b',
        '0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F',
        '0xFc2C4D8f95002C14eD0a7aA65102Cac9e5953b5E',
        '0xF244176246168F24e3187f7288EdbCA29267739b',
        '0xEd0439EACf4c4965AE4613D77a5C2Efe10e5f183',
        '0xA20f024FCDb5dc72d067a3dFa6c3eCE338A04344',
        '0xd52C2f7D213192E3Ea1e0DF8952a49423587fc87'
    ];

    // Generate placeholder logos instead of dynamic imports
    return validatorIds.map(id => ({
        id,
        logoUrl: getCryptoIconUrl('eth') // Use ETH icon as placeholder
    }));
}

/**
 * Gets Tron token logos from the assets directory
 * @returns Promise resolving to an array of token IDs and their logo URLs
 */
export async function getTronTokenLogos(): Promise<{ id: string, logoUrl: string }[]> {
    // Known token IDs from the assets directory
    const tokenIds = [
        '1000001',
        '1000010',
        '1000017',
        '1000018',
        '1000131',
        '1000161',
        '1000226',
        '1000231',
        '1000251',
        '1000307',
        '1000317',
        '1000318',
        '1000324',
        '1000375',
        '1000391',
        '1000430',
        '1000451',
        '1000475',
        '1000554',
        '1000566',
        '1000577',
        '1000641',
        '1000709',
        '1000811'
    ];

    // Generate placeholder logos instead of dynamic imports
    return tokenIds.map(id => ({
        id,
        logoUrl: getCryptoIconUrl('trx') // Use TRX icon as placeholder
    }));
}


// Function to load tokens for a specific blockchain
export async function loadBlockchainTokens(blockchainId: string): Promise<Token[]> {
    try {
        // Instead of dynamic imports, return mock data
        if (['ethereum', 'smartchain'].includes(blockchainId)) {
            // Generate mock token data
            const mockTokens: Token[] = [
                {
                    name: 'Mock Token 1',
                    symbol: 'MTK1',
                    address: '0x1234567890abcdef1234567890abcdef12345678',
                    chainId: blockchainId === 'ethereum' ? 1 : 56,
                    decimals: 18,
                    logoURI: getCryptoIconUrl(blockchainId === 'ethereum' ? 'eth' : 'bnb'),
                    isMeme: false
                },
                {
                    name: 'Doge Token',
                    symbol: 'DOGE',
                    address: '0xabcdef1234567890abcdef1234567890abcdef12',
                    chainId: blockchainId === 'ethereum' ? 1 : 56,
                    decimals: 18,
                    logoURI: getCryptoIconUrl('doge'),
                    isMeme: true
                }
            ];
            
            return mockTokens;
        }

        // For blockchains without tokenlist.json, return empty array
        return [];
    } catch (error) {
        console.error(`Error loading tokens for ${blockchainId}:`, error);
        return [];
    }
}

/**
 * Gets new Tron tokens (mock implementation)
 * @param limit Maximum number of tokens to return
 * @returns Array of token objects
 */
export async function getTronNewTokens(limit: number = 10): Promise<any[]> {
    // Mock data for new Tron tokens
    const mockNewTokens = [
        {
            name: 'New Tron Token 1',
            symbol: 'NTT1',
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            logoUrl: getCryptoIconUrl('trx'),
            price: 0.05,
            change24h: 12.5
        },
        {
            name: 'New Tron Token 2',
            symbol: 'NTT2',
            address: 'TKfjV9RNKJJCqPvBtK8L4Nqab1Hf4uHfxe',
            logoUrl: getCryptoIconUrl('trx'),
            price: 0.02,
            change24h: -5.2
        },
        {
            name: 'New Tron Token 3',
            symbol: 'NTT3',
            address: 'TWsm8HtU2A5eEzoT8ev8yaoFjHsXLLrckb',
            logoUrl: getCryptoIconUrl('trx'),
            price: 0.10,
            change24h: 3.7
        },
        {
            name: 'New Tron Token 4',
            symbol: 'NTT4',
            address: 'TF5Bn4cJCT6GVeUgyCN4rBhDg42KBrpAjg',
            logoUrl: getCryptoIconUrl('trx'),
            price: 0.008,
            change24h: 25.1
        },
        {
            name: 'New Tron Token 5',
            symbol: 'NTT5',
            address: 'TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ',
            logoUrl: getCryptoIconUrl('trx'),
            price: 0.15,
            change24h: -1.8
        }
    ];
    
    return mockNewTokens.slice(0, limit);
}

/**
 * Gets pre-launched Tron tokens (mock implementation)
 * @param limit Maximum number of tokens to return
 * @returns Array of token objects
 */
export async function getTronPreLaunchedTokens(limit: number = 10): Promise<any[]> {
    // Mock data for pre-launched Tron tokens
    const mockPreLaunchedTokens = [
        {
            name: 'Pre-Launch Token 1',
            symbol: 'PLT1',
            address: 'TYMwiDu22QT7yUZBxBpDfmAeVNwhdz8AsS',
            logoUrl: getCryptoIconUrl('trx'),
            launchDate: '2023-12-15',
            initialPrice: 0.03
        },
        {
            name: 'Pre-Launch Token 2',
            symbol: 'PLT2',
            address: 'TRWzJ1fsU4WdKhNXLUyGVdPLfKgGvJy31c',
            logoUrl: getCryptoIconUrl('trx'),
            launchDate: '2023-12-20',
            initialPrice: 0.05
        },
        {
            name: 'Pre-Launch Token 3',
            symbol: 'PLT3',
            address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
            logoUrl: getCryptoIconUrl('trx'),
            launchDate: '2023-12-25',
            initialPrice: 0.01
        },
        {
            name: 'Pre-Launch Token 4',
            symbol: 'PLT4',
            address: 'TVjAFAnpFb7ZmqM3RKsEef4CL9k2jvDkAo',
            logoUrl: getCryptoIconUrl('trx'),
            launchDate: '2023-12-30',
            initialPrice: 0.08
        },
        {
            name: 'Pre-Launch Token 5',
            symbol: 'PLT5',
            address: 'TGuGnbnUAao1Rcy5c3zD7XbKiA3T6oKQQQ',
            logoUrl: getCryptoIconUrl('trx'),
            launchDate: '2024-01-05',
            initialPrice: 0.12
        }
    ];
    
    return mockPreLaunchedTokens.slice(0, limit);
}

/**
 * Gets meme tokens across different blockchains
 * @param limit Maximum number of tokens to return
 * @returns Array of meme tokens
 */
export async function getMemeTokens(limit: number = 10): Promise<any[]> {
    // Mock data for meme tokens
    const mockMemeTokens = [
        {
            name: 'Dogecoin',
            symbol: 'DOGE',
            blockchain: 'dogecoin',
            logoUrl: getCryptoIconUrl('doge'),
            price: 0.12,
            change24h: 5.2
        },
        {
            name: 'Shiba Inu',
            symbol: 'SHIB',
            blockchain: 'ethereum',
            logoUrl: getCryptoIconUrl('shib'),
            price: 0.00002,
            change24h: 3.7
        },
        {
            name: 'Pepe',
            symbol: 'PEPE',
            blockchain: 'ethereum',
            logoUrl: getCryptoIconUrl('eth'),
            price: 0.000001,
            change24h: 15.3
        },
        {
            name: 'Floki Inu',
            symbol: 'FLOKI',
            blockchain: 'ethereum',
            logoUrl: getCryptoIconUrl('eth'),
            price: 0.0002,
            change24h: -2.1
        },
        {
            name: 'SafeMoon',
            symbol: 'SAFEMOON',
            blockchain: 'smartchain',
            logoUrl: getCryptoIconUrl('bnb'),
            price: 0.0000001,
            change24h: -8.5
        }
    ];
    
    return mockMemeTokens.slice(0, limit);
}

// Helper function to identify meme tokens based on name or symbol
// This is a simple heuristic - in a real app, you might want a more sophisticated approach
function isMemeToken(token: Token): boolean {
    const memeKeywords = [
        'doge', 'shib', 'inu', 'floki', 'elon', 'moon', 'safe', 'pepe',
        'cat', 'meme', 'wojak', 'chad', 'based', 'cum', 'rocket', 'moon',
        'lambo', 'diamond', 'hands', 'ape', 'monkey', 'gorilla', 'banana'
    ];

    const name = token.name.toLowerCase();
    const symbol = token.symbol.toLowerCase();

    return memeKeywords.some(keyword =>
        name.includes(keyword) || symbol.includes(keyword)
    );
}

// Function to load all blockchain tokens
export async function loadAllBlockchainTokens(): Promise<BlockchainTokens[]> {
    const results: BlockchainTokens[] = [];

    for (const blockchain of supportedBlockchains) {
        const tokens = await loadBlockchainTokens(blockchain.id);
        if (tokens.length > 0) {
            results.push({
                blockchain,
                tokens
            });
        }
    }

    return results;
}

// Function to get all meme tokens across supported blockchains
export async function getAllMemeTokens(): Promise<BlockchainTokens[]> {
    const results: BlockchainTokens[] = [];

    for (const blockchain of supportedBlockchains) {
        const tokens = await loadBlockchainTokens(blockchain.id);
        const memeTokens = tokens.filter(token => token.isMeme);

        if (memeTokens.length > 0) {
            results.push({
                blockchain,
                tokens: memeTokens
            });
        }
    }

    return results;
}
