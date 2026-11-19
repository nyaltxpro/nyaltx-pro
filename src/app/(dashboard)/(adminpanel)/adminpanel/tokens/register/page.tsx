'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Coins, X } from 'lucide-react';
import { Drawer } from '@/components/reui/drawer';

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
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const closeDrawer = () => {
        setOpen(false);
        router.push('/adminpanel/tokens');
    };

    return (
        <Drawer
            open={open}
            onClose={closeDrawer}
            title="Register Token"
            maxWidth="max-w-3xl"
        >
            <div className="admin-panel-form flex h-full min-h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0d0d0d]">
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-6 py-5 backdrop-blur">
                    <h1 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Coins className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                        Register Token
                    </h1>
                    <button
                        type="button"
                        onClick={closeDrawer}
                        aria-label="Close token registration"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>
                <div className="no-scrollbar flex-1 overflow-y-auto p-6">
                    <AdminTokenRegister
                        isDrawer
                        onClose={closeDrawer}
                        onSubmitted={() => router.push('/adminpanel/tokens')}
                    />
                </div>
            </div>
        </Drawer>
    );
}
