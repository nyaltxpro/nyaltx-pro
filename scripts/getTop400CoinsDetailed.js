#!/usr/bin/env node

/**
 * Enhanced script to fetch top 400 coins with detailed information
 * Includes contract addresses, descriptions, platforms, and links
 * Uses individual coin API endpoints for comprehensive data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between detailed requests (more conservative)
const BATCH_DELAY = 5000; // 5 seconds between batches
const MAX_RETRIES = 3;
const BATCH_SIZE = 10; // Process 10 coins at a time
const OUTPUT_FILE = 'top400coins-detailed.json';

/**
 * Sleep utility function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and proper error handling
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-DetailedCoinFetcher/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
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
      console.log(`❌ Error: ${error.message} (attempt ${attempt})`);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = 3000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await sleep(delay);
    }
  }
}

/**
 * Fetch detailed coin information
 */
async function fetchCoinDetails(coinId, index, total) {
  try {
    console.log(`🔍 Fetching details for ${coinId} (${index}/${total})`);
    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const data = await fetchWithRetry(url);
    
    // Extract the information we need
    const detailedCoin = {
      index: index,
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      web_slug: data.web_slug,
      image: data.image,
      
      // Contract addresses and platforms (handle native tokens)
      asset_platform_id: data.asset_platform_id,
      platforms: data.platforms && Object.keys(data.platforms).length > 0 && data.platforms[''] !== '' ? data.platforms : {},
      detail_platforms: data.detail_platforms && Object.keys(data.detail_platforms).length > 0 && !data.detail_platforms[''] ? data.detail_platforms : {},
      is_native_token: !data.asset_platform_id || data.asset_platform_id === null,
      
      // Market data
      current_price: data.market_data?.current_price?.usd || null,
      market_cap: data.market_data?.market_cap?.usd || null,
      market_cap_rank: data.market_data?.market_cap_rank || null,
      total_volume: data.market_data?.total_volume?.usd || null,
      price_change_24h: data.market_data?.price_change_24h || null,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || null,
      
      // Additional information
      description: data.description?.en || '',
      categories: data.categories || [],
      links: {
        homepage: data.links?.homepage || [],
        whitepaper: data.links?.whitepaper || '',
        blockchain_site: data.links?.blockchain_site || [],
        official_forum_url: data.links?.official_forum_url || [],
        chat_url: data.links?.chat_url || [],
        announcement_url: data.links?.announcement_url || [],
        twitter_screen_name: data.links?.twitter_screen_name || '',
        facebook_username: data.links?.facebook_username || '',
        telegram_channel_identifier: data.links?.telegram_channel_identifier || '',
        subreddit_url: data.links?.subreddit_url || '',
        repos_url: data.links?.repos_url || { github: [], bitbucket: [] }
      },
      
      // Technical details
      block_time_in_minutes: data.block_time_in_minutes,
      hashing_algorithm: data.hashing_algorithm,
      country_origin: data.country_origin || '',
      
      // Timestamps
      genesis_date: data.genesis_date,
      last_updated: data.last_updated
    };
    
    // Log success with contract info
    const platformCount = Object.keys(detailedCoin.platforms).length;
    if (detailedCoin.is_native_token) {
      console.log(`🪙 ${coinId}: Native blockchain token (no contract address)`);
    } else if (platformCount > 0) {
      console.log(`✅ ${coinId}: Found contracts on ${platformCount} platforms`);
    } else {
      console.log(`⚠️ ${coinId}: No contract addresses found`);
    }
    
    return detailedCoin;
    
  } catch (error) {
    console.log(`❌ Failed to fetch details for ${coinId}: ${error.message}`);
    
    // Return basic info if detailed fetch fails
    return {
      index: index,
      id: coinId,
      symbol: coinId,
      name: coinId,
      error: `Failed to fetch: ${error.message}`,
      platforms: {},
      detail_platforms: {},
      description: '',
      links: {},
      last_updated: new Date().toISOString()
    };
  }
}

/**
 * Create progress bar
 */
function createProgressBar(current, total, width = 40) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}% (${current}/${total})`;
}

/**
 * Main function to get detailed coin information
 */
async function getTop400CoinsDetailed() {
  console.log('🚀 Starting to fetch detailed information for top 400 coins...\n');
  
  const startTime = Date.now();
  
  try {
    // First, read the simple coins data to get the coin IDs
    const simpleDataPath = path.join(__dirname, 'top400coins-simple.json');
    
    if (!fs.existsSync(simpleDataPath)) {
      throw new Error('Simple coins data not found. Please run the simple script first.');
    }
    
    const simpleData = JSON.parse(fs.readFileSync(simpleDataPath, 'utf8'));
    const coins = simpleData.coins;
    
    console.log(`📊 Found ${coins.length} coins to process`);
    console.log(`⚙️ Using batch size: ${BATCH_SIZE} coins per batch`);
    console.log(`⏱️ Rate limiting: ${RATE_LIMIT_DELAY/1000}s between requests, ${BATCH_DELAY/1000}s between batches\n`);
    
    const detailedCoins = [];
    const totalBatches = Math.ceil(coins.length / BATCH_SIZE);
    
    // Process coins in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, coins.length);
      const batch = coins.slice(startIdx, endIdx);
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (coins ${startIdx + 1}-${endIdx})`);
      console.log(`   ${createProgressBar(startIdx, coins.length)}`);
      
      // Process batch sequentially to respect rate limits
      for (let i = 0; i < batch.length; i++) {
        const coin = batch[i];
        const globalIndex = startIdx + i + 1;
        
        const detailedCoin = await fetchCoinDetails(coin.id, globalIndex, coins.length);
        detailedCoins.push(detailedCoin);
        
        // Rate limiting between individual requests
        if (i < batch.length - 1) {
          await sleep(RATE_LIMIT_DELAY);
        }
      }
      
      // Show batch statistics
      const batchWithContracts = detailedCoins.slice(startIdx).filter(coin => 
        coin.platforms && Object.keys(coin.platforms).length > 0
      );
      console.log(`   ✅ Batch ${batchIndex + 1} complete: ${batchWithContracts.length}/${batch.length} coins have contract addresses`);
      
      // Longer delay between batches
      if (batchIndex < totalBatches - 1) {
        console.log(`   ⏳ Waiting ${BATCH_DELAY/1000}s before next batch...\n`);
        await sleep(BATCH_DELAY);
      }
    }
    
    console.log(`\n${createProgressBar(coins.length, coins.length)}`);
    
    // Prepare final data structure
    const finalData = {
      metadata: {
        total_coins: detailedCoins.length,
        fetched_at: new Date().toISOString(),
        source: 'CoinGecko API (Detailed)',
        currency: 'usd',
        order: 'market_cap_desc',
        description: 'Top 400 cryptocurrencies with detailed information including contract addresses, descriptions, and links',
        data_includes: [
          'contract_addresses',
          'platforms',
          'descriptions',
          'social_links',
          'categories',
          'market_data'
        ]
      },
      coins: detailedCoins
    };
    
    // Save to JSON file
    const outputPath = path.join(__dirname, OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Statistics
    const coinsWithContracts = detailedCoins.filter(coin => 
      coin.platforms && Object.keys(coin.platforms).length > 0
    );
    
    const nativeTokens = detailedCoins.filter(coin => coin.is_native_token);
    const contractTokens = detailedCoins.filter(coin => !coin.is_native_token);
    
    const coinsWithDescriptions = detailedCoins.filter(coin => 
      coin.description && coin.description.length > 0
    );
    
    const coinsWithLinks = detailedCoins.filter(coin => 
      coin.links && (
        (coin.links.homepage && coin.links.homepage.length > 0) ||
        coin.links.twitter_screen_name ||
        coin.links.telegram_channel_identifier
      )
    );
    
    // Platform statistics
    const platformStats = {};
    detailedCoins.forEach(coin => {
      if (coin.platforms) {
        Object.keys(coin.platforms).forEach(platform => {
          platformStats[platform] = (platformStats[platform] || 0) + 1;
        });
      }
    });
    
    console.log('\n🎉 SUCCESS! Detailed information fetched for all coins!');
    console.log('📊 STATISTICS:');
    console.log(`   • Total coins processed: ${detailedCoins.length}`);
    console.log(`   • Native blockchain tokens: ${nativeTokens.length} (${Math.round(nativeTokens.length/detailedCoins.length*100)}%)`);
    console.log(`   • Contract-based tokens: ${contractTokens.length} (${Math.round(contractTokens.length/detailedCoins.length*100)}%)`);
    console.log(`   • Coins with contract addresses: ${coinsWithContracts.length} (${Math.round(coinsWithContracts.length/detailedCoins.length*100)}%)`);
    console.log(`   • Coins with descriptions: ${coinsWithDescriptions.length} (${Math.round(coinsWithDescriptions.length/detailedCoins.length*100)}%)`);
    console.log(`   • Coins with social links: ${coinsWithLinks.length} (${Math.round(coinsWithLinks.length/detailedCoins.length*100)}%)`);
    console.log(`   • Total execution time: ${Math.floor(duration/60)}m ${duration%60}s`);
    console.log(`   • Average time per coin: ${Math.round(duration/detailedCoins.length*100)/100} seconds`);
    console.log(`   • API calls made: ~${detailedCoins.length + 2} calls`);
    console.log(`   • Output file: ${outputPath}`);
    console.log(`   • File size: ${Math.round(fs.statSync(outputPath).size / 1024 / 1024 * 100)/100} MB`);
    
    console.log('\n🔗 PLATFORM DISTRIBUTION:');
    Object.entries(platformStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([platform, count]) => {
        console.log(`   • ${platform}: ${count} tokens`);
      });
    
    // Show some examples
    console.log('\n🔍 SAMPLE DETAILED DATA:');
    detailedCoins.slice(0, 3).forEach((coin, idx) => {
      const platformCount = Object.keys(coin.platforms || {}).length;
      const hasDescription = coin.description && coin.description.length > 0;
      const hasHomepage = coin.links?.homepage && coin.links.homepage.length > 0;
      
      console.log(`   ${idx + 1}. ${coin.name} (${coin.symbol?.toUpperCase() || 'N/A'})`);
      console.log(`      • Index: #${coin.index}`);
      console.log(`      • Platforms: ${platformCount} chains`);
      if (platformCount > 0) {
        console.log(`      • Chains: ${Object.keys(coin.platforms).join(', ')}`);
      }
      console.log(`      • Description: ${hasDescription ? 'Yes' : 'No'}`);
      console.log(`      • Homepage: ${hasHomepage ? coin.links.homepage[0] : 'None'}`);
      console.log(`      • Twitter: ${coin.links?.twitter_screen_name || 'None'}`);
      if (coin.categories && coin.categories.length > 0) {
        console.log(`      • Categories: ${coin.categories.slice(0, 3).join(', ')}${coin.categories.length > 3 ? '...' : ''}`);
      }
    });
    
    return finalData;
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  getTop400CoinsDetailed()
    .then(() => {
      console.log('\n✅ Detailed coin fetching completed successfully!');
      console.log(`📁 Data saved to: ${OUTPUT_FILE}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { getTop400CoinsDetailed };
