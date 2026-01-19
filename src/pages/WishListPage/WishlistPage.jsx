import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWishlistStore from "../../store/wishlistStore";
import useAuthStore from "../../store/authStore";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./WishlistPage.module.css";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const { items, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const loadWishlist = async () => {
      if (accessToken) {
        setLoading(true);
        await fetchWishlist(accessToken);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [accessToken, isAuthenticated, navigate, fetchWishlist]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your wishlist...</div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>Your Wishlist is Empty</h2>
          <p>Add items you love to your wishlist!</p>
          <button onClick={() => navigate("/")} className={styles.shopBtn}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Wishlist</h1>
        <span className={styles.count}>{items.length} items</span>
      </div>
      <div className={styles.grid}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
