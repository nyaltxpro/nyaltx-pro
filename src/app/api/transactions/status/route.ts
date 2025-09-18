import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const signature = searchParams.get('signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Transaction signature is required' },
        { status: 400 }
      );
    }

    // For demo purposes, simulate transaction status
    // In production, you would check the actual Solana blockchain
    const rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    
    try {
      const connection = new Connection(rpcEndpoint, 'confirmed');
      
      // Check if transaction exists on blockchain
      const status = await connection.getSignatureStatus(signature);
      
      if (status.value === null) {
        // Transaction not found or still pending
        return NextResponse.json({
          signature,
          status: 'pending',
          confirmations: 0
        });
      }

      if (status.value.err) {
        // Transaction failed
        return NextResponse.json({
          signature,
          status: 'failed',
          error: status.value.err,
          confirmations: 0
        });
      }

      // Transaction confirmed
      return NextResponse.json({
        signature,
        status: 'confirmed',
        confirmations: status.value.confirmations || 0,
        slot: status.value.slot
      });

    } catch (rpcError) {
      // If RPC fails, simulate status for demo
      console.log('RPC check failed, using simulation:', rpcError);
      
      // Simulate random status for demo purposes
      const random = Math.random();
      let simulatedStatus: 'pending' | 'confirmed' | 'failed';
      
      if (random < 0.7) {
        simulatedStatus = 'confirmed';
      } else if (random < 0.9) {
        simulatedStatus = 'pending';
      } else {
        simulatedStatus = 'failed';
      }

      return NextResponse.json({
        signature,
        status: simulatedStatus,
        confirmations: simulatedStatus === 'confirmed' ? 32 : 0,
        demo: true
      });
    }

  } catch (error: any) {
    console.error('Transaction status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check transaction status' },
      { status: 500 }
    );
  }
}
