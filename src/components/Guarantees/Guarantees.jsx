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
    </>
  );
};

export default Guarantees;
