import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  Settings,
  X,
  Package,
  DollarSign,
  Zap,
  RefreshCw,
  ShoppingCart,
  Star,
  Gift,
  MessageSquare,
  ChevronDown,
  WifiOff,
} from "lucide-react";
import styles from "./Notifications.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const NotificationIcon = ({ type }) => {
  const icons = {
    order_update: Package,
    price_drop: DollarSign,
    flash_sale: Zap,
    restock: RefreshCw,
    promotion: Gift,
    loyalty: Star,
    cart_reminder: ShoppingCart,
    review_request: MessageSquare,
  };

  const Icon = icons[type] || Bell;
  return <Icon size={18} />;
};

const Notifications = () => {
  const { accessToken, user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // connected, disconnected, error
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchPreferences();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [filter, page]);

  useEffect(() => {
    if (accessToken) {
      setupRealTimeNotifications();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [accessToken]);

  const setupRealTimeNotifications = () => {
    if (!accessToken) {
      console.log("No access token, skipping SSE setup");
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      console.log("Setting up SSE connection...");
      const eventSource = new EventSource(
        `${API_URL}/api/notifications/stream?token=${accessToken}`,
      );

      eventSource.onopen = () => {
        console.log("✅ SSE connection opened");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          // Skip empty messages or heartbeats
          if (!event.data || event.data.trim() === "") {
            return;
          }

          const data = JSON.parse(event.data);

          if (data.type === "unread_count") {
            setUnreadCount(data.count);
          } else {
            // New notification received
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if permission granted
            if (Notification.permission === "granted") {
              new Notification(data.title, {
                body: data.message,
                icon: "/logo.png",
              });
            }
          }
        } catch (error) {
          // Ignore JSON parse errors from heartbeat messages
          if (event.data && !event.data.startsWith(":")) {
            console.error(
              "Failed to parse SSE message:",
              error,
              "Data:",
              event.data,
            );
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE connection error:", error);
        setConnectionStatus("error");

        // Close the connection
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        const maxAttempts = 5;
        const backoffDelay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000,
        );

        if (reconnectAttempts.current < maxAttempts) {
          reconnectAttempts.current++;
          console.log(
            `Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttempts.current}/${maxAttempts})...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            setupRealTimeNotifications();
          }, backoffDelay);
        } else {
          console.log("Max reconnection attempts reached. Giving up.");
          setConnectionStatus("disconnected");
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to setup real-time notifications:", error);
      setConnectionStatus("error");
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: {
          page,
          limit: 20,
          unreadOnly: filter === "unread",
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...response.data.notifications]);
      }

      setHasMore(
        response.data.notifications.length === 20 &&
          response.data.pagination.pages > page,
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/preferences`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setPreferences(response.data);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      // Set default preferences if fetch fails
      setPreferences({
        order_updates: true,
        price_drops: true,
        flash_sales: true,
        restock_alerts: true,
        promotions: true,
        push_enabled: true,
        email_enabled: false,
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all read notifications?")) return;

    try {
      await axios.delete(`${API_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const handleUpdatePreferences = async (updatedPrefs) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/preferences`,
        updatedPrefs,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      setPreferences(response.data);
      alert("Preferences updated successfully!");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      alert("Failed to update preferences");
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        alert("Browser notifications enabled!");
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "var(--danger-color)";
      case "normal":
        return "var(--primary-color)";
      default:
        return "var(--text-secondary)";
    }
  };

  if (showPreferences && preferences) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => setShowPreferences(false)}
          >
            <X size={20} />
          </button>
          <h2>Notification Preferences</h2>
        </div>

        <div className={styles.preferencesContainer}>
          <div className={styles.preferenceSection}>
            <h3>Notification Types</h3>
            <p className={styles.sectionDesc}>
              Choose which notifications you want to receive
            </p>

            {[
              {
                key: "order_updates",
                label: "Order Updates",
                desc: "Shipping, delivery, and order status",
                icon: "📦",
              },
              {
                key: "price_drops",
                label: "Price Drops",
                desc: "When wishlist items go on sale",
                icon: "💰",
              },
              {
                key: "flash_sales",
                label: "Flash Sales",
                desc: "Limited-time deals and offers",
                icon: "⚡",
              },
              {
                key: "restock_alerts",
                label: "Restock Alerts",
                desc: "When out-of-stock items return",
                icon: "🔔",
              },
              {
                key: "promotions",
                label: "Promotions",
                desc: "Special offers and campaigns",
                icon: "🎁",
              },
            ].map((pref) => (
              <div key={pref.key} className={styles.preferenceItem}>
                <div className={styles.preferenceInfo}>
                  <span className={styles.prefIcon}>{pref.icon}</span>
                  <div>
                    <h4>{pref.label}</h4>
                    <p>{pref.desc}</p>
                  </div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={preferences[pref.key] || false}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        [pref.key]: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            ))}
          </div>

          <div className={styles.preferenceSection}>
            <h3>Delivery Channels</h3>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <span className={styles.prefIcon}>📱</span>
                <div>
                  <h4>Push Notifications</h4>
                  <p>In-app notifications</p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.push_enabled || false}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      push_enabled: e.target.checked,
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <span className={styles.prefIcon}>📧</span>
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates via email</p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.email_enabled || false}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      email_enabled: e.target.checked,
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {Notification.permission === "default" && (
              <button
                className={styles.enableBrowserBtn}
                onClick={requestNotificationPermission}
              >
                <Bell size={18} />
                Enable Browser Notifications
              </button>
            )}
          </div>

          <button
            className={styles.saveButton}
            onClick={() => handleUpdatePreferences(preferences)}
          >
            Save Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
          {/* Connection status indicator */}
          {connectionStatus === "error" && (
            <span className={styles.statusIndicator} title="Connection error">
              <WifiOff size={16} />
            </span>
          )}
        </div>
        <button
          className={styles.settingsButton}
          onClick={() => setShowPreferences(true)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "unread" ? styles.active : ""}`}
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className={styles.actions}>
          {unreadCount > 0 && (
            <button
              className={styles.actionBtn}
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <Check size={18} />
              Mark all read
            </button>
          )}
          <button
            className={styles.actionBtn}
            onClick={handleClearAll}
            title="Clear read notifications"
          >
            <Trash2 size={18} />
            Clear read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {loading && page === 1 ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <BellOff size={64} />
            <h3>No notifications</h3>
            <p>
              {filter === "unread"
                ? "You're all caught up!"
                : "You'll see notifications here when you get them"}
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${
                  !notification.is_read ? styles.unread : ""
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div
                  className={styles.iconContainer}
                  style={{
                    borderColor: getPriorityColor(notification.priority),
                  }}
                >
                  <NotificationIcon type={notification.type} />
                </div>

                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4>{notification.title}</h4>
                    <span className={styles.time}>
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>

                  <p className={styles.message}>{notification.message}</p>

                  {notification.reference_data && (
                    <span className={styles.reference}>
                      {notification.reference_data}
                    </span>
                  )}

                  {!notification.is_read && (
                    <span className={styles.unreadDot}></span>
                  )}
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  title="Delete"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {hasMore && (
              <button
                className={styles.loadMoreBtn}
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} />
                    Load More
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
