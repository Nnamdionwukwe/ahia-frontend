// src/components/reviews/ChooseOrderSheet.jsx
import React, { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./ChooseOrderSheet.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const MAX_VISIBLE = 4;

function useAuthHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

// ── Single order row ──────────────────────────────────────────────────────────
function OrderRow({ order, onSelect }) {
  const visible = order.items.slice(0, MAX_VISIBLE);
  const extra = order.items.length - MAX_VISIBLE;

  return (
    <div className={styles.orderRow} onClick={() => onSelect(order)}>
      <div className={styles.orderContent}>
        <p className={styles.deliveredDate}>
          Delivered on {order.deliveredDate}
        </p>
        <div className={styles.imagesRow}>
          {visible.map((item, i) => (
            <div key={item.id || i} className={styles.thumbWrap}>
              <img
                src={item.image || "https://via.placeholder.com/80?text=IMG"}
                alt={item.name || ""}
                className={styles.thumb}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80?text=IMG";
                }}
              />
              {/* +N overlay on last visible thumb */}
              {i === MAX_VISIBLE - 1 && extra > 0 && (
                <div className={styles.extraOverlay}>+{extra}</div>
              )}
            </div>
          ))}
        </div>
        {/* Item names preview — first 2 */}
        {order.items.length > 0 && (
          <p className={styles.itemNames}>
            {order.items
              .slice(0, 2)
              .map((it) => it.name)
              .filter(Boolean)
              .join(", ")}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
        )}
      </div>
      <ChevronRight size={20} className={styles.chevron} />
    </div>
  );
}

// ── Main Sheet ────────────────────────────────────────────────────────────────
export default function ChooseOrderSheet({ onClose }) {
  const navigate = useNavigate();
  const headers = useAuthHeaders();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch: GET /api/reviews/user/orders
  // Returns orders that are delivered/completed — exactly the ones that can be reviewed
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/api/reviews/user/orders`, {
          headers,
        });
        if (res.data.success) {
          setOrders(res.data.orders || []);
        } else {
          setError("Could not load orders.");
        }
      } catch (err) {
        console.error("ChooseOrderSheet fetch error:", err.message);
        setError(err.response?.data?.error || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Pass the full order (id + items with product ids, names, images) to LeaveAllReviews
  const handleSelect = (order) => {
    onClose();
    navigate("/leave-all-reviews", { state: { order } });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className={styles.handle} />

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Choose an order to review all items of it
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.stateWrap}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading your orders…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.stateWrap}>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryBtn}
              onClick={() => {
                setError("");
                setLoading(true);
                axios
                  .get(`${API_URL}/api/reviews/user/orders`, { headers })
                  .then((res) => {
                    setOrders(res.data.orders || []);
                  })
                  .catch(() => setError("Failed to load orders."))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className={styles.stateWrap}>
            <p className={styles.stateText}>
              No delivered orders to review yet.
            </p>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className={styles.list}>
            {orders.map((order, i) => (
              <React.Fragment key={order.id}>
                <OrderRow order={order} onSelect={handleSelect} />
                {i < orders.length - 1 && <div className={styles.divider} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
