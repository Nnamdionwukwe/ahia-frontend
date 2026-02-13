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
  Zap,
  TrendingDown,
} from "lucide-react";
import styles from "./FlashSaleViewModal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FlashSaleViewModal = ({ saleId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (saleId) {
      fetchSaleDetails();
      fetchSaleProducts();
      fetchAnalytics();
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
      const response = await axios.get(`${API_URL}/api/flash-sales/${saleId}`);
      setSale(response.data.flashSale);
    } catch (error) {
      console.error("Failed to fetch sale details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/flash-sales/${saleId}/products`,
        {
          params: { limit: 50, sort: "popularity" },
        },
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/flash-sales/${saleId}/analytics`,
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "scheduled":
        return styles.statusScheduled;
      case "ended":
        return styles.statusEnded;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading flash sale details...</p>
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
            <p>Flash sale not found</p>
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
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <div className={styles.flashBadge}>
                <Zap size={16} />
                FLASH SALE
              </div>
              <span
                className={`${styles.statusBadge} ${getStatusBadgeClass(sale.status)}`}
              >
                {sale.status}
              </span>
            </div>
            <h2>{sale.title}</h2>
            {sale.description && (
              <p className={styles.description}>{sale.description}</p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Time Remaining Banner */}
        {timeRemaining && sale.status === "active" && (
          <div className={styles.timeBanner}>
            <Clock size={18} />
            <span className={styles.urgentText}>
              ⚡ ENDS IN: {formatTimeRemaining(timeRemaining)}
            </span>
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
                <p className={styles.infoValue}>{products.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className={styles.analyticsSection}>
            <h3>
              <TrendingUp size={18} />
              Performance Analytics
            </h3>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Package size={20} />
                </div>
                <div>
                  <div className={styles.statLabel}>Total Products</div>
                  <div className={styles.statValue}>
                    {analytics.overview?.total_products || 0}
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <div className={styles.statLabel}>Items Sold</div>
                  <div className={styles.statValue}>
                    {(analytics.overview?.total_sold || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className={styles.statLabel}>Total Revenue</div>
                  <div className={styles.statValue}>
                    {formatCurrency(analytics.overview?.total_revenue || 0)}
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingDown size={20} />
                </div>
                <div>
                  <div className={styles.statLabel}>Discount Given</div>
                  <div className={styles.statValue}>
                    {formatCurrency(
                      analytics.overview?.total_discount_given || 0,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Average Sold Percentage */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                Average Sold: {analytics.overview?.avg_sold_percentage || 0}%
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${analytics.overview?.avg_sold_percentage || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Top Products */}
        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <div className={styles.topProductsSection}>
            <h3>
              <TrendingUp size={18} />
              Top Performing Products
            </h3>

            <div className={styles.topProductsList}>
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className={styles.topProductCard}>
                  <div className={styles.rank}>#{index + 1}</div>
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className={styles.topProductImage}
                  />
                  <div className={styles.topProductInfo}>
                    <h4>{product.name}</h4>
                    <div className={styles.topProductStats}>
                      <span className={styles.soldStat}>
                        {product.sold_quantity}/{product.max_quantity} sold
                      </span>
                      <span className={styles.percentageStat}>
                        {product.sold_percentage}%
                      </span>
                      <span className={styles.revenueStat}>
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Products List */}
        <div className={styles.productsSection}>
          <h3>
            <ShoppingCart size={18} />
            All Products ({products.length})
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
              <p>No products available in this flash sale</p>
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

export default FlashSaleViewModal;
