// src/components/ReviewModals.jsx
// Four modals matching the screenshots exactly:
// 1. QuickReviewModal   - star picker + submit (images 2 & 3)
// 2. LeavePageModal     - "are you sure you want to leave?" (images 2 & 3)
// 3. DeleteReviewModal  - edit or delete confirmation (image 1)
// 4. SuccessModal       - "Reviewed successfully" (images 4 & 5)
//
// Usage:
//   import { QuickReviewModal, LeavePageModal, DeleteReviewModal, SuccessModal } from "./ReviewModals";

import { useState } from "react";
import styles from "./ReviewModals.module.css";

// ─── Shared: Star Row ────────────────────────────────────────────────────────
function StarRow({ rating, onChange, size = 48 }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Awful", "Bad", "Okay", "Good", "Excellent"];
  const active = hovered || rating;

  return (
    <div className={styles.starSection}>
      {active > 0 && (
        <span className={styles.ratingLabel}>{labels[active]}</span>
      )}
      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.starBtn} ${active >= s ? styles.starOn : ""}`}
            style={{ fontSize: size }}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange?.(s)}
            aria-label={`${s} star`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared: Overlay wrapper ─────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={styles.sheet}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <span className={styles.closeX}>✕</span>
        </button>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. QuickReviewModal
//    Props: open, onClose, onSubmit, product { name, image, variant }
// ─────────────────────────────────────────────────────────────────────────────
export function QuickReviewModal({ open, onClose, onSubmit, product = {} }) {
  const [rating, setRating] = useState(5);
  const [hideProfile, setHideProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!rating) return;
    setSubmitting(true);
    await onSubmit?.({ rating, hideProfile });
    setSubmitting(false);
  }

  return (
    <Overlay onClose={onClose}>
      <p className={styles.leaveTitle}>
        Are you sure you want to leave?
        <br />
        Select stars and tags to leave a quick review.
      </p>

      <div className={styles.productPreview}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImg}
          />
        )}
        <StarRow rating={rating} onChange={setRating} size={44} />
      </div>

      <button
        className={styles.btnOrange}
        onClick={handleSubmit}
        disabled={!rating || submitting}
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>

      <label className={styles.hideRow}>
        <span
          className={`${styles.radioOuter} ${hideProfile ? styles.radioChecked : ""}`}
        >
          {hideProfile && <span className={styles.radioDot} />}
        </span>
        <input
          type="checkbox"
          hidden
          checked={hideProfile}
          onChange={(e) => setHideProfile(e.target.checked)}
        />
        <span className={styles.hideLabel}>
          Hide your profile photo and name
        </span>
      </label>
    </Overlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LeavePageModal  (same UI, no product image — shown from Leave a Review page)
//    Props: open, onClose, onSubmit
// ─────────────────────────────────────────────────────────────────────────────
export function LeavePageModal({
  open,
  onClose,
  onSubmit,
  onLeave,
  product = {},
}) {
  const [rating, setRating] = useState(5);
  const [hideProfile, setHideProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!rating) return;
    setSubmitting(true);
    await onSubmit?.({ rating, hideProfile });
    setSubmitting(false);
  }

  return (
    <Overlay onClose={onClose}>
      <p className={styles.leaveTitle}>
        Are you sure you want to leave?
        <br />
        Select stars and tags to leave a quick review.
      </p>

      <div className={styles.productPreview}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImg}
          />
        )}
        <StarRow rating={rating} onChange={setRating} size={44} />
      </div>

      <button
        className={styles.btnOrange}
        onClick={handleSubmit}
        disabled={!rating || submitting}
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>

      <label className={styles.hideRow}>
        <span
          className={`${styles.radioOuter} ${hideProfile ? styles.radioChecked : ""}`}
        >
          {hideProfile && <span className={styles.radioDot} />}
        </span>
        <input
          type="checkbox"
          hidden
          checked={hideProfile}
          onChange={(e) => setHideProfile(e.target.checked)}
        />
        <span className={styles.hideLabel}>
          Hide your profile photo and name
        </span>
      </label>
    </Overlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DeleteReviewModal
//    Props: open, onClose, onEdit, onDelete, deleting (bool)
// ─────────────────────────────────────────────────────────────────────────────
export function DeleteReviewModal({
  open,
  onClose,
  onEdit,
  onDelete,
  deleting,
}) {
  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <p className={styles.deleteTitle}>
        Are you sure you want to delete the review?
      </p>
      <p className={styles.deleteBody}>
        This can't be undone. You will no longer be able to edit or resubmit
        another review for this item if deleted. If you want to edit your
        review, please select 'Edit the review'.
      </p>

      <button className={styles.btnOrange} onClick={onEdit}>
        Edit the review
      </button>

      <button
        className={styles.btnOutline}
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </Overlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SuccessModal  — "Reviewed successfully"
//    Props: open, onClose, count (number of reviews), onGoToReviews
// ─────────────────────────────────────────────────────────────────────────────
export function SuccessModal({
  open,
  onClose,
  count,
  onGoToReviews,
  inline = false,
}) {
  if (!open) return null;

  // inline=true renders the full-page success state (image 5)
  // inline=false renders as a centred modal sheet (image 4)
  if (inline) {
    return (
      <div className={styles.successPage}>
        <SuccessGraphic />
        <p className={styles.successTitle}>Reviewed successfully</p>
        {count != null && (
          <p className={styles.successSub}>
            You have submitted{" "}
            <span className={styles.successCount}>{count}</span> review(s).
          </p>
        )}
        <button className={styles.goToReviews} onClick={onGoToReviews}>
          Go to your reviews &rsaquo;
        </button>
      </div>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <SuccessGraphic />
      <p className={styles.successTitle}>Reviewed successfully</p>
      <p className={styles.successBodyText}>
        {/* Site name */ "Ahia"} appreciates the time you took to share your
        experience with this item.
      </p>
      <button className={styles.btnOrange} onClick={onClose}>
        OK
      </button>
    </Overlay>
  );
}

// ─── SVG graphic (circle + checkmark + pencil + sparkles) ───────────────────
function SuccessGraphic() {
  return (
    <svg
      className={styles.successSvg}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* sparkles */}
      <circle cx="30" cy="22" r="2.5" fill="#1a1a1a" />
      <circle cx="90" cy="22" r="2.5" fill="#1a1a1a" />
      <circle cx="18" cy="55" r="2" fill="#1a1a1a" />
      <circle cx="102" cy="55" r="2" fill="#1a1a1a" />
      {/* main circle */}
      <circle cx="55" cy="60" r="32" stroke="#1a1a1a" strokeWidth="3" />
      {/* checkmark */}
      <path
        d="M40 60 L51 71 L70 48"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* pencil */}
      <rect
        x="72"
        y="68"
        width="10"
        height="24"
        rx="2"
        transform="rotate(-38 72 68)"
        stroke="#1a1a1a"
        strokeWidth="2.5"
        fill="white"
      />
      <path d="M79 83 L83 92 L74 88 Z" fill="#1a1a1a" />
    </svg>
  );
}
