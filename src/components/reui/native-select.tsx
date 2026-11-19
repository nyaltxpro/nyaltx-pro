import type { SelectHTMLAttributes } from 'react';

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function NativeSelect({ className = '', children, ...props }: NativeSelectProps) {
  return (
    <select
      data-slot="native-select"
      className={`h-10 w-full rounded-lg border border-white/15 bg-[#15191f] px-3 text-sm text-slate-100 outline-none focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
