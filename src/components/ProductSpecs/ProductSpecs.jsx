import React from "react";
import styles from "./ProductSpecs.module.css";

const ProductSpecs = ({ attributes }) => {
  if (Object.keys(attributes).length === 0) return null;

  return (
    <div className={styles.specsGrid}>
      {Object.entries(attributes)
        .slice(0, 3)
        .map(([group, attrs]) =>
          attrs.slice(0, 1).map((attr, idx) => (
            <div key={`${group}-${idx}`} className={styles.specCard}>
              <div className={styles.specLabel}>{attr.name}</div>
              <div className={styles.specValue}>{attr.value}</div>
            </div>
          )),
        )}
    </div>
  );
};

export default ProductSpecs;
