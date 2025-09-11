"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWalletButton from "./ConnectWalletButton";

export default function PublicHeader() {
  const pathname = usePathname();

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={
          active
            ? "px-3 py-2 text-sm text-cyan-300"
            : "px-3 py-2 text-sm text-gray-300 hover:text-white"
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="  z-40 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-cyan-500 text-black text-sm font-bold">N</span> */}
            <span className="text-base md:text-lg font-semibold tracking-tight">NYALTX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {/* <NavLink href="/" label="Home" /> */}
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/pricing" label="Pricing" />
            <NavLink href="/pro-signup" label="Pro" />
          </nav>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {/* <Link href="/admin/login" className="rounded-md border border-gray-700/80 px-3 py-1.5 text-sm hover:bg-gray-800/60 transition-colors">
            Admin Login
          </Link> */}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
