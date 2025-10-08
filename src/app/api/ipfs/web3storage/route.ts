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

    // Check if Web3.Storage token is available
    const web3StorageToken = process.env.WEB3_STORAGE_TOKEN;

    if (!web3StorageToken) {
      return NextResponse.json({ error: 'Web3.Storage token not configured' }, { status: 500 });
    }

    // Create form data for Web3.Storage
    const web3FormData = new FormData();
    web3FormData.append('file', file);

    // Upload to Web3.Storage
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${web3StorageToken}`,
      },
      body: web3FormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Web3.Storage upload failed:', errorData);
      return NextResponse.json({ error: 'Web3.Storage upload failed' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      cid: data.cid,
      ipfsUrl: `https://w3s.link/ipfs/${data.cid}`,
    });

  } catch (error) {
    console.error('Web3.Storage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
