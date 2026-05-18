"use client"; // 💡 สำคัญมาก

import { useCartStore, Game } from '@/store/cartStore';

export default function GameCard({ game }: { game: Game }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-blue-500 hover:-translate-y-1 transition duration-300 flex flex-col">
      <div className="aspect-[3/4] w-full bg-slate-900 relative">
        {game.cover_image_url ? (
          <img src={game.cover_image_url} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-slate-600">No Image</div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{game.title}</h3>
        <p className="text-xl font-extrabold text-emerald-400 mt-auto mb-4">
          ฿{parseFloat(game.price).toLocaleString()}
        </p>
        
        {/* 💡 ผูกฟังก์ชัน onClick กับปุ่ม */}
        <button 
          onClick={() => addItem(game)}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}