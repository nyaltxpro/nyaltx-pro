import { tinaClient } from '@/lib/tinaClient';
import PrivacyPolicy from '@/page-components/PrivacyPolicy';

const DashboardPrivacyPolicyPage = async () => {
  const tinaData = await tinaClient.queries.privacyPolicy({
    relativePath: 'privacypolicy.json',
  });

  return <PrivacyPolicy tinaData={tinaData} />;
};

export default DashboardPrivacyPolicyPage;
