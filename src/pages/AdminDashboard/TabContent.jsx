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

          {activeTab === "products" && (
            <div className={styles.comingSoon}>
              <Package size={64} />
              <h3>Products Management</h3>
              <p>Coming soon...</p>
            </div>
          )}

          {activeTab === "orders" && (
            <div className={styles.comingSoon}>
              <ShoppingBag size={64} />
              <h3>Orders Management</h3>
              <p>Coming soon...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TabContent;
