import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Check if Pinata credentials are available
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json({ error: 'Pinata credentials not configured' }, { status: 500 });
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: `token-logo-${Date.now()}`,
      keyvalues: {
        type: 'token-logo',
        uploadedAt: new Date().toISOString(),
      },
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Pinata upload failed:', errorData);
      return NextResponse.json({ error: 'Pinata upload failed' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      IpfsHash: data.IpfsHash,
      PinSize: data.PinSize,
      Timestamp: data.Timestamp,
      ipfsUrl: `https://ipfs.io/ipfs/${data.IpfsHash}`,
    });

  } catch (error) {
    console.error('Pinata API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
