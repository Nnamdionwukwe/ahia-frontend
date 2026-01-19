import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Flame, ArrowRight } from "lucide-react";
import styles from "./FlashSaleFeaturedCard.module.css";

const FlashSaleFeaturedCard = ({ sale, featuredProduct }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
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
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sale.end_time]);

  if (!featuredProduct) return null;

  const handleCardClick = () => {
    navigate(`/flash-sales/${sale.id}`);
  };

  const handleProductClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${featuredProduct.product_id}`);
  };

  const remainingQty = featuredProduct.remaining_quantity || 0;
  const savings = featuredProduct.original_price - featuredProduct.sale_price;
  const savingsPercent = Math.round(
    (savings / featuredProduct.original_price) * 100
  );

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Flash Sale Header/Tag */}
      <div className={styles.saleTag}>
        <div className={styles.saleTagContent}>
          <Flame className={styles.flameIcon} size={20} />
          <span className={styles.saleTitle}>{sale.title}</span>
          <ArrowRight size={18} className={styles.arrowIcon} />
        </div>
      </div>

      <div className={styles.cardContent}>
        {/* Product Image */}
        <div className={styles.imageWrapper} onClick={handleProductClick}>
          <img
            src={
              featuredProduct.images?.[0] ||
              "https://via.placeholder.com/400x400"
            }
            alt={featuredProduct.name}
            className={styles.productImage}
          />

          {/* Discount Badge */}
          <div className={styles.discountBadge}>
            <Flame size={16} />-{savingsPercent}%
          </div>

          {/* Stock Badge */}
          {remainingQty > 0 && remainingQty <= 10 && (
            <div className={styles.stockBadge}>ONLY {remainingQty} LEFT</div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <h3 className={styles.productName} onClick={handleProductClick}>
            {featuredProduct.name}
          </h3>

          {/* Prices */}
          <div className={styles.priceSection}>
            <span className={styles.salePrice}>
              ₦{featuredProduct.sale_price?.toLocaleString()}
            </span>
            <span className={styles.originalPrice}>
              ₦{featuredProduct.original_price?.toLocaleString()}
            </span>
          </div>

          {/* Countdown Timer */}
          <div className={styles.countdown}>
            <Clock size={16} />
            <div className={styles.timeDigits}>
              <span className={styles.timeBox}>
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className={styles.separator}>:</span>
              <span className={styles.timeBox}>
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className={styles.separator}>:</span>
              <span className={styles.timeBox}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* View All Button */}
          <button className={styles.viewAllBtn} onClick={handleCardClick}>
            View All Deals
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleFeaturedCard;
