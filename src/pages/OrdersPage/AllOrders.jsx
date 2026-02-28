// src/pages/Orders/AllOrders.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star } from "lucide-react";
import OrderCard from "./OrderCard";
import styles from "./AllOrders.module.css";
import {
  DotsMenu,
  ReturnWindowClosedModal,
  ReturnWindowOpenModal,
  BuyAgainSheet,
} from "./OrderModals";

const AllOrders = ({
  orders,
  loading,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onBuyAgainSheetClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();

  // Guard against undefined orders prop
  orders = orders || [];

  // ── Delivered-tab state (mirrored from Delivered.jsx) ─────────────────────
  const [returnClosedModal, setReturnClosedModal] = useState(false);
  const [returnOpenModal, setReturnOpenModal] = useState(false);
  const [returnDates, setReturnDates] = useState({
    closed: null,
    ordered: null,
  });
  const [activeOrder, setActiveOrder] = useState(null);

  const [buyAgainSheet, setBuyAgainSheet] = useState(false);
  const [buyAgainItems, setBuyAgainItems] = useState([]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartToast, setCartToast] = useState(null);

  // ── Handlers (identical to Delivered.jsx) ────────────────────────────────
  const handleReturnRefund = (order) => {
    const orderedAt = order.created_at || order.createdAt || order.ordered_at;
    const closedAt = orderedAt
      ? new Date(new Date(orderedAt).getTime() + 90 * 24 * 60 * 60 * 1000)
      : null;

    if (closedAt && closedAt > new Date()) {
      setReturnDates({ closed: closedAt, ordered: orderedAt });
      setActiveOrder(order);
      setReturnOpenModal(true);
    } else {
      setReturnDates({ closed: closedAt, ordered: orderedAt });
      setReturnClosedModal(true);
    }
  };

  const handleBuyAgain = (order) => {
    const items = (order.items || order.order_items || []).map((item) => {
      const variantId =
        item.product_variant_id || item.variant_id || item.variantId || null;
      const productId =
        item.product_id || item.productId || item.product?.id || null;
      return {
        id: item.id,
        productId,
        variantId,
        name: item.name || item.product_name || item.product?.name || "Product",
        image:
          item.images?.[0] || item.image || item.product?.images?.[0] || null,
        price: parseFloat(item.unit_price || item.price || 0),
        available: variantId != null,
        variantName:
          [item.color, item.size].filter(Boolean).join(" / ") ||
          item.variant_name ||
          null,
        stock: item.stock ?? null,
      };
    });
    setBuyAgainItems(items);
    setBuyAgainSheet(true);
  };

  const handleAddToCart = async (selectedItems) => {
    if (!selectedItems.length) return;
    setAddingToCart(true);
    const results = await Promise.all(
      selectedItems.map(async (item) => {
        const token = localStorage.getItem("accessToken");
        try {
          const payload = {
            product_variant_id: item.variantId,
            quantity: item.quantity || 1,
          };
          if (item.productId) payload.product_id = item.productId;
          if (item.image) payload.selected_image_url = item.image;
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/cart/add`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            },
          );
          const json = await res.json();
          return res.ok
            ? { success: true }
            : { success: false, error: json.error || "Failed" };
        } catch (e) {
          return { success: false, error: e.message };
        }
      }),
    );
    setAddingToCart(false);
    const failed = results.filter((r) => !r.success);
    const success = results.filter((r) => r.success);
    if (failed.length === 0) {
      showToast(
        true,
        `${success.length} item${success.length !== 1 ? "s" : ""} added to cart!`,
      );
    } else if (success.length === 0) {
      showToast(false, failed[0].error || "Failed to add items to cart.");
    } else {
      showToast(true, `${success.length} added, ${failed.length} failed.`);
    }
  };

  const showToast = (success, message) => {
    setCartToast({ success, message });
    setTimeout(() => setCartToast(null), 3000);
  };

  const handleTrack = (order) => {
    navigate(`/orders/${order._id || order.id}`);
  };

  // ── Items ready for review banner ─────────────────────────────────────────
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

      {orders.map((order) => {
        const isDelivered = order.status === "delivered";

        if (isDelivered) {
          // ── Delivered card: identical to Delivered.jsx ──────────────────
          return (
            <OrderCard
              key={order._id || order.id}
              order={order}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              onCancelClick={onCancelClick}
              onChangePaymentClick={onChangePaymentClick}
              onBuyAgainClick={() => handleBuyAgain(order)}
              onReturnRefundClick={() => handleReturnRefund(order)}
              dotsMenu={<DotsMenu onTrack={() => handleTrack(order)} />}
            />
          );
        }

        // ── All other orders: original behaviour ──────────────────────────
        return (
          <OrderCard
            key={order._id || order.id}
            order={order}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onCancelClick={onCancelClick}
            onBuyAgainClick={onBuyAgainClick}
            onBuyAgainSheetClick={onBuyAgainSheetClick}
            onChangePaymentClick={onChangePaymentClick}
            hideStatusBadge
            showShippedBanner={order.status === "shipped"}
          />
        );
      })}

      {/* ── Delivered modals (same as Delivered.jsx) ── */}
      <ReturnWindowClosedModal
        open={returnClosedModal}
        onClose={() => setReturnClosedModal(false)}
        closedDate={returnDates.closed}
        orderedDate={returnDates.ordered}
      />
      <ReturnWindowOpenModal
        open={returnOpenModal}
        onClose={() => setReturnOpenModal(false)}
        orderedDate={returnDates.ordered}
        onStartReturn={() =>
          navigate("/return-refund", { state: { order: activeOrder } })
        }
      />
      <BuyAgainSheet
        open={buyAgainSheet}
        onClose={() => setBuyAgainSheet(false)}
        items={buyAgainItems}
        onAddToCart={handleAddToCart}
        loading={addingToCart}
      />
      {cartToast && (
        <div
          className={`${styles.cartToast} ${cartToast.success ? styles.cartToastSuccess : styles.cartToastError}`}
        >
          {cartToast.success ? "✓" : "✕"} {cartToast.message}
        </div>
      )}
    </>
  );
};

export default AllOrders;
