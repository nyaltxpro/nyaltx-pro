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

// Function to extract logo mappings from the listings page
async function extractLogoMappings() {
  try {
    console.log('Fetching NYAX listings page...');
    const html = await fetchHtml('https://www.nyaltx.com/nyax-listings/');
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const logoMappings = {};
    
    // Strategy 1: Look for images with data attributes or specific patterns
    const allImages = document.querySelectorAll('img[src]');
    console.log(`Found ${allImages.length} images on the page`);
    
    allImages.forEach((img, index) => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      const className = img.getAttribute('class') || '';
      const id = img.getAttribute('id') || '';
      
      console.log(`Image ${index + 1}: ${src}`);
      console.log(`  Alt: ${alt}`);
      console.log(`  Class: ${className}`);
      console.log(`  ID: ${id}`);
      
      // Look for token-specific images
      if (src && !src.includes('bitcoin.svg') && !src.includes('ethereum.svg') && 
          !src.includes('tether.svg') && !src.includes('cryptocurrency-price-ticker-widget')) {
        
        // Try to extract logoId from nearby links or context
        const parentElement = img.parentElement;
        const grandParentElement = parentElement?.parentElement;
        
        // Look for links with logoid parameter in the vicinity
        const nearbyLinks = [];
        if (parentElement) {
          nearbyLinks.push(...parentElement.querySelectorAll('a[href*="logoid="]'));
        }
        if (grandParentElement) {
          nearbyLinks.push(...grandParentElement.querySelectorAll('a[href*="logoid="]'));
        }
        
        nearbyLinks.forEach(link => {
          const href = link.getAttribute('href');
          const logoIdMatch = href.match(/logoid=(\d+)/);
          if (logoIdMatch) {
            const logoId = logoIdMatch[1];
            console.log(`  Found logoId ${logoId} for image: ${src}`);
            logoMappings[logoId] = {
              logoUrl: src.startsWith('//') ? 'https:' + src : 
                      src.startsWith('/') ? 'https://www.nyaltx.com' + src : src,
              alt: alt,
              context: link.textContent.trim()
            };
          }
        });
      }
    });
    
    // Strategy 2: Look for specific patterns in the HTML structure
    const links = document.querySelectorAll('a[href*="logoid="]');
    console.log(`\nFound ${links.length} links with logoId`);
    
    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      const logoIdMatch = href.match(/logoid=(\d+)/);
      const text = link.textContent.trim();
      
      if (logoIdMatch) {
        const logoId = logoIdMatch[1];
        console.log(`Link ${index + 1}: logoId=${logoId}, text="${text}"`);
        
        // Look for images in the same container or nearby
        const container = link.closest('div, section, article, li');
        if (container) {
          const containerImages = container.querySelectorAll('img[src]');
          containerImages.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.includes('bitcoin.svg') && !src.includes('ethereum.svg') && 
                !src.includes('tether.svg') && !src.includes('cryptocurrency-price-ticker-widget')) {
              
              if (!logoMappings[logoId]) {
                logoMappings[logoId] = {
                  logoUrl: src.startsWith('//') ? 'https:' + src : 
                          src.startsWith('/') ? 'https://www.nyaltx.com' + src : src,
                  alt: img.getAttribute('alt') || '',
                  context: text
                };
                console.log(`  Mapped logoId ${logoId} to image: ${src}`);
              }
            }
          });
        }
      }
    });
    
    // Strategy 3: Look for WordPress media library patterns
    const wpImages = document.querySelectorAll('img[src*="wp-content/uploads"]');
    console.log(`\nFound ${wpImages.length} WordPress uploaded images`);
    
    wpImages.forEach((img, index) => {
      const src = img.getAttribute('src');
      console.log(`WP Image ${index + 1}: ${src}`);
      
      // Try to extract potential logoId from filename or path
      const filenameMatch = src.match(/\/(\d+)\.(png|jpg|jpeg|gif|svg)/i);
      if (filenameMatch) {
        const potentialLogoId = filenameMatch[1];
        if (!logoMappings[potentialLogoId]) {
          logoMappings[potentialLogoId] = {
            logoUrl: src.startsWith('//') ? 'https:' + src : 
                    src.startsWith('/') ? 'https://www.nyaltx.com' + src : src,
            alt: img.getAttribute('alt') || '',
            context: 'WordPress upload (filename match)'
          };
          console.log(`  Potential logoId ${potentialLogoId} from filename: ${src}`);
        }
      }
    });
    
    console.log(`\nTotal logo mappings found: ${Object.keys(logoMappings).length}`);
    return logoMappings;
    
  } catch (error) {
    console.error('Error extracting logo mappings:', error);
    return {};
  }
}

// Function to update existing token data with correct logos
async function updateTokenLogos() {
  try {
    // Extract logo mappings from listings page
    const logoMappings = await extractLogoMappings();
    
    // Read existing token data
    const tokenData = JSON.parse(fs.readFileSync('nyax-tokens-data.json', 'utf8'));
    
    let updatedCount = 0;
    
    // Update logos for each token
    tokenData.tokens.forEach(token => {
      const logoId = token.logoId;
      if (logoId && logoMappings[logoId]) {
        const oldLogo = token.logo;
        token.logo = logoMappings[logoId].logoUrl;
        token.additionalInfo.logoContext = logoMappings[logoId].context;
        
        if (oldLogo !== token.logo) {
          console.log(`Updated logo for ${token.symbol} (logoId: ${logoId})`);
          console.log(`  Old: ${oldLogo}`);
          console.log(`  New: ${token.logo}`);
          updatedCount++;
        }
      }
    });
    
    // Update metadata
    tokenData.logoMappingsExtracted = new Date().toISOString();
    tokenData.logoMappingsCount = Object.keys(logoMappings).length;
    tokenData.logosUpdated = updatedCount;
    
    // Save updated data
    fs.writeFileSync('nyax-tokens-data.json', JSON.stringify(tokenData, null, 2));
    
    console.log(`\nLogo update completed!`);
    console.log(`Total logo mappings found: ${Object.keys(logoMappings).length}`);
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

// Run the logo extraction and update
if (require.main === module) {
  updateTokenLogos().catch(console.error);
}

module.exports = { extractLogoMappings, updateTokenLogos };
