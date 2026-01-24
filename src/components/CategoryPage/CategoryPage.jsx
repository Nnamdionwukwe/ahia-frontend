import React, { useState } from "react";
import CategorySidebar from "./CategorySidebar";
import MainContent from "../../pages/FlashSalesList/MainContent";
import ProductVariantModal from "./ProductVariantModal";
import Toast from "./Toast";
import AddToCartToast from "./AddToCartToast";
import PromoBanner from "./PromoBanner";
import SearchHeader from "../SearchHeader/SearchHeader";
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

  const products = [
    {
      id: 1,
      name: "9 Port USB Hub with HDMI",
      image:
        "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop",
      price: 14743,
      sold: 25,
      rating: 4.5,
      reviews: 77,
      discount: 65,
    },
    {
      id: 2,
      name: "Professional Rebound Running Shoes",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      price: 12982,
      originalPrice: 71266,
      sold: 126,
      rating: 5,
      reviews: 6,
      discount: 81,
      colors: [
        {
          name: "White",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        },
        {
          name: "Red",
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        },
        {
          name: "Black",
          image:
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
        },
      ],
      sizes: ["3.5", "4.5", "5", "6", "6.5", "7.5", "8.5", "9", "10"],
    },
    {
      id: 3,
      name: "Adjustable Tablet Stand",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
      price: 70509,
      sold: 1000,
      rating: 4.5,
      reviews: 77,
      discount: 45,
    },
    {
      id: 4,
      name: "Portable Laptop Stand",
      image:
        "https://images.unsplash.com/photo-1625225233840-695456021cde?w=400&h=400&fit=crop",
      price: 23835,
      sold: 811,
      rating: 4,
      reviews: 36,
      discount: 50,
    },
    {
      id: 5,
      name: "360° Photo Rotating Base",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      price: 11898,
      sold: 438,
      rating: 5,
      reviews: 17,
      discount: 70,
      hot: true,
    },
    {
      id: 6,
      name: "Classic Snapback Cap",
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      price: 2616,
      sold: 10000,
      rating: 4.5,
      reviews: 164,
      discount: 75,
    },
  ];

  const promoItems = [
    { text: "Free shipping on orders over $50", icon: "🚚" },
    { text: "30-day money-back guarantee", icon: "💰" },
    { text: "24/7 customer support", icon: "💬" },
  ];

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    console.log("Selected category:", categoryName);
  };

  //   const handleAddToCart = (product) => {
  //     if (product.colors) {
  //       setSelectedProduct(product);
  //     } else {
  //       setCartCount((prev) => prev + 1);
  //       setShowSuccess(true);
  //       setTimeout(() => setShowSuccess(false), 2000);
  //     }
  //   };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      console.log("Adding to cart:", {
        product: selectedProduct,
        color: selectedColor,
        size: selectedSize,
        quantity,
      });

      // Reset and close
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
      {/* Header */}
      <PromoBanner
        items={promoItems}
        showArrow={true}
        onBannerClick={handleBannerClick}
        sticky={true}
      />

      <div className={styles.contentWrapper}>
        {/* Left Sidebar - Categories */}

        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />

        {/* Main Content */}
        <MainContent
          shopByCategory={shopByCategory}
          products={products}
          onAddToCart={handleAddToCart}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Product Variant Modal */}
      <div>
        <button onClick={() => setSelectedProduct(products)}>
          Open Variant Modal
        </button>

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
      </div>

      {/* Success Toast */}
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
