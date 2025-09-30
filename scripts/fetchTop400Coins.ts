#!/usr/bin/env tsx

/**
 * TypeScript script to fetch top 400 coins from CoinGecko API with rate limiting optimization
 * Saves results to JSON file with coin data including contract addresses
 */

import fs from 'fs';
import path from 'path';

// Types
interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface ContractAddressData {
  contractAddresses: { [chain: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

interface EnhancedCoinData extends CoinGeckoMarketData {
  contract_addresses: { [chain: string]: string };
  primary_chain: string | null;
  primary_address: string | null;
}

interface FinalDataStructure {
  metadata: {
    total_coins: number;
    fetched_at: string;
    source: string;
    currency: string;
    order: string;
    description: string;
  };
  coins: EnhancedCoinData[];
}

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1200; // 1.2 seconds between requests (safe for free tier)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

// API configuration
const BASE_URL = 'https://api.coingecko.com/api/v3';
const USER_AGENT = 'NYALTX-CoinFetcher/1.0';

// Platform mapping for contract addresses
const PLATFORM_MAPPING: { [key: string]: string } = {
  'ethereum': 'ethereum',
  'binance-smart-chain': 'binance',
  'polygon-pos': 'polygon',
  'arbitrum-one': 'arbitrum',
  'optimistic-ethereum': 'optimism',
  'base': 'base',
  'fantom': 'fantom',
  'avalanche': 'avalanche',
  'solana': 'solana',
  'xdai': 'gnosis',
  'harmony-shard-0': 'harmony',
  'moonbeam': 'moonbeam',
  'cronos': 'cronos'
};

const CHAIN_PRIORITY = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'fantom', 'solana'];

/**
 * Sleep utility function
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and rate limiting
 */
async function fetchWithRetry<T>(url: string, retries: number = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Fetching: ${url} (Attempt ${attempt}/${retries})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json() as T;
        if (Array.isArray(data)) {
          console.log(`✅ Success: Fetched ${data.length} items`);
        } else {
          console.log(`✅ Success: Fetched data`);
        }
        return data;
      } else if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('retry-after') || '60';
        const waitTime = parseInt(retryAfter);
        console.log(`⏳ Rate limited. Waiting ${waitTime} seconds...`);
        await sleep(waitTime * 1000);
        continue;
      } else {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        if (attempt === retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⏱️ Request timeout (attempt ${attempt})`);
      } else {
        console.log(`❌ Error: ${error.message} (attempt ${attempt})`);
      }
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await sleep(delay);
    }
  }
  
  throw new Error('All retry attempts failed');
}

/**
 * Fetch contract addresses for a coin
 */
async function fetchContractAddresses(coinId: string, retries: number = 2): Promise<ContractAddressData> {
  const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Process contract addresses
        const contractAddresses: { [chain: string]: string } = {};
        
        if (data.platforms) {
          Object.entries(data.platforms).forEach(([platform, address]) => {
            const chainName = PLATFORM_MAPPING[platform];
            if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
              contractAddresses[chainName] = address as string;
            }
          });
        }
        
        // Determine primary chain
        const primaryChain = CHAIN_PRIORITY.find(chain => contractAddresses[chain]) || 
                           Object.keys(contractAddresses)[0] || null;
        
        return {
          contractAddresses,
          primaryChain,
          primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
        };
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || '5';
        const waitTime = parseInt(retryAfter);
        console.log(`⏳ Rate limited on ${coinId}, waiting ${waitTime}s...`);
        await sleep(waitTime * 1000);
        continue;
      } else {
        console.log(`❌ Failed to fetch ${coinId}: HTTP ${response.status}`);
        return { contractAddresses: {}, primaryChain: null, primaryAddress: null };
      }
    } catch (error: any) {
      if (attempt === retries) {
        console.log(`❌ Final attempt failed for ${coinId}: ${error.message}`);
        return { contractAddresses: {}, primaryChain: null, primaryAddress: null };
      }
      await sleep(1000 * attempt);
    }
  }
  
  return { contractAddresses: {}, primaryChain: null, primaryAddress: null };
}

/**
 * Create progress bar
 */
function createProgressBar(current: number, total: number, width: number = 30): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}% (${current}/${total})`;
}

/**
 * Main function to fetch top 400 coins
 */
async function fetchTop400Coins(): Promise<FinalDataStructure> {
  console.log('🚀 Starting to fetch top 400 coins from CoinGecko...\n');
  
  const allCoins: CoinGeckoMarketData[] = [];
  const startTime = Date.now();
  
  try {
    // Fetch first 250 coins (page 1)
    console.log('📊 Fetching coins 1-250...');
    const page1Url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
    const page1Data = await fetchWithRetry<CoinGeckoMarketData[]>(page1Url);
    allCoins.push(...page1Data);
    
    console.log(`✅ Fetched ${page1Data.length} coins from page 1`);
    
    // Rate limiting delay
    console.log(`⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next request...`);
    await sleep(RATE_LIMIT_DELAY);
    
    // Fetch next 150 coins (page 2)
    console.log('📊 Fetching coins 251-400...');
    const page2Url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=2&sparkline=false`;
    const page2Data = await fetchWithRetry<CoinGeckoMarketData[]>(page2Url);
    allCoins.push(...page2Data);
    
    console.log(`✅ Fetched ${page2Data.length} coins from page 2`);
    console.log(`📈 Total coins fetched: ${allCoins.length}\n`);
    
    // Process coins with contract addresses (in batches to avoid overwhelming API)
    console.log('🔍 Fetching contract addresses for all coins...');
    const batchSize = 5; // Process 5 coins at a time
    const processedCoins: EnhancedCoinData[] = [];
    
    for (let i = 0; i < allCoins.length; i += batchSize) {
      const batch = allCoins.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(allCoins.length/batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (coins ${i + 1}-${Math.min(i + batchSize, allCoins.length)})`);
      console.log(`   ${createProgressBar(i, allCoins.length)}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (coin): Promise<EnhancedCoinData> => {
        const contractData = await fetchContractAddresses(coin.id);
        
        return {
          ...coin,
          contract_addresses: contractData.contractAddresses,
          primary_chain: contractData.primaryChain,
          primary_address: contractData.primaryAddress
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      processedCoins.push(...batchResults);
      
      // Show some stats for this batch
      const batchWithAddresses = batchResults.filter(coin => 
        Object.keys(coin.contract_addresses).length > 0
      );
      console.log(`   ✅ Batch complete: ${batchWithAddresses.length}/${batchResults.length} coins have contract addresses`);
      
      // Rate limiting between batches
      if (i + batchSize < allCoins.length) {
        console.log(`   ⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next batch...`);
        await sleep(RATE_LIMIT_DELAY);
      }
    }
    
    console.log(`\n${createProgressBar(allCoins.length, allCoins.length)}`);
    
    // Prepare final data structure
    const finalData: FinalDataStructure = {
      metadata: {
        total_coins: processedCoins.length,
        fetched_at: new Date().toISOString(),
        source: 'CoinGecko API',
        currency: 'usd',
        order: 'market_cap_desc',
        description: 'Top 400 cryptocurrencies by market cap with contract addresses'
      },
      coins: processedCoins
    };
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'top400coins.json');
    const outputDir = path.dirname(outputPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Statistics
    const coinsWithAddresses = processedCoins.filter(coin => 
      Object.keys(coin.contract_addresses).length > 0
    );
    
    const chainStats: { [chain: string]: number } = {};
    processedCoins.forEach(coin => {
      Object.keys(coin.contract_addresses).forEach(chain => {
        chainStats[chain] = (chainStats[chain] || 0) + 1;
      });
    });
    
    console.log('\n🎉 SUCCESS! Top 400 coins fetched and saved!');
    console.log('📊 STATISTICS:');
    console.log(`   • Total coins: ${processedCoins.length}`);
    console.log(`   • Coins with contract addresses: ${coinsWithAddresses.length} (${Math.round(coinsWithAddresses.length/processedCoins.length*100)}%)`);
    console.log(`   • Total execution time: ${duration} seconds`);
    console.log(`   • Average time per coin: ${Math.round(duration/processedCoins.length*100)/100} seconds`);
    console.log(`   • Output file: ${outputPath}`);
    console.log(`   • File size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
    
    console.log('\n🔗 CHAIN DISTRIBUTION:');
    Object.entries(chainStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([chain, count]) => {
        console.log(`   • ${chain}: ${count} tokens`);
      });
    
    // Show some examples
    console.log('\n🔍 SAMPLE DATA:');
    processedCoins.slice(0, 5).forEach((coin, index) => {
      console.log(`   ${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`);
      console.log(`      • Market Cap Rank: #${coin.market_cap_rank}`);
      console.log(`      • Price: $${coin.current_price?.toLocaleString() || 'N/A'}`);
      console.log(`      • Market Cap: $${coin.market_cap?.toLocaleString() || 'N/A'}`);
      console.log(`      • Primary Chain: ${coin.primary_chain || 'N/A'}`);
      console.log(`      • Contract Address: ${coin.primary_address ? coin.primary_address.slice(0, 10) + '...' : 'N/A'}`);
      console.log(`      • Available Chains: ${Object.keys(coin.contract_addresses).length}`);
      if (Object.keys(coin.contract_addresses).length > 0) {
        console.log(`      • Chains: ${Object.keys(coin.contract_addresses).join(', ')}`);
      }
    });
    
    return finalData;
    
  } catch (error: any) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fetchTop400Coins()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { fetchTop400Coins, type FinalDataStructure, type EnhancedCoinData };
