import React from "react";
import styles from "./DeliveryDetails.module.css";

const DeliveryDetails = () => {
  return (
    <div className={styles.deliveryDetails}>
      <div className={styles.deliveryRow}>
        <span className={styles.deliveryLabel}>Standard:</span>
        <span className={styles.deliveryValue}>free on all orders.</span>
        <button className={styles.clickCollect}>Click & Collect</button>
      </div>
      <div className={styles.deliveryRow}>
        <span className={styles.deliveryLabel}>Delivery:</span>
        <span className={styles.deliveryValue}>
          Arrives in NG in as little as 6 days
        </span>
      </div>
      <div className={styles.deliveryRow}>
        <span className={styles.deliveryLabel}>Courier company:</span>
        <div className={styles.courierLogos}>
          <span className={styles.courierBadge}>Speedaf</span>
          <span className={styles.courierBadge}>GIG</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;
