import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. โลโก้ฝั่งซ้าย */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
              KeyUnai
            </Link>
          </div>

          {/* 2. เมนูตรงกลาง (ซ่อนเมื่ออยู่บนมือถือ) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/games" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                Store (หน้าร้านค้า)
              </Link>
              {/* อนาคตสามารถเพิ่มเมนูอื่นๆ ตรงนี้ได้ เช่น หมวดหมู่เกม */}
            </div>
          </div>

          {/* 3. ปุ่มฝั่งขวา (ตะกร้า & ล็อกอิน) */}
          <div className="flex items-center space-x-4">
            {/* ปุ่มตะกร้าสินค้า */}
            <Link 
              href="/cart" 
              className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* จุดแดงแจ้งเตือนจำนวนของในตะกร้า (เดี๋ยวเรามาต่อสายกับ Zustand ทีหลัง) */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                0
              </span>
            </Link>

            {/* ปุ่มเข้าสู่ระบบ */}
            <Link 
              href="/login" 
              className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-lg shadow-blue-500/30"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}