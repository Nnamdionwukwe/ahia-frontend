import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, ChevronRight, Filter } from "lucide-react";
import useAuthStore from "../../store/authStore";
import styles from "./OrdersPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: 10,
      };

      // Add status filter if not "all"
      if (activeFilter !== "all") {
        params.status = activeFilter;
      }

      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get status badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "processing":
        return styles.statusProcessing;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      case "pending_review":
        return styles.statusReview;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>My Orders</h1>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filters}>
        {["all", "pending", "processing", "completed", "cancelled"].map(
          (filter) => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${
                activeFilter === filter ? styles.active : ""
              }`}
              onClick={() => {
                setPage(1);
                setActiveFilter(filter);
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div
              key={order.id}
              className={styles.orderCard}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              {/* Left: Image & Date */}
              <div className={styles.orderInfo}>
                <div className={styles.imagePlaceholder}>
                  {/* Assuming items array isn't fully populated in list, using generic icon or fetching first item image if available */}
                  <Package size={32} color="#ccc" />
                </div>
                <div>
                  <p className={styles.orderId}>Order #{order.id.slice(-6)}</p>
                  <p className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Middle: Status */}
              <div className={styles.orderStatusContainer}>
                <span
                  className={`${styles.statusBadge} ${getStatusStyle(order.status)}`}
                >
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Right: Amount & Arrow */}
              <div className={styles.orderMeta}>
                <p className={styles.orderAmount}>
                  ₦{parseFloat(order.total_amount).toLocaleString()}
                </p>
                <ChevronRight size={20} className={styles.arrow} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
