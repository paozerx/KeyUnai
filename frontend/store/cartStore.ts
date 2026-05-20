import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Game {
  id: number;
  title: string;
  price: string;
  cover_image_url: string;
  platform: string;
  description?: string | null;
  detail_info?: string;
  key_usage_guide?: string;
}

export interface CartItem extends Game {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (game: Game) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (game) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === game.id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          });
        } else {
          set({ items: [...items, { ...game, quantity: 1 }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter(item => item.id !== id) }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'keyunai-cart' }
  )
);
