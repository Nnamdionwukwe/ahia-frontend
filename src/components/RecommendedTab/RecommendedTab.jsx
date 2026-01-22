import React from "react";
import styles from "./RecommendedTab.module.css";

const RecommendedTab = () => {
  return (
    <div className={styles.content}>
      <div className={styles.noReviews}>
        <p>Recommended products coming soon!</p>
      </div>
    </div>
  );
};

export default RecommendedTab;
