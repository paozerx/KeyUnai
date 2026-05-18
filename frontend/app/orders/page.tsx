"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Key, Clock, CheckCircle, ArrowRight } from 'lucide-react';

// กำหนดรูปร่างของข้อมูล (TypeScript Interfaces)
interface OrderItem {
  id: number;
  game_title: string;
  game_cover: string;
  price: string;
  key_code: string | null;
}

interface Order {
  id: number;
  total_price: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลบิล
    const fetchOrders = async () => {
      const token = localStorage.getItem('accessToken');
      
      // ถ้าไม่มี Token ให้เด้งไปหน้า Login
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
          throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="min-h-[60vh] flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <div className="page-shell sm:px-6 lg:px-8 sm:py-12 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Package className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold gradient-heading">ประวัติการสั่งซื้อของฉัน</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state sm:p-16">
          <p className="text-slate-300 text-lg font-medium mb-2">ยังไม่มีคำสั่งซื้อ</p>
          <p className="text-slate-500 mb-8">เริ่มเลือกซื้อเกมแรกของคุณได้เลย</p>
          <Link href="/" className="btn-primary inline-flex items-center py-3 px-6">
            ไปเลือกซื้อเกมกันเลย <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-card overflow-hidden shadow-lg shadow-black/10">
              
              {/* ส่วนหัวของบิล (Order Header) */}
              <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-400">คำสั่งซื้อ <span className="font-mono text-white">#{order.id}</span></p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('th-TH')}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">ยอดรวม</p>
                    <p className="font-bold text-emerald-400">฿{parseFloat(order.total_price).toLocaleString()}</p>
                  </div>
                  {/* ป้ายสถานะ */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                    order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 
                    order.status === 'CANCELED' ? 'bg-red-500/20 text-red-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {order.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {order.status}
                  </div>
                </div>
              </div>

              {/* รายการเกมในบิล (Order Items) */}
              <div className="p-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                        {item.game_cover ? (
                          <img src={item.game_cover} alt={item.game_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Img</div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{item.game_title}</h4>
                        <p className="text-sm text-gray-400">฿{parseFloat(item.price).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* กล่องแสดง Key เกม */}
                    <div className="w-full sm:w-auto">
                      {item.key_code ? (
                        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded text-emerald-400 font-mono text-sm break-all">
                          <Key className="w-4 h-4 flex-shrink-0" />
                          <span>{item.key_code}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-amber-400/80 bg-amber-500/10 px-3 py-2 rounded flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          รอตรวจสอบการชำระเงิน...
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}