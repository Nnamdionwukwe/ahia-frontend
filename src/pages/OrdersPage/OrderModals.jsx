// src/components/OrderModals.jsx
import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronRight,
  Info,
  Minus,
  Plus,
  CheckCircle,
  Building2,
} from "lucide-react";
import styles from "./OrderModals.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// 1. THREE DOTS MENU
// ─────────────────────────────────────────────────────────────────────────────
export function DotsMenu({ onTrack, onReturnRefund, onReviews, onBuyAgain }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={styles.dotsWrap} ref={ref}>
      <button
        className={styles.dotsBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
      >
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </button>

      {open && (
        <div className={styles.dotsPopover}>
          <div className={styles.popoverTail} />
          <button
            className={styles.popoverItem}
            onClick={() => {
              onTrack?.();
              setOpen(false);
            }}
          >
            Track
          </button>
          {onReturnRefund && (
            <button
              className={styles.popoverItem}
              onClick={() => {
                onReturnRefund?.();
                setOpen(false);
              }}
            >
              Return/Refund
            </button>
          )}
          {onReviews && (
            <button
              className={styles.popoverItem}
              onClick={() => {
                onReviews?.();
                setOpen(false);
              }}
            >
              Your reviews
            </button>
          )}
          {onBuyAgain && (
            <button
              className={styles.popoverItem}
              onClick={() => {
                onBuyAgain?.();
                setOpen(false);
              }}
            >
              Buy this again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RETURN WINDOW CLOSED MODAL  (centered)
// ─────────────────────────────────────────────────────────────────────────────
export function ReturnWindowClosedModal({
  open,
  onClose,
  closedDate,
  orderedDate,
}) {
  if (!open) return null;

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    // ✅ overlayCenter keeps the modal vertically centered, not bottom-aligned
    <div className={styles.overlayCenter} onClick={onClose}>
      <div
        className={styles.centeredModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.centeredClose} onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className={styles.returnTitle}>The return window has closed</h2>

        <p className={styles.returnBody}>
          Sorry! The 90-day return window has passed.{" "}
          <span className={styles.returnOrange}>
            You cannot request a new return/refund.
          </span>
        </p>

        <div className={styles.returnDateBox}>
          <p className={styles.returnDateLabel}>The refund window closed on</p>
          <p className={styles.returnDateMain}>{fmtDate(closedDate)}</p>
          <p className={styles.returnDateSub}>
            Ordered on {fmtDate(orderedDate)}
          </p>
        </div>

        <button className={styles.returnOkBtn} onClick={onClose}>
          OK
        </button>

        <button className={styles.returnPolicyBtn}>
          View Return and Refund Policy <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BUY THIS AGAIN — bottom sheet
// ─────────────────────────────────────────────────────────────────────────────
export function BuyAgainSheet({ open, onClose, items = [], onAddToCart }) {
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [soldOutToast, setSoldOutToast] = useState(false);
  const toastTimer = useRef();

  useEffect(() => {
    if (!open) return;
    const initSel = {};
    const initQty = {};
    items.forEach((item) => {
      if (item.available !== false) {
        initSel[item.id] = true;
        initQty[item.id] = 1;
      }
    });
    setSelected(initSel);
    setQuantities(initQty);
  }, [open, items]);

  if (!open) return null;

  const available = items.filter((i) => i.available !== false);
  const unavailable = items.filter((i) => i.available === false);
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected =
    available.length > 0 && available.every((i) => selected[i.id]);

  const toggleAll = () => {
    const next = {};
    available.forEach((i) => {
      next[i.id] = !allSelected;
    });
    setSelected((s) => ({ ...s, ...next }));
  };

  const changeQty = (id, delta) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) + delta) }));
  };

  const handleSoldOutClick = () => {
    clearTimeout(toastTimer.current);
    setSoldOutToast(true);
    toastTimer.current = setTimeout(() => setSoldOutToast(false), 2000);
  };

  const handleAdd = () => {
    const toAdd = available
      .filter((i) => selected[i.id])
      .map((i) => ({ ...i, quantity: quantities[i.id] || 1 }));
    onAddToCart?.(toAdd);
    onClose();
  };

  return (
    <>
      {soldOutToast && (
        <div className={styles.soldOutToast}>This item is sold out.</div>
      )}

      {/* ✅ overlayBottom keeps the sheet anchored to the bottom */}
      <div className={styles.overlayBottom} onClick={onClose}>
        <div className={styles.buySheet} onClick={(e) => e.stopPropagation()}>
          <div className={styles.buySheetHeader}>
            <h2 className={styles.buySheetTitle}>Buy this again</h2>
            <button className={styles.buySheetClose} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.buySheetBody}>
            {available.map((item) => (
              <div key={item.id} className={styles.buyItem}>
                <button
                  className={`${styles.buyCheck} ${selected[item.id] ? styles.buyCheckOn : ""}`}
                  onClick={() =>
                    setSelected((s) => ({ ...s, [item.id]: !s[item.id] }))
                  }
                >
                  {selected[item.id] && (
                    <svg viewBox="0 0 12 10" width="12" height="10">
                      <path
                        d="M1 5l3.5 3.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </button>

                <div className={styles.buyItemImg}>
                  <img
                    src={
                      item.image || "https://via.placeholder.com/140?text=IMG"
                    }
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/140?text=IMG";
                    }}
                  />
                </div>

                <div className={styles.buyItemInfo}>
                  <p className={styles.buyItemName}>{item.name}</p>
                  {item.variantName && (
                    <button className={styles.buyVariantBtn}>
                      {item.variantName} <ChevronRight size={12} />
                    </button>
                  )}
                  <div className={styles.buyItemBottom}>
                    <span className={styles.buyItemPrice}>
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => changeQty(item.id, -1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span className={styles.qtyVal}>
                        {quantities[item.id] || 1}
                      </span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => changeQty(item.id, 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {unavailable.length > 0 && (
              <>
                <h3 className={styles.unavailableTitle}>Unavailable</h3>
                {unavailable.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.buyItem} ${styles.buyItemUnavailable}`}
                    onClick={handleSoldOutClick}
                  >
                    <button
                      className={`${styles.buyCheck} ${styles.buyCheckDisabled}`}
                      disabled
                    />
                    <div
                      className={`${styles.buyItemImg} ${styles.buyItemImgGrey}`}
                    >
                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/140?text=IMG"
                        }
                        alt={item.name}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/140?text=IMG";
                        }}
                      />
                    </div>
                    <div className={styles.buyItemInfo}>
                      <p
                        className={`${styles.buyItemName} ${styles.buyItemNameGrey}`}
                      >
                        {item.name}
                      </p>
                      <div className={styles.soldOutInfo}>
                        <Info size={12} className={styles.infoIcon} />
                        <span>This item is sold out.</span>
                      </div>
                      <button className={styles.similarBtn}>
                        Similar items <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={styles.buySheetFooter}>
            <button className={styles.selectAllBtn} onClick={toggleAll}>
              <span
                className={`${styles.buyCheck} ${allSelected ? styles.buyCheckOn : ""}`}
                style={{ display: "inline-flex", flexShrink: 0 }}
              >
                {allSelected && (
                  <svg viewBox="0 0 12 10" width="12" height="10">
                    <path
                      d="M1 5l3.5 3.5L11 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </span>
              <span className={styles.selectAllLabel}>All</span>
            </button>

            <button
              className={styles.addToCartBtn}
              onClick={handleAdd}
              disabled={selectedCount === 0}
            >
              Add {selectedCount > 0 ? selectedCount : ""} item
              {selectedCount !== 1 ? "s" : ""} to cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CANCEL ORDER MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function CancelOrderModal({ open, onClose, onConfirmCancel }) {
  if (!open) return null;
  return (
    <div className={styles.overlayCenter} onClick={onClose}>
      <div
        className={styles.centeredModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.centeredClose} onClick={onClose}>
          <X size={18} />
        </button>

        <div className={styles.modalIconWrap}>
          <CheckCircle size={48} className={styles.modalIconGreen} />
        </div>

        <h2 className={styles.modalTitle}>
          Your order will be processed{" "}
          <span className={styles.modalHighlight}>within 5 min.</span> Are you
          sure you want to cancel this order?
        </h2>

        <ul className={styles.modalList}>
          <li>We will keep your payment safe.</li>
          <li>Once the payment is completed, you will receive an email.</li>
          <li>If canceled, item(s) will be returned to your cart.</li>
        </ul>

        <button className={styles.modalPrimaryBtn} onClick={onClose}>
          Keep this order
        </button>
        <button className={styles.modalSecondaryBtn} onClick={onConfirmCancel}>
          Cancel this order
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PAYMENT CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function PaymentConfirmModal({
  open,
  onClose,
  onContinueToPay,
  onAlreadyPaid,
  countdown,
}) {
  if (!open) return null;
  return (
    <div className={styles.overlayCenter} onClick={onClose}>
      <div
        className={styles.centeredModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.centeredClose} onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className={styles.modalTitle}>
          Have you already paid for this order?
        </h2>

        <p className={styles.modalDescription}>
          <span className={styles.modalHighlight}>
            If you have already paid with
          </span>{" "}
          <Building2 size={16} className={styles.inlineIcon} /> Bank transfer,
          please wait for your order status to be updated.
        </p>

        <p className={styles.modalDescription}>
          If you haven't paid yet, you can change the payment method to complete
          the payment{" "}
          <span className={styles.modalHighlight}>
            within {countdown || "14:47:50"}
          </span>
          .
        </p>

        <button className={styles.modalPrimaryBtn} onClick={onContinueToPay}>
          Continue to pay
        </button>
        <button className={styles.modalSecondaryBtn} onClick={onAlreadyPaid}>
          Already paid with Bank transfer, update
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PLACE ORDER AGAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function PlaceOrderAgainModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className={styles.overlayCenter} onClick={onClose}>
      <div
        className={styles.centeredModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.centeredClose} onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className={styles.modalTitle}>
          Are you sure you want to place another order?
        </h2>

        <p className={styles.modalDescription}>
          The payment is pending for the original order you placed.{" "}
          <span className={styles.modalHighlight}>
            If you would like to place this order again, the original order will
            be canceled.
          </span>
        </p>

        <p className={styles.modalDescription}>
          If the payment has already been completed, please wait for the status
          to be updated.
        </p>

        <button className={styles.modalPrimaryBtn} onClick={onConfirm}>
          Cancel the original order and buy this again
        </button>
        <button className={styles.modalSecondaryBtn} onClick={onClose}>
          Wait for the payment status to update
        </button>
      </div>
    </div>
  );
}
