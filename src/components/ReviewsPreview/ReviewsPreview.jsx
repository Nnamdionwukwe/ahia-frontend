import React from "react";
import styles from "./ReviewsPreview.module.css";

const ReviewsPreview = ({ reviews, reviewSummary, onViewAllReviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className={styles.reviewsPreviewSection}>
      <div className={styles.reviewsHeader}>
        <h3 className={styles.reviewsTitle}>
          All reviews are from verified purchases{" "}
        </h3>
      </div>

      {reviewSummary && (
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

          <button className={styles.viewAllButton} onClick={onViewAllReviews}>
            View all reviews ›
          </button>
        </div>
      )}

      {/* Reviews List - Show only 4 */}
      <div className={styles.reviewsList}>
        {reviews.slice(0, 4).map((review) => (
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
    </div>
  );
};

export default ReviewsPreview;
