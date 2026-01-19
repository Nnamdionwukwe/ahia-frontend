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

      console.log("Fetching from API_URL:", API_URL);

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

      console.log("Flash Sales Response:", flashSalesRes.data);
      console.log("Seasonal Sales Response:", seasonalSalesRes.data);
      console.log("Products Response:", productsRes.data);

      // Process Flash Sales - Handle both direct array and wrapped response
      let flashSales = [];
      if (Array.isArray(flashSalesRes.data)) {
        flashSales = flashSalesRes.data;
      } else if (flashSalesRes.data?.flashSales) {
        flashSales = flashSalesRes.data.flashSales;
      }
      setActiveFlashSales(flashSales);

      // Fetch products for each flash sale
      const flashProductsData = {};
      if (flashSales.length > 0) {
        await Promise.all(
          flashSales.map(async (sale) => {
            try {
              const response = await axios.get(
                `${API_URL}/api/flash-sales/${sale.id}/products`,
                { params: { limit: 8, sort: "popularity" } }
              );

              // Handle response structure from controller
              let products = [];
              if (Array.isArray(response.data)) {
                products = response.data;
              } else if (response.data?.products) {
                products = response.data.products;
              }

              flashProductsData[sale.id] = products;
            } catch (err) {
              console.error(
                `Error fetching flash sale ${sale.id} products:`,
                err.message
              );
              flashProductsData[sale.id] = [];
            }
          })
        );
      }
      setFlashSaleProducts(flashProductsData);

      // Process Seasonal Sales - Handle both direct array and wrapped response
      let seasonalSales = [];
      if (Array.isArray(seasonalSalesRes.data)) {
        seasonalSales = seasonalSalesRes.data;
      } else if (seasonalSalesRes.data?.seasonalSales) {
        seasonalSales = seasonalSalesRes.data.seasonalSales;
      }
      setActiveSeasonalSales(seasonalSales);

      // Fetch products for each seasonal sale
      const seasonalProductsData = {};
      if (seasonalSales.length > 0) {
        await Promise.all(
          seasonalSales.map(async (sale) => {
            try {
              const response = await axios.get(
                `${API_URL}/api/seasonal-sales/${sale.id}/products`,
                { params: { limit: 12 } }
              );

              // Handle response structure from controller
              let products = [];
              if (Array.isArray(response.data)) {
                products = response.data;
              } else if (response.data?.products) {
                products = response.data.products;
              }

              seasonalProductsData[sale.id] = products;
            } catch (err) {
              console.error(
                `Error fetching seasonal sale ${sale.id} products:`,
                err.message
              );
              seasonalProductsData[sale.id] = [];
            }
          })
        );
      }
      setSeasonalSaleProducts(seasonalProductsData);

      // Process Regular Products
      let regularProducts = [];
      if (Array.isArray(productsRes.data)) {
        regularProducts = productsRes.data;
      } else if (productsRes.data?.data) {
        regularProducts = productsRes.data.data;
      } else if (productsRes.data?.products) {
        regularProducts = productsRes.data.products;
      }
      setProducts(regularProducts);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Failed to load data";
      setError(errorMessage);
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
            const saleProducts = seasonalSaleProducts[sale.id] || [];

            // Don't render if no products
            if (saleProducts.length === 0) return null;

            // Calculate time remaining
            const now = new Date();
            const endTime = new Date(sale.end_time);
            const timeRemaining = endTime - now;
            const daysRemaining = Math.ceil(
              timeRemaining / (1000 * 60 * 60 * 24)
            );
            const hoursRemaining = Math.ceil(
              (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );

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
                        {sale.name} {sale.season && `- ${sale.season}`}
                      </h2>
                      {sale.description && <p>{sale.description}</p>}
                      <div className={styles.seasonalBadges}>
                        <span className={styles.discountBadge}>
                          Up to {sale.discount_percentage}% OFF
                        </span>
                        <span className={styles.productCountBadge}>
                          {saleProducts.length} products available
                        </span>
                      </div>
                    </div>
                    <div className={styles.seasonalEndDate}>
                      <div className={styles.label}>Sale ends in</div>
                      <div className={styles.date}>
                        {daysRemaining > 0
                          ? `${daysRemaining}d ${hoursRemaining}h`
                          : `${hoursRemaining}h`}
                      </div>
                      <div className={styles.endDateFull}>
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
                  {saleProducts.slice(0, 12).map((product) => (
                    <SeasonalSaleCard
                      key={product.id || product._id}
                      product={product}
                      sale={sale}
                    />
                  ))}
                </div>

                {/* View More Button for Seasonal Sale */}
                {saleProducts.length > 12 && (
                  <div className={styles.viewMoreContainer}>
                    <button
                      onClick={() =>
                        (window.location.href = `/seasonal-sales/${sale.id}`)
                      }
                      className={styles.viewMoreBtn}
                    >
                      View All {saleProducts.length} Products
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
