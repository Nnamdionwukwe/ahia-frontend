import React from "react";
import styles from "./ProductImageGalleryGrid.module.css";

const ProductImageGalleryGrid = ({ displayImages, setSelectedImage }) => {
  if (displayImages.length === 0) return null;

  return (
    <div className={styles.productImagesSection}>
      {/* Mobile Horizontal Scroll View */}
      <div className={styles.imagesMobileThumbnails}>
        {displayImages.map((img, idx) => (
          <img
            key={idx}
            src={img.image_url}
            alt={`Product image ${idx + 1}`}
            className={styles.imageMobileThumbnail}
            onClick={() => setSelectedImage(idx)}
          />
        ))}
      </div>

      {/* Desktop Grid View */}
      <div className={styles.imagesGrid}>
        {displayImages.map((img, idx) => (
          <div
            key={idx}
            className={styles.gridImageContainer}
            onClick={() => {
              setSelectedImage(idx);
            }}
          >
            <img
              src={img.image_url}
              alt={img.alt_text || `Product image ${idx + 1}`}
              className={styles.gridImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGalleryGrid;
