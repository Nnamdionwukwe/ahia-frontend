// src/components/WishlistButton.jsx
import React, { useState, useEffect } from "react";
import { FiHeart, FiFill } from "react-icons/fi";
import useWishlistStore from "../store/wishlistStore";
import useAuthStore from "../store/authStore";
import styles from "./WishlistButton.module.css";

const WishlistButton = ({ productId, className = "" }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { inWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const isWishlisted = inWishlist[productId] || false;

  const handleToggle = async () => {
    if (!accessToken) {
      alert("Please login first");
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(productId, accessToken);
    } else {
      await addToWishlist(productId, accessToken);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`${styles.btn} ${
        isWishlisted ? styles.active : ""
      } ${className}`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isWishlisted ? <FiFill size={24} /> : <FiHeart size={24} />}
    </button>
  );
};

export default WishlistButton;
