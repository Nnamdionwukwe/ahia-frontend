import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import WishlistButton from "../WishlistButton/WishlistButton";
import styles from "./ProductDetail.module.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [cartCount, setCartCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 43,
    seconds: 34,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchCartCount();
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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/${id}/details`);
      setProduct(response.data);
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

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login to add items to cart");
        navigate("/login");
        return;
      }

      await axios.post(
        `${API_URL}/api/cart/add`,
        { product_id: id, quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartCount((prev) => prev + 1);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.error || "Failed to add to cart");
    }
  };

  const getFallbackImage = (category) => {
    const fallbackImages = {
      Electronics:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
      Fashion:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
      "Home & Kitchen":
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
      Sports:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
      default:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    };
    return fallbackImages[category] || fallbackImages.default;
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!product) {
    return <div className={styles.error}>Product not found</div>;
  }

  const productData = product.product || {};
  const images = product.images || [];
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            image_url: getFallbackImage(productData.category),
            alt_text: productData.name,
          },
        ];

  const hasDiscount = productData.discount_percentage > 0;
  const soldCount =
    productData.sold_count || Math.floor(Math.random() * 20) + "K+";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ←
        </button>
        <div className={styles.headerTabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "reviews" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "recommended" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended
          </button>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>🔍</button>
          <button className={styles.iconButton}>📤</button>
        </div>
      </div>

      {/* Image Gallery with Full Screen */}
      <div className={styles.imageSection}>
        <div className={styles.mainImage}>
          <img
            src={displayImages[selectedImage]?.image_url}
            alt={displayImages[selectedImage]?.alt_text || productData.name}
            onError={(e) => {
              e.target.src = getFallbackImage(productData.category);
            }}
          />
          {images.length === 0 && (
            <div className={styles.noImageBadge}>No product images</div>
          )}
          <div className={styles.imageCounter}>
            {selectedImage + 1}/{displayImages.length}
          </div>
          <button className={styles.fullScreenButton}>⛶</button>
        </div>

        {displayImages.length > 1 && (
          <div className={styles.thumbnails}>
            {displayImages.map((img, idx) => (
              <div
                key={idx}
                className={`${styles.thumbnail} ${
                  selectedImage === idx ? styles.activeThumbnail : ""
                }`}
                onClick={() => setSelectedImage(idx)}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || `View ${idx + 1}`}
                  onError={(e) => {
                    e.target.src = getFallbackImage(productData.category);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className={styles.content}>
          {/* Flash Sale Banner */}
          {hasDiscount && (
            <div className={styles.flashSaleBanner}>
              <div className={styles.saleTag}>DRY SEASON SALE</div>
              <div className={styles.flashSaleContent}>
                <div className={styles.flashSaleLeft}>
                  <span className={styles.flashIcon}>⚡</span>
                  <span>Big sale</span>
                  <span className={styles.separator}>|</span>
                  <span className={styles.clockIcon}>⏰</span>
                  <span className={styles.endsText}>Ends in</span>
                </div>
                <div className={styles.timer}>
                  <span className={styles.timerDigit}>
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className={styles.timerColon}>:</span>
                  <span className={styles.timerDigit}>
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className={styles.timerColon}>:</span>
                  <span className={styles.timerDigit}>
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping & Delivery Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <span className={styles.checkIcon}>✓</span>
              <span className={styles.freeShipping}>Free shipping</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.creditIcon}>₦</span>
              <span>₦1,600 Credit for delay</span>
            </div>
          </div>

          {/* Delivery Estimate */}
          <div className={styles.deliveryBadge}>
            <span className={styles.truckIcon}>🚚</span>
            <span className={styles.deliveryText}>
              Arrives in NG in as little as 6 days
            </span>
          </div>

          {/* Product Title & Info */}
          <h1 className={styles.productName}>{productData.name}</h1>

          {/* Sold Count & Store */}
          <div className={styles.productMeta}>
            <span className={styles.soldCount}>
              <span className={styles.fireIcon}>🔥</span>
              {soldCount} sold
            </span>
            <span className={styles.separator}>|</span>
            <span className={styles.storeName}>
              Sold by {productData.store_name || "Store"}
            </span>
          </div>

          {/* Price Section */}
          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>
                    ₦{parseInt(productData.original_price).toLocaleString()}
                  </span>
                  <span className={styles.discountBadge}>
                    {productData.discount_percentage}% OFF limited time
                  </span>
                </>
              )}
            </div>
            <div className={styles.currentPriceRow}>
              <div className={styles.currentPrice}>
                <span className={styles.currency}>₦</span>
                <span className={styles.priceAmount}>
                  {parseInt(productData.price).toLocaleString()}
                </span>
              </div>
              <span className={styles.estimate}>Est.</span>
            </div>
            <div className={styles.afterPromo}>
              after applying promos & credit to ₦
              {parseInt(productData.price * 0.8).toLocaleString()}
            </div>
          </div>

          {/* Variant Selector (Items) */}
          <div className={styles.variantSection}>
            <div className={styles.variantLabel}>Items:</div>
            <div className={styles.variantOptions}>
              <button className={styles.variantButton}>
                <span className={styles.fireIcon}>🔥</span>
                Black strap watch
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className={styles.quantityRow}>
            <span className={styles.quantityLabel}>Qty</span>
            <div className={styles.quantitySelector}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.quantityButton}
              >
                −
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={styles.quantityButton}
              >
                +
              </button>
            </div>
          </div>

          {/* Guarantees with Icons */}
          <div className={styles.guaranteeSection}>
            <div className={styles.guaranteeItem}>
              <span className={styles.shippingIcon}>📦</span>
              <span className={styles.freeShippingText}>FREE SHIPPING</span>
            </div>
          </div>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <span>✓</span>
              <span>₦1,600 Credit for delay</span>
            </div>
            <div className={styles.benefitItem}>
              <span>✓</span>
              <span>15-day no update refund</span>
            </div>
            <div className={styles.benefitItem}>
              <span>✓</span>
              <span>60-day returns</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className={styles.deliveryDetails}>
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Standard:</span>
              <span className={styles.deliveryValue}>free on all orders.</span>
              <button className={styles.clickCollect}>Click & Collect</button>
            </div>
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Delivery:</span>
              <span className={styles.deliveryValue}>
                Arrives in NG in as little as 6 days
              </span>
            </div>
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Courier company:</span>
              <div className={styles.courierLogos}>
                <span className={styles.courierBadge}>Speedaf</span>
                <span className={styles.courierBadge}>GIG</span>
                <span>GIG...</span>
              </div>
            </div>
          </div>

          {/* Safe Payments */}
          <div className={styles.safePayments}>
            <span className={styles.shieldIcon}>🛡️</span>
            <span>Safe payments • Secure privacy</span>
            <span className={styles.arrowRight}>›</span>
          </div>

          {/* Order Guarantee */}
          <div className={styles.orderGuarantee}>
            <div className={styles.guaranteeHeader}>
              <span className={styles.guaranteeIcon}>🎁</span>
              <span>Order guarantee</span>
              <span className={styles.moreLink}>More ›</span>
            </div>
            <div className={styles.guaranteePoints}>
              <div className={styles.guaranteePoint}>✓ 90-day returns</div>
              <div className={styles.guaranteePoint}>
                ✓ Return if item damaged
              </div>
              <div className={styles.guaranteePoint}>✓ Price adjustment</div>
            </div>
          </div>

          {/* Product Specs */}
          <div className={styles.specsGrid}>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>🔋</div>
              <div className={styles.specLabel}>Battery Capacity (mAh)</div>
              <div className={styles.specValue}>240</div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>💧</div>
              <div className={styles.specLabel}>Water Resistance Level</div>
              <div className={styles.specValue}>Non-water resistant</div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>📱</div>
              <div className={styles.specLabel}>Screen Size</div>
              <div className={styles.specValue}>2.01</div>
            </div>
          </div>

          {/* Description */}
          {productData.description && (
            <div className={styles.description}>
              <h3>Product Description</h3>
              <p>{productData.description}</p>
            </div>
          )}

          {/* Features (Reason for attraction) */}
          <div className={styles.featuresSection}>
            <h3 className={styles.featuresTitle}>Reason for attraction</h3>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <h4>Earphones and watch in one</h4>
                <p>
                  The innovative design of flip cover and hanging earphones
                  cleverly combines earphones and watches.
                </p>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
                  alt="Feature"
                />
              </div>
              <div className={styles.featureCard}>
                <h4>Multiple watch face</h4>
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
                  alt="Feature"
                />
              </div>
              <div className={styles.featureCard}>
                <h4>Wireless calls are clear and smooth</h4>
                <p>
                  Open the watch and take out the earphones to answer the call.
                </p>
                <img
                  src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300"
                  alt="Feature"
                />
              </div>
              <div className={styles.featureCard}>
                <h4>Multi-sport modes</h4>
                <div className={styles.sportIcons}>🏃 🚴 🏊 ⚽ 🏋️ 🧘</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && reviewSummary && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>

          {/* Rating Overview */}
          <div className={styles.ratingOverview}>
            <div className={styles.ratingScore}>
              <div className={styles.bigRating}>
                {reviewSummary.average.toFixed(1)}
              </div>
              <div className={styles.ratingStars}>★★★★★</div>
              <div className={styles.ratingCount}>
                ({reviewSummary.total.toLocaleString()})
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          <div className={styles.verifiedBadge}>
            <span className={styles.checkMark}>✓</span>
            <span>All reviews are from verified purchases</span>
          </div>

          {/* Review Tags */}
          <div className={styles.reviewTags}>
            <button className={styles.reviewTag}>Lovely Watch(32)</button>
            <button className={styles.reviewTag}>Great Quality(26)</button>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      {review.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.reviewerName}>
                        {review.full_name}
                      </div>
                      <div className={styles.reviewStars}>
                        {"★".repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>

                {review.variant && (
                  <div className={styles.purchasedVariant}>
                    Purchased: {review.variant}
                  </div>
                )}

                <p className={styles.reviewText}>{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className={styles.reviewImages}>
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Review" />
                    ))}
                  </div>
                )}

                <div className={styles.reviewActions}>
                  <button className={styles.shareButton}>📤 Share</button>
                  <button className={styles.helpfulButton}>
                    👍 Helpful({review.helpful_count || 0})
                  </button>
                  <button className={styles.reportButton}>
                    ⚠️ Report and block
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Seller Info */}
          <div className={styles.sellerCard}>
            <div className={styles.sellerHeader}>
              <div className={styles.sellerLogo}>E</div>
              <div className={styles.sellerInfo}>
                <div className={styles.sellerName}>Effeokki</div>
                <div className={styles.sellerStats}>
                  <span>327 Followers</span>
                  <span>•</span>
                  <span>42K+ Sold</span>
                  <span>•</span>
                  <span>4.6 ★</span>
                </div>
              </div>
              <button className={styles.followButton}>Follow</button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Tab */}
      {activeTab === "recommended" && (
        <div className={styles.content}>
          <div className={styles.recommendedTabs}>
            <button className={styles.recommendedTab}>Recommended</button>
            <button className={styles.recommendedTab}>Smart Home</button>
            <button className={styles.recommendedTab}>Beauty & Health</button>
            <button className={styles.recommendedTab}>Women</button>
          </div>
          <div className={styles.recommendedGrid}>
            {/* Placeholder for recommended products */}
            <div className={styles.recommendedCard}>
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
                alt="Product"
              />
              <div className={styles.recommendedPrice}>₦26,552</div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Cart Alert (6 items almost sold out) */}
      {cartCount > 0 && (
        <div className={styles.cartAlert}>
          <div className={styles.cartAlertContent}>
            <span className={styles.cartIcon}>🛒</span>
            <span>{cartCount} items in your cart are almost sold out!</span>
          </div>
          <button className={styles.viewCartButton}>
            View cart ({cartCount})
            <br />
            <span className={styles.cartSubtext}>₦ 6 almost sold out</span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className={styles.bottomBar}>
        <button
          onClick={handleAddToCart}
          className={styles.addToCartButton}
          disabled={productData.stock_quantity === 0}
        >
          -{hasDiscount ? productData.discount_percentage : 0}% now! Add to
          cart!
          <br />
          <span className={styles.deliverySubtext}>
            Arrives in NG in as little as 6 days
          </span>
        </button>
        <button className={styles.cartFloatingButton}>
          🛒
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
          <span className={styles.cartFreeShipping}>Free shipping</span>
        </button>
      </div>

      {/* Exit Intent Discount Modal */}
      {showExitModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowExitModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowExitModal(false)}
              className={styles.modalClose}
            >
              ×
            </button>

            <div className={styles.modalIcon}>🎁</div>
            <h2 className={styles.modalTitle}>Bags production</h2>
            <p className={styles.modalSubtitle}>Offers you bonus</p>

            <div className={styles.modalDivider} />

            <div className={styles.modalDiscount}>15% OFF</div>
            <p className={styles.modalDescription}>
              No min. spend. Valid on select items only
            </p>

            <div className={styles.modalTimer}>
              <span>Expires in</span>
              <div className={styles.modalTimerDigits}>
                <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                <span>:</span>
                <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span>:</span>
                <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowExitModal(false);
                // Apply discount logic
                alert("15% discount applied!");
              }}
              className={styles.modalUseButton}
            >
              Use
            </button>

            <button
              onClick={() => setShowExitModal(false)}
              className={styles.modalLeaveButton}
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
