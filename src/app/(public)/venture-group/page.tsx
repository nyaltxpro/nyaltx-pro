import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import VentureGroupPage from '@/page-components/VentureGroupPage';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata(
  'NYALTX Venture Group: Backing Web3 Projects',
  'Explore the NYALTX Venture Group, its investment focus, and how early-stage blockchain projects can apply for support.',
  '/venture-group',
);

const VentureGroup = async () => {
  const tinaData = await tinaQueryOrJson(
    () => tinaClient.queries.venturegroup({ relativePath: 'venturegroup.json' }),
    'venturegroup',
    [
      'src/content/venturegroup/venturegroup.json',
      'content/venturegroup/settings.json',
    ],
  );

  return <VentureGroupPage tinaData={tinaData as any} />;
};

export default VentureGroup;
