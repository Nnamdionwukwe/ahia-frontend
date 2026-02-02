import React from "react";
import styles from "./ProductImageGallerySub.module.css";

const ProductImageGallerySub = ({
  displayImages,
  setFullscreenImageIndex,
  setShowFullscreenImage,
  productData,
}) => {
  if (!displayImages || displayImages.length === 0) return null;

  return (
    <div className={styles.imageGrid}>
      {displayImages.map((img, idx) => (
        <div
          key={idx}
          className={styles.imageCard}
          onClick={() => {
            setFullscreenImageIndex(idx);
            setShowFullscreenImage(true);
          }}
        >
          <img
            src={img.image_url}
            alt={img.alt_text || `${productData.name} - Image ${idx + 1}`}
            className={styles.gridImage}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductImageGallerySub;
