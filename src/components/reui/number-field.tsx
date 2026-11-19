import type { InputHTMLAttributes } from 'react';

export type NumberFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function NumberField({ className = '', ...props }: NumberFieldProps) {
  return (
    <input
      data-slot="number-field"
      type="number"
      className={`h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10 ${className}`}
      {...props}
    />
  );
}
