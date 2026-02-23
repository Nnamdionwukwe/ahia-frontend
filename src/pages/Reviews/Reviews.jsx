import { useState, useRef, useEffect, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./Reviews.module.css";
import ChooseOrderSheet from "./ChooseOrderSheet";
import ProductCard from "../../components/ProductCard/ProductCard";
import {
  LeavePageModal,
  SuccessModal,
  DeleteReviewModal,
} from "./ReviewModals"; // ← added SuccessModal

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

// ── Star Row ──────────────────────────────────────────────────────────────────
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

// ── Reviewed Card ─────────────────────────────────────────────────────────────
function ReviewedCard({ item, user, onHelpful, onEdit, onDelete, onShare }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpful, setHelpful] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  return (
    <div className={styles.reviewedCard}>
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
            {item.hide_profile
              ? maskName(user?.full_name)
              : user?.full_name || "Guest"}
          </span>
          <span className={styles.reviewedDate}>on {item.date}</span>
        </div>
        <div className={styles.menuWrap} onClick={(e) => e.stopPropagation()}>
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

      <div className={styles.reviewedStars}>
        <StarRow rating={item.rating} size={18} />
      </div>

      {item.reviewText && (
        <p className={styles.reviewedBody}>{item.reviewText}</p>
      )}

      {item.images?.length > 0 && (
        <div className={styles.reviewImages}>
          {item.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className={styles.reviewImage}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.reviewedActions}>
        <div className={styles.reviewedActionsLeft}>
          <button
            className={`${styles.actionBtn} ${helpful ? styles.actionBtnActive : ""}`}
            onClick={() => {
              setHelpful((h) => !h);
              onHelpful?.(item.id);
            }}
          >
            <ThumbsUp size={14} />
            Helpful {item.helpfulCount > 0 && `(${item.helpfulCount})`}
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

      <div
        className={styles.productStrip}
        onClick={() => navigate("/review-details", { state: { review: item } })}
      >
        <img
          src={item.image || "https://via.placeholder.com/64?text=IMG"}
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

// ── Leave / Edit Review Sheet ─────────────────────────────────────────────────
function LeaveReviewSheet({ product, initialRating, onClose, onSubmitted }) {
  const { user } = useAuthStore();
  const headers = useAuthHeaders();
  const photoRef = useRef();
  const [rating, setRating] = useState(initialRating || 0);
  const [reviewText, setReviewText] = useState(product?.reviewText || "");
  const [hideProfile, setHideProfile] = useState(
    product?.hide_profile || false,
  );
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ← added

  // product.productId present = editing existing review; otherwise = new
  const isEdit = !!(product?.id && product?.productId);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/api/reviews/${product.id}/edit`,
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
      onSubmitted();
      setShowSuccessModal(true); // ← show instead of closing directly
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
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

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.sheetBottom}>
          <p className={styles.guidelines}>
            Please follow the{" "}
            <span className={styles.guidelinesLink}>review guidelines</span>{" "}
            when writing reviews.
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
      </div>

      {/* ← Success Modal inside the sheet overlay so it sits on top */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        onGoToReviews={() => {
          setShowSuccessModal(false);
          onClose();
        }}
      />
    </div>
  );
}

// ── Main Reviews Page ─────────────────────────────────────────────────────────
export default function Reviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const headers = useAuthHeaders();

  const [activeTab, setActiveTab] = useState("pending");
  const [sheetProduct, setSheetProduct] = useState(null);
  const [sheetInitialRating, setSheetInitialRating] = useState(0);
  const [ratings, setRatings] = useState({});
  const [showChooseOrder, setShowChooseOrder] = useState(false);
  const [pending, setPending] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [helpfulTotal, setHelpfulTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const leaveShownRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // id of review pending delete

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

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/reviews/user/me`, {
        headers,
      });
      if (res.data.success) {
        setPending(res.data.pending || []);
        setReviewed(res.data.reviewed || []);
        setHelpfulTotal(res.data.helpfulTotal || 0);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openSheet = (product, initialRating = 0) => {
    setSheetProduct(product);
    setSheetInitialRating(initialRating);
  };
  const closeSheet = () => {
    setSheetProduct(null);
    setSheetInitialRating(0);
  };

  const handleDelete = (reviewId) => {
    setDeleteTarget(reviewId); // open modal
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_URL}/api/reviews/${deleteTarget}`, { headers });
      setReviewed((r) => r.filter((item) => item.id !== deleteTarget));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete review");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await axios.put(
        `${API_URL}/api/reviews/${reviewId}/helpful`,
        {},
        { headers },
      );
    } catch (err) {
      console.error("Helpful error:", err.message);
    }
  };

  const handleEdit = (item) => openSheet(item, item.rating);
  const handleShare = (item) => {
    if (navigator.share)
      navigator.share({ title: item.name, text: item.reviewText });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => {
            if (!leaveShownRef.current && pending.length > 0) {
              leaveShownRef.current = true;
              setShowLeaveModal(true);
            } else {
              navigate(-1);
            }
          }}
        >
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
            <span>
              {helpfulTotal} {helpfulTotal === 1 ? "person" : "people"} found
              your reviews helpful
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "pending" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Ready for review ({pending.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reviewed" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("reviewed")}
        >
          Reviewed ({reviewed.length})
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <>
          {/* ── Pending Tab ── */}
          {activeTab === "pending" && (
            <>
              <div className={styles.reviewAllBar}>
                <span className={styles.reviewAllText}>
                  Review all items from an order
                </span>
                <button
                  className={styles.chooseBtn}
                  onClick={() => setShowChooseOrder(true)}
                >
                  Choose <ChevronRight size={15} />
                </button>
              </div>
              <div className={styles.list}>
                {pending.length === 0 ? (
                  <div className={styles.emptyReviewed}>
                    <ThumbsUp size={40} style={{ opacity: 0.2 }} />
                    <p>No items to review yet</p>
                  </div>
                ) : (
                  pending.map((item) => (
                    <div key={item.id} className={styles.reviewBlock}>
                      <div
                        className={styles.productRow}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/leave-review", {
                            state: { product: item },
                          });
                        }}
                      >
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/80?text=IMG"
                          }
                          alt={item.name}
                          className={styles.productImg}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/80?text=IMG";
                          }}
                        />
                        <div className={styles.productInfo}>
                          <p className={styles.productName}>{item.name}</p>
                          <p className={styles.productVariant}>
                            {item.variant}
                          </p>
                        </div>
                        <button
                          className={styles.leaveBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/leave-review", {
                              state: { product: item },
                            });
                          }}
                        >
                          Leave a review
                        </button>
                      </div>
                      <div className={styles.waitingRow}>
                        <Flame size={13} className={styles.flameIcon} />
                        <span className={styles.waitingCount}>
                          {item.waitingCount}
                        </span>
                        <span className={styles.waitingText}>
                          {" "}
                          people are waiting for your review.
                        </span>
                        <StarRow
                          rating={ratings[item.id] || 0}
                          size={18}
                          onChange={(v) => {
                            setRatings((r) => ({ ...r, [item.id]: v }));
                            openSheet(item, v);
                          }}
                        />
                      </div>
                    </div>
                  ))
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
            </>
          )}

          {/* ── Reviewed Tab ── */}
          {activeTab === "reviewed" && (
            <div className={styles.list}>
              {reviewed.length === 0 ? (
                <div className={styles.emptyReviewed}>
                  <ThumbsUp size={40} style={{ opacity: 0.2 }} />
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
                    onHelpful={handleHelpful}
                    onShare={handleShare}
                  />
                ))
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
          )}
        </>
      )}

      {sheetProduct && (
        <LeaveReviewSheet
          product={sheetProduct}
          initialRating={sheetInitialRating}
          onClose={closeSheet}
          onSubmitted={fetchReviews}
        />
      )}

      {showChooseOrder && (
        <ChooseOrderSheet onClose={() => setShowChooseOrder(false)} />
      )}

      <DeleteReviewModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onEdit={() => {
          const item = reviewed.find((r) => r.id === deleteTarget);
          setDeleteTarget(null);
          if (item) handleEdit(item);
        }}
        onDelete={confirmDelete}
      />

      <LeavePageModal
        open={showLeaveModal}
        product={pending[0] || {}}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={async ({ rating, hideProfile }) => {
          setShowLeaveModal(false);
          if (pending[0]) {
            try {
              await axios.post(
                `${API_URL}/api/reviews/${pending[0].id}/add`,
                { rating, hide_profile: hideProfile },
                { headers },
              );
              fetchReviews();
            } catch (_) {}
          }
          navigate(-1);
        }}
      />
    </div>
  );
}
