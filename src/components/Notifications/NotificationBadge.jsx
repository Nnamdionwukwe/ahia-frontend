import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NotificationBadge.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const NotificationBadge = () => {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchUnreadCount();
      fetchRecentNotifications();

      // Poll every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchRecentNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: { page: 1, limit: 5, unreadOnly: true },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecentNotifications(response.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleBadgeClick = () => {
    if (unreadCount > 0) {
      setShowDropdown(!showDropdown);
    } else {
      navigate("/notifications");
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.badge}
        onClick={handleBadgeClick}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className={styles.count}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && unreadCount > 0 && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setShowDropdown(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h3>Notifications</h3>
              <span className={styles.unreadLabel}>{unreadCount} new</span>
            </div>

            <div className={styles.notificationsList}>
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={styles.notificationItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/notifications");
                  }}
                >
                  <div className={styles.notifContent}>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                  </div>
                  <span className={styles.time}>
                    {formatTimeAgo(notification.created_at)}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={styles.viewAllBtn}
              onClick={() => {
                setShowDropdown(false);
                navigate("/notifications");
              }}
            >
              View All Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBadge;
