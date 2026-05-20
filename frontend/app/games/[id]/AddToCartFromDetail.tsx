"use client";

import { useCartStore, Game } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

type GameForCart = Game & {
  description?: string | null;
  platform?: string;
};

export default function AddToCartFromDetail({ game }: { game: GameForCart }) {
  const addItem = useCartStore((state) => state.addItem);

  const payload: Game = {
    id: game.id,
    title: game.title,
    price: game.price,
    cover_image_url: game.cover_image_url || '',
    platform: game.platform,
  };

  return (
    <button
      type="button"
      onClick={() => addItem(payload)}
      className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      เพิ่มลงตะกร้า
    </button>
  );
}
