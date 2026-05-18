"use client";

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // แก้ปัญหา Hydration เพื่อรอให้ Client โหลดข้อมูลตะกร้าเสร็จก่อน
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // หรือใส่ loading spinner ตรงนี้ก็ได้

  // คำนวณราคารวมทั้งหมด
  const totalPrice = items.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">ตะกร้าสินค้าของคุณ</h1>

      {items.length === 0 ? (
        // กรณีตะกร้าว่างเปล่า
        <div className="bg-slate-800 rounded-xl p-10 text-center border border-slate-700">
          <p className="text-gray-400 text-lg mb-6">ยังไม่มีเกมในตะกร้าเลย ลองไปหาเกมที่ถูกใจดูสิ!</p>
          <Link 
            href="/" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            กลับไปหน้าร้านค้า <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      ) : (
        // กรณีมีสินค้าในตะกร้า
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* รายการสินค้าฝั่งซ้าย */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* รูปปกเกมไซส์มินิ */}
                  <div className="w-16 h-24 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                  </div>
                  
                  {/* ชื่อเกมและจำนวน */}
                  <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{item.title}</h3>
                    <p className="text-gray-400">จำนวน: {item.quantity}</p>
                    <p className="text-emerald-400 font-bold mt-1">
                      ฿{(parseFloat(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ปุ่มลบสินค้า */}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-slate-700 rounded-full transition"
                  title="ลบออกจากตะกร้า"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* สรุปยอดสั่งซื้อฝั่งขวา */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">สรุปคำสั่งซื้อ</h2>
            
            <div className="flex justify-between text-gray-300 mb-4">
              <span>ยอดรวมสินค้า</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-white text-xl font-bold mb-8 pt-4 border-t border-slate-700">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-emerald-400">฿{totalPrice.toLocaleString()}</span>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg shadow-blue-500/20">
              ดำเนินการชำระเงิน
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full mt-4 bg-transparent border border-slate-600 hover:border-red-500 text-gray-400 hover:text-red-500 font-medium py-2 px-4 rounded-lg transition"
            >
              ล้างตะกร้า
            </button>
          </div>

        </div>
      )}
    </div>
  );
}