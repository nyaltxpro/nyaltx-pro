import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', type = 'text', ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={`flex h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
