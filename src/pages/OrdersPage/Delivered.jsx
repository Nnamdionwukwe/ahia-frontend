// src/pages/Orders/Delivered.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import OrderCard from "./OrderCard";
import styles from "./Delivered.module.css";
import {
  DotsMenu,
  ReturnWindowClosedModal,
  ReturnWindowOpenModal,
  BuyAgainSheet,
  PlaceOrderAgainModal,
} from "./OrderModals";
import useCartStore from "../../store/cartStore";

const Delivered = ({
  orders,
  loading,
  showMenu,
  setShowMenu,
  onCancelClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  // Return modals
  const [returnClosedModal, setReturnClosedModal] = useState(false);
  const [returnOpenModal, setReturnOpenModal] = useState(false);
  const [returnDates, setReturnDates] = useState({
    closed: null,
    ordered: null,
  });
  const [activeOrder, setActiveOrder] = useState(null);

  // Buy Again sheet (full variant picker)
  const [buyAgainSheet, setBuyAgainSheet] = useState(false);
  const [buyAgainItems, setBuyAgainItems] = useState([]);

  // Place Order Again modal (live variant preview)
  const [placeAgainModal, setPlaceAgainModal] = useState(false);
  const [placeAgainOrder, setPlaceAgainOrder] = useState(null);

  // Add-to-cart feedback
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartToast, setCartToast] = useState(null); // { success, message }

  // ── Return/Refund handler ─────────────────────────────────────────────────
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

  // ── Buy Again handler — opens BuyAgainSheet ───────────────────────────────
  const handleBuyAgain = (order) => {
    const items = (order.items || order.order_items || []).map((item) => {
      // This backend stores items by product_variant_id, not product_id
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

  // ── Place Order Again handler — opens PlaceOrderAgainModal ───────────────
  const handlePlaceAgain = (order) => {
    setPlaceAgainOrder(order);
    setPlaceAgainModal(true);
  };

  const handleConfirmPlaceAgain = () => {
    setPlaceAgainModal(false);
    navigate("/checkout");
  };

  // ── Add to cart — called by BuyAgainSheet "Add N items to cart" ──────────
  const handleAddToCart = async (selectedItems) => {
    if (!selectedItems.length) return;

    setAddingToCart(true);

    const results = await Promise.all(
      selectedItems.map(async (item) => {
        const token = localStorage.getItem("accessToken");
        try {
          // Backend requires product_variant_id (NOT NULL in carts table)
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

  // ── Track handler ─────────────────────────────────────────────────────────
  const handleTrack = (order) => {
    const id = order._id || order.id;
    navigate(`/orders/${id}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
          onChangePaymentClick={onChangePaymentClick}
          // Card buttons "Buy this again" → BuyAgainSheet (full variant picker)
          onBuyAgainClick={() => handleBuyAgain(order)}
          onReturnRefundClick={() => handleReturnRefund(order)}
          dotsMenu={
            <DotsMenu
              onTrack={() => handleTrack(order)}
              onReturnRefund={() => handleReturnRefund(order)}
              onReviews={() => navigate("/reviews")}
              // DotsMenu "Buy this again" → PlaceOrderAgainModal (live variant preview)
              onBuyAgain={() => handlePlaceAgain(order)}
            />
          }
        />
      ))}

      {/* Return window CLOSED (≥ 90 days) */}
      <ReturnWindowClosedModal
        open={returnClosedModal}
        onClose={() => setReturnClosedModal(false)}
        closedDate={returnDates.closed}
        orderedDate={returnDates.ordered}
      />

      {/* Return window OPEN (< 90 days) */}
      <ReturnWindowOpenModal
        open={returnOpenModal}
        onClose={() => setReturnOpenModal(false)}
        orderedDate={returnDates.ordered}
        onStartReturn={() =>
          navigate("/return-refund", { state: { order: activeOrder } })
        }
      />

      {/* Buy This Again sheet — full variant picker */}
      <BuyAgainSheet
        open={buyAgainSheet}
        onClose={() => setBuyAgainSheet(false)}
        items={buyAgainItems}
        onAddToCart={handleAddToCart}
        loading={addingToCart}
      />

      {/* Place Order Again modal — live product preview with variant selection */}
      <PlaceOrderAgainModal
        open={placeAgainModal}
        onClose={() => setPlaceAgainModal(false)}
        onConfirm={handleConfirmPlaceAgain}
        order={placeAgainOrder}
      />

      {/* Add-to-cart toast */}
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

export default Delivered;
