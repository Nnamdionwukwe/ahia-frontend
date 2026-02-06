import React from "react";
import styles from "./OrderSummary.module.css";

export default function OrderSummary({ orderData }) {
  return (
    <div className={styles.orderSummary}>
      <div className={styles.summaryRow}>
        <span>Item(s) total:</span>
        <span>₦{orderData.itemsTotal.toLocaleString()}</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Item(s) discount:</span>
        <span className={styles.discount}>
          -₦{Math.abs(orderData.itemsDiscount).toLocaleString()}
        </span>
      </div>

      <div className={styles.summaryRow}>
        <span>Limited-time discount:</span>
        <span className={styles.discount}>
          -₦{Math.abs(orderData.limitedDiscount).toLocaleString()}
        </span>
      </div>

      <div className={styles.summaryRow}>
        <span>Subtotal:</span>
        <span>₦{orderData.subtotal.toLocaleString()}</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Shipping:</span>
        <span className={styles.free}>FREE</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Credit:</span>
        <span className={styles.credit}>
          -₦{Math.abs(orderData.credit).toLocaleString()}
        </span>
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.summaryTotal}>
        <span>Order total:</span>
        <span>₦{Math.max(orderData.orderTotal, 0).toLocaleString()}</span>
      </div>

      <div className={styles.timelineBox}>
        <span className={styles.savings}>
          💎 ₦{orderData.savings.toLocaleString()} OFF
        </span>
        <span className={styles.expiresIn}>
          expires in {orderData.timeRemaining}
        </span>
      </div>
    </div>
  );
}
