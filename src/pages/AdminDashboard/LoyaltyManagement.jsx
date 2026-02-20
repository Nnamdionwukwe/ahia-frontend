// src/components/admin/LoyaltyManagement.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Trophy,
  Gift,
  Users,
  Star,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  Award,
  Zap,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import styles from "./Loyaltymanagement.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const TIER_META = {
  bronze: {
    color: "#cd7f32",
    bg: "rgba(205,127,50,0.12)",
    label: "Bronze",
    icon: "🥉",
  },
  silver: {
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.12)",
    label: "Silver",
    icon: "🥈",
  },
  gold: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Gold",
    icon: "🥇",
  },
  platinum: {
    color: "#818cf8",
    bg: "rgba(129,140,248,0.12)",
    label: "Platinum",
    icon: "💎",
  },
};

const REWARD_TYPES = [
  { value: "discount_percentage", label: "% Discount" },
  { value: "discount_fixed", label: "Fixed Discount (₦)" },
  { value: "free_shipping", label: "Free Shipping" },
];

const EMPTY_REWARD = {
  title: "",
  description: "",
  reward_type: "discount_percentage",
  value: "",
  points_cost: "",
  stock_quantity: "",
  is_active: true,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color }}>
        <Icon size={20} color="#fff" />
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const meta = TIER_META[tier?.toLowerCase()] || TIER_META.bronze;
  return (
    <span
      className={styles.tierBadge}
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function LoyaltyManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Trophy size={28} className={styles.pageIcon} />
          <div>
            <h1 className={styles.pageTitle}>Loyalty Program</h1>
            <p className={styles.pageSubtitle}>
              Manage tiers, rewards, and member points
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "members", label: "Members", icon: Users },
          { id: "rewards", label: "Rewards", icon: Gift },
          { id: "points", label: "Point Events", icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "members" && <MembersTab />}
        {activeTab === "rewards" && <RewardsTab />}
        {activeTab === "points" && <PointEventsTab />}
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/loyalty/stats`, {
          headers: authHeaders(),
        });
        setStats(res.data);
      } catch (e) {
        setError("Failed to load loyalty stats");
        // Use placeholder data so the UI isn't blank
        setStats({
          totalMembers: 0,
          totalPointsIssued: 0,
          totalPointsRedeemed: 0,
          activeRewards: 0,
          tierBreakdown: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  const tiers = stats?.tierBreakdown || {};
  const totalMembers = stats?.totalMembers || 0;

  return (
    <div className={styles.overviewGrid}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        <StatCard
          icon={Users}
          label="Total Members"
          value={totalMembers.toLocaleString()}
          color="#4f46e5"
        />
        <StatCard
          icon={Star}
          label="Points Issued"
          value={(stats?.totalPointsIssued || 0).toLocaleString()}
          color="#f59e0b"
        />
        <StatCard
          icon={Gift}
          label="Points Redeemed"
          value={(stats?.totalPointsRedeemed || 0).toLocaleString()}
          color="#10b981"
        />
        <StatCard
          icon={Award}
          label="Active Rewards"
          value={stats?.activeRewards || 0}
          color="#8b5cf6"
        />
      </div>

      {/* Tier breakdown */}
      <div className={styles.tierBreakdown}>
        <h3 className={styles.sectionTitle}>Tier Distribution</h3>
        <div className={styles.tierCards}>
          {Object.entries(TIER_META).map(([key, meta]) => {
            const count = tiers[key] || 0;
            const pct =
              totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
            return (
              <div
                key={key}
                className={styles.tierCard}
                style={{ borderColor: meta.color }}
              >
                <span className={styles.tierEmoji}>{meta.icon}</span>
                <p className={styles.tierName} style={{ color: meta.color }}>
                  {meta.label}
                </p>
                <p className={styles.tierCount}>{count.toLocaleString()}</p>
                <div className={styles.tierBar}>
                  <div
                    className={styles.tierBarFill}
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
                <p className={styles.tierPct}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {stats.recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div
                  className={`${styles.activityDot} ${item.type === "earn" ? styles.earn : styles.redeem}`}
                />
                <div className={styles.activityInfo}>
                  <p className={styles.activityDesc}>{item.description}</p>
                  <p className={styles.activityMeta}>
                    {item.user_name} ·{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`${styles.activityPts} ${item.type === "earn" ? styles.earn : styles.redeem}`}
                >
                  {item.type === "earn" ? "+" : ""}
                  {item.points_amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ points: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/loyalty/members`, {
        headers: authHeaders(),
        params: { page, limit: 20, search, tier: tierFilter || undefined },
      });
      setMembers(res.data.members || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, tierFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/loyalty/members/${selected.user_id}/adjust`,
        adjustForm,
        { headers: authHeaders() },
      );
      setFlash("Points adjusted successfully");
      setAdjusting(false);
      setAdjustForm({ points: "", reason: "" });
      fetchMembers();
    } catch (err) {
      setFlash(err.response?.data?.error || "Failed to adjust points");
    } finally {
      setSaving(false);
      setTimeout(() => setFlash(""), 3000);
    }
  };

  return (
    <div className={styles.tabPanel}>
      {flash && <div className={styles.flashSuccess}>{flash}</div>}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={tierFilter}
          onChange={(e) => {
            setTierFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Tiers</option>
          {Object.entries(TIER_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.icon} {v.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Tier</th>
                <th>Balance</th>
                <th>Lifetime Pts</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className={styles.memberCell}>
                        <div className={styles.avatar}>
                          {m.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className={styles.memberName}>{m.full_name}</p>
                          <p className={styles.memberEmail}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <TierBadge tier={m.tier} />
                    </td>
                    <td>
                      <strong>{m.points_balance?.toLocaleString()}</strong>
                    </td>
                    <td>{m.lifetime_points?.toLocaleString()}</td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={styles.btnIcon}
                        title="Adjust points"
                        onClick={() => {
                          setSelected(m);
                          setAdjusting(true);
                        }}
                      >
                        <Edit2 size={15} />
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

      {/* Adjust Points Modal */}
      {adjusting && selected && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Adjust Points — {selected.full_name}</h3>
              <button
                className={styles.modalClose}
                onClick={() => setAdjusting(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className={styles.modalSub}>
              Current balance:{" "}
              <strong>{selected.points_balance?.toLocaleString()}</strong> pts
            </p>
            <form onSubmit={handleAdjust} className={styles.modalForm}>
              <label className={styles.label}>
                Points (use negative to deduct)
                <input
                  className={styles.input}
                  type="number"
                  placeholder="e.g. 500 or -200"
                  value={adjustForm.points}
                  onChange={(e) =>
                    setAdjustForm((f) => ({ ...f, points: e.target.value }))
                  }
                  required
                />
              </label>
              <label className={styles.label}>
                Reason
                <input
                  className={styles.input}
                  placeholder="e.g. Manual adjustment - customer service"
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setAdjusting(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REWARDS ──────────────────────────────────────────────────────────────────
function RewardsTab() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | create | edit
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_REWARD);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [flash, setFlash] = useState({ msg: "", type: "" });

  const showFlash = (msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash({ msg: "", type: "" }), 3500);
  };

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/loyalty/rewards`, {
        headers: authHeaders(),
      });
      setRewards(res.data.rewards || []);
    } catch {
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const openCreate = () => {
    setForm(EMPTY_REWARD);
    setEditTarget(null);
    setView("create");
  };
  const openEdit = (r) => {
    setForm({
      title: r.title || "",
      description: r.description || "",
      reward_type: r.reward_type || "discount_percentage",
      value: r.value ?? "",
      points_cost: r.points_cost ?? "",
      stock_quantity: r.stock_quantity ?? "",
      is_active: r.is_active !== false,
    });
    setEditTarget(r);
    setView("edit");
  };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const buildPayload = () => ({
    ...form,
    value: parseFloat(form.value) || 0,
    points_cost: parseInt(form.points_cost) || 0,
    stock_quantity:
      form.stock_quantity !== "" ? parseInt(form.stock_quantity) : null,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (view === "create") {
        await axios.post(
          `${API_URL}/api/admin/loyalty/rewards`,
          buildPayload(),
          { headers: authHeaders() },
        );
        showFlash("Reward created!");
      } else {
        await axios.put(
          `${API_URL}/api/admin/loyalty/rewards/${editTarget.id}`,
          buildPayload(),
          { headers: authHeaders() },
        );
        showFlash("Reward updated!");
      }
      setView("list");
      fetchRewards();
    } catch (err) {
      showFlash(err.response?.data?.error || "Failed to save reward", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/api/admin/loyalty/rewards/${id}`, {
        headers: authHeaders(),
      });
      showFlash("Reward deleted.");
      setRewards((r) => r.filter((x) => x.id !== id));
    } catch {
      showFlash("Failed to delete reward", "error");
    } finally {
      setDeleting(null);
      setConfirmDel(null);
    }
  };

  const toggleActive = async (r) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/loyalty/rewards/${r.id}`,
        { ...r, is_active: !r.is_active },
        { headers: authHeaders() },
      );
      fetchRewards();
    } catch {
      /* ignore */
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

      <div className={styles.panelHeader}>
        <p className={styles.panelCount}>{rewards.length} rewards</p>
        <div className={styles.panelActions}>
          {view !== "list" && (
            <button className={styles.btnGhost} onClick={() => setView("list")}>
              ← Back
            </button>
          )}
          {view === "list" && (
            <button className={styles.btnPrimary} onClick={openCreate}>
              <Plus size={16} /> New Reward
            </button>
          )}
        </div>
      </div>

      {view === "list" &&
        (loading ? (
          <Spinner />
        ) : (
          <div className={styles.rewardsGrid}>
            {rewards.length === 0 ? (
              <div className={styles.emptyState}>
                <Gift size={40} />
                <p>No rewards yet. Create the first one!</p>
                <button className={styles.btnPrimary} onClick={openCreate}>
                  <Plus size={16} /> Create Reward
                </button>
              </div>
            ) : (
              rewards.map((r) => (
                <div
                  key={r.id}
                  className={`${styles.rewardCard} ${!r.is_active ? styles.inactiveCard : ""}`}
                >
                  <div className={styles.rewardCardHeader}>
                    <div className={styles.rewardTypeIcon}>
                      {r.reward_type === "free_shipping" ? (
                        <Package size={20} />
                      ) : r.reward_type === "discount_percentage" ? (
                        <Star size={20} />
                      ) : (
                        <Gift size={20} />
                      )}
                    </div>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => toggleActive(r)}
                      title={r.is_active ? "Deactivate" : "Activate"}
                    >
                      {r.is_active ? (
                        <ToggleRight size={20} className={styles.toggleOn} />
                      ) : (
                        <ToggleLeft size={20} className={styles.toggleOff} />
                      )}
                    </button>
                  </div>
                  <h4 className={styles.rewardTitle}>{r.title}</h4>
                  <p className={styles.rewardDesc}>{r.description}</p>
                  <div className={styles.rewardMeta}>
                    <span className={styles.rewardValue}>
                      {r.reward_type === "discount_percentage"
                        ? `${r.value}% OFF`
                        : r.reward_type === "discount_fixed"
                          ? `₦${r.value} OFF`
                          : "Free Shipping"}
                    </span>
                    <span className={styles.rewardCost}>
                      ⭐ {r.points_cost?.toLocaleString()} pts
                    </span>
                  </div>
                  {r.stock_quantity !== null && (
                    <p className={styles.stockInfo}>
                      {r.stock_quantity} in stock · {r.times_redeemed || 0}{" "}
                      redeemed
                    </p>
                  )}
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => openEdit(r)}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => setConfirmDel(r)}
                      disabled={deleting === r.id}
                    >
                      <Trash2 size={14} /> {deleting === r.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}

      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGrid2}>
            <label className={styles.label}>
              Title *
              <input
                className={styles.input}
                name="title"
                value={form.title}
                onChange={handleField}
                required
                placeholder="e.g. 10% Off Next Order"
              />
            </label>
            <label className={styles.label}>
              Reward Type *
              <select
                className={styles.input}
                name="reward_type"
                value={form.reward_type}
                onChange={handleField}
              >
                {REWARD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            {form.reward_type !== "free_shipping" && (
              <label className={styles.label}>
                Value{" "}
                {form.reward_type === "discount_percentage" ? "(%)" : "(₦)"} *
                <input
                  className={styles.input}
                  name="value"
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={handleField}
                  required
                  placeholder="e.g. 10"
                />
              </label>
            )}
            <label className={styles.label}>
              Points Cost *
              <input
                className={styles.input}
                name="points_cost"
                type="number"
                min="0"
                value={form.points_cost}
                onChange={handleField}
                required
                placeholder="e.g. 500"
              />
            </label>
            <label className={styles.label}>
              Stock Quantity (leave blank for unlimited)
              <input
                className={styles.input}
                name="stock_quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={handleField}
                placeholder="Unlimited"
              />
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleField}
              />
              Active (visible to users)
            </label>
          </div>
          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Brief description of this reward…"
              rows={3}
            />
          </label>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setView("list")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : view === "create"
                  ? "Create Reward"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {confirmDel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalHeader}>Delete Reward</h3>
            <p className={styles.modalSub}>
              Delete <strong>{confirmDel.title}</strong>? This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnGhost}
                onClick={() => setConfirmDel(null)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => handleDelete(confirmDel.id)}
                disabled={deleting === confirmDel.id}
              >
                {deleting === confirmDel.id ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POINT EVENTS ─────────────────────────────────────────────────────────────
function PointEventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/loyalty/transactions`, {
        headers: authHeaders(),
        params: {
          page,
          limit: 25,
          type: typeFilter || undefined,
          search: search || undefined,
        },
      });
      setEvents(res.data.transactions || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={styles.tabPanel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by user or description…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          <option value="earn">Earned</option>
          <option value="redeem">Redeemed</option>
        </select>
        <button
          className={styles.btnIcon}
          onClick={fetchEvents}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Member</th>
                <th>Description</th>
                <th>Points</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <span
                        className={`${styles.typePill} ${ev.transaction_type === "earn" ? styles.earn : styles.redeem}`}
                      >
                        {ev.transaction_type === "earn" ? "Earned" : "Redeemed"}
                      </span>
                    </td>
                    <td>
                      <p className={styles.memberName}>{ev.full_name || "—"}</p>
                      <p className={styles.memberEmail}>{ev.email || ""}</p>
                    </td>
                    <td className={styles.descCell}>{ev.description}</td>
                    <td>
                      <span
                        className={
                          ev.transaction_type === "earn"
                            ? styles.positive
                            : styles.negative
                        }
                      >
                        {ev.transaction_type === "earn" ? "+" : ""}
                        {ev.points_amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
        <ChevronLeft size={16} /> Prev
      </button>
      <span className={styles.pageInfo}>
        Page {page} of {totalPages}
      </span>
      <button
        className={styles.pageBtn}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
