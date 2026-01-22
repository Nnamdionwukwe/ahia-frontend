import React from "react";
import styles from "./ReviewsTab.module.css";

const ReviewsTab = ({ reviews, reviewSummary }) => {
  return (
    <div className={styles.content}>
      <h2 className={styles.sectionTitle}>Customer Reviews</h2>

      {reviewSummary && reviewSummary.total > 0 ? (
        <>
          {/* Rating Overview */}
          <div className={styles.ratingOverview}>
            <div className={styles.ratingScore}>
              <div className={styles.bigRating}>
                {reviewSummary.average.toFixed(1)}
              </div>
              <div className={styles.ratingStars}>★★★★★</div>
              <div className={styles.ratingCount}>
                ({reviewSummary.total.toLocaleString()})
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          <div className={styles.verifiedBadge}>
            <span className={styles.checkMark}>✓</span>
            <span>All reviews are from verified purchases</span>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      {review.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className={styles.reviewerName}>
                        {review.full_name || "Anonymous"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>

                {review.title && (
                  <h5 className={styles.reviewTitle}>{review.title}</h5>
                )}

                <p className={styles.reviewText}>{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className={styles.reviewImages}>
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Review" />
                    ))}
                  </div>
                )}

                <div className={styles.reviewActions}>
                  <button className={styles.helpfulButton}>
                    👍 Helpful({review.helpful_count || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noReviews}>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
