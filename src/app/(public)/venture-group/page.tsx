import { tinaClient } from '@/lib/tinaClient';
import VentureGroupPage from '@/page-components/VentureGroupPage';

const VentureGroup = async () => {
  const tinaData = await tinaClient.queries.venturegroup({
    relativePath: 'venturegroup.json',
  });

  return <VentureGroupPage tinaData={tinaData} />;
};

export default VentureGroup;
