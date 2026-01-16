import React, { useState, useEffect } from "react";
import axios from "axios";
import { Flame, Tag, ChevronRight, AlertCircle } from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import FlashSaleCard from "../../components/FlashSaleCard/FlashSaleCard";
import SeasonalSaleCard from "../../components/SeasonalSaleCard/SeasonalSaleCard";
import styles from "./Home.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const [activeFlashSales, setActiveFlashSales] = useState([]);
  const [activeSeasonalSales, setActiveSeasonalSales] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState({});
  const [seasonalSaleProducts, setSeasonalSaleProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active flash sales
      const flashSalesRes = await axios.get(
        `${API_URL}/api/flash-sales/active`
      );
      const flashSales = Array.isArray(flashSalesRes.data)
        ? flashSalesRes.data
        : [];
      setActiveFlashSales(flashSales);

      // Fetch products for each flash sale
      for (const sale of flashSales) {
        try {
          const productsRes = await axios.get(
            `${API_URL}/api/flash-sales/${sale.id}/products`
          );
          setFlashSaleProducts((prev) => ({
            ...prev,
            [sale.id]: productsRes.data.products || [],
          }));
        } catch (err) {
          console.error(`Error fetching flash sale products:`, err);
        }
      }

      // Fetch active seasonal sales
      const seasonalSalesRes = await axios.get(
        `${API_URL}/api/seasonal-sales/active`
      );
      const seasonalSales = Array.isArray(seasonalSalesRes.data)
        ? seasonalSalesRes.data
        : [];
      setActiveSeasonalSales(seasonalSales);

      // Fetch products for each seasonal sale
      for (const sale of seasonalSales) {
        try {
          const productsRes = await axios.get(
            `${API_URL}/api/seasonal-sales/${sale.id}/products`
          );
          setSeasonalSaleProducts((prev) => ({
            ...prev,
            [sale.id]: productsRes.data.products || [],
          }));
        } catch (err) {
          console.error(`Error fetching seasonal sale products:`, err);
        }
      }

      // Fetch regular products
      const url = category
        ? `${API_URL}/api/products?category=${category}`
        : `${API_URL}/api/products`;
      const productsRes = await axios.get(url);
      setProducts(productsRes.data.data || productsRes.data.products || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error.response?.data?.error || error.message || "Failed to load data"
      );
      setActiveFlashSales([]);
      setActiveSeasonalSales([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchData} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to AHIA</h1>
          <p>Discover amazing flash deals and unbeatable prices</p>
          <div className={styles.heroButtons}>
            <button className={styles.btnPrimary}>Shop Flash Sales</button>
            <button className={styles.btnSecondary}>Browse All Products</button>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {/* Active Flash Sales */}
        {activeFlashSales.map((sale) => {
          const products = flashSaleProducts[sale.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={sale.id} className={styles.flashSaleSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <div className={`${styles.iconBox} ${styles.iconBoxRed}`}>
                    <Flame className="text-white" size={28} />
                  </div>
                  <div className={styles.titleText}>
                    <h2>{sale.title}</h2>
                    <p>Limited time only - Grab them before they're gone!</p>
                  </div>
                </div>
                <button className={styles.viewAllBtn}>
                  View All <ChevronRight />
                </button>
              </div>

              <div className={styles.grid}>
                {products.slice(0, 8).map((product) => (
                  <FlashSaleCard
                    key={product.id}
                    product={product}
                    saleEndTime={sale.end_time}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Active Seasonal Sales */}
        {activeSeasonalSales.map((sale) => {
          const products = seasonalSaleProducts[sale.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={sale.id} className={styles.flashSaleSection}>
              <div
                className={styles.seasonalBanner}
                style={{
                  background: sale.banner_color
                    ? `linear-gradient(135deg, ${sale.banner_color}20, ${sale.banner_color}40)`
                    : "linear-gradient(135deg, #10b98120, #06b6d440)",
                }}
              >
                <div className={styles.seasonalBannerContent}>
                  <div className={styles.seasonalInfo}>
                    <h2>
                      {sale.name} - {sale.season}
                    </h2>
                    <p>{sale.description}</p>
                    <div className={styles.seasonalBadges}>
                      <span className={styles.discountBadge}>
                        Up to {sale.discount_percentage}% OFF
                      </span>
                      <span className={styles.productCountBadge}>
                        {sale.product_count} products available
                      </span>
                    </div>
                  </div>
                  <div className={styles.seasonalEndDate}>
                    <div className={styles.label}>Sale ends</div>
                    <div className={styles.date}>
                      {new Date(sale.end_time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.grid}>
                {products.slice(0, 1000).map((product) => (
                  <SeasonalSaleCard
                    key={product.id}
                    product={product}
                    sale={sale}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Featured Products */}
        {products.length > 0 && (
          <section className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}>
                  <Tag className="text-white" size={28} />
                </div>
                <div className={styles.titleText}>
                  <h2>Featured Products</h2>
                  <p>Handpicked items just for you</p>
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              {products.slice(0, 10000).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeFlashSales.length === 0 &&
          activeSeasonalSales.length === 0 &&
          products.length === 0 && (
            <div className={styles.emptyState}>
              <Flame className={styles.emptyIcon} size={64} />
              <h3 className={styles.emptyTitle}>No Active Sales Right Now</h3>
              <p className={styles.emptyMessage}>
                Check back soon for amazing deals!
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Home;
