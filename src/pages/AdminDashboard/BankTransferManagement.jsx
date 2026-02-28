// src/pages/Admin/BankTransferManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./BankTransferManagement.module.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── helpers ────────────────────────────────────────────────────────────────
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

const parseMeta = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const msLeft = (expiresAt) => {
  if (!expiresAt) return 0;
  return Math.max(0, new Date(expiresAt) - Date.now());
};

const formatCountdown = (ms) => {
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
};

// status colour map  (matches backend values: pending / processing / success / failed)
const STATUS = {
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fcd34d",
  },
  processing: {
    label: "Processing",
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#93c5fd",
  },
  success: {
    label: "Success",
    color: "#059669",
    bg: "#d1fae5",
    border: "#6ee7b7",
  },
  failed: {
    label: "Failed",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
};

// ─── tiny components ─────────────────────────────────────────────────────────
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

// Live ticking countdown — only mounts for pending/processing rows
const Countdown = ({ expiresAt }) => {
  const [ms, setMs] = useState(() => msLeft(expiresAt));
  useEffect(() => {
    const id = setInterval(() => setMs(msLeft(expiresAt)), 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const expired = ms === 0;
  return (
    <span className={expired ? styles.expired : styles.countdown}>
      {formatCountdown(ms)}
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

// ─── Detail drawer ────────────────────────────────────────────────────────────
const Drawer = ({ row, onClose, onApprove, onReject, busy }) => {
  if (!row) return null;
  const meta = parseMeta(row.metadata);
  const bank = meta.bank_details || {};
  const needs = row.status === "pending" || row.status === "processing";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className={styles.drawerHead}>
          <div>
            <h2 className={styles.drawerTitle}>Transfer Details</h2>
            <code className={styles.drawerRef}>{row.reference}</code>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerScroll}>
          {/* hero */}
          <div className={styles.hero}>
            <div>
              <p className={styles.heroLabel}>Amount</p>
              <p className={styles.heroAmt}>{fmtMoney(row.amount)}</p>
            </div>
            <Badge status={row.status} />
          </div>

          {/* bank details — the main thing admin needs */}
          <Section title="Bank Details">
            <DRow label="Bank" val={bank.bank_name || "—"} />
            <DRow
              label="Account Number"
              val={bank.account_number || "—"}
              mono
            />
            <DRow label="Account Name" val={bank.account_name || "—"} />
            <DRow
              label="Beneficiary Code"
              val={bank.beneficiary_name || "—"}
              mono
            />
          </Section>

          <Section title="Payment">
            <DRow label="Order ID" val={row.order_id} mono />
            <DRow label="User ID" val={row.user_id} mono />
            <DRow label="Created" val={fmtDate(row.created_at)} />
            <DRow label="Expires" val={fmtDate(meta.expires_at)} />
            {meta.confirmed_at && (
              <DRow
                label="Customer confirmed"
                val={fmtDate(meta.confirmed_at)}
              />
            )}
            {meta.approved_at && (
              <DRow label="Approved at" val={fmtDate(meta.approved_at)} />
            )}
            {meta.rejected_at && (
              <DRow label="Rejected at" val={fmtDate(meta.rejected_at)} />
            )}
            {meta.rejection_reason && (
              <DRow label="Reject reason" val={meta.rejection_reason} />
            )}
            {needs && (
              <DRow
                label="Time remaining"
                val={<Countdown expiresAt={meta.expires_at} />}
              />
            )}
          </Section>

          {/* admin action */}
          {needs && (
            <Section title="Action">
              <p className={styles.actionNote}>
                Check your bank portal to confirm receipt, then approve.
                Approving marks the order as paid and moves it to processing.
              </p>
              <div className={styles.actionBtns}>
                <button
                  className={styles.approveBtn}
                  onClick={() => onApprove(row.reference)}
                  disabled={busy}
                >
                  {busy ? "Working…" : "✓ Approve Payment"}
                </button>
                <button
                  className={styles.rejectBtn}
                  onClick={() => onReject(row.reference)}
                  disabled={busy}
                >
                  ✕ Reject
                </button>
              </div>
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
const BankTransferManagement = () => {
  const { accessToken } = useAuthStore();
  const hdrs = { Authorization: `Bearer ${accessToken}` };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  // drawer
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  // toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const notify = (msg, ok = true) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── fetch ──────────────────────────────────────────────────────────────────
  // The existing GET /:reference endpoint requires a reference, so we use the
  // admin payments list endpoint. If you don't have one, fall back to
  // /api/payments?method=bank_transfer (adjust to match your actual admin route).
  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get(`${API}/api/admin/payments`, {
        params: { method: "bank_transfer", limit: 500, page: 1 },
        headers: hdrs,
      });
      // backend returns: { payments: [...] } or { data: [...] }
      setRows(res.data.payments || res.data.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load bank transfers");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  // ── open drawer — enrich with GET /:reference if needed ───────────────────
  const openDrawer = async (row) => {
    setSelected(row);
    try {
      const res = await axios.get(
        `${API}/api/payments/bank-transfer/${row.reference}`,
        { headers: hdrs },
      );
      // response shape from getBankTransferDetails: { data: { ... } }
      if (res.data?.data) {
        // Merge so we keep local fields (user_id etc.) plus enriched detail
        setSelected((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch {
      /* keep local data */
    }
  };

  // ── approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (reference) => {
    setBusy(true);
    try {
      await axios.post(
        `${API}/api/admin/payments/bank-transfer/approve`,
        { reference },
        { headers: hdrs },
      );
      notify("Payment approved — order is now processing");
      setSelected(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || "Approval failed", false);
    } finally {
      setBusy(false);
    }
  };

  // ── reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (reference) => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return; // cancelled
    setBusy(true);
    try {
      await axios.post(
        `${API}/api/admin/payments/bank-transfer/reject`,
        { reference, reason: reason || "Rejected by admin" },
        { headers: hdrs },
      );
      notify("Payment rejected");
      setSelected(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || "Rejection failed", false);
    } finally {
      setBusy(false);
    }
  };

  // ── derived stats ──────────────────────────────────────────────────────────
  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    success: rows.filter((r) => r.status === "success").length,
    failed: rows.filter((r) => r.status === "failed").length,
  };
  const volume = rows
    .filter((r) => r.status === "success")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  // ── filter + paginate ──────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reference?.toLowerCase().includes(q) ||
      r.order_id?.toLowerCase().includes(q) ||
      r.user_id?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const TABS = [
    { key: "all", label: "All", n: rows.length },
    { key: "pending", label: "Pending", n: counts.pending },
    { key: "processing", label: "Processing", n: counts.processing },
    { key: "success", label: "Success", n: counts.success },
    { key: "failed", label: "Failed", n: counts.failed },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* toast */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.ok ? styles.toastGreen : styles.toastRed}`}
        >
          {toast.msg}
        </div>
      )}

      {/* page header */}
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Bank Transfers</h1>
          <p className={styles.pageSub}>
            Review and approve manual bank transfer payments
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* stats row */}
      <div className={styles.statsRow}>
        <StatCard label="Total" value={rows.length} color="#6366f1" />
        <StatCard
          label="Pending"
          value={counts.pending}
          color="#f59e0b"
          sub={counts.pending > 0 ? "Needs review" : undefined}
        />
        <StatCard
          label="Processing"
          value={counts.processing}
          color="#3b82f6"
        />
        <StatCard label="Successful" value={counts.success} color="#10b981" />
        <StatCard
          label="Confirmed Volume"
          value={fmtMoney(volume)}
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
          placeholder="Search reference / order ID / user ID…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* content */}
      {loading ? (
        <div className={styles.center}>
          <span className={styles.spinner} />
          <p>Loading transfers…</p>
        </div>
      ) : err ? (
        <div className={styles.errBox}>{err}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.center}>No transfers match your filter.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>User</th>
                  <th>Created</th>
                  <th>Expires / Confirmed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const meta = parseMeta(r.metadata);
                  const expires = meta.expires_at;
                  const needsAction =
                    r.status === "pending" || r.status === "processing";
                  return (
                    <tr
                      key={r.id || r.reference}
                      className={`${styles.tr} ${needsAction ? styles.trHot : ""}`}
                      onClick={() => openDrawer(r)}
                    >
                      <td>
                        <code className={styles.refCode}>{r.reference}</code>
                      </td>
                      <td className={styles.amtCell}>{fmtMoney(r.amount)}</td>
                      <td>
                        <Badge status={r.status} />
                      </td>
                      <td className={styles.idCell}>
                        {r.order_id?.slice(0, 10)}…
                      </td>
                      <td className={styles.idCell}>
                        {r.user_id?.slice(0, 10)}…
                      </td>
                      <td className={styles.dateCell}>
                        {fmtDate(r.created_at)}
                      </td>
                      <td>
                        {r.status === "success" ? (
                          <span className={styles.confirmedText}>
                            ✓ {fmtDate(meta.confirmed_at || meta.approved_at)}
                          </span>
                        ) : r.status === "failed" ? (
                          <span className={styles.failedText}>—</span>
                        ) : (
                          <Countdown expiresAt={expires} />
                        )}
                      </td>
                      <td>
                        {needsAction && (
                          <span className={styles.reviewHint}>Review →</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* pagination */}
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

      {/* drawer */}
      <Drawer
        row={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        busy={busy}
      />
    </div>
  );
};

export default BankTransferManagement;
