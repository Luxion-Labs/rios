import { create } from "zustand";

interface CarStore {
  thirdMode: boolean;
  pressedKey: string | null;

  setThirdMode: (thirdMode: boolean) => void;
  setKey: (key: string | null) => void;
}

export const useCarStore = create<CarStore>((set) => ({
  thirdMode: false,
  pressedKey: null,
  setThirdMode: (thirdMode) => set(() => ({ thirdMode })),
  setKey: (key) => set(() => ({ pressedKey: key })),
}));
