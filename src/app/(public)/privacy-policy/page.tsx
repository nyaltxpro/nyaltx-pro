import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import PrivacyPolicy from '@/page-components/PrivacyPolicy';

const PrivacyPolicyPage = async () => {
  const tinaData = await tinaQueryOrJson(
    () => tinaClient.queries.privacyPolicy({ relativePath: 'privacypolicy.json' }),
    'privacyPolicy',
    [
      'src/content/privacypolicy/privacypolicy.json',
      'content/privacypolicy/settings.json',
    ],
  );

  return <PrivacyPolicy tinaData={tinaData as any} />;
};

export default PrivacyPolicyPage;
