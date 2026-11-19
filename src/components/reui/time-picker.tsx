import type { InputHTMLAttributes } from 'react';

export function TimePicker({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="time-picker"
      type="time"
      className={`h-10 rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none focus:border-cyan-400/70 ${className}`}
      {...props}
    />
  );
}
