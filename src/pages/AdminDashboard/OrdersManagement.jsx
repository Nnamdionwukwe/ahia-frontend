import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import styles from "./OrdersManagement.module.css";
import useAuthStore from "../../store/authStore";
import OrderDetailsModal from "./OrderDetailsModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrdersManagement = () => {
  const { accessToken } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 100,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setOrders(response.data.orders || []);
      calculateStats(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    setStats({
      total: ordersData.length,
      pending: ordersData.filter((o) => o.status === "pending").length,
      processing: ordersData.filter((o) => o.status === "processing").length,
      completed: ordersData.filter((o) => o.status === "delivered").length,
      cancelled: ordersData.filter((o) => o.status === "cancelled").length,
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      alert(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
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

  const filteredOrders = orders.filter(
    (order) =>
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Orders Management</h2>
          <p>{filteredOrders.length} orders</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportButton}>
            <Download size={18} />
            Export
          </button>
          <button className={styles.refreshButton} onClick={fetchOrders}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <ShoppingBag size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Total Orders</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Pending</p>
            <h3 className={styles.statValue}>{stats.pending}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Processing</p>
            <h3 className={styles.statValue}>{stats.processing}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Completed</p>
            <h3 className={styles.statValue}>{stats.completed}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className={styles.orderIdCell}>
                      <p className={styles.orderId}>
                        #{order.id.substring(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className={styles.customerCell}>
                      <p className={styles.customerName}>
                        {order.user_name || "N/A"}
                      </p>
                      <span className={styles.customerEmail}>
                        {order.user_email || ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.date}>
                      {formatDate(order.created_at)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.itemCount}>
                      {order.item_count || 0} items
                    </span>
                  </td>
                  <td>
                    <div className={styles.amountCell}>
                      <p className={styles.amount}>
                        {formatCurrency(order.total_amount)}
                      </p>
                      {order.discount_amount > 0 && (
                        <span className={styles.discount}>
                          -{formatCurrency(order.discount_amount)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.paymentCell}>
                      <span className={styles.paymentMethod}>
                        {order.payment_method || "N/A"}
                      </span>
                      <span
                        className={`${styles.paymentStatus} ${order.payment_status === "paid" ? styles.paid : styles.unpaid}`}
                      >
                        {order.payment_status || "pending"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value)
                      }
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={styles.viewButton}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className={styles.emptyState}>
              <ShoppingBag size={64} />
              <h3>No orders found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
