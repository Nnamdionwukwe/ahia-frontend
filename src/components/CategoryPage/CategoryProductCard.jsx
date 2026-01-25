import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WishlistButton from "../WishlistButton/WishlistButton";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import styles from "./CategoryProductCard.module.css";
import ProductVariantModal from "../ProductVariantModal/ProductVariantModal";
import { FiShoppingCart } from "react-icons/fi";

const CategoryProductCard = ({ product }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart); // ✅ Changed from addItem to addToCart
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
      // ✅ Updated to use addToCart with correct parameters
      const result = await addToCart(product.id, variantId, quantity);

      if (result.success) {
        alert("Added to cart!");
        setShowVariantModal(false); // Close modal on success
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
            />
          ) : (
            <div className={styles.placeholder}>No Image</div>
          )}

          <div className={styles.discount}></div>
        </div>

        <div className={styles.content} onClick={handleClick}>
          {/* <h3 className={styles.name}>{product.name?.substring(0, 5)}...</h3> */}
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
            </div>

            <div>
              <div
                className={styles.button}
                onClick={handleBuyNow}
                disabled={adding}
              >
                {adding ? <span>...</span> : <FiShoppingCart size={16} />}
              </div>
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

export default CategoryProductCard;
