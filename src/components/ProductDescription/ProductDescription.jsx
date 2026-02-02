import React, { useState } from "react";
import styles from "./ProductDescription.module.css";

const ProductDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className={styles.description}>
      <div className={styles.textWrapper}>
        <p className={isExpanded ? styles.expanded : styles.collapsed}>
          <span className={styles.truckIcon}>🚚</span>
          <span className={styles.deliveryText}>
            Arrives in NG in as little as 7 days
          </span>{" "}
          {description}
        </p>
        {!isExpanded && (
          <button
            className={styles.toggleButton}
            onClick={() => setIsExpanded(true)}
            aria-label="Read more"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 5L3 10h10z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
