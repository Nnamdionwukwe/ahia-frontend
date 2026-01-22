import React from "react";
import styles from "./PriceSection.module.css";

const PriceSection = ({
  selectedVariant,
  productData,
  activeSale,
  flashSale,
  seasonalSale,
  originalPrice,
  basePrice,
  variantDiscount,
  salePrice,
  actualDiscount,
}) => {
  const hasDiscount = productData.discount_percentage > 0;

  return (
    <div className={styles.priceSection}>
      <div className={styles.priceRow}>
        {(hasDiscount || activeSale || variantDiscount > 0) &&
          originalPrice > salePrice && (
            <>
              <span className={styles.originalPrice}>
                ₦{parseInt(originalPrice).toLocaleString()}
              </span>
              <span className={styles.discountBadge}>
                {actualDiscount}% OFF {activeSale ? "limited time" : ""}
              </span>
            </>
          )}
      </div>
      <div className={styles.currentPriceRow}>
        <div className={styles.currentPrice}>
          <span className={styles.currency}>₦</span>
          <span className={styles.priceAmount}>
            {parseInt(salePrice).toLocaleString()}
          </span>
        </div>
        <span className={styles.estimate}>Est.</span>
      </div>
      {selectedVariant && (
        <div className={styles.variantInfo}>
          Selected: {selectedVariant.color} - Size {selectedVariant.size}
        </div>
      )}
      <div className={styles.afterPromo}>
        after applying promos & credit to ₦
        {parseInt(salePrice * 0.9).toLocaleString()}
      </div>
    </div>
  );
};

export default PriceSection;
