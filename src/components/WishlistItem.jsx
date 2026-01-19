import React from "react";
import PropTypes from "prop-types"; // For prop type validation
import styles from "./WishlistItem.module.css"; // Assume you have relevant styles

const WishlistItem = ({ product, onRemove }) => {
  // Log the product to debug
  console.log(product);

  return (
    <div className={styles.card}>
      <img
        src={product.images[0]}
        alt={product.name}
        className={styles.image}
      />
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>${Number(product.price).toFixed(2)}</p>{" "}
      {/* Ensure price is a number */}
      <button className={styles.removeBtn} onClick={() => onRemove(product.id)}>
        Remove from Wishlist
      </button>
    </div>
  );
};

WishlistItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired, // Ensure price is a number in prop types
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default WishlistItem;
