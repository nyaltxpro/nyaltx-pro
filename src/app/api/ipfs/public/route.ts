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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Use a public IPFS node (this is less reliable but free)
    // In production, you should use a dedicated IPFS service
    const ipfsFormData = new FormData();
    const blob = new Blob([uint8Array], { type: file.type });
    ipfsFormData.append('file', blob, file.name);

    // Try uploading to a public IPFS gateway
    // Note: This is a fallback option and may not always work
    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      body: ipfsFormData,
    });

    if (!response.ok) {
      // If Infura fails, try another public gateway
      const nftStorageResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NFT_STORAGE_TOKEN || ''}`,
        },
        body: ipfsFormData,
      });

      if (!nftStorageResponse.ok) {
        return NextResponse.json({ error: 'All public IPFS services failed' }, { status: 500 });
      }

      const nftData = await nftStorageResponse.json();
      return NextResponse.json({
        Hash: nftData.value.cid,
        ipfsUrl: `https://nftstorage.link/ipfs/${nftData.value.cid}`,
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      Hash: data.Hash,
      Size: data.Size,
      ipfsUrl: `https://ipfs.io/ipfs/${data.Hash}`,
    });

  } catch (error) {
    console.error('Public IPFS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
