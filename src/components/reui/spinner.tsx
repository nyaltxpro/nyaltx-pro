import type { ComponentProps } from 'react';

export function Spinner({ className = '', ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`size-5 animate-spin ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-90" />
    </svg>
  );
}
