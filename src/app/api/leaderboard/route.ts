import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const tokens = await getCollection<any>('token_registrations');
    
    // Get all approved tokens with their points, sorted by points descending
    const leaderboardData = await tokens.find({
      status: 'approved'
    }).project({
      id: 1,
      tokenName: 1,
      tokenSymbol: 1,
      imageUri: 1,
      points: 1,
      blockchain: 1,
      contractAddress: 1,
      submittedByAddress: 1,
      createdAt: 1,
      pointsUpdatedAt: 1
    }).sort({ points: -1 }).toArray();

    // Add ranking to each token
    const rankedData = leaderboardData.map((token, index) => ({
      ...token,
      rank: index + 1,
      points: token.points || 0
    }));

    return NextResponse.json({ 
      success: true, 
      data: rankedData,
      totalTokens: rankedData.length
    });

  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch leaderboard data" 
    }, { status: 500 });
  }
}
