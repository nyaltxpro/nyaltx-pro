import { NextRequest, NextResponse } from 'next/server';
import { Keypair, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { uploadToIPFS } from '@/lib/ipfs';

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
    const ipfsProvider = (formData.get('ipfsProvider') as string) || 'platform';

    // Validate required fields
    if (!file || !name || !symbol || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: file, name, symbol, description' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Upload to IPFS using the new unified service
    let ipfsResult;
    let metadataUri: string;

    try {
      const metadata = {
        name,
        symbol,
        description,
        website: website || undefined,
        twitter: twitter || undefined,
        telegram: telegram || undefined,
        createdOn: 'https://nyaltx.pro',
      };

      // Use the new IPFS service with provider selection
      ipfsResult = await uploadToIPFS(
        file,
        metadata,
        ipfsProvider as any,
        platform as any
      );

      metadataUri = ipfsResult.metadataUrl;

      console.log('IPFS upload successful:', {
        provider: ipfsProvider,
        metadataUrl: metadataUri,
        imageUrl: ipfsResult.imageUrl,
        ipfsHash: ipfsResult.ipfsHash,
      });
    } catch (error) {
      console.error('IPFS upload error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to upload metadata to IPFS', 
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Generate a random keypair for the token
    const mintKeypair = Keypair.generate();

    // Prepare the token creation request
    const tokenMetadata = {
      name,
      symbol,
      uri: metadataUri,
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
        pool: platform,
      };

      const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createTokenPayload),
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
        imageUrl: ipfsResult.imageUrl,
        ipfsHash: ipfsResult.ipfsHash,
        platform,
        ipfsProvider,
        message: 'Token created successfully!',
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
        description,
      };

      return NextResponse.json({
        success: true,
        signature: simulatedResponse.signature,
        mint: simulatedResponse.mint,
        metadataUri: simulatedResponse.metadataUri,
        imageUrl: ipfsResult.imageUrl,
        ipfsHash: ipfsResult.ipfsHash,
        platform: simulatedResponse.platform,
        ipfsProvider,
        message:
          'Token created successfully! (Demo mode - add PUMP_PORTAL_API_KEY for real transactions)',
      });
    }
  } catch (error: any) {
    console.error('Token creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create token' }, { status: 500 });
  }
}

// Helper functions for demo purposes

function generateRandomSignature() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 88 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}
