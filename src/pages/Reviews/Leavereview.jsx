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
import useAuthStore from "../../store/authStore";
import styles from "./Leavereview.module.css";

const RATING_LABELS = ["", "Poor", "Fair", "Average", "Good", "Excellent"];
const MAX_CHARS = 3000;

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
  const photoRef = useRef();

  const product = location.state?.product || {
    name: "HD Camera for Smartphones, High Quality Mo...",
    variant: "【Black】 2 in 1 HD mobile phone lens",
    image: "https://via.placeholder.com/80/333/fff?text=CAM",
  };

  const [rating, setRating] = useState(location.state?.initialRating || 0);
  const [showSheet, setShowSheet] = useState(!!location.state?.initialRating);
  const [reviewText, setReviewText] = useState("");
  const [hideProfile, setHideProfile] = useState(false);
  const [photos, setPhotos] = useState([]);

  const handleRatingChange = (val) => {
    setRating(val);
    // setShowSheet(true);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  const handleSubmit = () => navigate(-1);

  const RatingHeader = ({ onClose }) => (
    <div className={styles.ratingHeader}>
      <div className={styles.ratingHeaderLeft}>
        <span className={styles.asterisk}>*</span>
        <span className={styles.ratingLabel}>Rating</span>
        <StarRating rating={rating} onChange={handleRatingChange} size={28} />
        {rating > 0 && (
          <span className={styles.ratingWord}>{RATING_LABELS[rating]}</span>
        )}
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      )}
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
      <p className={styles.guidelines}>
        Please follow the{" "}
        <span className={styles.guidelinesLink}>review guidelines</span> when
        writing reviews.
      </p>
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!rating}
      >
        Submit
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
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Leave a review</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Product */}
      <div className={styles.productRow}>
        <img
          src={product.image}
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

      {/* Inline rating */}
      <RatingHeader />

      <div className={styles.divider} />

      {/* Media + Textarea shown on page (before sheet opens) */}
      {!showSheet && (
        <>
          <MediaSection />
          <TextSection />
          <BottomSection />
        </>
      )}

      {/* Rating Bottom Sheet */}
      {showSheet && (
        <div
          className={styles.sheetOverlay}
          onClick={() => setShowSheet(false)}
        >
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            {/* Sheet rating header with close */}
            <RatingHeader onClose={() => setShowSheet(false)} />

            {/* Get help — only for 1 or 2 stars */}
            {rating <= 2 && rating > 0 && (
              <div className={styles.getHelpBox}>
                <p className={styles.getHelpText}>
                  If you had any problems with shipping or the item, contact us!
                </p>
                <button className={styles.getHelpBtn}>
                  <MessageCircle size={14} />
                  Get help <ChevronRight size={13} />
                </button>
              </div>
            )}

            <MediaSection />
            <TextSection />
            <BottomSection />
          </div>
        </div>
      )}
    </div>
  );
}
