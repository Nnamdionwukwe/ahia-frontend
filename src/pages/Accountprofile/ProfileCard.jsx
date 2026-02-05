import React, { useState } from "react";
import styles from "./ProfileCard.module.css";

// --- Icons (SVG Components) ---
const StarIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ThumbIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
    />
  </svg>
);

// --- Data ---
const INITIAL_REVIEWS = [
  {
    id: 1,
    rating: 5,
    date: "December 6, 2025",
    product: { name: "C2", price: "$45.00" },
    text: "Absolutely fantastic product. Exceeded my expectations in terms of build quality and performance. Highly recommended!",
    helpfulCount: 0,
    helpful: false,
  },
  {
    id: 2,
    rating: 5,
    date: "December 6, 2025",
    product: { name: "SmartXProCombo1", price: "$129.99" },
    text: "The SmartX Pro Combo is a game changer. Setup was easy and the integration with my other devices is seamless. 5 stars!",
    helpfulCount: 1,
    helpful: false, // The 1 helpful from the screenshot is the aggregate count
  },
  {
    id: 3,
    rating: 2,
    date: "November 14, 2025",
    product: { name: "Basic Stand", price: "$15.50" },
    text: "It works okay, but the material feels a bit cheaper than I expected. Shipping was also delayed by a few days.",
    helpfulCount: 0,
    helpful: false,
  },
  {
    id: 4,
    rating: 5,
    date: "November 14, 2025",
    product: { name: "Wireless Earbuds", price: "$59.00" },
    text: "Great sound quality for the price. Battery life lasts all day for me. Very happy with this purchase.",
    helpfulCount: 0,
    helpful: false,
  },
  // Additional reviews to fill the visual space
  {
    id: 5,
    rating: 5,
    date: "Oct 20, 2025",
    product: { name: "Screen Protector", price: "$9.99" },
    text: "Good fit.",
    helpfulCount: 0,
    helpful: false,
  },
  {
    id: 6,
    rating: 1,
    date: "Sep 05, 2025",
    product: { name: "Old Cable", price: "$5.00" },
    text: "Stopped working after a week.",
    helpfulCount: 0,
    helpful: false,
  },
];

const ProfileCard = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  // Helper to generate stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        style={{ color: i < rating ? "var(--star-color)" : "#e5e7eb" }}
      >
        <StarIcon />
      </span>
    ));
  };

  // Filter Logic
  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter((review) => review.rating === parseInt(activeFilter));

  // Helpful Click Handler
  const handleHelpful = (id) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            helpful: !review.helpful,
            helpfulCount: review.helpful
              ? review.helpfulCount - 1
              : review.helpfulCount + 1,
          };
        }
        return review;
      }),
    );
  };

  return (
    <div className={styles.userReviews}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.userProfile}>
          {/* Placeholder image using UI Avatars for the name "Nnamdi" */}
          <img
            src={`https://ui-avatars.com/api/?name=Nnamdi+Onwukwe&background=2563eb&color=fff`}
            alt="Nnamdi Onwukwe"
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h2>Nnamdi Onwukwe</h2>
            <span className={styles.badge}>Verified Buyer</span>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>16</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statValue} ${styles.positiveRate}`}>
              81%
            </span>
            <span className={styles.statLabel}>Positive</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>1</span>
            <span className={styles.statLabel}>Helpful</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <nav className={styles.filters}>
        {["all", 5, 2, 1].map((rating) => {
          // Calculate label based on rating
          let label = "All reviews";
          if (rating === 5) label = "5★ (13)";
          if (rating === 2) label = "2★ (2)";
          if (rating === 1) label = "1★ (1)";

          return (
            <button
              key={rating}
              onClick={() => setActiveFilter(rating.toString())}
              className={`${styles.chip} ${activeFilter === rating.toString() ? styles.chipActive : ""}`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Review List */}
      <div className={styles.list}>
        {filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            No reviews found for this rating.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.cardHeader}>
                <div className={styles.stars}>{renderStars(review.rating)}</div>
                <span className={styles.date}>{review.date}</span>
              </div>

              <div className={styles.productBox}>
                <div className={styles.productPlaceholder}>IMG</div>
                <div className={styles.productDetails}>
                  <span className={styles.productName}>
                    {review.product.name}
                  </span>
                  <span className={styles.productPrice}>
                    {review.product.price}
                  </span>
                </div>
              </div>

              <p className={styles.reviewText}>{review.text}</p>

              <div className={styles.actions}>
                <button
                  className={`${styles.helpfulBtn} ${review.helpful ? styles.helpfulBtnActive : ""}`}
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbIcon />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
                <button className={styles.shareBtn}>Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
