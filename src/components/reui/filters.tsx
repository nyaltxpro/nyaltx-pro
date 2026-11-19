import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

interface FiltersProps {
  children: ReactNode;
  activeFilters?: ActiveFilter[];
  className?: string;
}

export function Filters({ children, activeFilters = [], className = '' }: FiltersProps) {
  return (
    <div data-slot="filters" className={`admin-panel-filter-bar ${className}`}>
      {children}
      {activeFilters.length > 0 && (
        <div data-slot="active-filters" className="flex w-full flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Active filters:</span>
          {activeFilters.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={filter.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              {filter.label}
              <X aria-hidden="true" className="size-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
