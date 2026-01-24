// CategoryPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import CategorySidebar from "./CategorySidebar";
import MainContent from "../../pages/FlashSalesList/MainContent";
import ProductVariantModal from "./ProductVariantModal";
import Toast from "./Toast";
import AddToCartToast from "./AddToCartToast";
import PromoBanner from "./PromoBanner";
import SearchHeader from "../SearchHeader/SearchHeader";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./CategoryPage.module.css";

const CategoryPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(6);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showSuccess2, setShowSuccess2] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const categories = [
    { name: "Home & Kitchen", icon: "🏠" },
    { name: "Women's Clothing", icon: "👗" },
    { name: "Women's Curve Clothing", icon: "👚" },
    { name: "Women's Shoes", icon: "👠" },
    { name: "Women's Lingerie & Lounge", icon: "🩱" },
    { name: "Men's Clothing", icon: "👔" },
    { name: "Men's Shoes", icon: "👟" },
    { name: "Men's Big & Tall", icon: "🧥" },
    { name: "Men's Underwear & Sleepwear", icon: "🩲" },
    { name: "Sports & Outdoors", icon: "⚽" },
    { name: "Jewelry & Accessories", icon: "💍" },
    { name: "Beauty & Health", icon: "💄" },
  ];

  const shopByCategory = [
    { name: "Boys' Athletic", icon: "👟", hot: false },
    { name: "Photo Shooting", icon: "📸", hot: false },
    { name: "Men's Sports & Outdoor Shoes", icon: "👟", hot: false },
    { name: "Tablets, Laptops & Accessories", icon: "💻", hot: false },
    { name: "Cables & Adapters", icon: "🔌", hot: false },
    { name: "Men's Casual Shoes", icon: "👞", hot: true },
    { name: "Men's Sets", icon: "👔", hot: true },
    { name: "Audio & Radio", icon: "🎧", hot: false },
    { name: "Home Office Furniture", icon: "🪑", hot: false },
  ];

  const promoItems = [
    { text: "Free shipping on orders over $50", icon: "🚚" },
    { text: "30-day money-back guarantee", icon: "💰" },
    { text: "24/7 customer support", icon: "💬" },
  ];

  // Fetch trending products
  useEffect(() => {
    fetchTrendingProducts();
  }, [activeCategory]);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      const params = {
        sort: "rating",
        limit: 12,
      };

      if (activeCategory) {
        params.category = activeCategory;
      }

      const response = await axios.get(`${API_URL}/api/products`, { params });

      setTrendingProducts(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    console.log("Selected category:", categoryName);
  };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      console.log("Adding to cart:", {
        product: selectedProduct,
        color: selectedColor,
        size: selectedSize,
        quantity,
      });

      setSelectedProduct(null);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
      setShowSuccess2(true);
    }
  };

  const handleSelectOption = () => {
    if (selectedColor && selectedSize) {
      setCartCount((prev) => prev + quantity);
      setShowSuccess(true);
      setSelectedProduct(null);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleSortChange = () => {
    console.log("Sort clicked");
  };

  const handleBannerClick = () => {
    console.log("Banner clicked");
  };

  return (
    <div className={styles.container}>
      <SearchHeader />

      <PromoBanner
        items={promoItems}
        showArrow={true}
        onBannerClick={handleBannerClick}
        sticky={true}
      />

      <div className={styles.contentWrapper}>
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />

        <main className={styles.mainContent}>
          {/* Shop by Category Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Shop by category</h2>
            <div className={styles.categoryGrid}>
              {shopByCategory.map((cat, idx) => (
                <div key={idx} className={styles.categoryCard}>
                  {cat.hot && <span className={styles.hotBadge}>HOT</span>}
                  <div className={styles.categoryIcon}>{cat.icon}</div>
                  <p className={styles.categoryName}>{cat.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Items Section */}
          <section className={styles.section}>
            <div className={styles.trendingHeader}>
              <h2 className={styles.sectionTitle}>
                {activeCategory || "Trending items"}
              </h2>
              <button className={styles.sortButton} onClick={handleSortChange}>
                Sort by →
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading products...</div>
            ) : (
              <div className={styles.productGrid}>
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {!loading && trendingProducts.length === 0 && (
              <div className={styles.emptyState}>
                <p>No products found</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <ProductVariantModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedColor(null);
          setSelectedSize(null);
          setQuantity(1);
        }}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
        onColorSelect={setSelectedColor}
        onSizeSelect={setSelectedSize}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
      />

      <Toast
        show={showToast}
        message="Added to cart"
        type="success"
        showAlmostSoldOut={true}
        showFreeShipping={true}
        onClose={() => setShowToast(false)}
        autoHideDuration={3000}
      />

      <AddToCartToast
        show={showSuccess2}
        productName="Professional Running Shoes"
        almostSoldOut={true}
        freeShipping={true}
        onClose={() => setShowSuccess(false)}
        autoHide={true}
      />
    </div>
  );
};

export default CategoryPage;
