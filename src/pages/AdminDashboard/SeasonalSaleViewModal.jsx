import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Calendar,
  Package,
  TrendingUp,
  Clock,
  ShoppingCart,
  Tag,
  Sparkles,
} from "lucide-react";
import styles from "./Seasonalsaleviewmodal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SeasonalSaleViewModal = ({ saleId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (saleId) {
      fetchSaleDetails();
      fetchSaleProducts();
    }
  }, [saleId]);

  useEffect(() => {
    if (sale?.end_time) {
      const timer = setInterval(() => {
        const now = new Date();
        const end = new Date(sale.end_time);
        const diff = end - now;

        if (diff <= 0) {
          setTimeRemaining(null);
          clearInterval(timer);
        } else {
          setTimeRemaining(diff);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sale?.end_time]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/seasonal-sales/${saleId}`,
      );
      setSale(response.data.seasonalSale);
    } catch (error) {
      console.error("Failed to fetch sale details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/seasonal-sales/${saleId}/products`,
        {
          params: { limit: 50 },
        },
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const formatTimeRemaining = (ms) => {
    if (!ms) return "Ended";

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateStats = () => {
    const totalSold = sale?.total_sold || 0;
    const totalQuantity = sale?.total_quantity || 0;
    const soldPercentage =
      totalQuantity > 0 ? ((totalSold / totalQuantity) * 100).toFixed(1) : 0;

    return {
      totalProducts: sale?.total_products || 0,
      totalSold,
      totalQuantity,
      soldPercentage,
      remainingQuantity: totalQuantity - totalSold,
    };
  };

  const stats = sale ? calculateStats() : null;

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading sale details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.error}>
            <p>Sale not found</p>
            <button onClick={onClose} className={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className={styles.modalHeader}
          style={{ backgroundColor: sale.banner_color || "#3498db" }}
        >
          <div className={styles.headerContent}>
            <div className={styles.seasonBadge}>
              <Sparkles size={16} />
              {sale.season}
            </div>
            <h2>{sale.name}</h2>
            {sale.description && (
              <p className={styles.description}>{sale.description}</p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Time Remaining Banner */}
        {timeRemaining && (
          <div className={styles.timeBanner}>
            <Clock size={18} />
            <span>Ends in: {formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}

        {/* Sale Info */}
        <div className={styles.saleInfo}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <Calendar size={20} />
              <div>
                <p className={styles.infoLabel}>Start Date</p>
                <p className={styles.infoValue}>
                  {formatDate(sale.start_time)}
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Calendar size={20} />
              <div>
                <p className={styles.infoLabel}>End Date</p>
                <p className={styles.infoValue}>{formatDate(sale.end_time)}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Tag size={20} />
              <div>
                <p className={styles.infoLabel}>Discount</p>
                <p className={styles.infoValue}>
                  {sale.discount_percentage || 0}% OFF
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Package size={20} />
              <div>
                <p className={styles.infoLabel}>Products</p>
                <p className={styles.infoValue}>{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className={styles.statsSection}>
          <h3>
            <TrendingUp size={18} />
            Sale Statistics
          </h3>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Quantity</div>
              <div className={styles.statValue}>
                {stats.totalQuantity.toLocaleString()}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Items Sold</div>
              <div className={styles.statValue}>
                {stats.totalSold.toLocaleString()}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Remaining</div>
              <div className={styles.statValue}>
                {stats.remainingQuantity.toLocaleString()}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Sold Percentage</div>
              <div className={styles.statValue}>{stats.soldPercentage}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${stats.soldPercentage}%`,
                  backgroundColor: sale.banner_color || "#3498db",
                }}
              ></div>
            </div>
            <p className={styles.progressText}>
              {stats.soldPercentage}% of items sold
            </p>
          </div>
        </div>

        {/* Products List */}
        <div className={styles.productsSection}>
          <h3>
            <ShoppingCart size={18} />
            Products in this Sale ({products.length})
          </h3>

          <div className={styles.productsList}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className={styles.productImage}
                />

                <div className={styles.productInfo}>
                  <h4>{product.name}</h4>
                  <p className={styles.productCategory}>{product.category}</p>

                  <div className={styles.priceSection}>
                    <span className={styles.originalPrice}>
                      {formatCurrency(product.original_price)}
                    </span>
                    <span className={styles.salePrice}>
                      {formatCurrency(product.sale_price)}
                    </span>
                    <span className={styles.discountBadge}>
                      {product.discount_percentage}% OFF
                    </span>
                  </div>

                  <div className={styles.stockInfo}>
                    <div className={styles.stockBar}>
                      <div
                        className={styles.stockFill}
                        style={{
                          width: `${product.sold_percentage || 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className={styles.stockText}>
                      {product.sold_quantity} sold •{" "}
                      {product.remaining_quantity} left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className={styles.emptyState}>
              <Package size={48} />
              <p>No products available in this sale</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonalSaleViewModal;
