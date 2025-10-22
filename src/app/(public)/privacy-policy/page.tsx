import { tinaClient } from '@/lib/tinaClient';
import PrivacyPolicy from '@/page-components/PrivacyPolicy';

const PrivacyPolicyPage = async () => {
  const tinaData = await tinaClient.queries.privacyPolicy({
    relativePath: 'privacypolicy.json',
  });

  return <PrivacyPolicy tinaData={tinaData} />;
};

export default PrivacyPolicyPage;
