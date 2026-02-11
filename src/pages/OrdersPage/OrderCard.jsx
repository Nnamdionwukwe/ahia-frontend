// src/pages/Orders/OrderCard.jsx
import React, { useState, useEffect } from "react";
import styles from "./OrderCard.module.css";

const OrderCard = ({ order, onClick, isActive }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug log to check data flow
  useEffect(() => {
    console.log("OrderCard Render:", order.id, order.items);
  }, [order]);

  return (
    <div
      className={`${styles.orderCard} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      {/* Order Items Preview */}
      <div className={styles.orderItems}>
        {order.items?.slice(0, 6).map((item, idx) => {
          const imageUrl = item.images?.[0];

          return (
            <div key={idx} className={styles.itemImage}>
              {!imageError && (
                <img
                  src={imageUrl}
                  alt={item.name || "Product"}
                  className={styles.itemImg}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.error("Image failed to load:", imageUrl);
                    e.target.onerror = null;
                    setImageError(true);
                  }}
                />
              )}
              {imageError && (
                <div className={styles.itemImageError}>
                  <span>Image Error</span>
                </div>
              )}
              {item.quantity > 1 && (
                <span className={styles.quantityBadge}>x{item.quantity}</span>
              )}
            </div>
          );
        })}
        {order.items && order.items.length > 6 && (
          <div className={styles.moreItems}>+{order.items.length - 6}</div>
        )}
      </div>

      {/* Order Summary */}
      <div className={styles.orderSummary}>
        <p className={styles.orderTotal}>
          ₦{Number(order.total_amount).toLocaleString()}
        </p>
        <p className={styles.itemCount}>
          {order.item_count || order.items?.length || 0} items
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight size={20} className={styles.chevron} />
    </div>
  );
};

export default OrderCard;
