import React from "react";
import styles from "./ShippingDeliveryInfo.module.css";

const ShippingDeliveryInfo = () => {
  return (
    <>
      {/* Shipping & Delivery Info */}
      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
          <span className={styles.checkIcon}>✓</span>
          <span className={styles.freeShipping}>Free shipping</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.creditIcon}>₦</span>
          <span>₦1,600 Credit for delay</span>
        </div>
      </div>

      {/* Delivery Estimate */}
      <div className={styles.deliveryBadge}>
        <span className={styles.truckIcon}>🚚</span>
        <span className={styles.deliveryText}>
          Arrives in NG in as little as 7 days
        </span>
      </div>
    </>
  );
};

export default ShippingDeliveryInfo;
