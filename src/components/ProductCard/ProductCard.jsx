import React from "react";
import { useNavigate } from "react-router-dom";
import WishlistButton from "../WishlistButton/WishlistButton";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
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
          <div className={styles.discount}>-{product.discount_percentage}%</div>
        )}

        <div className={styles.wishlist}>
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div className={styles.content} onClick={handleClick}>
        <h3 className={styles.name}>{product.name?.substring(0, 50)}...</h3>

        <div className={styles.rating}>
          <span className={styles.stars}>⭐ {product.rating || 0}</span>
          <span className={styles.reviews}>({product.total_reviews || 0})</span>
        </div>

        <div className={styles.price}>
          {product.original_price && (
            <span className={styles.original}>
              ₦{parseInt(product.original_price).toLocaleString()}
            </span>
          )}
          <span className={styles.current}>
            ₦{parseInt(product.price).toLocaleString()}
          </span>
        </div>

        <button className={styles.button} onClick={() => {}}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
