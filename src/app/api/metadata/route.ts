import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uri = searchParams.get('uri');

  if (!uri) {
    return NextResponse.json({ error: 'URI parameter is required' }, { status: 400 });
  }

  try {
    // Validate URI format
    const url = new URL(uri);
    
    // IPFS gateways in order of preference (fastest/most reliable first)
    const ipfsGateways = [
      'https://cloudflare-ipfs.com/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://dweb.link/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://nftstorage.link/ipfs/'
    ];

    // Add security check for allowed domains
    const allowedDomains = [
      'metadata.uxento.io',
      'ipfs.io',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'dweb.link',
      'nftstorage.link',
      'arweave.net'
    ];
    
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
    
    if (!isAllowedDomain) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Function to try fetching from a single gateway
    const fetchFromGateway = async (fetchUri: string, timeoutMs: number = 3000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(fetchUri, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'NYALTX-Metadata-Fetcher/1.0',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        
        // Validate it's not empty or HTML error page
        if (!text.trim() || text.trim().startsWith('<')) {
          throw new Error('Empty or HTML response');
        }

        // Try to parse as JSON
        try {
          return JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON format');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Check if it's an IPFS URL and extract hash
    let urlsToTry = [uri];
    if (uri.includes('/ipfs/')) {
      const ipfsHash = uri.split('/ipfs/')[1];
      if (ipfsHash) {
        // Try multiple IPFS gateways
        urlsToTry = ipfsGateways.map(gateway => `${gateway}${ipfsHash}`);
      }
    }

    let metadata: any;
    let lastError: any;
    
    // Try each URL/gateway until one works
    for (let i = 0; i < urlsToTry.length; i++) {
      const currentUri = urlsToTry[i];
      
      try {
        console.log(`Trying gateway ${i + 1}/${urlsToTry.length}: ${currentUri}`);
        metadata = await fetchFromGateway(currentUri, 3000);
        console.log(`Success with gateway: ${currentUri}`);
        break;
      } catch (error) {
        lastError = error;
        console.log(`Gateway ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        // If this is the last attempt, throw the error
        if (i === urlsToTry.length - 1) {
          throw lastError;
        }
        
        // Small delay before trying next gateway
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Validate metadata structure
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Invalid metadata format');
    }

    // Process IPFS URLs in the metadata
    if (metadata.image && typeof metadata.image === 'string') {
      if (metadata.image.startsWith('ipfs://')) {
        const ipfsHash = metadata.image.replace('ipfs://', '');
        // Use multiple IPFS gateways for better reliability
        metadata.image = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
        metadata.imageBackups = [
          `https://ipfs.io/ipfs/${ipfsHash}`,
          `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
        ];
      }
    }
    
    // Process other IPFS fields
    ['animation_url', 'external_url'].forEach(field => {
      if (metadata[field] && typeof metadata[field] === 'string' && metadata[field].startsWith('ipfs://')) {
        const ipfsHash = metadata[field].replace('ipfs://', '');
        metadata[field] = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
      }
    });

    // Add CORS headers
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return NextResponse.json(metadata, { headers });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    let errorMessage = 'Failed to fetch metadata';
    let statusCode = 500;
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      errorMessage = 'All IPFS gateways timed out - content may be unavailable';
      statusCode = 504;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network connectivity issues with all IPFS gateways';
      statusCode = 502;
    } else if (error instanceof Error) {
      if (error.message.includes('Invalid JSON') || error.message.includes('Empty or HTML')) {
        errorMessage = 'IPFS content is not valid JSON metadata';
        statusCode = 422;
      } else if (error.message.includes('timeout') || error.message.includes('aborted')) {
        errorMessage = 'All IPFS gateways timed out';
        statusCode = 504;
      } else if (error.message.includes('HTTP')) {
        errorMessage = `IPFS gateway error: ${error.message}`;
        statusCode = 502;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        uri: uri,
        timestamp: new Date().toISOString(),
        suggestion: 'Try again later or check if the IPFS content exists'
      }, 
      { status: statusCode }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
