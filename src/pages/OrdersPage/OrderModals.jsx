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
import ProductVariantModal from "../../components/ProductVariantModal/ProductVariantModal";
import { useNavigate } from "react-router-dom";

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
export function BuyAgainSheet({
  open,
  onClose,
  items = [],
  onAddToCart,
  loading = false,
}) {
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [soldOutToast, setSoldOutToast] = useState(false);
  const toastTimer = useRef();

  // Variant modal state
  const [variantModal, setVariantModal] = useState(null);
  // Track per-item variant selections: { [itemId]: { variantId, variantName, image } }
  const [itemVariants, setItemVariants] = useState({});

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
    // Reset variant selections when sheet opens fresh
    setItemVariants({});
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
      .map((i) => {
        const chosen = itemVariants[i.id];
        return {
          ...i,
          quantity: quantities[i.id] || 1,
          variantId: chosen?.variantId ?? i.variantId,
          image: chosen?.image ?? i.image,
          variantName: chosen?.variantName ?? i.variantName,
        };
      });
    onAddToCart?.(toAdd);
    onClose();
  };

  // Called by ProductVariantModal — update selected variant + image in sheet
  const handleVariantSelect = (variantId, qty, imageUrl, variantLabel) => {
    if (!variantModal) return;
    const itemId = variantModal.item.id;
    setItemVariants((prev) => ({
      ...prev,
      [itemId]: { variantId, image: imageUrl, variantName: variantLabel },
    }));
    if (qty) setQuantities((q) => ({ ...q, [itemId]: qty }));
    setVariantModal(null);
  };

  return (
    <>
      {soldOutToast && (
        <div className={styles.soldOutToast}>This item is sold out.</div>
      )}

      <div className={styles.overlayBottom} onClick={onClose}>
        <div className={styles.buySheet} onClick={(e) => e.stopPropagation()}>
          <div className={styles.buySheetHeader}>
            <h2 className={styles.buySheetTitle}>Buy this again</h2>
            <button className={styles.buySheetClose} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.buySheetBody}>
            {available.map((item) => {
              // ── Use updated variant image if user selected a new variant ──
              const chosenVariant = itemVariants[item.id];
              const displayImage =
                chosenVariant?.image ||
                item.image ||
                "https://via.placeholder.com/140?text=IMG";
              const displayVariantName =
                chosenVariant?.variantName || item.variantName;

              return (
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
                    {/* key forces remount when image URL changes → instant update */}
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/140?text=IMG";
                      }}
                    />
                  </div>

                  <div className={styles.buyItemInfo}>
                    <p className={styles.buyItemName}>{item.name}</p>
                    {item.variantName && (
                      <button
                        className={styles.buyVariantBtn}
                        onClick={() => setVariantModal({ item })}
                      >
                        {displayVariantName}
                        <ChevronRight size={12} />
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
              );
            })}

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
              disabled={selectedCount === 0 || loading}
            >
              {loading
                ? "Adding…"
                : `Add ${selectedCount > 0 ? selectedCount : ""} item${selectedCount !== 1 ? "s" : ""} to cart`}
            </button>
          </div>
        </div>
      </div>

      {/* ProductVariantModal overlays on top of the sheet */}
      {variantModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
          <ProductVariantModal
            isOpen={true}
            onClose={() => setVariantModal(null)}
            variantId={variantModal.item.variantId}
            selectOnly={true}
            onAddToCart={(variantId, qty, imageUrl, variantLabel) => {
              handleVariantSelect(variantId, qty, imageUrl, variantLabel);
            }}
          />
        </div>
      )}
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
const _API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function PlaceOrderAgainModal({ open, onClose, onConfirm, order }) {
  const [liveImages, setLiveImages] = useState({});
  const [liveVariants, setLiveVariants] = useState({});
  const [pickerItem, setPickerItem] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPickerItem(null);
    if (!order?.items) return;
    const imgs = {};
    const vars = {};
    order.items.forEach((item) => {
      const id = item.id || item._id;
      imgs[id] = item.images?.[0] || item.image || null;
      vars[id] =
        item.variantName ||
        item.variant_name ||
        [item.color, item.size].filter(Boolean).join(" / ") ||
        null;
    });
    setLiveImages(imgs);
    setLiveVariants(vars);
  }, [open, order]);

  if (!open) return null;

  const items = order?.items || [];

  return (
    <>
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
              If you would like to place this order again, the original order
              will be canceled.
            </span>
          </p>

          {items.length > 0 && (
            <div className={styles.placeAgainItems}>
              {items.map((item) => {
                const id = item.id || item._id;
                const displayImage =
                  liveImages[id] || "https://via.placeholder.com/64?text=IMG";
                const displayLabel = liveVariants[id] || null;
                const variantId =
                  item.variantId || item.product_variant_id || null;
                const price = item.unit_price || item.price || 0;

                return (
                  <div key={id} className={styles.placeAgainItem}>
                    <div className={styles.placeAgainImgWrap}>
                      <img
                        key={displayImage}
                        src={displayImage}
                        alt={item.name}
                        className={styles.placeAgainImg}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/64?text=IMG";
                        }}
                      />
                    </div>
                    <div className={styles.placeAgainInfo}>
                      <p className={styles.placeAgainName}>{item.name}</p>
                      {(displayLabel || variantId) && (
                        <button
                          className={styles.placeAgainVariantBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            const vid =
                              item.variantId ||
                              item.product_variant_id ||
                              item.variant_id ||
                              null;
                            setPickerItem({
                              id,
                              name: item.name,
                              variantId: vid,
                              images:
                                item.images || (item.image ? [item.image] : []),
                              image: item.images?.[0] || item.image || null,
                              price,
                            });
                          }}
                        >
                          {displayLabel || "Select variant"}
                          <ChevronRight size={12} />
                        </button>
                      )}
                      <p className={styles.placeAgainPrice}>
                        ₦{Number(price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className={styles.modalDescription}>
            If the payment has already been completed, please wait for the
            status to be updated.
          </p>

          <button className={styles.modalPrimaryBtn} onClick={onConfirm}>
            Cancel the original order and buy this again
          </button>
          <button className={styles.modalSecondaryBtn} onClick={onClose}>
            Wait for the payment status to update
          </button>
        </div>
      </div>

      {pickerItem && (
        <VariantPickerOverlay
          item={pickerItem}
          apiBase={_API}
          onClose={() => setPickerItem(null)}
          onSelect={(itemId, imageUrl, variantLabel) => {
            setLiveImages((prev) => ({ ...prev, [itemId]: imageUrl }));
            setLiveVariants((prev) => ({ ...prev, [itemId]: variantLabel }));
            setPickerItem(null);
          }}
        />
      )}
    </>
  );
}

function VariantPickerOverlay({ item, apiBase, onClose, onSelect }) {
  const itemId = item.id;
  const variantId = item.variantId || null;

  const handleConfirm = async (
    newVariantId,
    _qty,
    imageFromPicker,
    variantLabel,
  ) => {
    let imageUrl = imageFromPicker || item.image || null;

    try {
      const res = await fetch(
        `${apiBase}/api/products/variant/${newVariantId}`,
      );
      if (res.ok) {
        const data = await res.json();
        const api =
          data?.variant?.image_url || data?.product?.images?.[0] || null;
        if (api) imageUrl = api;
      }
    } catch (e) {
      // keep imageFromPicker
    }

    onSelect(itemId, imageUrl || item.image || null, variantLabel);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      <ProductVariantModal
        isOpen={true}
        onClose={onClose}
        variantId={variantId}
        selectOnly={true}
        onAddToCart={(newVariantId, qty, imageUrl, variantLabel) => {
          handleConfirm(newVariantId, qty, imageUrl, variantLabel);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RETURN WINDOW OPEN MODAL  (order < 90 days old)
// ─────────────────────────────────────────────────────────────────────────────
export function ReturnWindowOpenModal({
  open,
  onClose,
  orderedDate,
  onStartReturn,
}) {
  if (!open) return null;

  const orderedAt = new Date(orderedDate);
  const deadlineAt = new Date(orderedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((deadlineAt - now) / (1000 * 60 * 60 * 24)),
  );

  const navigate = useNavigate();

  const daysUsed = 90 - daysLeft;
  const progressPct = Math.min(100, Math.round((daysUsed / 90) * 100));

  const barColor =
    daysLeft > 30 ? "#27ae60" : daysLeft > 10 ? "#f39c12" : "#e74c3c";

  const urgencyMsg =
    daysLeft > 30
      ? "You have plenty of time — no rush!"
      : daysLeft > 10
        ? "Time is running out. Start your return soon."
        : `Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left — act now!`;

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className={styles.overlayCenter} onClick={onClose}>
      <div
        className={styles.centeredModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.centeredClose} onClick={onClose}>
          <X size={18} />
        </button>

        <div className={styles.returnOpenIcon}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="26" fill="rgba(39,174,96,0.12)" />
            <path
              d="M16 26l7 7 13-13"
              stroke="#27ae60"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className={styles.returnOpenTitle}>Your return window is open</h2>

        <p className={styles.returnOpenSub}>
          Good news! This order is still within the{" "}
          <span className={styles.returnOpenGreen}>90-day return period.</span>{" "}
          You can request a return or refund at any time before the deadline.
        </p>

        <div className={styles.returnProgressWrap}>
          <div className={styles.returnProgressLabels}>
            <span>Day 1</span>
            <span style={{ color: barColor, fontWeight: 700 }}>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </span>
            <span>Day 90</span>
          </div>
          <div className={styles.returnProgressTrack}>
            <div
              className={styles.returnProgressFill}
              style={{ width: `${progressPct}%`, background: barColor }}
            />
          </div>
          <p className={styles.returnUrgency} style={{ color: barColor }}>
            {urgencyMsg}
          </p>
        </div>

        <div className={styles.returnDateBox}>
          <div className={styles.returnOpenDateRow}>
            <span className={styles.returnOpenDateLabel}>Ordered on</span>
            <span className={styles.returnOpenDateVal}>
              {fmtDate(orderedDate)}
            </span>
          </div>
          <div className={styles.returnOpenDivider} />
          <div className={styles.returnOpenDateRow}>
            <span className={styles.returnOpenDateLabel}>Return deadline</span>
            <span className={styles.returnOpenDeadline}>
              {fmtDate(deadlineAt)}
            </span>
          </div>
        </div>

        <button
          className={styles.returnStartBtn}
          onClick={() => {
            onStartReturn?.();
            onClose();
          }}
          onStartReturn={() => navigate("/return-refund")}
        >
          Start a Return / Refund
        </button>

        <button className={styles.returnPolicyBtn}>
          View Return and Refund Policy <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
