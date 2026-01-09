// frontend/src/components/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5001";

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/${productId}/details`
      );
      setProduct(response.data);
      if (response.data.variants.length > 0) {
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
      const response = await axios.get(`${API_URL}/api/reviews/${productId}`);
      setReviews(response.data.reviews);

      const summaryResponse = await axios.get(
        `${API_URL}/api/reviews/${productId}/summary`
      );
      setReviewSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_URL}/api/cart/add`,
        {
          product_variant_id: selectedVariant.id,
          quantity: parseInt(quantity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      {/* Product Images */}
      <div className="product-images">
        {product.images.map((img, idx) => (
          <img key={idx} src={img.image_url} alt={img.alt_text} />
        ))}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h1>{product.product.name}</h1>

        {/* Discount Badge */}
        {product.product.discount_percentage > 0 && (
          <div className="discount-badge">
            -{product.product.discount_percentage}%
          </div>
        )}

        {/* Pricing */}
        <div className="pricing">
          <span className="original">₦{product.product.original_price}</span>
          <span className="current">₦{product.product.price}</span>
        </div>

        {/* Rating */}
        {reviewSummary && (
          <div className="rating">
            <span className="stars">⭐ {reviewSummary.average}</span>
            <span className="count">({reviewSummary.total} reviews)</span>
          </div>
        )}

        {/* Variants */}
        <div className="variants">
          <h3>Color & Size:</h3>
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              className={`variant-btn ${
                selectedVariant?.id === variant.id ? "active" : ""
              }`}
              onClick={() => setSelectedVariant(variant)}
            >
              {variant.color} - {variant.size}
            </button>
          ))}
        </div>

        {/* Quantity */}
        <div className="quantity">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        {/* Add to Cart Button */}
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>

        {/* Shipping Info */}
        <div className="shipping-info">
          <p>✓ Free Shipping</p>
          <p>✓ 15-day returns</p>
          <p>✓ Secure payment</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {reviewSummary && (
          <div className="review-summary">
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="rating-bar">
                  <span>{rating}⭐</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{
                        width: `${
                          ((reviewSummary.distribution[rating] || 0) /
                            reviewSummary.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span>{reviewSummary.distribution[rating] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <img src={review.profile_image} alt={review.full_name} />
                <div>
                  <h4>{review.full_name}</h4>
                  <span className="rating">⭐ {review.rating}</span>
                </div>
              </div>
              <h5>{review.title}</h5>
              <p>{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt="review" />
                  ))}
                </div>
              )}
              <span className="helpful">
                👍 {review.helpful_count} found helpful
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
