import React from "react";
import styles from "./ColorVariants.module.css";

const ColorVariants = ({
  variants,
  selectedVariant,
  setSelectedVariant,
  displayImages,
  setSelectedImage,
}) => {
  if (variants.length === 0) return null;

  return (
    <div className={styles.colorSection}>
      <h3 className={styles.colorTitle}>Colors</h3>
      <div className={styles.colorOptions}>
        {[...new Map(variants.map((v) => [v.color, v])).values()].map(
          (variant) => (
            <div
              key={variant.id}
              className={`${styles.colorOption} ${
                selectedVariant?.color === variant.color
                  ? styles.colorOptionActive
                  : ""
              }`}
              onClick={() => {
                setSelectedVariant(variant);
                // Find the image index for this variant if it has an image_url
                if (variant.image_url && displayImages.length > 0) {
                  const imgIndex = displayImages.findIndex(
                    (img) => img.image_url === variant.image_url
                  );
                  if (imgIndex !== -1) {
                    setSelectedImage(imgIndex);
                  }
                }
              }}
            >
              {variant.image_url && (
                <img
                  src={variant.image_url}
                  alt={variant.color}
                  className={styles.colorOptionImage}
                />
              )}
              {selectedVariant?.color === variant.color && (
                <div className={styles.colorSelectedBadge}>🔥</div>
              )}
            </div>
          )
        )}
      </div>

      {/* Size Selection */}
      <div className={styles.sizeSection}>
        <div className={styles.sizeHeader}>
          <h3 className={styles.sizeTitle}>Size(UK)</h3>
          <button className={styles.sizeGuideButton}>
            <span className={styles.sizeGuideIcon}>📏</span>
            Size guide
          </button>
        </div>
        <div className={styles.sizeOptions}>
          {variants
            .filter((v) => v.color === selectedVariant?.color)
            .map((variant) => (
              <button
                key={variant.id}
                className={`${styles.sizeOption} ${
                  selectedVariant?.id === variant.id
                    ? styles.sizeOptionActive
                    : ""
                }`}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.size}
              </button>
            ))}
        </div>
        <div className={styles.sizeFitInfo}>
          <span className={styles.infoIcon}>ⓘ</span>
          <span>90% of customers say these fit true to size</span>
        </div>
      </div>
    </div>
  );
};

export default ColorVariants;
