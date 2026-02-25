// src/pages/Orders/AllOrders.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star } from "lucide-react";
import OrderCard from "./OrderCard";
import styles from "./AllOrders.module.css";

const AllOrders = ({
  orders,
  loading,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();

  const ItemsReadyForReview = () => {
    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    if (deliveredOrders.length === 0) return null;

    return (
      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h3>Items ready for review ({deliveredOrders.length})</h3>
          <button onClick={() => {}}>See all →</button>
        </div>
        <div className={styles.reviewItems}>
          {deliveredOrders.slice(0, 3).map((order) =>
            order.items?.slice(0, 1).map((item, idx) => (
              <div key={idx} className={styles.reviewItem}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                />
                <p>{item.name}</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} />
                  ))}
                </div>
              </div>
            )),
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={64} className={styles.emptyIcon} />
        <p>No orders found</p>
        <button onClick={() => navigate("/")}>Start shopping</button>
      </div>
    );
  }

  return (
    <>
      <ItemsReadyForReview />
      {orders.map((order) => (
        <OrderCard
          key={order._id || order.id}
          order={order}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          onCancelClick={onCancelClick}
          onBuyAgainClick={onBuyAgainClick}
          onChangePaymentClick={onChangePaymentClick}
        />
      ))}
    </>
  );
};

export default AllOrders;
