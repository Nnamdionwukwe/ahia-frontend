import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell,
  Send,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Gift,
  MessageSquare,
  Package,
} from "lucide-react";
import styles from "./NotificationsManagement.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const NotificationsManagement = () => {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("send");

  const [notificationForm, setNotificationForm] = useState({
    type: "promotion",
    title: "",
    message: "",
    priority: "normal",
    targetAudience: "all",
  });

  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  });

  const notificationTypes = [
    { value: "promotion", label: "Promotion", icon: Gift, color: "#8b5cf6" },
    { value: "flash_sale", label: "Flash Sale", icon: Zap, color: "#f59e0b" },
    {
      value: "order_update",
      label: "Order Update",
      icon: Package,
      color: "#06b6d4",
    },
    {
      value: "announcement",
      label: "Announcement",
      icon: MessageSquare,
      color: "#10b981",
    },
  ];

  const handleSendBulkNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert("Please fill in all required fields");
      return;
    }

    if (
      !window.confirm(
        `Send notification to ${notificationForm.targetAudience} users?`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/notifications/bulk`,
        {
          type: notificationForm.type,
          title: notificationForm.title,
          message: notificationForm.message,
          priority: notificationForm.priority,
          targetAudience: notificationForm.targetAudience,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      alert(`✅ Notification sent to ${response.data.sentCount} users!`);
      setNotificationForm({
        type: "promotion",
        title: "",
        message: "",
        priority: "normal",
        targetAudience: "all",
      });
    } catch (error) {
      console.error("Failed to send bulk notification:", error);
      alert("❌ Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/notifications/test`,
        {
          type: notificationForm.type,
          title: notificationForm.title || "Test Notification",
          message: notificationForm.message || "This is a test notification",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      alert("✅ Test notification sent to you!");
    } catch (error) {
      console.error("Failed to send test notification:", error);
      alert("❌ Failed to send test notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bell size={28} />
          <div>
            <h2>Notifications Management</h2>
            <p>Send bulk notifications and track engagement</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeView === "send" ? styles.active : ""}`}
          onClick={() => setActiveView("send")}
        >
          <Send size={18} />
          Send Notifications
        </button>
        <button
          className={`${styles.tab} ${activeView === "analytics" ? styles.active : ""}`}
          onClick={() => setActiveView("analytics")}
        >
          <TrendingUp size={18} />
          Analytics
        </button>
      </div>

      <div className={styles.content}>
        {activeView === "send" ? (
          <div className={styles.sendContainer}>
            <div className={styles.formCard}>
              <h3 className={styles.cardTitle}>Send Bulk Notification</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Notification Type *</label>
                  <div className={styles.typeGrid}>
                    {notificationTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          className={`${styles.typeButton} ${
                            notificationForm.type === type.value
                              ? styles.active
                              : ""
                          }`}
                          onClick={() =>
                            setNotificationForm({
                              ...notificationForm,
                              type: type.value,
                            })
                          }
                          style={{
                            borderColor:
                              notificationForm.type === type.value
                                ? type.color
                                : undefined,
                            backgroundColor:
                              notificationForm.type === type.value
                                ? `${type.color}10`
                                : undefined,
                          }}
                        >
                          <Icon size={20} style={{ color: type.color }} />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Target Audience *</label>
                  <select
                    value={notificationForm.targetAudience}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        targetAudience: e.target.value,
                      })
                    }
                    className={styles.select}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users (Last 30 days)</option>
                    <option value="verified">Verified Users Only</option>
                    <option value="unverified">Unverified Users</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        priority: e.target.value,
                      })
                    }
                    className={styles.select}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Flash Sale Started! 🔥"
                  maxLength={100}
                  className={styles.input}
                />
                <span className={styles.charCount}>
                  {notificationForm.title.length}/100
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter your notification message..."
                  rows={4}
                  maxLength={500}
                  className={styles.textarea}
                />
                <span className={styles.charCount}>
                  {notificationForm.message.length}/500
                </span>
              </div>

              <div className={styles.previewCard}>
                <h4>Preview</h4>
                <div className={styles.notificationPreview}>
                  <div
                    className={styles.previewIcon}
                    style={{
                      backgroundColor: notificationTypes.find(
                        (t) => t.value === notificationForm.type,
                      )?.color,
                    }}
                  >
                    {React.createElement(
                      notificationTypes.find(
                        (t) => t.value === notificationForm.type,
                      )?.icon || Bell,
                      { size: 20, color: "white" },
                    )}
                  </div>
                  <div className={styles.previewContent}>
                    <h5>{notificationForm.title || "Notification Title"}</h5>
                    <p>
                      {notificationForm.message ||
                        "Notification message will appear here..."}
                    </p>
                    <span className={styles.previewTime}>Just now</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.testButton}
                  onClick={handleSendTestNotification}
                  disabled={
                    loading ||
                    !notificationForm.title ||
                    !notificationForm.message
                  }
                >
                  <Send size={18} />
                  Send Test to Me
                </button>
                <button
                  className={styles.sendButton}
                  onClick={handleSendBulkNotification}
                  disabled={
                    loading ||
                    !notificationForm.title ||
                    !notificationForm.message
                  }
                >
                  <Send size={18} />
                  {loading ? "Sending..." : "Send to All Users"}
                </button>
              </div>
            </div>

            <div className={styles.tipsCard}>
              <h4>💡 Best Practices</h4>
              <ul>
                <li>
                  Keep titles under 50 characters for better mobile display
                </li>
                <li>Use emojis sparingly - one per notification maximum</li>
                <li>Create urgency for flash sales: "Ends in 2 hours!"</li>
                <li>Avoid sending more than 2-3 notifications per week</li>
                <li>Always send a test notification first</li>
              </ul>
              <div className={styles.warningBox}>
                <AlertCircle size={20} />
                <p>Users can disable notifications in their preferences!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.analyticsContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: "#4f46e5" }}
                >
                  <Send size={24} />
                </div>
                <div className={styles.statContent}>
                  <p>Total Sent</p>
                  <h3>{stats.totalSent.toLocaleString()}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: "#10b981" }}
                >
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statContent}>
                  <p>Delivered</p>
                  <h3>{stats.delivered.toLocaleString()}</h3>
                  <span className={styles.percentage}>
                    {stats.totalSent > 0
                      ? ((stats.delivered / stats.totalSent) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <AlertCircle size={20} />
              <div>
                <h4>Analytics Coming Soon</h4>
                <p>Detailed notification analytics will be available soon.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement;
