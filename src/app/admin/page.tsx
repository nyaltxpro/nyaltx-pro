'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard admin for now
    // In production, this would be the Tina admin interface
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Tina CMS Admin</h1>
        <p className="text-gray-400 mb-4">Redirecting to admin dashboard...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
      </div>
    </div>
  );
}
