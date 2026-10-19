import { whitepaper } from '../../.source';
import { loader } from 'fumadocs-core/source';

const mdxSource = whitepaper.toFumadocsSource();
const files =
  typeof mdxSource.files === 'function' ? mdxSource.files() : mdxSource.files;

export const whitepaperSource = loader({
  baseUrl: '/whitepaper',
  source: { files },
});
