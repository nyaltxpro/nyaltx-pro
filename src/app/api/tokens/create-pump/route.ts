import { NextRequest, NextResponse } from 'next/server';
import { Keypair, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const description = formData.get('description') as string;
    const website = formData.get('website') as string;
    const twitter = formData.get('twitter') as string;
    const telegram = formData.get('telegram') as string;
    const platform = formData.get('platform') as string;
    const devBuyAmount = formData.get('devBuyAmount') as string;
    const slippage = formData.get('slippage') as string;
    const priorityFee = formData.get('priorityFee') as string;

    // Validate required fields
    if (!file || !name || !symbol || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: file, name, symbol, description' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create metadata for IPFS upload
    const metadataFormData = new FormData();
    metadataFormData.append('file', file);
    metadataFormData.append('name', name);
    metadataFormData.append('symbol', symbol);
    metadataFormData.append('description', description);
    metadataFormData.append('twitter', twitter || '');
    metadataFormData.append('telegram', telegram || '');
    metadataFormData.append('website', website || '');
    metadataFormData.append('showName', 'true');

    let metadataUri: string;
    let metadataResponse: any;

    try {
      // Upload metadata to IPFS based on platform
      if (platform === 'bonk') {
        // For Bonk platform, use their specific endpoints
        const imgResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/img', {
          method: 'POST',
          body: metadataFormData,
        });
        const imgUri = await imgResponse.text();

        const metaResponse = await fetch('https://nft-storage.letsbonk22.workers.dev/upload/meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createdOn: 'https://bonk.fun',
            description,
            image: imgUri,
            name,
            symbol,
            website: website || ''
          }),
        });
        metadataUri = await metaResponse.text();
        metadataResponse = { metadataUri, metadata: { name, symbol } };
      } else {
        // For Pump.fun and Moonshot, use pump.fun IPFS
        const ipfsResponse = await fetch('https://pump.fun/api/ipfs', {
          method: 'POST',
          body: metadataFormData,
        });
        metadataResponse = await ipfsResponse.json();
        metadataUri = metadataResponse.metadataUri;
      }
    } catch (error) {
      console.error('IPFS upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload metadata to IPFS' },
        { status: 500 }
      );
    }

    // Generate a random keypair for the token
    const mintKeypair = Keypair.generate();

    // Prepare the token creation request
    const tokenMetadata = {
      name: metadataResponse.metadata.name,
      symbol: metadataResponse.metadata.symbol,
      uri: metadataUri
    };

    // Check if we have API key for production mode
    const apiKey = process.env.PUMP_PORTAL_API_KEY;
    
    if (apiKey && apiKey !== 'your-pump-portal-api-key-here') {
      // Production mode - real API call
      const createTokenPayload = {
        action: 'create',
        tokenMetadata,
        mint: bs58.encode(mintKeypair.secretKey),
        denominatedInSol: 'true',
        amount: parseFloat(devBuyAmount || '1'),
        slippage: parseInt(slippage || '10'),
        priorityFee: parseFloat(priorityFee || '0.0005'),
        pool: platform
      };

      const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createTokenPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create token: ${errorText}`);
      }
      
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        signature: data.signature,
        mint: mintKeypair.publicKey.toBase58(),
        metadataUri,
        platform,
        message: 'Token created successfully!'
      });
    } else {
      // Demo mode - simulated response
      const simulatedResponse = {
        signature: generateRandomSignature(),
        mint: mintKeypair.publicKey.toBase58(),
        metadataUri,
        platform,
        name,
        symbol,
        description
      };

      return NextResponse.json({
        success: true,
        signature: simulatedResponse.signature,
        mint: simulatedResponse.mint,
        metadataUri: simulatedResponse.metadataUri,
        platform: simulatedResponse.platform,
        message: 'Token created successfully! (Demo mode - add PUMP_PORTAL_API_KEY for real transactions)'
      });
    }

  } catch (error: any) {
    console.error('Token creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create token' },
      { status: 500 }
    );
  }
}

// Helper functions for demo purposes

function generateRandomSignature() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 88 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
