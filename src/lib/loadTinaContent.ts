import { promises as fs } from 'fs';
import path from 'path';

/**
 * Load JSON from disk for production builds when Tina Cloud / local GraphQL is unavailable.
 * Paths are relative to the project root.
 */
export async function loadJson(relativePathFromRoot: string) {
  const filePath = path.join(process.cwd(), relativePathFromRoot);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function loadTinaJson(relativePathFromContent: string) {
  return loadJson(path.join('content', relativePathFromContent));
}

export function asTinaPageProps(key: string, data: unknown) {
  return {
    data: { [key]: data },
    variables: {},
    query: '',
  };
}
