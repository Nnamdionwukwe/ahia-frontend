import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Tag, ArrowRight, TrendingUp, Package } from "lucide-react";
import styles from "./SeasonalSaleFeaturedCard.module.css";

const SeasonalSaleFeaturedCard = ({ sale, featuredProduct }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
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
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sale.end_time]);

  if (!featuredProduct) return null;

  const handleCardClick = () => {
    navigate(`/seasonal-sales/${sale.id}`);
  };

  const handleProductClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${featuredProduct.id}`);
  };

  const remainingQty = featuredProduct.remaining_quantity || 0;
  const soldQty = featuredProduct.sold_quantity || 0;
  const maxQty = featuredProduct.max_quantity || 0;
  const soldPercentage = featuredProduct.sold_percentage || 0;

  const savings = featuredProduct.original_price - featuredProduct.sale_price;
  const savingsPercent = Math.round(
    (savings / featuredProduct.original_price) * 100
  );

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Sale Tag */}
      <div
        className={styles.saleTag}
        style={{
          background: sale.banner_color
            ? `linear-gradient(135deg, ${sale.banner_color}dd, ${sale.banner_color}ff)`
            : "linear-gradient(135deg, #10b981, #06b6d4)",
        }}
      >
        <div className={styles.saleTagContent}>
          <Tag className={styles.tagIcon} size={20} />
          <span className={styles.saleTitle}>{sale.name}</span>
          {sale.season && (
            <span className={styles.seasonBadge}>{sale.season}</span>
          )}
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
            <TrendingUp size={16} />
            {savingsPercent}% OFF
          </div>

          {/* Stock Badge */}
          {remainingQty > 0 && remainingQty <= 10 && (
            <div className={styles.stockBadge}>ONLY {remainingQty} LEFT</div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          {/* Prices */}
          <div className={styles.priceSection}>
            <span className={styles.salePrice}>
              ₦{featuredProduct.sale_price?.toLocaleString()}
            </span>
            <span className={styles.originalPrice}>
              ₦{featuredProduct.original_price?.toLocaleString()}
            </span>
          </div>

          {/* Sales Stats */}
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <TrendingUp size={14} className={styles.statIcon} />
              <span className={styles.statText}>{soldQty} sold</span>
            </div>
            <div className={styles.statItem}>
              <Package size={14} className={styles.statIcon} />
              <span className={styles.statText}>
                {remainingQty}/{maxQty} left
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${soldPercentage}%`,
                  background: sale.banner_color
                    ? `linear-gradient(90deg, ${sale.banner_color}dd, ${sale.banner_color}ff)`
                    : "linear-gradient(90deg, #10b981, #06b6d4)",
                }}
              />
            </div>
            <span className={styles.progressText}>{soldPercentage}% sold</span>
          </div>

          {/* Timer */}
          <div className={styles.timerSection}>
            <Calendar size={14} className={styles.timerIcon} />
            <span className={styles.timerText}>
              {timeLeft.days > 0
                ? `${timeLeft.days}d ${timeLeft.hours}h left`
                : `${timeLeft.hours}h ${timeLeft.minutes}m left`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalSaleFeaturedCard;
