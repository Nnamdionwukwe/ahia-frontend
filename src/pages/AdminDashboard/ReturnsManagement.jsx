// src/pages/Admin/ReturnsManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./ReturnsManagement.module.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const REASON_LABELS = {
  wrong_item: "Wrong item",
  damaged: "Damaged",
  not_as_described: "Not as described",
  changed_mind: "Changed mind",
  missing_item: "Missing item",
  other: "Other",
};

const REFUND_LABELS = {
  original_payment: "Original payment",
  store_credit: "Store credit",
  bank_transfer: "Bank transfer",
};

const STATUS = {
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fcd34d",
  },
  approved: {
    label: "Approved",
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#93c5fd",
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#d1fae5",
    border: "#6ee7b7",
  },
};

// ─── tiny components ──────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS[status] || {
    label: status,
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#d1d5db",
  };
  return (
    <span
      className={styles.badge}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <span className={styles.dot} style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, color }) => (
  <div className={styles.stat} style={{ "--c": color }}>
    <span className={styles.statLabel}>{label}</span>
    <span className={styles.statValue}>{value}</span>
    {sub && <span className={styles.statSub}>{sub}</span>}
  </div>
);

// ─── Process Modal ────────────────────────────────────────────────────────────
const ProcessModal = ({ ret, onClose, onSubmit, busy }) => {
  const [action, setAction] = useState("approve");
  const [adminNote, setAdminNote] = useState("");
  const [refundAmount, setRefundAmount] = useState(ret?.refund_amount || "");

  if (!ret) return null;

  const isComplete = ret.status === "approved";
  const actions = isComplete
    ? [{ value: "complete", label: "✓ Mark Refund Complete", color: "#059669" }]
    : [
        { value: "approve", label: "✓ Approve", color: "#2563eb" },
        { value: "reject", label: "✕ Reject", color: "#dc2626" },
      ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>
              {isComplete ? "Complete Return" : "Process Return Request"}
            </h2>
            <p className={styles.modalSub}>
              {ret.user_name} · {ret.order_id?.slice(0, 16)}…
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* action selector */}
          <label className={styles.fieldLabel}>Action</label>
          <div className={styles.actionPicker}>
            {actions.map((a) => (
              <button
                key={a.value}
                className={`${styles.actionOpt} ${action === a.value ? styles.actionOptOn : ""}`}
                style={
                  action === a.value
                    ? {
                        background: a.color,
                        borderColor: a.color,
                        color: "#fff",
                      }
                    : {}
                }
                onClick={() => setAction(a.value)}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* refund amount (approve / complete only) */}
          {(action === "approve" || action === "complete") && (
            <>
              <label className={styles.fieldLabel}>
                Refund amount{" "}
                <span className={styles.optional}>override if needed</span>
              </label>
              <input
                className={styles.fieldInput}
                type="number"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={fmtMoney(ret.refund_amount)}
              />
            </>
          )}

          {/* admin note */}
          <label className={styles.fieldLabel}>
            Note to customer <span className={styles.optional}>optional</span>
          </label>
          <textarea
            className={styles.fieldTextarea}
            rows={3}
            placeholder={
              action === "reject"
                ? "Reason for rejection (shown to customer)…"
                : "Any message to include in the notification…"
            }
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>

        <div className={styles.modalFoot}>
          <button
            className={styles.cancelModalBtn}
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            style={{
              background:
                action === "reject"
                  ? "#dc2626"
                  : action === "complete"
                    ? "#059669"
                    : "#2563eb",
            }}
            onClick={() =>
              onSubmit({
                action,
                admin_note: adminNote,
                refund_amount: refundAmount || undefined,
              })
            }
            disabled={busy}
          >
            {busy
              ? "Processing…"
              : action === "approve"
                ? "Approve Return"
                : action === "reject"
                  ? "Reject Return"
                  : "Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────
const Drawer = ({ ret, onClose, onProcess, busy }) => {
  if (!ret) return null;
  const canAct = ret.status === "pending" || ret.status === "approved";
  const actionLabel =
    ret.status === "approved" ? "Mark Refund Complete" : "Process Request";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHead}>
          <div>
            <h2 className={styles.drawerTitle}>Return Details</h2>
            <code className={styles.drawerRef}>{ret.id?.slice(0, 18)}…</code>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.drawerScroll}>
          {/* hero */}
          <div className={styles.hero}>
            <div>
              <p className={styles.heroLabel}>Refund Amount</p>
              <p className={styles.heroAmt}>{fmtMoney(ret.refund_amount)}</p>
            </div>
            <Badge status={ret.status} />
          </div>

          {/* customer */}
          <Section title="Customer">
            <DRow label="Name" val={ret.user_name} />
            <DRow label="Email" val={ret.user_email} />
            <DRow label="Phone" val={ret.user_phone || "—"} />
          </Section>

          {/* return info */}
          <Section title="Return Info">
            <DRow label="Order ID" val={ret.order_id} mono />
            <DRow
              label="Reason"
              val={REASON_LABELS[ret.reason] || ret.reason}
            />
            <DRow
              label="Refund via"
              val={REFUND_LABELS[ret.refund_method] || ret.refund_method}
            />
            <DRow label="Order total" val={fmtMoney(ret.order_total)} />
            <DRow label="Requested" val={fmtDate(ret.created_at)} />
            {ret.resolved_at && (
              <DRow label="Resolved" val={fmtDate(ret.resolved_at)} />
            )}
            {ret.details && <DRow label="Details" val={ret.details} />}
          </Section>

          {/* admin note */}
          {ret.admin_note && (
            <Section title="Admin Note">
              <p className={styles.adminNote}>{ret.admin_note}</p>
            </Section>
          )}

          {/* action */}
          {canAct && (
            <Section title="Action">
              <p className={styles.actionNote}>
                {ret.status === "approved"
                  ? "Refund has been approved. Once payment is sent, mark it as complete."
                  : "Review the return request and approve or reject it. The customer will be notified."}
              </p>
              <button
                className={styles.processBtn}
                onClick={() => onProcess(ret)}
                disabled={busy}
              >
                {actionLabel} →
              </button>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className={styles.section}>
    <p className={styles.sectionTitle}>{title}</p>
    <div className={styles.sectionBody}>{children}</div>
  </div>
);

const DRow = ({ label, val, mono }) => (
  <div className={styles.drow}>
    <span className={styles.drowLabel}>{label}</span>
    <span className={`${styles.drowVal} ${mono ? styles.mono : ""}`}>
      {val ?? "—"}
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ReturnsManagement = () => {
  const { accessToken } = useAuthStore();
  const hdrs = { Authorization: `Bearer ${accessToken}` };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const [selected, setSelected] = useState(null); // drawer
  const [processing, setProcessing] = useState(null); // modal
  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const notify = (msg, ok = true) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get(`${API}/api/admin/returns`, {
        params: { limit: 500, page: 1 },
        headers: hdrs,
      });
      setRows(res.data.returns || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load return requests");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  // ── process (approve / reject / complete) ─────────────────────────────────
  const handleProcess = async ({ action, admin_note, refund_amount }) => {
    if (!processing) return;
    setBusy(true);
    try {
      await axios.patch(
        `${API}/api/admin/returns/${processing.id}`,
        { action, admin_note, refund_amount },
        { headers: hdrs },
      );
      const labels = {
        approve: "approved",
        reject: "rejected",
        complete: "completed",
      };
      notify(`Return ${labels[action]} successfully`);
      setProcessing(null);
      setSelected(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || "Action failed", false);
    } finally {
      setBusy(false);
    }
  };

  // ── derived stats ──────────────────────────────────────────────────────────
  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    completed: rows.filter((r) => r.status === "completed").length,
  };
  const pendingVolume = rows
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + Number(r.refund_amount || 0), 0);
  const completedVolume = rows
    .filter((r) => r.status === "completed")
    .reduce((s, r) => s + Number(r.refund_amount || 0), 0);

  // ── filter + paginate ──────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.user_name?.toLowerCase().includes(q) ||
      r.user_email?.toLowerCase().includes(q) ||
      r.order_id?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const TABS = [
    { key: "all", label: "All", n: rows.length },
    { key: "pending", label: "Pending", n: counts.pending },
    { key: "approved", label: "Approved", n: counts.approved },
    { key: "rejected", label: "Rejected", n: counts.rejected },
    { key: "completed", label: "Completed", n: counts.completed },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {toast && (
        <div
          className={`${styles.toast} ${toast.ok ? styles.toastGreen : styles.toastRed}`}
        >
          {toast.msg}
        </div>
      )}

      {/* header */}
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Returns</h1>
          <p className={styles.pageSub}>
            Review and process customer return requests
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* stats */}
      <div className={styles.statsRow}>
        <StatCard label="Total" value={rows.length} color="#6366f1" />
        <StatCard
          label="Pending"
          value={counts.pending}
          color="#f59e0b"
          sub={counts.pending > 0 ? "Needs review" : undefined}
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          color="#3b82f6"
          sub={counts.approved > 0 ? "Awaiting refund" : undefined}
        />
        <StatCard label="Completed" value={counts.completed} color="#10b981" />
        <StatCard
          label="Pending Volume"
          value={fmtMoney(pendingVolume)}
          color="#f59e0b"
        />
        <StatCard
          label="Refunded Total"
          value={fmtMoney(completedVolume)}
          color="#8b5cf6"
        />
      </div>

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${statusFilter === t.key ? styles.tabOn : ""}`}
              onClick={() => {
                setStatusFilter(t.key);
                setPage(1);
              }}
            >
              {t.label}
              <span className={styles.tabN}>{t.n}</span>
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          placeholder="Search name / email / order ID / reason…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* table */}
      {loading ? (
        <div className={styles.center}>
          <span className={styles.spinner} />
          <p>Loading returns…</p>
        </div>
      ) : err ? (
        <div className={styles.errBox}>{err}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.center}>No returns match your filter.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Reason</th>
                  <th>Refund Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const needsAction =
                    r.status === "pending" || r.status === "approved";
                  return (
                    <tr
                      key={r.id}
                      className={`${styles.tr} ${needsAction ? styles.trHot : ""}`}
                      onClick={() => setSelected(r)}
                    >
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>
                            {r.user_name}
                          </span>
                          <span className={styles.customerEmail}>
                            {r.user_email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <code className={styles.refCode}>
                          {r.order_id?.slice(0, 12)}…
                        </code>
                      </td>
                      <td>
                        <span className={styles.reasonPill}>
                          {REASON_LABELS[r.reason] || r.reason}
                        </span>
                      </td>
                      <td className={styles.dimCell}>
                        {REFUND_LABELS[r.refund_method] || r.refund_method}
                      </td>
                      <td className={styles.amtCell}>
                        {fmtMoney(r.refund_amount)}
                      </td>
                      <td>
                        <Badge status={r.status} />
                      </td>
                      <td className={styles.dateCell}>
                        {fmtDate(r.created_at)}
                      </td>
                      <td>
                        {needsAction && (
                          <button
                            className={styles.actBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setProcessing(r);
                            }}
                          >
                            {r.status === "approved"
                              ? "Complete →"
                              : "Process →"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pager}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} / {totalPages} · {filtered.length} records
              </span>
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* detail drawer */}
      <Drawer
        ret={selected}
        onClose={() => setSelected(null)}
        onProcess={(r) => {
          setProcessing(r);
        }}
        busy={busy}
      />

      {/* process modal */}
      {processing && (
        <ProcessModal
          ret={processing}
          onClose={() => setProcessing(null)}
          onSubmit={handleProcess}
          busy={busy}
        />
      )}
    </div>
  );
};

export default ReturnsManagement;
