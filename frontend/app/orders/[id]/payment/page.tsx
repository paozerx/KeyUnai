"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Copy,
  Check,
  Upload,
  Loader2,
  QrCode,
  AlertCircle,
} from 'lucide-react';

interface PaymentSettings {
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_code_url: string | null;
}

interface OrderSummary {
  id: number;
  total_price: string;
  status: string;
  payment_slip_url: string | null;
  slip_uploaded_at: string | null;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const [settingsRes, orderRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/payment-settings/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (orderRes.status === 401) {
          router.push('/login');
          return;
        }
        if (!orderRes.ok) throw new Error('ไม่พบคำสั่งซื้อ');

        const settings = await settingsRes.json();
        const orderData = await orderRes.json();
        setPayment(settings);
        setOrder(orderData);

        if (orderData.status === 'AWAITING_APPROVAL' || orderData.status === 'COMPLETED') {
          // already submitted
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [orderId, router]);

  const copyAccount = async () => {
    if (!payment?.account_number) return;
    await navigator.clipboard.writeText(payment.account_number.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์สลิปก่อน');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('payment_slip', selectedFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/upload-slip/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'อัปโหลดไม่สำเร็จ');

      setOrder(data.order);
      router.push('/orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!order || !payment) {
    return (
      <div className="page-shell max-w-lg text-center">
        <p className="text-red-400">{error || 'ไม่พบข้อมูล'}</p>
        <Link href="/orders" className="btn-primary inline-flex mt-6 px-6 py-3">
          กลับประวัติการสั่งซื้อ
        </Link>
      </div>
    );
  }

  const alreadySubmitted = ['AWAITING_APPROVAL', 'COMPLETED'].includes(order.status);

  return (
    <div className="page-shell sm:px-6 lg:px-8 sm:py-12 max-w-2xl">
      <Link
        href="/orders"
        className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับประวัติการสั่งซื้อ
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold gradient-heading mb-2">
        ชำระเงิน
      </h1>
      <p className="text-slate-400 mb-8">
        คำสั่งซื้อ <span className="text-white font-mono">#{order.id}</span> · ยอดชำระ{' '}
        <span className="text-emerald-400 font-bold">
          ฿{parseFloat(order.total_price).toLocaleString()}
        </span>
      </p>

      {alreadySubmitted ? (
        <div className="glass-card p-8 text-center">
          <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-200 font-medium mb-2">
            {order.status === 'COMPLETED'
              ? 'ชำระเงินและได้รับคีย์แล้ว'
              : 'ส่งสลิปแล้ว รอแอดมินตรวจสอบ'}
          </p>
          <Link href="/orders" className="btn-primary inline-flex mt-4 px-6 py-3">
            ดูคำสั่งซื้อ
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* บัญชี + QR */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              โอนเงินเข้าบัญชี
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">ธนาคาร</span>
                <span className="text-white font-medium">{payment.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ชื่อบัญชี</span>
                <span className="text-white font-medium">{payment.account_name}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-500">เลขบัญชี</span>
                <button
                  type="button"
                  onClick={copyAccount}
                  className="flex items-center gap-2 text-white font-mono font-bold hover:text-blue-400 transition-colors"
                >
                  {payment.account_number}
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {payment.qr_code_url && (
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  สแกน QR Code เพื่อชำระเงิน
                </p>
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <img
                    src={payment.qr_code_url}
                    alt="QR Code ชำระเงิน"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* อัปโหลดสลิป */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              แนบสลิปการโอนเงิน
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-700">
                <img src={preview} alt="ตัวอย่างสลิป" className="w-full max-h-64 object-contain bg-slate-900" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 px-3 py-1 text-xs bg-slate-900/90 text-white rounded-md hover:bg-slate-800"
                >
                  เปลี่ยนรูป
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-blue-500/50 hover:text-slate-300 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                คลิกเพื่อเลือกรูปสลิป
              </button>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className={`w-full py-3 font-bold btn-primary ${
                isUploading || !selectedFile ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังอัปโหลด...
                </span>
              ) : (
                'ยืนยันการชำระเงิน'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
