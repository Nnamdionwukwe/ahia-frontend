// stores/cartStore.js
import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  selectedCount: 0,
  totalCount: 0,

  // Fetch cart items
  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");

      if (!token) {
        set({ items: [], loading: false });
        return;
      }

      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = response.data.items || [];
      const selectedCount = items.filter((item) => item.is_selected).length;

      set({
        items,
        loading: false,
        selectedCount,
        totalCount: items.length,
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch cart",
        loading: false,
      });
    }
  },

  // Add item to cart
  addToCart: async (productId, variantId = null, quantity = 1) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Please login to add items to cart");
      }

      const payload = variantId
        ? { product_id: productId, product_variant_id: variantId, quantity }
        : { product_id: productId, quantity };

      await axios.post(`${API_URL}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh cart
      await get().fetchCart();

      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Update item quantity
  updateQuantity: async (itemId, quantity) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `${API_URL}/api/cart/${itemId}/quantity`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state optimistically
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      }));

      // Refresh to get updated prices
      await get().fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert on error
      await get().fetchCart();
    }
  },

  // Toggle item selection
  toggleSelection: async (itemId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const item = get().items.find((i) => i.id === itemId);

      if (!item) return;

      const newIsSelected = !item.is_selected;

      await axios.put(
        `${API_URL}/api/cart/${itemId}/select`,
        { is_selected: newIsSelected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      set((state) => {
        const updatedItems = state.items.map((i) =>
          i.id === itemId ? { ...i, is_selected: newIsSelected } : i
        );
        const selectedCount = updatedItems.filter((i) => i.is_selected).length;

        return {
          items: updatedItems,
          selectedCount,
        };
      });
    } catch (error) {
      console.error("Error toggling selection:", error);
      await get().fetchCart();
    }
  },

  // Toggle select all
  toggleSelectAll: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const allSelected = get().items.every((item) => item.is_selected);
      const newIsSelected = !allSelected;

      await axios.put(
        `${API_URL}/api/cart/select-all`,
        { is_selected: newIsSelected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      set((state) => ({
        items: state.items.map((item) => ({
          ...item,
          is_selected: newIsSelected,
        })),
        selectedCount: newIsSelected ? state.items.length : 0,
      }));
    } catch (error) {
      console.error("Error toggling select all:", error);
      await get().fetchCart();
    }
  },

  // Remove item
  removeItem: async (itemId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${API_URL}/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      set((state) => {
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        const selectedCount = updatedItems.filter(
          (item) => item.is_selected
        ).length;

        return {
          items: updatedItems,
          selectedCount,
          totalCount: updatedItems.length,
        };
      });
    } catch (error) {
      console.error("Error removing item:", error);
      await get().fetchCart();
    }
  },

  // Remove selected items
  removeSelected: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${API_URL}/api/cart/selected`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchCart();
    } catch (error) {
      console.error("Error removing selected items:", error);
      await get().fetchCart();
    }
  },

  // Calculate totals for selected items
  getSelectedTotals: () => {
    const { items } = get();
    const selectedItems = items.filter((item) => item.is_selected);

    const subtotal = selectedItems.reduce((sum, item) => {
      const itemOriginalPrice = parseFloat(item.item_original_price || 0);
      return sum + itemOriginalPrice * item.quantity;
    }, 0);

    const total = selectedItems.reduce((sum, item) => {
      const finalPrice = parseFloat(item.final_price || 0);
      return sum + finalPrice * item.quantity;
    }, 0);

    const discount = subtotal - total;
    const discountPercentage =
      subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;

    return {
      subtotal,
      total,
      discount,
      discountPercentage,
      itemCount: selectedItems.length,
      totalQuantity: selectedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    };
  },

  // Get almost sold out items count
  getAlmostSoldOutCount: () => {
    const { items } = get();
    return items.filter((item) => {
      const stock = parseInt(item.available_stock || 0);
      return stock > 0 && stock <= 20;
    }).length;
  },

  // Clear cart (for logout)
  clearCart: () => {
    set({
      items: [],
      selectedCount: 0,
      totalCount: 0,
      loading: false,
      error: null,
    });
  },
}));

export default useCartStore;
