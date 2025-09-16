import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const tokens = await getCollection<any>('token_registrations');
    
    // Get tokens that are approved and in race
    const raceTokens = await tokens.find({
      status: 'approved',
      inRace: true,
      paused: { $ne: true }
    }).toArray();

    // Format tokens for race display
    const formattedTokens = raceTokens.map((token, index) => ({
      id: token.id,
      symbol: token.tokenSymbol?.toUpperCase() || 'UNKNOWN',
      name: token.tokenName,
      price: '0.00', // You can integrate with price APIs later
      rank: index + 1,
      image: token.imageUri || '/crypto-icons/color/generic.svg',
      contractAddress: token.contractAddress,
      blockchain: token.blockchain,
      racePromotedAt: token.racePromotedAt,
      points: token.points || 0
    }));

    // Sort by points (highest first), then by promotion date
    formattedTokens.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(b.racePromotedAt || 0).getTime() - new Date(a.racePromotedAt || 0).getTime();
    });

    return NextResponse.json({ 
      success: true, 
      data: formattedTokens.slice(0, 10) 
    });

  } catch (error) {
    console.error("Race tokens fetch error:", error);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: "Failed to fetch race tokens" 
    }, { status: 500 });
  }
}
