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

function StarRating({ rating, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;
  return (
    <div className={styles.starRow}>
      <span className={styles.ratingAsterisk}>*</span>
      <span className={styles.ratingLabel}>Rating</span>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className={`${styles.star} ${active >= s ? styles.starFilled : ""}`}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      {active > 0 && (
        <span className={styles.ratingWord}>{RATING_LABELS[active]}</span>
      )}
    </div>
  );
}

export default function LeaveReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const product = location.state?.product || {
    name: "HD Camera for Smartphones, High Quality Mo...",
    variant: "【Black】 2 in 1 HD mobile phone lens",
    image: "https://via.placeholder.com/80/333/fff?text=CAM",
  };

  const [rating, setRating] = useState(0);
  const [showRatingSheet, setShowRatingSheet] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [hideProfile, setHideProfile] = useState(false);
  const [photos, setPhotos] = useState([]);
  const photoRef = useRef();
  const MAX = 3000;

  // Masked name: Nn***we
  const maskName = (name = "") => {
    if (!name) return "User";
    const parts = name.trim().split(" ");
    const mask = (s) => (s.length <= 2 ? s : s[0] + "***" + s[s.length - 1]);
    return parts.map(mask).join(" ");
  };

  const handleRatingChange = (val) => {
    setRating(val);
    setShowRatingSheet(true);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

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

      <div className={styles.body}>
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

        {/* Star Rating — top inline */}
        <StarRating rating={rating} onChange={handleRatingChange} />

        <div className={styles.divider} />

        {/* Media upload */}
        <div className={styles.mediaRow}>
          <button
            className={styles.mediaBtn}
            onClick={() => photoRef.current?.click()}
          >
            <Camera size={28} />
            <span>Photo</span>
          </button>
          <button className={styles.mediaBtn}>
            <Video size={28} />
            <span>Video</span>
          </button>
          {photos.map((p, i) => (
            <div key={i} className={styles.photoThumb}>
              <img src={p} alt="" />
              <button
                className={styles.removePhoto}
                onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              >
                <X size={12} />
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

        {/* Text area */}
        <div className={styles.textareaWrap}>
          <textarea
            className={styles.textarea}
            placeholder="Sharing your thought and experience about this item."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, MAX))}
            rows={6}
          />
          <span className={styles.charCount}>
            {reviewText.length}/{MAX}
          </span>
        </div>
      </div>

      {/* Bottom fixed */}
      <div className={styles.bottom}>
        <p className={styles.guidelines}>
          Please follow the{" "}
          <span className={styles.guidelinesLink}>review guidelines</span> when
          writing reviews.
        </p>
        <button
          className={styles.submitBtn}
          onClick={() => navigate(-1)}
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
          <User size={16} className={styles.hideIcon} />
          <span className={styles.hideName}>{maskName(user?.full_name)}</span>
        </div>
      </div>

      {/* Rating Bottom Sheet */}
      {showRatingSheet && (
        <div
          className={styles.sheetOverlay}
          onClick={() => setShowRatingSheet(false)}
        >
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            {/* Sheet star rating + close */}
            <div className={styles.sheetHeader}>
              <StarRating rating={rating} onChange={(v) => setRating(v)} />
              <button
                className={styles.sheetClose}
                onClick={() => setShowRatingSheet(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Get help — only for 1, 2 stars */}
            {rating <= 2 && (
              <div className={styles.getHelpBox}>
                <p className={styles.getHelpText}>
                  If you had any problems with shipping or the item, contact us!
                </p>
                <button className={styles.getHelpBtn}>
                  <MessageCircle size={15} />
                  Get help <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Media */}
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
            </div>

            {/* Textarea */}
            <div className={styles.textareaWrap}>
              <textarea
                className={styles.textarea}
                placeholder="Sharing your thought and experience about this item."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, MAX))}
                rows={5}
                autoFocus
              />
              <span className={styles.charCount}>
                {reviewText.length}/{MAX}
              </span>
            </div>

            {/* Guidelines + Submit */}
            <p className={styles.guidelines}>
              Please follow the{" "}
              <span className={styles.guidelinesLink}>review guidelines</span>{" "}
              when writing reviews.
            </p>
            <button
              className={styles.submitBtn}
              onClick={() => {
                setShowRatingSheet(false);
                navigate(-1);
              }}
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
              <User size={16} className={styles.hideIcon} />
              <span className={styles.hideName}>
                {maskName(user?.full_name)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
