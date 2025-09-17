import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // For now, return default admin settings
    // In a real implementation, this would fetch from a database or config
    const adminSettings = {
      socialLinksEnabled: true, // Allow social links to be displayed
      // Add other admin settings as needed
    };

    return NextResponse.json(adminSettings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // In a real implementation, you would:
    // 1. Validate admin authentication
    // 2. Update settings in database
    // 3. Return updated settings
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Settings updated successfully',
      settings: body 
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
