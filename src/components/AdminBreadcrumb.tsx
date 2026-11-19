'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: AdminBreadcrumbItem[];
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function AdminBreadcrumb({ items, className = '' }: AdminBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 ${className}`}>
      <ol className="flex min-w-0 items-center">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const key = item.href ? `${item.label}-${item.href}` : `${item.label}-${index}`;
            return (
              <motion.li
                key={key}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.18, ease }}
                className="flex min-w-0 items-center"
              >
                {index > 0 && (
                  <ChevronRight
                    aria-hidden="true"
                    className="mx-1 h-3.5 w-3.5 shrink-0 text-slate-600"
                    strokeWidth={1.8}
                  />
                )}
                {item.href && !isLast ? (
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                    >
                      {index === 0 && <Home className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </motion.div>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className="inline-flex min-h-9 max-w-[220px] items-center rounded-lg px-2 text-sm font-medium text-slate-100"
                  >
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </nav>
  );
}
