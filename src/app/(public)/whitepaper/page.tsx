import WhitepaperPageClient from '@/page-components/Whitepaper';
import { promises as fs } from 'fs';
import path from 'path';

export default async function WhitepaperPage() {
  let tinaData;

  try {
    // Try to use TinaCMS if available (development)
    const { tinaClient } = await import('@/lib/tinaClient');
    const { whitepaper } = (tinaClient as unknown as {
      queries: { whitepaper: (args: { relativePath: string }) => Promise<any> };
    }).queries;

    tinaData = await whitepaper({ relativePath: 'whitepaper.json' });
  } catch (error) {
    // Fallback to static JSON file for production builds
    try {
      const filePath = path.join(process.cwd(), 'content', 'whitepaper', 'whitepaper.json');
      const fileContents = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(fileContents);

      // Format to match TinaCMS data structure
      tinaData = {
        data: {
          whitepaper: jsonData
        }
      };
    } catch (fallbackError) {
      // If both TinaCMS and static file fail, provide minimal fallback data
      tinaData = {
        data: {
          whitepaper: {
            title: "NYALTX Whitepaper",
            description: "Welcome to the comprehensive technical documentation for NYALTX.",
            hero: {
              title: "NYALTX Whitepaper",
              subtitle: "New York Alt Exchange - Powered by the NYAX Token",
              tagline: "Transforming crypto marketing, trading, and community engagement"
            },
            toc: [],
            sections: []
          }
        }
      };
    }
  }

  return <WhitepaperPageClient data={tinaData} />;
}
