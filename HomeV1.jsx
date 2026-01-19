import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tag, AlertCircle } from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import SeasonalSaleCard from "../../components/SeasonalSaleCard/SeasonalSaleCard";
import FlashSaleSection from "../../components/FlashSaleSection/FlashSaleSection";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import Navigation from "../../components/Navigation/Navigation";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./Home.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  // Flash Sales State
  const [activeFlashSales, setActiveFlashSales] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState({});

  // Seasonal Sales State
  const [activeSeasonalSales, setActiveSeasonalSales] = useState([]);
  const [seasonalSaleProducts, setSeasonalSaleProducts] = useState({});

  // Regular Products State
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [category]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [flashSalesRes, seasonalSalesRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/flash-sales/active`),
        axios.get(`${API_URL}/api/seasonal-sales/active`),
        axios.get(
          category
            ? `${API_URL}/api/products?category=${category}`
            : `${API_URL}/api/products`
        ),
      ]);

      // Process Flash Sales
      const flashSales = flashSalesRes.data.flashSales || [];
      setActiveFlashSales(flashSales);

      // Fetch products for each flash sale
      const flashProductsData = {};
      await Promise.all(
        flashSales.map(async (sale) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/flash-sales/${sale.id}/products`,
              { params: { limit: 8, sort: "popularity" } }
            );
            flashProductsData[sale.id] = response.data.products || [];
          } catch (err) {
            console.error(
              `Error fetching flash sale ${sale.id} products:`,
              err
            );
            flashProductsData[sale.id] = [];
          }
        })
      );
      setFlashSaleProducts(flashProductsData);

      // Process Seasonal Sales
      const seasonalSales = seasonalSalesRes.data.seasonalSales || [];
      setActiveSeasonalSales(seasonalSales);

      // Fetch products for each seasonal sale
      const seasonalProductsData = {};
      await Promise.all(
        seasonalSales.map(async (sale) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/seasonal-sales/${sale.id}/products`,
              { params: { limit: 12 } }
            );
            seasonalProductsData[sale.id] = response.data.products || [];
          } catch (err) {
            console.error(
              `Error fetching seasonal sale ${sale.id} products:`,
              err
            );
            seasonalProductsData[sale.id] = [];
          }
        })
      );
      setSeasonalSaleProducts(seasonalProductsData);

      // Process Regular Products
      let regularProducts = [];
      if (Array.isArray(productsRes.data)) {
        regularProducts = productsRes.data;
      } else if (productsRes.data.data) {
        regularProducts = productsRes.data.data;
      } else if (productsRes.data.products) {
        regularProducts = productsRes.data.products;
      }
      setProducts(regularProducts);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading State
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

  // Error State
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchAllData} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if we have any content
  const hasContent =
    activeFlashSales.length > 0 ||
    activeSeasonalSales.length > 0 ||
    products.length > 0;

  return (
    <div className={styles.container}>
      {/* Header Components */}
      <SearchHeader />
      <Navigation />

      <div className={styles.content}>
        {/* Flash Sales Section */}
        {activeFlashSales.length > 0 && (
          <FlashSaleSection
            activeFlashSales={activeFlashSales}
            flashSaleProducts={flashSaleProducts}
          />
        )}

        {/* Seasonal Sales Section */}
        {activeSeasonalSales.length > 0 &&
          activeSeasonalSales.map((sale) => {
            const products = seasonalSaleProducts[sale.id] || [];

            // Don't render if no products
            if (products.length === 0) return null;

            return (
              <section key={sale.id} className={styles.seasonalSaleSection}>
                {/* Seasonal Sale Banner */}
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
                          {products.length} products available
                        </span>
                      </div>
                    </div>
                    <div className={styles.seasonalEndDate}>
                      <div className={styles.label}>Sale ends</div>
                      <div className={styles.date}>
                        {new Date(sale.end_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasonal Sale Products Grid */}
                <div className={styles.grid}>
                  {products.slice(0, 12).map((product) => (
                    <SeasonalSaleCard
                      key={product.id || product._id}
                      product={product}
                      sale={sale}
                    />
                  ))}
                </div>

                {/* View More Button for Seasonal Sale */}
                {products.length > 12 && (
                  <div className={styles.viewMoreContainer}>
                    <button
                      onClick={() =>
                        (window.location.href = `/seasonal-sales/${sale.id}`)
                      }
                      className={styles.viewMoreBtn}
                    >
                      View All {products.length} Products
                    </button>
                  </div>
                )}
              </section>
            );
          })}

        {/* Featured Products Section */}
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
              {products.slice(0, 20).map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>

            {/* Load More Button */}
            {products.length > 20 && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={() => {
                    // Implement load more or pagination logic
                    console.log("Load more products");
                  }}
                  className={styles.loadMoreBtn}
                >
                  Load More Products
                </button>
              </div>
            )}
          </section>
        )}

        {/* Empty State - Only show if no content at all */}
        {!hasContent && (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <AlertCircle className={styles.emptyIcon} size={64} />
              <h3 className={styles.emptyTitle}>No Active Sales Right Now</h3>
              <p className={styles.emptyMessage}>
                Check back soon for amazing deals and products!
              </p>
              <button onClick={fetchAllData} className={styles.refreshBtn}>
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
