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
    
    // Add security check for allowed domains
    const allowedDomains = [
      'metadata.uxento.io',
      'ipfs.io',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'arweave.net'
    ];
    
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
    
    if (!isAllowedDomain) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Fetch metadata with proper headers
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-Metadata-Fetcher/1.0',
        'Cache-Control': 'no-cache'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    const metadata = await response.json();

    // Validate metadata structure
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Invalid metadata format');
    }

    // Process IPFS URLs in the metadata
    if (metadata.image && typeof metadata.image === 'string') {
      if (metadata.image.startsWith('ipfs://')) {
        const ipfsHash = metadata.image.replace('ipfs://', '');
        metadata.image = `https://ipfs.io/ipfs/${ipfsHash}`;
      }
    }

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
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error or CORS issue';
      statusCode = 502;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('timeout')) {
        statusCode = 504;
      } else if (error.message.includes('HTTP error')) {
        statusCode = 502;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        uri: uri,
        timestamp: new Date().toISOString()
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
