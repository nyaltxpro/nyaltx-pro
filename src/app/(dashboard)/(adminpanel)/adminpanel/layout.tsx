'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, LayoutDashboard, Mail, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <div className="admin-panel-shell min-h-screen w-full">
        <main className="min-h-screen w-full flex items-center justify-center">{children}</main>
      </div>
    );
  }

  return (
    <div className="admin-panel-shell min-h-screen text-white">
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
                className="group flex shrink-0 items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-white/5 data-[state=open]:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              >
                <Badge variant="info-light" size="sm" radius="full">
                  Admin
                </Badge>
                <div className="relative">
                  <Avatar size="default" aria-label="Administrator account">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span
                    aria-label="Verified administrator"
                    role="img"
                    className="absolute -bottom-0.5 -right-0.5"
                  >
                    <VerifiedBadge />
                  </span>
                </div>
                <ChevronDown
                  className="size-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-64 p-1.5">
              <DropdownMenuLabel className="px-3 py-2.5">
                <span className="block text-sm font-medium text-slate-100">Administrator</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-500">
                  NYALTX Admin account
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5 h-px bg-white/10" />
              <DropdownMenuItem
                asChild
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 outline-none transition-colors focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
              >
                <Link href="/adminpanel" className="flex w-full items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-400">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">Admin overview</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      View the administration dashboard
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 outline-none transition-colors focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
              >
                <Link href="/adminpanel/email-management" className="flex w-full items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-400">
                    <Mail className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">Email management</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Manage administrator email
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="admin-panel-content px-2 py-3 md:px-3 md:py-4">{children}</main>
      </div>
    </div>
  );
}
