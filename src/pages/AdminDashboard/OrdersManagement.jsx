// src/components/admin/OrdersManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  Eye,
  RefreshCw,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronDown,
  AlertTriangle,
  Package,
  X,
  Check,
} from "lucide-react";
import styles from "./OrdersManagement.module.css";
import useAuthStore from "../../store/authStore";
import OrderDetailsModal from "./OrderDetailsModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmtCurrency = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Status display config (covers all order + return statuses) ────────────────
const STATUS_CFG = {
  pending: { label: "Pending", color: "#ff9800", bg: "rgba(255,152,0,0.12)" },
  processing: {
    label: "Processing",
    color: "#2196f3",
    bg: "rgba(33,150,243,0.12)",
  },
  shipped: { label: "Shipped", color: "#9c27b0", bg: "rgba(156,39,176,0.12)" },
  delivered: {
    label: "Delivered",
    color: "#4caf50",
    bg: "rgba(76,175,80,0.12)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#f44336",
    bg: "rgba(244,67,54,0.12)",
  },
  pending_review: {
    label: "Pending Review",
    color: "#ff9800",
    bg: "rgba(255,152,0,0.12)",
  },
  return_requested: {
    label: "Return Requested",
    color: "#e67e22",
    bg: "rgba(230,126,34,0.12)",
  },
  return_approved: {
    label: "Return Approved",
    color: "#27ae60",
    bg: "rgba(39,174,96,0.12)",
  },
  return_rejected: {
    label: "Return Rejected",
    color: "#e74c3c",
    bg: "rgba(231,76,60,0.12)",
  },
  returned: {
    label: "Returned",
    color: "#16a085",
    bg: "rgba(22,160,133,0.12)",
  },
};

const RETURN_STATUS_CFG = {
  pending: { label: "Pending", color: "#ff9800", bg: "rgba(255,152,0,0.12)" },
  approved: { label: "Approved", color: "#27ae60", bg: "rgba(39,174,96,0.12)" },
  rejected: { label: "Rejected", color: "#e74c3c", bg: "rgba(231,76,60,0.12)" },
  completed: {
    label: "Completed",
    color: "#16a085",
    bg: "rgba(22,160,133,0.12)",
  },
};

const RETURN_REASON_LABELS = {
  wrong_item: "Wrong Item",
  damaged: "Item Damaged",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  missing_item: "Missing Item",
  other: "Other",
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, cfg }) {
  const c = cfg[status] || {
    label: status,
    color: "#666",
    bg: "rgba(100,100,100,0.1)",
  };
  return (
    <span
      className={styles.statusBadge}
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

// ── Return action modal (approve / reject / complete) ─────────────────────────
function ReturnActionModal({ ret, onClose, onDone, accessToken }) {
  const [action, setAction] = useState(null); // "approve" | "reject" | "complete"
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(
    ret.refund_amount || ret.order_total || 0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canApprove = ret.status === "pending";
  const canReject = ret.status === "pending";
  const canComplete = ret.status === "approved";

  const submit = async () => {
    if (!action) return;
    setLoading(true);
    setError("");
    try {
      await axios.patch(
        `${API_URL}/api/admin/returns/${ret.id}`,
        {
          action,
          admin_note: note || undefined,
          refund_amount: parseFloat(amount),
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      onDone();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.actionModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.actionModalHeader}>
          <h3>Process Return</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.actionModalBody}>
          {/* Return summary */}
          <div className={styles.returnSummaryCard}>
            <div className={styles.returnSummaryRow}>
              <span>Return ID</span>
              <code className={styles.returnIdCode}>
                {ret.id.substring(0, 12)}…
              </code>
            </div>
            <div className={styles.returnSummaryRow}>
              <span>Customer</span>
              <strong>{ret.user_name || ret.user_email || "—"}</strong>
            </div>
            <div className={styles.returnSummaryRow}>
              <span>Reason</span>
              <strong>{RETURN_REASON_LABELS[ret.reason] || ret.reason}</strong>
            </div>
            <div className={styles.returnSummaryRow}>
              <span>Current status</span>
              <StatusBadge status={ret.status} cfg={RETURN_STATUS_CFG} />
            </div>
            {ret.details && (
              <div className={styles.returnDetails}>
                <span className={styles.detailsLabel}>Customer note:</span>
                <p className={styles.detailsText}>{ret.details}</p>
              </div>
            )}
          </div>

          {/* Action picker */}
          <div className={styles.actionPicker}>
            <p className={styles.actionPickerLabel}>Choose action:</p>
            <div className={styles.actionBtnGroup}>
              {canApprove && (
                <button
                  className={`${styles.actionPickBtn} ${action === "approve" ? styles.actionPickBtnActive : ""}`}
                  style={{ "--ac": "#27ae60" }}
                  onClick={() => setAction("approve")}
                >
                  <Check size={14} /> Approve
                </button>
              )}
              {canReject && (
                <button
                  className={`${styles.actionPickBtn} ${action === "reject" ? styles.actionPickBtnActive : ""}`}
                  style={{ "--ac": "#e74c3c" }}
                  onClick={() => setAction("reject")}
                >
                  <X size={14} /> Reject
                </button>
              )}
              {canComplete && (
                <button
                  className={`${styles.actionPickBtn} ${action === "complete" ? styles.actionPickBtnActive : ""}`}
                  style={{ "--ac": "#16a085" }}
                  onClick={() => setAction("complete")}
                >
                  <RotateCcw size={14} /> Mark Refunded
                </button>
              )}
              {!canApprove && !canReject && !canComplete && (
                <p className={styles.noActionsMsg}>
                  No further actions available for a{" "}
                  <strong>{ret.status}</strong> return.
                </p>
              )}
            </div>
          </div>

          {/* Refund amount (for approve / complete) */}
          {(action === "approve" || action === "complete") && (
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Refund Amount (₦)</label>
              <input
                className={styles.fieldInput}
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}

          {/* Admin note */}
          {action && (
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>
                Admin Note <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                className={styles.fieldTextarea}
                rows={3}
                placeholder={
                  action === "reject"
                    ? "Explain the rejection reason to the customer…"
                    : "Internal note or refund reference…"
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        <div className={styles.actionModalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            disabled={!action || loading}
            onClick={submit}
            style={{
              background:
                action === "reject"
                  ? "#e74c3c"
                  : action === "complete"
                    ? "#16a085"
                    : "#27ae60",
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={14} className={styles.spin} /> Processing…
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Returns tab ───────────────────────────────────────────────────────────────
function ReturnsTab({ accessToken }) {
  const [returns, setReturns] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // return being actioned

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/returns`, {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 100,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReturns(res.data.returns || []);
      setCounts(res.data.counts || {});
    } catch (e) {
      console.error("Failed to fetch returns:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.order_id?.toLowerCase().includes(q) ||
      r.user_name?.toLowerCase().includes(q) ||
      r.user_email?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  });

  const totalPending = counts.pending || 0;

  return (
    <div>
      {/* Returns stat strip */}
      <div className={styles.returnsStats}>
        {Object.entries(RETURN_STATUS_CFG).map(([k, cfg]) => (
          <div
            key={k}
            className={`${styles.returnStatPill} ${statusFilter === k ? styles.returnStatPillActive : ""}`}
            style={{ "--pc": cfg.color }}
            onClick={() => setStatus(statusFilter === k ? "all" : k)}
          >
            <span className={styles.returnStatCount}>{counts[k] || 0}</span>
            <span className={styles.returnStatLabel}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            placeholder="Search by return ID, order ID, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {Object.entries(RETURN_STATUS_CFG).map(([k, cfg]) => (
            <option key={k} value={k}>
              {cfg.label}
            </option>
          ))}
        </select>

        <button className={styles.refreshButton} onClick={load}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading return requests…</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Refund Amount</th>
                <th>Refund Method</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const canAct =
                  r.status === "pending" || r.status === "approved";
                return (
                  <tr
                    key={r.id}
                    className={
                      r.status === "pending" ? styles.pendingReturnRow : ""
                    }
                  >
                    <td>
                      <code className={styles.miniId}>
                        {r.id.substring(0, 10)}…
                      </code>
                    </td>
                    <td>
                      <code className={styles.miniId}>
                        #{r.order_id.substring(0, 8)}…
                      </code>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <p className={styles.customerName}>
                          {r.user_name || "—"}
                        </p>
                        <span className={styles.customerEmail}>
                          {r.user_email || ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.reasonTag}>
                        {RETURN_REASON_LABELS[r.reason] || r.reason}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amountText}>
                        {fmtCurrency(r.refund_amount)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.methodTag}>
                        {r.refund_method?.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} cfg={RETURN_STATUS_CFG} />
                    </td>
                    <td>
                      <span className={styles.date}>
                        {fmtDate(r.created_at)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.viewButton} ${canAct ? styles.viewButtonAction : styles.viewButtonNeutral}`}
                        onClick={() => setSelected(r)}
                        title={canAct ? "Process return" : "View return"}
                      >
                        {canAct ? (
                          <>
                            <RotateCcw size={14} /> Process
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <RotateCcw size={56} />
              <h3>No return requests</h3>
              <p>
                {statusFilter !== "all"
                  ? `No ${RETURN_STATUS_CFG[statusFilter]?.label.toLowerCase()} returns found.`
                  : "Return requests will appear here once customers submit them."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action modal */}
      {selected && (
        <ReturnActionModal
          ret={selected}
          accessToken={accessToken}
          onClose={() => setSelected(null)}
          onDone={load}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const OrdersManagement = () => {
  const { accessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "returns"
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    returns: 0,
  });

  // ── Fetch orders ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [statusFilter, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders`, {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 200,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = res.data.orders || [];
      setOrders(data);
      setStats({
        total: data.length,
        pending: data.filter((o) => o.status === "pending").length,
        processing: data.filter((o) => o.status === "processing").length,
        completed: data.filter((o) => o.status === "delivered").length,
        returns: data.filter((o) => o.status?.startsWith("return")).length,
      });
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Update order status (standard statuses only) ────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Return-related statuses are managed via the Returns tab / processReturn endpoint
    const managedViaReturns = [
      "return_requested",
      "return_approved",
      "return_rejected",
      "returned",
    ];
    if (managedViaReturns.includes(newStatus)) return;

    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      fetchOrders();
    } catch (e) {
      console.error("Failed to update order status:", e);
      alert("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.user_name?.toLowerCase().includes(q) ||
      o.user_email?.toLowerCase().includes(q)
    );
  });

  // ── Decide if a row's status selector should be read-only ──────────────────
  const isReturnStatus = (s) => s?.startsWith("return") || s === "returned";

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Orders Management</h2>
          <p>
            {activeTab === "orders"
              ? `${filteredOrders.length} orders`
              : "Return requests"}
          </p>
        </div>
        <div className={styles.headerActions}>
          {activeTab === "orders" && (
            <>
              <button className={styles.exportButton}>
                <Download size={18} /> Export
              </button>
              <button className={styles.refreshButton} onClick={fetchOrders}>
                <RefreshCw size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        <div
          className={styles.statCard}
          onClick={() => {
            setActiveTab("orders");
            setStatusFilter("all");
          }}
        >
          <ShoppingBag size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Total Orders</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
          </div>
        </div>
        <div
          className={styles.statCard}
          onClick={() => {
            setActiveTab("orders");
            setStatusFilter("pending");
          }}
        >
          <Clock size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Pending</p>
            <h3 className={styles.statValue}>{stats.pending}</h3>
          </div>
        </div>
        <div
          className={styles.statCard}
          onClick={() => {
            setActiveTab("orders");
            setStatusFilter("processing");
          }}
        >
          <TrendingUp size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Processing</p>
            <h3 className={styles.statValue}>{stats.processing}</h3>
          </div>
        </div>
        <div
          className={styles.statCard}
          onClick={() => {
            setActiveTab("orders");
            setStatusFilter("delivered");
          }}
        >
          <CheckCircle size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Delivered</p>
            <h3 className={styles.statValue}>{stats.completed}</h3>
          </div>
        </div>
        <div
          className={`${styles.statCard} ${activeTab === "returns" ? styles.statCardActive : ""}`}
          onClick={() => setActiveTab("returns")}
          style={{ cursor: "pointer" }}
        >
          <RotateCcw
            size={24}
            className={styles.statIcon}
            style={{ color: "#e67e22" }}
          />
          <div>
            <p className={styles.statLabel}>Returns</p>
            <h3 className={styles.statValue}>{stats.returns}</h3>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tab} ${activeTab === "orders" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingBag size={15} /> Orders
        </button>
        <button
          className={`${styles.tab} ${activeTab === "returns" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("returns")}
        >
          <RotateCcw size={15} /> Returns
          {stats.returns > 0 && (
            <span className={styles.tabBadge}>{stats.returns}</span>
          )}
        </button>
      </div>

      {/* ══════════ ORDERS TAB ══════════ */}
      {activeTab === "orders" && (
        <>
          <div className={styles.filters}>
            <div className={styles.searchBar}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className={styles.statusFilter}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="return_requested">Return Requested</option>
              <option value="return_approved">Return Approved</option>
              <option value="return_rejected">Return Rejected</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading orders…</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const returnLocked = isReturnStatus(order.status);
                    return (
                      <tr
                        key={order.id}
                        className={returnLocked ? styles.returnLockedRow : ""}
                      >
                        <td>
                          <code className={styles.miniId}>
                            #{order.id.substring(0, 8)}…
                          </code>
                        </td>
                        <td>
                          <div className={styles.customerCell}>
                            <p className={styles.customerName}>
                              {order.user_name || "N/A"}
                            </p>
                            <span className={styles.customerEmail}>
                              {order.user_email || ""}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.date}>
                            {fmtDate(order.created_at)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.itemCount}>
                            {order.item_count || 0} items
                          </span>
                        </td>
                        <td>
                          <div className={styles.amountCell}>
                            <p className={styles.amount}>
                              {fmtCurrency(order.total_amount)}
                            </p>
                            {order.discount_amount > 0 && (
                              <span className={styles.discount}>
                                -{fmtCurrency(order.discount_amount)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.paymentCell}>
                            <span className={styles.paymentMethod}>
                              {order.payment_method || "N/A"}
                            </span>
                            <span
                              className={`${styles.paymentStatus} ${order.payment_status === "paid" ? styles.paid : styles.unpaid}`}
                            >
                              {order.payment_status || "pending"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {returnLocked ? (
                            /* Return-managed statuses: show badge + "Manage" link */
                            <div className={styles.returnStatusCell}>
                              <StatusBadge
                                status={order.status}
                                cfg={STATUS_CFG}
                              />
                              <button
                                className={styles.manageReturnBtn}
                                onClick={() => setActiveTab("returns")}
                                title="Manage in Returns tab"
                              >
                                <RotateCcw size={11} /> Manage
                              </button>
                            </div>
                          ) : (
                            <select
                              className={styles.statusSelect}
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateStatus(order.id, e.target.value)
                              }
                              style={{
                                backgroundColor:
                                  STATUS_CFG[order.status]?.color || "#666",
                                color: "white",
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className={styles.emptyState}>
                  <ShoppingBag size={64} />
                  <h3>No orders found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════ RETURNS TAB ══════════ */}
      {activeTab === "returns" && <ReturnsTab accessToken={accessToken} />}

      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
