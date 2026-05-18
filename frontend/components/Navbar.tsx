"use client";

import Link from 'next/link';
import { Suspense } from 'react';
import { ShoppingCart, User, Package, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems());
  const { isLoggedIn, isHydrated, hydrate, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinkClass = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-white bg-slate-800/80'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link href="/" className="shrink-0 group">
            <span className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-slate-200 transition-colors">
              KeyUnai
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Suspense
              fallback={
                <div className="w-40 sm:w-56 md:w-72 h-9 sm:h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 animate-pulse shrink-0" />
              }
            >
              <SearchBar />
            </Suspense>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingCart className="w-5 h-5" />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-slate-950">
                  {totalItems}
                </span>
              )}
            </Link>

            {isHydrated && (
              isLoggedIn ? (
                <>
                  <Link href="/orders" className={`hidden sm:flex items-center shrink-0 ${navLinkClass('/orders')}`}>
                    <Package className="w-4 h-4 mr-1.5" />
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center shrink-0 text-white bg-red-600/90 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary flex items-center shrink-0 px-3 sm:px-4 py-2 text-sm"
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
