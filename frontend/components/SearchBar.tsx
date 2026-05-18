"use client";

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState('');

  // ดึงค่าจาก URL มาใส่ในช่องค้นหา (เผื่อผู้ใช้กด Refresh หน้าจอ)
  useEffect(() => {
    setTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันเว็บโหลดใหม่
    if (term.trim()) {
      // ถ้ามีการพิมพ์คำค้นหา ให้เติม ?search=... ต่อท้าย URL
      router.push(`/?search=${encodeURIComponent(term)}`);
    } else {
      // ถ้าปล่อยว่างแล้วกดหา ให้ล้าง URL กลับไปหน้าแรกปกติ
      router.push(`/`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative group">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="ค้นหาชื่อเกม เช่น Elden Ring, Resident Evil..."
        className="w-full pl-6 pr-14 py-4 bg-slate-800/80 border border-slate-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 focus:border-transparent shadow-lg transition-all duration-300"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors duration-300 shadow-md group-focus-within:bg-blue-500"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}