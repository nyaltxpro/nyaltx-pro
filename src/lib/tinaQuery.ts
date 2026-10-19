import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';

/**
 * Try a Tina GraphQL query; if it fails (no Cloud / no local server),
 * load the first available static JSON fallback from disk.
 */
export async function tinaQueryOrJson(
  queryFn: () => Promise<any>,
  dataKey: string,
  jsonFallbackPaths: string[],
) {
  try {
    return await queryFn();
  } catch (error) {
    console.warn(`[tina] Falling back to static JSON for ${dataKey}:`, error);
    let lastError: unknown;
    for (const relativePath of jsonFallbackPaths) {
      try {
        const data = await loadJson(relativePath);
        return asTinaPageProps(dataKey, data);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`No Tina data or JSON fallback for ${dataKey}`);
  }
}
