import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductDetailHeader.module.css";

const ProductDetailHeader = ({ activeTab, setActiveTab, displayImages }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.header}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ←
      </button>
      <div className={styles.headerTabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "overview" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "reviews" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
        {displayImages.length > 4 && (
          <button
            className={`${styles.tab} ${
              activeTab === "gallery" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        )}
      </div>
      <div className={styles.headerActions}>
        <button className={styles.iconButton}>🔍</button>
        <button className={styles.iconButton}>📤</button>
      </div>
    </div>
  );
};

export default ProductDetailHeader;
