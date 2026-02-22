import React, { useState, useRef } from "react";
import { ChevronLeft, Camera, Video, X, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./LeaveAllReviews.module.css";

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

// Mock fallback order items
const FALLBACK_ITEMS = [
  {
    id: 1,
    name: "25.4 cm Backlit for iPad Rechargeable Keyboar...",
    variant: "Black",
    image: "https://via.placeholder.com/80/111/fff?text=KB",
  },
  {
    id: 2,
    name: "2 Colors Available, 1pc Rotating Full Metal 360...",
    variant: "Purple",
    image: "https://via.placeholder.com/80/6c5ce7/fff?text=Stand",
  },
  {
    id: 3,
    name: "RGB Gaming Mouse Pad Extra Large...",
    variant: "Black",
    image: "https://via.placeholder.com/80/2d3436/fff?text=Pad",
  },
  {
    id: 4,
    name: "Vintage Leather Crossbody Shoulder Bag...",
    variant: "Brown",
    image: "https://via.placeholder.com/80/4a4a4a/fff?text=Bag",
  },
];

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
          src={item.image}
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

      {/* Rating row */}
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
    </div>
  );
}

export default function LeaveAllReviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const order = location.state?.order;
  const items = order?.items?.length
    ? order.items.map((item, i) => ({
        ...item,
        name:
          item.name ||
          FALLBACK_ITEMS[i % FALLBACK_ITEMS.length]?.name ||
          `Item ${i + 1}`,
        variant:
          item.variant ||
          FALLBACK_ITEMS[i % FALLBACK_ITEMS.length]?.variant ||
          "",
      }))
    : FALLBACK_ITEMS;

  // reviewData keyed by item id
  const [reviewData, setReviewData] = useState({});
  const [hideProfile, setHideProfile] = useState(false);

  const handleChange = (itemId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    // Submit logic here
    navigate(-1);
  };

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

      {/* Items */}
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

      {/* Bottom fixed */}
      <div className={styles.bottomFixed}>
        <p className={styles.guidelines}>
          Please follow the{" "}
          <span className={styles.guidelinesLink}>review guidelines</span> when
          writing reviews.
        </p>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit all reviews
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
