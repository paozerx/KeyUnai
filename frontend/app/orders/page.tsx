"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Key,
  Clock,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CreditCard,
  XCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

interface OrderItem {
  id: number;
  game_title: string;
  game_cover: string;
  price: string;
  key_code: string | null;
  has_key: boolean;
  key_revealed: boolean;
  can_reveal: boolean;
}

interface Order {
  id: number;
  total_price: string;
  status: string;
  created_at: string;
  admin_note?: string;
  items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: 'รอชำระเงิน', className: 'bg-amber-500/20 text-amber-400', icon: Clock },
  AWAITING_APPROVAL: { label: 'รอตรวจสอบสลิป', className: 'bg-blue-500/20 text-blue-400', icon: Clock },
  COMPLETED: { label: 'ชำระเงินแล้ว', className: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  REJECTED: { label: 'ปฏิเสธ', className: 'bg-red-500/20 text-red-400', icon: XCircle },
  CANCELED: { label: 'ยกเลิก', className: 'bg-slate-500/20 text-slate-400', icon: XCircle },
};

function OrderItemKey({ orderId, orderStatus, item, onRevealed }: {
  orderId: number;
  orderStatus: string;
  item: OrderItem;
  onRevealed: (itemId: number, keyCode: string) => void;
}) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localKey, setLocalKey] = useState(item.key_code);

  const revealKey = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsRevealing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/items/${item.id}/reveal-key/`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'เปิดคีย์ไม่สำเร็จ');
      setLocalKey(data.key_code);
      onRevealed(item.id, data.key_code);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เปิดคีย์ไม่สำเร็จ');
    } finally {
      setIsRevealing(false);
    }
  };

  const copyKey = async () => {
    if (!localKey) return;
    await navigator.clipboard.writeText(localKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (item.can_reveal || (item.has_key && !localKey && !item.key_revealed)) {
    return (
      <button
        type="button"
        onClick={revealKey}
        disabled={isRevealing}
        className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-600/30 transition text-sm font-medium"
      >
        {isRevealing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        กดเพื่อเปิดคีย์เกม
      </button>
    );
  }

  if (localKey) {
    return (
      <div className="w-full sm:w-auto space-y-2">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-400 font-mono text-sm break-all">
          <Key className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{localKey}</span>
          <button type="button" onClick={copyKey} className="shrink-0 p-1 hover:text-white transition">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  if (item.has_key && !item.key_revealed) {
    return (
      <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg text-sm">
        <EyeOff className="w-4 h-4" />
        คีย์พร้อมแล้ว — กดเปิดเพื่อดู
      </div>
    );
  }

  if (orderStatus === 'AWAITING_APPROVAL') {
    return (
      <div className="text-sm text-blue-400/90 bg-blue-500/10 px-3 py-2 rounded-lg flex items-center">
        <Clock className="w-4 h-4 mr-2 shrink-0" />
        รอแอดมินตรวจสอบสลิป
      </div>
    );
  }

  if (orderStatus === 'PENDING') {
    return (
      <Link
        href={`/orders/${orderId}/payment`}
        className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition text-sm font-medium"
      >
        <CreditCard className="w-4 h-4" />
        ชำระเงิน / แนบสลิป
      </Link>
    );
  }

  return (
    <div className="text-sm text-amber-400/80 bg-amber-500/10 px-3 py-2 rounded-lg flex items-center">
      <Clock className="w-4 h-4 mr-2 shrink-0" />
      รอแอดมินตรวจสอบและส่งคีย์...
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      }

      setOrders(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleKeyRevealed = (orderId: number, itemId: number, keyCode: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId
                  ? { ...item, key_code: keyCode, key_revealed: true, can_reveal: false }
                  : item
              ),
            }
          : order
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="min-h-[60vh] flex justify-center items-center text-red-400">{error}</div>;
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
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const StatusIcon = statusInfo.icon;

            return (
              <div key={order.id} className="glass-card overflow-hidden shadow-lg shadow-black/10">
                <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-slate-400">
                      คำสั่งซื้อ <span className="font-mono text-white">#{order.id}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">ยอดรวม</p>
                      <p className="font-bold text-emerald-400">
                        ฿{parseFloat(order.total_price).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${statusInfo.className}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </div>
                    {order.status === 'PENDING' && (
                      <Link
                        href={`/orders/${order.id}/payment`}
                        className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        ชำระเงิน
                      </Link>
                    )}
                  </div>
                </div>

                {order.admin_note && order.status === 'REJECTED' && (
                  <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-sm text-red-400">
                    หมายเหตุ: {order.admin_note}
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                          {item.game_cover ? (
                            <img src={item.game_cover} alt={item.game_title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{item.game_title}</h4>
                          <p className="text-sm text-slate-400">฿{parseFloat(item.price).toLocaleString()}</p>
                        </div>
                      </div>

                      <OrderItemKey
                        orderId={order.id}
                        orderStatus={order.status}
                        item={item}
                        onRevealed={(itemId, keyCode) => handleKeyRevealed(order.id, itemId, keyCode)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
