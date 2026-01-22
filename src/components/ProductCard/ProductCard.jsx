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
  const addItem = useCartStore((state) => state.addItem);
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

  const handleAddToCart = async (variantId, quantity) => {
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
      const success = await addItem(variantId, quantity, accessToken);

      if (success) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart");
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
            <span className={styles.current}>
              ₦{parseInt(product.price).toLocaleString()}
            </span>

            {product.original_price && (
              <span className={styles.original}>
                ₦{parseInt(product.original_price).toLocaleString()}
              </span>
            )}

            <button
              className={styles.button1}
              onClick={handleBuyNow}
              disabled={adding}
            >
              {/* {adding ? "Adding..." : "Add to Cart"} */}
              <FiShoppingCart size={20} />
            </button>
          </div>

          {/* <button
            className={styles.button}
            onClick={handleBuyNow}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add to Cart"}
            <FiShoppingCart size={20} />
          </button> */}
        </div>
      </div>

      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleAddToCart} // Passing the handleAddToCart to the modal
      />
    </>
  );
};

export default ProductCard;
