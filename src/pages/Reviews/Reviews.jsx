import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Flame,
  Camera,
  Video,
  X,
  MessageCircle,
  User,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./Reviews.module.css";

const RATING_LABELS = ["", "Poor", "Fair", "Average", "Good", "Excellent"];
const MAX_CHARS = 3000;

const PENDING_REVIEWS = [
  {
    id: 1,
    name: "109.98cm LED Square Light Kit,...",
    variant: "10INFD110",
    image: "https://via.placeholder.com/80/333/fff?text=LED",
    waitingCount: "999+",
  },
  {
    id: 2,
    name: "1pc SoundWave Portable Wirele...",
    variant: "Black",
    image: "https://via.placeholder.com/80/111/fff?text=SPK",
    waitingCount: "999+",
  },
  {
    id: 3,
    name: "Unadorned Pure Surface Curved...",
    variant: "Dark Gray",
    image: "https://via.placeholder.com/80/222/fff?text=CAP",
    waitingCount: "999+",
  },
  {
    id: 4,
    name: "2026 New High-Quality Soft-To...",
    variant: "Black",
    image: "https://via.placeholder.com/80/444/fff?text=HAT",
    waitingCount: "231",
  },
  {
    id: 5,
    name: "A Pair of Retro Small Square...",
    variant: "Transparent Frame Gray",
    image: "https://via.placeholder.com/80/555/fff?text=SUN",
    waitingCount: "999+",
  },
  {
    id: 6,
    name: "Women's & Men's Oversized...",
    variant: "All Grey",
    image: "https://via.placeholder.com/80/666/fff?text=SUN",
    waitingCount: "999+",
  },
];

const REVIEWED = [
  {
    id: 7,
    name: "Wireless Earbuds Pro Max",
    variant: "White",
    image: "https://via.placeholder.com/80/888/fff?text=EAR",
    rating: 5,
    reviewText: "Excellent sound quality!",
  },
  {
    id: 8,
    name: "USB-C Fast Charging Cable",
    variant: "Black 2m",
    image: "https://via.placeholder.com/80/999/fff?text=CBL",
    rating: 4,
    reviewText: "Good value for money.",
  },
];

const maskName = (name = "") => {
  if (!name) return "User";
  return name
    .trim()
    .split(" ")
    .map((s) => (s.length <= 2 ? s : s[0] + "***" + s[s.length - 1]))
    .join(" ");
};

function StarRow({ rating, onChange, size = 20 }) {
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

function LeaveReviewSheet({ product, initialRating, onClose, onSubmitted }) {
  const { user } = useAuthStore();
  const photoRef = useRef();
  const [rating, setRating] = useState(initialRating || 0);
  const [reviewText, setReviewText] = useState("");
  const [hideProfile, setHideProfile] = useState(false);
  const [photos, setPhotos] = useState([]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  const handleSubmit = () => {
    onSubmitted(product.id);
    onClose();
  };

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Sheet header — rating + close */}
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

        {/* Get help — only 1 or 2 stars */}
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

        {/* Textarea */}
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

        {/* Guidelines + Submit */}
        <div className={styles.sheetBottom}>
          <p className={styles.guidelines}>
            Please follow the{" "}
            <span className={styles.guidelinesLink}>review guidelines</span>{" "}
            when writing reviews.
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
      </div>
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [sheetProduct, setSheetProduct] = useState(null);
  const [sheetInitialRating, setSheetInitialRating] = useState(0);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});

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
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Your reviews</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Profile */}
      <div className={styles.profile}>
        <img
          src={
            user?.avatar ||
            `https://via.placeholder.com/80/d4a574/fff?text=${(user?.full_name || "U")[0]}`
          }
          alt={user?.full_name || "User"}
          className={styles.avatar}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80/d4a574/fff?text=U";
          }}
        />
        <div>
          <p className={styles.profileName}>{user?.full_name || "Guest"}</p>
          <div className={styles.profileSub}>
            <ThumbsUp size={14} />
            <span>1 person found your reviews helpful</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "pending" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Ready for review ({PENDING_REVIEWS.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reviewed" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("reviewed")}
        >
          Reviewed ({REVIEWED.length})
        </button>
      </div>

      {/* Review all bar */}
      {activeTab === "pending" && (
        <div className={styles.reviewAllBar}>
          <span className={styles.reviewAllText}>
            Review all items from an order
          </span>
          <button className={styles.chooseBtn}>
            Choose <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Pending list */}
      {activeTab === "pending" && (
        <div className={styles.list}>
          {PENDING_REVIEWS.map((item) => (
            <div key={item.id} className={styles.reviewBlock}>
              <div className={styles.productRow}>
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
                {submitted[item.id] ? (
                  <span className={styles.submittedTag}>Submitted ✓</span>
                ) : (
                  <Link to="/leave-review">
                    <button className={styles.leaveBtn}>Leave a review</button>
                  </Link>
                )}
              </div>
              <div className={styles.waitingRow}>
                <Flame size={13} className={styles.flameIcon} />
                <span className={styles.waitingCount}>{item.waitingCount}</span>
                <span className={styles.waitingText}>
                  {" "}
                  people are waiting for your review.
                </span>
                {!submitted[item.id] && (
                  <StarRow
                    rating={ratings[item.id] || 0}
                    size={18}
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
      )}

      {/* Reviewed list */}
      {activeTab === "reviewed" && (
        <div className={styles.list}>
          {REVIEWED.map((item) => (
            <div key={item.id} className={styles.reviewBlock}>
              <div className={styles.productRow}>
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
                  <StarRow rating={item.rating} size={16} />
                </div>
              </div>
              <p className={styles.reviewedText}>"{item.reviewText}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Review Sheet */}
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
