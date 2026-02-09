import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Package,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import styles from "./OrderDetailsPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderDetailsPage = () => {
  const { id } = useParams(); // Get order ID from URL
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setOrder(response.data.order);
      setItems(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);
      const response = await axios.put(
        `${API_URL}/api/orders/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data.success) {
        setOrder(response.data.order);
        alert("Order cancelled successfully");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <p>{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate("/orders")} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h1>Order Details</h1>
      </div>

      {/* Status Banner */}
      <div
        className={`${styles.statusBanner} ${
          order.status === "cancelled" ? styles.cancelled : styles.active
        }`}
      >
        {order.status === "cancelled" ? (
          <AlertTriangle size={24} />
        ) : (
          <CheckCircle size={24} />
        )}
        <div>
          <h2 className={styles.statusTitle}>
            {order.status.toUpperCase().replace("_", " ")}
          </h2>
          <p className={styles.statusSub}>
            Order Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Shipping Address */}
        <section className={styles.section}>
          <h3>Delivery Address</h3>
          <p className={styles.address}>
            <MapPin size={16} className={styles.icon} />
            {order.delivery_address}
          </p>
        </section>

        {/* Items List */}
        <section className={styles.section}>
          <h3>Items ({items.length})</h3>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <Package size={32} color="#ccc" />
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h4>{item.name}</h4>
                  <p className={styles.variant}>
                    {item.color && <span>{item.color}</span>}
                    {item.size && <span> · {item.size}</span>}
                  </p>
                  <div className={styles.itemMeta}>
                    <span className={styles.qty}>Qty: {item.quantity}</span>
                    <span className={styles.price}>
                      ₦{parseFloat(item.unit_price).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  ₦{parseFloat(item.subtotal).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Info */}
        <section className={styles.section}>
          <h3>Payment Info</h3>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₦{parseFloat(order.total_amount).toLocaleString()}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span className={styles.discount}>
                -₦{parseFloat(order.discount_amount).toLocaleString()}
              </span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>
              ₦
              {(
                parseFloat(order.total_amount) -
                parseFloat(order.discount_amount)
              ).toLocaleString()}
            </span>
          </div>
        </section>

        {/* Cancel Button (Only for pending orders) */}
        {order.status === "pending" && (
          <button
            className={styles.cancelBtn}
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
