import { create } from "zustand";
import axios from "axios";

const useWishlistStore = create((set, get) => ({
  items: [],
  inWishlist: {},

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
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  },

  removeFromWishlist: async (productId, token) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/wishlist/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        inWishlist: { ...state.inWishlist, [productId]: false },
      }));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  },

  fetchWishlist: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const inWishlistMap = {};
      response.data.items.forEach((item) => {
        inWishlistMap[item.id] = true;
      });

      set({ items: response.data.items, inWishlist: inWishlistMap });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  },

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
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  },
}));

export default useWishlistStore;
