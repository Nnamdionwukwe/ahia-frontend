import React from "react";
import styles from "./GalleryTab.module.css";

const GalleryTab = ({ displayImages, setSelectedImage, setActiveTab }) => {
  return (
    <div className={styles.content}>
      <h2 className={styles.sectionTitle}>All Product Images</h2>
      <div className={styles.fullImagesGrid}>
        {displayImages.map((img, idx) => (
          <div key={idx} className={styles.fullGridImageContainer}>
            <img
              src={img.image_url}
              alt={img.alt_text || `Product image ${idx + 1}`}
              className={styles.fullGridImage}
              onClick={() => {
                setSelectedImage(idx);
                setActiveTab("overview");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryTab;
