"use client";

import Link from 'next/link';
import { useCartStore, Game } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

export default function GameCard({ game }: { game: Game }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(game);
  };

  return (
    <article className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-blue-500/60 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link href={`/games/${game.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-xl">
        <div className="aspect-[3/4] w-full bg-slate-900 relative overflow-hidden">
          {game.cover_image_url ? (
            <>
              <img
                src={game.cover_image_url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-600 text-sm">
              No Image
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold text-slate-300 border border-slate-700/60 group-hover:border-blue-500/40 group-hover:text-white transition-colors">
            {game.platform}
          </div>
        </div>

        <div className="p-3 sm:p-4 pb-2">
          <h4 className="text-sm sm:text-base font-bold text-slate-200 mb-1 line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-blue-400 transition-colors">
            {game.title}
          </h4>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums">
            ฿{parseFloat(game.price).toLocaleString()}
          </p>
        </div>
      </Link>

      <div className="p-3 sm:p-4 pt-0 mt-auto flex justify-end">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-primary p-2.5 sm:p-3 rounded-lg shrink-0"
          title="เพิ่มลงตะกร้า"
          aria-label={`เพิ่ม ${game.title} ลงตะกร้า`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </article>
  );
}
