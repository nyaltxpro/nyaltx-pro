'use client';

import DashboardErrorBoundary from '@/components/DashboardErrorBoundary';
import Header from '@/components/HeaderUpdated';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen w-full">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      <div className="flex min-h-screen flex-col transition-all duration-300 md:ml-16">
        <Header toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-grow">
          <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
        </main>
      </div>
    </div>
  );
}
