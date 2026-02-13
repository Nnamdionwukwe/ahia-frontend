import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import styles from "./FlashSalesManagement.module.css";
import useAuthStore from "../../store/authStore";
import FlashSaleEditModal from "./FlashSaleEditModal";
import FlashSaleViewModal from "./FlashSaleViewModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FlashSalesManagement = () => {
  const { accessToken } = useAuthStore();
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    ended: 0,
  });

  useEffect(() => {
    fetchFlashSales();
  }, [statusFilter]);

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await axios.get(`${API_URL}/api/flash-sales`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const sales = response.data.flashSales || [];
      setFlashSales(sales);
      calculateStats(sales);
    } catch (error) {
      console.error("Failed to fetch flash sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sales) => {
    const now = new Date();
    setStats({
      total: sales.length,
      active: sales.filter(
        (s) =>
          s.status === "active" &&
          new Date(s.start_time) <= now &&
          new Date(s.end_time) > now,
      ).length,
      scheduled: sales.filter((s) => s.status === "scheduled").length,
      ended: sales.filter((s) => s.status === "ended").length,
    });
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this flash sale?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/flash-sales/${saleId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Flash sale deleted successfully!");
      fetchFlashSales();
    } catch (error) {
      console.error("Failed to delete flash sale:", error);
      alert(error.response?.data?.error || "Failed to delete flash sale");
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/flash-sales/${saleId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      alert(`Flash sale status updated to ${newStatus}`);
      fetchFlashSales();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update flash sale status");
    }
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

  const getStatusColor = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (sale.status === "cancelled") return "#f44336";
    if (sale.status === "ended" || endTime <= now) return "#757575";
    if (sale.status === "active" && startTime <= now && endTime > now)
      return "#4caf50";
    if (sale.status === "scheduled" && startTime > now) return "#2196f3";
    return "#ff9800";
  };

  const getStatusLabel = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (sale.status === "cancelled") return "Cancelled";
    if (sale.status === "ended" || endTime <= now) return "Ended";
    if (sale.status === "active" && startTime <= now && endTime > now)
      return "Active";
    if (sale.status === "scheduled" && startTime > now) return "Scheduled";
    return sale.status;
  };

  const getTimeRemaining = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (startTime > now) {
      const diff = Math.floor((startTime - now) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      return `Starts in ${hours}h ${minutes}m`;
    } else if (endTime > now) {
      const diff = Math.floor((endTime - now) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      return `Ends in ${hours}h ${minutes}m`;
    }
    return "Ended";
  };

  const filteredSales = flashSales.filter(
    (sale) =>
      sale.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Flash Sales Management</h2>
          <p>{filteredSales.length} flash sales</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Flash Sale
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Zap size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Total Flash Sales</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Active</p>
            <h3 className={styles.statValue}>{stats.active}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Scheduled</p>
            <h3 className={styles.statValue}>{stats.scheduled}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <AlertCircle size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Ended</p>
            <h3 className={styles.statValue}>{stats.ended}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search flash sales..."
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
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="ended">Ended</option>
        </select>

        <button className={styles.refreshButton} onClick={fetchFlashSales}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Flash Sales Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading flash sales...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.salesTable}>
            <thead>
              <tr>
                <th>Sale Details</th>
                <th>Time Period</th>
                <th>Products</th>
                <th>Discount</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className={styles.saleCell}>
                      <div className={styles.saleIcon}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className={styles.saleTitle}>{sale.title}</p>
                        <span className={styles.saleDesc}>
                          {sale.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.timeCell}>
                      <div className={styles.timeRow}>
                        <Calendar size={14} />
                        <span>{formatDate(sale.start_time)}</span>
                      </div>
                      <div className={styles.timeRow}>
                        <Clock size={14} />
                        <span>{formatDate(sale.end_time)}</span>
                      </div>
                      <span className={styles.timeRemaining}>
                        {getTimeRemaining(sale)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.productsCell}>
                      <Package size={16} />
                      <span>{sale.total_products || 0} products</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.discountCell}>
                      <DollarSign size={16} />
                      <span className={styles.discountValue}>
                        {sale.discount_percentage || 0}% OFF
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.performanceCell}>
                      <div className={styles.performanceRow}>
                        <span>Sold:</span>
                        <strong>{sale.total_sold || 0}</strong>
                      </div>
                      <div className={styles.performanceRow}>
                        <span>Stock:</span>
                        <strong>{sale.total_quantity || 0}</strong>
                      </div>
                      {sale.total_quantity > 0 && (
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${Math.min(100, ((sale.total_sold || 0) / sale.total_quantity) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={sale.status}
                      onChange={(e) =>
                        handleUpdateStatus(sale.id, e.target.value)
                      }
                      style={{
                        backgroundColor: getStatusColor(sale),
                        color: "white",
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="ended">Ended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className={styles.statusLabel}>
                      {getStatusLabel(sale)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => setViewSale(sale)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => setSelectedSale(sale)}
                        title="Edit Sale"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteSale(sale.id)}
                        title="Delete Sale"
                        disabled={sale.status === "active"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className={styles.emptyState}>
              <Zap size={64} />
              <h3>No flash sales found</h3>
              <p>Create a new flash sale to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {(selectedSale || showCreateModal) && (
        <FlashSaleEditModal
          sale={selectedSale}
          onClose={() => {
            setSelectedSale(null);
            setShowCreateModal(false);
          }}
          onSave={fetchFlashSales}
        />
      )}

      {viewSale && (
        <FlashSaleViewModal sale={viewSale} onClose={() => setViewSale(null)} />
      )}
    </div>
  );
};

export default FlashSalesManagement;
