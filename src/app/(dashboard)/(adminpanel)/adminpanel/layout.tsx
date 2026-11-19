'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const AdminSidebar = dynamic(() => import('@/components/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="fixed left-0 top-0 h-full bg-[#0f1923] w-16 z-50"></div>
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/adminpanel/login';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const formatSegment = (segment: string) =>
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());

  const routeSegments = pathname.split('/').filter(Boolean).slice(1);
  const breadcrumbItems = [
    { label: 'Admin', href: '/adminpanel' },
    ...routeSegments.map((segment, index) => {
      const href = `/adminpanel/${routeSegments.slice(0, index + 1).join('/')}`;
      const label = formatSegment(segment);
      const isLast = index === routeSegments.length - 1;
      return isLast ? { label } : { label, href };
    }),
  ];

  if (routeSegments.length === 0) {
    breadcrumbItems.splice(1);
  }

  if (isLogin) {
    return (
      <div className="min-h-screen w-full">
        <main className="min-h-screen w-full flex items-center justify-center">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(open => !open)}
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(collapsed => !collapsed)}
      />

      <div
        className={`min-h-screen transition-[margin] duration-200 ${
          isCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#0b111b]/95 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(open => !open)}
              aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(collapsed => !collapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:block"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.7} />
              ) : (
                <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.7} />
              )}
            </button>
            <AdminBreadcrumb items={breadcrumbItems} />
          </div>
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-semibold text-cyan-200"
          >
            A
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
