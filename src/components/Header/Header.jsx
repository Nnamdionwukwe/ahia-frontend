import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiHeart, FiMenu, FiX } from "react-icons/fi";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import useCartStore from "../../store/cartStore";
import styles from "./Header.module.css";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const itemCount = useCartStore((state) => state.itemCount);

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <h1>AHIA</h1>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={isDark ? "Dark mode" : "Light mode"}
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
            <FiHeart size={24} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className={styles.cartBtn} title="Shopping Cart">
            <FiShoppingCart size={24} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <Link to="/settings" className={styles.userBtn} title="Settings">
              {user.full_name?.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link to="/auth" className={styles.loginBtn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
