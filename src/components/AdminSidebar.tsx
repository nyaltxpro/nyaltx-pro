'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/reui/dropdown-menu';
import {
  Activity,
  BarChart3,
  ChevronsUpDown,
  Coins,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Plus,
  Search,
  Settings,
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
  badge?: string;
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
  const pathname = usePathname() ?? '';
  const [search, setSearch] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#0b111b] text-white shadow-2xl transition-[width,transform] duration-200 md:translate-x-0 ${
          isCollapsed ? 'md:w-[72px]' : 'md:w-[260px]'
        } ${
          isMobileMenuOpen ? 'w-[280px] translate-x-0' : '-translate-x-full w-[280px] md:translate-x-0'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-white/[0.08] px-3">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open admin workspace menu"
                className={`group flex h-10 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.06] ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cyan-400/10 ring-1 ring-inset ring-cyan-300/15">
                  <Image
                    src="/nyaltxpro.png"
                    alt=""
                    width={30}
                    height={30}
                    className="h-7 w-7 object-contain"
                  />
                </span>
                <span className={`min-w-0 flex-1 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <span className="block truncate text-[13px] font-semibold tracking-tight">NYALTX</span>
                  <span className="block truncate text-[11px] text-slate-500">Admin workspace</span>
                </span>
                <ChevronsUpDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-500 ${isCollapsed ? 'md:hidden' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="z-[10000] w-56">
              <DropdownMenuLabel className="px-3 py-2 text-xs text-slate-400">
                Admin workspace
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/adminpanel" onClick={() => isMobileMenuOpen && toggleMobileMenu()}>
                  <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/adminpanel/profiles" onClick={() => isMobileMenuOpen && toggleMobileMenu()}>
                  <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                  Profiles
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-3 py-3">
          <label
            onClick={() => {
              if (isCollapsed) toggleCollapsed();
            }}
            className={`flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-slate-500 transition-colors focus-within:border-cyan-400/30 focus-within:text-slate-300 ${
              isCollapsed ? 'md:justify-center md:border-transparent md:bg-transparent md:px-0' : ''
            }`}
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter navigation"
              aria-label="Filter admin navigation"
              className={`min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600 ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            />
          </label>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {filteredGroups.map((group) => (
            <section key={group.title} className="space-y-1">
              <div
                className={`flex h-6 items-center px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 ${
                  isCollapsed ? 'md:hidden' : ''
                }`}
              >
                {group.title}
              </div>
              {group.items.map((item) => {
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
                    className={`group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] transition-colors ${
                      isActive
                        ? 'bg-cyan-400/[0.09] font-medium text-cyan-50'
                        : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'
                    } ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 h-5 w-0.5 rounded-r-full bg-cyan-400"
                      />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    <span className={`min-w-0 flex-1 truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400 ${
                          isCollapsed ? 'md:hidden' : ''
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-3">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open administrator menu"
                className={`flex h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.055] ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[11px] font-semibold text-slate-200 ring-1 ring-inset ring-white/10">
                  AD
                </span>
                <span className={`min-w-0 flex-1 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <span className="block truncate text-[13px] font-medium text-slate-200">Administrator</span>
                  <span className="block truncate text-[11px] text-slate-500">NYALTX Admin</span>
                </span>
                <ChevronsUpDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-500 ${isCollapsed ? 'md:hidden' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="z-[10000] w-56">
              <DropdownMenuLabel className="px-3 py-2 text-xs text-slate-400">
                Administrator
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/adminpanel/profiles" onClick={() => isMobileMenuOpen && toggleMobileMenu()}>
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                  Profiles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-rose-300"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className={`mt-3 flex items-center gap-2 px-2 text-[10px] text-slate-600 ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Administration</span>
          </div>
        </div>
      </aside>
    </>
  );
}
