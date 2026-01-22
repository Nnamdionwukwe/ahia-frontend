import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, AlertCircle, ArrowLeft } from "lucide-react";
import styles from "./FlashSaleDetail.module.css";
import FlashSaleCard from "../components/FlashSaleCard/FlashSaleCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FlashSaleDetail = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();

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

  // Countdown timer - using correct calculation
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
    fetchFlashSaleData();
  }, [saleId]);

  const fetchFlashSaleData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching flash sale data for: ${saleId}`);

      // Fetch sale details
      const saleRes = await axios.get(`${API_URL}/api/flash-sales/${saleId}`);
      console.log("📌 Sale response:", saleRes.data);

      const saleData = saleRes.data?.flashSale || saleRes.data;
      setSale(saleData);

      console.log("✅ Sale data set:", saleData);

      // Fetch products for this sale
      const productsRes = await axios.get(
        `${API_URL}/api/flash-sales/${saleId}/products`,
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
      console.error("❌ Error fetching flash sale:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load flash sale"
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
          <p>Loading flash sale...</p>
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
          <p>{error || "Flash sale not found"}</p>
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
      {/* Header */}

      {/* Sale Banner */}
      <div className={styles.saleBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.saleInfo}>
            <div className={styles.saleTagDiv}>
              <div className={styles.header1}>
                <button
                  onClick={() => navigate(-1)}
                  className={styles.backButton}
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className={styles.saleTagDiv}>
                <h1 className={styles.saleTitle}>{sale.title}</h1>
              </div>

              <div className={styles.saleTagDiv}>
                <div className={styles.saleTag}>⚡ FLASH SALE</div>
              </div>
            </div>
            {/* {sale.description && (
              <p className={styles.saleDescription}>{sale.description}</p>
            )} */}

            {/* <div className={styles.saleBadges}>
              <span className={styles.discountBadge}>
                {sale.discount_percentage}% OFF
              </span>
              <span className={styles.productBadge}>
                {products.length} products
              </span>
            </div> */}
          </div>

          {/* Countdown Timer */}
          {/* <div className={styles.timerSection}>
            <div className={styles.timerBox}>
              <Clock className={styles.timerIcon} size={24} />
              <div className={styles.timerContent}>
                <span className={styles.timerLabel}>
                  {isExpired ? "Sale Ended" : "Ends in"}
                </span>
                {!isExpired && (
                  <div className={styles.timer}>
                    {timeLeft.days > 0 && (
                      <>
                        <span className={styles.timerDigit}>
                          {String(timeLeft.days).padStart(2, "0")}
                        </span>
                        <span>:</span>
                      </>
                    )}
                    <span className={styles.timerDigit}>
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.content}>
        <div className={styles.productsSection}>
          {/* <h2 className={styles.sectionTitle}>
            Available Products ({Array.isArray(products) ? products.length : 0})
          </h2> */}

          {Array.isArray(products) && products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.slice(0, 10000).map((product) => {
                // Double-check product validity
                if (!product || !product.id) {
                  return null;
                }

                return (
                  <FlashSaleCard
                    key={product.id}
                    product={product}
                    saleStartTime={sale.start_time}
                    saleEndTime={sale.end_time}
                  />
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <AlertCircle size={48} />
              <h3>No Products Available</h3>
              <p>This flash sale currently has no products.</p>
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
          <h3>Limited-time offer</h3>
          <p>Free shipping</p>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleDetail;
