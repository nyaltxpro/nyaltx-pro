import type { ReactNode } from 'react';

export function Sortable({ items, renderItem }: { items: ReactNode[]; renderItem?: (item: ReactNode, index: number) => ReactNode }) {
  return (
    <ol data-slot="sortable" className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] p-2">
          <span aria-hidden="true" className="cursor-grab select-none text-slate-600">::</span>
          {renderItem ? renderItem(item, index) : item}
        </li>
      ))}
    </ol>
  );
}
