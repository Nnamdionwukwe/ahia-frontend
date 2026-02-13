import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
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
import styles from "./SeasonalSalesManagement.module.css";
import useAuthStore from "../../store/authStore";
import SeasonalSaleEditModal from "./SeasonalSaleEditModal";
import SeasonalSaleViewModal from "./SeasonalSaleViewModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SeasonalSalesManagement = () => {
  const { accessToken } = useAuthStore();
  const [seasonalSales, setSeasonalSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    ended: 0,
  });

  useEffect(() => {
    fetchSeasonalSales();
  }, [statusFilter]);

  const fetchSeasonalSales = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await axios.get(`${API_URL}/api/seasonal-sales`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const sales = response.data.seasonalSales || [];
      setSeasonalSales(sales);
      calculateStats(sales);
    } catch (error) {
      console.error("Failed to fetch seasonal sales:", error);
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
          s.is_active &&
          new Date(s.start_time) <= now &&
          new Date(s.end_time) > now,
      ).length,
      upcoming: sales.filter((s) => new Date(s.start_time) > now).length,
      ended: sales.filter((s) => new Date(s.end_time) <= now).length,
    });
  };

  const handleDeleteSale = async (saleId) => {
    if (
      !window.confirm("Are you sure you want to delete this seasonal sale?")
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/seasonal-sales/${saleId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Seasonal sale deleted successfully!");
      fetchSeasonalSales();
    } catch (error) {
      console.error("Failed to delete seasonal sale:", error);
      alert(error.response?.data?.error || "Failed to delete seasonal sale");
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/seasonal-sales/${saleId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      alert(`Seasonal sale status updated to ${newStatus}`);
      fetchSeasonalSales();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update seasonal sale status");
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

  const getSeasonColor = (season) => {
    const colors = {
      spring: "#10b981",
      summer: "#f59e0b",
      fall: "#f97316",
      winter: "#3b82f6",
      christmas: "#dc2626",
      "black-friday": "#1f2937",
      "new-year": "#8b5cf6",
    };
    return colors[season?.toLowerCase()] || "#6366f1";
  };

  const getStatusColor = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) return "#f44336";
    if (endTime <= now) return "#757575";
    if (startTime <= now && endTime > now) return "#4caf50";
    if (startTime > now) return "#2196f3";
    return "#ff9800";
  };

  const getStatusLabel = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) return "Inactive";
    if (endTime <= now) return "Ended";
    if (startTime <= now && endTime > now) return "Active";
    if (startTime > now) return "Upcoming";
    return "Unknown";
  };

  const getTimeRemaining = (sale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (startTime > now) {
      const diff = Math.floor((startTime - now) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      return days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`;
    } else if (endTime > now) {
      const diff = Math.floor((endTime - now) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      return days > 0 ? `Ends in ${days}d ${hours}h` : `Ends in ${hours}h`;
    }
    return "Ended";
  };

  const filteredSales = seasonalSales.filter(
    (sale) =>
      sale.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.season?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Seasonal Sales Management</h2>
          <p>{filteredSales.length} seasonal sales</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Seasonal Sale
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Sparkles size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Total Seasonal Sales</p>
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
            <p className={styles.statLabel}>Upcoming</p>
            <h3 className={styles.statValue}>{stats.upcoming}</h3>
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
            placeholder="Search seasonal sales..."
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
          <option value="upcoming">Upcoming</option>
          <option value="ended">Ended</option>
        </select>

        <button className={styles.refreshButton} onClick={fetchSeasonalSales}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Seasonal Sales Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading seasonal sales...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.salesTable}>
            <thead>
              <tr>
                <th>Sale Details</th>
                <th>Season</th>
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
                      <div
                        className={styles.saleIcon}
                        style={{
                          backgroundColor:
                            sale.banner_color || getSeasonColor(sale.season),
                        }}
                      >
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className={styles.saleTitle}>{sale.name}</p>
                        <span className={styles.saleDesc}>
                          {sale.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.seasonBadge}
                      style={{
                        backgroundColor: getSeasonColor(sale.season),
                      }}
                    >
                      {sale.season}
                    </span>
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
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(sale),
                      }}
                    >
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
                        disabled={getStatusLabel(sale) === "Active"}
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
              <Sparkles size={64} />
              <h3>No seasonal sales found</h3>
              <p>Create a new seasonal sale to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {(selectedSale || showCreateModal) && (
        <SeasonalSaleEditModal
          sale={selectedSale}
          onClose={() => {
            setSelectedSale(null);
            setShowCreateModal(false);
          }}
          onSave={fetchSeasonalSales}
        />
      )}

      {viewSale && (
        <SeasonalSaleViewModal
          sale={viewSale}
          onClose={() => setViewSale(null)}
        />
      )}
    </div>
  );
};

export default SeasonalSalesManagement;
