// src/pages/ReviewDetails/ReviewDetails.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Flame,
  Camera,
  Video,
  X,
  MessageCircle,
  User,
  ThumbsUp,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./ReviewDetails.module.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import { ShareModal, SuccessModal } from "../Reviews/ReviewModals";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const RATING_LABELS = ["", "Poor", "Fair", "Average", "Good", "Excellent"];
const MAX_CHARS = 3000;

function useAuthHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

const maskName = (name = "") => {
  if (!name) return "User";
  return name
    .trim()
    .split(" ")
    .map((s) => (s.length <= 2 ? s : s[0] + "***" + s[s.length - 1]))
    .join(" ");
};

// ── Star Row ──────────────────────────────────────────────────────────────────
function StarRow({ rating = 0, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;
  return (
    <div className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={`${styles.star} ${active >= s ? styles.starFilled : ""}`}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(s)}
          style={{ cursor: onChange ? "pointer" : "default" }}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

// ── Leave / Edit Review Sheet ─────────────────────────────────────────────────
// Endpoint: POST /api/reviews/:productId/add  (new)
// Endpoint: PUT  /api/reviews/:reviewId/edit  (edit)
function LeaveReviewSheet({ product, initialRating, onClose, onSubmitted }) {
  const { user } = useAuthStore();
  const headers = useAuthHeaders();
  const photoRef = useRef();

  const [rating, setRating] = useState(initialRating || 0);
  const [reviewText, setReviewText] = useState(product?.reviewText || "");
  const [hideProfile, setHideProfile] = useState(
    product?.hide_profile || false,
  );
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If product has a reviewId it means we're editing an existing review
  const isEdit = !!product?.reviewId;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        // PUT /api/reviews/:reviewId/edit
        await axios.put(
          `${API_URL}/api/reviews/${product.reviewId}/edit`,
          { rating, comment: reviewText, hide_profile: hideProfile },
          { headers },
        );
      } else {
        // POST /api/reviews/:productId/add
        await axios.post(
          `${API_URL}/api/reviews/${product.id}/add`,
          { rating, comment: reviewText, hide_profile: hideProfile },
          { headers },
        );
      }
      onSubmitted?.(product.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Header: rating stars + close */}
        <div className={styles.sheetHeader}>
          <div className={styles.sheetRatingRow}>
            <span className={styles.asterisk}>*</span>
            <span className={styles.ratingLabel}>Rating</span>
            <StarRow rating={rating} onChange={setRating} size={28} />
            {rating > 0 && (
              <span className={styles.ratingWord}>{RATING_LABELS[rating]}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Get help banner — only for 1-2 stars */}
        {rating > 0 && rating <= 2 && (
          <div className={styles.getHelpBox}>
            <p className={styles.getHelpText}>
              If you had any problems with shipping or the item, contact us!
            </p>
            <button className={styles.getHelpBtn}>
              <MessageCircle size={14} /> Get help <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Media upload */}
        <div className={styles.mediaRow}>
          <button
            className={styles.mediaBtn}
            onClick={() => photoRef.current?.click()}
          >
            <Camera size={24} />
            <span>Photo</span>
          </button>
          <button className={styles.mediaBtn}>
            <Video size={24} />
            <span>Video</span>
          </button>
          {photos.map((p, i) => (
            <div key={i} className={styles.photoThumb}>
              <img src={p} alt="" />
              <button
                className={styles.removePhoto}
                onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handlePhotoChange}
          />
        </div>

        {/* Review text */}
        <div className={styles.textareaWrap}>
          <textarea
            className={styles.textarea}
            placeholder="Sharing your thought and experience about this item."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
            rows={5}
          />
          <span className={styles.charCount}>
            {reviewText.length}/{MAX_CHARS}
          </span>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* Bottom: guidelines + submit + hide profile */}
        <div className={styles.sheetBottom}>
          <p className={styles.guidelines}>
            Please follow the{" "}
            <span className={styles.guidelinesLink}>review guidelines</span>{" "}
            when writing reviews.
          </p>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!rating || submitting}
          >
            {submitting ? "Submitting…" : isEdit ? "Update" : "Submit"}
          </button>
          <div className={styles.hideRow}>
            <button
              className={`${styles.hideCheck} ${hideProfile ? styles.hideChecked : ""}`}
              onClick={() => setHideProfile((h) => !h)}
            >
              {hideProfile && <span className={styles.checkMark}>✓</span>}
            </button>
            <span className={styles.hideText}>
              Hide your profile photo and name as
            </span>
            <User size={15} className={styles.hideIcon} />
            <span className={styles.hideName}>{maskName(user?.full_name)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReviewDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const headers = useAuthHeaders();

  const passedReview = location.state?.review || null;

  const [thisReview, setThisReview] = useState(passedReview);
  const [orderItems, setOrderItems] = useState([]);
  const [pending, setPending] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [sheetProduct, setSheetProduct] = useState(null);
  const [sheetInitialRating, setSheetInitialRating] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shareTarget, setShareTarget] = useState(null); // item to share

  // Helpful state for the THIS review card
  const [helpfulCount, setHelpfulCount] = useState(
    passedReview?.helpfulCount || 0,
  );

  // ── Fetch: reviews/me + orders ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/api/reviews/user/me`, { headers }),
        axios.get(`${API_URL}/api/reviews/user/orders`, { headers }),
      ]);

      if (reviewsRes.data.success) {
        setPending(reviewsRes.data.pending || []);
        if (!passedReview && reviewsRes.data.reviewed?.length > 0) {
          const first = reviewsRes.data.reviewed[0];
          setThisReview(first);
          setHelpfulCount(first.helpfulCount || 0);
        }
      }

      if (ordersRes.data.success && ordersRes.data.orders?.length > 0) {
        setOrderItems(ordersRes.data.orders[0].items || []);
      }
    } catch (err) {
      console.error("ReviewDetails fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch: product feed ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    axios
      .get(`${API_URL}/api/products`, {
        params: { limit: 20, sort: "shuffle" },
      })
      .then((res) => {
        const data =
          res.data?.products ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setProducts(data);
      })
      .catch((err) => console.error("Products fetch error:", err.message));
  }, [fetchData]);

  // ── Sheet helpers ─────────────────────────────────────────────────────────────
  const openSheet = (product, initialRating = 0) => {
    setSheetProduct(product);
    setSheetInitialRating(initialRating);
  };
  const closeSheet = () => {
    setSheetProduct(null);
    setSheetInitialRating(0);
  };

  const handleSubmitted = (productId) => {
    setSubmitted((s) => ({ ...s, [productId]: true }));
    fetchData();
    setShowSuccessModal(true);
  };

  // ── Share ─────────────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (!thisReview) return;
    if (navigator.share) {
      navigator.share({
        title: thisReview.name,
        text: thisReview.reviewText || thisReview.name,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // ── Carousel ──────────────────────────────────────────────────────────────────
  const prevSlide = () => setCarouselIndex((i) => Math.max(0, i - 1));
  const nextSlide = () =>
    setCarouselIndex((i) => Math.min(orderItems.length - 1, i + 1));

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.iconBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Review details</h1>
          <div style={{ width: 36 }} />
        </div>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Review details</h1>
        <button
          className={styles.iconBtn}
          onClick={(item) => setShareTarget(item)}
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* ── This Review Card ── */}
      {thisReview && (
        <div className={styles.reviewCard}>
          {/* Reviewer row */}
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewerInfo}>
              <div className={styles.reviewerAvatar}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                )}
              </div>
              <span className={styles.reviewerName}>
                {thisReview.hide_profile
                  ? maskName(user?.full_name)
                  : user?.full_name || "Guest"}
              </span>
            </div>
            <span className={styles.reviewDate}>{thisReview.date}</span>
          </div>

          {/* Stars */}
          <StarRow rating={thisReview.rating} size={20} />

          {/* Review text */}
          {thisReview.reviewText && (
            <p className={styles.reviewText}>{thisReview.reviewText}</p>
          )}

          {/* Review images */}
          {thisReview.images?.length > 0 && (
            <div className={styles.reviewImages}>
              {thisReview.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={styles.reviewImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
          )}

          {/* Product strip */}
          <div className={styles.productStrip}>
            <img
              src={
                thisReview.image || "https://via.placeholder.com/64?text=IMG"
              }
              alt={thisReview.name}
              className={styles.productStripImg}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/64?text=IMG";
              }}
            />
            <div className={styles.productStripInfo}>
              <p className={styles.productStripName}>{thisReview.name}</p>
              <p className={styles.productStripVariant}>{thisReview.variant}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quickly review all items in this order ── */}
      {orderItems.length > 0 && (
        <div className={styles.quickReviewSection}>
          <h2 className={styles.quickReviewTitle}>
            Quickly review all items in this order.
          </h2>

          <div className={styles.carouselWrap}>
            <div
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {orderItems.map((item, i) => (
                <div key={item.id || i} className={styles.carouselSlide}>
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/360/ccc/333?text=IMG"
                    }
                    alt={item.name || ""}
                    className={styles.carouselImg}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/360/ccc/333?text=IMG";
                    }}
                  />
                </div>
              ))}
            </div>

            {carouselIndex > 0 && (
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                onClick={prevSlide}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {carouselIndex < orderItems.length - 1 && (
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                onClick={nextSlide}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Dots + Leave a review — opens sheet for the carousel-indexed pending item */}
          <div className={styles.carouselFooter}>
            <div className={styles.dots}>
              {orderItems.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === carouselIndex ? styles.dotActive : ""}`}
                  onClick={() => setCarouselIndex(i)}
                />
              ))}
            </div>
            <button
              className={styles.leaveReviewOutline}
              onClick={() => {
                // Match carousel item to pending list by name; fallback to carouselIndex
                const carouselItem = orderItems[carouselIndex];
                const match =
                  pending.find((p) => p.name === carouselItem?.name) ||
                  pending[carouselIndex];
                if (match) openSheet(match);
              }}
            >
              Leave a review
            </button>
          </div>
        </div>
      )}

      {/* ── Items ready for review ── */}
      {pending.length > 0 && (
        <div className={styles.pendingSection}>
          <div className={styles.pendingHeader}>
            <div>
              <h2 className={styles.pendingTitle}>
                Items ready for review ({pending.length})
              </h2>
              <p className={styles.pendingSub}>
                Show only delivered items below.
              </p>
            </div>
            <button
              onClick={() => navigate("/account-profile/reviews")}
              className={styles.seeAllBtn}
            >
              See all <ChevronRight size={15} />
            </button>
          </div>

          <div className={styles.pendingList}>
            {pending.map((item) => (
              <div key={item.id} className={styles.pendingItem}>
                <div className={styles.pendingProductRow}>
                  <img
                    src={
                      item.image || "https://via.placeholder.com/80?text=IMG"
                    }
                    alt={item.name}
                    className={styles.pendingImg}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=IMG";
                    }}
                  />
                  <div className={styles.pendingInfo}>
                    <p className={styles.pendingName}>{item.name}</p>
                    <p className={styles.pendingVariant}>{item.variant}</p>
                  </div>
                  {submitted[item.id] ? (
                    <span className={styles.submittedTag}>Submitted ✓</span>
                  ) : (
                    // Opens LeaveReviewSheet → POST /api/reviews/:productId/add
                    <button
                      className={styles.leaveReviewOrange}
                      onClick={() => openSheet(item)}
                    >
                      Leave a review
                    </button>
                  )}
                </div>

                <div className={styles.waitingRow}>
                  <Flame size={14} className={styles.flameIcon} />
                  <span className={styles.waitingCount}>
                    {item.waitingCount}
                  </span>
                  <span className={styles.waitingText}>
                    {" "}
                    people are waiting for your review.
                  </span>
                  {!submitted[item.id] && (
                    // Tapping a star also opens sheet pre-filled with that rating
                    <StarRow
                      rating={ratings[item.id] || 0}
                      size={20}
                      onChange={(v) => {
                        setRatings((r) => ({ ...r, [item.id]: v }));
                        openSheet(item, v);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShareModal
        open={!!shareTarget}
        item={shareTarget || {}}
        onClose={() => setShareTarget(null)}
      />

      {/* ── Product Feed ── */}
      {products.length > 0 && (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* ── Success Modal ── */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onGoToReviews={() => {
          setShowSuccessModal(false);
          navigate("/account-profile/reviews");
        }}
      />

      {/* ── Leave / Edit Review Sheet ── */}
      {sheetProduct && (
        <LeaveReviewSheet
          product={sheetProduct}
          initialRating={sheetInitialRating}
          onClose={closeSheet}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
