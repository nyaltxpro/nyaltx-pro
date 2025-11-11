
"use client";

import { useState } from 'react';

import Header from "@/components/HeaderUpdated";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="transition-all duration-300 flex min-h-screen bg-transparent">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
            {/* Apply margin-left for desktop, none for mobile */}
            <div className="flex flex-1 flex-col md:ml-16">
                <Header toggleMobileMenu={toggleMobileMenu} />
                <main className="grow">
                    {children}
                </main>
                {/* <Footer /> */}
            </div>
        </div>
    );
}
