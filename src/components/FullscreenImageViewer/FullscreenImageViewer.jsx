import React, { useRef } from "react";
import styles from "./FullscreenImageViewer.module.css";

const FullscreenImageViewer = ({
  showFullscreenImage,
  displayImages,
  fullscreenImageIndex,
  setFullscreenImageIndex,
  setShowFullscreenImage,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove,
  fullscreenSwipeProgress,
}) => {
  const fullscreenImageRef = useRef(null);

  if (!showFullscreenImage || displayImages.length === 0) return null;

  return (
    <div
      className={styles.fullscreenImageOverlay}
      onClick={() => setShowFullscreenImage(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{
        opacity: 1 - fullscreenSwipeProgress * 0.3,
        backgroundColor: `rgba(0, 0, 0, ${
          0.9 - fullscreenSwipeProgress * 0.3
        })`,
      }}
    >
      <div
        className={styles.fullscreenImageContainer}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${fullscreenSwipeProgress * 100}px) scale(${
            1 - fullscreenSwipeProgress * 0.05
          })`,
          opacity: 1 - fullscreenSwipeProgress * 0.2,
          transition:
            fullscreenSwipeProgress === 0
              ? "transform 0.3s ease-out, opacity 0.3s ease-out"
              : "none",
        }}
      >
        <img
          ref={fullscreenImageRef}
          src={displayImages[fullscreenImageIndex]?.image_url}
          alt={`Product image ${fullscreenImageIndex + 1}`}
          className={styles.fullscreenImage}
        />

        {/* Image Counter */}
        <div className={styles.fullscreenCounter}>
          {fullscreenImageIndex + 1} / {displayImages.length}
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              className={styles.fullscreenArrowLeft}
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(
                  (prev) =>
                    (prev - 1 + displayImages.length) % displayImages.length
                );
              }}
              style={{ display: "none" }}
            >
              ‹
            </button>
            <button
              className={styles.fullscreenArrowRight}
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(
                  (prev) => (prev + 1) % displayImages.length
                );
              }}
              style={{ display: "none" }}
            >
              ›
            </button>
          </>
        )}

        {/* Thumbnails Strip */}
        {displayImages.length > 1 && (
          <div className={styles.fullscreenThumbnails}>
            {displayImages.map((img, idx) => (
              <img
                key={idx}
                src={img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                className={`${styles.fullscreenThumbnail} ${
                  idx === fullscreenImageIndex
                    ? styles.fullscreenThumbnailActive
                    : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImageIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Touch/Swipe Hint */}
      <div className={styles.fullscreenHint}>
        Swipe to navigate • Press ESC to close
      </div>
    </div>
  );
};

export default FullscreenImageViewer;
