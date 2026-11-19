'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
    <Breadcrumb className={`min-w-0 ${className}`}>
      <BreadcrumbList>
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
                  <BreadcrumbSeparator>
                    <ChevronRight
                      aria-hidden="true"
                      className="mx-1 h-3.5 w-3.5 shrink-0 text-slate-600"
                      strokeWidth={1.8}
                    />
                  </BreadcrumbSeparator>
                )}
                {item.href && !isLast ? (
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <BreadcrumbLink href={item.href} className="flex items-center gap-1.5">
                      {index === 0 && <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      <span className="truncate">{item.label}</span>
                    </BreadcrumbLink>
                  </motion.div>
                ) : (
                  <BreadcrumbPage>
                    <span className="truncate">{item.label}</span>
                  </BreadcrumbPage>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
