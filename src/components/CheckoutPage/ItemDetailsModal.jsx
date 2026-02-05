import React, { useState } from "react";
import { X, ShoppingCart, Clock, AlertCircle } from "lucide-react";
import styles from "./ItemDetailsModal.module.css";

const ItemDetailsModal = ({ items, onClose, isDarkMode }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [itemQuantities, setItemQuantities] = useState(
    items.reduce((acc, _, idx) => {
      acc[idx] = 1;
      return acc;
    }, {}),
  );

  const currentItem = items[selectedItemIndex];

  const handleQuantityChange = (index, delta) => {
    setItemQuantities((prev) => ({
      ...prev,
      [index]: Math.max(1, (prev[index] || 1) + delta),
    }));
  };

  const calculatePrice = (item) => {
    const basePrice = parseInt(item.price || item.last_day_price || 0);
    const discount = item.discount_amount || 0;
    return Math.max(0, basePrice - discount);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        {/* Item Details */}
        <div className={styles.itemContainer}>
          {/* Main Image */}
          <div className={styles.imageSection}>
            <img
              src={currentItem.image_url || currentItem.image}
              alt={currentItem.name}
              className={styles.mainImage}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400?text=No+Image";
              }}
            />
            {parseInt(currentItem.available_stock || currentItem.stock || 0) <=
              20 && <div className={styles.stockBadge}>ALMOST SOLD OUT</div>}
          </div>

          {/* Item Info */}
          <div className={styles.infoSection}>
            <h2 className={styles.itemTitle}>{currentItem.name}</h2>

            {/* Specifications */}
            <div className={styles.specs}>
              {currentItem.label_size && (
                <p>
                  <span className={styles.specLabel}>Label size:</span>
                  {currentItem.label_size}
                </p>
              )}
              {currentItem.color && (
                <p>
                  <span className={styles.specLabel}>Color:</span>
                  {currentItem.color}
                </p>
              )}
              {currentItem.quantity && (
                <p>
                  <span className={styles.specLabel}>Quantity:</span>
                  {currentItem.quantity}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className={styles.pricingSection}>
              {/* Extra discount */}
              {currentItem.extra_discount && (
                <div className={styles.extraDiscount}>
                  <span>Extra {currentItem.extra_discount} off</span>
                  <span className={styles.expiryTime}>Ends in 11:21:03</span>
                </div>
              )}

              {/* Last day price */}
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Last day</span>
                <div className={styles.priceGroup}>
                  <span className={styles.currentPrice}>
                    ₦{calculatePrice(currentItem).toLocaleString()}
                  </span>
                  {currentItem.original_price && (
                    <span className={styles.originalPrice}>
                      ₦{parseInt(currentItem.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* After promos */}
              {currentItem.after_promo_price && (
                <p className={styles.afterPromo}>
                  after applying promos to ₦
                  {parseInt(currentItem.after_promo_price).toLocaleString()}
                </p>
              )}
            </div>

            {/* Alert Messages */}
            <div className={styles.alerts}>
              {currentItem.seller_vacation && (
                <div className={styles.alertItem}>
                  <AlertCircle size={18} />
                  <span>{currentItem.seller_vacation}</span>
                </div>
              )}
              {currentItem.preorder_info && (
                <div className={styles.alertItem}>
                  <Clock size={18} />
                  <span>{currentItem.preorder_info}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className={styles.quantitySection}>
              <label>Quantity:</label>
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(selectedItemIndex, -1)}
                >
                  −
                </button>
                <input
                  type="number"
                  value={itemQuantities[selectedItemIndex] || 1}
                  onChange={(e) =>
                    setItemQuantities((prev) => ({
                      ...prev,
                      [selectedItemIndex]: Math.max(
                        1,
                        parseInt(e.target.value) || 1,
                      ),
                    }))
                  }
                  className={styles.quantityInput}
                />
                <button
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(selectedItemIndex, 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Item List Carousel */}
        <div className={styles.itemCarousel}>
          <h3 className={styles.carouselTitle}>Your items ({items.length})</h3>
          <div className={styles.itemList}>
            {items.map((item, idx) => (
              <button
                key={idx}
                className={`${styles.itemCard} ${
                  selectedItemIndex === idx ? styles.active : ""
                }`}
                onClick={() => setSelectedItemIndex(idx)}
              >
                <div className={styles.itemCardImage}>
                  <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80?text=No+Image";
                    }}
                  />
                  {parseInt(item.available_stock || item.stock || 0) <= 20 && (
                    <div className={styles.cardBadge}>Almost sold out</div>
                  )}
                </div>
                <div className={styles.itemCardInfo}>
                  <p className={styles.itemCardName}>
                    {item.name.substring(0, 30)}...
                  </p>
                  <p className={styles.itemCardPrice}>
                    ₦{calculatePrice(item).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Summary */}
        <div className={styles.footerSummary}>
          <div className={styles.summaryInfo}>
            <p className={styles.summaryTotal}>
              ₦
              {(
                calculatePrice(currentItem) *
                (itemQuantities[selectedItemIndex] || 1)
              ).toLocaleString()}
            </p>
            <p className={styles.summaryQty}>
              x{itemQuantities[selectedItemIndex] || 1}
            </p>
          </div>
          <button className={styles.addToCartBtn}>
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
