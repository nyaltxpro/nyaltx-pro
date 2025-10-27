import { PricingPage } from '@/components/PrigingPage';
import { tinaClient } from '@/lib/tinaClient';

const Pricing = async () => {
  const tinaData = await tinaClient.queries.podcast({
    relativePath: 'pricing.json',
  });




  return <PricingPage tinaData={tinaData} />;
};

export default Pricing;
