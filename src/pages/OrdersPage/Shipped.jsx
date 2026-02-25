// src/pages/Orders/Shipped.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import OrderCard from "./OrderCard";
import styles from "./Shipped.module.css";

const Shipped = ({
  orders,
  loading,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();

  const filtered = orders.filter((o) => o.status === "shipped");

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={64} className={styles.emptyIcon} />
        <p>No shipped orders</p>
        <button onClick={() => navigate("/")}>Start shopping</button>
      </div>
    );
  }

  return (
    <>
      {filtered.map((order) => (
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

export default Shipped;
