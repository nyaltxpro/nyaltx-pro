import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/adminAuth";
import { getCollection } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tokenId, action } = await req.json();
    if (!tokenId || !action) {
      return NextResponse.json({ message: "Missing tokenId or action" }, { status: 400 });
    }

    const tokens = await getCollection<any>('token_registrations');
    const token = await tokens.findOne({ id: tokenId });
    
    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

    if (token.status !== 'approved') {
      return NextResponse.json({ message: "Token must be approved first" }, { status: 400 });
    }

    let updateData: any = {};
    
    if (action === 'promote') {
      updateData = {
        inRace: true,
        racePromotedAt: new Date().toISOString(),
        raceRank: null, // Will be calculated based on performance
        updatedAt: new Date().toISOString()
      };
    } else if (action === 'remove') {
      updateData = {
        inRace: false,
        racePromotedAt: null,
        raceRank: null,
        updatedAt: new Date().toISOString()
      };
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const result = await tokens.updateOne(
      { id: tokenId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

    // Get updated token
    const updatedToken = await tokens.findOne({ id: tokenId });

    return NextResponse.json({ 
      success: true, 
      message: action === 'promote' ? 'Token promoted to race' : 'Token removed from race',
      token: updatedToken
    });

  } catch (error) {
    console.error("Token race promotion error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
