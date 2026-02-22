import { useState, useRef } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./ReviewDetails.module.css";

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

// ── Leave Review Sheet ────────────────────────────────────────────────────────
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
    onSubmitted?.(product?.id);
    onClose();
  };

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Sheet Header — rating + close */}
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

        {/* Bottom */}
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const THIS_REVIEW = {
  id: 1,
  name: "Future oriented integrated glasses with dazz...",
  variant: "C2",
  image: "https://via.placeholder.com/80/c8c8c8/333?text=👓",
  rating: 5,
  date: "Dec 6, 2025",
};

const ORDER_ITEMS = [
  {
    id: 10,
    image: "https://via.placeholder.com/360/b0b8c1/fff?text=LED+Light",
  },
  { id: 11, image: "https://via.placeholder.com/360/1c1c2e/fff?text=Speaker" },
  { id: 12, image: "https://via.placeholder.com/360/2d4a2d/fff?text=Cap" },
];

const PENDING = [
  {
    id: 1,
    name: "109.98cm LED Square ...",
    variant: "10INFD110",
    image: "https://via.placeholder.com/80/b0b8c1/333?text=LED",
    waitingCount: "999+",
  },
  {
    id: 2,
    name: "1pc SoundWave Portab...",
    variant: "Black",
    image: "https://via.placeholder.com/80/1c1c2e/fff?text=SPK",
    waitingCount: "999+",
  },
  {
    id: 3,
    name: "Unadorned Pure Surface Curved...",
    variant: "Dark Gray",
    image: "https://via.placeholder.com/80/444/fff?text=Cap",
    waitingCount: "512",
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReviewDetails() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [sheetProduct, setSheetProduct] = useState(null);
  const [sheetInitialRating, setSheetInitialRating] = useState(0);

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

  const prevSlide = () => setCarouselIndex((i) => Math.max(0, i - 1));
  const nextSlide = () =>
    setCarouselIndex((i) => Math.min(ORDER_ITEMS.length - 1, i + 1));

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Review details</h1>
        <button className={styles.iconBtn}>
          <Share2 size={20} />
        </button>
      </div>

      {/* ── This Review Card ── */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <div className={styles.reviewerInfo}>
            <div className={styles.reviewerAvatar}>
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
            </div>
            <span className={styles.reviewerName}>
              {maskName(user?.full_name || "Nnamdi Onwukwe")}
            </span>
          </div>
          <span className={styles.reviewDate}>{THIS_REVIEW.date}</span>
        </div>

        <StarRow rating={THIS_REVIEW.rating} size={20} />

        <div className={styles.productStrip}>
          <img
            src={THIS_REVIEW.image}
            alt={THIS_REVIEW.name}
            className={styles.productStripImg}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/64?text=IMG";
            }}
          />
          <div className={styles.productStripInfo}>
            <p className={styles.productStripName}>{THIS_REVIEW.name}</p>
            <p className={styles.productStripVariant}>{THIS_REVIEW.variant}</p>
          </div>
        </div>
      </div>

      {/* ── Quickly review all items ── */}
      <div className={styles.quickReviewSection}>
        <h2 className={styles.quickReviewTitle}>
          Quickly review all items in this order.
        </h2>

        {/* Carousel */}
        <div className={styles.carouselWrap}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {ORDER_ITEMS.map((item) => (
              <div key={item.id} className={styles.carouselSlide}>
                <img
                  src={item.image}
                  alt=""
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
          {carouselIndex < ORDER_ITEMS.length - 1 && (
            <button
              className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
              onClick={nextSlide}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Dots + Leave a review */}
        <div className={styles.carouselFooter}>
          <div className={styles.dots}>
            {ORDER_ITEMS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === carouselIndex ? styles.dotActive : ""}`}
                onClick={() => setCarouselIndex(i)}
              />
            ))}
          </div>
          <button
            className={styles.leaveReviewOutline}
            onClick={() => navigate("/leave-review")}
          >
            Leave a review
          </button>
        </div>
      </div>

      {/* ── Items ready for review ── */}
      <div className={styles.pendingSection}>
        <div className={styles.pendingHeader}>
          <div>
            <h2 className={styles.pendingTitle}>
              Items ready for review ({PENDING.length + 16})
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
          {PENDING.map((item) => (
            <div key={item.id} className={styles.pendingItem}>
              {/* Product row */}
              <div className={styles.pendingProductRow}>
                <img
                  src={item.image}
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
                  <button
                    className={styles.leaveReviewOrange}
                    onClick={() => navigate("/leave-review")}
                  >
                    Leave a review
                  </button>
                )}
              </div>

              {/* Waiting row */}
              <div className={styles.waitingRow}>
                <Flame size={14} className={styles.flameIcon} />
                <span className={styles.waitingCount}>{item.waitingCount}</span>
                <span className={styles.waitingText}>
                  {" "}
                  people are waiting for your review.
                </span>
                {!submitted[item.id] && (
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

      {/* ── Leave Review Sheet ── */}
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
