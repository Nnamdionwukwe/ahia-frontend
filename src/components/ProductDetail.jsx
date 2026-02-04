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
import ProductImageGallerySub from "./ProductImageGallerySub";
import ProductVariantModal from "./ProductVariantModal/ProductVariantModal";

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

  const [showVariantModal, setShowVariantModal] = useState(false);

  const [allFlashSales, setAllFlashSales] = useState([]);
  const [allSeasonalSales, setAllSeasonalSales] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const hasFetched = useRef(false);

  useEffect(() => {
    if (id && !hasFetched.current) {
      hasFetched.current = true;
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
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
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
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
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
          (prev) => (prev - 1 + images.length) % images.length,
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
      const progress = Math.min(verticalDistance / 200, 1);
      setFullscreenSwipeProgress(progress);
    }
  };

  const handleSwipe = (touchEndY, touchEndX) => {
    const verticalDistance = touchEndY - touchStartY;
    const horizontalDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(verticalDistance) > Math.abs(horizontalDistance)) {
      if (verticalDistance > minSwipeDistance) {
        setShowFullscreenImage(false);
        setFullscreenSwipeProgress(0);
        return;
      } else {
        setFullscreenSwipeProgress(0);
        return;
      }
    }

    if (!touchStart || !touchEnd) return;

    const images = product?.images || [];
    const isLeftSwipe = horizontalDistance > minSwipeDistance;
    const isRightSwipe = horizontalDistance < -minSwipeDistance;

    if (isLeftSwipe) {
      setFullscreenImageIndex((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe) {
      setFullscreenImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/${id}/details`);
      setProduct(response.data);

      if (response.data.variants && response.data.variants.length > 0) {
        const firstColor = response.data.variants[0].color;
        const firstVariantOfColor = response.data.variants.find(
          (v) => v.color === firstColor,
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

  const fetchSales = async () => {
    try {
      setSeasonalSale(null);
      setFlashSale(null);
      setAllFlashSales([]);
      setAllSeasonalSales([]);

      // Fetch ALL active seasonal sales for this product
      try {
        const seasonalRes = await axios.get(
          `${API_URL}/api/seasonal-sales/product/${id}/all`,
        );

        let seasonalSalesArray = [];
        if (Array.isArray(seasonalRes.data)) {
          seasonalSalesArray = seasonalRes.data;
        } else if (seasonalRes.data && typeof seasonalRes.data === "object") {
          seasonalSalesArray = [seasonalRes.data];
        }

        if (seasonalSalesArray.length > 0) {
          setAllSeasonalSales(seasonalSalesArray);
          setSeasonalSale(seasonalSalesArray[0]);
        }
      } catch (error) {
        console.log("❌ Error fetching seasonal sales:", error.message);
      }

      // Fetch ALL active flash sales for this product
      try {
        const flashRes = await axios.get(
          `${API_URL}/api/flash-sales/product/${id}/all`,
        );

        let flashSalesArray = [];
        if (Array.isArray(flashRes.data)) {
          flashSalesArray = flashRes.data;
        } else if (flashRes.data && typeof flashRes.data === "object") {
          flashSalesArray = [flashRes.data];
        }

        if (flashSalesArray.length > 0) {
          setAllFlashSales(flashSalesArray);
          setFlashSale(flashSalesArray[0]);
        }
      } catch (error) {
        console.log("❌ Error fetching flash sales:", error.message);
      }
    } catch (error) {
      console.error("❌ Error in fetchSales:", error);
    }
  };

  // Called by FixedBottomBar — opens the variant modal instead of adding directly
  const handleAddToCart = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }
    setShowVariantModal(true);
  };

  // Called by ProductVariantModal after user picks variant + quantity
  const handleConfirmAddToCart = async (variantId, qty) => {
    try {
      const token = localStorage.getItem("accessToken");

      const payload = variantId
        ? { product_variant_id: variantId, quantity: parseInt(qty) }
        : { product_id: id, quantity: parseInt(qty) };

      await axios.post(`${API_URL}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartCount((prev) => prev + parseInt(qty));
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

  const basePrice = selectedVariant?.base_price || productData.price;
  const variantDiscount = selectedVariant?.discount_percentage || 0;
  const originalPrice =
    selectedVariant?.base_price || productData.original_price;

  const salePrice = activeSale
    ? flashSale?.sale_price || seasonalSale?.sale_price
    : variantDiscount > 0
      ? basePrice * (1 - variantDiscount / 100)
      : basePrice;

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
        setShowExitModal={setShowExitModal}
      />

      {/* Image Gallery */}
      <ProductImageGallery
        displayImages={displayImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        setFullscreenImageIndex={setFullscreenImageIndex}
        setShowFullscreenImage={setShowFullscreenImage}
        productData={productData}
        showExitModal={showExitModal}
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

          {/* Description */}
          <ProductDescription description={productData.description} />

          {/* Product Title / Sold Count & Store */}
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

          {/* Product Features */}
          <ProductFeatures tags={productData.tags} />

          <ProductImageGallerySub
            displayImages={displayImages}
            setFullscreenImageIndex={setFullscreenImageIndex}
            setShowFullscreenImage={setShowFullscreenImage}
            productData={productData}
          />
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <ReviewsTab reviews={reviews} reviewSummary={reviewSummary} />
      )}

      {/* Recommended Tab */}
      {activeTab === "recommended" && <RecommendedTab />}

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <GalleryTab
          displayImages={displayImages}
          setSelectedImage={setSelectedImage}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Sticky Cart Alert */}
      <StickyCartAlert cartCount={cartCount} />

      {/* Fixed Bottom Bar — opens modal on tap */}
      <FixedBottomBar
        handleAddToCart={handleAddToCart}
        productData={productData}
        activeSale={activeSale}
        actualDiscount={actualDiscount}
        cartCount={cartCount}
      />

      {/* Variant Modal — confirms variant + quantity, then adds to cart */}
      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={{
          id: productData.id,
          name: productData.name,
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage,
          images: images.map((img) => img.image_url),
          variants: variants,
        }}
        onAddToCart={handleConfirmAddToCart}
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
