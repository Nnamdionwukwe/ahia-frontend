import React, { useState } from "react";
import {
  Bell,
  Eye,
  MessageCircle,
  Star,
  Clock,
  Gift,
  MapPin,
  Heart,
  ChevronRight,
  X,
  ShoppingBag,
} from "lucide-react";
import styles from "./AccountProfile.module.css";

const AccountProfile = () => {
  const [showNotification, setShowNotification] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const profile = {
    name: "Nnamdi Onwukwe",
    avatar: "https://via.placeholder.com/80/d4a574/ffffff?text=NO",
    notificationCount: 4,
    messagesCount: 65,
    credit: "₦1,600",
    coupons: 0,
    reviews: 19,
  };

  const cartItems = [
    {
      id: 1,
      category: "ALMOST GONE",
      title: "5 items in cart",
      items: [
        { image: "https://via.placeholder.com/100", label: "Almost sold out" },
        { image: "https://via.placeholder.com/100", label: "Only 19 left" },
        { image: "https://via.placeholder.com/100", label: "Almost sold out" },
      ],
    },
    {
      id: 2,
      category: "PRICE DOWN",
      title: "3 items in cart",
      items: [
        { image: "https://via.placeholder.com/100", label: "" },
        { image: "https://via.placeholder.com/100", label: "" },
        { image: "https://via.placeholder.com/100", label: "" },
      ],
    },
  ];

  const bottomTabs = [
    { icon: Clock, label: "History" },
    { icon: Gift, label: "Play & Earn" },
    { icon: MapPin, label: "Addresses" },
    { icon: Heart, label: "Following" },
  ];

  const menuItems = [
    { icon: ShoppingBag, label: "Your orders", count: null },
    { icon: MessageCircle, label: "Messages", count: 65 },
    { icon: Star, label: "Reviews", count: "19 awaiting review" },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <img
            src={profile.avatar}
            alt="Profile"
            className={styles.profileImage}
          />
          <h1 className={styles.profileName}>{profile.name}</h1>
        </div>
        <div className={styles.headerIcons}>
          <div className={styles.notificationBadge}>
            <Bell size={24} />
            <span className={styles.badge}>{profile.notificationCount}</span>
          </div>
          <Eye size={24} />
        </div>
      </div>

      {/* Notification Banner */}
      {showNotification && (
        <div className={styles.notificationBanner}>
          <Bell size={32} className={styles.bannerIcon} />
          <div className={styles.bannerContent}>
            <p>
              Turn on Notifications for updates on your latest order status.
            </p>
          </div>
          <div className={styles.bannerActions}>
            <button
              className={styles.okButton}
              onClick={() => setShowNotification(false)}
            >
              OK
            </button>
            <button
              className={styles.closeButton}
              onClick={() => setShowNotification(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Credit & Coupons */}
      <div className={styles.creditSection}>
        <div className={styles.creditCard}>
          <span>Credit</span>
          <div className={styles.creditValue}>
            <span>{profile.credit}</span>
            <ChevronRight size={20} />
          </div>
        </div>
        <div className={styles.creditCard}>
          <span>Coupons & offers ({profile.coupons})</span>
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>
        <MenuItem icon={ShoppingBag} label="Your orders" count={null} />
        <MenuItem
          icon={MessageCircle}
          label="Messages"
          count={profile.messagesCount}
        />
        <MenuItem
          icon={Star}
          label="Reviews"
          count="19 awaiting review"
          subtext
        />
      </div>

      {/* Bottom Navigation Tabs */}
      <div className={styles.bottomNavTabs}>
        {bottomTabs.map((tab, idx) => (
          <div key={idx} className={styles.bottomTab}>
            <tab.icon size={24} />
            <span>{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Cart Sections */}
      <div className={styles.cartSections}>
        {cartItems.map((section) => (
          <div key={section.id} className={styles.cartSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionCategory}>{section.category}</span>
              <span className={styles.sectionTitle}>{section.title}</span>
              <ChevronRight size={20} />
            </div>
            <div className={styles.itemsGrid}>
              {section.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <img
                    src={item.image}
                    alt={`Item ${idx}`}
                    className={styles.itemImage}
                  />
                  {item.label && (
                    <span className={styles.itemLabel}>{item.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// MenuItem Component
const MenuItem = ({ icon: Icon, label, count, subtext }) => (
  <div className={styles.menuItem}>
    <Icon size={24} className={styles.menuIcon} />
    <span className={styles.menuLabel}>{label}</span>
    {count && (
      <span className={subtext ? styles.countSubtext : styles.countBadge}>
        {count}
      </span>
    )}
    <ChevronRight size={20} className={styles.menuChevron} />
  </div>
);

export default AccountProfile;
