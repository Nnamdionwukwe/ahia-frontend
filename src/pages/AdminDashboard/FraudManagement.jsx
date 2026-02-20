// src/components/admin/FraudManagement.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Shield,
  AlertTriangle,
  Eye,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  BarChart2,
  Clock,
  Lock,
  ZapOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import styles from "./FraudManagement.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function useAuthHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

const RISK_META = {
  low: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    label: "Low",
    icon: CheckCircle,
  },
  medium: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    label: "Medium",
    icon: AlertCircle,
  },
  high: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    label: "High",
    icon: AlertTriangle,
  },
  critical: {
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    label: "Critical",
    icon: ZapOff,
  },
  unknown: {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    label: "Unknown",
    icon: Info,
  },
};

const ACTION_META = {
  allow: { color: "#10b981", label: "Allowed" },
  review: { color: "#f59e0b", label: "Review" },
  challenge: { color: "#ef4444", label: "Challenge" },
  block: { color: "#7c3aed", label: "Blocked" },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: accent }}>
        <Icon size={18} color="#fff" />
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Risk Badge ────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const meta = RISK_META[level] || RISK_META.unknown;
  const Icon = meta.icon;
  return (
    <span
      className={styles.riskBadge}
      style={{ color: meta.color, background: meta.bg }}
    >
      <Icon size={12} /> {meta.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function FraudManagement() {
  const [activeTab, setActiveTab] = useState("cases");

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Shield size={26} className={styles.pageIcon} />
          <div>
            <h1 className={styles.pageTitle}>Fraud Detection</h1>
            <p className={styles.pageSubtitle}>
              Review flagged orders and monitor risk patterns
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {[
          { id: "cases", label: "Pending Review", icon: AlertTriangle },
          { id: "analytics", label: "Analytics", icon: BarChart2 },
          { id: "history", label: "All Cases", icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "cases" && <CasesTab status="pending" />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "history" && <CasesTab status="all" />}
      </div>
    </div>
  );
}

// ─── CASES TAB ────────────────────────────────────────────────────────────────
function CasesTab({ status }) {
  const headers = useAuthHeaders();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [riskFilter, setRiskFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState({ msg: "", type: "" });

  const showFlash = (msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash({ msg: "", type: "" }), 3500);
  };

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status !== "all") params.status = status;
      if (riskFilter) params.risk_level = riskFilter;
      if (search) params.search = search;

      const res = await axios.get(`${API_URL}/api/admin/fraud/cases`, {
        headers,
        params,
      });
      setCases(res.data.cases || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, riskFilter, search, headers]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDecision = async (fraudCheckId, decision, notes = "") => {
    try {
      await axios.post(
        `${API_URL}/api/admin/fraud/cases/${fraudCheckId}/review`,
        { decision, notes },
        { headers },
      );
      showFlash(
        `Case ${decision === "approve" ? "approved" : "declined"} successfully`,
      );
      setSelected(null);
      fetchCases();
    } catch (err) {
      showFlash(
        err.response?.data?.error || "Failed to submit decision",
        "error",
      );
    }
  };

  return (
    <div className={styles.tabPanel}>
      {flash.msg && (
        <div
          className={
            flash.type === "error" ? styles.flashError : styles.flashSuccess
          }
        >
          {flash.msg}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by user or order…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={riskFilter}
          onChange={(e) => {
            setRiskFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Risk Levels</option>
          {Object.entries(RISK_META)
            .filter(([k]) => k !== "unknown")
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>
        <button className={styles.btnRefresh} onClick={fetchCases}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Order</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Action</th>
                <th>Decision</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    <Shield
                      size={32}
                      style={{
                        opacity: 0.3,
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    {status === "pending"
                      ? "No cases pending review"
                      : "No cases found"}
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <p className={styles.userName}>
                        {c.full_name || "Unknown"}
                      </p>
                      <p className={styles.userPhone}>{c.phone_number || ""}</p>
                    </td>
                    <td>
                      {c.order_number ? (
                        <span className={styles.orderNum}>
                          #{c.order_number}
                        </span>
                      ) : (
                        <span className={styles.noOrder}>—</span>
                      )}
                      {c.total_amount && (
                        <p className={styles.orderAmt}>
                          ₦{Number(c.total_amount).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td>
                      <ScoreBar score={c.risk_score} />
                    </td>
                    <td>
                      <RiskBadge level={c.risk_level} />
                    </td>
                    <td>
                      <span
                        className={styles.actionPill}
                        style={{
                          color:
                            ACTION_META[c.action_taken]?.color || "#6b7280",
                          background: `${ACTION_META[c.action_taken]?.color || "#6b7280"}18`,
                        }}
                      >
                        {ACTION_META[c.action_taken]?.label ||
                          c.action_taken ||
                          "—"}
                      </span>
                    </td>
                    <td>
                      {c.manual_review_decision ? (
                        <span
                          className={`${styles.decisionPill} ${
                            c.manual_review_decision === "approve"
                              ? styles.approved
                              : styles.declined
                          }`}
                        >
                          {c.manual_review_decision === "approve"
                            ? "Approved"
                            : "Declined"}
                        </span>
                      ) : (
                        <span className={styles.pendingPill}>Pending</span>
                      )}
                    </td>
                    <td className={styles.dateCell}>{fmtDate(c.created_at)}</td>
                    <td>
                      <button
                        className={styles.btnView}
                        onClick={() => setSelected(c)}
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* ── Case Detail Modal ── */}
      {selected && (
        <CaseModal
          fraudCase={selected}
          onClose={() => setSelected(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}

// ─── CASE MODAL ───────────────────────────────────────────────────────────────
function CaseModal({ fraudCase: fc, onClose, onDecision }) {
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const factors = (() => {
    try {
      return typeof fc.risk_factors === "string"
        ? JSON.parse(fc.risk_factors)
        : fc.risk_factors || [];
    } catch {
      return [];
    }
  })();

  const submit = async () => {
    if (!decision) return;
    setSaving(true);
    await onDecision(fc.id, decision, notes);
    setSaving(false);
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <Shield size={18} />
            <div>
              <h3 className={styles.modalTitle}>Fraud Case Review</h3>
              <p className={styles.modalSub}>
                {fc.full_name || "Unknown user"}
              </p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Risk summary */}
          <div className={styles.riskSummary}>
            <div className={styles.riskSummaryItem}>
              <p className={styles.riskSummaryLabel}>Risk Score</p>
              <p
                className={styles.riskSummaryValue}
                style={{ color: RISK_META[fc.risk_level]?.color }}
              >
                {fc.risk_score}/100
              </p>
            </div>
            <div className={styles.riskSummaryItem}>
              <p className={styles.riskSummaryLabel}>Risk Level</p>
              <RiskBadge level={fc.risk_level} />
            </div>
            <div className={styles.riskSummaryItem}>
              <p className={styles.riskSummaryLabel}>Action Taken</p>
              <span
                className={styles.actionPill}
                style={{
                  color: ACTION_META[fc.action_taken]?.color || "#6b7280",
                  background: `${ACTION_META[fc.action_taken]?.color || "#6b7280"}18`,
                }}
              >
                {ACTION_META[fc.action_taken]?.label || fc.action_taken || "—"}
              </span>
            </div>
            {fc.order_number && (
              <div className={styles.riskSummaryItem}>
                <p className={styles.riskSummaryLabel}>Order</p>
                <p className={styles.riskSummaryValue}>#{fc.order_number}</p>
              </div>
            )}
          </div>

          {/* Score bar */}
          <div className={styles.scoreBarLarge}>
            <div
              className={styles.scoreBarFill}
              style={{
                width: `${fc.risk_score}%`,
                background: RISK_META[fc.risk_level]?.color || "#6b7280",
              }}
            />
          </div>

          {/* Risk factors */}
          <div className={styles.factorsSection}>
            <h4 className={styles.factorsTitle}>
              Risk Factors ({factors.length})
            </h4>
            <div className={styles.factorsList}>
              {factors.length === 0 ? (
                <p className={styles.noFactors}>No risk factors recorded</p>
              ) : (
                factors.map((f, i) => (
                  <div key={i} className={styles.factorItem}>
                    <AlertTriangle size={13} className={styles.factorIcon} />
                    <span>{f}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>IP Address</p>
              <p className={styles.detailValue}>{fc.ip_address || "—"}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Flagged At</p>
              <p className={styles.detailValue}>{fmtDate(fc.created_at)}</p>
            </div>
            {fc.manual_review_at && (
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Reviewed At</p>
                <p className={styles.detailValue}>
                  {fmtDate(fc.manual_review_at)}
                </p>
              </div>
            )}
            {fc.total_amount && (
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Order Value</p>
                <p className={styles.detailValue}>
                  ₦{Number(fc.total_amount).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Previous decision */}
          {fc.manual_review_decision && (
            <div
              className={`${styles.prevDecision} ${
                fc.manual_review_decision === "approve"
                  ? styles.prevApproved
                  : styles.prevDeclined
              }`}
            >
              <p>
                <strong>Decision already recorded:</strong>{" "}
                {fc.manual_review_decision === "approve"
                  ? "Approved"
                  : "Declined"}
              </p>
              {fc.manual_review_notes && (
                <p className={styles.prevNotes}>{fc.manual_review_notes}</p>
              )}
            </div>
          )}

          {/* Decision form */}
          {!fc.manual_review_decision && (
            <div className={styles.decisionForm}>
              <h4 className={styles.factorsTitle}>Submit Decision</h4>
              <div className={styles.decisionButtons}>
                <button
                  className={`${styles.decisionBtn} ${decision === "approve" ? styles.decisionBtnActive : ""}`}
                  onClick={() => setDecision("approve")}
                  style={{ "--d-color": "#10b981" }}
                >
                  <CheckCircle size={16} /> Approve Order
                </button>
                <button
                  className={`${styles.decisionBtn} ${decision === "decline" ? styles.decisionBtnActive : ""}`}
                  onClick={() => setDecision("decline")}
                  style={{ "--d-color": "#ef4444" }}
                >
                  <XCircle size={16} /> Decline Order
                </button>
              </div>
              <label className={styles.label}>
                Notes (optional)
                <textarea
                  className={styles.textarea}
                  placeholder="Add notes about this decision…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </label>
              <div className={styles.modalActions}>
                <button className={styles.btnGhost} onClick={onClose}>
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={submit}
                  disabled={!decision || saving}
                >
                  {saving ? "Submitting…" : "Submit Decision"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const headers = useAuthHeaders();
  const [stats, setStats] = useState(null);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/admin/fraud/analytics`, {
          headers,
          params: { period },
        });
        setStats(res.data.stats);
        setFactors(res.data.topRiskFactors || []);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  if (loading) return <Spinner />;
  if (!stats)
    return <div className={styles.emptyRow}>Failed to load analytics</div>;

  const total = parseInt(stats.total_checks) || 1;

  return (
    <div className={styles.analyticsPanel}>
      <div className={styles.analyticsHeader}>
        <h3 className={styles.sectionTitle}>Fraud Analytics</h3>
        <select
          className={styles.filterSelect}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={Shield}
          label="Total Checks"
          value={stats.total_checks || 0}
          accent="#4f46e5"
        />
        <StatCard
          icon={Check}
          label="Low Risk"
          value={stats.low_risk || 0}
          accent="#10b981"
        />
        <StatCard
          icon={AlertCircle}
          label="Medium Risk"
          value={stats.medium_risk || 0}
          accent="#f59e0b"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Risk"
          value={stats.high_risk || 0}
          accent="#ef4444"
        />
        <StatCard
          icon={ZapOff}
          label="Critical"
          value={stats.critical_risk || 0}
          accent="#7c3aed"
        />
        <StatCard
          icon={Lock}
          label="Blocked"
          value={stats.blocked || 0}
          accent="#1f2937"
        />
      </div>

      {/* Risk distribution bars */}
      <div className={styles.distributionCard}>
        <h4 className={styles.sectionTitle}>Risk Distribution</h4>
        {[
          { key: "low_risk", label: "Low", color: "#10b981" },
          { key: "medium_risk", label: "Medium", color: "#f59e0b" },
          { key: "high_risk", label: "High", color: "#ef4444" },
          { key: "critical_risk", label: "Critical", color: "#7c3aed" },
        ].map(({ key, label, color }) => {
          const count = parseInt(stats[key]) || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={key} className={styles.distRow}>
              <span className={styles.distLabel} style={{ color }}>
                {label}
              </span>
              <div className={styles.distBar}>
                <div
                  className={styles.distFill}
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className={styles.distCount}>
                {count} ({pct}%)
              </span>
            </div>
          );
        })}
        <p className={styles.avgScore}>
          Avg Risk Score: <strong>{stats.avg_risk_score || 0}</strong>
        </p>
      </div>

      {/* Top risk factors */}
      {factors.length > 0 && (
        <div className={styles.factorsCard}>
          <h4 className={styles.sectionTitle}>Top Risk Factors</h4>
          <div className={styles.factorsTable}>
            {factors.map((f, i) => {
              const maxCount = factors[0].occurrence_count;
              const pct = Math.round((f.occurrence_count / maxCount) * 100);
              return (
                <div key={i} className={styles.factorRow}>
                  <span className={styles.factorRank}>{i + 1}</span>
                  <div className={styles.factorInfo}>
                    <p className={styles.factorName}>{f.factor}</p>
                    <div className={styles.factorBar}>
                      <div
                        className={styles.factorBarFill}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.factorCount}>
                    {f.occurrence_count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const s = parseInt(score) || 0;
  const color =
    s > 85 ? "#7c3aed" : s > 60 ? "#ef4444" : s > 30 ? "#f59e0b" : "#10b981";
  return (
    <div className={styles.scoreWrap}>
      <span className={styles.scoreNum} style={{ color }}>
        {s}
      </span>
      <div className={styles.scoreBar}>
        <div
          className={styles.scoreBarFill}
          style={{ width: `${s}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className={styles.spinnerWrap}>
      <div className={styles.spinner} />
    </div>
  );
}

function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        <ChevronLeft size={15} /> Prev
      </button>
      <span className={styles.pageInfo}>
        Page {page} of {totalPages}
      </span>
      <button
        className={styles.pageBtn}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}
