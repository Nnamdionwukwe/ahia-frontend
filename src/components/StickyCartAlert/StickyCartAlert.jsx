import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StickyCartAlert.module.css";

const StickyCartAlert = ({ cartCount }) => {
  const navigate = useNavigate();

  if (cartCount === 0) return null;

  return (
    <div className={styles.cartAlert}>
      <div className={styles.cartAlertContent}>
        <span className={styles.cartIcon}>🛒</span>
        <span>{cartCount} items in your cart</span>
      </div>
      <button
        className={styles.viewCartButton}
        onClick={() => navigate("/cart")}
      >
        View cart ({cartCount})
      </button>
    </div>
  );
};

export default StickyCartAlert;
