import React, { useState, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import useCartStore from "../../store/cartStore";
import Header from "../../components/Header/Header";

const Profile = () => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(true);
  const { items: cartItems, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const profile = {
    name: "Nnamdi Onwukwe",
    avatar: "https://via.placeholder.com/80/d4a574/ffffff?text=NO",
    notificationCount: 4,
    messagesCount: 65,
    credit: "₦1,600",
    coupons: 0,
    reviews: 19,
  };

  // Filter cart items into ALMOST GONE and PRICE DOWN categories
  const almostGoneItems = cartItems.filter((item) => {
    const stock = parseInt(item.available_stock || item.stock || 0);
    return stock > 0 && stock <= 20;
  });

  const priceDownItems = cartItems.filter((item) => {
    const discount =
      item.sale_discount ||
      item.discount_percentage ||
      item.variant_discount ||
      0;
    return discount > 0;
  });

  // Format sections for display
  const cartSections = [
    {
      id: 1,
      category: "ALMOST GONE",
      count: almostGoneItems.length,
      items: almostGoneItems.slice(0, 3).map((item) => {
        const stock = parseInt(item.available_stock || item.stock || 0);
        return {
          image: item.image_url || item.image,
          label: stock <= 10 ? `Only ${stock} left` : "Almost sold out",
          productId: item.product_id,
        };
      }),
    },
    {
      id: 2,
      category: "PRICE DOWN",
      count: priceDownItems.length,
      items: priceDownItems.slice(0, 3).map((item) => {
        const discount =
          item.sale_discount ||
          item.discount_percentage ||
          item.variant_discount ||
          0;
        return {
          image: item.image_url || item.image,
          label: discount > 0 ? `-${discount}%` : "",
          productId: item.product_id,
        };
      }),
    },
  ];

  const bottomTabs = [
    { icon: Clock, label: "History" },
    { icon: Gift, label: "Play & Earn" },
    { icon: MapPin, label: "Addresses" },
    { icon: Heart, label: "Following" },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

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
        <Link to="/orders" className={styles.menuItemLink}>
          <MenuItem icon={ShoppingBag} label="Your orders" count={null} />
        </Link>
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
          <div
            key={idx}
            className={styles.bottomTab}
            onClick={() =>
              navigate(
                `/${tab.label
                  .toLowerCase()
                  .replace(" & ", "-")
                  .replace(/ /g, "-")}`,
              )
            }
          >
            <tab.icon size={24} />
            <span>{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Cart Sections - Loop through actual cart items */}
      <div className={styles.cartSections}>
        {cartSections.map(
          (section) =>
            section.count > 0 && (
              <div key={section.id} className={styles.cartSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionCategory}>
                    {section.category}
                  </span>
                  <span className={styles.sectionTitle}>
                    {section.count} items in cart
                  </span>
                  <ChevronRight
                    size={20}
                    onClick={() => navigate("/cart")}
                    className={styles.sectionChevron}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className={styles.itemsGrid}>
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={styles.itemCard}
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      <img
                        src={item.image}
                        alt={`Item ${idx}`}
                        className={styles.itemImage}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                      {item.label && (
                        <span className={styles.itemLabel}>{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
        )}
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

export default Profile;
