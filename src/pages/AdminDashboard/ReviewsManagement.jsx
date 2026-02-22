// src/components/admin/ReviewsManagement.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Star,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Package,
  RefreshCw,
  X,
} from "lucide-react";
import styles from "./ReviewsManagement.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
  { value: "helpful", label: "Most Helpful" },
];

function StarDisplay({ rating, size = 14 }) {
  return (
    <span className={styles.starDisplay} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewsManagement() {
  const { accessToken } = useAuthStore();

  // ── Stats ─────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Reviews list ──────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [listLoading, setListLoading] = useState(true);

  // ── Filters ───────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  // ── UI ────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [flash, setFlash] = useState({ msg: "", type: "" });

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── Flash helper ──────────────────────────────────────────────
  function showFlash(msg, type = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash({ msg: "", type: "" }), 3500);
  }

  // ── Fetch stats ───────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/adminReviews/stats`,
        { headers: authHeader },
      );
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error("Review stats error:", e);
    } finally {
      setStatsLoading(false);
    }
  }, [accessToken]);

  // ── Fetch reviews ─────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setListLoading(true);
    try {
      const params = { page, limit: 15, sort };
      if (filterRating) params.rating = filterRating;
      if (search.trim()) params.search = search.trim();

      const { data } = await axios.get(`${API_URL}/api/admin/adminReviews`, {
        params,
        headers: authHeader,
      });
      if (data.success) {
        setReviews(data.data.reviews);
        setPagination(data.data.pagination);
      }
    } catch (e) {
      console.error("Fetch reviews error:", e);
    } finally {
      setListLoading(false);
    }
  }, [accessToken, page, sort, filterRating, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sort, filterRating, search]);

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/admin/adminReviews/${id}`, {
        headers: authHeader,
      });
      setReviews((r) => r.filter((x) => x.id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
      fetchStats();
      showFlash("Review deleted successfully.");
    } catch (e) {
      showFlash(e.response?.data?.error || "Failed to delete review.", "error");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  // ── Search submit ─────────────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    fetchReviews();
  }

  // ─────────────────────────────────────────────────────────────
  const statCards = stats
    ? [
        {
          label: "Total Reviews",
          value: stats.overview.total_reviews,
          icon: MessageSquare,
          color: "var(--primary-color)",
        },
        {
          label: "Average Rating",
          value: stats.overview.average_rating?.toFixed(2) ?? "—",
          icon: Star,
          color: "#f59e0b",
        },
        {
          label: "This Month",
          value: stats.overview.this_month,
          icon: TrendingUp,
          color: "var(--success-color)",
        },
        {
          label: "Total Helpful",
          value: stats.overview.total_helpful,
          icon: ThumbsUp,
          color: "#8b5cf6",
        },
      ]
    : [];

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* Flash */}
      {flash.msg && (
        <div
          className={`${styles.flash} ${flash.type === "error" ? styles.flashError : styles.flashSuccess}`}
        >
          {flash.msg}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className={styles.statGrid}>
        {statsLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`${styles.statCard} ${styles.skeleton}`}
                />
              ))
          : statCards.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div
                  className={styles.statIconWrap}
                  style={{ background: `${s.color}1a` }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <div className={styles.statValue}>
                    {s.value?.toLocaleString?.() ?? s.value}
                  </div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
      </div>

      {/* ── Stats detail row ── */}
      {stats && (
        <div className={styles.detailRow}>
          {/* Rating distribution */}
          <div className={styles.detailCard}>
            <div className={styles.detailTitle}>Rating Distribution</div>
            <div className={styles.distribution}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  stats.distribution.find((d) => d.rating === star)?.count || 0;
                const pct = stats.overview.total_reviews
                  ? Math.round((count / stats.overview.total_reviews) * 100)
                  : 0;
                return (
                  <div key={star} className={styles.distRow}>
                    <span className={styles.distStar}>{star}★</span>
                    <div className={styles.distBar}>
                      <div
                        className={styles.distFill}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={styles.distCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top products */}
          <div className={styles.detailCard}>
            <div className={styles.detailTitle}>Most Reviewed Products</div>
            <div className={styles.topList}>
              {stats.top_products.map((p, i) => (
                <div key={p.id} className={styles.topItem}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <div className={styles.topInfo}>
                    <span className={styles.topName}>{p.name}</span>
                    <StarDisplay rating={Math.round(p.avg_rating)} />
                  </div>
                  <span className={styles.topCount}>
                    {p.review_count} reviews
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reviews mini */}
          <div className={styles.detailCard}>
            <div className={styles.detailTitle}>Recent Activity</div>
            <div className={styles.recentList}>
              {stats.recent_reviews.map((r) => (
                <div key={r.id} className={styles.recentItem}>
                  <div className={styles.recentHeader}>
                    <span className={styles.recentUser}>{r.user_name}</span>
                    <StarDisplay rating={r.rating} size={12} />
                  </div>
                  <div className={styles.recentProduct}>{r.product_name}</div>
                  {r.comment && (
                    <div className={styles.recentComment}>
                      "
                      {r.comment.length > 60
                        ? r.comment.slice(0, 60) + "…"
                        : r.comment}
                      "
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className={styles.filterBar}>
        <form onSubmit={handleSearch} className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search reviewer, product, or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </form>

        <div className={styles.filterGroup}>
          <Filter size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r !== 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            className={styles.refreshBtn}
            onClick={() => {
              fetchReviews();
              fetchStats();
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Reviews Table ── */}
      <div className={styles.tableWrap}>
        {listLoading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={40} className={styles.emptyIcon} />
            <p>No reviews found.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {[
                  "Reviewer",
                  "Product",
                  "Rating",
                  "Comment",
                  "Helpful",
                  "Date",
                  "",
                ].map((h) => (
                  <th key={h} className={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className={styles.tr}>
                  {/* Reviewer */}
                  <td className={styles.td}>
                    <div className={styles.reviewerCell}>
                      <div className={styles.avatarFallback}>
                        {(r.user_name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.reviewerName}>{r.user_name}</div>
                        {r.user_email && (
                          <div className={styles.reviewerEmail}>
                            {r.user_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      <Package size={14} className={styles.productIcon} />
                      <span className={styles.productName}>
                        {r.product_name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className={styles.td}>
                    <div className={styles.ratingCell}>
                      <StarDisplay rating={r.rating} />
                      <span className={styles.ratingNum}>{r.rating}/5</span>
                    </div>
                  </td>

                  {/* Comment */}
                  <td className={styles.td}>
                    <div className={styles.commentCell}>
                      {r.comment ? (
                        r.comment.length > 80 ? (
                          r.comment.slice(0, 80) + "…"
                        ) : (
                          r.comment
                        )
                      ) : (
                        <span className={styles.noComment}>No comment</span>
                      )}
                      {r.images?.length > 0 && (
                        <span className={styles.imgBadge}>
                          {r.images.length} img{r.images.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Helpful */}
                  <td className={styles.td}>
                    <div className={styles.helpfulCell}>
                      <ThumbsUp size={13} />
                      {r.helpful_count}
                    </div>
                  </td>

                  {/* Date */}
                  <td className={styles.td}>
                    <span className={styles.dateCell}>
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Action */}
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setConfirmId(r.id)}
                      disabled={deletingId === r.id}
                      title="Delete review"
                    >
                      {deletingId === r.id ? (
                        <div className={styles.btnSpinner} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!listLoading && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {(page - 1) * pagination.limit + 1}–
            {Math.min(page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p =
                page <= 3
                  ? i + 1
                  : page >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : page - 2 + i;
              if (p < 1 || p > pagination.pages) return null;
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {confirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Review</h3>
            <p className={styles.modalBody}>
              This will permanently remove the review and update the product's
              rating. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnGhost}
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                onClick={() => handleDelete(confirmId)}
                disabled={deletingId === confirmId}
              >
                {deletingId === confirmId ? "Deleting…" : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
