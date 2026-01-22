import React from "react";
import styles from "./ProductSpecs.module.css";

const ProductSpecs = ({ attributes }) => {
  if (Object.keys(attributes).length === 0) return null;

  const getSpecIcon = (group) => {
    switch (group) {
      case "battery":
        return "🔋";
      case "waterproof":
        return "💧";
      default:
        return "📱";
    }
  };

  return (
    <div className={styles.specsGrid}>
      {Object.entries(attributes)
        .slice(0, 3)
        .map(([group, attrs]) =>
          attrs.slice(0, 1).map((attr, idx) => (
            <div key={`${group}-${idx}`} className={styles.specCard}>
              <div className={styles.specIcon}>{getSpecIcon(group)}</div>
              <div className={styles.specLabel}>{attr.name}</div>
              <div className={styles.specValue}>{attr.value}</div>
            </div>
          ))
        )}
    </div>
  );
};

export default ProductSpecs;
