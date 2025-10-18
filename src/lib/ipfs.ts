/**
 * IPFS Upload Service
 * Supports multiple IPFS providers: Pinata, Web3.Storage, and platform-specific endpoints
 */

export interface IPFSUploadResult {
  imageUrl: string;
  metadataUrl: string;
  ipfsHash?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  createdOn?: string;
}

/**
 * Upload to Pinata IPFS
 */
export async function uploadToPinata(
  file: File,
  metadata: Omit<TokenMetadata, 'image'>
): Promise<IPFSUploadResult> {
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  if (!pinataApiKey || !pinataSecretKey) {
    throw new Error('Pinata API keys not configured');
  }

  try {
    // Upload image first
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to upload image to Pinata');
    }

    const imageData = await imageResponse.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    // Create and upload metadata JSON
    const metadataJson: TokenMetadata = {
      ...metadata,
      image: imageUrl,
    };

    const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], {
      type: 'application/json',
    });

    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob, 'metadata.json');

    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: metadataFormData,
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to upload metadata to Pinata');
    }

    const metadataData = await metadataResponse.json();
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;

    return {
      imageUrl,
      metadataUrl,
      ipfsHash: metadataData.IpfsHash,
    };
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

/**
 * Upload to Web3.Storage
 */
export async function uploadToWeb3Storage(
  file: File,
  metadata: Omit<TokenMetadata, 'image'>
): Promise<IPFSUploadResult> {
  const web3StorageToken = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

  if (!web3StorageToken) {
    throw new Error('Web3.Storage token not configured');
  }

  try {
    // This is a simplified version - you'd need to install @web3-storage/w3up-client
    // For now, we'll use the HTTP API
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    const imageResponse = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${web3StorageToken}`,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to upload image to Web3.Storage');
    }

    const imageData = await imageResponse.json();
    const imageUrl = `https://w3s.link/ipfs/${imageData.cid}`;

    // Create and upload metadata
    const metadataJson: TokenMetadata = {
      ...metadata,
      image: imageUrl,
    };

    const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], {
      type: 'application/json',
    });
    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob);

    const metadataResponse = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${web3StorageToken}`,
      },
      body: metadataFormData,
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to upload metadata to Web3.Storage');
    }

    const metadataData = await metadataResponse.json();
    const metadataUrl = `https://w3s.link/ipfs/${metadataData.cid}`;

    return {
      imageUrl,
      metadataUrl,
      ipfsHash: metadataData.cid,
    };
  } catch (error) {
    console.error('Web3.Storage upload error:', error);
    throw error;
  }
}

/**
 * Upload to NFT.Storage
 */
export async function uploadToNFTStorage(
  file: File,
  metadata: Omit<TokenMetadata, 'image'>
): Promise<IPFSUploadResult> {
  const nftStorageToken = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;

  if (!nftStorageToken) {
    throw new Error('NFT.Storage token not configured');
  }

  try {
    // Upload image
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    const imageResponse = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nftStorageToken}`,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to upload image to NFT.Storage');
    }

    const imageData = await imageResponse.json();
    const imageUrl = `https://nftstorage.link/ipfs/${imageData.value.cid}`;

    // Create and upload metadata
    const metadataJson: TokenMetadata = {
      ...metadata,
      image: imageUrl,
    };

    const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], {
      type: 'application/json',
    });
    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob);

    const metadataResponse = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nftStorageToken}`,
      },
      body: metadataFormData,
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to upload metadata to NFT.Storage');
    }

    const metadataData = await metadataResponse.json();
    const metadataUrl = `https://nftstorage.link/ipfs/${metadataData.value.cid}`;

    return {
      imageUrl,
      metadataUrl,
      ipfsHash: metadataData.value.cid,
    };
  } catch (error) {
    console.error('NFT.Storage upload error:', error);
    throw error;
  }
}

/**
 * Upload using platform-specific IPFS endpoints (Pump.fun, Bonk.fun)
 */
export async function uploadToPlatform(
  file: File,
  metadata: Omit<TokenMetadata, 'image'>,
  platform: 'pump' | 'bonk' | 'moonshot'
): Promise<IPFSUploadResult> {
  try {
    console.log(`📤 Uploading to ${platform} IPFS endpoint...`);

    if (platform === 'bonk') {
      // Bonk.fun specific upload - uses 'image' field name
      const imageFormData = new FormData();
      imageFormData.append('image', file);

      console.log('Uploading image to Bonk.fun IPFS...');
      const imgResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/img', {
        method: 'POST',
        body: imageFormData,
      });

      if (!imgResponse.ok) {
        const errorText = await imgResponse.text();
        throw new Error(`Bonk.fun image upload failed: ${errorText}`);
      }

      const imageUrl = await imgResponse.text();
      console.log('✅ Bonk.fun image uploaded:', imageUrl);

      // Upload metadata
      const metadataPayload = {
        createdOn: 'https://bonk.fun',
        description: metadata.description,
        image: imageUrl,
        name: metadata.name,
        symbol: metadata.symbol,
        website: metadata.website || '',
        twitter: metadata.twitter || '',
        telegram: metadata.telegram || '',
      };

      console.log('Uploading metadata to Bonk.fun IPFS...');
      const metaResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadataPayload),
      });

      if (!metaResponse.ok) {
        const errorText = await metaResponse.text();
        throw new Error(`Bonk.fun metadata upload failed: ${errorText}`);
      }

      const metadataUrl = await metaResponse.text();
      console.log('✅ Bonk.fun metadata uploaded:', metadataUrl);

      return { imageUrl, metadataUrl };
    } else {
      // Pump.fun and Moonshot - Official Pump.fun IPFS API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', metadata.name);
      formData.append('symbol', metadata.symbol);
      formData.append('description', metadata.description);
      if (metadata.twitter) formData.append('twitter', metadata.twitter);
      if (metadata.telegram) formData.append('telegram', metadata.telegram);
      if (metadata.website) formData.append('website', metadata.website);
      formData.append('showName', 'true');

      console.log('Uploading to Pump.fun official IPFS API...');
      const response = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pump.fun IPFS upload failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Pump.fun IPFS upload successful:', {
        metadataUri: data.metadataUri,
        imageUrl: data.metadata?.image,
      });

      return {
        imageUrl: data.metadata?.image || '',
        metadataUrl: data.metadataUri,
        ipfsHash: data.metadataUri?.split('/').pop() || undefined,
      };
    }
  } catch (error) {
    console.error('❌ Platform IPFS upload error:', error);
    throw error;
  }
}

/**
 * Main upload function - tries multiple providers in fallback order
 */
export async function uploadToIPFS(
  file: File,
  metadata: Omit<TokenMetadata, 'image'>,
  preferredProvider?: 'pinata' | 'web3storage' | 'nftstorage' | 'platform',
  platform?: 'pump' | 'bonk' | 'moonshot'
): Promise<IPFSUploadResult> {
  console.log('🚀 Starting IPFS upload with provider:', preferredProvider || 'auto', 'platform:', platform);

  // If platform is specified and provider is 'platform', use platform-specific upload first
  if (preferredProvider === 'platform' && platform) {
    try {
      console.log(`✨ Using ${platform} platform-specific IPFS upload`);
      return await uploadToPlatform(file, metadata, platform);
    } catch (error) {
      console.error(`❌ Platform-specific upload failed, trying fallbacks:`, error);
      // Don't throw yet, try fallbacks
    }
  }

  // Build provider list based on preference
  const providers: Array<'pinata' | 'web3storage' | 'nftstorage' | 'platform'> = preferredProvider && preferredProvider !== 'platform'
    ? [preferredProvider, 'platform', 'pinata', 'nftstorage', 'web3storage']
    : ['platform', 'pinata', 'nftstorage', 'web3storage'];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`🔄 Trying IPFS provider: ${provider}`);
      
      switch (provider) {
        case 'pinata':
          console.log('📌 Attempting Pinata upload...');
          return await uploadToPinata(file, metadata);
        case 'web3storage':
          console.log('🌐 Attempting Web3.Storage upload...');
          return await uploadToWeb3Storage(file, metadata);
        case 'nftstorage':
          console.log('🖼️ Attempting NFT.Storage upload...');
          return await uploadToNFTStorage(file, metadata);
        case 'platform':
          if (platform) {
            console.log(`🎯 Attempting ${platform} platform upload...`);
            return await uploadToPlatform(file, metadata, platform);
          }
          console.log('⏭️ Skipping platform provider (no platform specified)');
          break;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to upload with ${provider}:`, error instanceof Error ? error.message : error);
      lastError = error as Error;
      continue;
    }
  }

  // If all providers failed
  const errorMessage = `All IPFS upload providers failed. Last error: ${lastError?.message || 'Unknown error'}`;
  console.error('💥', errorMessage);
  throw new Error(errorMessage);
}
