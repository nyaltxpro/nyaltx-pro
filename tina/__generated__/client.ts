import { createClient } from 'tinacms/dist/client';
import { queries } from './types';

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  'main';

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const token = process.env.TINA_TOKEN || '';

const url = clientId
  ? `https://content.tinajs.io/1.4/content/${clientId}/github/${branch}`
  : process.env.TINA_GRAPHQL_URL || 'http://localhost:4001/graphql';

export const client = createClient({
  url,
  token,
  queries,
});

export default client;
