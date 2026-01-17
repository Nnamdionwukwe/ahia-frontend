// src/pages/Settings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import { FiSun, FiMoon } from "react-icons/fi";
import styles from "./Settings.module.css";
import Header from "../../components/Header/Header";

const Settings = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Settings</h1>

          {/* User Info */}
          <section className={styles.section}>
            <h2>Account</h2>
            <div className={styles.item}>
              <label>Phone Number:</label>
              <span>{user.phone_number}</span>
            </div>
            <div className={styles.item}>
              <label>Full Name:</label>
              <span>{user.full_name}</span>
            </div>
          </section>

          {/* Theme Settings */}
          <section className={styles.section}>
            <h2>Appearance</h2>
            <div className={styles.themeToggle}>
              <label>Dark Mode</label>
              <button
                className={`${styles.toggleBtn} ${isDark ? styles.active : ""}`}
                onClick={toggleTheme}
              >
                {isDark ? <FiMoon size={20} /> : <FiSun size={20} />}
                <span>{isDark ? "Dark" : "Light"}</span>
              </button>
            </div>
          </section>

          {/* Delivery Addresses */}
          <section className={styles.section}>
            <h2>Delivery Addresses</h2>
            <button className={styles.btnSecondary}>Add Address</button>
          </section>

          {/* Logout */}
          <section className={`${styles.section} ${styles.danger}`}>
            <button className={styles.btnDanger} onClick={handleLogout}>
              Sign Out
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Settings;
