
"use client";

import { Inter, Poppins, Roboto } from "next/font/google";
import { useState } from 'react';

import Header from "@/components/HeaderUpdated"; // Assuming HeaderUpdated is the one to use
import Sidebar from "@/components/Sidebar";



// Removed duplicate web3modal import - already imported in providers

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ["latin"],
    variable: "--font-poppins",
});

const inter = Inter({ subsets: ['latin'] })

const roboto = Roboto({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    variable: '--font-roboto',
});



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
        <div className={`${inter.className} flex`}>        
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
            {/* Apply margin-left for desktop, none for mobile */}
            <div className="md:ml-16 transition-all duration-300 flex flex-col min-h-screen flex-1">
                <Header toggleMobileMenu={toggleMobileMenu} />
                <main className="flex-grow">
                    {children}
                </main>
                {/* <Footer /> */}
            </div>
        </div>

    );
}
