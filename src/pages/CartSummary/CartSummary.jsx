// pages/Cart/CartSummary/CartSummary.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../../stores/cartStore";
import styles from "./CartSummary.module.css";

const CartSummary = () => {
  const navigate = useNavigate();
  const { items, selectedCount, getSelectedTotals } = useCartStore();

  const totals = getSelectedTotals();

  if (items.length === 0) {
    return null;
  }

  const handleCheckout = () => {
    if (selectedCount === 0) {
      alert("Please select items to checkout");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryCard}>
        <h3 className={styles.summaryTitle}>Order Summary</h3>

        <div className={styles.summaryRow}>
          <span className={styles.label}>Items ({totals.itemCount})</span>
          <span className={styles.value}>
            ₦{totals.subtotal.toLocaleString()}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.label}>Discount</span>
            <span className={`${styles.value} ${styles.discount}`}>
              -₦{totals.discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className={styles.summaryRow}>
          <span className={styles.label}>Shipping</span>
          <span className={`${styles.value} ${styles.free}`}>FREE</span>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span className={styles.totalLabel}>Total</span>
          <div className={styles.totalPrice}>
            <span className={styles.totalAmount}>
              ₦{totals.total.toLocaleString()}
            </span>
            {totals.discountPercentage > 0 && (
              <span className={styles.savings}>
                You save {totals.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        <button
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={selectedCount === 0}
        >
          Proceed to Checkout ({selectedCount})
        </button>

        {totals.discount > 0 && (
          <div className={styles.savingsInfo}>
            <span className={styles.savingsIcon}>💰</span>
            <span>
              You're saving ₦{totals.discount.toLocaleString()} on this order!
            </span>
          </div>
        )}
      </div>

      {/* Promo Code Section */}
      <div className={styles.promoCard}>
        <h4 className={styles.promoTitle}>Have a promo code?</h4>
        <div className={styles.promoInput}>
          <input
            type="text"
            placeholder="Enter code"
            className={styles.input}
          />
          <button className={styles.applyButton}>Apply</button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={styles.paymentMethods}>
        <h4 className={styles.methodsTitle}>We accept</h4>
        <div className={styles.methodsIcons}>
          <div className={styles.methodIcon}>💳</div>
          <div className={styles.methodIcon}>🏦</div>
          <div className={styles.methodIcon}>📱</div>
          <div className={styles.methodIcon}>💰</div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
