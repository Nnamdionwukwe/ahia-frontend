import React from "react";
import styles from "./DeliveryDetails.module.css";

const DeliveryDetails = () => {
  return (
    <>
      {/* Guarantees */}
      <div className={styles.guaranteeSection}>
        <div className={styles.guaranteeItem}>
          <span className={styles.shippingIcon}>📦</span>
          <span className={styles.freeShippingText}>FREE SHIPPING</span>
        </div>
      </div>

      <div className={styles.deliveryContainer}>
        <div className={styles.deliveryDetails}>
          <div>
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Standard:</span>
              <span className={styles.deliveryValue}>free on all orders.</span>
            </div>
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Delivery:</span>
              <span className={styles.deliveryValue}>
                Arrives in NG in as little as 7 days
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
        </div>

        <div className={styles.deliveryRow2}>
          <button className={styles.clickCollect}>
            Click & Collect: FREE.
          </button>

          <div className={styles.collectInfo}>Delivery: Feb 10-23</div>
        </div>
      </div>
    </>
  );
};

export default DeliveryDetails;
