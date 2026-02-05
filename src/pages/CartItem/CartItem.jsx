// pages/Cart/CartItem/CartItem.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CartItem.module.css";
import useCartStore from "../../store/cartStore";

const CartItem = ({ item }) => {
  const navigate = useNavigate();
  const { toggleSelection, updateQuantity, removeItem } = useCartStore();

  // ✅ Safety check
  if (!item) {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [imageError, setImageError] = useState(false);

  const MAX_SWIPE = -80;

  useEffect(() => {
    if (!item?.sale_end_time) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(item.sale_end_time).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [item?.sale_end_time]);

  const originalPrice = parseFloat(item.item_original_price || 0);
  const finalPrice = parseFloat(item.final_price || 0);
  const discount =
    item.sale_discount ||
    item.discount_percentage ||
    item.variant_discount ||
    0;
  const stock = parseInt(item.available_stock || 0);
  const isAlmostGone = stock > 0 && stock <= 20;
  const isSoldOut = stock <= 0;

  // ✅ IMPROVED: Get the correct image URL with multiple fallback options
  const getImageUrl = () => {
    // Priority order for images:
    // 1. Variant-specific image (if variant is selected)
    // 2. Cart item image_url
    // 3. Product images array (first image)
    // 4. Default product image

    if (item.variant_image_url) {
      return item.variant_image_url;
    }

    if (item.image_url) {
      return item.image_url;
    }

    // If product has images array, get first one
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }

    // Fallback to product_image or image property
    return item.product_image || item.image || "";
  };

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);

      // Try alternative image sources in order
      const fallbackImages = [
        item.variant_image_url,
        item.image_url,
        item.images && item.images[0],
        item.product_image,
        item.image,
      ].filter(Boolean); // Remove null/undefined values

      // Find next available image that hasn't been tried yet
      const currentSrc = e.target.src;
      const nextImage = fallbackImages.find(
        (img) => img && !currentSrc.includes(img),
      );

      if (nextImage) {
        e.target.src = nextImage;
      } else {
        // Use inline SVG placeholder as last resort
        e.target.src =
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else if (newQuantity <= stock) {
      updateQuantity(item.id, newQuantity);
    }
    setShowQuantityModal(false);
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;

    // Only allow left swipe (negative values)
    if (diffX < 0) {
      const newSwipeX = Math.max(diffX, MAX_SWIPE);
      setSwipeX(newSwipeX);
    } else if (diffX > 0 && swipeX < 0) {
      // Allow right swipe to close
      const newSwipeX = Math.min(swipeX + diffX, 0);
      setSwipeX(newSwipeX);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    // Snap to open or closed position
    if (swipeX < MAX_SWIPE / 2) {
      setSwipeX(MAX_SWIPE); // Snap to open
    } else {
      setSwipeX(0); // Snap to closed
    }
  };

  return (
    <>
      <div className={styles.swipeContainer}>
        <div
          className={`${styles.cartItem} ${isSoldOut ? styles.soldOut : ""}`}
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: isSwiping ? "none" : "transform 0.3s ease",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={item.is_selected}
            onChange={() => toggleSelection(item.id)}
            disabled={isSoldOut}
          />

          {/* Product Image */}
          <div
            className={styles.imageContainer}
            onClick={() => navigate(`/product/${item.product_id}`)}
          >
            <img
              src={getImageUrl()}
              alt={item.name || "Product"}
              className={styles.productImage}
              onError={handleImageError}
              loading="lazy"
              crossOrigin="anonymous"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
            {isAlmostGone && !isSoldOut && (
              <div className={styles.almostSoldOutBadge}>ALMOST SOLD OUT</div>
            )}
            {isSoldOut && (
              <div className={styles.soldOutOverlay}>
                <span>Sold out in '{item.color || "this variant"}'</span>
              </div>
            )}
            {stock <= 50 && stock > 20 && (
              <div className={styles.stockBadge}>⚡ ONLY {stock} LEFT</div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <h3
              className={styles.productName}
              onClick={() => navigate(`/product/${item.product_id}`)}
            >
              {item.name?.substring(0, 20)}...
            </h3>

            {/* Variant Info */}
            {(item.color || item.size) && (
              <div className={styles.variantInfo}>
                {item.color && <span>{item.color}</span>}
                {item.size && <span> • Size: {item.size}</span>}
                {item.quantity && <span> • Qty: {item.quantity}</span>}
              </div>
            )}

            {/* Sale Badge */}
            {item.sale && (
              <div className={styles.saleBadge}>
                <span className={styles.bigSale}>Big sale</span>
                <span className={styles.lastDays}>
                  Last{" "}
                  {Math.ceil(
                    (new Date(item.sale_end_time) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className={styles.priceSection}>
              {discount > 0 && (
                <div className={styles.originalPrice}>
                  ₦{originalPrice.toLocaleString()}
                </div>
              )}

              <div className={styles.priceRow}>
                {item.sale && item.sale.is_last_day && (
                  <div className={styles.lastDayBadge}>
                    <span className={styles.fireIcon}>🔥</span>
                    Last day
                  </div>
                )}
                <div className={styles.finalPrice}>
                  ₦{finalPrice.toLocaleString()}
                </div>
                {discount > 0 && (
                  <div className={styles.discountBadge}>-{discount}%</div>
                )}
              </div>

              {item.sale && (
                <div className={styles.afterPromo}>
                  after applying credit to ₦
                  {(finalPrice * 0.9).toLocaleString()} ›
                </div>
              )}
            </div>

            {/* Pre-order info */}
            {item.is_preorder && (
              <div className={styles.preorderInfo}>
                <span className={styles.preorderIcon}>⏰</span>
                Pre-order. Delivery: {item.delivery_date}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className={styles.quantitySection}>
            <button
              className={styles.quantityButton}
              onClick={() => setShowQuantityModal(true)}
              disabled={isSoldOut}
            >
              {item.quantity} ▼
            </button>
          </div>

          {/* Delete Button (top right) */}
          <button
            className={styles.deleteButton}
            onClick={() => removeItem(item.id)}
          >
            🗑️
          </button>
        </div>

        {/* Swipe Delete Button - only visible when swiped */}
        <div className={styles.swipeDeleteButton}>
          <button onClick={() => removeItem(item.id)}>
            <span className={styles.trashIcon}>🗑️</span>
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Quantity Modal */}
      {showQuantityModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowQuantityModal(false)}
        >
          <div
            className={styles.quantityModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Select quantity</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowQuantityModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.quantityInput}>
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                max={stock}
                defaultValue={item.quantity}
                placeholder="Please enter your quantity"
              />
            </div>

            <div className={styles.quantityOptions}>
              <button
                className={styles.deleteOption}
                onClick={() => handleQuantityChange(0)}
              >
                0 (Delete)
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  className={`${styles.quantityOption} ${
                    num === item.quantity ? styles.selected : ""
                  }`}
                  onClick={() => handleQuantityChange(num)}
                  disabled={num > stock}
                >
                  {num} {num === item.quantity && "✓"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartItem;
