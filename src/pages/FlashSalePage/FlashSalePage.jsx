// src/pages/FlashSalePage/FlashSalePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiClock, FiZap, FiShoppingCart } from "react-icons/fi";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./FlashSalePage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const FlashSalePage = () => {
  const { flashSaleId } = useParams();
  const navigate = useNavigate();

  const [flashSale, setFlashSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sortBy, setSortBy] = useState("popularity");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch flash sale data
  useEffect(() => {
    if (!flashSaleId || flashSaleId === "undefined") {
      setError("Invalid flash sale ID");
      setLoading(false);
      return;
    }
    fetchFlashSale();
  }, [flashSaleId, page, sortBy]);

  // Countdown timer
  useEffect(() => {
    if (!flashSale) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(flashSale.start_time);
      const end = new Date(flashSale.end_time);

      if (start > now) {
        // Upcoming - show time until start
        const diff = Math.floor((start - now) / 1000);
        setTimeRemaining({ type: "starts_in", seconds: diff });
      } else if (end > now) {
        // Active - show time remaining
        const diff = Math.floor((end - now) / 1000);
        setTimeRemaining({ type: "ends_in", seconds: diff });
      } else {
        // Ended
        setTimeRemaining({ type: "ended", seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  const fetchFlashSale = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch flash sale with products
      const response = await axios.get(
        `${API_URL}/api/flash-sales/${flashSaleId}/products`,
        {
          params: { page, limit: 20, sort: sortBy },
        }
      );

      setFlashSale(response.data.flashSale);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching flash sale:", err);
      setError(err.response?.data?.error || "Failed to load flash sale");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading flash sale...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/flash-sales")}>
            Back to Flash Sales
          </button>
        </div>
      </div>
    );
  }

  if (!flashSale) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Flash Sale Not Found</h2>
          <button onClick={() => navigate("/flash-sales")}>
            Back to Flash Sales
          </button>
        </div>
      </div>
    );
  }

  const isActive = flashSale.status === "active";
  const isUpcoming = timeRemaining?.type === "starts_in";
  const isEnded =
    timeRemaining?.type === "ended" || flashSale.status === "ended";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badge}>
            <FiZap />
            Flash Sale
          </div>
          <h1>{flashSale.title}</h1>
          {flashSale.description && <p>{flashSale.description}</p>}

          {/* Timer */}
          {timeRemaining && !isEnded && (
            <div className={styles.timer}>
              <FiClock />
              <span>
                {isUpcoming ? "Starts in: " : "Ends in: "}
                <strong>{formatTime(timeRemaining.seconds)}</strong>
              </span>
            </div>
          )}

          {isEnded && (
            <div className={styles.endedBadge}>This flash sale has ended</div>
          )}

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Products</span>
              <span className={styles.statValue}>{pagination?.total || 0}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Discount</span>
              <span className={styles.statValue}>
                Up to {flashSale.discount_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className={styles.select}
          >
            <option value="popularity">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
            <option value="stock">Most Stock</option>
          </select>
        </div>

        {pagination && (
          <div className={styles.resultsCount}>
            Showing {products.length} of {pagination.total} products
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productWrapper}>
              <ProductCard
                product={{
                  id: product.product_id,
                  name: product.name,
                  price: product.sale_price,
                  original_price: product.original_price,
                  images: product.images,
                  rating: product.rating,
                  category: product.category,
                  flashSale: {
                    discount_percent: product.discount_percent,
                    sold_percentage: product.sold_percentage,
                    remaining_quantity: product.remaining_quantity,
                  },
                }}
              />

              {/* Flash Sale Product Info */}
              <div className={styles.flashInfo}>
                <div className={styles.stockBar}>
                  <div
                    className={styles.stockProgress}
                    style={{ width: `${product.sold_percentage}%` }}
                  />
                </div>
                <div className={styles.stockText}>
                  {product.remaining_quantity > 0 ? (
                    <>
                      <span className={styles.remaining}>
                        {product.remaining_quantity} left
                      </span>
                      <span className={styles.sold}>
                        {product.sold_percentage}% sold
                      </span>
                    </>
                  ) : (
                    <span className={styles.soldOut}>SOLD OUT</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noProducts}>
          <p>No products available in this flash sale</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={styles.pageBtn}
          >
            Previous
          </button>

          <div className={styles.pageNumbers}>
            {[...Array(Math.min(pagination.pages, 5))].map((_, idx) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = idx + 1;
              } else if (page <= 3) {
                pageNum = idx + 1;
              } else if (page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + idx;
              } else {
                pageNum = page - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`${styles.pageNum} ${
                    page === pageNum ? styles.active : ""
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.pages}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashSalePage;
