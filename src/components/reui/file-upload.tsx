'use client';

import { Upload } from 'lucide-react';
import type { DragEvent } from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({
  id,
  label,
  accept,
  multiple = false,
  disabled = false,
  description,
  className = '',
  onFilesSelected,
}: FileUploadProps) {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) onFilesSelected(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      data-slot="file-upload"
      onDragOver={event => event.preventDefault()}
      onDrop={handleDrop}
      className={`rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-2 ${className}`}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={event => onFilesSelected(Array.from(event.currentTarget.files ?? []))}
        className="sr-only"
      />
      <label
        htmlFor={id}
        aria-disabled={disabled}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 focus-within:ring-2 focus-within:ring-cyan-400/50 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <Upload aria-hidden="true" className="size-4 text-cyan-300" />
        {label}
      </label>
      <p className="mt-2 text-xs text-slate-500">{description || 'Choose a file or drag it here.'}</p>
    </div>
  );
}
