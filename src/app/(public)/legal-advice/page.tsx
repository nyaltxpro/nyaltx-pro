import LegalAdviceClient from '@/page-components/LegalAdvice';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';

export default async function LegalAdvicePage() {
  const res = await tinaQueryOrJson(
    () =>
      tinaClient.queries.legalAdvice({
        relativePath: 'legaladvice.json',
      }),
    'legalAdvice',
    [
      'src/content/legaladvice/legaladvice.json',
      'content/legaladvice/settings.json',
    ],
  );
  return <LegalAdviceClient {...(res as any)} />;
}
