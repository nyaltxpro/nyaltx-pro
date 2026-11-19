'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Collapsible } from '@/components/reui/collapsible';
import {
  Activity,
  BarChart3,
  Coins,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Plus,
  Search,
  ShoppingCart,
  Tags,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';

interface AdminSidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

const navGroups: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/adminpanel', icon: LayoutDashboard },
      { title: 'NYAX Admin', href: '/adminpanel/nyax-admin', icon: Coins },
      { title: 'Tokens', href: '/adminpanel/tokens', icon: Coins },
      { title: 'Register Token', href: '/adminpanel/tokens/register', icon: Plus },
      { title: 'Orders', href: '/adminpanel/orders', icon: ShoppingCart },
      { title: 'Users', href: '/adminpanel/users', icon: Users },
      { title: 'Analytics', href: '/adminpanel/statistics', icon: BarChart3 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Token Points', href: '/adminpanel/points', icon: Gift },
      { title: 'Email Management', href: '/adminpanel/email-management', icon: Mail },
      { title: 'Blog Posts', href: '/adminpanel/blog', icon: Newspaper },
      { title: 'Corporate News', href: '/adminpanel/news', icon: Newspaper },
      { title: 'News Promo Codes', href: '/adminpanel/news-promo-codes', icon: Tags },
      { title: 'Banners', href: '/adminpanel/banners', icon: ImageIcon },
      { title: 'Newshub Banners', href: '/adminpanel/newshub-banners', icon: ImageIcon },
      { title: 'Trade Videos', href: '/adminpanel/trade-videos', icon: Video },
    ],
  },
];

export default function AdminSidebar({
  isMobileMenuOpen,
  toggleMobileMenu,
  isCollapsed,
  toggleCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.title.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter(group => group.items.length > 0);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Logout failed with status ${response.status}`);
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      window.location.assign('/adminpanel/login');
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-[#0f1623] p-3 text-white shadow-xl transition-[width,transform] duration-200 md:translate-x-0 ${
          isCollapsed ? 'md:w-[68px]' : 'md:w-[260px]'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <Link
          href="/adminpanel"
          aria-label="NYALTX Admin Dashboard"
          onClick={() => isMobileMenuOpen && toggleMobileMenu()}
          className={`mb-4 flex h-12 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-white/5 ${
            isCollapsed ? 'md:justify-center md:px-0' : ''
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 ring-1 ring-cyan-400/15">
            <Image
              src="/nyaltxpro.png"
              alt="NYALTX"
              width={30}
              height={30}
              className="h-7 w-7 object-contain"
            />
          </span>
          <span className={`min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
            <span className="block truncate text-[13px] font-semibold">NYALTX</span>
            <span className="block truncate text-[11px] text-slate-400">Admin Panel</span>
          </span>
        </Link>

        <label
          onClick={() => {
            if (isCollapsed) toggleCollapsed();
          }}
          className={`mb-4 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 text-slate-400 ${
            isCollapsed ? 'md:justify-center md:border-transparent md:bg-transparent md:px-0' : ''
          }`}
        >
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.7} />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Filter navigation"
            aria-label="Filter admin navigation"
            className={`min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          />
        </label>

        <nav aria-label="Admin navigation" className="flex-1 space-y-5 overflow-y-auto">
          {filteredGroups.map(group => (
            <Collapsible
              key={group.title}
              title={
                <span
                  className={`truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ${
                    isCollapsed ? 'md:hidden' : ''
                  }`}
                >
                  {group.title}
                </span>
              }
              defaultOpen
              open={isCollapsed ? true : undefined}
              triggerClassName={isCollapsed ? 'hidden' : 'mb-1.5 px-2.5'}
              contentClassName="space-y-0.5"
              className="space-y-0.5"
            >
              {group.items.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/adminpanel' && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                    className={`group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors ${
                      isActive
                        ? 'bg-white/10 font-medium text-white'
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                    } ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                      strokeWidth={1.7}
                    />
                    <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </Collapsible>
          ))}
        </nav>

        <div className="mt-3 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={isCollapsed ? 'Log out' : undefined}
            className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-rose-300 transition-colors hover:bg-rose-400/10 disabled:opacity-60 ${
              isCollapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.7} />
            <span className={isCollapsed ? 'md:hidden' : ''}>
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </span>
          </button>
          <div
            className={`mt-3 flex items-center gap-2 px-2 text-[10px] text-slate-500 ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Administration</span>
          </div>
        </div>
      </aside>
    </>
  );
}
