import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart2,
  Users,
  Eye,
  ShoppingBag,
  TrendingUp,
  Search,
  Activity,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Zap,
  Globe,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import styles from "./AnalyticsManagement.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

const PERIODS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

// ── Mini sparkline bar chart (pure CSS) ──────────────────────────────────────
function Sparkline({ data = [], color = "#6366f1" }) {
  if (!data.length) return <div className={styles.sparkEmpty}>No data</div>;
  const max = Math.max(
    ...data.map((d) => d.value || d.active_users || d.revenue || 0),
    1,
  );
  return (
    <div className={styles.sparkline}>
      {data.slice(-14).map((d, i) => {
        const val = d.value || d.active_users || d.revenue || 0;
        const h = Math.max((val / max) * 100, 2);
        return (
          <div
            key={i}
            className={styles.sparkBar}
            style={{ height: `${h}%`, background: color }}
            title={`${d.date || i}: ${val.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, sparkData }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <div className={styles.statIconWrap} style={{ background: color }}>
          <Icon size={18} color="#fff" />
        </div>
        {trend !== undefined && (
          <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
            {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={styles.statLabel}>{label}</p>
      <h3 className={styles.statValue}>{value}</h3>
      {sub && <p className={styles.statSub}>{sub}</p>}
      {sparkData && <Sparkline data={sparkData} color={color} />}
    </div>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={styles.hbar}>
      <div className={styles.hbarLabel}>{label}</div>
      <div className={styles.hbarTrack}>
        <div
          className={styles.hbarFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className={styles.hbarVal}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function AnalyticsManagement() {
  const { accessToken } = useAuthStore();
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [trending, setTrending] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [platform, trend] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/platform`, {
          params: { period },
          headers: authHeaders(accessToken),
        }),
        axios.get(`${API_URL}/api/analytics/trending`, {
          params: { limit: 10 },
        }),
      ]);
      setData(platform.data);
      setTrending(trend.data.products || []);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period, accessToken]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const fmt = (n) =>
    n >= 1e6
      ? `${(n / 1e6).toFixed(1)}M`
      : n >= 1e3
        ? `${(n / 1e3).toFixed(1)}K`
        : (n || 0).toString();
  const fmtN = (n) => Number(n || 0).toLocaleString();

  const metrics = data?.metrics || {};
  const dau = data?.dauOverTime || [];
  const products = data?.popularProducts || [];
  const searches = data?.popularSearches || [];

  const maxViews = Math.max(...products.map((p) => p.view_count || 0), 1);
  const maxSearch = Math.max(...searches.map((s) => s.search_count || 0), 1);

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <BarChart2 size={22} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Platform Analytics</h1>
            <p className={styles.headerSub}>
              Real-time insights across the platform
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.periodTabs}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className={`${styles.periodTab} ${period === p.value ? styles.periodActive : ""}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className={styles.refreshBtn} onClick={fetch} title="Refresh">
            <RefreshCw size={16} className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "products", label: "Products", icon: Package },
          { id: "searches", label: "Searches", icon: Search },
          { id: "trending", label: "Trending", icon: Zap },
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

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading analytics…</p>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ──────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={styles.kpiRow}>
                <StatCard
                  icon={Users}
                  label="Active Users"
                  value={fmt(metrics.active_users)}
                  color="linear-gradient(135deg,#6366f1,#8b5cf6)"
                  sparkData={dau}
                />
                <StatCard
                  icon={Globe}
                  label="Total Sessions"
                  value={fmt(metrics.total_sessions)}
                  color="linear-gradient(135deg,#0ea5e9,#06b6d4)"
                />
                <StatCard
                  icon={Eye}
                  label="Products Viewed"
                  value={fmt(metrics.products_viewed)}
                  color="linear-gradient(135deg,#f59e0b,#f97316)"
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Purchases"
                  value={fmt(metrics.total_purchases)}
                  color="linear-gradient(135deg,#10b981,#34d399)"
                />
              </div>

              {/* DAU Chart */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>
                  <TrendingUp size={16} /> Daily Active Users
                </h3>
                {dau.length === 0 ? (
                  <p className={styles.noData}>
                    No activity data for this period.
                  </p>
                ) : (
                  <div className={styles.barChart}>
                    {(() => {
                      const maxDau = Math.max(
                        ...dau.map((d) => d.active_users || 0),
                        1,
                      );
                      return dau.map((d, i) => {
                        const h = Math.max((d.active_users / maxDau) * 100, 2);
                        return (
                          <div
                            key={i}
                            className={styles.barWrap}
                            title={`${d.date}: ${d.active_users} users`}
                          >
                            <div
                              className={styles.barFill}
                              style={{ height: `${h}%` }}
                            />
                            {i % Math.ceil(dau.length / 7) === 0 && (
                              <span className={styles.barLabel}>
                                {new Date(d.date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Conversion snapshot */}
              <div className={styles.conversionCard}>
                <h3 className={styles.chartTitle}>
                  <Activity size={16} /> Conversion Snapshot
                </h3>
                <div className={styles.funnelRow}>
                  <div className={styles.funnelStep}>
                    <Eye size={20} />
                    <p>{fmt(metrics.products_viewed)}</p>
                    <span>Views</span>
                  </div>
                  <div className={styles.funnelArrow}>→</div>
                  <div className={styles.funnelStep}>
                    <ShoppingBag size={20} />
                    <p>{fmt(metrics.total_purchases)}</p>
                    <span>Purchases</span>
                  </div>
                  <div className={styles.funnelArrow}>→</div>
                  <div
                    className={styles.funnelStep}
                    style={{ color: "#10b981" }}
                  >
                    <TrendingUp size={20} />
                    <p>
                      {metrics.products_viewed > 0
                        ? (
                            (metrics.total_purchases /
                              metrics.products_viewed) *
                            100
                          ).toFixed(2)
                        : "0.00"}
                      %
                    </p>
                    <span>Conv. Rate</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ─────────────────────────────────────────────── */}
          {activeTab === "products" && (
            <div className={styles.listCard}>
              <h3 className={styles.chartTitle}>
                <Package size={16} /> Most Viewed Products
              </h3>
              {products.length === 0 ? (
                <p className={styles.noData}>
                  No product view data for this period.
                </p>
              ) : (
                <div className={styles.barList}>
                  {products.map((p, i) => (
                    <div key={p.id} className={styles.barListRow}>
                      <span className={styles.rankNum}>#{i + 1}</span>
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className={styles.productThumb}
                        />
                      )}
                      <div className={styles.barListInfo}>
                        <p className={styles.barListName}>{p.name}</p>
                        <HBar
                          label=""
                          value={p.view_count}
                          max={maxViews}
                          color="#6366f1"
                        />
                      </div>
                      <span className={styles.barListCount}>
                        {fmtN(p.view_count)} views
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SEARCHES ─────────────────────────────────────────────── */}
          {activeTab === "searches" && (
            <div className={styles.listCard}>
              <h3 className={styles.chartTitle}>
                <Search size={16} /> Top Search Queries
              </h3>
              {searches.length === 0 ? (
                <p className={styles.noData}>No search data for this period.</p>
              ) : (
                <div className={styles.barList}>
                  {searches.map((s, i) => (
                    <div key={i} className={styles.barListRow}>
                      <span className={styles.rankNum}>#{i + 1}</span>
                      <div className={styles.barListInfo}>
                        <p className={styles.barListName}>"{s.query}"</p>
                        <HBar
                          label=""
                          value={s.search_count}
                          max={maxSearch}
                          color="#f59e0b"
                        />
                      </div>
                      <span className={styles.barListCount}>
                        {fmtN(s.search_count)} searches
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TRENDING ─────────────────────────────────────────────── */}
          {activeTab === "trending" && (
            <div className={styles.listCard}>
              <h3 className={styles.chartTitle}>
                <Zap size={16} /> Trending Products (Last 24h)
              </h3>
              {trending.length === 0 ? (
                <p className={styles.noData}>No trending data available yet.</p>
              ) : (
                <div className={styles.trendingGrid}>
                  {trending.map((p, i) => (
                    <div key={p.id} className={styles.trendCard}>
                      <div className={styles.trendRank}>{i + 1}</div>
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className={styles.trendThumb}
                        />
                      )}
                      <div className={styles.trendInfo}>
                        <p className={styles.trendName}>{p.name}</p>
                        <p className={styles.trendStore}>
                          {p.store_name || "—"}
                        </p>
                        <p className={styles.trendPrice}>
                          ₦{Number(p.price || 0).toLocaleString()}
                          {p.discount_percentage > 0 && (
                            <span className={styles.trendDiscount}>
                              {" "}
                              -{p.discount_percentage}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
