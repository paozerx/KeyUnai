"use client";

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  // แก้ปัญหา Hydration เพื่อรอให้ Client โหลดข้อมูลตะกร้าเสร็จก่อน
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // คำนวณราคารวมทั้งหมด
  const totalPrice = items.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  // ฟังก์ชันสั่งซื้อสินค้า
  const handleCheckout = async () => {
    // กรองเอาเฉพาะข้อมูลที่ Backend ต้องการ
    const orderItems = items.map(item => ({
      game_id: item.id,
      quantity: item.quantity
    }));

    // ดึงกุญแจ Login ออกมา
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อครับ!");
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);

    try {
      // ส่งข้อมูลไปหา Django
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: orderItems })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('accessToken');
          alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
          router.push('/login');
          return;
        }
        throw new Error(data.detail || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
      }

      clearCart();
      router.push(`/orders/${data.order_id}/payment`);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="page-shell sm:px-6 lg:px-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold gradient-heading mb-8">ตะกร้าสินค้าของคุณ</h1>

      {items.length === 0 ? (
        <div className="empty-state sm:p-16">
          <p className="text-slate-300 text-lg font-medium mb-2">ยังไม่มีเกมในตะกร้า</p>
          <p className="text-slate-500 mb-8">ลองไปหาเกมที่ถูกใจในหน้าร้านค้าดูสิ</p>
          <Link href="/" className="btn-primary inline-flex items-center py-3 px-6">
            กลับไปหน้าร้านค้า <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      ) : (
        // กรณีมีสินค้าในตะกร้า
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* รายการสินค้าฝั่งซ้าย */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-4 flex items-center justify-between hover:border-slate-600/60 transition-colors">
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
          <div className="glass-card p-6 h-fit sticky top-24 shadow-xl shadow-black/10">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">สรุปคำสั่งซื้อ</h2>
            
            <div className="flex justify-between text-gray-300 mb-4">
              <span>ยอดรวมสินค้า</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-white text-xl font-bold mb-8 pt-4 border-t border-slate-700">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-emerald-400">฿{totalPrice.toLocaleString()}</span>
            </div>

            {/* ปุ่มชำระเงินที่ผูกฟังก์ชันแล้ว */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`w-full py-3 px-4 font-bold ${
                isCheckingOut
                  ? 'bg-blue-800 cursor-not-allowed opacity-70 text-white rounded-lg'
                  : 'btn-primary w-full'
              }`}
            >
              {isCheckingOut ? 'กำลังดำเนินการ...' : 'ดำเนินการชำระเงิน'}
            </button>
            
            <button 
              onClick={clearCart}
              disabled={isCheckingOut}
              className="w-full mt-4 bg-transparent border border-slate-600 hover:border-red-500 text-gray-400 hover:text-red-500 font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ล้างตะกร้า
            </button>
          </div>

        </div>
      )}
    </div>
  );
}