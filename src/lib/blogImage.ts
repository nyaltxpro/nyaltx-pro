import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

/** Encode each path segment so spaces/commas in public filenames still load. */
export function encodePublicPath(path: string): string {
  if (!path.startsWith('/')) return path;
  return path
    .split('/')
    .map((segment, index) => {
      if (index === 0) return '';
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

/** Resolve blog featured / OG images for Next Image or <img>. */
export function resolveBlogImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const reliable = toReliableIpfsUrl(trimmed) || trimmed;

  if (reliable.startsWith('/')) {
    return encodePublicPath(reliable);
  }

  return reliable;
}

export function isLocalBlogImage(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./');
}
