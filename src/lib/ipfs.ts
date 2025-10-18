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
    if (platform === 'bonk') {
      // Bonk.fun specific upload
      const formData = new FormData();
      formData.append('file', file);

      const imgResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/img', {
        method: 'POST',
        body: formData,
      });
      const imageUrl = await imgResponse.text();

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

      const metaResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadataPayload),
      });
      const metadataUrl = await metaResponse.text();

      return { imageUrl, metadataUrl };
    } else {
      // Pump.fun and Moonshot
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', metadata.name);
      formData.append('symbol', metadata.symbol);
      formData.append('description', metadata.description);
      formData.append('twitter', metadata.twitter || '');
      formData.append('telegram', metadata.telegram || '');
      formData.append('website', metadata.website || '');
      formData.append('showName', 'true');

      const response = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      return {
        imageUrl: data.metadata.image || '',
        metadataUrl: data.metadataUri,
      };
    }
  } catch (error) {
    console.error('Platform upload error:', error);
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
  const providers = preferredProvider
    ? [preferredProvider]
    : ['pinata', 'nftstorage', 'web3storage', 'platform'];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      switch (provider) {
        case 'pinata':
          return await uploadToPinata(file, metadata);
        case 'web3storage':
          return await uploadToWeb3Storage(file, metadata);
        case 'nftstorage':
          return await uploadToNFTStorage(file, metadata);
        case 'platform':
          if (platform) {
            return await uploadToPlatform(file, metadata, platform);
          }
          break;
      }
    } catch (error) {
      console.warn(`Failed to upload with ${provider}:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all providers failed, try platform as last resort
  if (platform) {
    try {
      return await uploadToPlatform(file, metadata, platform);
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw new Error(`All IPFS upload providers failed. Last error: ${lastError?.message}`);
}
