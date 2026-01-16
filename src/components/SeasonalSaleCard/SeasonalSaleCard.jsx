import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import styles from "./SeasonalSaleCard.module.css";
import { useNavigate } from "react-router-dom";

const SeasonalSaleCard = ({ product, sale }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
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
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sale.end_time]);

  const savings = product.price - product.sale_price;
  const savingsPercent = Math.round((savings / product.price) * 100);

  return (
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
          {sale.season} Sale -{savingsPercent}%
        </div>
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
            ₦{product.price?.toLocaleString()}
          </span>
        </div>

        {timeLeft.days > 0 && (
          <div className={styles.timeLeftBadge}>
            Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </div>
        )}

        <button className={styles.addToCartBtn}>Add to Cart</button>
      </div>
    </div>
  );
};

export default SeasonalSaleCard;
