import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
  description?: string;
  required?: boolean;
  className?: string;
}

export function Field({
  id,
  label,
  children,
  description,
  required = false,
  className = '',
}: FieldProps) {
  return (
    <div data-slot="field" className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-rose-300">*</span>}
      </label>
      {children}
      {description && <p id={`${id}-description`} className="text-xs text-slate-400">{description}</p>}
    </div>
  );
}
