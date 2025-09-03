const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');

// Extract token URLs from the listings page
const tokenUrls = [
  'https://www.nyaltx.com/token-new/?logoid=63',
  'https://www.nyaltx.com/token-bnb-new/?logoid=535',
  'https://www.nyaltx.com/token-bnb-new/?logoid=653',
  'https://www.nyaltx.com/token-bnb-new/?logoid=544',
  'https://www.nyaltx.com/token-bnb-new/?logoid=661',
  'https://www.nyaltx.com/token-new/?logoid=93',
  'https://www.nyaltx.com/token-bnb-new/?logoid=560',
  'https://www.nyaltx.com/token-new/?logoid=162',
  'https://www.nyaltx.com/token-new/?logoid=111',
  'https://www.nyaltx.com/token-new/?logoid=79',
  'https://www.nyaltx.com/token-new/?logoid=151',
  'https://www.nyaltx.com/token-new/?logoid=211',
  'https://www.nyaltx.com/token-bnb-new/?logoid=550',
  'https://www.nyaltx.com/token-new/?logoid=215',
  'https://www.nyaltx.com/token-new/?logoid=225',
  'https://www.nyaltx.com/token-bnb-new/?logoid=556',
  'https://www.nyaltx.com/token-bnb-new/?logoid=694',
  'https://www.nyaltx.com/token-bnb-new/?logoid=679',
  'https://www.nyaltx.com/token-new/?logoid=673',
  'https://www.nyaltx.com/token-bnb-new/?logoid=656',
  'https://www.nyaltx.com/token-bnb-new/?logoid=642',
  'https://www.nyaltx.com/token-bnb-new/?logoid=634',
  'https://www.nyaltx.com/token-bnb-new/?logoid=573',
  'https://www.nyaltx.com/token-bnb-new/?logoid=580',
  'https://www.nyaltx.com/token-bnb-new/?logoid=565',
  'https://www.nyaltx.com/token-bnb-new/?logoid=559',
  'https://www.nyaltx.com/token-bnb-new/?logoid=536',
  'https://www.nyaltx.com/token-bnb-new/?logoid=531',
  'https://www.nyaltx.com/token-bnb-new/?logoid=548',
  'https://www.nyaltx.com/token-bnb-new/?logoid=533',
  'https://www.nyaltx.com/token-new/?logoid=263',
  'https://www.nyaltx.com/token-new/?logoid=261',
  'https://www.nyaltx.com/token-bnb-new/?logoid=543',
  'https://www.nyaltx.com/token-bnb-new/?logoid=553',
  'https://www.nyaltx.com/token-new/?logoid=206',
  'https://www.nyaltx.com/token-new/?logoid=224',
  'https://www.nyaltx.com/token-new/?logoid=157',
  'https://www.nyaltx.com/token-new/?logoid=136',
  'https://www.nyaltx.com/token-new/?logoid=124',
  'https://www.nyaltx.com/token-bnb-new/?logoid=561',
  'https://www.nyaltx.com/token-bnb-new/?logoid=549',
  'https://www.nyaltx.com/token-bnb-new/?logoid=557',
  'https://www.nyaltx.com/token-new/?logoid=202',
  'https://www.nyaltx.com/token-new/?logoid=135',
  'https://www.nyaltx.com/token-bnb-new/?logoid=555',
  'https://www.nyaltx.com/token-new/?logoid=216',
  'https://www.nyaltx.com/token-new/?logoid=160',
  'https://www.nyaltx.com/token-new/?logoid=676',
  'https://www.nyaltx.com/token-bnb-new/?logoid=647',
  'https://www.nyaltx.com/token-bnb-new/?logoid=675',
  'https://www.nyaltx.com/token-new/?logoid=585',
  'https://www.nyaltx.com/token-bnb-new/?logoid=527',
  'https://www.nyaltx.com/token-new/?logoid=241',
  'https://www.nyaltx.com/token-new/?logoid=512'
];

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

// Function to extract token data from HTML
function extractTokenData(html, url) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const tokenData = {
    url: url,
    logoId: url.match(/logoid=(\d+)/)?.[1] || null,
    name: null,
    symbol: null,
    description: null,
    contractAddress: null,
    network: null,
    totalSupply: null,
    circulatingSupply: null,
    marketCap: null,
    price: null,
    website: null,
    telegram: null,
    twitter: null,
    discord: null,
    whitepaper: null,
    logo: null,
    email: null,
    etherscan: null,
    video: null,
    aboutUs: null,
    additionalInfo: {}
  };

  try {
    // Extract title/name from h1 or title
    const h1 = document.querySelector('h1');
    if (h1) {
      tokenData.name = h1.textContent.trim();
    } else {
      const title = document.querySelector('title')?.textContent?.trim();
      if (title) {
        tokenData.name = title.replace(' - Crypto Trading', '').replace(' - NYAX', '').trim();
      }
    }

    // Extract structured token details from the page
    const allText = document.body.textContent;
    
    // Look for token details section patterns
    const lines = allText.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      
      // Extract symbol
      if (line === 'SYMBOL' && nextLine && nextLine !== 'WHITEPAPER') {
        tokenData.symbol = nextLine;
      }
      
      // Extract total supply
      if (line === 'TOTAL SUPPLY' && nextLine && nextLine !== 'CIRCULATING') {
        tokenData.totalSupply = nextLine.replace(/,/g, '');
      }
      
      // Extract circulating supply
      if (line === 'CIRCULATING' && nextLine && nextLine !== 'WEBSITE') {
        tokenData.circulatingSupply = nextLine.replace(/,/g, '');
      }
      
      // Extract email
      if (line === 'EMAIL' && nextLine && nextLine.includes('@')) {
        tokenData.email = nextLine;
      }
      
      // Extract about us
      if (line === 'ABOUT US' && nextLine && nextLine !== 'CONTRACT ADDRESS') {
        tokenData.aboutUs = nextLine;
      }
    }

    // Extract links with better targeting
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      const parentText = link.parentElement?.textContent?.trim() || '';
      
      if (!href || href === '#') return;
      
      // Whitepaper
      if (parentText.includes('WHITEPAPER') || href.includes('whitepaper')) {
        tokenData.whitepaper = href;
      }
      // Website
      else if (parentText.includes('WEBSITE') && !href.includes('nyaltx.com/token')) {
        tokenData.website = href;
      }
      // Etherscan
      else if (href.includes('etherscan.io')) {
        tokenData.etherscan = href;
        // Extract contract address from etherscan URL
        const contractMatch = href.match(/token\/([0-9a-fA-Fx]{42})/);
        if (contractMatch) {
          tokenData.contractAddress = contractMatch[1];
          tokenData.network = 'Ethereum';
        }
      }
      // BSC Scan
      else if (href.includes('bscscan.com')) {
        tokenData.etherscan = href;
        const contractMatch = href.match(/token\/([0-9a-fA-Fx]{42})/);
        if (contractMatch) {
          tokenData.contractAddress = contractMatch[1];
          tokenData.network = 'BSC';
        }
      }
      // Telegram
      else if (href.includes('t.me') || href.includes('telegram')) {
        tokenData.telegram = href;
      }
      // Twitter
      else if (href.includes('twitter.com') || href.includes('x.com')) {
        tokenData.twitter = href;
      }
      // Discord
      else if (href.includes('discord')) {
        tokenData.discord = href;
      }
      // Video
      else if (href.includes('youtube.com') || href.includes('vimeo.com')) {
        tokenData.video = href;
      }
    });

    // Look for contract address in text if not found in links
    if (!tokenData.contractAddress) {
      const contractMatch = allText.match(/CONTRACT ADDRESS\s*([0-9a-fA-Fx]{42})/i);
      if (contractMatch) {
        tokenData.contractAddress = contractMatch[1];
      }
    }

    // Determine network from URL pattern or content
    if (url.includes('token-bnb-new')) {
      tokenData.network = 'BSC';
    } else if (url.includes('token-new')) {
      tokenData.network = 'Ethereum';
    }

    // Extract logo/image with multiple strategies
    let logoSrc = null;
    
    // Strategy 1: Look for images with specific patterns
    const logoSelectors = [
      'img[src*="logo"]',
      'img[alt*="logo"]', 
      'img[alt*="Logo"]',
      '.logo img',
      'img[src*="token"]',
      'img[src*="coin"]',
      'img[class*="logo"]',
      'img[id*="logo"]'
    ];
    
    for (const selector of logoSelectors) {
      const logoImg = document.querySelector(selector);
      if (logoImg) {
        const src = logoImg.getAttribute('src');
        if (src && !src.includes('bitcoin.svg') && !src.includes('ethereum.svg') && !src.includes('bnb.svg') && 
            !src.includes('tether.svg') && !src.includes('cryptocurrency-price-ticker-widget') &&
            !src.includes('coin-logos/') && !src.includes('generic')) {
          logoSrc = src;
          break;
        }
      }
    }
    
    // Strategy 2: Look for images in specific containers or with token-related attributes
    if (!logoSrc) {
      const allImages = document.querySelectorAll('img[src]');
      for (const img of allImages) {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || '';
        const className = img.getAttribute('class') || '';
        
        // Skip generic crypto icons
        if (src.includes('bitcoin.svg') || src.includes('ethereum.svg') || src.includes('bnb.svg') || 
            src.includes('tether.svg') || src.includes('cryptocurrency-price-ticker-widget') ||
            src.includes('coin-logos/') || src.includes('generic')) {
          continue;
        }
        
        // Look for token-specific images
        if (src.includes('token') || src.includes('logo') || src.includes('coin') ||
            alt.toLowerCase().includes('logo') || alt.toLowerCase().includes('token') ||
            className.includes('logo') || className.includes('token')) {
          logoSrc = src;
          break;
        }
      }
    }
    
    // Strategy 3: Look for WordPress uploaded images or custom token images
    if (!logoSrc) {
      const allImages = document.querySelectorAll('img[src]');
      for (const img of allImages) {
        const src = img.getAttribute('src');
        
        // Look for WordPress uploads or custom images that might be token logos
        if (src && (src.includes('wp-content/uploads/') || src.includes('uploads/') || 
                   src.includes('.png') || src.includes('.jpg') || src.includes('.jpeg') || src.includes('.gif')) &&
            !src.includes('cryptocurrency-price-ticker-widget') && !src.includes('coin-logos/') &&
            !src.includes('bitcoin') && !src.includes('ethereum') && !src.includes('tether')) {
          
          // Additional checks for likely token logos
          const imgWidth = img.getAttribute('width') || img.style.width;
          const imgHeight = img.getAttribute('height') || img.style.height;
          
          // Prefer square images (common for logos) or reasonably sized images
          if (!imgWidth || !imgHeight || 
              (parseInt(imgWidth) >= 50 && parseInt(imgWidth) <= 500) ||
              (parseInt(imgHeight) >= 50 && parseInt(imgHeight) <= 500)) {
            logoSrc = src;
            break;
          }
        }
      }
    }
    
    // Strategy 4: Extract from URL parameters or page content
    if (!logoSrc) {
      const logoIdMatch = url.match(/logoid=(\d+)/);
      if (logoIdMatch) {
        // Check if there's a pattern for logo URLs based on logoId
        const logoId = logoIdMatch[1];
        const possibleLogoUrls = [
          `https://www.nyaltx.com/wp-content/uploads/${logoId}.png`,
          `https://www.nyaltx.com/wp-content/uploads/${logoId}.jpg`,
          `https://www.nyaltx.com/wp-content/uploads/logos/${logoId}.png`,
          `https://www.nyaltx.com/logos/${logoId}.png`
        ];
        
        // For now, we'll note the logoId and potential URLs
        tokenData.additionalInfo.possibleLogoUrls = possibleLogoUrls;
      }
    }
    
    // Strategy 4: Look for base64 or data URLs
    if (!logoSrc) {
      const dataUrlImg = document.querySelector('img[src^="data:image"]');
      if (dataUrlImg) {
        logoSrc = dataUrlImg.getAttribute('src');
      }
    }
    
    if (logoSrc) {
      // Make sure it's a full URL
      if (logoSrc.startsWith('//')) {
        logoSrc = 'https:' + logoSrc;
      } else if (logoSrc.startsWith('/')) {
        logoSrc = 'https://www.nyaltx.com' + logoSrc;
      }
      tokenData.logo = logoSrc;
    }

  } catch (error) {
    console.error(`Error parsing token data for ${url}:`, error.message);
  }

  return tokenData;
}

// Main scraping function
async function scrapeAllTokens() {
  const allTokens = [];
  const batchSize = 5; // Process 5 tokens at a time to avoid overwhelming the server
  
  console.log(`Starting to scrape ${tokenUrls.length} tokens...`);
  
  for (let i = 0; i < tokenUrls.length; i += batchSize) {
    const batch = tokenUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(async (url, index) => {
      try {
        console.log(`Fetching token ${i + index + 1}/${tokenUrls.length}: ${url}`);
        const html = await fetchHtml(url);
        const tokenData = extractTokenData(html, url);
        return tokenData;
      } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return {
          url: url,
          error: error.message,
          logoId: url.match(/logoid=(\d+)/)?.[1] || null
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    allTokens.push(...batchResults);
    
    // Add delay between batches to be respectful to the server
    if (i + batchSize < tokenUrls.length) {
      console.log('Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Save to JSON file
  const outputFile = 'nyax-tokens-data.json';
  const jsonData = {
    scrapedAt: new Date().toISOString(),
    totalTokens: allTokens.length,
    successfulScrapes: allTokens.filter(t => !t.error).length,
    failedScrapes: allTokens.filter(t => t.error).length,
    tokens: allTokens
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
  console.log(`\nScraping completed! Data saved to ${outputFile}`);
  console.log(`Successfully scraped: ${jsonData.successfulScrapes} tokens`);
  console.log(`Failed scrapes: ${jsonData.failedScrapes} tokens`);
  
  return jsonData;
}

// Run the scraper
if (require.main === module) {
  scrapeAllTokens().catch(console.error);
}

module.exports = { scrapeAllTokens, extractTokenData };
