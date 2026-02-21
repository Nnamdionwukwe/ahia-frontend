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

  const navItems = [
    { id: "home", label: "Home", icon: FiHome, path: "/", badge: null },
    {
      id: "categories",
      label: "Categories",
      icon: FiSearch,
      path: "/categoryPage",
      badge: null,
    },
    {
      id: "you",
      label: "You",
      icon: FiUser,
      path: isAuthenticated ? "/account-profile" : "/auth",
      badge: null,
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
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item) => {
    if (item.id === "you" && !isAuthenticated) {
      navigate("/auth");
    } else {
      navigate(item.path);
    }
  };

  return (
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

              {/* Cart count badge */}
              {item.badge > 0 && (
                <span className={styles.badge}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}

              {/* Promo tag — cart only */}
              {item.id === "cart" && (
                <div className={styles.promoTag}>
                  <span className={styles.promoTagTop}>Limited-time</span>
                  <span className={styles.promoTagBottom}>Free shipping</span>
                </div>
              )}
            </div>

            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
