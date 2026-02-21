import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Bell, Tag, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Messages.module.css";
import axios from "axios";
import ProductCard from "../../components/ProductCard/ProductCard";

const MESSAGES = [
  {
    id: 1,
    category: "Promotions",
    icon: Tag,
    preview: "Congrats! You nailed it!",
    time: "11:47 AM",
    unread: 4,
    messages: [
      {
        id: 1,
        text: "Congrats! You nailed it! You've earned 500 loyalty points.",
        time: "11:47 AM",
        isNew: true,
      },
      {
        id: 2,
        text: "Flash sale! 30% off on electronics today only.",
        time: "10:00 AM",
        isNew: true,
      },
      {
        id: 3,
        text: "Your coupon code SAVE20 is expiring soon.",
        time: "Yesterday",
        isNew: true,
      },
      {
        id: 4,
        text: "New arrivals just dropped. Check them out!",
        time: "Dec 10",
        isNew: true,
      },
    ],
  },
  {
    id: 2,
    category: "Orders & Shipping",
    icon: Package,
    preview: "Order delivered",
    time: "Dec 5, 2025",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "Your order #AH-4821 has been delivered successfully.",
        time: "Dec 5, 2025",
        isNew: false,
      },
      {
        id: 2,
        text: "Your order #AH-4821 is out for delivery.",
        time: "Dec 4, 2025",
        isNew: false,
      },
    ],
  },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Messages() {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(true);
  const [openThread, setOpenThread] = useState(null);
  const [products, setProducts] = useState([]);

  const thread = MESSAGES.find((m) => m.id === openThread);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          params: { limit: 20, sort: "shuffle" },
        });
        const data =
          res.data?.products ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err.message);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => (openThread ? setOpenThread(null) : navigate(-1))}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>
          {thread ? thread.category : "Messages"}
        </h1>
        <div className={styles.headerRight}>
          <Link to="/notifications">
            <Bell size={22} />
          </Link>
        </div>
      </div>

      {/* Shipping Banner */}
      <div className={styles.shippingBanner}>
        <span className={styles.shippingItem}>✓ Free shipping</span>
        <span className={styles.shippingDivider}>|</span>
        <span className={styles.shippingItem}>
          ✓ Price adjustment within 30 days
        </span>
        <ChevronRight size={16} className={styles.shippingChevron} />
      </div>

      {/* Notification Banner */}
      {showNotification && !openThread && (
        <div className={styles.notifBanner}>
          <div className={styles.notifIconWrap}>
            <Bell size={22} />
          </div>
          <p className={styles.notifText}>
            Turn on Notifications for updates on your latest order status.
          </p>
          <button
            className={styles.notifOk}
            onClick={() => setShowNotification(false)}
          >
            OK
          </button>
          <button
            className={styles.notifClose}
            onClick={() => setShowNotification(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Thread List */}
      {!openThread && (
        <div className={styles.list}>
          {MESSAGES.map((msg, i) => {
            const Icon = msg.icon;
            return (
              <div
                key={msg.id}
                className={styles.listItem}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setOpenThread(msg.id)}
              >
                <div className={styles.listIconWrap}>
                  <Icon size={22} color="#fff" />
                </div>
                <div className={styles.listContent}>
                  <div className={styles.listTop}>
                    <span className={styles.listCategory}>{msg.category}</span>
                    <span className={styles.listTime}>{msg.time}</span>
                  </div>
                  <div className={styles.listBottom}>
                    <span className={styles.listPreview}>{msg.preview}</span>
                    {msg.unread > 0 && (
                      <span className={styles.unreadBadge}>{msg.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Product Feed */}
          {products.length > 0 && (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thread Detail */}
      {openThread && thread && (
        <div className={styles.threadList}>
          {thread.messages.map((msg, i) => (
            <div
              key={msg.id}
              className={styles.threadItem}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={styles.threadIconWrap}>
                <thread.icon size={18} color="#fff" />
              </div>
              <div className={styles.threadContent}>
                <p className={styles.threadText}>{msg.text}</p>
                <span className={styles.threadTime}>{msg.time}</span>
              </div>
              {msg.isNew && <span className={styles.newDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
