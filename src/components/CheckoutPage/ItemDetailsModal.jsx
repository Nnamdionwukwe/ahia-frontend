import React, { useState, useEffect } from "react";
import { X, AlertCircle, Clock } from "lucide-react";
import styles from "./ItemDetailsModal.module.css";

const ItemDetailsModal = ({ items, onClose, isDarkMode }) => {
  const [itemQuantities, setItemQuantities] = useState(
    items.reduce((acc, _, idx) => {
      acc[idx] = 1;
      return acc;
    }, {}),
  );

  const handleQuantityChange = (idx, delta) => {
    setItemQuantities((prev) => ({
      ...prev,
      [idx]: Math.max(1, (prev[idx] || 1) + delta),
    }));
  };

  const getItemPrice = (item) => {
    return parseInt(item.last_day_price || item.price || 0);
  };

  const getOriginalPrice = (item) => {
    return parseInt(item.original_price || 0);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2>Item details ({items.length})</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {items.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
              {/* Item Image */}
              <div className={styles.itemImage}>
                <img
                  src={item.image_url || item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />
                {parseInt(item.available_stock || item.stock || 0) <= 20 && (
                  <div className={styles.stockBadge}>ALMOST SOLD OUT</div>
                )}
              </div>

              {/* Item Details */}
              <div className={styles.itemDetails}>
                {/* Brand or Title */}
                {item.brand && (
                  <div className={styles.brand}>
                    <span>🏆</span>
                    {item.brand}
                  </div>
                )}

                {/* Product Name */}
                <h3 className={styles.productName}>{item.name}</h3>

                {/* Specs */}
                <p className={styles.specs}>
                  {item.label_size && (
                    <span>Label size: {item.label_size}</span>
                  )}
                  {item.color && <span>Color: {item.color}</span>}
                  {item.quantity && <span>Quantity: {item.quantity}</span>}
                </p>

                {/* Extra Discount */}
                {item.extra_discount && (
                  <p className={styles.extraDiscount}>
                    Extra {item.extra_discount} off | Ends in 11:07:14
                  </p>
                )}

                {/* Last day price */}
                <div className={styles.priceSection}>
                  <span className={styles.lastDayLabel}>Last day</span>
                  <span className={styles.currentPrice}>
                    ₦{getItemPrice(item).toLocaleString()}
                  </span>
                  {getOriginalPrice(item) > 0 && (
                    <span className={styles.originalPrice}>
                      ₦{getOriginalPrice(item).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* After promo */}
                {item.after_promo_price && (
                  <p className={styles.afterPromo}>
                    after applying promos to ₦
                    {parseInt(item.after_promo_price).toLocaleString()}
                  </p>
                )}

                {/* Alerts */}
                {item.seller_vacation && (
                  <div className={styles.alert}>
                    <AlertCircle size={16} />
                    <span>{item.seller_vacation}</span>
                  </div>
                )}

                {item.preorder_info && (
                  <div className={styles.alert}>
                    <Clock size={16} />
                    <span>{item.preorder_info}</span>
                  </div>
                )}

                {/* Special message */}
                {item.special_message && (
                  <p className={styles.specialMessage}>
                    {item.special_message}
                  </p>
                )}

                {/* Discount percentage */}
                {item.discount_percentage && (
                  <p className={styles.discountPercentage}>
                    {item.discount_percentage}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className={styles.quantitySection}>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.quantityBtn}
                    onClick={() => handleQuantityChange(idx, -1)}
                  >
                    −
                  </button>
                  <span className={styles.quantityValue}>
                    {itemQuantities[idx] || 1}
                  </span>
                  <button
                    className={styles.quantityDropdown}
                    onClick={() => handleQuantityChange(idx, 1)}
                  >
                    ∨
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <p className={styles.footerSubtotal}>₦237,944</p>
            <p className={styles.footerTotal}>₦112,664</p>
            <p className={styles.footerDiscount}>Applied ₦125,280 off</p>
          </div>
          <div className={styles.timer}>11:07:14</div>
          <button className={styles.submitButton}>
            Submit order ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
