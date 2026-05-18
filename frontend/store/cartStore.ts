import { create } from 'zustand';

// โครงสร้างข้อมูลเกมที่จะเข้ามาในตะกร้า
export interface Game {
  id: number;
  title: string;
  price: string;
  cover_image_url: string;
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

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  // ฟังก์ชันเพิ่มลงตะกร้า
  addItem: (game) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === game.id);
    
    // ถ้ามีเกมนี้ในตะกร้าแล้ว ให้เพิ่มจำนวน (quantity)
    if (existingItem) {
      set({ 
        items: items.map(item => 
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
        ) 
      });
    } else {
      // ถ้ายังไม่มี ให้แอดเข้าไปใหม่
      set({ items: [...items, { ...game, quantity: 1 }] });
    }
  },

  // ฟังก์ชันลบออกจากตะกร้า
  removeItem: (id) => set({ items: get().items.filter(item => item.id !== id) }),
  
  // ล้างตะกร้า (ใช้ตอนจ่ายเงินเสร็จ)
  clearCart: () => set({ items: [] }),
  
  // นับจำนวนชิ้นทั้งหมดในตะกร้า
  totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
}));