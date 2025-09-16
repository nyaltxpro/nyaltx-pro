import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { tokenId, points } = await request.json();

    if (!tokenId || typeof points !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: "Token ID and points are required" 
      }, { status: 400 });
    }

    const tokens = await getCollection<any>('token_registrations');
    
    // Update token points
    const result = await tokens.updateOne(
      { id: tokenId },
      { 
        $set: { 
          points: points,
          pointsUpdatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Token not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Points updated successfully" 
    });

  } catch (error) {
    console.error("Points update error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update points" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tokens = await getCollection<any>('token_registrations');
    
    // Get all tokens with their points
    const tokensWithPoints = await tokens.find({
      status: 'approved'
    }).project({
      id: 1,
      tokenName: 1,
      tokenSymbol: 1,
      imageUri: 1,
      points: 1,
      inRace: 1,
      blockchain: 1
    }).toArray();

    return NextResponse.json({ 
      success: true, 
      data: tokensWithPoints 
    });

  } catch (error) {
    console.error("Tokens fetch error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch tokens" 
    }, { status: 500 });
  }
}
