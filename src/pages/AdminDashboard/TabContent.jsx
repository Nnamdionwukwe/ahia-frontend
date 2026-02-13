import React from "react";
import { Package, ShoppingBag } from "lucide-react";
import styles from "./TabContent.module.css";

const TabContent = ({ loading, activeTab, children }) => {
  return (
    <div className={styles.content}>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {activeTab === "overview" && children}
          {activeTab === "users" && children}
          {activeTab === "products" && children}
          {activeTab === "orders" && children}
          {activeTab === "flash-sales" && children}
          {activeTab === "seasonal-sales" && children}
          {activeTab === "notifications" && children}
        </>
      )}
    </div>
  );
};

export default TabContent;
