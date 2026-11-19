'use client';

import type { InputHTMLAttributes } from 'react';

export function RadioGroup({ className = '', ...props }: InputHTMLAttributes<HTMLDivElement>) {
  return <div data-slot="radio-group" role="radiogroup" className={`grid gap-2 ${className}`} {...props} />;
}

export function Radio({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="radio"
      type="radio"
      className={`size-4 accent-cyan-500 ${className}`}
      {...props}
    />
  );
}
