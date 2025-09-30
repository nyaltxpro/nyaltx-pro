#!/usr/bin/env node

/**
 * Script to fetch top 400 coins from CoinGecko API with rate limiting optimization
 * Saves results to JSON file with coin data including contract addresses
 */

const fs = require('fs');
const path = require('path');

// Rate limiting configuration (optimized based on CoinGecko experience)
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds between requests (safer for free tier)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries
const BATCH_SIZE = 3; // Process 3 coins at a time (based on optimization experience)

// API configuration
const BASE_URL = 'https://api.coingecko.com/api/v3';
const USER_AGENT = 'NYALTX-CoinFetcher/1.0';

/**
 * Sleep utility function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and rate limiting
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
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
        const data = await response.json();
        console.log(`✅ Success: Fetched ${data.length} coins`);
        return data;
      } else if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('retry-after') || 60;
        console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds...`);
        await sleep(retryAfter * 1000);
        continue;
      } else {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        if (attempt === retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
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
}

/**
 * Fetch contract addresses for a coin
 */
async function fetchContractAddresses(coinId, retries = 2) {
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
        const contractAddresses = {};
        const platformMapping = {
          'ethereum': 'ethereum',
          'binance-smart-chain': 'binance',
          'polygon-pos': 'polygon',
          'arbitrum-one': 'arbitrum',
          'optimistic-ethereum': 'optimism',
          'base': 'base',
          'fantom': 'fantom',
          'avalanche': 'avalanche',
          'solana': 'solana'
        };
        
        if (data.platforms) {
          Object.entries(data.platforms).forEach(([platform, address]) => {
            const chainName = platformMapping[platform];
            if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
              contractAddresses[chainName] = address;
            }
          });
        }
        
        // Determine primary chain
        const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'fantom', 'solana'];
        const primaryChain = chainPriority.find(chain => contractAddresses[chain]) || 
                           Object.keys(contractAddresses)[0] || null;
        
        return {
          contractAddresses,
          primaryChain,
          primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
        };
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || 5;
        console.log(`⏳ Rate limited on ${coinId}, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      } else {
        console.log(`❌ Failed to fetch ${coinId}: HTTP ${response.status}`);
        return { contractAddresses: {}, primaryChain: null, primaryAddress: null };
      }
    } catch (error) {
      if (attempt === retries) {
        console.log(`❌ Final attempt failed for ${coinId}: ${error.message}`);
        return { contractAddresses: {}, primaryChain: null, primaryAddress: null };
      }
      await sleep(1000 * attempt);
    }
  }
}

/**
 * Main function to fetch top 400 coins
 */
async function fetchTop400Coins() {
  console.log('🚀 Starting to fetch top 400 coins from CoinGecko...\n');
  
  const allCoins = [];
  const startTime = Date.now();
  
  try {
    // Fetch first 250 coins (page 1)
    console.log('📊 Fetching coins 1-250...');
    const page1Url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
    const page1Data = await fetchWithRetry(page1Url);
    allCoins.push(...page1Data);
    
    console.log(`✅ Fetched ${page1Data.length} coins from page 1`);
    
    // Rate limiting delay
    console.log(`⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next request...`);
    await sleep(RATE_LIMIT_DELAY);
    
    // Fetch next 150 coins (page 2)
    console.log('📊 Fetching coins 251-400...');
    const page2Url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=2&sparkline=false`;
    const page2Data = await fetchWithRetry(page2Url);
    allCoins.push(...page2Data);
    
    console.log(`✅ Fetched ${page2Data.length} coins from page 2`);
    console.log(`📈 Total coins fetched: ${allCoins.length}\n`);
    
    // Process coins with contract addresses (in batches to avoid overwhelming API)
    console.log('🔍 Fetching contract addresses for all coins...');
    console.log(`📊 Using optimized batch processing (${BATCH_SIZE} coins per batch)`);
    const processedCoins = [];
    
    for (let i = 0; i < allCoins.length; i += BATCH_SIZE) {
      const batch = allCoins.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allCoins.length/BATCH_SIZE);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (coins ${i + 1}-${Math.min(i + BATCH_SIZE, allCoins.length)})`);
      
      // Create progress bar
      const progress = Math.round((i / allCoins.length) * 100);
      const progressBar = '█'.repeat(Math.floor(progress/5)) + '░'.repeat(20 - Math.floor(progress/5));
      console.log(`   [${progressBar}] ${progress}% (${i}/${allCoins.length})`);
      
      // Process batch in parallel with controlled concurrency
      const batchPromises = batch.map(async (coin) => {
        const contractData = await fetchContractAddresses(coin.id, 2); // Reduced retries for batch processing
        
        return {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          fully_diluted_valuation: coin.fully_diluted_valuation,
          total_volume: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap_change_24h: coin.market_cap_change_24h,
          market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
          circulating_supply: coin.circulating_supply,
          total_supply: coin.total_supply,
          max_supply: coin.max_supply,
          ath: coin.ath,
          ath_change_percentage: coin.ath_change_percentage,
          ath_date: coin.ath_date,
          atl: coin.atl,
          atl_change_percentage: coin.atl_change_percentage,
          atl_date: coin.atl_date,
          last_updated: coin.last_updated,
          // Enhanced contract address data
          contract_addresses: contractData.contractAddresses,
          primary_chain: contractData.primaryChain,
          primary_address: contractData.primaryAddress
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      processedCoins.push(...batchResults);
      
      // Rate limiting between batches
      if (i + batchSize < allCoins.length) {
        console.log(`⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next batch...`);
        await sleep(RATE_LIMIT_DELAY);
      }
    }
    
    // Prepare final data structure
    const finalData = {
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
      coin.contract_addresses && Object.keys(coin.contract_addresses).length > 0
    );
    
    // Chain distribution statistics
    const chainStats = {};
    processedCoins.forEach(coin => {
      if (coin.contractAddresses) {
        Object.keys(coin.contractAddresses).forEach(chain => {
          chainStats[chain] = (chainStats[chain] || 0) + 1;
        });
      }
    });
    
    console.log('\n🎉 SUCCESS! Top 400 coins fetched and saved!');
    console.log('📊 STATISTICS:');
    console.log(`   • Total coins: ${processedCoins.length}`);
    console.log(`   • Coins with contract addresses: ${coinsWithAddresses.length} (${Math.round(coinsWithAddresses.length/processedCoins.length*100)}%)`);
    console.log(`   • Total execution time: ${duration} seconds`);
    console.log(`   • Average time per coin: ${Math.round(duration/processedCoins.length*100)/100} seconds`);
    console.log(`   • API calls made: ~${processedCoins.length + 2} (2 market calls + ${processedCoins.length} detail calls)`);
    console.log(`   • Success rate: ${Math.round(coinsWithAddresses.length/processedCoins.length*100)}%`);
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
    processedCoins.slice(0, 3).forEach((coin, index) => {
      console.log(`   ${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`);
      console.log(`      • Market Cap Rank: #${coin.market_cap_rank}`);
      console.log(`      • Price: $${coin.current_price}`);
      console.log(`      • Primary Chain: ${coin.primary_chain || 'N/A'}`);
      console.log(`      • Contract Address: ${coin.primary_address ? coin.primary_address.slice(0, 10) + '...' : 'N/A'}`);
      console.log(`      • Available Chains: ${Object.keys(coin.contract_addresses).length}`);
    });
    
    return finalData;
    
  } catch (error) {
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

module.exports = { fetchTop400Coins };
