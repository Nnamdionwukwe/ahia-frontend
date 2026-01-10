import { create } from "zustand";
import axios from "axios";

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
      }

      const newTotal = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      const newTotal = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      const newTotal = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  clearCart: () => {
    set({ items: [], total: 0, itemCount: 0 });
  },

  fetchCart: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({
        items: response.data.items,
        total: parseFloat(response.data.total),
        itemCount: response.data.itemCount,
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  },
}));

export default useCartStore;
