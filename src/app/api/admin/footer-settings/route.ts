import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

interface FooterSettings {
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  newsletterTitle: string;
  newsletterDescription: string;
  socialTitle: string;
  socialDescription: string;
  disclaimer: string;
  copyright: string;
  socialLinks: {
    twitter: string;
    discord: string;
    youtube: string;
    telegram: string;
  };
  footerLinks: Array<{
    name: string;
    url: string;
    enabled: boolean;
  }>;
  updatedAt: Date;
}

// GET - Fetch footer settings
export async function GET() {
  try {
    const db = await getDb();
    
    const settings = await db.collection('footer_settings').findOne({});
    
    // If no settings exist, return default values
    if (!settings) {
      const defaultSettings = {
        title: 'NYALTX',
        subtitle: 'Get news about cryptocurrencies every day!',
        description: 'Stay Ahead in Crypto – Join NYALTX Venture Access Network Get daily insights, market news, and exclusive invites to networking events.',
        newsletterTitle: 'Join Our Community',
        newsletterDescription: 'Get exclusive crypto insights, market updates, and early access to new features.',
        socialTitle: 'Follow us on social media!',
        socialDescription: 'Follow us on social media and find all you need to know about crypto world!',
        disclaimer: 'All content available on our website, on hyperlinked websites, and on applications, forums, blogs, social media accounts and other platforms associated with Nyaltx is intended solely to provide you with general information. We make no warranties of any kind with respect to our content, including, but not limited to, the accuracy and currency of the information. None of the content we provide should be construed as financial, legal or any other type of advice on which you may rely. Nothing on our Site should be considered an invitation or offer to take any action.',
        copyright: '© Nyaltx.io 2025 - 2149.0 - info@Nyaltx.io | Ads & Marketing: marketing@Nyaltx.io',
        socialLinks: {
          twitter: 'https://x.com/nyaltx',
          discord: 'https://discord.gg/tFMJ7eHj',
          youtube: 'https://www.youtube.com/c/Nyaltx',
          telegram: 'https://t.me/nyaltx'
        },
        footerLinks: [
          { name: 'General Statement', url: '/general-statement', enabled: true },
          { name: 'Legal Advice', url: '/legal-advice', enabled: true },
          { name: 'About us', url: '/about-us', enabled: true },
          { name: 'Nyaltx Pro', url: '/pro-signup', enabled: true },
          { name: 'Contact', url: '/contact', enabled: true },
          { name: 'Privacy policy', url: '/privacy-policy', enabled: true },
          { name: 'Cookie Settings', url: '/cookies-settings', enabled: true }
        ]
      };
      
      return NextResponse.json({ success: true, data: defaultSettings });
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch footer settings' },
      { status: 500 }
    );
  }
}

// POST - Update footer settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    
    const footerSettings: FooterSettings = {
      ...body,
      updatedAt: new Date()
    };
    
    // Upsert the footer settings (update if exists, create if not)
    const result = await db.collection('footer_settings').replaceOne(
      {},
      footerSettings,
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Footer settings updated successfully',
      data: footerSettings 
    });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update footer settings' },
      { status: 500 }
    );
  }
}
