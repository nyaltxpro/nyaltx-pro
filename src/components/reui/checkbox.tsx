import type { ComponentProps } from 'react';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

export function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <input
      data-slot="checkbox"
      type="checkbox"
      className={`size-4 shrink-0 cursor-pointer rounded border border-white/25 bg-slate-900 accent-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
