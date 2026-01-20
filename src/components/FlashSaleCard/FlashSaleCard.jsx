import React, { useState, useEffect } from "react";
import { Clock, Flame, Star } from "lucide-react";
import styles from "./FlashSaleCard.module.css";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import ProductVariantModal from "../ProductVariantModal/ProductVariantModal";

const FlashSaleCard = ({ product, saleEndTime }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [adding, setAdding] = useState(false);
  const [saleEnded, setSaleEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Debug log
  console.log("FlashSaleCard received product:", product);

  // Early return with better error UI if product is invalid
  if (!product || typeof product !== "object") {
    console.error("FlashSaleCard: Invalid product data", product);
    return null; // Return null instead of showing error message
  }

  // Countdown timer effect
  useEffect(() => {
    if (!saleEndTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(saleEndTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setSaleEnded(true);
        return;
      }

      setSaleEnded(false);
      setTimeLeft({
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [saleEndTime]);

  // Safe extraction with comprehensive fallbacks
  const productId = product.id || product.product_id;
  const productName = product.name || product.product_name || "Product";
  const productImages = product.images || product.image_urls || [];
  const firstImage = Array.isArray(productImages)
    ? productImages[0]
    : productImages;

  // Price calculations
  const salePrice = parseFloat(product.sale_price || product.price || 0);
  const originalPrice = parseFloat(
    product.original_price || product.price || salePrice
  );
  const savings = originalPrice - salePrice;
  const savingsPercent =
    originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  // Stock and quantity
  const remainingQty = parseInt(
    product.remaining_quantity || product.stock_quantity || 0
  );
  const maxQty = parseInt(product.max_quantity || 100);
  const soldQty = parseInt(product.sold_quantity || 0);
  const soldPercentage = maxQty > 0 ? Math.round((soldQty / maxQty) * 100) : 0;

  // Rating
  const rating = parseFloat(product.rating || product.product_rating || 4.5);

  // Variant ID
  const variantId =
    product.variant_id || product.product_variant_id || product.id;

  const handleBuyNow = (e) => {
    e.stopPropagation();

    if (!accessToken) {
      alert("Please login to purchase");
      navigate("/auth");
      return;
    }

    setShowVariantModal(true);
  };

  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();

    if (!accessToken) {
      alert("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    if (!variantId) {
      alert("Product variant not available");
      return;
    }

    setAdding(true);
    try {
      const success = await addItem(variantId, 1, accessToken);

      if (success) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart. Please try again.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleClick = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper} onClick={handleClick}>
          <img
            src={
              firstImage || "https://via.placeholder.com/300x300?text=Product"
            }
            alt={productName}
            className={styles.image}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300?text=Product";
            }}
          />
          {savingsPercent > 0 && (
            <div className={styles.discountBadge}>
              <Flame size={16} />-{savingsPercent}%
            </div>
          )}
          {remainingQty < 10 && remainingQty > 0 && (
            <div className={styles.lowStockBadge}>
              Only {remainingQty} left!
            </div>
          )}
        </div>

        <div className={styles.content}>
          <h3 className={styles.productName} onClick={handleClick}>
            {productName}
          </h3>

          <div className={styles.rating}>
            <Star className="fill-yellow-400 text-yellow-400" size={16} />
            <span className={styles.ratingText}>{rating.toFixed(2)}</span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.salePrice}>
              ₦
              {salePrice.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {originalPrice > salePrice && (
              <span className={styles.originalPrice}>
                ₦
                {originalPrice.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>

          <div className={styles.progressSection} onClick={handleClick}>
            <div className={styles.progressLabels}>
              <span>Sold: {soldPercentage}%</span>
              <span>{remainingQty} left</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
              />
            </div>
          </div>

          {saleEndTime && (
            <div className={styles.countdown} onClick={handleClick}>
              <div className={styles.countdownContent}>
                <Clock size={16} className="text-red-500" />
                <div className={styles.countdownDigits}>
                  <span className={styles.countdownDigit}>
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className={styles.countdownDigit}>
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className={styles.countdownDigit}>
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
            disabled={adding || remainingQty === 0 || saleEnded}
          >
            {adding
              ? "Adding..."
              : saleEnded
              ? "Sale Ended"
              : remainingQty === 0
              ? "Sold Out"
              : "Buy Now"}
          </button>
        </div>
      </div>

      {showVariantModal && (
        <ProductVariantModal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          product={product}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default FlashSaleCard;
