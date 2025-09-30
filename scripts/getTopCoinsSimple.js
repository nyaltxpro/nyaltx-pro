#!/usr/bin/env node

/**
 * Simple script to fetch top 400 coins from CoinGecko with name, image, and price
 * Saves results to JSON file with proper error handling and rate limiting
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds between requests
const MAX_RETRIES = 3;
const OUTPUT_FILE = 'top400coins-simple.json';

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
      console.log(`🔄 Fetching: ${url.split('?')[0]} (Attempt ${attempt}/${retries})`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-TopCoins/1.0'
        }
      });

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
      console.log(`❌ Error: ${error.message} (attempt ${attempt})`);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = 2000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await sleep(delay);
    }
  }
}

/**
 * Create progress bar
 */
function createProgressBar(current, total, width = 30) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}% (${current}/${total})`;
}

/**
 * Main function to get top coins
 */
async function getTopCoins() {
  console.log('🚀 Starting to fetch top 400 coins from CoinGecko...\n');
  
  const startTime = Date.now();
  let allCoins = [];

  try {
    // Define URLs for fetching top 400 coins
    const urls = [
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false",
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=2&sparkline=false"
    ];

    // Fetch data from both URLs
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const pageNumber = i + 1;
      const expectedCoins = pageNumber === 1 ? 250 : 150;
      
      console.log(`📊 Fetching page ${pageNumber} (coins ${pageNumber === 1 ? '1-250' : '251-400'})...`);
      console.log(`   ${createProgressBar(i, urls.length)}`);
      
      const data = await fetchWithRetry(url);
      
      // Filter and format the data - keep name, image, and price with index
      const startIndex = pageNumber === 1 ? 0 : 250;
      const filtered = data.map((coin, index) => ({
        index: startIndex + index + 1,
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        total_volume: coin.total_volume,
        last_updated: coin.last_updated
      }));

      allCoins = allCoins.concat(filtered);
      console.log(`✅ Page ${pageNumber} complete: ${filtered.length} coins added`);
      
      // Rate limiting between requests
      if (i < urls.length - 1) {
        console.log(`⏳ Waiting ${RATE_LIMIT_DELAY/1000}s before next request...`);
        await sleep(RATE_LIMIT_DELAY);
      }
    }

    console.log(`\n${createProgressBar(urls.length, urls.length)}`);
    console.log(`📈 Total coins fetched: ${allCoins.length}`);

    // Prepare final data structure
    const finalData = {
      metadata: {
        total_coins: allCoins.length,
        fetched_at: new Date().toISOString(),
        source: 'CoinGecko API',
        currency: 'usd',
        order: 'market_cap_desc',
        description: 'Top 400 cryptocurrencies by market cap with basic data'
      },
      coins: allCoins
    };

    // Save to JSON file
    const outputPath = path.join(__dirname, OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Statistics
    const avgPrice = allCoins.reduce((sum, coin) => sum + (coin.current_price || 0), 0) / allCoins.length;
    const totalMarketCap = allCoins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    
    console.log('\n🎉 SUCCESS! Top 400 coins fetched and saved!');
    console.log('📊 STATISTICS:');
    console.log(`   • Total coins: ${allCoins.length}`);
    console.log(`   • Average price: $${avgPrice.toFixed(4)}`);
    console.log(`   • Total market cap: $${totalMarketCap.toLocaleString()}`);
    console.log(`   • Execution time: ${duration} seconds`);
    console.log(`   • Output file: ${outputPath}`);
    console.log(`   • File size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);

    // Show price ranges
    const prices = allCoins.map(c => c.current_price).filter(p => p > 0).sort((a, b) => b - a);
    console.log('\n💰 PRICE RANGES:');
    console.log(`   • Highest price: $${prices[0]?.toLocaleString() || 'N/A'}`);
    console.log(`   • Lowest price: $${prices[prices.length - 1]?.toFixed(8) || 'N/A'}`);
    console.log(`   • Median price: $${prices[Math.floor(prices.length/2)]?.toFixed(4) || 'N/A'}`);

    // Show some examples
    console.log('\n🔍 SAMPLE DATA:');
    allCoins.slice(0, 5).forEach((coin) => {
      const priceChange = coin.price_change_percentage_24h;
      const changeIcon = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
      
      console.log(`   ${coin.index}. ${coin.name} (${coin.symbol.toUpperCase()})`);
      console.log(`      • Index: #${coin.index}`);
      console.log(`      • Rank: #${coin.market_cap_rank}`);
      console.log(`      • Price: $${coin.current_price?.toLocaleString() || 'N/A'}`);
      console.log(`      • 24h Change: ${changeIcon} ${priceChange?.toFixed(2) || 'N/A'}%`);
      console.log(`      • Market Cap: $${coin.market_cap?.toLocaleString() || 'N/A'}`);
      console.log(`      • Volume: $${coin.total_volume?.toLocaleString() || 'N/A'}`);
    });

    // Show top gainers and losers
    const gainers = allCoins
      .filter(c => c.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 3);
    
    const losers = allCoins
      .filter(c => c.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 3);

    if (gainers.length > 0) {
      console.log('\n📈 TOP GAINERS (24h):');
      gainers.forEach((coin, index) => {
        console.log(`   ${index + 1}. ${coin.name}: +${coin.price_change_percentage_24h.toFixed(2)}%`);
      });
    }

    if (losers.length > 0) {
      console.log('\n📉 TOP LOSERS (24h):');
      losers.forEach((coin, index) => {
        console.log(`   ${index + 1}. ${coin.name}: ${coin.price_change_percentage_24h.toFixed(2)}%`);
      });
    }

    return finalData;

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  getTopCoins()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      console.log(`📁 Data saved to: ${OUTPUT_FILE}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { getTopCoins };
