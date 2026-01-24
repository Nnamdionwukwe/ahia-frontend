import React from "react";
import styles from "./AddToCartToast.module.css";

const AddToCartToast = ({
  show,
  productName,
  almostSoldOut = true,
  freeShipping = true,
  onClose,
  autoHide = true,
}) => {
  React.useEffect(() => {
    if (show && autoHide && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, autoHide, onClose]);

  if (!show) return null;

  return (
    <div className={styles.container}>
      <div className={styles.toast}>
        {/* Success Header */}
        <div className={styles.header}>
          <div className={styles.checkmark}>✓</div>
          <span className={styles.title}>Added to cart</span>
        </div>

        {/* Product Name (optional) */}
        {productName && <div className={styles.productName}>{productName}</div>}

        {/* Almost Sold Out Warning */}
        {almostSoldOut && (
          <div className={styles.warning}>
            <span className={styles.warningBadge}>⚠ Almost sold out</span>
            <span>of this item - check out now!</span>
          </div>
        )}

        {/* Free Shipping Info */}
        {freeShipping && (
          <div className={styles.shipping}>
            <span className={styles.shippingBadge}>✓ Free shipping</span>
            <span>eligible for you!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCartToast;
