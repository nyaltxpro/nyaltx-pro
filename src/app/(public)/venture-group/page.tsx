import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import VentureGroupPage from '@/page-components/VentureGroupPage';

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
