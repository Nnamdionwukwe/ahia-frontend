import React, { useState, useRef, useEffect } from "react";
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
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import styles from "./Reviews.module.css";
import axios from "axios";
import ProductCard from "../../components/ProductCard/ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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
    name: "Future oriented integrated glasses with dazzling col...",
    variant: "C2",
    image: "https://via.placeholder.com/80/c0c0c0/333?text=Glass",
    rating: 5,
    reviewText: "",
    date: "Dec 6, 2025",
    helpfulCount: 0,
  },
  {
    id: 8,
    name: "AOCHUAN SmartX Pro Combo 1 - Wireless Phone Gi...",
    variant: "SmartXProCombo1",
    image: "https://via.placeholder.com/80/1a1a2e/fff?text=Gimbal",
    rating: 5,
    reviewText:
      "This my best purchase in Temu great for its price thank you Team Temu",
    date: "Dec 6, 2025",
    helpfulCount: 0,
  },
  {
    id: 9,
    name: "Fashionable Anti-blue Light Glasses, Trendy Fr...",
    variant: "White",
    image: "https://via.placeholder.com/80/e8eaf6/333?text=Frames",
    rating: 2,
    reviewText: "Not cool way too small than it was advertised",
    date: "Nov 14, 2025",
    helpfulCount: 0,
  },
  {
    id: 10,
    name: "Women's High Waist Slim Ankle Length Trousers...",
    variant: "Black",
    image: "https://via.placeholder.com/80/1c1c1c/fff?text=Pants",
    rating: 5,
    reviewText:
      "I thought it was ankle length guess I didn't look at it properly but it's of nice quality",
    date: "Nov 14, 2025",
    helpfulCount: 0,
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

// ── Reviewed Card (matches the screenshot) ────────────────────────────────────
function ReviewedCard({ item, user, onHelpful, onEdit, onDelete, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const navigate = useNavigate();

  const handleHelpful = () => {
    setHelpful((h) => !h);
    onHelpful?.(item.id);
  };

  return (
    <div className={styles.reviewedCard}>
      {/* Top row: avatar + name + date + menu */}
      <div className={styles.reviewedHeader}>
        <img
          src={
            user?.avatar ||
            `https://via.placeholder.com/36/d4a574/fff?text=${(user?.full_name || "U")[0]}`
          }
          alt={user?.full_name}
          className={styles.reviewedAvatar}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/36/d4a574/fff?text=U";
          }}
        />
        <div className={styles.reviewedMeta}>
          <span className={styles.reviewedName}>
            {user?.full_name || "Guest"}
          </span>
          <span className={styles.reviewedDate}>on {item.date}</span>
        </div>
        <div className={styles.menuWrap}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  onEdit?.(item);
                  setMenuOpen(false);
                }}
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => {
                  onDelete?.(item.id);
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Star rating */}
      <div className={styles.reviewedStars}>
        <StarRow rating={item.rating} size={18} />
      </div>

      {/* Review text */}
      {item.reviewText ? (
        <p className={styles.reviewedBody}>{item.reviewText}</p>
      ) : null}

      {/* Action row: Helpful | Edit | Delete  +  Share */}
      <div className={styles.reviewedActions}>
        <div className={styles.reviewedActionsLeft}>
          <button
            className={`${styles.actionBtn} ${helpful ? styles.actionBtnActive : ""}`}
            onClick={handleHelpful}
          >
            <ThumbsUp size={14} />
            Helpful
          </button>
          <span className={styles.actionDivider}>|</span>
          <button className={styles.actionBtn} onClick={() => onEdit?.(item)}>
            Edit
          </button>
          <span className={styles.actionDivider}>|</span>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
            onClick={() => onDelete?.(item.id)}
          >
            Delete
          </button>
        </div>
        <button className={styles.shareBtn} onClick={() => onShare?.(item)}>
          <Share2 size={14} /> Share
        </button>
      </div>

      {/* Product strip */}
      <div
        onClick={() => navigate("/review-details")}
        className={styles.productStrip}
      >
        <img
          src={item.image}
          alt={item.name}
          className={styles.productStripImg}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/64?text=IMG";
          }}
        />
        <div className={styles.productStripInfo}>
          <p className={styles.productStripName}>{item.name}</p>
          <p className={styles.productStripVariant}>{item.variant}</p>
        </div>
      </div>
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
  const [reviewed, setReviewed] = useState(REVIEWED);
  const [products, setProducts] = useState([]);

  const openSheet = (product, initialRating = 0) => {
    setSheetProduct(product);
    setSheetInitialRating(initialRating);
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

  const closeSheet = () => {
    setSheetProduct(null);
    setSheetInitialRating(0);
  };

  const handleSubmitted = (productId) => {
    setSubmitted((s) => ({ ...s, [productId]: true }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this review?")) {
      setReviewed((r) => r.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (item) => {
    openSheet(item, item.rating);
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({ title: item.name, text: item.reviewText });
    }
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
          Reviewed ({reviewed.length})
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
              <div
                className={styles.productRow}
                onClick={() => navigate("/leave-review")}
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
                    onClick={() => navigate("/leave-review")}
                    className={styles.leaveBtn}
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
          {reviewed.length === 0 ? (
            <div className={styles.emptyReviewed}>
              <ThumbsUp size={40} opacity={0.2} />
              <p>No reviews yet</p>
            </div>
          ) : (
            reviewed.map((item) => (
              <ReviewedCard
                key={item.id}
                item={item}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))
          )}
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
