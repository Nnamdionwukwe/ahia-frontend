import React from "react";
import styles from "./Toast.module.css";

const Toast = ({
  show,
  message = "Added to cart",
  type = "success", // success, warning, info, error
  showAlmostSoldOut = true,
  showFreeShipping = true,
  onClose,
  autoHideDuration = 3000,
}) => {
  React.useEffect(() => {
    if (show && autoHideDuration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onClose]);

  if (!show) return null;

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[type]}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>✓</span>
          </div>
          <span className={styles.message}>{message}</span>
        </div>

        {/* Almost Sold Out Alert */}
        {showAlmostSoldOut && (
          <div className={styles.alertRow}>
            <span className={styles.warningBadge}>⚠ Almost sold out</span>
            <span className={styles.alertText}>
              of this item - check out now!
            </span>
          </div>
        )}

        {/* Free Shipping */}
        {showFreeShipping && (
          <div className={styles.infoRow}>
            <span className={styles.successBadge}>✓ Free shipping</span>
            <span className={styles.infoText}>eligible for you!</span>
          </div>
        )}

        {/* Close Button (optional) */}
        {onClose && (
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
