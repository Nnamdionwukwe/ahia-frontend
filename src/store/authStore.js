// src/store/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null });

    // Clear wishlist store on logout
    // Import the store dynamically to avoid circular dependencies
    import("./wishlistStore").then((module) => {
      module.default.setState({ items: [], inWishlist: {} });
    });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },

  getToken: () => {
    return localStorage.getItem("accessToken");
  },
}));

export default useAuthStore;
