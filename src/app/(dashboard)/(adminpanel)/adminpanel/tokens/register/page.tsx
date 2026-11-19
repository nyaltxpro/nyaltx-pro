'use client';

import dynamic from 'next/dynamic';
import { Coins } from 'lucide-react';

const AdminTokenRegister = dynamic(
    () => import('@/page-components/Admin/AdminTokenRegister').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-12">
                <Coins className="mx-auto mb-4 h-10 w-10 animate-pulse text-gray-400" aria-hidden="true" />
                <p className="text-gray-400 font-medium">Loading token registration...</p>
            </div>
        )
    }
);

export default function AdminTokenRegisterPage() {
    return <AdminTokenRegister />;
}
