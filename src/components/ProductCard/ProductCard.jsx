import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WishlistButton from "../WishlistButton/WishlistButton";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import styles from "./ProductCard.module.css";
import ProductVariantModal from "../ProductVariantModal/ProductVariantModal";
import { FiShoppingCart } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [adding, setAdding] = useState(false);

  const handleBuyNow = (e) => {
    e.stopPropagation();

    if (!accessToken) {
      alert("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    setShowVariantModal(true);
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  // ✅ Updated to receive selectedImageUrl from modal
  const handleAddToCart = async (variantId, quantity, selectedImageUrl) => {
    if (!accessToken) {
      alert("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    if (!variantId) {
      alert("Product variant not available");
      return;
    }

    setAdding(true);
    try {
      // ✅ Pass the selected image URL to the cart store
      const result = await addToCart(
        product.id,
        variantId,
        quantity,
        selectedImageUrl,
      );

      if (result.success) {
        alert("Added to cart!");
        setShowVariantModal(false);
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("An error occurred");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer} onClick={handleClick}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={styles.image}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className={styles.placeholder}>No Image</div>
          )}
          {product.discount_percentage > 0 && (
            <div className={styles.discount}>
              -{product.discount_percentage}%
            </div>
          )}
          <div className={styles.wishlist}>
            <WishlistButton productId={product.id} />
          </div>
        </div>
        <div className={styles.content} onClick={handleClick}>
          <h3 className={styles.name}>{product.name?.substring(0, 20)}...</h3>
          <div className={styles.rating}>
            <span className={styles.stars}>⭐ {product.rating || 0}</span>
            <span className={styles.reviews}>
              ({product.total_reviews || 0})
            </span>
          </div>
          <div className={styles.price}>
            <div>
              <span className={styles.current}>
                ₦{parseInt(product.price).toLocaleString()}
              </span>

              {product.original_price && (
                <span className={styles.original}>
                  ₦{parseInt(product.original_price).toLocaleString()}
                </span>
              )}
            </div>

            <div>
              <button
                className={styles.button}
                onClick={handleBuyNow}
                disabled={adding}
              >
                {adding ? <span>...</span> : <FiShoppingCart size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default ProductCard;
