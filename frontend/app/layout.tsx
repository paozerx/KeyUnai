import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import Navbar from "@/components/Navbar";

// ตั้งค่าฟอนต์
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeyUnai | Game Keys",
  description: "แพลตฟอร์มซื้อขายคีย์เกม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen flex flex-col`}>
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}