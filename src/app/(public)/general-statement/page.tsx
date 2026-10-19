import GeneralStatementClient from '@/page-components/GeneralStatement';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';

export default async function GeneralStatementPage() {
  const res = await tinaQueryOrJson(
    () =>
      tinaClient.queries.generalStatement({
        relativePath: 'generalstatement.json',
      }),
    'generalStatement',
    [
      'src/content/generalstatement/generalstatement.json',
      'content/generalstatement.json',
    ],
  );
  return <GeneralStatementClient {...(res as any)} />;
}
