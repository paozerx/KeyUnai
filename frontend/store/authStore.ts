import { create } from 'zustand';

interface AuthStore {
  isLoggedIn: boolean;
  isHydrated: boolean;
  hydrate: () => void;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  isHydrated: false,

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    set({ isLoggedIn: !!token, isHydrated: true });
  },

  login: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    set({ isLoggedIn: true, isHydrated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isLoggedIn: false });
  },
}));
