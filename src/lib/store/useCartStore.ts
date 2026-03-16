import { create } from 'zustand';

export interface CartItem {
    cartItemId: string; // Unique ID for the cart instance
    serviceId: string;
    name: string;
    price: number;
    duration: number; // hours
    image: string;
    selectedDate: string; // YYYY-MM-DD
    selectedTime: string; // HH:mm AM/PM or HH:mm
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (cartItemId: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalDuration: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (cartItemId) => set((state) => ({ items: state.items.filter((item) => item.cartItemId !== cartItemId) })),
    clearCart: () => set({ items: [] }),
    getTotalPrice: () => get().items.reduce((total, item) => total + item.price, 0),
    getTotalDuration: () => get().items.reduce((total, item) => total + item.duration, 0),
}));
