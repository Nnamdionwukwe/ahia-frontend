// src/components/ReviewModals.jsx
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
// 2. LeavePageModal
// ─────────────────────────────────────────────────────────────────────────────
export function LeavePageModal({ open, onClose, onSubmit, product = {} }) {
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
// 4. SuccessModal
// ─────────────────────────────────────────────────────────────────────────────
export function SuccessModal({
  open,
  onClose,
  count,
  onGoToReviews,
  inline = false,
}) {
  if (!open) return null;
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
        Ahia appreciates the time you took to share your experience with this
        item.
      </p>
      <button className={styles.btnOrange} onClick={onClose}>
        OK
      </button>
    </Overlay>
  );
}

function SuccessGraphic() {
  return (
    <svg
      className={styles.successSvg}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="30" cy="22" r="2.5" fill="#1a1a1a" />
      <circle cx="90" cy="22" r="2.5" fill="#1a1a1a" />
      <circle cx="18" cy="55" r="2" fill="#1a1a1a" />
      <circle cx="102" cy="55" r="2" fill="#1a1a1a" />
      <circle cx="55" cy="60" r="32" stroke="#1a1a1a" strokeWidth="3" />
      <path
        d="M40 60 L51 71 L70 48"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. ShareModal  — "Share to" bottom sheet
//    Props: open, onClose, item { name, reviewText }
// ─────────────────────────────────────────────────────────────────────────────
export function ShareModal({ open, onClose, item = {} }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const enc = (s) => encodeURIComponent(s || "");
  const text = enc((item.reviewText || item.name || "") + " " + shareUrl);

  const socials = [
    {
      label: "Message",
      href: `sms:?body=${text}`,
      bg: "#4cd964",
      svg: (
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
      bg: "#1877f2",
      svg: (
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${text}`,
      bg: "#25d366",
      svg: (
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Story",
      href: "https://www.instagram.com/",
      bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          width="28"
          height="28"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.shareSheet}>
        {/* Header */}
        <div className={styles.shareHeader}>
          <span className={styles.shareTitle}>Share to</span>
          <button className={styles.shareCloseBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.shareDivider} />

        {/* Social icons grid */}
        <div className={styles.shareGrid}>
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareItem}
              onClick={onClose}
            >
              <span className={styles.shareIcon} style={{ background: s.bg }}>
                {s.svg}
              </span>
              <span className={styles.shareLabel}>{s.label}</span>
            </a>
          ))}

          {/* Copy Link */}
          <button className={styles.shareItem} onClick={handleCopyLink}>
            <span
              className={styles.shareIcon}
              style={{ background: "#e5e5ea" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#444"
                strokeWidth="2"
                width="28"
                height="28"
              >
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <span className={styles.shareLabel}>
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>

          {/* More */}
          <button
            className={styles.shareItem}
            onClick={() => {
              navigator.share?.({
                title: item.name,
                text: item.reviewText,
                url: shareUrl,
              });
              onClose();
            }}
          >
            <span
              className={styles.shareIcon}
              style={{ background: "#e5e5ea" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#444"
                strokeWidth="2.5"
                width="28"
                height="28"
              >
                <circle cx="5" cy="12" r="1.5" fill="#444" />
                <circle cx="12" cy="12" r="1.5" fill="#444" />
                <circle cx="19" cy="12" r="1.5" fill="#444" />
              </svg>
            </span>
            <span className={styles.shareLabel}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
