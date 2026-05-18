"use client";

import Link from 'next/link';
// 💡 นำเข้าไอคอนเพิ่ม (Package สำหรับกล่องสินค้า, LogOut สำหรับออกจากระบบ)
import { ShoppingCart, User, Package, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 💡 นำเข้าเพื่อใช้เปลี่ยนหน้าตอน Logout

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems());
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 💡 State จำสถานะ Login

  useEffect(() => {
    setIsMounted(true);
    
    // 💡 เช็กว่ามี Token อยู่ในระบบไหม
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 💡 ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    // ลบกุญแจออกจากเบราว์เซอร์
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setIsLoggedIn(false);
    
    // เด้งกลับหน้าแรกและรีเฟรชระบบ
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* โลโก้ฝั่งซ้าย */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
              KeyUnai
            </Link>
          </div>

          {/* เมนูตรงกลาง */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                Store
              </Link>
            </div>
          </div>

          {/* เมนูฝั่งขวา */}
          <div className="flex items-center space-x-4">
            
            {/* ปุ่มตะกร้าสินค้า (โชว์เสมอ) */}
            <Link href="/cart" className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-slate-800 transition">
              <ShoppingCart className="w-5 h-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* 💡 เงื่อนไขการโชว์ปุ่ม Login / Logout */}
            {isMounted && (
              isLoggedIn ? (
                // ถ้า Login แล้ว
                <>
                  <Link 
                    href="/orders" 
                    className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-white bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                // ถ้ายังไม่ Login
                <Link 
                  href="/login" 
                  className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-lg shadow-blue-500/30"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Link>
              )
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}