import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProductDetail.module.css";
import ProductDetailHeader from "./ProductDetailHeader/ProductDetailHeader";
import ProductImageGallery from "./ProductImageGallery/ProductImageGallery";
import SeasonalFlashSaleBanner from "./SeasonalFlashSaleBanner/SeasonalFlashSaleBanner";
import ShippingDeliveryInfo from "./ShippingDeliveryInfo/ShippingDeliveryInfo";
import SoldCountProductTitle from "./SoldCountProductTitle/SoldCountProductTitle";
import PriceSection from "./PriceSection/PriceSection";
import ColorVariants from "./ColorVariants/ColorVariants";
import QuantitySelector from "./QuantitySelector/QuantitySelector";
import Guarantees from "./Guarantees/Guarantees";
import DeliveryDetails from "./DeliveryDetails/DeliveryDetails";
import PaymentGuarantee from "./PaymentGuarantee/PaymentGuarantee";
import ProductSpecs from "./ProductSpecs/ProductSpecs";
import ProductFeatures from "./ProductFeatures/ProductFeatures";
import ProductDescription from "./ProductDescription/ProductDescription";
import ProductImageGalleryGrid from "./ProductImageGalleryGrid/ProductImageGalleryGrid";
import ExitIntentModal from "./ExitIntentModal/ExitIntentModal";
import ReviewsTab from "./ReviewsTab/ReviewsTab";
import RecommendedTab from "./RecommendedTab/RecommendedTab";
import GalleryTab from "./GalleryTab/GalleryTab";
import FixedBottomBar from "./FixedBottomBar/FixedBottomBar";
import StickyCartAlert from "./StickyCartAlert/StickyCartAlert";
import FullscreenImageViewer from "./FullscreenImageViewer/FullscreenImageViewer";
import ReviewsPreview from "./ReviewsPreview/ReviewsPreview";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [cartCount, setCartCount] = useState(0);
  const [seasonalSale, setSeasonalSale] = useState(null);
  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Add these state variables at the top with other useState:
  const [allFlashSales, setAllFlashSales] = useState([]);
  const [allSeasonalSales, setAllSeasonalSales] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchCartCount();
      fetchSales();
    }
  }, [id]);

  // Exit intent detection
  useEffect(() => {
    let exitTimer;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !showExitModal) {
        exitTimer = setTimeout(() => {
          setShowExitModal(true);
        }, 500);
      }
    };

    const handleMouseEnter = () => {
      if (exitTimer) clearTimeout(exitTimer);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [showExitModal]);

  // Countdown timer based on actual sale end time
  useEffect(() => {
    const calculateTimeLeft = () => {
      const sale = flashSale || seasonalSale;
      if (!sale || !sale.end_time) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const now = new Date().getTime();
      const end = new Date(sale.end_time).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [flashSale, seasonalSale]);

  // Handle keyboard navigation for fullscreen image
  useEffect(() => {
    if (!showFullscreenImage) return;

    const handleKeyDown = (e) => {
      const images = product?.images || [];
      if (e.key === "ArrowRight") {
        setFullscreenImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        setFullscreenImageIndex(
          (prev) => (prev - 1 + images.length) % images.length
        );
      } else if (e.key === "Escape") {
        setShowFullscreenImage(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullscreenImage, product]);

  // Handle touch swipe
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [fullscreenSwipeProgress, setFullscreenSwipeProgress] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX);
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;

    handleSwipe(touchEndY, touchEndX);
    setFullscreenSwipeProgress(0);
  };

  const handleTouchMove = (e) => {
    if (!showFullscreenImage) return;

    const currentY = e.targetTouches[0].clientY;
    const verticalDistance = currentY - touchStartY;

    if (verticalDistance > 0) {
      // Calculate progress (0 to 1)
      const progress = Math.min(verticalDistance / 200, 1);
      setFullscreenSwipeProgress(progress);
    }
  };

  const handleSwipe = (touchEndY, touchEndX) => {
    // Vertical swipe detection (top to bottom closes fullscreen)
    const verticalDistance = touchEndY - touchStartY;
    const horizontalDistance = touchStartX - touchEndX;

    // Minimum distance to register a swipe
    const minSwipeDistance = 50;

    // Check if vertical swipe is greater than horizontal (prioritize vertical)
    if (Math.abs(verticalDistance) > Math.abs(horizontalDistance)) {
      // Swipe down to close (from any height)
      if (verticalDistance > minSwipeDistance) {
        setShowFullscreenImage(false);
        setFullscreenSwipeProgress(0);
        return;
      } else {
        // Reset if didn't swipe far enough
        setFullscreenSwipeProgress(0);
        return;
      }
    }

    // Horizontal swipe for image navigation
    if (!touchStart || !touchEnd) return;

    const images = product?.images || [];
    const isLeftSwipe = horizontalDistance > minSwipeDistance;
    const isRightSwipe = horizontalDistance < -minSwipeDistance;

    if (isLeftSwipe) {
      setFullscreenImageIndex((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe) {
      setFullscreenImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/${id}/details`);
      setProduct(response.data);

      // Set first variant as selected if available
      if (response.data.variants && response.data.variants.length > 0) {
        // Get the first color's first size variant
        const firstColor = response.data.variants[0].color;
        const firstVariantOfColor = response.data.variants.find(
          (v) => v.color === firstColor
        );
        setSelectedVariant(firstVariantOfColor);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/reviews/${id}`),
        axios.get(`${API_URL}/api/reviews/${id}/summary`),
      ]);

      setReviews(reviewsRes.data.reviews || []);
      setReviewSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // const fetchSales = async () => {
  //   try {
  //     // Fetch active seasonal sale
  //     const seasonalRes = await axios.get(
  //       `${API_URL}/api/seasonal-sales/product/${id}`
  //     );
  //     if (seasonalRes.data) {
  //       setSeasonalSale(seasonalRes.data);
  //     }

  //     // Fetch active flash sale
  //     const flashRes = await axios.get(
  //       `${API_URL}/api/flash-sales/product/${id}`
  //     );
  //     if (flashRes.data) {
  //       setFlashSale(flashRes.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching sales:", error);
  //   }
  // };
  // const fetchSales = async () => {
  //   try {
  //     // Reset sales for fresh product
  //     setSeasonalSale(null);
  //     setFlashSale(null);

  //     // Fetch active seasonal sale
  //     try {
  //       const seasonalRes = await axios.get(
  //         `${API_URL}/api/seasonal-sales/product/${id}`
  //       );
  //       if (seasonalRes.data && Object.keys(seasonalRes.data).length > 0) {
  //         setSeasonalSale(seasonalRes.data);
  //       }
  //     } catch (error) {
  //       console.log("No seasonal sale for this product");
  //       setSeasonalSale(null);
  //     }

  //     // Fetch active flash sale
  //     try {
  //       const flashRes = await axios.get(
  //         `${API_URL}/api/flash-sales/product/${id}`
  //       );
  //       if (flashRes.data && Object.keys(flashRes.data).length > 0) {
  //         setFlashSale(flashRes.data);
  //       }
  //     } catch (error) {
  //       console.log("No flash sale for this product");
  //       setFlashSale(null);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching sales:", error);
  //     setSeasonalSale(null);
  //     setFlashSale(null);
  //   }
  // };

  // Replace the existing fetchSales function with this:
  const fetchSales = async () => {
    try {
      setSeasonalSale(null);
      setFlashSale(null);
      setAllFlashSales([]);
      setAllSeasonalSales([]);

      // Fetch ALL active seasonal sales for this product
      try {
        const seasonalRes = await axios.get(
          `${API_URL}/api/seasonal-sales/product/${id}/all`
        );

        if (
          seasonalRes.data &&
          Array.isArray(seasonalRes.data) &&
          seasonalRes.data.length > 0
        ) {
          console.log("✅ Multiple seasonal sales found:", seasonalRes.data);
          setAllSeasonalSales(seasonalRes.data);
          setSeasonalSale(seasonalRes.data[0]);
        } else if (
          seasonalRes.data &&
          !Array.isArray(seasonalRes.data) &&
          Object.keys(seasonalRes.data).length > 0
        ) {
          console.log("✅ Single seasonal sale found:", seasonalRes.data);
          setAllSeasonalSales([seasonalRes.data]);
          setSeasonalSale(seasonalRes.data);
        }
      } catch (error) {
        console.log("No seasonal sales endpoint, trying single seasonal sale");
        try {
          const singleSeasonalRes = await axios.get(
            `${API_URL}/api/seasonal-sales/product/${id}`
          );
          if (
            singleSeasonalRes.data &&
            Object.keys(singleSeasonalRes.data).length > 0
          ) {
            console.log(
              "✅ Single seasonal sale (fallback):",
              singleSeasonalRes.data
            );
            setAllSeasonalSales([singleSeasonalRes.data]);
            setSeasonalSale(singleSeasonalRes.data);
          }
        } catch (err) {
          console.log("No seasonal sales for this product");
          setSeasonalSale(null);
          setAllSeasonalSales([]);
        }
      }

      // Fetch ALL active flash sales for this product
      try {
        const flashRes = await axios.get(
          `${API_URL}/api/flash-sales/product/${id}/all`
        );

        if (
          flashRes.data &&
          Array.isArray(flashRes.data) &&
          flashRes.data.length > 0
        ) {
          console.log("✅ Multiple flash sales found:", flashRes.data);
          setAllFlashSales(flashRes.data);
          setFlashSale(flashRes.data[0]);
        } else if (
          flashRes.data &&
          !Array.isArray(flashRes.data) &&
          Object.keys(flashRes.data).length > 0
        ) {
          console.log("✅ Single flash sale found:", flashRes.data);
          setAllFlashSales([flashRes.data]);
          setFlashSale(flashRes.data);
        }
      } catch (error) {
        console.log("No flash sales endpoint, trying single flash sale");
        try {
          const singleFlashRes = await axios.get(
            `${API_URL}/api/flash-sales/product/${id}`
          );
          if (
            singleFlashRes.data &&
            Object.keys(singleFlashRes.data).length > 0
          ) {
            console.log(
              "✅ Single flash sale (fallback):",
              singleFlashRes.data
            );
            setAllFlashSales([singleFlashRes.data]);
            setFlashSale(singleFlashRes.data);
          }
        } catch (err) {
          console.log("No flash sales for this product");
          setFlashSale(null);
          setAllFlashSales([]);
        }
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      setSeasonalSale(null);
      setFlashSale(null);
      setAllFlashSales([]);
      setAllSeasonalSales([]);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login to add items to cart");
        navigate("/login");
        return;
      }

      const payload = selectedVariant
        ? {
            product_variant_id: selectedVariant.id,
            quantity: parseInt(quantity),
          }
        : { product_id: id, quantity: parseInt(quantity) };

      await axios.post(`${API_URL}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartCount((prev) => prev + 1);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.error || "Failed to add to cart");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!product) {
    return <div className={styles.error}>Product not found</div>;
  }

  const productData = product.product || {};
  const images = product.images || [];
  const variants = product.variants || [];
  const attributes = product.attributes || {};

  const displayImages = images;

  const hasDiscount = productData.discount_percentage > 0;
  const activeSale = flashSale || seasonalSale;

  // Use variant price if selected, otherwise use product price
  const basePrice = selectedVariant?.base_price || productData.price;
  const variantDiscount = selectedVariant?.discount_percentage || 0;
  const originalPrice =
    selectedVariant?.base_price || productData.original_price;

  const salePrice = activeSale
    ? flashSale?.sale_price || seasonalSale?.sale_price
    : variantDiscount > 0
    ? basePrice * (1 - variantDiscount / 100)
    : basePrice;

  // Calculate actual discount if in sale
  const actualDiscount = activeSale
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : variantDiscount || productData.discount_percentage;

  return (
    <div className={styles.container}>
      {/* Fullscreen Image Viewer */}
      <FullscreenImageViewer
        showFullscreenImage={showFullscreenImage}
        displayImages={displayImages}
        fullscreenImageIndex={fullscreenImageIndex}
        setFullscreenImageIndex={setFullscreenImageIndex}
        setShowFullscreenImage={setShowFullscreenImage}
        handleTouchStart={handleTouchStart}
        handleTouchEnd={handleTouchEnd}
        handleTouchMove={handleTouchMove}
        fullscreenSwipeProgress={fullscreenSwipeProgress}
      />

      {/* Header */}
      <ProductDetailHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayImages={displayImages}
      />

      {/* Image Gallery */}
      <ProductImageGallery
        displayImages={displayImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        setFullscreenImageIndex={setFullscreenImageIndex}
        setShowFullscreenImage={setShowFullscreenImage}
        productData={productData}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className={styles.content}>
          {/* Seasonal/Flash Sale Banner */}
          <SeasonalFlashSaleBanner
            flashSale={flashSale}
            seasonalSale={seasonalSale}
            timeLeft={timeLeft}
            allSeasonalSales={allSeasonalSales}
            allFlashSales={allFlashSales}
          />

          {/* Shipping & Delivery Info */}
          <ShippingDeliveryInfo />

          {/* Product Title 
          /Sold Count & Store */}
          <SoldCountProductTitle
            productData={productData}
            flashSale={flashSale}
          />

          {/* Price Section */}
          <PriceSection
            selectedVariant={selectedVariant}
            productData={productData}
            activeSale={activeSale}
            flashSale={flashSale}
            seasonalSale={seasonalSale}
            originalPrice={originalPrice}
            basePrice={basePrice}
            variantDiscount={variantDiscount}
            salePrice={salePrice}
            actualDiscount={actualDiscount}
          />

          {/* Color Variants */}
          <ColorVariants
            variants={variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            displayImages={displayImages}
            setSelectedImage={setSelectedImage}
          />

          {/* Quantity Selector */}
          <QuantitySelector
            quantity={quantity}
            setQuantity={setQuantity}
            selectedVariant={selectedVariant}
            productData={productData}
          />

          {/* Guarantees */}
          <Guarantees />

          {/* Delivery Details */}
          <DeliveryDetails />

          {/* Order Guarantee */}
          <PaymentGuarantee />

          {/* Reviews Preview */}
          <ReviewsPreview
            reviews={reviews}
            reviewSummary={reviewSummary}
            onViewAllReviews={() => setActiveTab("reviews")}
          />

          {/* Product Specs/Attributes */}
          <ProductSpecs attributes={attributes} />

          {/* Description */}
          <ProductDescription description={productData.description} />

          {/* Product Features */}
          <ProductFeatures tags={productData.tags} />

          {/* Product Image Gallery Grid */}
          <ProductImageGalleryGrid
            displayImages={displayImages}
            setSelectedImage={setSelectedImage}
          />
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <ReviewsTab reviews={reviews} reviewSummary={reviewSummary} />
      )}

      {/* Recommended Tab */}
      {activeTab === "recommended" && <RecommendedTab />}

      {/* Gallery Tab - All Product Images */}
      {activeTab === "gallery" && (
        <GalleryTab
          displayImages={displayImages}
          setSelectedImage={setSelectedImage}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Sticky Cart Alert */}
      <StickyCartAlert cartCount={cartCount} />

      {/* Fixed Bottom Bar */}
      <FixedBottomBar
        handleAddToCart={handleAddToCart}
        productData={productData}
        activeSale={activeSale}
        actualDiscount={actualDiscount}
        cartCount={cartCount}
      />
      {/* Exit Intent Modal */}
      <ExitIntentModal
        showExitModal={showExitModal}
        setShowExitModal={setShowExitModal}
        timeLeft={timeLeft}
      />
    </div>
  );
};

export default ProductDetail;
