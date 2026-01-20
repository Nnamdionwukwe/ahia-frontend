import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import styles from "./SeasonalSaleCard.module.css";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import ProductVariantModal from "../ProductVariantModal/ProductVariantModal";

const SeasonalSaleCard = ({ product, sale }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  // Debug: Log the sale object
  console.log("SeasonalSaleCard - sale object:", sale);
  console.log("SeasonalSaleCard - product:", product);

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!accessToken) {
      alert("Please login to add items to cart");
      navigate("/auth");
      return;
    }
    setShowVariantModal(true);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!accessToken) {
      alert("Please login to add items to cart");
      return;
    }
    const success = await addItem(product.variant_id, 1, accessToken);
    if (success) {
      alert("Added to cart!");
    }
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(sale.end_time).getTime();
      const distance = end - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sale.end_time]);

  // Calculate discount percentage
  const originalPrice = product.original_price || product.price;
  const salePrice = product.sale_price || product.price;
  const discountPercentage =
    product.discount_percentage ||
    Math.round(((originalPrice - salePrice) / originalPrice) * 100) ||
    0;

  // Get rating and review count
  const rating = parseFloat(product.rating) || 0;
  const reviewCount = parseInt(product.reviews_count) || 0;

  return (
    <>
      <div className={styles.card} onClick={handleClick}>
        <div className={styles.imageWrapper}>
          <img
            src={
              product.images?.[0] ||
              "https://via.placeholder.com/300x300?text=Product"
            }
            alt={product.name}
            className={styles.image}
          />
          <div className={styles.seasonalBadge}>
            {product?.season} Sale-{discountPercentage}%
          </div>
        </div>
        <div className={styles.content}>
          <h3 className={styles.productName}>{product.name}</h3>

          {/* Rating and Review Count */}
          <div className={styles.rating}>
            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.round(rating)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
                />
              ))}
            </div>
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({reviewCount} reviews)</span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.salePrice}>
              ₦{salePrice?.toLocaleString()}
            </span>
            {originalPrice > salePrice && (
              <span className={styles.originalPrice}>
                ₦{originalPrice?.toLocaleString()}
              </span>
            )}
          </div>

          {(timeLeft.days > 0 ||
            timeLeft.hours > 0 ||
            timeLeft.minutes > 0 ||
            timeLeft.seconds > 0) && (
            <div className={styles.timeLeftBadge}>
              Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
              {timeLeft.seconds}s
            </div>
          )}

          {/* Sold Count Progress */}
          {product.max_quantity && (
            <div className={styles.soldSection}>
              <div className={styles.soldBar}>
                <div
                  className={styles.soldProgress}
                  style={{
                    width: `${Math.round(
                      ((product.sold_quantity || 0) / product.max_quantity) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <span className={styles.soldText}>
                {product.sold_quantity || 0} sold of {product.max_quantity}
              </span>
            </div>
          )}
          <button className={styles.addToCartBtn} onClick={handleBuyNow}>
            Add to Cart
          </button>
        </div>
      </div>
      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default SeasonalSaleCard;
