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
      navigate("/auth");
      return;
    }

    if (!product.variant_id && !product.product_variant_id) {
      alert("Product variant not available");
      return;
    }

    setAdding(true);
    try {
      // Use the variant_id from product, or fallback to product_variant_id
      const variantId = product.variant_id || product.product_variant_id;
      const success = await addItem(variantId, 1, accessToken);

      if (success) {
        // Show success message
        alert("Added to cart!");
        // Optionally navigate to cart
        // navigate("/cart");
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
    navigate(`/product/${product.id}`);
  };

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(saleEndTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [saleEndTime]);

  const remainingQty = product.remaining_quantity || 0;
  const maxQty = product.max_quantity || 1;
  const soldQty = product.sold_quantity || 0;
  const soldPercentage = maxQty > 0 ? Math.round((soldQty / maxQty) * 100) : 0;
  const savings =
    (product.original_price || product.price) - product.sale_price;
  const savingsPercent = Math.round(
    (savings / (product.original_price || product.price)) * 100
  );

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper} onClick={handleClick}>
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300x300?text=Product"
          }
          alt={product.name}
          className={styles.image}
        />
        <div className={styles.discountBadge}>
          <Flame size={16} />-{savingsPercent}%
        </div>
        {remainingQty < 10 && remainingQty > 0 && (
          <div className={styles.lowStockBadge}>Only {remainingQty} left!</div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.productName}>{product.name}</h3>

        <div className={styles.rating}>
          <Star className="fill-yellow-400 text-yellow-400" size={16} />
          <span className={styles.ratingText}>{product.rating || 4.5}</span>
        </div>

        <div className={styles.priceSection}>
          <span className={styles.salePrice}>
            ₦{product.sale_price?.toLocaleString()}
          </span>
          <span className={styles.originalPrice}>
            ₦{(product.original_price || product.price)?.toLocaleString()}
          </span>
        </div>

        <div className={styles.progressSection} onClick={handleClick}>
          <div className={styles.progressLabels}>
            <span>Sold: {soldPercentage}%</span>
            <span>{remainingQty} left</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>

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

        <button
          className={styles.buyNowBtn}
          onClick={handleBuyNow}
          disabled={adding || remainingQty === 0}
        >
          {adding ? "Adding..." : remainingQty === 0 ? "Sold Out" : "Buy Now"}
        </button>
      </div>

      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default FlashSaleCard;
