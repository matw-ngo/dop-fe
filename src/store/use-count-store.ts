import { create } from "zustand";

interface CountState {
  count: number;
  increase: (by: number) => void;
  decrease: (by: number) => void;
}

export const useCountStore = create<CountState>()((set) => ({
  count: 0,
  increase: (by) => set((state) => ({ count: state.count + by })),
  decrease: (by) => set((state) => ({ count: state.count - by })),
}));
