import WhitepaperPageClient from '@/page-components/Whitepaper';
import { tinaClient } from '@/lib/tinaClient';

type WhitepaperQuery = (args: { relativePath: string }) => Promise<any>;

export default async function WhitepaperPage() {
    const { whitepaper } = (tinaClient as unknown as {
        queries: { whitepaper: WhitepaperQuery };
    }).queries;

    const tinaData = await whitepaper({ relativePath: 'whitepaper.json' });

    return <WhitepaperPageClient data={tinaData} />;
}
