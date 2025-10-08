# IPFS Upload Setup Guide

This guide explains how to set up IPFS image upload functionality for token registration.

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Pinata IPFS Service (Primary - Recommended)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_key_here

# Web3.Storage (Fallback)
WEB3_STORAGE_TOKEN=your_web3_storage_token_here

# NFT.Storage (Public Fallback)
NFT_STORAGE_TOKEN=your_nft_storage_token_here
```

## Service Setup Instructions

### 1. Pinata (Primary Service)
1. Go to [pinata.cloud](https://pinata.cloud)
2. Create a free account
3. Navigate to API Keys section
4. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS` (optional)
5. Copy the API Key and Secret Key to your environment variables

**Free Tier Limits:**
- 1GB storage
- 100 requests per month
- Perfect for token logos

### 2. Web3.Storage (Fallback)
1. Go to [web3.storage](https://web3.storage)
2. Create a free account
3. Generate an API token
4. Copy the token to your environment variables

**Free Tier Limits:**
- 5GB storage
- Unlimited requests
- Good fallback option

### 3. NFT.Storage (Public Fallback)
1. Go to [nft.storage](https://nft.storage)
2. Create a free account
3. Generate an API key
4. Copy the key to your environment variables

**Free Tier Limits:**
- Unlimited storage (sponsored by Protocol Labs)
- Good for public/open source projects

## Image Requirements

The system automatically validates and optimizes uploaded images:

### Supported Formats
- PNG (recommended)
- JPG/JPEG
- SVG
- WebP

### Size Limits
- **File Size**: Maximum 5MB
- **Dimensions**: 
  - Minimum: 100x100 pixels
  - Maximum: 1000x1000 pixels
  - Recommended: 400x300 pixels
- **Aspect Ratio**: Between 0.5 and 2.0

### Automatic Processing
- Images are automatically resized to recommended dimensions (400x300)
- Quality optimization (80% compression)
- Format validation
- IPFS upload with retry logic

## Usage in Token Registration

Users can now choose between two methods for adding token logos:

### Method 1: Upload Image (Recommended)
- Drag & drop or click to browse
- Automatic IPFS upload
- Real-time progress indicator
- Automatic resizing and optimization
- Decentralized storage

### Method 2: Image URL (Traditional)
- Direct URL input
- Live preview
- Supports any publicly accessible image URL
- No upload processing required

## IPFS Gateways

The system uses multiple IPFS gateways for reliability:

### Primary Gateways
- `https://gateway.pinata.cloud/ipfs/` (Pinata)
- `https://w3s.link/ipfs/` (Web3.Storage)
- `https://nftstorage.link/ipfs/` (NFT.Storage)

### Fallback Gateways
- `https://ipfs.io/ipfs/` (Public)
- `https://cloudflare-ipfs.com/ipfs/` (Cloudflare)

## Error Handling

The system includes comprehensive error handling:

1. **File Validation**: Checks format, size, and dimensions
2. **Upload Retry**: Tries multiple IPFS providers
3. **Fallback Options**: Falls back to URL input if upload fails
4. **User Feedback**: Clear error messages and progress indicators

## Testing

To test the IPFS upload functionality:

1. Set up at least one IPFS service (Pinata recommended)
2. Add environment variables
3. Start the development server
4. Navigate to token registration
5. Try uploading a test image (400x300 PNG recommended)
6. Verify the image appears and IPFS URL is generated

## Production Considerations

### Security
- API keys are server-side only (not exposed to client)
- File validation prevents malicious uploads
- Size limits prevent abuse

### Performance
- Images are automatically optimized
- Multiple provider fallbacks ensure reliability
- Progress indicators improve user experience

### Cost Management
- Free tiers are sufficient for most use cases
- Monitor usage through provider dashboards
- Consider upgrading for high-volume applications

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check API keys and network connectivity
2. **Image Too Large**: Ensure image is under 5MB
3. **Invalid Format**: Use PNG, JPG, SVG, or WebP
4. **Slow Upload**: Large images take longer; consider resizing

### Debug Mode

Enable debug logging by adding to your environment:
```env
DEBUG=ipfs:*
```

This will show detailed IPFS upload logs in the console.
