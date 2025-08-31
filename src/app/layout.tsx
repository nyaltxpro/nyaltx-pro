
import type { Metadata } from "next";
import { Poppins, Inter, Roboto } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Providers from "./providers";
import "./globals.css";

import "../lib/web3modal";

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

export const metadata: Metadata = {
  title: "NYLTAX | Crypto Token Tracker",
  description: "Track meme tokens, view real-time charts, history and all token information from blockchain.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  
  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <body
        className={inter.className}
      >
        <Providers>
          <Sidebar />
          <div className="ml-16 transition-all duration-300 flex flex-col min-h-screen">
        
            <main className="flex-grow">
              {children}
            </main>
            <Footer />  
          </div>
        </Providers>
      </body>
    </html>
  );
}
