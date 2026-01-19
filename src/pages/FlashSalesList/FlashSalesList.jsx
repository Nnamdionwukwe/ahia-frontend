// src/pages/FlashSalesList/FlashSalesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiZap, FiClock, FiPackage, FiTrendingUp } from "react-icons/fi";
import styles from "./FlashSalesList.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const FlashSalesList = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active"); // active, upcoming, ended
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchFlashSales();
  }, [activeTab]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      const now = new Date();

      flashSales.forEach((sale) => {
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
  }, [flashSales]);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/flash-sales`, {
        params: { status: activeTab },
      });

      setFlashSales(response.data.flashSales || []);
    } catch (err) {
      console.error("Error fetching flash sales:", err);
      setError("Failed to load flash sales");
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading flash sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.title}>
            <FiZap className={styles.icon} />
            <h1>Flash Sales</h1>
          </div>
          <p>Limited time deals on your favorite products!</p>
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

      {/* Flash Sales Grid */}
      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchFlashSales}>Try Again</button>
        </div>
      ) : flashSales.length > 0 ? (
        <div className={styles.salesGrid}>
          {flashSales.map((sale) => {
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
                onClick={() => navigate(`/flash-sales/${sale.id}`)}
              >
                {/* Status Badge */}
                <div className={styles.statusBadge}>
                  {isActive && (
                    <span className={styles.live}>
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
                  <h3>{sale.title}</h3>
                  {sale.description && (
                    <p className={styles.description}>{sale.description}</p>
                  )}

                  {/* Timer */}
                  {timer && !isEnded && (
                    <div className={styles.timer}>
                      <FiClock />
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
                      <span>Up to {sale.discount_percentage}% OFF</span>
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
                <button className={styles.viewButton}>
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
          <FiZap className={styles.emptyIcon} />
          <h3>No {activeTab} flash sales</h3>
          <p>
            {activeTab === "active" &&
              "There are no active flash sales at the moment. Check back soon!"}
            {activeTab === "upcoming" &&
              "No upcoming flash sales scheduled yet."}
            {activeTab === "ended" && "No flash sales have ended recently."}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashSalesList;
