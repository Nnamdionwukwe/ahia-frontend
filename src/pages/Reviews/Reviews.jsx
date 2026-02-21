import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ThumbsUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./Reviews.module.css";

const RATING_LABELS = ["", "Poor", "Fair", "Average", "Good", "Excellent"];

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
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});

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
                  <button
                    className={styles.leaveBtn}
                    onClick={() =>
                      navigate("/leave-review", { state: { product: item } })
                    }
                  >
                    Leave a review
                  </button>
                )}
              </div>
              <div className={styles.waitingRow}>
                <Flame size={13} className={styles.flameIcon} />
                <span className={styles.waitingCount}>{item.waitingCount}</span>
                <span className={styles.waitingText}>
                  {" "}
                  people are waiting for your review.
                </span>
                <StarRow
                  rating={ratings[item.id] || 0}
                  onChange={(v) => {
                    setRatings((r) => ({ ...r, [item.id]: v }));
                    navigate("/leave-review", {
                      state: { product: item, initialRating: v },
                    });
                  }}
                />
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
    </div>
  );
}
