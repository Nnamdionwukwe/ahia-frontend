// src/components/reviews/ReviewDetails.jsx
import { useState } from "react";
import { ChevronLeft, ChevronRight, Share2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./ReviewDetails.module.css";

const maskName = (name = "") => {
  if (!name) return "User";
  return name
    .trim()
    .split(" ")
    .map((s) => (s.length <= 2 ? s : s[0] + "***" + s[s.length - 1]))
    .join(" ");
};

// ── Star Row (display only / interactive) ──────────────────────────────────
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

// ── Mock data ────────────────────────────────────────────────────────────────
const THIS_REVIEW = {
  id: 1,
  name: "Future oriented integrated glasses with dazz...",
  variant: "C2",
  image: "https://via.placeholder.com/80/c8c8c8/333?text=👓",
  rating: 5,
  reviewText: "",
  date: "Dec 6, 2025",
};

// Items in the same order — for "Quickly review all" carousel
const ORDER_ITEMS = [
  {
    id: 10,
    image: "https://via.placeholder.com/360/b0b8c1/fff?text=LED+Light",
  },
  {
    id: 11,
    image: "https://via.placeholder.com/360/1c1c2e/fff?text=Speaker",
  },
  {
    id: 12,
    image: "https://via.placeholder.com/360/2d4a2d/fff?text=Cap",
  },
];

// Items ready for review list
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

// ════════════════════════════════════════════════════════════════════════════
export default function ReviewDetails() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [ratings, setRatings] = useState({});

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

          {/* Prev / Next arrows */}
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

        {/* Dots + Leave a review button */}
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
          <button className={styles.seeAllBtn}>
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
                <button
                  className={styles.leaveReviewOrange}
                  onClick={() => navigate("/leave-review")}
                >
                  Leave a review
                </button>
              </div>

              {/* Waiting row */}
              <div className={styles.waitingRow}>
                <Flame size={14} className={styles.flameIcon} />
                <span className={styles.waitingCount}>{item.waitingCount}</span>
                <span className={styles.waitingText}>
                  {" "}
                  people are waiting for your review.
                </span>
                <StarRow
                  rating={ratings[item.id] || 0}
                  size={20}
                  onChange={(v) => setRatings((r) => ({ ...r, [item.id]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
