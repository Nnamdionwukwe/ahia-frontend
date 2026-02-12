import React from "react";
import { Eye } from "lucide-react";
import styles from "./PopularProducts.module.css";

const PopularProducts = ({ popularProducts, formatNumber, formatCurrency }) => {
  return (
    <div className={styles.fullWidthCard}>
      <div className={styles.cardHeader}>
        <h3>🔥 Trending Products</h3>
        <button className={styles.viewAllButton}>View All →</button>
      </div>
      <div className={styles.productsGrid}>
        {popularProducts.slice(0, 8).map((product, index) => (
          <div key={index} className={styles.productCard}>
            <div className={styles.productRank}>#{index + 1}</div>
            <img
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h4>{product.name}</h4>
              <p className={styles.productViews}>
                <Eye size={14} /> {formatNumber(product.view_count)} views
              </p>
              <p className={styles.productPrice}>
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;
