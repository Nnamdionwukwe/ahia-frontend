// src/store/wishlistStore.js
import { create } from "zustand";
import axios from "axios";

const useWishlistStore = create((set, get) => ({
  items: [],
  inWishlist: {},

  // Add to wishlist
  addToWishlist: async (productId, token) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wishlist/add/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        inWishlist: { ...state.inWishlist, [productId]: true },
      }));
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId, token) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/wishlist/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        inWishlist: { ...state.inWishlist, [productId]: false },
        items: state.items.filter((item) => item.id !== productId),
      }));
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  },

  // Fetch wishlist
  fetchWishlist: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const inWishlistMap = {};
      const items = response.data.items || [];

      items.forEach((item) => {
        inWishlistMap[item.id] = true;
      });

      set({ items, inWishlist: inWishlistMap });
      return items;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      set({ items: [], inWishlist: {} });
      return [];
    }
  },

  // Check if product is in wishlist
  checkWishlist: async (productId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist/check/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        inWishlist: {
          ...state.inWishlist,
          [productId]: response.data.inWishlist,
        },
      }));
      return response.data.inWishlist;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  },

  // Clear wishlist (for logout)
  clearWishlist: () => {
    set({ items: [], inWishlist: {} });
  },
}));

export default useWishlistStore;
