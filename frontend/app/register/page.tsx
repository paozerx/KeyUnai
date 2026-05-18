"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  // State สำหรับฟอร์ม
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State สำหรับสถานะการทำงาน
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // 1. ตรวจสอบว่ารหัสผ่าน 2 ช่องตรงกันไหม
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    // 2. ตรวจสอบความยาวรหัสผ่าน (ตรงกับที่เราตั้งใน Django)
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      setIsLoading(false);
      return;
    }

    try {
      // 3. ยิงข้อมูลไปหา Django API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // กรณี Username ซ้ำ หรือข้อมูลไม่ถูกต้อง
        // Django มักจะส่ง error กลับมาเป็น Object เราจึงต้องดึงข้อความแรกออกมา
        const errorMessage = typeof data === 'object' ? Object.values(data)[0] : 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        throw new Error(errorMessage as string);
      }

      // 4. ถ้าสำเร็จ แสดงข้อความและเด้งไปหน้า Login
      setSuccess('สมัครสมาชิกสำเร็จ! กำลังพาดุณไปยังหน้าเข้าสู่ระบบ...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000); // หน่วงเวลา 2 วินาทีให้ผู้ใช้อ่านข้อความสำเร็จก่อน

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">สมัครสมาชิกเพื่อเข้าร่วม KeyUnai</p>
        </div>

        {/* กล่องแจ้งเตือน Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* กล่องแจ้งเตือน Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-lg p-4 mb-6 flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* ช่อง Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="ตั้งชื่อผู้ใช้ของคุณ"
              />
            </div>
          </div>

          {/* ช่อง Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* ช่อง Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="รหัสผ่านอย่างน้อย 8 ตัว"
              />
            </div>
          </div>

          {/* ช่อง Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              (isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          มีบัญชีอยู่แล้วใช่ไหม?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 font-bold transition">
            เข้าสู่ระบบ
          </Link>
        </div>
        
      </div>
    </div>
  );
}