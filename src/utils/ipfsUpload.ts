// IPFS Upload Utility for Token Images
// Supports multiple IPFS providers for reliability

interface IPFSUploadResult {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
}

interface IPFSProvider {
  name: string;
  upload: (file: File) => Promise<IPFSUploadResult>;
}

// Pinata IPFS Provider
const pinataProvider: IPFSProvider = {
  name: 'Pinata',
  upload: async (file: File): Promise<IPFSUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ipfs/pinata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        ipfsHash: data.IpfsHash,
        ipfsUrl: `https://ipfs.io/ipfs/${data.IpfsHash}`,
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pinata upload failed',
      };
    }
  },
};

// Web3.Storage IPFS Provider (fallback)
const web3StorageProvider: IPFSProvider = {
  name: 'Web3.Storage',
  upload: async (file: File): Promise<IPFSUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ipfs/web3storage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        ipfsHash: data.cid,
        ipfsUrl: `https://ipfs.io/ipfs/${data.cid}`,
      };
    } catch (error) {
      console.error('Web3.Storage upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web3.Storage upload failed',
      };
    }
  },
};

// IPFS.io Provider (public gateway - least reliable but free)
const ipfsIoProvider: IPFSProvider = {
  name: 'IPFS.io',
  upload: async (file: File): Promise<IPFSUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ipfs/public', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS.io upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        ipfsHash: data.Hash,
        ipfsUrl: `https://ipfs.io/ipfs/${data.Hash}`,
      };
    } catch (error) {
      console.error('IPFS.io upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'IPFS.io upload failed',
      };
    }
  },
};

// Available IPFS providers in order of preference
const IPFS_PROVIDERS: IPFSProvider[] = [
  pinataProvider,
  web3StorageProvider,
  ipfsIoProvider,
];

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP images.',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload images smaller than 5MB.',
    };
  }

  // Check dimensions (recommended 400x300 but allow flexibility)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      
      // Recommended dimensions
      if (width < 100 || height < 100) {
        resolve({
          valid: false,
          error: 'Image too small. Minimum dimensions: 100x100 pixels.',
        });
        return;
      }

      if (width > 1000 || height > 1000) {
        resolve({
          valid: false,
          error: 'Image too large. Maximum dimensions: 1000x1000 pixels.',
        });
        return;
      }

      // Check aspect ratio (should be reasonable)
      const aspectRatio = width / height;
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        resolve({
          valid: false,
          error: 'Invalid aspect ratio. Please use images with reasonable proportions.',
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        error: 'Invalid image file. Please upload a valid image.',
      });
    };

    img.src = URL.createObjectURL(file);
  }) as any;
};

// Resize image to recommended dimensions (400x300)
export const resizeImage = (file: File, maxWidth = 400, maxHeight = 300): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Return original if resize fails
          }
        },
        file.type,
        0.8 // Quality (80%)
      );
    };

    img.onerror = () => resolve(file); // Return original if processing fails
    img.src = URL.createObjectURL(file);
  });
};

// Main upload function with retry logic
export const uploadToIPFS = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<IPFSUploadResult> => {
  console.log('🔄 Starting IPFS upload for:', file.name);
  
  // Validate file first
  const validation = await validateImageFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  // Resize image if needed
  let processedFile = file;
  try {
    if (onProgress) onProgress(10);
    processedFile = await resizeImage(file);
    console.log('✅ Image processed successfully');
    if (onProgress) onProgress(20);
  } catch (error) {
    console.warn('⚠️ Image resize failed, using original:', error);
  }

  // Try each provider in order
  for (let i = 0; i < IPFS_PROVIDERS.length; i++) {
    const provider = IPFS_PROVIDERS[i];
    
    try {
      console.log(`🔄 Trying ${provider.name} (attempt ${i + 1}/${IPFS_PROVIDERS.length})`);
      if (onProgress) onProgress(30 + (i * 20));
      
      const result = await provider.upload(processedFile);
      
      if (result.success) {
        console.log(`✅ Upload successful via ${provider.name}:`, result.ipfsUrl);
        if (onProgress) onProgress(100);
        return result;
      } else {
        console.warn(`❌ ${provider.name} failed:`, result.error);
      }
    } catch (error) {
      console.error(`❌ ${provider.name} error:`, error);
    }
  }

  // All providers failed
  return {
    success: false,
    error: 'All IPFS providers failed. Please try again or use an image URI.',
  };
};

// Utility to get IPFS URL from hash
export const getIPFSUrl = (hash: string, gateway = 'https://ipfs.io'): string => {
  if (hash.startsWith('http')) return hash; // Already a URL
  return `${gateway}/ipfs/${hash}`;
};

// Utility to extract IPFS hash from URL
export const extractIPFSHash = (url: string): string | null => {
  const ipfsRegex = /\/ipfs\/([a-zA-Z0-9]+)/;
  const match = url.match(ipfsRegex);
  return match ? match[1] : null;
};

// Utility to convert any IPFS URL to use ipfs.io gateway
export const normalizeIPFSUrl = (url: string): string => {
  if (!url) return url;
  
  // Extract IPFS hash from any gateway URL
  const hash = extractIPFSHash(url);
  if (hash) {
    return `https://ipfs.io/ipfs/${hash}`;
  }
  
  // If it's already an ipfs.io URL or not an IPFS URL, return as-is
  return url;
};
