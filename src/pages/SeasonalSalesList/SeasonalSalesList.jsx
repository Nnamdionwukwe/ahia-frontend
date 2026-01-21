// src/pages/SeasonalSalesList/SeasonalSalesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTag, FiCalendar, FiPackage, FiTrendingUp } from "react-icons/fi";
import styles from "./SeasonalSalesList.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SeasonalSalesList = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active"); // active, upcoming, ended
  const [seasonalSales, setSeasonalSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchSeasonalSales();
  }, [activeTab]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      const now = new Date();

      seasonalSales.forEach((sale) => {
        const start = new Date(sale.start_time);
        const end = new Date(sale.end_time);

        if (start > now) {
          newTimers[sale.id] = {
            type: "starts_in",
            seconds: Math.floor((start - now) / 1000),
          };
        } else if (end > now) {
          newTimers[sale.id] = {
            type: "ends_in",
            seconds: Math.floor((end - now) / 1000),
          };
        } else {
          newTimers[sale.id] = { type: "ended", seconds: 0 };
        }
      });

      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [seasonalSales]);

  const fetchSeasonalSales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with query params
      const url = new URL(`${API_URL}/api/seasonal-sales`);
      if (activeTab) {
        url.searchParams.append("status", activeTab);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSeasonalSales(data.seasonalSales || []);
    } catch (err) {
      console.error("Error fetching seasonal sales:", err);
      setError("Failed to load seasonal sales");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeasonColor = (season) => {
    const colors = {
      spring: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      summer: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      fall: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
      autumn: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
      winter: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    };
    return (
      colors[season?.toLowerCase()] ||
      "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading seasonal sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div
        className={styles.header}
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
        }}
      >
        <div className={styles.headerContent}>
          <div className={styles.title}>
            <FiTag className={styles.icon} />
            <h1>Seasonal Sales</h1>
          </div>
          <p>Special seasonal offers on your favorite products!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "active" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active Now
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "upcoming" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "ended" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("ended")}
        >
          Ended
        </button>
      </div>

      {/* Seasonal Sales Grid */}
      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchSeasonalSales}>Try Again</button>
        </div>
      ) : seasonalSales.length > 0 ? (
        <div className={styles.salesGrid}>
          {seasonalSales.map((sale) => {
            const timer = timers[sale.id];
            const isActive = timer?.type === "ends_in";
            const isUpcoming = timer?.type === "starts_in";
            const isEnded = timer?.type === "ended";

            return (
              <div
                key={sale.id}
                className={`${styles.saleCard} ${
                  isActive ? styles.activeSale : ""
                } ${isEnded ? styles.endedSale : ""}`}
                onClick={() => navigate(`/seasonal-sales/${sale.id}`)}
                style={{
                  borderColor: isActive ? "#10b981" : "transparent",
                }}
              >
                {/* Status Badge */}
                <div className={styles.statusBadge}>
                  {isActive && (
                    <span
                      className={styles.live}
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                      }}
                    >
                      <span className={styles.liveDot}></span>
                      LIVE NOW
                    </span>
                  )}
                  {isUpcoming && (
                    <span className={styles.upcoming}>UPCOMING</span>
                  )}
                  {isEnded && <span className={styles.ended}>ENDED</span>}
                </div>

                {/* Sale Info */}
                <div className={styles.saleInfo}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <h3>{sale.name}</h3>
                    {sale.season && (
                      <span
                        style={{
                          background: getSeasonColor(sale.season),
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {sale.season}
                      </span>
                    )}
                  </div>

                  {sale.description && (
                    <p className={styles.description}>{sale.description}</p>
                  )}

                  {/* Timer */}
                  {timer && !isEnded && (
                    <div className={styles.timer}>
                      <FiCalendar />
                      <span>
                        {isUpcoming ? "Starts in: " : "Ends in: "}
                        <strong>{formatTime(timer.seconds)}</strong>
                      </span>
                    </div>
                  )}

                  {isEnded && (
                    <div className={styles.endedInfo}>
                      Ended on {formatDate(sale.end_time)}
                    </div>
                  )}

                  {/* Stats */}
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <FiPackage />
                      <span>
                        {sale.total_products || 0} Product
                        {sale.total_products !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <FiTrendingUp />
                      <span>Up to {sale.discount_percentage || 0}% OFF</span>
                    </div>
                  </div>

                  {/* Progress (for active/ended sales) */}
                  {sale.total_quantity > 0 && !isUpcoming && (
                    <div className={styles.progress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${
                              (sale.total_sold / sale.total_quantity) * 100
                            }%`,
                            background:
                              "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
                          }}
                        />
                      </div>
                      <div className={styles.progressText}>
                        {sale.total_sold} / {sale.total_quantity} sold
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className={styles.viewButton}
                  style={{
                    background: isEnded
                      ? "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)"
                      : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                    boxShadow: isEnded
                      ? "0 4px 12px rgba(117, 117, 117, 0.3)"
                      : "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {isActive && "Shop Now"}
                  {isUpcoming && "View Details"}
                  {isEnded && "View Results"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <FiTag className={styles.emptyIcon} />
          <h3>No {activeTab} seasonal sales</h3>
          <p>
            {activeTab === "active" &&
              "There are no active seasonal sales at the moment. Check back soon!"}
            {activeTab === "upcoming" &&
              "No upcoming seasonal sales scheduled yet."}
            {activeTab === "ended" && "No seasonal sales have ended recently."}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeasonalSalesList;
