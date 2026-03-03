// src/pages/Orders/Returns.jsx
//
// Rendered by OrdersPage when activeTab === "returns"
// Fetches from: GET /api/orders/returns
// Each card links to the full ReturnRefundPage with return detail context
//
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Package,
  RefreshCw,
} from "lucide-react";
import styles from "./Returns.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

const REASON_LABELS = {
  wrong_item: "Wrong item received",
  damaged: "Item arrived damaged",
  not_as_described: "Not as described",
  changed_mind: "Changed my mind",
  missing_item: "Item missing from order",
  other: "Other reason",
};

const REFUND_METHOD_LABELS = {
  original_payment: "Original payment",
  store_credit: "Store credit",
  bank_transfer: "Bank transfer",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span
      className={styles.badge}
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ── Single return card ────────────────────────────────────────────────────────
function ReturnCard({ ret, onClick }) {
  const cfg = STATUS_CFG[ret.status] || STATUS_CFG.pending;

  return (
    <button className={styles.card} onClick={onClick}>
      {/* Left accent bar */}
      <div className={styles.cardAccent} style={{ background: cfg.color }} />

      <div className={styles.cardBody}>
        {/* Top row: status + date */}
        <div className={styles.cardTop}>
          <StatusBadge status={ret.status} />
          <span className={styles.cardDate}>{fmtDate(ret.created_at)}</span>
        </div>

        {/* Reason */}
        <p className={styles.cardReason}>
          {REASON_LABELS[ret.reason] || ret.reason}
        </p>

        {/* Details: order ID + refund amount */}
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}>
            <Package size={12} />
            Order #{ret.order_id?.substring(0, 8)}…
          </span>
          <span className={styles.cardMetaItem}>
            <RotateCcw size={12} />
            {fmtCurrency(ret.refund_amount)}
            {" · "}
            {REFUND_METHOD_LABELS[ret.refund_method] || ret.refund_method}
          </span>
        </div>

        {/* Admin note (if rejected / resolved) */}
        {ret.admin_note &&
          (ret.status === "rejected" || ret.status === "completed") && (
            <p className={styles.cardNote}>
              <AlertTriangle size={11} />
              {ret.admin_note}
            </p>
          )}

        {/* Resolved date */}
        {ret.resolved_at && (
          <p className={styles.cardResolved}>
            {ret.status === "completed" ? "Refunded" : "Resolved"} on{" "}
            {fmtDate(ret.resolved_at)}
          </p>
        )}
      </div>

      <ChevronRight size={18} className={styles.cardChevron} />
    </button>
  );
}

// ── Detail drawer / modal ─────────────────────────────────────────────────────
function ReturnDetailSheet({ returnId, onClose, accessToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/orders/returns/${returnId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load return details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [returnId]);

  const ret = data?.return;
  const items = data?.items || [];
  const cfg = ret ? STATUS_CFG[ret.status] || STATUS_CFG.pending : null;

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className={styles.sheetHandle} />

        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>Return Overview</h2>
          <button className={styles.sheetClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.sheetBody}>
          {loading && (
            <div className={styles.sheetLoader}>
              <RefreshCw size={22} className={styles.spin} />
              <p>Loading…</p>
            </div>
          )}
          {error && (
            <div className={styles.sheetError}>
              <AlertTriangle size={20} />
              <p>{error}</p>
            </div>
          )}
          {!loading && ret && (
            <>
              {/* Status hero */}
              <div
                className={styles.statusHero}
                style={{ background: cfg.bg, borderColor: `${cfg.color}33` }}
              >
                <cfg.Icon size={28} style={{ color: cfg.color }} />
                <div>
                  <p className={styles.heroLabel} style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                  <p className={styles.heroSub}>
                    Submitted {fmtDate(ret.created_at)}
                    {ret.resolved_at &&
                      ` · Resolved ${fmtDate(ret.resolved_at)}`}
                  </p>
                </div>
              </div>

              {/* Key info */}
              <div className={styles.infoCard}>
                <InfoRow
                  label="Return ID"
                  value={
                    <code className={styles.codeChip}>
                      {ret.id?.substring(0, 14)}…
                    </code>
                  }
                />
                <InfoRow
                  label="Order"
                  value={`#${ret.order_id?.substring(0, 8)}…`}
                />
                <InfoRow
                  label="Reason"
                  value={REASON_LABELS[ret.reason] || ret.reason}
                />
                <InfoRow
                  label="Refund to"
                  value={
                    REFUND_METHOD_LABELS[ret.refund_method] || ret.refund_method
                  }
                />
                <InfoRow
                  label="Refund amount"
                  value={
                    <strong style={{ color: "#10b981" }}>
                      {fmtCurrency(ret.refund_amount)}
                    </strong>
                  }
                />
                {ret.details && (
                  <InfoRow label="Your note" value={ret.details} />
                )}
                {ret.admin_note && (
                  <InfoRow
                    label="Admin note"
                    value={
                      <span
                        style={{
                          color:
                            ret.status === "rejected" ? "#ef4444" : "inherit",
                        }}
                      >
                        {ret.admin_note}
                      </span>
                    }
                  />
                )}
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div className={styles.sheetSection}>
                  <p className={styles.sheetSectionTitle}>
                    Items in this order
                  </p>
                  <div className={styles.itemsList}>
                    {items.map((item, i) => (
                      <div key={item.id || i} className={styles.itemRow}>
                        <div className={styles.itemImgWrap}>
                          <img
                            src={
                              item.images?.[0] ||
                              item.image ||
                              "/placeholder.png"
                            }
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = "/placeholder.png";
                            }}
                            className={styles.itemImg}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemName}>{item.name}</p>
                          {(item.color || item.size) && (
                            <p className={styles.itemVariant}>
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(" / ")}
                            </p>
                          )}
                          <p className={styles.itemPrice}>
                            {fmtCurrency(item.unit_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className={styles.returnDetailsBtn}
                    onClick={() =>
                      navigate(`/returns/${ret.id}`, {
                        state: { returnData: ret },
                      })
                    }
                  >
                    Return Details
                  </button>
                </div>
              )}

              {/* What happens next (only for pending/approved) */}
              {(ret.status === "pending" || ret.status === "approved") && (
                <div className={styles.nextSteps}>
                  <p className={styles.sheetSectionTitle}>What happens next</p>
                  {ret.status === "pending" && (
                    <p className={styles.nextText}>
                      Our team is reviewing your request. You'll receive an
                      email within <strong>1–3 business days</strong>.
                    </p>
                  )}
                  {ret.status === "approved" && (
                    <p className={styles.nextText}>
                      Your return has been approved! Please follow the
                      instructions sent to your email to ship the item back.
                      <br />
                      <br />
                      Your refund of{" "}
                      <strong>{fmtCurrency(ret.refund_amount)}</strong> will be
                      processed once we receive and inspect the item.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function Returns() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [detailId, setDetailId] = useState(null); // open detail sheet

  useEffect(() => {
    fetchReturns();
  }, [filter]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/orders/returns`, {
        params: {
          status: filter !== "all" ? filter : undefined,
          limit: 50,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReturns(res.data.returns || []);
    } catch (e) {
      setError("Failed to load return requests.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading returns…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle size={40} className={styles.errorIcon} />
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={fetchReturns}>
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  const filtered =
    filter === "all" ? returns : returns.filter((r) => r.status === filter);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.wrap}>
        {/* Filter tabs */}
        <div className={styles.filterRow}>
          {["all", "pending", "approved", "completed", "rejected"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnOn : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "completed"
                  ? "Refunded"
                  : STATUS_CFG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* No returns at all */}
        {returns.length === 0 && (
          <div className={styles.emptyState}>
            <RotateCcw size={56} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No return requests</p>
            <p className={styles.emptySub}>
              You haven't submitted any return or refund requests yet.
            </p>
            <button
              className={styles.shopBtn}
              onClick={() => navigate("/delivered")}
            >
              View delivered orders
            </button>
          </div>
        )}

        {/* Filtered empty */}
        {returns.length > 0 && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              No {STATUS_CFG[filter]?.label.toLowerCase() || filter} returns
            </p>
            <button
              className={styles.filterBtn}
              onClick={() => setFilter("all")}
            >
              Show all returns
            </button>
          </div>
        )}

        {/* Return cards */}
        {filtered.map((ret) => (
          <ReturnCard
            key={ret.id}
            ret={ret}
            onClick={() => setDetailId(ret.id)}
          />
        ))}
      </div>

      {/* Detail bottom sheet */}
      {detailId && (
        <ReturnDetailSheet
          returnId={detailId}
          accessToken={accessToken}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
