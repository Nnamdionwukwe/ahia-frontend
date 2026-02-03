import React from "react";
import styles from "./PaymentGuarantee.module.css";

const PaymentGuarantee = () => {
  return (
    <>
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

        {/* Scrollable guarantee points — same pattern as deliveryContainer */}
        <div className={styles.guaranteePoints}>
          <div className={styles.guaranteePoint}>✓ 90-day returns</div>
          <div className={styles.guaranteePoint}>✓ Return if item damaged</div>
          <div className={styles.guaranteePoint}>✓ Price adjustment</div>
          <div className={styles.guaranteePoint}>✓ ₦1,600 Credit for delay</div>
          <div className={styles.guaranteePoint}>✓ 15-day no update refund</div>
          <div className={styles.guaranteePoint}>✓ 90-day returns</div>
        </div>
      </div>
    </>
  );
};

export default PaymentGuarantee;
