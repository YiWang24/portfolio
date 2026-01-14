import { create } from 'zustand';

interface UIState {
  isMatrixActive: boolean;
  setMatrixActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMatrixActive: false,
  setMatrixActive: (active) => set({ isMatrixActive: active }),
}));
