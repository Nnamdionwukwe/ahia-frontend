import React from "react";
import styles from "./Paymentstep.module.css";

export default function PaymentStep({ shippingAddress }) {
  return (
    <section className={styles.section}>
      <div className={styles.cardInputGroup}>
        <label>* Card number</label>
        <div className={styles.cardNumberInput}>
          <input type="text" placeholder="Card number" />
          <button className={styles.scanButton}>📷 Scan card</button>
        </div>
      </div>

      <div className={styles.cardInputRow}>
        <div className={styles.cardInputGroup}>
          <label>* Expiration date</label>
          <input type="text" placeholder="MM/YY" />
        </div>
        <div className={styles.cardInputGroup}>
          <label>* CVV</label>
          <input type="password" placeholder="3-4 digits" />
        </div>
      </div>

      <div className={styles.cardInputGroup}>
        <label>* Billing address</label>
        <p>
          {shippingAddress.name}, {shippingAddress.address}
        </p>
      </div>
    </section>
  );
}
