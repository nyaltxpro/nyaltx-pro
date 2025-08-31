const fs = require('fs');
const path = require('path');
const https = require('https');

// Map blockchain IDs to their cryptocurrency symbols
const symbolMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'binance-smart-chain': 'BNB',
  'solana': 'SOL',
  'polygon-pos': 'MATIC',
  'avalanche': 'AVAX',
  'arbitrum-one': 'ARB',
  'optimistic-ethereum': 'OP',
  'tron': 'TRX',
  'base': 'BASE',
  'cardano': 'ADA',
  'cosmos': 'ATOM',
  'polkadot': 'DOT',
  'near-protocol': 'NEAR',
  'fantom': 'FTM',
  'xai': 'XAI',
  'sei-v2': 'SEI',
  'internet-computer': 'ICP',
  'ronin': 'RON',
  'celestia': 'TIA'
};

// Additional popular cryptocurrencies to download
const additionalCryptos = [
  'USDT', 'USDC', 'XRP', 'DOGE', 'DAI', 'LINK', 'UNI', 'SHIB',
  'LTC', 'BCH', 'XLM', 'ALGO', 'SAND', 'MANA', 'APE', 'AAVE',
  'CRO', 'CAKE', 'GALA', 'RNDR', 'FIL', 'VET', 'EGLD', 'HBAR'
];

// Combine all symbols
const allSymbols = [...Object.values(symbolMap), ...additionalCryptos];

// Create directories if they don't exist
const svgDir = path.join(__dirname, '../public/crypto-logos/svg');
const pngDir = path.join(__dirname, '../public/crypto-logos/png');

if (!fs.existsSync(svgDir)) {
  fs.mkdirSync(svgDir, { recursive: true });
}

if (!fs.existsSync(pngDir)) {
  fs.mkdirSync(pngDir, { recursive: true });
}

/**
 * Download a file from a URL to a local path
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

/**
 * Download cryptocurrency logos from cryptologos.cc
 */
async function downloadCryptoLogos() {
  console.log('Starting download of cryptocurrency logos...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const symbol of allSymbols) {
    const lowerSymbol = symbol.toLowerCase();
    
    // Try to download SVG
    const svgUrl = `https://cryptologos.cc/logos/${lowerSymbol}-${lowerSymbol}-logo.svg`;
    const svgPath = path.join(svgDir, `${lowerSymbol}.svg`);
    
    try {
      await downloadFile(svgUrl, svgPath);
      console.log(`✓ Downloaded SVG for ${symbol}`);
      successCount++;
    } catch (err) {
      console.log(`✗ Failed to download SVG for ${symbol}: ${err.message}`);
      failCount++;
      
      // Try alternative URL format
      const altSvgUrl = `https://cryptologos.cc/logos/${lowerSymbol}-logo.svg`;
      
      try {
        await downloadFile(altSvgUrl, svgPath);
        console.log(`✓ Downloaded SVG for ${symbol} (alternative URL)`);
        successCount++;
      } catch (altErr) {
        console.log(`✗ Failed to download SVG for ${symbol} (alternative URL): ${altErr.message}`);
      }
    }
    
    // Try to download PNG
    const pngUrl = `https://cryptologos.cc/logos/${lowerSymbol}-${lowerSymbol}-logo.png`;
    const pngPath = path.join(pngDir, `${lowerSymbol}.png`);
    
    try {
      await downloadFile(pngUrl, pngPath);
      console.log(`✓ Downloaded PNG for ${symbol}`);
      successCount++;
    } catch (err) {
      console.log(`✗ Failed to download PNG for ${symbol}: ${err.message}`);
      failCount++;
      
      // Try alternative URL format
      const altPngUrl = `https://cryptologos.cc/logos/${lowerSymbol}-logo.png`;
      
      try {
        await downloadFile(altPngUrl, pngPath);
        console.log(`✓ Downloaded PNG for ${symbol} (alternative URL)`);
        successCount++;
      } catch (altErr) {
        console.log(`✗ Failed to download PNG for ${symbol} (alternative URL): ${altErr.message}`);
      }
    }
  }
  
  console.log(`\nDownload complete!`);
  console.log(`Successfully downloaded: ${successCount} files`);
  console.log(`Failed to download: ${failCount} files`);
}

// Run the download function
downloadCryptoLogos().catch(console.error);
