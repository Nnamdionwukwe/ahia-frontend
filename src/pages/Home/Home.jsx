import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import SeasonalSaleSection from "../../components/SeasonalSaleSection/SeasonalSaleSection";
import FlashSaleSection from "../../components/FlashSaleSection/FlashSaleSection";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import Navigation from "../../components/Navigation/Navigation";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./Home.module.css";
import ProductCardNavigation from "../../components/Navigation/ProductCardNavigation";

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

      console.log("🔄 Fetching shuffled products from API...");

      // ✅ Construct URL with shuffle parameter
      const baseUrl = `${API_URL}/api/products`;
      const params = new URLSearchParams({
        limit: "50",
        sort: "shuffle", // ✅ This tells backend to shuffle
      });

      if (category) {
        params.append("category", category);
      }

      const productsUrl = `${baseUrl}?${params.toString()}`;
      console.log("📡 Fetching from:", productsUrl);

      // Fetch all data in parallel
      const [flashSalesRes, seasonalSalesRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/flash-sales/active`),
        axios.get(`${API_URL}/api/seasonal-sales/active`),
        axios.get(productsUrl),
      ]);

      console.log("📦 Full Products Response:", productsRes.data);

      // Process Flash Sales
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

      // Process Seasonal Sales
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

      // ✅ Process Regular Products - CRITICAL FIX
      let regularProducts = [];

      console.log("🔍 Response structure:", {
        hasProducts: !!productsRes.data?.products,
        hasData: !!productsRes.data?.data,
        isArray: Array.isArray(productsRes.data),
        keys: Object.keys(productsRes.data || {}),
      });

      // Check response structure
      if (productsRes.data?.products) {
        regularProducts = productsRes.data.products;
        console.log("✅ Found products in .products");
      } else if (productsRes.data?.data) {
        regularProducts = productsRes.data.data;
        console.log("✅ Found products in .data");
      } else if (Array.isArray(productsRes.data)) {
        regularProducts = productsRes.data;
        console.log("✅ Found products in array");
      }

      setProducts(regularProducts);

      // ✅ Log shuffle information
      const shuffled = productsRes.data?.shuffled;
      const shuffleTime =
        productsRes.data?.shuffleTime || productsRes.data?.timestamp;

      console.log("✅ Products loaded:", regularProducts.length);
      console.log("🔀 Shuffled:", shuffled);
      console.log("⏰ Shuffle time:", shuffleTime);

      // Log first 3 product IDs to verify shuffle
      if (regularProducts.length > 0) {
        console.log(
          "📦 First 3 products:",
          regularProducts.slice(0, 3).map((p) => ({ id: p.id, name: p.name }))
        );
      }

      // Alert based on shuffle status
      if (shuffled) {
        console.log("✅✅✅ Products successfully shuffled!");
      } else {
        console.warn("⚠️⚠️⚠️ Products were NOT shuffled by backend");
        console.warn("Check backend getAllProducts function");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      console.error("❌ Error response:", err.response?.data);
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

  // const fetchAllData = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     console.log("🔄 Fetching shuffled products from API...");

  //     // Fetch all data in parallel
  //     const [flashSalesRes, seasonalSalesRes, productsRes] = await Promise.all([
  //       axios.get(`${API_URL}/api/flash-sales/active`),
  //       axios.get(`${API_URL}/api/seasonal-sales/active`),
  //       axios.get(
  //         category
  //           ? `${API_URL}/api/products?category=${category}&limit=50`
  //           : `${API_URL}/api/products?limit=50`
  //       ),
  //     ]);

  //     // Process Flash Sales
  //     let flashSales = [];
  //     if (Array.isArray(flashSalesRes.data)) {
  //       flashSales = flashSalesRes.data;
  //     } else if (flashSalesRes.data?.flashSales) {
  //       flashSales = flashSalesRes.data.flashSales;
  //     }
  //     setActiveFlashSales(flashSales);

  //     // Fetch products for each flash sale
  //     const flashProductsData = {};
  //     if (flashSales.length > 0) {
  //       await Promise.all(
  //         flashSales.map(async (sale) => {
  //           try {
  //             const response = await axios.get(
  //               `${API_URL}/api/flash-sales/${sale.id}/products`,
  //               { params: { limit: 8, sort: "popularity" } }
  //             );

  //             let products = [];
  //             if (Array.isArray(response.data)) {
  //               products = response.data;
  //             } else if (response.data?.products) {
  //               products = response.data.products;
  //             }

  //             flashProductsData[sale.id] = products;
  //           } catch (err) {
  //             console.error(
  //               `Error fetching flash sale ${sale.id} products:`,
  //               err.message
  //             );
  //             flashProductsData[sale.id] = [];
  //           }
  //         })
  //       );
  //     }
  //     setFlashSaleProducts(flashProductsData);

  //     // Process Seasonal Sales
  //     let seasonalSales = [];
  //     if (Array.isArray(seasonalSalesRes.data)) {
  //       seasonalSales = seasonalSalesRes.data;
  //     } else if (seasonalSalesRes.data?.seasonalSales) {
  //       seasonalSales = seasonalSalesRes.data.seasonalSales;
  //     }
  //     setActiveSeasonalSales(seasonalSales);

  //     // Fetch products for each seasonal sale
  //     const seasonalProductsData = {};
  //     if (seasonalSales.length > 0) {
  //       await Promise.all(
  //         seasonalSales.map(async (sale) => {
  //           try {
  //             const response = await axios.get(
  //               `${API_URL}/api/seasonal-sales/${sale.id}/products`,
  //               { params: { limit: 12 } }
  //             );

  //             let products = [];
  //             if (Array.isArray(response.data)) {
  //               products = response.data;
  //             } else if (response.data?.products) {
  //               products = response.data.products;
  //             }

  //             seasonalProductsData[sale.id] = products;
  //           } catch (err) {
  //             console.error(
  //               `Error fetching seasonal sale ${sale.id} products:`,
  //               err.message
  //             );
  //             seasonalProductsData[sale.id] = [];
  //           }
  //         })
  //       );
  //     }
  //     setSeasonalSaleProducts(seasonalProductsData);

  //     // Process Regular Products
  //     let regularProducts = [];
  //     if (Array.isArray(productsRes.data)) {
  //       regularProducts = productsRes.data;
  //     } else if (productsRes.data?.data) {
  //       regularProducts = productsRes.data.data;
  //     } else if (productsRes.data?.products) {
  //       regularProducts = productsRes.data.products;
  //     }

  //     setProducts(regularProducts);

  //     // Log shuffle confirmation
  //     console.log("✅ Products loaded:", regularProducts.length);
  //     console.log("🔀 Shuffled:", productsRes.data?.shuffled);
  //     console.log("⏰ Shuffle time:", productsRes.data?.shuffleTime);

  //     // Log first 3 product IDs to verify shuffle
  //     if (regularProducts.length > 0) {
  //       console.log(
  //         "📦 First 3 products:",
  //         regularProducts.slice(0, 3).map((p) => ({ id: p.id, name: p.name }))
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //     const errorMessage =
  //       err.response?.data?.error ||
  //       err.response?.data?.details ||
  //       err.message ||
  //       "Failed to load data";
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        {activeSeasonalSales.length > 0 && (
          <SeasonalSaleSection
            activeSeasonalSales={activeSeasonalSales}
            seasonalSaleProducts={seasonalSaleProducts}
          />
        )}

        {/* Featured Products Section */}
        {products.length > 0 && (
          <section className={styles.featuredSection}>
            {/* <ProductCardNavigation /> */}
            {/* Featured Products Section */}
            {products.length > 0 && (
              <section className={styles.featuredSection}>
                <div className={styles.sectionHeader}>
                  <ProductCardNavigation />
                  <button
                    onClick={fetchAllData}
                    className={styles.refreshBtn}
                    title="Get new random products"
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className={styles.grid}>
                  {products.slice(0, 10000).map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className={styles.grid}>
              {products.slice(0, 10000).map((product) => (
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

        {/* Empty State */}
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
