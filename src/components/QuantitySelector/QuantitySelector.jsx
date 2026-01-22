import React from "react";
import styles from "./QuantitySelector.module.css";

const QuantitySelector = ({
  quantity,
  setQuantity,
  selectedVariant,
  productData,
}) => {
  return (
    <div className={styles.quantityRow}>
      <span className={styles.quantityLabel}>Qty</span>
      <div className={styles.quantitySelector}>
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className={styles.quantityButton}
        >
          −
        </button>
        <span className={styles.quantityValue}>{quantity}</span>
        <button
          onClick={() =>
            setQuantity(
              Math.min(
                selectedVariant?.stock_quantity ||
                  productData.stock_quantity ||
                  99,
                quantity + 1
              )
            )
          }
          className={styles.quantityButton}
        >
          +
        </button>
      </div>
      {(selectedVariant || productData.stock_quantity !== undefined) && (
        <span className={styles.stockInfo}>
          {selectedVariant?.stock_quantity || productData.stock_quantity}{" "}
          available
        </span>
      )}
    </div>
  );
};

export default QuantitySelector;
