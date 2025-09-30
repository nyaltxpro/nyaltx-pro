import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the detailed coins data from the scripts directory
    const filePath = path.join(process.cwd(), 'scripts', 'top400coins-detailed.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Coins data file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const coinsData = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      coins: coinsData.coins || [],
      metadata: coinsData.metadata || {},
      totalCoins: coinsData.coins?.length || 0
    });

  } catch (error) {
    console.error('Error loading local coins data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load coins data' },
      { status: 500 }
    );
  }
}
