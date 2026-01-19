import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const useWishlistStore = create((set, get) => ({
  items: [],
  inWishlist: {},
  loading: false,
  error: null,

  fetchWishlist: async (token) => {
    if (!token) {
      console.warn(
        "No authentication token provided. Skipping wishlist fetch."
      );
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wishlistItems = response.data.items || [];
      const inWishlistMap = {};
      wishlistItems.forEach((item) => {
        const productId = item.product_id || item.id;
        inWishlistMap[productId] = true;
      });

      set({ items: wishlistItems, inWishlist: inWishlistMap, loading: false });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      set({ error: error.message, loading: false });
    }
  },

  checkWishlist: async (productId, token) => {
    if (!token) {
      console.error("No authentication token provided");
      return false;
    }
    try {
      const response = await axios.get(
        `${API_URL}/api/wishlist/check/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.inWishlist;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  },

  addToWishlist: async (productId, token) => {
    if (!token) {
      console.error("No authentication token provided");
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/wishlist/add/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        set((state) => ({
          inWishlist: { ...state.inWishlist, [productId]: true },
        }));
        await get().fetchWishlist(token); // Refresh wishlist
      } else {
        throw new Error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      set({ error: error.message });
    }
  },

  removeFromWishlist: async (productId, token) => {
    if (!token) {
      console.error("No authentication token provided");
      return false;
    }
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        inWishlist: { ...state.inWishlist, [productId]: false },
      }));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      set({ error: error.message });
    }
  },

  clearWishlist: () =>
    set({
      items: [],
      inWishlist: {},
      loading: false,
      error: null,
    }),
}));

export default useWishlistStore;
