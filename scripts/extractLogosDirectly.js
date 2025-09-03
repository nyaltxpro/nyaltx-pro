const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');

// Function to fetch HTML content from URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Manual mapping based on the WordPress cache images found
const logoMappings = {
  '63': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/NYALTX-Logo-01-landscape.jpg', // NYAX
  '535': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/fireants-logo-square.png', // RedFireAnts
  '653': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/bingodogelogo-square.png', // Bingo Doge
  '544': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/vaultlogo-square.png', // Vault Defi
  '661': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/clotbalogo-square.png', // Clotba
  '93': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/cowboyshiba-square.png', // Cowboy Shiba
  '560': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/kiwigologo-square.png', // KiwiGo
  '162': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/harmonylogo-square.png', // Harmony One
  '111': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/xavecoinlogo-square.png', // Xavecoin
  '79': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/hybrixlogo-square.png', // Hybrix
  '151': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/criptorologo-square.png', // Criptoro
  '211': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/greenlogo-square.png', // Green
  '550': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/baguslogo-square.png', // Bagus Wallet
  '215': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/gbdlogo-square.png', // Great Bounty Dealer
  '225': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/tfclogo-square.png', // The Flash Currency
  '556': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/salukiinulogo-square.png', // Saluki Inu
  '694': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/dogexlogo-square.png', // Doge X Metaverse
  '679': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/partyboardlogo-square.png', // PartyBoard
  '673': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/alicoinlogo-square.png', // Alicoin
  '656': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/cryptoblastlogo-square.png', // Crypto Blast
  '642': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/gamestatelogo-square.png', // Gamestate
  '634': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/quincoinlogo-square.png', // Quincoin
  '573': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/wantslogo-square.png', // Wrapped FireAnts
  '580': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/wolfpacklogo-square.png', // Wolf Pack
  '565': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/fabweltlogo-square.png', // FabWelt
  '559': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/kawaishibalogo-square.png', // Kawai Shiba
  '536': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/smartchemlogo-square.png', // SmartChem
  '531': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/lottradelogo-square.png', // Lot.Trade
  '548': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/dogeflokilogo-square.png', // Doge Floki Coin
  '533': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/wolfalphalogo-square.png', // Wolf Alpha
  '263': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/feedsystemlogo-square.png', // Feed System
  '261': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/smartchemlogo-square.png', // Smart Chem
  '543': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/kaikeninulogo-square.png', // Kaiken Inu
  '553': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/game1logo-square.png', // Game 1 Network
  '206': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/obytelogo-square.png', // Obyte
  '224': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/gorillainulogo-square.png', // Gorilla Inu
  '157': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/loterralogo-square.png', // LoTerra
  '136': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/oasislogo-square.png', // Oasis Network
  '124': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/cleanerearthlogo-square.png', // Cleaner Earth Token
  '561': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/octaplexlogo-square.png', // Octaplex Network
  '549': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/wspplogo-square.png', // Wolfsafepoorpeople
  '557': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/payruelogo-square.png', // PayRue
  '202': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/imperialobelisklogo-square.png', // Imperial Obelisk
  '135': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/redpandalogo-square.png', // Red Panda Earth
  '555': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/safetytokenlogo-square.png', // Safety Token
  '216': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/energy8logo-square.png', // Energy 8
  '160': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/bonfirestellarlogo-square.png', // Bonfirestellar
  '676': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/indexcooplogo-square.png', // Index Cooperative
  '647': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/hachikologo-square.png', // Hachiko
  '675': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/walletpaylogo-square.png', // Wallet Pay
  '585': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/honeytokenlogo-square.png', // Honey Token
  '527': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/wapswaplogo-square.png', // Wap Swap Finance
  '241': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/fireantslogo-square.png', // FireAnts ERC-20
  '512': 'https://www.nyaltx.com/wp-content/uploads/bb-plugin/cache/playtreklogo-square.png' // Play Treks
};

// Function to update existing token data with correct logos
async function updateTokenLogos() {
  try {
    // Read existing token data
    const tokenData = JSON.parse(fs.readFileSync('nyax-tokens-data.json', 'utf8'));
    
    let updatedCount = 0;
    
    // Update logos for each token
    tokenData.tokens.forEach(token => {
      const logoId = token.logoId;
      if (logoId && logoMappings[logoId]) {
        const oldLogo = token.logo;
        token.logo = logoMappings[logoId];
        
        if (oldLogo !== token.logo) {
          console.log(`Updated logo for ${token.symbol} (logoId: ${logoId})`);
          console.log(`  Old: ${oldLogo}`);
          console.log(`  New: ${token.logo}`);
          updatedCount++;
        }
      } else if (logoId) {
        console.log(`No logo mapping found for ${token.symbol} (logoId: ${logoId})`);
      }
    });
    
    // Update metadata
    tokenData.logoMappingsExtracted = new Date().toISOString();
    tokenData.logoMappingsCount = Object.keys(logoMappings).length;
    tokenData.logosUpdated = updatedCount;
    
    // Save updated data
    fs.writeFileSync('nyax-tokens-data.json', JSON.stringify(tokenData, null, 2));
    
    console.log(`\nLogo update completed!`);
    console.log(`Total logo mappings available: ${Object.keys(logoMappings).length}`);
    console.log(`Tokens updated with new logos: ${updatedCount}`);
    
    // Save logo mappings separately for reference
    fs.writeFileSync('nyax-logo-mappings.json', JSON.stringify(logoMappings, null, 2));
    console.log('Logo mappings saved to nyax-logo-mappings.json');
    
    return {
      logoMappings,
      updatedCount,
      totalTokens: tokenData.tokens.length
    };
    
  } catch (error) {
    console.error('Error updating token logos:', error);
    return null;
  }
}

// Run the logo update
if (require.main === module) {
  updateTokenLogos().catch(console.error);
}

module.exports = { updateTokenLogos, logoMappings };
