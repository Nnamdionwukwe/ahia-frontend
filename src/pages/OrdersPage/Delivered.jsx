// src/pages/Orders/Delivered.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import OrderCard from "./OrderCard";
import styles from "./Delivered.module.css";
import {
  DotsMenu,
  ReturnWindowClosedModal,
  BuyAgainSheet,
} from "./OrderModals";

const Delivered = ({
  orders,
  loading,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [returnModal, setReturnModal] = useState(false);
  const [returnDates, setReturnDates] = useState({
    closed: null,
    ordered: null,
  });

  const [buyAgainSheet, setBuyAgainSheet] = useState(false);
  const [buyAgainItems, setBuyAgainItems] = useState([]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleTrack = (order) => {
    navigate("/track-order", { state: { orderId: order._id || order.id } });
  };

  const handleReturnRefund = (order) => {
    const orderedAt = order.created_at || order.createdAt || order.ordered_at;
    const returnWindowDays = 90;
    const closedAt = orderedAt
      ? new Date(
          new Date(orderedAt).getTime() +
            returnWindowDays * 24 * 60 * 60 * 1000,
        )
      : null;
    const windowStillOpen = closedAt && closedAt > new Date();

    if (windowStillOpen) {
      // Return window is still open — navigate to return/refund page
      navigate("/return-refund", { state: { order } });
    } else {
      // Window closed — show the modal
      setReturnDates({ closed: closedAt, ordered: orderedAt });
      setReturnModal(true);
    }
  };

  const handleBuyAgain = (order) => {
    // Map order items to the shape BuyAgainSheet expects
    const items = (order.items || order.order_items || []).map((item) => ({
      id: item.id || item.product_id || item._id,
      name: item.name || item.product_name || item.product?.name || "Product",
      image:
        item.image || item.images?.[0] || item.product?.images?.[0] || null,
      price: parseFloat(item.price || item.unit_price || 0),
      available: item.available !== false && item.stock !== 0,
      variantName: item.variant_name || item.variant?.name || null,
      stock: item.stock ?? null,
    }));

    setBuyAgainItems(items);
    setBuyAgainSheet(true);

    // Also call parent handler if provided
    onBuyAgainClick?.(order);
  };

  const handleAddToCart = (selectedItems) => {
    // selectedItems: [{ id, name, price, quantity, ... }]
    // Wire to your cart store / API here
    console.log("Adding to cart:", selectedItems);
    // e.g. selectedItems.forEach(item => cartStore.addItem(item));
  };

  // ── Filtered orders ───────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => o.status === "delivered");

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
        <p>No delivered orders</p>
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
          onBuyAgainClick={() => handleBuyAgain(order)}
          onChangePaymentClick={onChangePaymentClick}
          // Pass the DotsMenu component so OrderCard can render it
          dotsMenu={
            <DotsMenu
              onTrack={() => handleTrack(order)}
              onReturnRefund={() => handleReturnRefund(order)}
              onReviews={() => navigate("/reviews")}
              onBuyAgain={() => handleBuyAgain(order)}
            />
          }
        />
      ))}

      {/* ── Return Window Closed Modal ── */}
      <ReturnWindowClosedModal
        open={returnModal}
        onClose={() => setReturnModal(false)}
        closedDate={returnDates.closed}
        orderedDate={returnDates.ordered}
      />

      {/* ── Buy This Again Sheet ── */}
      <BuyAgainSheet
        open={buyAgainSheet}
        onClose={() => setBuyAgainSheet(false)}
        items={buyAgainItems}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default Delivered;
