// src/pages/LeaveReview/LeaveReview.jsx
import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  Camera,
  Video,
  X,
  MessageCircle,
  ChevronRight,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./Leavereview.module.css";
import { LeavePageModal, SuccessModal } from "./ReviewModals";

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

function StarRating({ rating, onChange, size = 30 }) {
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

export default function LeaveReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const headers = useAuthHeaders();
  const photoRef = useRef();

  const product = location.state?.product || null;
  const editReview = location.state?.review || null;
  const isEdit = !!editReview;

  const [rating, setRating] = useState(
    editReview?.rating || location.state?.initialRating || 0,
  );
  const [showSheet, setShowSheet] = useState(
    !!(editReview?.rating || location.state?.initialRating),
  );
  const [reviewText, setReviewText] = useState(editReview?.comment || "");
  const [hideProfile, setHideProfile] = useState(
    editReview?.hide_profile || false,
  );
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const leaveShownRef = useRef(false);

  const handleRatingChange = (val) => setRating(val);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  // ── Submit: POST /api/reviews/:productId/add  OR  PUT /api/reviews/:reviewId/edit ──
  const handleSubmit = async () => {
    if (!rating || !product?.id) return;
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/api/reviews/${editReview.id}/edit`,
          { rating, comment: reviewText, hide_profile: hideProfile },
          { headers },
        );
      } else {
        await axios.post(
          `${API_URL}/api/reviews/${product.id}/add`,
          { rating, comment: reviewText, hide_profile: hideProfile },
          { headers },
        );
      }
      // Show success modal instead of navigating immediately
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
      setSubmitting(false);
    }
  };

  // ── Back button: show leave modal once per mount ──────────────────────────
  const handleBack = () => {
    if (!isEdit && !leaveShownRef.current) {
      leaveShownRef.current = true;
      setShowLeaveModal(true);
    } else {
      navigate(-1);
    }
  };

  // ── LeavePageModal submit: quick-rate then show success ──────────────────
  const handleLeaveModalSubmit = async ({
    rating: quickRating,
    hideProfile: quickHide,
  }) => {
    setShowLeaveModal(false);
    if (product?.id && quickRating) {
      try {
        await axios.post(
          `${API_URL}/api/reviews/${product.id}/add`,
          { rating: quickRating, hide_profile: quickHide },
          { headers },
        );
        setShowSuccessModal(true);
        return; // don't navigate yet — let success modal do it
      } catch (_) {
        // silent — user is leaving anyway
      }
    }
    navigate(-1);
  };

  // ── No product guard ──────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Leave a review</h1>
          <div style={{ width: 32 }} />
        </div>
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <p>No product selected.</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16,
              color: "#ff6f00",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Shared sub-sections ───────────────────────────────────────────────────
  const RatingHeader = () => (
    <div className={styles.ratingHeader}>
      <div className={styles.ratingHeaderLeft}>
        <span className={styles.asterisk}>*</span>
        <span className={styles.ratingLabel}>Rating</span>
        <StarRating rating={rating} onChange={handleRatingChange} size={28} />
        {rating > 0 && (
          <span className={styles.ratingWord}>{RATING_LABELS[rating]}</span>
        )}
      </div>
    </div>
  );

  const MediaSection = () => (
    <div className={styles.mediaRow}>
      <button
        className={styles.mediaBtn}
        onClick={() => photoRef.current?.click()}
      >
        <Camera size={26} />
        <span>Photo</span>
      </button>
      <button className={styles.mediaBtn}>
        <Video size={26} />
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
  );

  const TextSection = () => (
    <div className={styles.textareaWrap}>
      <textarea
        className={styles.textarea}
        placeholder="Sharing your thought and experience about this item."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
        rows={6}
      />
      <span className={styles.charCount}>
        {reviewText.length}/{MAX_CHARS}
      </span>
    </div>
  );

  const BottomSection = () => (
    <div className={styles.bottomSection}>
      {error && <p className={styles.errorMsg}>{error}</p>}
      <p className={styles.guidelines}>
        Please follow the{" "}
        <span className={styles.guidelinesLink}>review guidelines</span> when
        writing reviews.
      </p>
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!rating || submitting}
      >
        {submitting ? "Submitting…" : isEdit ? "Update Review" : "Submit"}
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
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>
          {isEdit ? "Edit review" : "Leave a review"}
        </h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Product row */}
      <div className={styles.productRow}>
        <img
          src={product.image || "https://via.placeholder.com/80?text=IMG"}
          alt={product.name}
          className={styles.productImg}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80?text=IMG";
          }}
        />
        <div className={styles.productInfo}>
          <p className={styles.productName}>{product.name}</p>
          <p className={styles.productVariant}>{product.variant}</p>
        </div>
      </div>

      <div className={styles.divider} />
      <RatingHeader />
      <div className={styles.divider} />

      {!showSheet && (
        <>
          <MediaSection />
          <TextSection />
          <BottomSection />
        </>
      )}

      {showSheet && (
        <div
          className={styles.sheetOverlay}
          onClick={() => setShowSheet(false)}
        >
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            {rating > 0 && rating <= 2 && (
              <div className={styles.getHelpBox}>
                <p className={styles.getHelpText}>
                  If you had any problems with shipping or the item, contact us!
                </p>
                <button className={styles.getHelpBtn}>
                  <MessageCircle size={14} /> Get help{" "}
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
            <MediaSection />
            <TextSection />
            <BottomSection />
          </div>
        </div>
      )}

      {/* Success Modal — shown after any review is submitted */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate(-1);
        }}
        onGoToReviews={() => {
          setShowSuccessModal(false);
          navigate("/account-profile/reviews");
        }}
      />

      {/* Leave Page Modal — shown once on back press without rating */}
      <LeavePageModal
        open={showLeaveModal}
        product={product}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleLeaveModalSubmit}
      />
    </div>
  );
}
