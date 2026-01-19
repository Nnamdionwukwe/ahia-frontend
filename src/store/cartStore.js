// src/store/cartStore.js
import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  loading: false,
  error: null,

  // Add item to cart (with API)
  // addItem: async (productVariantId, quantity, token) => {
  //   try {
  //     const response = await axios.post(
  //       `${API_URL}/api/cart/add`,
  //       { product_variant_id: productVariantId, quantity },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.data.success) {
  //       // Refresh cart after adding
  //       await get().fetchCart(token);
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     console.error("Add to cart error:", error);
  //     set({ error: error.response?.data?.error || "Failed to add to cart" });
  //     return false;
  //   }
  // },

  addItem: async (productVariantId, quantity, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/cart/add`,
        { product_variant_id: productVariantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh cart after adding
        await get().fetchCart(token); // Ensure this updates the cart items
        return true;
      }
      return false;
    } catch (error) {
      console.error("Add to cart error:", error);
      set({ error: error.response?.data?.error || "Failed to add to cart" });
      return false;
    }
  },

  // Remove item from cart (with API)
  removeItem: async (itemId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Update local state
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== itemId);
          const newSubtotal = newItems.reduce((sum, i) => {
            const price =
              i.base_price -
              (i.base_price * (i.discount_percentage || 0)) / 100;
            return sum + price * i.quantity;
          }, 0);
          const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return {
            items: newItems,
            subtotal: newSubtotal,
            total: newSubtotal,
            itemCount: newItemCount,
          };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Remove from cart error:", error);
      set({ error: error.response?.data?.error || "Failed to remove item" });
      return false;
    }
  },

  // Update item quantity (with API)
  updateQuantity: async (itemId, quantity, token) => {
    if (quantity <= 0) {
      return await get().removeItem(itemId, token);
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          );
          const newSubtotal = newItems.reduce((sum, i) => {
            const price =
              i.base_price -
              (i.base_price * (i.discount_percentage || 0)) / 100;
            return sum + price * i.quantity;
          }, 0);
          const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return {
            items: newItems,
            subtotal: newSubtotal,
            total: newSubtotal,
            itemCount: newItemCount,
          };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update quantity error:", error);
      set({
        error: error.response?.data?.error || "Failed to update quantity",
      });
      return false;
    }
  },

  // Fetch cart from API
  fetchCart: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        items: response.data.items || [],
        subtotal: parseFloat(response.data.subtotal || 0),
        tax: parseFloat(response.data.tax || 0),
        shipping: parseFloat(response.data.shipping || 0),
        total: parseFloat(response.data.total || 0),
        itemCount: response.data.itemCount || 0,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      console.error("Fetch cart error:", error);
      set({
        loading: false,
        error: error.response?.data?.error || "Failed to fetch cart",
        items: [],
        total: 0,
        itemCount: 0,
      });
      return null;
    }
  },

  // Clear cart
  clearCart: () => {
    set({
      items: [],
      total: 0,
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useCartStore;
