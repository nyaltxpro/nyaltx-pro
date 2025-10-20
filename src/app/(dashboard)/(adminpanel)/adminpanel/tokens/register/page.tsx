'use client';

import dynamic from 'next/dynamic';

const AdminTokenRegister = dynamic(
    () => import('@/page-components/Admin/AdminTokenRegister').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-gray-400 font-medium">Loading token registration...</p>
            </div>
        )
    }
);

export default function AdminTokenRegisterPage() {
    return <AdminTokenRegister />;
}
