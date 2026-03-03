// src/pages/Orders/ReturnRefundPage.jsx
//
// Route:  /return-refund
// State:  location.state = { order }   — passed from Delivered.jsx onStartReturn
// API:    POST /api/orders/:id/return
//
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Package,
  RefreshCw,
  Wallet,
  CreditCard,
  Building2,
  Info,
} from "lucide-react";
import styles from "./ReturnRefundPage.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const REASONS = [
  { value: "wrong_item", label: "Wrong item received", icon: "📦" },
  { value: "damaged", label: "Item arrived damaged", icon: "💔" },
  { value: "not_as_described", label: "Not as described", icon: "🔍" },
  { value: "changed_mind", label: "Changed my mind", icon: "💭" },
  { value: "missing_item", label: "Item missing from order", icon: "❓" },
  { value: "other", label: "Other reason", icon: "📝" },
];

const REFUND_METHODS = [
  {
    value: "original_payment",
    label: "Original payment method",
    sub: "Refund to how you originally paid",
    Icon: CreditCard,
  },
  {
    value: "store_credit",
    label: "Store credit",
    sub: "Get credit added to your Ahia account",
    Icon: Wallet,
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    sub: "Refund directly to your bank account",
    Icon: Building2,
  },
];

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Reason", "Refund", "Review"];
  return (
    <div className={styles.stepBar}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const curr = step === num;
        return (
          <div key={label} className={styles.stepItem}>
            <div
              className={[
                styles.stepCircle,
                curr ? styles.stepCurr : "",
                done ? styles.stepDone : "",
              ].join(" ")}
            >
              {done ? <CheckCircle2 size={13} /> : num}
            </div>
            <span
              className={`${styles.stepLabel} ${curr ? styles.stepLabelCurr : ""}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`${styles.stepLine} ${done ? styles.stepLineDone : ""}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Items mini list ───────────────────────────────────────────────────────────
function ItemsList({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className={styles.itemsList}>
      {items.map((item, i) => (
        <div key={item.id || i} className={styles.itemRow}>
          <div className={styles.itemImgWrap}>
            <img
              src={item.images?.[0] || item.image || "/placeholder.png"}
              alt={item.name || "Product"}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
              className={styles.itemImg}
            />
            {item.quantity > 1 && (
              <span className={styles.itemQty}>×{item.quantity}</span>
            )}
          </div>
          <div className={styles.itemInfo}>
            <p className={styles.itemName}>{item.name || "Product"}</p>
            {(item.color || item.size) && (
              <p className={styles.itemVariant}>
                {[item.color, item.size].filter(Boolean).join(" / ")}
              </p>
            )}
            <p className={styles.itemPrice}>
              {fmtCurrency(item.unit_price || item.price)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ReturnRefundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuthStore();

  const order = location.state?.order || null;

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [refundMethod, setRefund] = useState("original_payment");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [returnData, setReturnData] = useState(null);

  useEffect(() => {
    if (!order) navigate("/orders", { replace: true });
  }, []);

  if (!order) return null;

  const orderId = order.id || order._id;
  const orderedAt = order.created_at || order.createdAt;
  const items = order.items || order.order_items || [];

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/api/orders/${orderId}/return`,
        {
          reason,
          details: details.trim() || undefined,
          refund_method: refundMethod,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setReturnData(res.data.return);
      setSubmitted(true);
    } catch (e) {
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className={styles.headerTitle}>Return Request</h1>
          <span />
        </header>

        <div className={styles.successWrap}>
          <div className={styles.successIconRing}>
            <CheckCircle2 size={48} className={styles.successIcon} />
          </div>

          <h2 className={styles.successTitle}>Request Submitted!</h2>
          <p className={styles.successSub}>
            We'll review it within <strong>1–3 business days</strong> and notify
            you by email once a decision is made.
          </p>

          {/* Summary card */}
          <div className={styles.successCard}>
            {returnData?.id && (
              <div className={styles.successRow}>
                <span>Return ID</span>
                <code className={styles.codeChip}>
                  {returnData.id.substring(0, 12)}…
                </code>
              </div>
            )}
            <div className={styles.successRow}>
              <span>Order</span>
              <strong>#{orderId?.substring(0, 8)}…</strong>
            </div>
            <div className={styles.successRow}>
              <span>Reason</span>
              <strong>{REASONS.find((r) => r.value === reason)?.label}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Refund to</span>
              <strong>
                {REFUND_METHODS.find((m) => m.value === refundMethod)?.label}
              </strong>
            </div>
            <div className={styles.successRow}>
              <span>Est. refund</span>
              <strong className={styles.successAmount}>
                {fmtCurrency(order.total_amount)}
              </strong>
            </div>
            <div className={styles.successRow}>
              <span>Status</span>
              <span className={styles.pendingBadge}>
                <Clock size={11} /> Pending review
              </span>
            </div>
          </div>

          {/* What happens next */}
          <div className={styles.timeline}>
            <p className={styles.timelineTitle}>What happens next</p>
            {[
              {
                color: "#3b82f6",
                title: "Review (1–3 business days)",
                sub: "Our team reviews your return request",
              },
              {
                color: "#f59e0b",
                title: "Approval & instructions",
                sub: "You'll get return shipping details by email",
              },
              {
                color: "#10b981",
                title: "Refund issued",
                sub: "After the item is received and inspected",
              },
            ].map((t, i) => (
              <div key={i} className={styles.tlRow}>
                <div className={styles.tlLeft}>
                  <div
                    className={styles.tlDot}
                    style={{ background: t.color }}
                  />
                  {i < 2 && <div className={styles.tlLine} />}
                </div>
                <div className={styles.tlText}>
                  <p className={styles.tlTitle}>{t.title}</p>
                  <p className={styles.tlSub}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/orders", { replace: true })}
          >
            Back to orders
          </button>
          <button
            className={styles.ghostBtn}
            onClick={() => navigate("/orders")}
          >
            View my return requests
          </button>
        </div>
      </div>
    );
  }

  // ── WIZARD ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate(-1))}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className={styles.headerTitle}>Return / Refund</h1>
        <span />
      </header>

      <StepBar step={step} />

      {/* Order pill */}
      <div className={styles.orderPill}>
        <Package size={14} />
        <span>
          Order #{orderId?.substring(0, 8)}… · {fmtCurrency(order.total_amount)}
        </span>
        <span className={styles.pillDate}>{fmtDate(orderedAt)}</span>
      </div>

      <div className={styles.body}>
        {/* ───── STEP 1: Reason ───── */}
        {step === 1 && (
          <>
            <h2 className={styles.stepTitle}>Why are you returning this?</h2>
            <p className={styles.stepSub}>Select the reason that best fits</p>

            <div className={styles.reasonGrid}>
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  className={`${styles.reasonCard} ${reason === r.value ? styles.reasonOn : ""}`}
                  onClick={() => setReason(r.value)}
                >
                  <span className={styles.reasonEmoji}>{r.icon}</span>
                  <span className={styles.reasonLabel}>{r.label}</span>
                  {reason === r.value && (
                    <CheckCircle2 size={15} className={styles.reasonCheck} />
                  )}
                </button>
              ))}
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel}>
                Additional details{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                maxLength={500}
                placeholder="Describe the issue in more detail…"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <span className={styles.charCount}>{details.length}/500</span>
            </div>

            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>Items in this order</p>
              <ItemsList items={items} />
            </div>
          </>
        )}

        {/* ───── STEP 2: Refund method ───── */}
        {step === 2 && (
          <>
            <h2 className={styles.stepTitle}>
              How would you like your refund?
            </h2>
            <p className={styles.stepSub}>Choose where your refund goes</p>

            <div className={styles.methodList}>
              {REFUND_METHODS.map((m) => (
                <button
                  key={m.value}
                  className={`${styles.methodCard} ${refundMethod === m.value ? styles.methodOn : ""}`}
                  onClick={() => setRefund(m.value)}
                >
                  <div
                    className={`${styles.methodIcon} ${refundMethod === m.value ? styles.methodIconOn : ""}`}
                  >
                    <m.Icon size={20} />
                  </div>
                  <div className={styles.methodText}>
                    <p className={styles.methodLabel}>{m.label}</p>
                    <p className={styles.methodSub}>{m.sub}</p>
                  </div>
                  <div
                    className={`${styles.radio} ${refundMethod === m.value ? styles.radioOn : ""}`}
                  >
                    {refundMethod === m.value && (
                      <div className={styles.radioDot} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className={styles.infoBanner}>
              <Info size={14} />
              <p>
                Refunds typically process within{" "}
                <strong>5–10 business days</strong> after your return is
                approved and the item is received.
              </p>
            </div>

            <div className={styles.refundCard}>
              <p className={styles.refundCardTitle}>Estimated refund</p>
              <div className={styles.refundRow}>
                <span>Order total</span>
                <span>{fmtCurrency(order.total_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className={styles.refundRow}>
                  <span>Discount</span>
                  <span className={styles.discountText}>
                    -{fmtCurrency(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className={`${styles.refundRow} ${styles.refundTotal}`}>
                <span>You receive</span>
                <strong>{fmtCurrency(order.total_amount)}</strong>
              </div>
            </div>
          </>
        )}

        {/* ───── STEP 3: Review ───── */}
        {step === 3 && (
          <>
            <h2 className={styles.stepTitle}>Review your request</h2>
            <p className={styles.stepSub}>Check everything before submitting</p>

            <div className={styles.reviewCard}>
              {/* Reason */}
              <div className={styles.reviewRow}>
                <div className={styles.reviewRowLeft}>
                  <span className={styles.reviewEmoji}>
                    {REASONS.find((r) => r.value === reason)?.icon}
                  </span>
                  <div>
                    <p className={styles.reviewMeta}>Reason</p>
                    <p className={styles.reviewValue}>
                      {REASONS.find((r) => r.value === reason)?.label}
                    </p>
                  </div>
                </div>
                <button className={styles.editBtn} onClick={() => setStep(1)}>
                  Edit
                </button>
              </div>

              {details.trim() && (
                <div className={styles.reviewNote}>
                  <p className={styles.reviewMeta}>Your note</p>
                  <p className={styles.reviewNoteText}>"{details}"</p>
                </div>
              )}

              <div className={styles.reviewDivider} />

              {/* Refund method */}
              <div className={styles.reviewRow}>
                <div className={styles.reviewRowLeft}>
                  {(() => {
                    const m = REFUND_METHODS.find(
                      (m) => m.value === refundMethod,
                    );
                    return (
                      <>
                        <div className={styles.reviewMethodIcon}>
                          <m.Icon size={18} />
                        </div>
                        <div>
                          <p className={styles.reviewMeta}>Refund to</p>
                          <p className={styles.reviewValue}>{m.label}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button className={styles.editBtn} onClick={() => setStep(2)}>
                  Edit
                </button>
              </div>

              <div className={styles.reviewDivider} />

              {/* Order summary */}
              <div className={styles.reviewOrderBlock}>
                <p className={styles.reviewMeta}>Order details</p>
                <div className={styles.reviewOrderRow}>
                  <span>Order</span>
                  <strong>#{orderId?.substring(0, 8)}…</strong>
                </div>
                <div className={styles.reviewOrderRow}>
                  <span>Placed</span>
                  <strong>{fmtDate(orderedAt)}</strong>
                </div>
                <div className={styles.reviewOrderRow}>
                  <span>Refund amount</span>
                  <strong className={styles.reviewAmount}>
                    {fmtCurrency(order.total_amount)}
                  </strong>
                </div>
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>Items being returned</p>
              <ItemsList items={items} />
            </div>

            <p className={styles.disclaimer}>
              By submitting, you confirm your items meet our{" "}
              <button className={styles.policyLink}>Return Policy</button>{" "}
              requirements. False claims may result in account restrictions.
            </p>

            {submitError && (
              <div className={styles.errorBanner}>
                <AlertTriangle size={14} />
                {submitError}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div className={styles.footer}>
        {step < 3 ? (
          <button
            className={styles.primaryBtn}
            disabled={step === 1 && !reason}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className={styles.submitBtn}
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className={styles.spin} /> Submitting…
              </>
            ) : (
              <>
                <RotateCcw size={16} /> Submit Return Request
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
