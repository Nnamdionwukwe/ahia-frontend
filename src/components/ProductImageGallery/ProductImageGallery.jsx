import React from "react";
import styles from "./ProductImageGallery.module.css";

const ProductImageGallery = ({
  displayImages,
  selectedImage,
  setSelectedImage,
  setFullscreenImageIndex,
  setShowFullscreenImage,
  productData,
}) => {
  return (
    <>
      {displayImages.length > 0 && (
        <div className={styles.imageSection}>
          <div
            className={styles.mainImage}
            onClick={() => {
              setFullscreenImageIndex(selectedImage);
              setShowFullscreenImage(true);
            }}
          >
            <img
              src={displayImages[selectedImage]?.image_url}
              alt={displayImages[selectedImage]?.alt_text || productData.name}
            />
            <div className={styles.imageCounter}>
              {selectedImage + 1}/{displayImages.length}
            </div>
            <button
              className={styles.fullScreenButton}
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(selectedImage);
                setShowFullscreenImage(true);
              }}
            >
              ⛶
            </button>
          </div>

          {displayImages.length > 1 && (
            <div className={styles.thumbnails}>
              {displayImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnail} ${
                    selectedImage === idx ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `View ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
