// ============================================
// 1. BottomNav.jsx
// ============================================
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import styles from "./BottomNav.module.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.itemCount || 0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: FiHome,
      path: "/",
      badge: null,
    },
    {
      id: "categories",
      label: "Categories",
      icon: FiSearch,
      path: "/searchheader",
      badge: null,
    },
    {
      id: "you",
      label: "You",
      icon: FiUser,
      path: isAuthenticated ? "/settings" : "/auth",
      badge: null, // You can add notification count here if you have one
    },
    {
      id: "cart",
      label: "Cart",
      icon: FiShoppingCart,
      path: "/cart",
      badge: cartItemsCount,
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item) => {
    // If user clicks on "You" and not authenticated, redirect to auth
    if (item.id === "you" && !isAuthenticated) {
      navigate("/auth");
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Promo Banner */}
      <div className={styles.promoBanner}>
        <span className={styles.promoText}>Limited-time</span>
        <span className={styles.promoHighlight}>Free shipping</span>
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`${styles.navItem} ${active ? styles.active : ""} ${
                item.id === "categories" ? styles.categoriesItem : ""
              }`}
              aria-label={item.label}
            >
              <div className={styles.iconWrapper}>
                <Icon className={styles.icon} size={24} />
                {item.badge !== null && item.badge > 0 && (
                  <span className={styles.badge}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;

// ============================================
// 2. Usage in App.jsx
// ============================================
/*
import BottomNav from './components/BottomNav/BottomNav';

function App() {
  return (
    <div>
      {/* Your routes and content *\/}
      <BottomNav />
    </div>
  );
}
*/

// ============================================
// 3. Optional: Create a simple cartStore if you don't have one
// ============================================
/*
// src/store/cartStore.js
import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
  clearCart: () => set({ items: [] }),
}));

export default useCartStore;
*/
