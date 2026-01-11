import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}/details`);
      console.log("Product data:", response.data);
      setProduct(response.data);

      if (response.data.variants && response.data.variants.length > 0) {
        setSelectedVariant(response.data.variants[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/${id}`);
      setReviews(response.data.reviews || []);

      const summaryResponse = await axios.get(
        `${API_URL}/api/reviews/${id}/summary`
      );
      setReviewSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login to add items to cart");
        return;
      }

      // If no variants, use product directly
      const payload = selectedVariant
        ? {
            product_variant_id: selectedVariant.id,
            quantity: parseInt(quantity),
          }
        : { product_id: id, quantity: parseInt(quantity) };

      await axios.post(`${API_URL}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.error || "Failed to add to cart");
    }
  };

  // Generate fallback image based on category
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
      Books:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
      Toys: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800",
      Beauty:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
      default:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    };
    return fallbackImages[category] || fallbackImages.default;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  // Extract data
  const productData = product.product || {};
  const images = product.images || [];
  const variants = product.variants || [];

  // Use fallback if no images
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

  return (
    <div className="product-detail">
      <div className="product-container">
        {/* Product Images */}
        <div className="product-images-section">
          {/* Main Image */}
          <div className="main-image">
            <img
              src={displayImages[selectedImageIndex]?.image_url}
              alt={
                displayImages[selectedImageIndex]?.alt_text || productData.name
              }
              onError={(e) => {
                e.target.src = getFallbackImage(productData.category);
              }}
            />
            {images.length === 0 && (
              <div className="no-image-badge">No product images available</div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {displayImages.length > 1 && (
            <div className="thumbnail-gallery">
              {displayImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${
                    selectedImageIndex === idx ? "active" : ""
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
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

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-name">{productData.name}</h1>

          {/* Category Badge */}
          <div className="category-badge">{productData.category}</div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="discount-badge">
              -{productData.discount_percentage}% OFF
            </div>
          )}

          {/* Pricing */}
          <div className="pricing">
            {hasDiscount && (
              <span className="original-price">
                ₦{parseFloat(productData.original_price).toLocaleString()}
              </span>
            )}
            <span className="current-price">
              ₦{parseFloat(productData.price).toLocaleString()}
            </span>
          </div>

          {/* Rating */}
          {reviewSummary && reviewSummary.total > 0 && (
            <div className="rating">
              <span className="stars">
                ⭐ {reviewSummary.average.toFixed(1)}
              </span>
              <span className="count">({reviewSummary.total} reviews)</span>
            </div>
          )}

          {/* Description */}
          {productData.description && (
            <div className="description">
              <p>{productData.description}</p>
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="variants">
              <h3>Select Variant:</h3>
              <div className="variant-buttons">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`variant-btn ${
                      selectedVariant?.id === variant.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.color && variant.size
                      ? `${variant.color} - ${variant.size}`
                      : variant.color || variant.size || "Standard"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          {productData.stock_quantity !== undefined && (
            <div
              className={`stock-info ${
                productData.stock_quantity > 0 ? "in-stock" : "out-of-stock"
              }`}
            >
              {productData.stock_quantity > 0
                ? `✓ In Stock (${productData.stock_quantity} available)`
                : "✗ Out of Stock"}
            </div>
          )}

          {/* Quantity */}
          <div className="quantity-selector">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              max={productData.stock_quantity || 99}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </div>

          {/* Add to Cart Button */}
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={productData.stock_quantity === 0}
          >
            {productData.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Shipping Info */}
          <div className="shipping-info">
            <div className="info-item">✓ Free Shipping</div>
            <div className="info-item">✓ 15-day returns</div>
            <div className="info-item">✓ Secure payment</div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {reviewSummary && reviewSummary.total > 0 ? (
          <>
            <div className="review-summary">
              <div className="average-rating">
                <span className="rating-number">
                  {reviewSummary.average.toFixed(1)}
                </span>
                <span className="out-of">/ 5</span>
                <div className="total-reviews">
                  {reviewSummary.total} reviews
                </div>
              </div>

              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="rating-bar">
                    <span className="rating-label">{rating}⭐</span>
                    <div className="bar">
                      <div
                        className="fill"
                        style={{
                          width: `${
                            reviewSummary.total > 0
                              ? ((reviewSummary.distribution[rating] || 0) /
                                  reviewSummary.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="rating-count">
                      {reviewSummary.distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <img
                      src={
                        review.profile_image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          review.full_name
                        )}`
                      }
                      alt={review.full_name}
                      className="reviewer-avatar"
                    />
                    <div className="reviewer-info">
                      <h4>{review.full_name}</h4>
                      <span className="review-rating">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>
                  </div>
                  {review.title && (
                    <h5 className="review-title">{review.title}</h5>
                  )}
                  <p className="review-comment">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt="review" />
                      ))}
                    </div>
                  )}
                  <span className="helpful-count">
                    👍 {review.helpful_count || 0} found helpful
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
