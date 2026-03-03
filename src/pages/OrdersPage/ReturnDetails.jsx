// src/pages/Orders/ReturnDetails.jsx
//
// Route:  /returns/:id
// Fetches: GET /api/orders/returns/:id
// Fallback: location.state?.returnData (passed from Returns.jsx sheet)
//
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import styles from "./ReturnDetails.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (v) => `₦${Number(v || 0).toLocaleString("en-NG")}`;

const formatDate = (d, short = false) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(
    "en-NG",
    short
      ? { month: "short", day: "numeric", year: "numeric" }
      : {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
  );
};

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    label: "Pending review",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    Icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    Icon: XCircle,
  },
  completed: {
    label: "Refunded",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    Icon: CheckCircle2,
  },
};

const REFUND_METHOD_LABELS = {
  original_payment: "Original payment method",
  store_credit: "Store credit",
  bank_transfer: "Bank transfer",
};

const REASON_LABELS = {
  wrong_item: "Wrong item received",
  damaged: "Item arrived damaged",
  not_as_described: "Not as described",
  changed_mind: "Changed my mind",
  missing_item: "Item missing from order",
  other: "Other reason",
};

// ── Main Component ────────────────────────────────────────────────────────────
const ReturnDetails = () => {
  const { id } = useParams(); // /returns/:id
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // If navigated with state (from Returns.jsx sheet), use it immediately
    // but still fetch in the background for full item data
    const stateData = location.state?.returnData || location.state?.return;
    if (stateData) {
      setData({ return: stateData, items: stateData.items || [] });
      setLoading(false);
    }

    // Always fetch from API to get complete data (items, admin_note, etc.)
    fetchReturn();
  }, [id]);

  const fetchReturn = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/returns/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setData(res.data);
    } catch (e) {
      // Only show error if we have no fallback data
      if (!data) {
        setError(e.response?.data?.error || "Failed to load return details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    const orderId = data?.return?.order_id || data?.return?.id || id;
    navigator.clipboard?.writeText(orderId);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={22} />
          </button>
          <h1 className={styles.headerTitle}>Return details</h1>
          <div className={styles.headerSpacer} />
        </header>
        <div className={styles.loadingState}>
          <RefreshCw size={24} className={styles.spin} />
          <p>Loading return details…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={22} />
          </button>
          <h1 className={styles.headerTitle}>Return details</h1>
          <div className={styles.headerSpacer} />
        </header>
        <div className={styles.errorState}>
          <AlertTriangle size={40} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchReturn}>
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const ret = data?.return;
  const items = data?.items || ret?.items || [];

  if (!ret) return null;

  const cfg = STATUS_CFG[ret.status] || STATUS_CFG.pending;

  // Estimated refund window (API may provide or we default)
  const estFrom = ret.estimated_from
    ? new Date(ret.estimated_from).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      })
    : "5–10";
  const estTo = ret.estimated_to
    ? new Date(ret.estimated_to).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      })
    : "business days";

  const isCompleted = ret.status === "completed";
  const isPending = ret.status === "pending";
  const isApproved = ret.status === "approved";
  const isRejected = ret.status === "rejected";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.headerTitle}>Return details</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.body}>
        {/* ── Hero: status-aware message ── */}
        <div
          className={styles.hero}
          style={{ background: cfg.bg, borderColor: `${cfg.color}33` }}
        >
          <cfg.Icon size={28} style={{ color: cfg.color }} />
          <div>
            <p className={styles.heroLabel} style={{ color: cfg.color }}>
              {cfg.label}
            </p>
            <p className={styles.heroSub}>
              Submitted {formatDate(ret.created_at, true)}
              {ret.resolved_at &&
                ` · Resolved ${formatDate(ret.resolved_at, true)}`}
            </p>
          </div>
        </div>

        {/* ── Refund window (only for completed / approved) ── */}
        {(isCompleted || isApproved) && (
          <div className={styles.heroRow}>
            <p className={styles.heroText}>
              {isCompleted
                ? "Your refund has been issued. You should receive it by:"
                : "Once approved, expect your refund within:"}
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.heroDates}>
                {ret.estimated_from
                  ? `${estFrom}–${estTo}`
                  : "5–10 business days"}
              </span>
              <span className={styles.heroSep} />
              <span className={styles.heroAmount}>
                {formatCurrency(ret.refund_amount)}
              </span>
            </div>
          </div>
        )}

        {/* ── CTAs (only for completed) ── */}
        {isCompleted && (
          <div className={styles.ctaBlock}>
            <button className={styles.btnOrange}>Track your refund</button>
            <button className={styles.btnOutline}>
              View proof of refund sent
            </button>
            <button className={styles.btnOutline}>
              View details of the {formatCurrency(ret.refund_amount)} refund
            </button>
          </div>
        )}

        {/* ── Rejected banner ── */}
        {isRejected && ret.admin_note && (
          <div className={styles.rejectedBanner}>
            <AlertTriangle size={15} color="#ef4444" />
            <div>
              <p className={styles.rejectedTitle}>Request rejected</p>
              <p className={styles.rejectedNote}>{ret.admin_note}</p>
            </div>
          </div>
        )}

        {/* ── Timeline card (completed only) ── */}
        {isCompleted && (
          <div className={styles.card}>
            <div className={styles.timeline}>
              <div className={styles.tlNode}>
                <div className={styles.tlLogoWrap}>
                  <div className={styles.tlStoreLogo}>
                    <span>AH</span>
                  </div>
                  <span className={styles.tlCheck}>
                    <CheckCircle2 size={15} color="#27ae60" />
                  </span>
                </div>
                <p className={styles.tlNodeLabel}>Ahia issued refund</p>
                <p className={styles.tlNodeDate}>
                  {formatDate(ret.resolved_at, true)}
                </p>
              </div>

              <div className={styles.tlMiddle}>
                <span className={styles.tlArrowLabel}>Refunded to</span>
                <div className={styles.tlArrowLine}>
                  <div className={styles.tlArrowHead} />
                </div>
              </div>

              <div className={styles.tlNode}>
                <div className={styles.tlMethodRing}>
                  <span>💳</span>
                </div>
                <p className={styles.tlNodeLabel}>
                  {REFUND_METHOD_LABELS[ret.refund_method] || ret.refund_method}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── What happens next (pending / approved) ── */}
        {(isPending || isApproved) && (
          <div className={styles.nextSteps}>
            <p className={styles.sectionTitle}>What happens next</p>
            {isPending && (
              <p className={styles.nextText}>
                Our team is reviewing your request. You'll receive an email
                within <strong>1–3 business days</strong>.
              </p>
            )}
            {isApproved && (
              <p className={styles.nextText}>
                Your return has been approved! Please follow the instructions
                sent to your email to ship the item back.
                <br />
                <br />
                Your refund of{" "}
                <strong>{formatCurrency(ret.refund_amount)}</strong> will be
                processed once we receive and inspect the item.
              </p>
            )}
          </div>
        )}

        {/* ── Key info ── */}
        <div className={styles.infoCard}>
          <InfoRow
            label="Reason"
            value={REASON_LABELS[ret.reason] || ret.reason}
          />
          <InfoRow
            label="Refund to"
            value={REFUND_METHOD_LABELS[ret.refund_method] || ret.refund_method}
          />
          <InfoRow
            label="Refund amount"
            value={
              <strong style={{ color: "#10b981" }}>
                {formatCurrency(ret.refund_amount)}
              </strong>
            }
          />
          {ret.details && <InfoRow label="Your note" value={ret.details} />}
          {ret.admin_note && !isRejected && (
            <InfoRow label="Admin note" value={ret.admin_note} />
          )}
        </div>

        <div className={styles.sectionDivider} />

        {/* ── Refund amount and proof (completed) ── */}
        {isCompleted && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionHeadRow}>
                <h2 className={styles.sectionTitle}>Refund amount and proof</h2>
                <button className={styles.viewDetailsBtn}>
                  View details <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.card}>
                <div className={styles.amountRow}>
                  <div className={styles.methodChip}>
                    <span className={styles.methodChipIcon}>💳</span>
                    <span className={styles.methodChipLabel}>
                      {REFUND_METHOD_LABELS[ret.refund_method] ||
                        ret.refund_method}
                    </span>
                  </div>
                  <span className={styles.amountBig}>
                    {formatCurrency(ret.refund_amount)}
                  </span>
                </div>

                <div className={styles.cardDivider} />

                <button className={styles.linkRow}>
                  <span className={styles.linkRowIcon}>🧾</span>
                  <span className={styles.linkRowLabelOrange}>
                    View proof of refund sent
                  </span>
                  <ChevronRight size={15} color="#e65100" />
                </button>

                <div className={styles.cardDivider} />

                <button className={styles.linkRow}>
                  <span className={styles.linkRowLabel}>Track your refund</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className={styles.sectionDivider} />
          </>
        )}

        {/* ── Items ── */}
        {items.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {isCompleted ? "Item requested to return" : "Items in this order"}
            </h2>

            {items.map((item, i) => (
              <div key={item.id || i} className={styles.itemCard}>
                <div className={styles.itemImgWrap}>
                  {item.images?.[0] || item.image ? (
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                      className={styles.itemImg}
                    />
                  ) : (
                    <div className={styles.itemImgPlaceholder}>📦</div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  {(item.color || item.size) && (
                    <p className={styles.itemVariant}>
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  <p className={styles.itemPrice}>
                    {formatCurrency(item.unit_price || item.price)}
                  </p>
                  {item.sku && <p className={styles.itemSku}>{item.sku}</p>}
                </div>
              </div>
            ))}

            {/* Meta rows */}
            <div className={styles.metaBlock}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Refund status:</span>
                <span className={styles.metaValue}>
                  {items.length} item{items.length !== 1 ? "s" : ""}{" "}
                  {isCompleted ? "refunded" : "in request"}
                </span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Return ID:</span>
                <span className={styles.metaValueRight}>
                  <span className={styles.metaId}>
                    {ret.id?.substring(0, 14)}…
                  </span>
                  <button className={styles.copyPill} onClick={handleCopyId}>
                    Copy
                  </button>
                </span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Order:</span>
                <span className={styles.metaValue}>
                  #{ret.order_id?.substring(0, 8)}…
                </span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Request time:</span>
                <span className={styles.metaValue}>
                  {formatDate(ret.created_at)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Have questions? Read our{" "}
            <button className={styles.footerLink}>Return/Refund Policy</button>{" "}
            or{" "}
            <button className={styles.footerLink}>
              Contact Customer Service
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

export default ReturnDetails;
