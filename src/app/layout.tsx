import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Meme Board | Crypto Token Tracker",
  description: "Track meme tokens, view real-time charts, history and all token information from blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <Sidebar />
        <div className="ml-16 transition-all duration-300 flex flex-col min-h-screen">
       
          <main className="flex-grow">
            {children}
          </main>
          <Footer />  
        </div>
      </body>
    </html>
  );
}
