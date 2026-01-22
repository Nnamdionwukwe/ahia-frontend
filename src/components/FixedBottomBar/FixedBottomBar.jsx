import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FixedBottomBar.module.css";

const FixedBottomBar = ({
  handleAddToCart,
  productData,
  activeSale,
  actualDiscount,
  cartCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.bottomBar}>
      <button
        onClick={handleAddToCart}
        className={styles.addToCartButton}
        disabled={productData.stock_quantity === 0}
      >
        {activeSale && `-${actualDiscount}% now! `}
        {productData.stock_quantity === 0 ? "Out of Stock" : "Add to cart!"}
        <br />
        <span className={styles.deliverySubtext}>
          Arrives in NG in as little as 6 days
        </span>
      </button>
      <button
        className={styles.cartFloatingButton}
        onClick={() => navigate("/cart")}
      >
        🛒
        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        <span className={styles.cartFreeShipping}>Free shipping</span>
      </button>
    </div>
  );
};

export default FixedBottomBar;
