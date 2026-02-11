import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Copy,
  Download,
} from "lucide-react";
import styles from "./OrderDetailsPage.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // CRITICAL: Validate orderId before fetching
    if (!orderId || orderId === "undefined") {
      console.error("Invalid orderId:", orderId);
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching order details for:", orderId);

      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Order details received:", response.data);

      setOrder(response.data.order);
      setItems(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      setError(error.response?.data?.error || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const copyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff6f00",
      processing: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
      refunded: "#ff9800",
    };
    return colors[status] || "#666";
  };

  const getStatusSteps = () => {
    const allSteps = [
      { id: "pending", label: "Order placed", icon: Package },
      { id: "processing", label: "Processing", icon: Clock },
      { id: "shipped", label: "Shipped", icon: Truck },
      { id: "delivered", label: "Delivered", icon: CheckCircle },
    ];

    const statusIndex = allSteps.findIndex((step) => step.id === order?.status);
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      active: index === statusIndex,
    }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/orders")}
          >
            <ChevronLeft size={24} />
          </button>
          <h1>Order Details</h1>
          <div className={styles.iconButton} />
        </header>
        <div className={styles.error}>
          <Package size={64} className={styles.errorIcon} />
          <p>{error || "Order not found"}</p>
          <button onClick={() => navigate("/orders")}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/orders")}
        >
          <ChevronLeft size={24} />
        </button>
        <h1>Order Details</h1>
        <button className={styles.iconButton}>
          <Download size={20} />
        </button>
      </header>

      {/* Order Status */}
      <section className={styles.statusSection}>
        <div className={styles.statusHeader}>
          <h2>Order Status</h2>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </div>

        <div className={styles.timeline}>
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`${styles.timelineStep} ${
                  step.completed ? styles.completed : ""
                } ${step.active ? styles.active : ""}`}
              >
                <div className={styles.stepIcon}>
                  <Icon size={20} />
                </div>
                <p>{step.label}</p>
                {index < statusSteps.length - 1 && (
                  <div className={styles.stepLine} />
                )}
              </div>
            );
          })}
        </div>

        {order.estimated_delivery && (
          <div className={styles.estimatedDelivery}>
            <Clock size={16} />
            <span>
              Estimated delivery: {formatDate(order.estimated_delivery)}
            </span>
          </div>
        )}
      </section>

      {/* Order Info */}
      <section className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span>Order ID</span>
          <div className={styles.orderIdCopy}>
            <span>{order.id?.substring(0, 8)}...</span>
            <button onClick={copyOrderId}>
              <Copy size={16} />
              {copied && <span className={styles.copiedText}>Copied!</span>}
            </button>
          </div>
        </div>
        <div className={styles.infoRow}>
          <span>Order Date</span>
          <strong>{formatDate(order.created_at)}</strong>
        </div>
        <div className={styles.infoRow}>
          <span>Payment Method</span>
          <strong>{order.payment_method || "N/A"}</strong>
        </div>
        <div className={styles.infoRow}>
          <span>Payment Status</span>
          <strong
            style={{
              color: order.payment_status === "paid" ? "#4caf50" : "#ff6f00",
            }}
          >
            {order.payment_status || "pending"}
          </strong>
        </div>
      </section>

      {/* Delivery Address */}
      <section className={styles.addressSection}>
        <h3>
          <MapPin size={20} />
          Delivery Address
        </h3>
        <p>{order.delivery_address || "No address provided"}</p>
      </section>

      {/* Order Items */}
      <section className={styles.itemsSection}>
        <h3>Order Items ({items.length})</h3>
        {items.length === 0 ? (
          <p className={styles.noItems}>No items found</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className={styles.orderItem}>
              <img
                src={item.images?.[0] || "/placeholder.png"}
                alt={item.name || "Product"}
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              <div className={styles.itemInfo}>
                <h4>{item.name || "Product"}</h4>
                <p>
                  {item.color && `Color: ${item.color}`}
                  {item.size && ` • Size: ${item.size}`}
                </p>
                <p className={styles.itemQuantity}>Qty: {item.quantity || 1}</p>
              </div>
              <div className={styles.itemPrice}>
                <p className={styles.price}>
                  {formatCurrency(item.unit_price)}
                </p>
                <p className={styles.subtotal}>
                  Subtotal: {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Order Summary */}
      <section className={styles.summarySection}>
        <h3>Order Summary</h3>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>
            {formatCurrency(
              (order.total_amount || 0) + (order.discount_amount || 0),
            )}
          </span>
        </div>
        {order.discount_amount > 0 && (
          <div className={styles.summaryRow}>
            <span>Discount</span>
            <span className={styles.discount}>
              -{formatCurrency(order.discount_amount)}
            </span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <strong>Total</strong>
          <strong>{formatCurrency(order.total_amount)}</strong>
        </div>
      </section>

      {/* Actions */}
      <section className={styles.actionsSection}>
        {order.status === "pending" && order.payment_status === "pending" && (
          <button
            className={styles.primaryButton}
            onClick={() => navigate(`/checkout/payment?order_id=${order.id}`)}
          >
            Complete Payment
          </button>
        )}
        {order.status === "delivered" && (
          <>
            <button className={styles.secondaryButton}>Return/Refund</button>
            <button className={styles.primaryButton}>Leave a Review</button>
          </>
        )}
        {order.status === "pending" && (
          <button
            className={styles.dangerButton}
            onClick={async () => {
              if (
                window.confirm("Are you sure you want to cancel this order?")
              ) {
                try {
                  await axios.put(
                    `${API_URL}/api/orders/${order.id}/cancel`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    },
                  );
                  alert("Order cancelled successfully");
                  navigate("/orders");
                } catch (error) {
                  console.error("Failed to cancel order:", error);
                  alert("Failed to cancel order");
                }
              }
            }}
          >
            Cancel Order
          </button>
        )}
        <button
          className={styles.secondaryButton}
          onClick={() => navigate(`/support?order_id=${order.id}`)}
        >
          Contact Support
        </button>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
