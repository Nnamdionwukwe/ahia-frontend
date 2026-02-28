// src/pages/Orders/OrderCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  AlertCircle,
  Building2,
  CreditCard,
  CheckCircle2,
  Package,
} from "lucide-react";
import styles from "./OrderCard.module.css";

export function getOrderStatus(order) {
  if (order.payment_status === "refunded") return "refunded";
  if (order.payment_status === "pending") return "payment_processing";

  // Card/Paystack: payment_status is "success"/"paid" immediately but order
  // not yet fulfilled — treat as payment_processing to show confirmed banner
  const method = (order.payment_method || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const isCardMethod =
    method === "paystack" ||
    method === "card" ||
    method === "debitcard" ||
    method === "creditcard";
  if (
    isCardMethod &&
    (order.status === "pending" || order.status === "processing")
  ) {
    return "payment_processing";
  }

  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered") return "delivered";
  if (order.status === "shipped") return "shipped";
  if (order.status === "processing") return "processing";
  return "pending";
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}

// ── Payment method config ─────────────────────────────────────────────────────
// Returns { label, icon, isCard } for any payment_method value.
function getPaymentInfo(paymentMethod) {
  const method = (paymentMethod || "").toLowerCase().replace(/[\s_-]/g, "");

  if (
    method === "paystack" ||
    method === "card" ||
    method === "debitcard" ||
    method === "creditcard"
  ) {
    return {
      label: "Paystack",
      icon: <CreditCard size={22} className={styles.paymentLogo} />,
      isCard: true,
    };
  }

  if (method === "banktransfer" || method === "transfer" || method === "bank") {
    return {
      label: "Bank Transfer",
      icon: <Building2 size={22} className={styles.paymentLogo} />,
      isCard: false,
    };
  }

  if (method === "opay") {
    return {
      label: "Opay",
      icon: <Building2 size={22} className={styles.paymentLogo} />,
      isCard: false,
    };
  }

  // Default fallback
  return {
    label: paymentMethod || "Payment",
    icon: <Building2 size={22} className={styles.paymentLogo} />,
    isCard: false,
  };
}

const OrderCard = ({
  order,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onBuyAgainSheetClick, // dots menu "Buy this again" → BuyAgainSheet
  onChangePaymentClick,
  hideStatusBadge = false,
  onReturnRefundClick,
  dotsMenu,
}) => {
  const navigate = useNavigate();
  const status = getOrderStatus(order);
  const isPaymentProcessing = status === "payment_processing";
  const isRefunded = status === "refunded";
  const isDelivered = status === "delivered";
  const isProcessing = status === "processing";
  const orderId = order._id || order.id;
  const isDeliveredTab = !!dotsMenu;

  // Resolve payment display info once
  const paymentInfo = getPaymentInfo(order.payment_method);

  return (
    <div className={styles.orderCard}>
      {/* ── Order Header ── */}
      <div className={styles.orderHeader}>
        {isDelivered && (
          <p className={styles.deliveryDate}>
            Delivered on {formatDate(order.delivered_at || order.updated_at)}
          </p>
        )}
        {isPaymentProcessing && !hideStatusBadge && (
          <div className={styles.statusBadge}>
            <Clock size={16} />
            <span>Payment processing</span>
          </div>
        )}
        {isRefunded && <p className={styles.refundedText}>Refunded</p>}
      </div>

      {/* ── Items Preview ── */}
      <div
        className={styles.orderItems}
        onClick={() => {
          if (orderId) navigate(`/orders/${orderId}`);
        }}
      >
        <div className={styles.itemsPreview}>
          {(order.items || []).slice(0, 6).map((item, index) => (
            <div key={index} className={styles.itemImage}>
              <img
                src={item.images?.[0] || item.image || "/placeholder.png"}
                alt={item.name || "Product"}
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              {item.quantity > 1 && (
                <span className={styles.quantityBadge}>x{item.quantity}</span>
              )}
            </div>
          ))}
          {(order.items?.length ?? 0) > 6 && (
            <div className={styles.moreItems}>+{order.items.length - 6}</div>
          )}
        </div>
        <div className={styles.orderSummary}>
          <p className={styles.orderTotal}>
            {formatCurrency(order.total_amount)}
          </p>
          <p className={styles.itemCount}>
            {order.item_count || order.items?.length || 0} items
          </p>
        </div>
        <ChevronRight size={20} className={styles.chevron} />
      </div>

      {/* ── Refund Info ── */}
      {isRefunded && (
        <div className={styles.refundInfo}>
          <div className={styles.refundHeader}>
            <AlertCircle size={18} />
            <p>
              Refund issued. Needs to be processed by your financial
              institution.
            </p>
          </div>
          <p className={styles.refundDescription}>
            We've issued your refund for the entire order of{" "}
            {order.item_count || order.items?.length || 0} items.
          </p>
          <div className={styles.refundDetails}>
            <div className={styles.refundRow}>
              <span>Total refund amount:</span>
              <strong>{formatCurrency(order.total_amount)}</strong>
            </div>

            {/* ── Dynamic payment method row ── */}
            <div className={styles.paymentMethod}>
              {paymentInfo.icon}
              <span>{paymentInfo.label}</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>

            <button className={styles.proofLink}>
              View proof of refund sent →
            </button>
            <div className={styles.refundDate}>
              <p>The date refund will be issued by financial institution:</p>
              <p className={styles.dateHighlight}>
                {formatDate(order.refund_date || order.updated_at)}
              </p>
            </div>
            <button className={styles.trackButton}>Track</button>
          </div>
          <p className={styles.requestedDate}>
            Requested on {formatDate(order.created_at)}
          </p>
        </div>
      )}

      {/* ── Order Processing Banner (status === "processing") ── */}
      {isProcessing && (
        <div className={styles.orderProcessingBanner}>
          <Package size={18} className={styles.processingIcon} />
          <div className={styles.processingText}>
            <p>
              <span className={styles.highlight}>
                Your order is being prepared!
              </span>{" "}
              Our team is picking, packing, and getting everything ready. You'll
              get a notification the moment it ships. 🚀
            </p>
          </div>
        </div>
      )}

      {/* ── Payment Processing Info ── */}
      {isPaymentProcessing && (
        <>
          {order.payment_status === "pending" ||
          order.payment_status === "processing" ? (
            /* ══ PAYMENT NOT YET CONFIRMED (pending = not paid, processing = awaiting admin approval) ══ */
            <div className={styles.paymentProcessing}>
              <Clock size={18} className={styles.processingIcon} />
              <div className={styles.processingText}>
                <p>
                  We've reserved your order.{" "}
                  <span className={styles.highlight}>If you haven't paid</span>{" "}
                  with{" "}
                  <span className={styles.paymentMethodLabel}>
                    {paymentInfo.icon}
                    {paymentInfo.label}
                  </span>
                  , you can change your payment method to receive your items
                  faster.
                </p>
              </div>
            </div>
          ) : (
            /* ══ PAYMENT CONFIRMED (card/paystack paid successfully) ══ */
            <div className={styles.cardPaymentConfirmed}>
              <div className={styles.cardPaymentIcon}>
                <CheckCircle2 size={22} color="#27ae60" />
              </div>
              <div className={styles.cardPaymentText}>
                <p className={styles.cardPaymentTitle}>Payment received</p>
                <p className={styles.cardPaymentSub}>
                  Paid via{" "}
                  <span className={styles.cardPaymentMethodChip}>
                    {paymentInfo.icon}
                    {paymentInfo.label}
                  </span>{" "}
                  Your items are being handpicked! Our team is carefully
                  selecting, packing, and sealing your order with care. It'll be
                  on its way to you very soon!.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Action Buttons ── */}
      <div className={styles.actionButtons}>
        {isDeliveredTab ? (
          dotsMenu
        ) : (
          <div className={styles.moreMenuWrap}>
            <button
              className={styles.moreButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(showMenu === orderId ? null : orderId);
              }}
            >
              •••
            </button>
            {showMenu === orderId && (
              <div className={styles.menuDropdown}>
                {isPaymentProcessing && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(null);
                        navigate(`/orders/${orderId}/edit-address`);
                      }}
                    >
                      Change address
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(null);
                        onBuyAgainClick?.(order);
                      }}
                    >
                      Buy this again
                    </button>
                  </>
                )}
                {(isDelivered || isRefunded) && (
                  <button
                    onClick={() => {
                      setShowMenu(null);
                      (onBuyAgainSheetClick ?? onBuyAgainClick)?.(order);
                    }}
                  >
                    Buy this again
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(null);
                    navigate(`/orders/${orderId}`);
                  }}
                >
                  View details
                </button>
                <button
                  onClick={() => {
                    setShowMenu(null);
                    navigate(`/support?order_id=${orderId}`);
                  }}
                >
                  Contact support
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── DELIVERED action buttons ── */}
        {isDelivered && (
          <>
            <button
              className={styles.secondaryButton}
              onClick={() =>
                isDeliveredTab
                  ? onReturnRefundClick?.(order)
                  : onCancelClick?.(order)
              }
            >
              Return/Refund
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => onBuyAgainClick?.(order)}
            >
              Buy this again
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/account-profile/reviews")}
            >
              Leave a review
            </button>
          </>
        )}

        {/* ── REFUNDED action buttons ── */}
        {isRefunded && (
          <>
            <button className={styles.secondaryButton}>Refund details</button>
            <button
              className={styles.secondaryButton}
              onClick={() => onBuyAgainClick?.(order)}
            >
              Buy this again
            </button>
          </>
        )}

        {/* ── PAYMENT PROCESSING action buttons ── */}
        {isPaymentProcessing && (
          <>
            {/* Cancel order — always shown for both card and bank transfer */}
            <button
              className={styles.secondaryButton}
              onClick={() => onCancelClick?.(order)}
            >
              Cancel order
            </button>
            {/* Change payment method — only when payment not yet received */}
            {(order.payment_status === "pending" ||
              order.payment_status === "processing") && (
              <button
                className={styles.primaryButton}
                onClick={() => onChangePaymentClick?.(order)}
              >
                Change payment method
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
