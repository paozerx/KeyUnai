"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  // 💡 3. ดึงฟังก์ชันนับจำนวนจาก Store
  const totalItems = useCartStore((state) => state.totalItems());
  
  // 💡 4. แก้ปัญหา Hydration ของ Next.js ด้วยการเช็กว่าเว็บโหลดเสร็จหรือยัง
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
              KeyUnai
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                Store
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-slate-800 transition">
              <ShoppingCart className="w-5 h-5" />
              
              {/* 💡 5. นำตัวเลขมาโชว์ */}
              {isMounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link href="/login" className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-lg shadow-blue-500/30">
              <User className="w-4 h-4 mr-2" />
              Login
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}