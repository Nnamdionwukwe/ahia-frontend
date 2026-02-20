// src/components/admin/CartManagement.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import styles from "./CartManagement.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ── Auth headers — called as a hook inside CartManagement ──
// Returns headers object; must be called at component top level
function useAuthHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
export default function CartManagement() {
  const headers = useAuthHeaders();
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "active" | "abandoned" | ""
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null); // cart detail modal
  const [cartItems, setCartItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [flash, setFlash] = useState({ msg: "", type: "" });

  const showFlash = (msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash({ msg: "", type: "" }), 3500);
  };

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/carts/stats`, {
        headers: headers,
      });
      setStats(res.data);
    } catch {
      // Fallback placeholder
      setStats({
        totalCarts: 0,
        activeCarts: 0,
        abandonedCarts: 0,
        totalValue: 0,
        avgCartValue: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch cart list ──────────────────────────────────────────────────────────
  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/carts`, {
        headers: headers,
        params: {
          page,
          limit: 20,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setCarts(res.data.carts || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      setCarts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  // ── View cart detail ─────────────────────────────────────────────────────────
  const openCart = async (cart) => {
    setSelected(cart);
    setItemsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/carts/${cart.user_id}/items`,
        { headers: headers },
      );
      setCartItems(res.data.items || []);
    } catch {
      setCartItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  // ── Delete single cart item ──────────────────────────────────────────────────
  const deleteCartItem = async (cartItemId) => {
    setDeleting(cartItemId);
    try {
      await axios.delete(`${API_URL}/api/admin/carts/items/${cartItemId}`, {
        headers: headers,
      });
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      showFlash("Item removed from cart");
      fetchStats();
      fetchCarts();
    } catch {
      showFlash("Failed to remove item", "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Clear entire user cart ───────────────────────────────────────────────────
  const clearUserCart = async (userId, userName) => {
    if (
      !window.confirm(
        `Clear entire cart for ${userName}? This cannot be undone.`,
      )
    )
      return;
    try {
      await axios.delete(`${API_URL}/api/admin/carts/${userId}`, {
        headers: headers,
      });
      showFlash("Cart cleared");
      setSelected(null);
      fetchCarts();
      fetchStats();
    } catch {
      showFlash("Failed to clear cart", "error");
    }
  };

  // ── Cart status helper ───────────────────────────────────────────────────────
  const getStatus = (cart) => {
    const lastActive = new Date(
      cart.last_activity || cart.updated_at || cart.created_at,
    );
    const hoursAgo = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
    return hoursAgo > 24 ? "abandoned" : "active";
  };

  const cartTotal = (items) =>
    items.reduce(
      (sum, i) => sum + parseFloat(i.final_price || i.price || 0) * i.quantity,
      0,
    );

  return (
    <div className={styles.root}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <ShoppingCart size={26} className={styles.pageIcon} />
          <div>
            <h1 className={styles.pageTitle}>Cart Management</h1>
            <p className={styles.pageSubtitle}>
              Monitor and manage customer shopping carts
            </p>
          </div>
        </div>
        <button
          className={styles.btnRefresh}
          onClick={() => {
            fetchCarts();
            fetchStats();
          }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Flash */}
      {flash.msg && (
        <div
          className={
            flash.type === "error" ? styles.flashError : styles.flashSuccess
          }
        >
          {flash.msg}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        {statsLoading ? (
          <div className={styles.statsLoading}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <>
            <StatCard
              icon={ShoppingCart}
              label="Total Carts"
              value={stats?.totalCarts || 0}
              accent="#4f46e5"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Carts"
              value={stats?.activeCarts || 0}
              accent="#10b981"
              sub="< 24h activity"
            />
            <StatCard
              icon={AlertCircle}
              label="Abandoned"
              value={stats?.abandonedCarts || 0}
              accent="#f59e0b"
              sub="> 24h inactive"
            />
            <StatCard
              icon={Tag}
              label="Total Cart Value"
              value={fmt(stats?.totalValue)}
              accent="#8b5cf6"
            />
            <StatCard
              icon={Package}
              label="Avg Cart Value"
              value={fmt(stats?.avgCartValue)}
              accent="#ef4444"
            />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by customer name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Carts</option>
          <option value="active">Active</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Cart Value</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    <ShoppingCart
                      size={32}
                      style={{
                        opacity: 0.3,
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    No carts found
                  </td>
                </tr>
              ) : (
                carts.map((cart) => {
                  const status = getStatus(cart);
                  return (
                    <tr key={cart.user_id}>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar}>
                            {cart.full_name?.[0]?.toUpperCase() || (
                              <User size={14} />
                            )}
                          </div>
                          <div>
                            <p className={styles.customerName}>
                              {cart.full_name || "Unknown"}
                            </p>
                            <p className={styles.customerEmail}>{cart.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.itemCount}>
                          {cart.item_count || 0} items
                        </span>
                        <span className={styles.qtyCount}>
                          ({cart.total_quantity || 0} qty)
                        </span>
                      </td>
                      <td className={styles.valueCell}>
                        {fmt(cart.cart_value)}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${status === "active" ? styles.statusActive : styles.statusAbandoned}`}
                        >
                          {status === "active" ? "Active" : "Abandoned"}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {fmtDate(
                          cart.last_activity ||
                            cart.updated_at ||
                            cart.created_at,
                        )}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.btnView}
                            onClick={() => openCart(cart)}
                            title="View cart"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            className={styles.btnClear}
                            onClick={() =>
                              clearUserCart(cart.user_id, cart.full_name)
                            }
                            title="Clear cart"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* ── Cart Detail Modal ── */}
      {selected && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <ShoppingCart size={20} />
                <div>
                  <h3 className={styles.modalTitle}>
                    {selected.full_name}'s Cart
                  </h3>
                  <p className={styles.modalSub}>{selected.email}</p>
                </div>
              </div>
              <div className={styles.modalHeaderRight}>
                <button
                  className={styles.btnClearModal}
                  onClick={() =>
                    clearUserCart(selected.user_id, selected.full_name)
                  }
                >
                  <Trash2 size={14} /> Clear Cart
                </button>
                <button
                  className={styles.modalClose}
                  onClick={() => setSelected(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {itemsLoading ? (
              <div className={styles.spinnerWrap}>
                <div className={styles.spinner} />
              </div>
            ) : cartItems.length === 0 ? (
              <div className={styles.emptyModal}>
                <Package size={36} style={{ opacity: 0.3 }} />
                <p>Cart is empty</p>
              </div>
            ) : (
              <>
                <div className={styles.itemsList}>
                  {cartItems.map((item) => (
                    <div key={item.id} className={styles.cartItem}>
                      {/* Product image */}
                      <div className={styles.itemImage}>
                        {item.selected_image_url ||
                        item.image_url ||
                        item.images?.[0] ? (
                          <img
                            src={
                              item.selected_image_url ||
                              item.image_url ||
                              item.images?.[0]
                            }
                            alt={item.name}
                            className={styles.productImg}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Package size={20} className={styles.imgFallback} />
                        )}
                      </div>

                      {/* Product info */}
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <div className={styles.itemMeta}>
                          {item.color && (
                            <span className={styles.metaTag}>{item.color}</span>
                          )}
                          {item.size && (
                            <span className={styles.metaTag}>{item.size}</span>
                          )}
                          {item.sku && (
                            <span className={styles.metaTagMuted}>
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>
                        <div className={styles.itemSaleRow}>
                          {item.sale && (
                            <span className={styles.saleTag}>
                              {item.sale.title || "Sale"} -{item.sale_discount}%
                            </span>
                          )}
                          <span className={styles.itemSelected}>
                            {item.is_selected ? (
                              <CheckSquare size={13} />
                            ) : (
                              <Square size={13} />
                            )}
                            {item.is_selected ? "Selected" : "Not selected"}
                          </span>
                        </div>
                      </div>

                      {/* Qty + price */}
                      <div className={styles.itemRight}>
                        <p className={styles.itemQty}>× {item.quantity}</p>
                        <p className={styles.itemPrice}>
                          {fmt(item.final_price)}
                        </p>
                        {item.item_original_price &&
                          item.item_original_price > item.final_price && (
                            <p className={styles.itemOriginal}>
                              {fmt(item.item_original_price)}
                            </p>
                          )}
                      </div>

                      {/* Remove button */}
                      <button
                        className={styles.itemDelete}
                        onClick={() => deleteCartItem(item.id)}
                        disabled={deleting === item.id}
                        title="Remove item"
                      >
                        {deleting === item.id ? "…" : <X size={14} />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className={styles.modalFooter}>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Cart Total</span>
                    <span className={styles.totalValue}>
                      {fmt(cartTotal(cartItems))}
                    </span>
                  </div>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>
                      Selected Items Total
                    </span>
                    <span className={styles.totalValue}>
                      {fmt(cartTotal(cartItems.filter((i) => i.is_selected)))}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
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
