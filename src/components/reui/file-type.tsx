import { File } from 'lucide-react';

interface FileTypeProps {
  fileName: string;
  className?: string;
}

const FILE_COLORS: Record<string, string> = {
  jpg: 'text-amber-300',
  jpeg: 'text-amber-300',
  png: 'text-amber-300',
  webp: 'text-amber-300',
  gif: 'text-amber-300',
  svg: 'text-amber-300',
  pdf: 'text-rose-300',
  zip: 'text-violet-300',
  csv: 'text-emerald-300',
  txt: 'text-slate-300',
};

export function FileType({ fileName, className = '' }: FileTypeProps) {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'file';
  const label = extension === 'jpeg' ? 'JPG' : extension.slice(0, 4).toUpperCase();

  return (
    <span
      data-slot="file-type"
      aria-label={`${extension} file`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[9px] font-semibold tracking-wide ${FILE_COLORS[extension] || 'text-slate-300'} ${className}`}
    >
      <File aria-hidden="true" className="size-3" />
      {label}
    </span>
  );
}
