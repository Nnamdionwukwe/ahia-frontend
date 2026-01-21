import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import styles from "./SeasonalSaleDetail.module.css";
import SeasonalSaleCard from "../../components/SeasonalSaleCard/SeasonalSaleCard";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SeasonalSaleDetail = () => {
  const { id, saleId } = useParams(); // Get both id and saleId
  const navigate = useNavigate();

  // Use whichever param is available (for flexibility)
  const activeSaleId = saleId || id;

  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    if (!sale || !sale.end_time) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(sale.end_time);
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [sale]);

  // Fetch sale and products
  useEffect(() => {
    // Check if activeSaleId exists
    if (!activeSaleId || activeSaleId === "undefined") {
      console.error("❌ Invalid saleId:", activeSaleId);
      setError("Invalid sale ID");
      setLoading(false);
      return;
    }

    fetchSeasonalSaleData();
  }, [activeSaleId]);

  const fetchSeasonalSaleData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching seasonal sale data for: ${activeSaleId}`);

      // Fetch sale details
      const saleRes = await axios.get(
        `${API_URL}/api/seasonal-sales/${activeSaleId}`
      );
      console.log("📌 Sale response:", saleRes.data);

      const saleData = saleRes.data?.seasonalSale || saleRes.data;
      setSale(saleData);

      console.log("✅ Sale data set:", saleData);

      // Fetch products for this sale
      const productsRes = await axios.get(
        `${API_URL}/api/seasonal-sales/${activeSaleId}/products`,
        { params: { limit: 100, sort: "popularity" } }
      );

      console.log("📌 Products response structure:", {
        isArray: Array.isArray(productsRes.data),
        hasProducts: !!productsRes.data?.products,
        hasData: !!productsRes.data?.data,
        fullResponse: productsRes.data,
      });

      // Extract products from response
      let productsData = [];

      if (Array.isArray(productsRes.data)) {
        productsData = productsRes.data;
        console.log("✅ Using direct array response");
      } else if (
        productsRes.data?.products &&
        Array.isArray(productsRes.data.products)
      ) {
        productsData = productsRes.data.products;
        console.log("✅ Using .products array");
      } else if (
        productsRes.data?.data &&
        Array.isArray(productsRes.data.data)
      ) {
        productsData = productsRes.data.data;
        console.log("✅ Using .data array");
      } else {
        console.warn("❌ No products array found in response");
        productsData = [];
      }

      console.log(
        `📊 Products array (${productsData.length} items):`,
        productsData
      );

      // Validate and filter products
      const validProducts = productsData.filter((p, idx) => {
        if (!p) {
          console.warn(`⚠️ Product at index ${idx} is null/undefined`);
          return false;
        }
        if (!p.id) {
          console.warn(`⚠️ Product at index ${idx} missing ID:`, p);
          return false;
        }
        return true;
      });

      console.log(
        `✅ Valid products after filtering (${validProducts.length}):`,
        validProducts
      );

      setProducts(validProducts);
    } catch (err) {
      console.error("❌ Error fetching seasonal sale:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load seasonal sale"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Loading seasonal sale...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertCircle size={48} />
          <h2>Oops! Something went wrong</h2>
          <p>{error || "Seasonal sale not found"}</p>
          <button onClick={() => navigate("/")} className={styles.backBtn}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <div className={styles.container}>
      {/* Sale Banner */}
      <div
        className={styles.saleBanner}
        style={{
          background: sale.banner_color
            ? `linear-gradient(135deg, ${sale.banner_color}dd, ${sale.banner_color}ff)`
            : "linear-gradient(135deg, #10b981, #06b6d4)",
        }}
      >
        <div className={styles.bannerContent}>
          <div className={styles.saleInfo}>
            <div className={styles.header}>
              <button
                onClick={() => navigate(-1)}
                className={styles.backButton}
              >
                <ArrowLeft size={24} />
              </button>
              <div className={styles.titleSection}>
                <h1 className={styles.saleTitle}>{sale.name}</h1>
                {sale.season && (
                  <span className={styles.seasonBadge}>{sale.season}</span>
                )}
              </div>
            </div>

            {sale.description && (
              <p className={styles.saleDescription}>{sale.description}</p>
            )}

            <div className={styles.saleBadges}>
              <span className={styles.discountBadge}>
                Up to {sale.discount_percentage || 30}% OFF
              </span>
              <span className={styles.productBadge}>
                {products.length} products
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className={styles.timerSection}>
            <div className={styles.timerBox}>
              <Calendar className={styles.timerIcon} size={24} />
              <div className={styles.timerContent}>
                <span className={styles.timerLabel}>
                  {isExpired ? "Sale Ended" : "Ends in"}
                </span>
                {!isExpired && (
                  <div className={styles.timer}>
                    {timeLeft.days > 0 && (
                      <>
                        <span className={styles.timerDigit}>
                          {String(timeLeft.days).padStart(2, "0")}d
                        </span>
                        <span> </span>
                      </>
                    )}
                    <span className={styles.timerDigit}>
                      {String(timeLeft.hours).padStart(2, "0")}h
                    </span>
                    <span> </span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.minutes).padStart(2, "0")}m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.content}>
        <div className={styles.productsSection}>
          {Array.isArray(products) && products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map((product) => {
                // Double-check product validity
                if (!product || !product.id) {
                  return null;
                }

                return (
                  <SeasonalSaleCard
                    key={product.id}
                    product={product}
                    sale={sale}
                  />
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <AlertCircle size={48} />
              <h3>No Products Available</h3>
              <p>This seasonal sale currently has no products.</p>
              <button onClick={() => navigate("/")} className={styles.backBtn}>
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sale Info Footer */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <h3>Seasonal Sale</h3>
          <p>Don't miss out on these amazing deals!</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalSaleDetail;
