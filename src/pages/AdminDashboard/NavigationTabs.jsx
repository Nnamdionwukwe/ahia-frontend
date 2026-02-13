import React from "react";
import {
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  BadgePercent,
  SunMedium,
  Bell,
} from "lucide-react";
import styles from "./NavigationTabs.module.css";

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("overview")}
      >
        <BarChart3 size={20} />
        Overview
      </button>
      <button
        className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("users")}
      >
        <Users size={20} />
        Users
      </button>
      <button
        className={`${styles.tab} ${activeTab === "products" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("products")}
      >
        <Package size={20} />
        Products
      </button>
      <button
        className={`${styles.tab} ${activeTab === "orders" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("orders")}
      >
        <ShoppingBag size={20} />
        Orders
      </button>
      <button
        className={`${styles.tab} ${activeTab === "flash-sales" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("flash-sales")}
      >
        <BadgePercent size={20} />
        Flash Sales
      </button>
      <button
        className={`${styles.tab} ${activeTab === "seasonal-sales" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("seasonal-sales")}
      >
        <SunMedium size={20} />
        Seasonal Sales
      </button>
      <button
        className={`${styles.tab} ${activeTab === "seasonal-sales" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("seasonal-sales")}
      >
        <SunMedium size={20} />
        Seasonal Sales
      </button>
      <button
        className={`${styles.tab} ${activeTab === "notifications" ? styles.activeTab : ""}`}
        onClick={() => setActiveTab("notifications")}
      >
        <Bell size={20} />
        Notifications
      </button>
    </nav>
  );
};

export default NavigationTabs;
