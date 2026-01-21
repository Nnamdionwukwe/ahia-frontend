import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Tag, ArrowRight, TrendingUp } from "lucide-react";
import styles from "./SeasonalSaleFeaturedCard.module.css";

const SeasonalSaleFeaturedCard = ({ sale, featuredProduct }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer using correct calculation
  useEffect(() => {
    if (!sale?.end_time) {
      console.error("Sale end_time is missing:", sale);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(sale.end_time);
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately on mount
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sale?.end_time]);

  if (!featuredProduct) {
    console.warn("No featured product provided");
    return null;
  }

  const handleCardClick = () => {
    if (sale?.id) {
      navigate(`/seasonal-sales/${sale.id}`);
    } else {
      console.error("Sale ID is missing:", sale);
    }
  };

  const handleProductClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${featuredProduct.product_id || featuredProduct.id}`);
  };

  const remainingQty = featuredProduct.remaining_quantity || 0;
  const savings = featuredProduct.original_price - featuredProduct.sale_price;
  const savingsPercent = Math.round(
    (savings / featuredProduct.original_price) * 100
  );

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  // Get banner color from sale or use default
  const bannerColor = sale.banner_color || "#10b981";

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Seasonal Sale Header/Tag */}
      <div
        className={styles.saleTag}
        style={{
          background: `linear-gradient(135deg, ${bannerColor}20, ${bannerColor}40)`,
        }}
      >
        <div className={styles.saleTagContent}>
          <Tag
            className={styles.tagIcon}
            size={20}
            style={{ color: bannerColor }}
          />
          <span className={styles.saleTitle}>{sale.name}</span>
          {sale.season && (
            <span className={styles.seasonBadge}>{sale.season}</span>
          )}
          <ArrowRight
            size={18}
            className={styles.arrowIcon}
            style={{ color: bannerColor }}
          />
        </div>
      </div>

      <div className={styles.cardContent}>
        {/* Product Image */}
        <div className={styles.imageWrapper} onClick={handleCardClick}>
          <img
            src={
              featuredProduct.images?.[0] ||
              "https://via.placeholder.com/400x400"
            }
            alt={featuredProduct.name}
            className={styles.productImage}
          />

          {/* Discount Badge */}
          <div
            className={styles.discountBadge}
            style={{ background: bannerColor }}
          >
            <TrendingUp size={16} />-{savingsPercent}%
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

          {/* Countdown Timer */}
          <div className={styles.countdown}>
            <Clock size={16} />
            {isExpired ? (
              <div className={styles.expiredText}>Sale Ended</div>
            ) : (
              <div className={styles.timeDigits}>
                {timeLeft.days > 0 && (
                  <>
                    <span className={styles.timeBox}>
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <span className={styles.separator}>:</span>
                  </>
                )}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalSaleFeaturedCard;
