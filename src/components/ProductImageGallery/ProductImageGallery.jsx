import React, { useState } from "react";
import styles from "./ProductImageGallery.module.css";

const ProductImageGallery = ({
  displayImages,
  selectedImage,
  setSelectedImage,
  setFullscreenImageIndex,
  setShowFullscreenImage,
  productData,
}) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const minSwipeDistance = 50;

const ProductImageGallery = ({
  displayImages,
  selectedImage,
  setSelectedImage,
  setFullscreenImageIndex,
  setShowFullscreenImage,
  productData,
}) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        if (isLeftSwipe) {
          setSelectedImage((prev) => (prev + 1) % displayImages.length);
        }
        if (isRightSwipe) {
          setSelectedImage((prev) => 
            prev === 0 ? displayImages.length - 1 : prev - 1
          );
        }
        
        setTimeout(() => setIsTransitioning(false), 300);
      }, 50);
    }
  };

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
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={displayImages[selectedImage]?.image_url}
              alt={displayImages[selectedImage]?.alt_text || productData.name}
              style={{
                opacity: isTransitioning ? 0.7 : 1,
              }}
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
  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left → next image (loop to first)
      setSelectedImage((prev) => (prev + 1) % displayImages.length);
    }

    if (isRightSwipe) {
      // Swipe right → previous image (loop to last)
      setSelectedImage((prev) =>
        prev === 0 ? displayImages.length - 1 : prev - 1,
      );
    }
  };

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
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
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
