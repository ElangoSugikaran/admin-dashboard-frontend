import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  admin: any | null;
  login: (adminData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  admin: null,
  login: (adminData) => set({ isAuthenticated: true, admin: adminData }),
  logout: () => set({ isAuthenticated: false, admin: null }),
}));
