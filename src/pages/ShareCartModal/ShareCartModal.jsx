// pages/Cart/ShareCartModal/ShareCartModal.jsx
import React, { useState } from "react";
import styles from "./ShareCartModal.module.css";
import useCartStore from "../../store/cartStore";

const ShareCartModal = ({ onClose }) => {
  const { items, getSelectedTotals } = useCartStore();
  const [copied, setCopied] = useState(false);

  const selectedItems = items.filter((item) => item.is_selected);
  const totals = getSelectedTotals();

  const generateShareText = () => {
    const itemsList = selectedItems
      .map(
        (item) =>
          `• ${item.name} ${item.color ? `(${item.color})` : ""} x${
            item.quantity
          } - ₦${parseFloat(item.final_price).toLocaleString()}`
      )
      .join("\n");

    return `🛒 My Cart from AHIA E-Commerce\n\n${itemsList}\n\n💰 Total: ₦${totals.total.toLocaleString()}\n${
      totals.discount > 0
        ? `💵 Savings: ₦${totals.discount.toLocaleString()}\n`
        : ""
    }\n🔗 Shop now: ${window.location.origin}`;
  };

  const handleCopyLink = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const shareText = generateShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareTwitter = () => {
    const shareText = `Check out my cart on AHIA! ${
      selectedItems.length
    } items, Total: ₦${totals.total.toLocaleString()}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.origin
    )}`;
    window.open(url, "_blank");
  };

  const handleShareEmail = () => {
    const shareText = generateShareText();
    const subject = "Check out my cart from AHIA E-Commerce";
    const url = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  if (selectedItems.length === 0) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Share cart</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>
          <div className={styles.emptyState}>
            <p>Please select items to share</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Share cart</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Selected Items Preview */}
          <div className={styles.itemsPreview}>
            <div className={styles.previewHeader}>
              <span className={styles.itemCount}>
                {selectedItems.length} item
                {selectedItems.length !== 1 ? "s" : ""} selected
              </span>
              <span className={styles.totalAmount}>
                ₦{totals.total.toLocaleString()}
              </span>
            </div>

            <div className={styles.itemsGrid}>
              {selectedItems.slice(0, 4).map((item) => (
                <div key={item.id} className={styles.previewItem}>
                  <img src={item.image_url} alt={item.name} />
                  {item.discount_percentage > 0 && (
                    <div className={styles.discountBadge}>
                      -{item.discount_percentage}%
                    </div>
                  )}
                </div>
              ))}
              {selectedItems.length > 4 && (
                <div className={styles.moreItems}>
                  +{selectedItems.length - 4}
                </div>
              )}
            </div>

            {totals.discount > 0 && (
              <div className={styles.savingsInfo}>
                <span className={styles.savingsIcon}>💰</span>
                <span>Saving ₦{totals.discount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Share Options */}
          <div className={styles.shareOptions}>
            <h3 className={styles.shareTitle}>Share via</h3>

            <div className={styles.shareButtons}>
              <button
                className={styles.shareButton}
                onClick={handleShareWhatsApp}
              >
                <div
                  className={styles.shareIcon}
                  style={{ background: "#25D366" }}
                >
                  💬
                </div>
                <span>WhatsApp</span>
              </button>

              <button
                className={styles.shareButton}
                onClick={handleShareFacebook}
              >
                <div
                  className={styles.shareIcon}
                  style={{ background: "#1877F2" }}
                >
                  👥
                </div>
                <span>Facebook</span>
              </button>

              <button
                className={styles.shareButton}
                onClick={handleShareTwitter}
              >
                <div
                  className={styles.shareIcon}
                  style={{ background: "#1DA1F2" }}
                >
                  🐦
                </div>
                <span>Twitter</span>
              </button>

              <button className={styles.shareButton} onClick={handleShareEmail}>
                <div
                  className={styles.shareIcon}
                  style={{ background: "#EA4335" }}
                >
                  📧
                </div>
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div className={styles.copySection}>
            <div className={styles.linkBox}>
              <input
                type="text"
                value={window.location.origin}
                readOnly
                className={styles.linkInput}
              />
              <button className={styles.copyButton} onClick={handleCopyLink}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.shareNowButton} onClick={onClose}>
            Share now ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCartModal;
