import React from "react";
import styles from "./ProductFeatures.module.css";

const ProductFeatures = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={styles.featuresSection}>
      <h3 className={styles.featuresTitle}>Key Features</h3>
      <div className={styles.tagsList}>
        {tags.map((tag, idx) => (
          <span key={idx} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductFeatures;
