import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ThumbsUp, Flame, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./Reviews.module.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

function StarRating({ rating = 0, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={18}
          className={`${styles.star} ${(hovered || rating) >= s ? styles.starFilled : ""}`}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(s)}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [ratings, setRatings] = useState({});
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState({});

  const [products, setProducts] = useState([]);

  const handleSubmit = () => {
    if (!reviewModal) return;
    setSubmitted((s) => ({ ...s, [reviewModal.id]: true }));
    setReviewModal(null);
    setReviewText("");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          params: { limit: 20, sort: "shuffle" },
        });
        const data =
          res.data?.products ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err.message);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Your reviews</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* ── Profile ── */}
      <div className={styles.profile}>
        <img
          src={
            user?.avatar ||
            `https://via.placeholder.com/80/d4a574/ffffff?text=${(user?.full_name || "U")[0]}`
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

      {/* ── Tabs ── */}
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

      {/* ── Review all bar ── */}
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

      {/* ── Pending list ── */}
      {activeTab === "pending" && (
        <div className={styles.list}>
          {PENDING_REVIEWS.map((item) => (
            <div key={item.id} className={styles.reviewBlock}>
              <div
                onClick={() =>
                  navigate("/leave-review", { state: { product: item } })
                }
                className={styles.productRow}
              >
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
                <StarRating
                  rating={ratings[item.id] || 0}
                  onChange={(v) => setRatings((r) => ({ ...r, [item.id]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reviewed list ── */}
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
                  <StarRating rating={item.rating} />
                </div>
              </div>
              <p className={styles.reviewedText}>"{item.reviewText}"</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setReviewModal(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Leave a Review</h3>

            <p className={styles.modalProduct}>{reviewModal.name}</p>
            <p className={styles.modalVariant}>{reviewModal.variant}</p>
            <div className={styles.modalStars}>
              <StarRating
                rating={ratings[reviewModal.id] || 0}
                onChange={(v) =>
                  setRatings((r) => ({ ...r, [reviewModal.id]: v }))
                }
              />
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setReviewModal(null)}
              >
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleSubmit}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Feed */}
      {products.length > 0 && (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
