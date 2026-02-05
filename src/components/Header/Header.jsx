import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSettings, FiHeart, FiHeadphones, FiX } from "react-icons/fi";
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
          {/* Wishlist */}
          <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
            <FiHeart size={24} />
          </Link>

          {/* Support */}
          <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
            <FiHeadphones size={24} />
          </Link>

          {/* Settings */}
          <Link to="/settings" className={styles.cartBtn} title="Settings">
            <FiSettings size={24} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <Link
              to="/profile-card"
              className={styles.userBtn}
              title="Settings"
            >
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
