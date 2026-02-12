import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Shield,
  Lock,
  HelpCircle,
  CheckCircle,
  CreditCard,
  Globe,
  MessageSquare,
  DollarSign,
  Bell,
  Info,
  FileText,
  Share2,
  LogOut,
  SunMoon,
  BarChart3,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import styles from "./Settings.module.css";

const Settings = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [selectedCountry, setSelectedCountry] = useState("NG");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  const securitySections = [
    {
      icon: Shield,
      title: "Account security",
      color: "#10b981",
    },
    {
      icon: Lock,
      title: "Privacy",
      color: "#10b981",
    },
    {
      icon: HelpCircle,
      title: "Permissions",
      color: "#10b981",
    },
    {
      icon: CheckCircle,
      title: "Safety center",
      color: "#10b981",
    },
  ];

  const menuItems = [
    {
      title: "Your payment methods",
      icon: CreditCard,
      arrow: true,
    },
    {
      title: "Country & region",
      icon: Globe,
      value: selectedCountry,
    },
    {
      title: "Language",
      icon: MessageSquare,
      value: selectedLanguage,
    },
    {
      title: "Currency",
      icon: DollarSign,
      value: selectedCurrency,
    },
    {
      title: "Notifications",
      icon: Bell,
      arrow: true,
    },
    {
      title: "About this app",
      icon: Info,
      arrow: true,
    },
    {
      title: "Legal terms & policies",
      icon: FileText,
      arrow: true,
    },
    {
      title: "Share this app",
      icon: Share2,
      arrow: true,
    },
    {
      title: "Switch accounts",
      icon: Globe,
      arrow: true,
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/auth");
    }
  };

  const handleMenuItemClick = (title) => {
    switch (title.toLowerCase()) {
      case "your payment methods":
        navigate("/settings/payment-methods");
        break;
      case "notifications":
        navigate("/settings/notifications");
        break;
      case "about this app":
        navigate("/settings/about");
        break;
      case "legal terms & policies":
        navigate("/settings/legal");
        break;
      case "share this app":
        // Share functionality
        if (navigator.share) {
          navigator.share({
            title: "Ahia",
            text: "Download the Ahia app and get amazing deals!",
            url: "https://ahia.com",
          });
        }
        break;
      case "switch accounts":
        navigate("/auth");
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>Settings</h1>
        <div className={styles.headerSpacer} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Security Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>
            <span className={styles.securityTitle}>
              Your account is protected
            </span>
          </h2>
          <p className={styles.sectionDescription}>
            Temu protects your personal information and keeps it private, safe
            and secure.
          </p>

          <div className={styles.securityGrid}>
            {securitySections.map((item, idx) => (
              <button
                key={idx}
                className={styles.securityCard}
                onClick={() => handleMenuItemClick(item.title)}
              >
                <div
                  className={styles.securityIcon}
                  style={{ color: item.color }}
                >
                  <item.icon size={28} />
                </div>
                <span className={styles.securityTitle}>{item.title}</span>
                <ChevronLeft
                  size={20}
                  className={styles.securityChevron}
                  style={{ color: item.color }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Menu Items Section */}
        <section className={styles.section}>
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className={styles.menuItem}
              onClick={() => handleMenuItemClick(item.title)}
            >
              <item.icon size={20} className={styles.menuIcon} />
              <span className={styles.menuTitle}>{item.title}</span>
              <span className={styles.menuValue}>
                {item.value}
                {item.arrow && <ChevronLeft size={20} />}
              </span>
            </button>
          ))}
        </section>

        {/* Sign Out Section */}
        <section className={styles.section}>
          <button className={styles.signOutButton} onClick={handleLogout}>
            <LogOut size={20} className={styles.signOutIcon} />
            <span>Sign out</span>
          </button>
        </section>

        {/* Theme Toggle (Optional - for demonstration) */}
        <section className={styles.section}>
          <button className={styles.menuItem} onClick={toggleTheme}>
            <SunMoon size={20} className={styles.menuIcon} />
            <span className={styles.menuTitle}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
            <span className={styles.menuValue}>{isDark ? "🌙" : "☀️"}</span>
          </button>
        </section>

        <section className={styles.section}>
          <button
            className={styles.menuItem}
            onClick={() => navigate("/admin-dashboard")}
          >
            <BarChart3 size={20} className={styles.menuIcon} />
            <span className={styles.menuTitle}>Admin Dashboard</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
