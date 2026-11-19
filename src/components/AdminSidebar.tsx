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
  BarChart3,
  ChevronDown,
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
import VerifiedBadge from '@/components/VerifiedBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    src="/nyaltxpro.png"
                    alt=""
                    width={30}
                    height={30}
                    className="h-7 w-7 object-contain"
                  />
                </span>
                <span className={`min-w-0 flex-1 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <span className="block truncate text-sm font-semibold tracking-tight">NYALTX</span>
                  <span className="block truncate text-xs text-slate-500">Admin workspace</span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180 ${
                    isCollapsed ? 'md:hidden' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="z-[10000] w-56">
              <DropdownMenuLabel className="px-3 py-2 text-xs text-slate-400">
                Admin workspace
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 h-px bg-white/10" />
              <DropdownMenuItem
                asChild
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 outline-none transition-colors focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
              >
                <Link
                  href="/adminpanel"
                  className="flex w-full items-center gap-2.5"
                  onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                >
                  <LayoutDashboard className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 outline-none transition-colors focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
              >
                <Link
                  href="/adminpanel/profiles"
                  className="flex w-full items-center gap-2.5"
                  onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                >
                  <Users className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
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
                className={`flex h-6 items-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 ${
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
                    className={`group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-400/[0.09] text-cyan-50'
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
                        className={`rounded-full bg-white/[0.06] px-1.5 py-0.5 text-xs text-slate-400 ${
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
                className={`group flex h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.055] ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}
              >
                <span className="relative shrink-0">
                  <Avatar size="sm" aria-label="Administrator account">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span
                    aria-label="Verified administrator"
                    role="img"
                    className="absolute -bottom-0.5 -right-0.5"
                  >
                    <VerifiedBadge />
                  </span>
                </span>
                <span className={`min-w-0 flex-1 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <span className="block truncate text-sm font-medium text-slate-200">Administrator</span>
                  <span className="block truncate text-xs text-slate-500">NYALTX Admin</span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180 ${
                    isCollapsed ? 'md:hidden' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="z-[10000] w-64">
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
                <Link
                  href="/adminpanel/profiles"
                  className="flex w-full items-center gap-3"
                  onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-400">
                    <Settings className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">Profile settings</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Manage administrator profile
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 h-px bg-white/10" />
              <DropdownMenuItem
                onSelect={handleLogout}
                disabled={isLoggingOut}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-rose-300 outline-none transition-colors focus:bg-rose-500/10 focus:text-rose-200 data-[highlighted]:bg-rose-500/10 data-[highlighted]:text-rose-200 disabled:opacity-50"
              >
                <LogOut className="size-4 shrink-0" aria-hidden="true" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </aside>
    </>
  );
}
