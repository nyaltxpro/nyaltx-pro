'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/reui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/reui/dropdown-menu';

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open admin account menu"
                className="flex shrink-0 items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              >
                <Badge variant="info-light" size="sm" radius="full">
                  Admin
                </Badge>
                <div className="relative">
                  <Avatar size="default" aria-label="Administrator account">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80"
                      alt="Aron Thompson"
                    />
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <span
                    aria-label="Verified administrator"
                    role="img"
                    className="absolute -bottom-0.5 -right-0.5"
                  >
                    <VerifiedBadge />
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="px-3 py-2 text-xs text-slate-400">
                NYALTX administrator
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 h-px bg-white/10" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2 outline-none focus:bg-white/10">
                <Link href="/adminpanel">Admin overview</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2 outline-none focus:bg-white/10">
                <Link href="/adminpanel/email-management">Email management</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="admin-panel-content p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
