// src/pages/LeaveAllReviews/LeaveAllReviews.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Camera, Video, X, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./LeaveAllReviews.module.css";

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

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, onChange, size = 26 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;
  return (
    <div className={styles.stars}>
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

// ── Single item review block ──────────────────────────────────────────────────
function ItemReviewBlock({ item, reviewData, onChange }) {
  const photoRef = useRef();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    onChange(
      item.id,
      "photos",
      [...(reviewData.photos || []), ...urls].slice(0, 9),
    );
  };

  return (
    <div className={styles.itemBlock}>
      {/* Product header */}
      <div className={styles.productHeader}>
        <img
          src={item.image || "https://via.placeholder.com/80?text=IMG"}
          alt={item.name}
          className={styles.productImg}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80?text=IMG";
          }}
        />
        <div className={styles.productInfo}>
          <p className={styles.productName}>{item.name}</p>
          <p className={styles.productVariant}>{item.variant}</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Rating */}
      <div className={styles.ratingRow}>
        <span className={styles.asterisk}>*</span>
        <span className={styles.ratingLabel}>Rating</span>
        <StarRating
          rating={reviewData.rating || 0}
          onChange={(v) => onChange(item.id, "rating", v)}
        />
        {reviewData.rating > 0 && (
          <span className={styles.ratingWord}>
            {RATING_LABELS[reviewData.rating]}
          </span>
        )}
      </div>

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
        {(reviewData.photos || []).map((p, i) => (
          <div key={i} className={styles.photoThumb}>
            <img src={p} alt="" />
            <button
              className={styles.removePhoto}
              onClick={() =>
                onChange(
                  item.id,
                  "photos",
                  reviewData.photos.filter((_, j) => j !== i),
                )
              }
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

      {/* Textarea */}
      <div className={styles.textareaWrap}>
        <textarea
          className={styles.textarea}
          placeholder="Sharing your thought and experience about this item."
          value={reviewData.text || ""}
          onChange={(e) =>
            onChange(item.id, "text", e.target.value.slice(0, MAX_CHARS))
          }
          rows={4}
        />
        <span className={styles.charCount}>
          {(reviewData.text || "").length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LeaveAllReviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const headers = useAuthHeaders();

  // Order passed from ChooseOrderSheet → { id, deliveredDate, items: [{id, name, variant, image}] }
  const passedOrder = location.state?.order || null;

  const [items, setItems] = useState(passedOrder?.items || []);
  const [reviewData, setReviewData] = useState({});
  const [hideProfile, setHideProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!passedOrder);

  // If no order was passed, fetch the most recent delivered order
  const fetchLatestOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/reviews/user/orders`, {
        headers,
      });
      if (res.data.success && res.data.orders?.length > 0) {
        setItems(res.data.orders[0].items || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err.message);
      setError("Could not load order items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!passedOrder) fetchLatestOrder();
  }, [passedOrder, fetchLatestOrder]);

  const handleChange = (itemId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    // Build reviews array — only items that have a rating
    const reviews = items
      .filter((item) => reviewData[item.id]?.rating > 0)
      .map((item) => ({
        productId: item.id,
        rating: reviewData[item.id].rating,
        comment: reviewData[item.id].text || "",
        hide_profile: hideProfile,
        images: [], // photo upload to storage not implemented yet
      }));

    if (reviews.length === 0) {
      setError("Please rate at least one item before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // POST /api/reviews/bulk
      const res = await axios.post(
        `${API_URL}/api/reviews/bulk`,
        { reviews },
        { headers },
      );

      if (res.data.success) {
        const { submitted, errors } = res.data;
        if (errors?.length > 0) {
          // Some failed (e.g. already reviewed) — show partial success
          const msgs = errors.map((e) => e.error).join(", ");
          setError(`${submitted} submitted. Skipped: ${msgs}`);
          // Still navigate after a short delay so user sees the message
          setTimeout(() => navigate(-1), 2500);
        } else {
          navigate(-1);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit reviews");
    } finally {
      setSubmitting(false);
    }
  };

  const ratedCount = items.filter(
    (item) => reviewData[item.id]?.rating > 0,
  ).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Leave all reviews</h1>
          <div style={{ width: 32 }} />
        </div>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Leave all reviews</h1>
          <div style={{ width: 32 }} />
        </div>
        <div className={styles.emptyState}>
          <p>No items to review in this order.</p>
          <button onClick={() => navigate(-1)} className={styles.goBackBtn}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Leave all reviews</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Progress indicator */}
      <div className={styles.progressBar}>
        <div className={styles.progressText}>
          {ratedCount} of {items.length} rated
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${items.length > 0 ? (ratedCount / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Item review blocks */}
      <div className={styles.itemsList}>
        {items.map((item) => (
          <ItemReviewBlock
            key={item.id}
            item={item}
            reviewData={reviewData[item.id] || {}}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Error message */}
      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* Bottom fixed bar */}
      <div className={styles.bottomFixed}>
        <p className={styles.guidelines}>
          Please follow the{" "}
          <span className={styles.guidelinesLink}>review guidelines</span> when
          writing reviews.
        </p>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || ratedCount === 0}
        >
          {submitting
            ? "Submitting…"
            : ratedCount > 0
              ? `Submit ${ratedCount} review${ratedCount > 1 ? "s" : ""}`
              : "Rate items to submit"}
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
  );
}
