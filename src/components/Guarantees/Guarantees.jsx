import React from "react";
import styles from "./Guarantees.module.css";

const Guarantees = () => {
  return (
    <>
      {/* Guarantees */}
      <div className={styles.guaranteeSection}>
        <div className={styles.guaranteeItem}>
          <span className={styles.shippingIcon}>📦</span>
          <span className={styles.freeShippingText}>FREE SHIPPING</span>
        </div>
      </div>

      <div className={styles.benefitsGrid}>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>₦1,600 Credit for delay</span>
        </div>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>15-day no update refund</span>
        </div>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>60-day returns</span>
        </div>
      </div>

      {/* Delivery Details */}
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

      {/* Safe Payments */}
      <div className={styles.safePayments}>
        <span className={styles.shieldIcon}>🛡️</span>
        <span>Safe payments • Secure privacy</span>
        <span className={styles.arrowRight}>›</span>
      </div>

      {/* Order Guarantee */}
      <div className={styles.orderGuarantee}>
        <div className={styles.guaranteeHeader}>
          <span className={styles.guaranteeIcon}>🎁</span>
          <span>Order guarantee</span>
          <span className={styles.moreLink}>More ›</span>
        </div>
        <div className={styles.guaranteePoints}>
          <div className={styles.guaranteePoint}>✓ 90-day returns</div>
          <div className={styles.guaranteePoint}>✓ Return if item damaged</div>
          <div className={styles.guaranteePoint}>✓ Price adjustment</div>
        </div>
      </div>

      <div className={styles.benefitsGrid}>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>₦1,600 Credit for delay</span>
        </div>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>15-day no update refund</span>
        </div>
        <div className={styles.benefitItem}>
          <span>✓</span>
          <span>60-day returns</span>
        </div>
      </div>
    </>
  );
};

export default Guarantees;
