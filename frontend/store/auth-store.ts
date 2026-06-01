import { create } from "zustand";

type AuthState = {
  token: string | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isHydrated: false,
  setToken: (token) => set({ token }),
  setHydrated: (value) => set({ isHydrated: value }),
  logout: () => set({ token: null }),
}));

