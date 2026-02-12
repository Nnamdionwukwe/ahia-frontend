import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  TrendingUp,
} from "lucide-react";
import styles from "./OrderDetailsModal.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const { accessToken } = useAuthStore();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [order.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setOrderDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${order.id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      alert(`Order status updated to ${newStatus}`);
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      processing: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#666";
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Order Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Order Info Card */}
          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <h3>Order Information</h3>
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: getStatusColor(orderDetails?.order?.status),
                }}
              >
                {orderDetails?.order?.status}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Package size={18} />
                <div>
                  <span>Order ID</span>
                  <strong>
                    #{orderDetails?.order?.id?.substring(0, 12)}...
                  </strong>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Calendar size={18} />
                <div>
                  <span>Order Date</span>
                  <strong>{formatDate(orderDetails?.order?.created_at)}</strong>
                </div>
              </div>

              <div className={styles.infoItem}>
                <CreditCard size={18} />
                <div>
                  <span>Payment Method</span>
                  <strong>
                    {orderDetails?.order?.payment_method || "N/A"}
                  </strong>
                </div>
              </div>

              <div className={styles.infoItem}>
                <TrendingUp size={18} />
                <div>
                  <span>Payment Status</span>
                  <strong
                    style={{
                      color:
                        orderDetails?.order?.payment_status === "paid"
                          ? "#4caf50"
                          : "#ff9800",
                    }}
                  >
                    {orderDetails?.order?.payment_status || "pending"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className={styles.infoCard}>
            <h3>Customer Information</h3>
            <div className={styles.customerInfo}>
              <div className={styles.customerItem}>
                <User size={18} />
                <div>
                  <span>Name</span>
                  <strong>{order.user_name || "N/A"}</strong>
                </div>
              </div>
              <div className={styles.customerItem}>
                <MapPin size={18} />
                <div>
                  <span>Delivery Address</span>
                  <strong>
                    {orderDetails?.order?.delivery_address || "N/A"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className={styles.itemsSection}>
            <h3>Order Items ({orderDetails?.items?.length || 0})</h3>
            <div className={styles.itemsList}>
              {orderDetails?.items?.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <img
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <p>
                      {item.color && `Color: ${item.color}`}
                      {item.size && ` • Size: ${item.size}`}
                    </p>
                    <span className={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className={styles.itemPrice}>
                    <p>{formatCurrency(item.unit_price)}</p>
                    <span>Subtotal: {formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.summarySection}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>
                {formatCurrency(
                  (orderDetails?.order?.total_amount || 0) +
                    (orderDetails?.order?.discount_amount || 0),
                )}
              </span>
            </div>
            {orderDetails?.order?.discount_amount > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span className={styles.discount}>
                  -{formatCurrency(orderDetails?.order?.discount_amount)}
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
              <strong>
                {formatCurrency(orderDetails?.order?.total_amount)}
              </strong>
            </div>
          </div>

          {/* Status Update */}
          <div className={styles.statusUpdate}>
            <h3>Update Order Status</h3>
            <div className={styles.statusButtons}>
              <button
                onClick={() => handleStatusUpdate("processing")}
                disabled={updatingStatus}
                className={styles.statusButton}
              >
                Mark as Processing
              </button>
              <button
                onClick={() => handleStatusUpdate("shipped")}
                disabled={updatingStatus}
                className={styles.statusButton}
              >
                Mark as Shipped
              </button>
              <button
                onClick={() => handleStatusUpdate("delivered")}
                disabled={updatingStatus}
                className={styles.statusButton}
              >
                Mark as Delivered
              </button>
              <button
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={updatingStatus}
                className={`${styles.statusButton} ${styles.cancelButton}`}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
