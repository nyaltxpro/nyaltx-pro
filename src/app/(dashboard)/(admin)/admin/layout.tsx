"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
    <div className="min-h-screen bg-[#0b0f14] text-white">
      {/* Admin Sidebar */}
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {/* Main Content Area */}
      <div className="md:ml-16 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-[#0b0f14]/95 backdrop-blur border-b border-gray-800">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">NYAX Admin</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
