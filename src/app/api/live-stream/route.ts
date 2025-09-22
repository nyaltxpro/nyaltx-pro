import { NextRequest, NextResponse } from 'next/server';

// Mock data for live stream activities
const mockTokens = [
  { symbol: 'PEPE', name: 'Pepe Coin', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', image: '/crypto-icons/color/pepe.svg' },
  { symbol: 'DOGE', name: 'Dogecoin', address: '0xba2ae424d960c26247dd6c32edc70b295c744c43', image: '/crypto-icons/color/doge.svg' },
  { symbol: 'SHIB', name: 'Shiba Inu', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', image: '/crypto-icons/color/shib.svg' },
  { symbol: 'FLOKI', name: 'Floki Inu', address: '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e', image: '/crypto-icons/color/floki.svg' },
  { symbol: 'NYAX', name: 'NYAX Token', address: '0x5eed5621b92be4473f99bacac77acfa27deb57d9', image: '/logo.png' },
];

const mockUsers = [
  { address: '0x1234567890123456789012345678901234567890', name: 'CryptoWhale', avatar: '/avatars/whale.png' },
  { address: '0x9876543210987654321098765432109876543210', name: 'DiamondHands', avatar: '/avatars/diamond.png' },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'MoonBoy', avatar: '/avatars/moon.png' },
  { address: '0x5555555555555555555555555555555555555555', name: 'HODLer', avatar: '/avatars/hodl.png' },
];

const messages = [
  "🚀 TO THE MOON!",
  "This is going parabolic!",
  "Diamond hands only 💎",
  "Best community ever!",
  "WAGMI 🔥",
  "LFG!!!",
  "This is the way",
  "Bullish AF 📈",
  "When Lambo?",
  "HODL strong! 💪"
];

const milestones = [
  "Reached 1000 holders!",
  "Market cap hit $1M!",
  "Listed on DEX!",
  "Community milestone achieved!",
  "New ATH reached!",
  "Trending on social media!",
  "Partnership announced!",
  "Audit completed!"
];

function generateActivity() {
  const types = ['buy', 'sell', 'create', 'comment', 'milestone'];
  const type = types[Math.floor(Math.random() * types.length)];
  const token = mockTokens[Math.floor(Math.random() * mockTokens.length)];
  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];

  const activity = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    timestamp: Date.now(),
    user,
    token,
  };

  switch (type) {
    case 'buy':
    case 'sell':
      return {
        ...activity,
        amount: Math.random() * 10000 + 100,
        value: Math.random() * 5000 + 50,
      };
    case 'comment':
      return {
        ...activity,
        message: messages[Math.floor(Math.random() * messages.length)],
      };
    case 'milestone':
      return {
        ...activity,
        milestone: milestones[Math.floor(Math.random() * milestones.length)],
      };
    default:
      return activity;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '20');
  
  // Generate initial activities
  const activities = Array.from({ length: count }, () => generateActivity());
  
  return NextResponse.json({
    activities,
    viewerCount: Math.floor(Math.random() * 2000) + 500,
    totalActivities: Math.floor(Math.random() * 10000) + 5000,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, tokenAddress } = body;
    
    // In a real implementation, you would:
    // 1. Validate the user's authentication
    // 2. Store the activity in a database
    // 3. Broadcast to all connected WebSocket clients
    
    const newActivity = {
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'comment',
      timestamp: Date.now(),
      user: mockUsers[0], // In real app, get from auth
      token: mockTokens.find(t => t.address === tokenAddress) || mockTokens[0],
      message: message || 'New activity',
    };
    
    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
