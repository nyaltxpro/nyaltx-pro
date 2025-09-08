"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-screen w-full">
        <main className="min-h-screen w-full flex items-center justify-center">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-40 bg-[#0b0f14]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f14]/80 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-cyan-500 text-black text-sm font-bold">N</span>
              <h1 className="text-base md:text-lg font-semibold tracking-tight">NYAX Admin</h1>
              <span className="ml-1 rounded-full border border-gray-700 px-2 py-0.5 text-[10px] uppercase text-gray-400">Dashboard</span>
            </div>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <TopLink href="/admin">Dashboard</TopLink>
              <TopLink href="/admin/orders">Orders</TopLink>
              <TopLink href="/admin/profiles">Profiles</TopLink>
              <TopLink href="/admin/stats">Stats</TopLink>
            </nav>
          </div>
          <form action="/api/admin/logout" method="post" className="shrink-0">
            <button className="rounded-md border border-gray-700/80 px-3 py-1.5 text-sm hover:bg-gray-800/60 transition-colors" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <nav className="rounded-lg border border-gray-800 bg-black/40 p-3 text-sm">
            <SidebarLinks />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLinks() {
  const pathname = usePathname();
  const baseClass = "block rounded px-2 py-1 hover:bg-gray-800";

  const Item = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <li>
      <Link
        href={href}
        className={pathname === href || (href !== '/admin' && pathname?.startsWith(href)) ? `${baseClass} bg-gray-800 text-cyan-300` : baseClass}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <div>
            <div className="px-2 pb-2 text-gray-400 uppercase tracking-wide text-[11px]">Overview</div>
            <ul className="space-y-1">
              <Item href="/admin">Dashboard</Item>
              <Item href="/admin/orders">Orders</Item>
              <Item href="/admin/profiles">Profiles</Item>
              <Item href="/admin/stats">Stats</Item>
            </ul>
            <div className="mt-4 px-2 pb-2 text-gray-400 uppercase tracking-wide text-[11px]">Operations</div>
            <ul className="space-y-1">
              <Item href="/admin#ops">Admin Operations</Item>
              <Item href="/admin/campaigns">Campaigns</Item>
            </ul>
    </div>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
  return (
    <Link href={href} className={active ? "text-cyan-300" : "text-gray-300 hover:text-white"}>
      {children}
    </Link>
  );
}
