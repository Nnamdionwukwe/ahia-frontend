// src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import axios from "axios";
import styles from "./OrdersPage.module.css";
import useAuthStore from "../../store/authStore";
import AllOrders from "./AllOrders";
import Processing from "./Processing";
import Shipped from "./Shipped";
import Delivered from "./Delivered";
import Returns from "./Returns";
import {
  CancelOrderModal,
  PaymentConfirmModal,
  PlaceOrderAgainModal,
} from "./OrderModals";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [countdown, setCountdown] = useState("");

  const tabs = [
    { id: "all", label: "All orders", icon: Package },
    { id: "processing", label: "Processing", icon: Clock },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle },
    { id: "returns", label: "Returns", icon: XCircle },
  ];

  // ── Fetch orders ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        params: {
          status: activeTab === "all" ? undefined : activeTab,
          page: 1,
          limit: 50,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Countdown for payment expiry ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedOrder?.payment_expires_at) return;
    const update = () => {
      const diff = Math.max(
        0,
        new Date(selectedOrder.payment_expires_at) - new Date(),
      );
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(
        `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [selectedOrder]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCancelOrderClick = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
    setShowMenu(null);
  };

  const handleConfirmCancel = async () => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${selectedOrder.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setShowCancelModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleBuyAgainClick = (order) => {
    setSelectedOrder(order);
    setShowPlaceOrderModal(true);
    setShowMenu(null);
  };

  const handleConfirmBuyAgain = () => {
    setShowPlaceOrderModal(false);
    navigate("/checkout");
  };

  const handleChangePaymentClick = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
    setShowMenu(null);
  };

  const handleContinueToPay = () => {
    setShowPaymentModal(false);
    navigate(`/checkout?order_id=${selectedOrder.id}`);
  };

  const handleAlreadyPaid = async () => {
    try {
      await axios.post(
        `${API_URL}/api/payments/bank-transfer/confirm`,
        { reference: selectedOrder.payment_reference },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setShowPaymentModal(false);
      fetchOrders();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      alert("Failed to confirm payment. Please try again.");
    }
  };

  // ── Auth guard ────────────────────────────────────────────────────────────────
  if (!accessToken) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Please login to view your orders</p>
          <button onClick={() => navigate("/auth")}>Login</button>
        </div>
      </div>
    );
  }

  const sharedProps = {
    orders,
    loading,
    showMenu,
    setShowMenu,
    onCancelClick: handleCancelOrderClick,
    onBuyAgainClick: handleBuyAgainClick,
    onChangePaymentClick: handleChangePaymentClick,
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Your orders</h1>
        <button className={styles.searchButton}>
          <Search size={24} />
        </button>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "all" && <AllOrders {...sharedProps} />}
        {activeTab === "processing" && <Processing {...sharedProps} />}
        {activeTab === "shipped" && <Shipped {...sharedProps} />}
        {activeTab === "delivered" && <Delivered {...sharedProps} />}
        {activeTab === "returns" && <Returns {...sharedProps} />}
      </div>

      {/* ── Modals (all from OrderModals.jsx) ── */}
      <CancelOrderModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />

      <PaymentConfirmModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onContinueToPay={handleContinueToPay}
        onAlreadyPaid={handleAlreadyPaid}
        countdown={countdown}
      />

      <PlaceOrderAgainModal
        open={showPlaceOrderModal}
        onClose={() => setShowPlaceOrderModal(false)}
        onConfirm={handleConfirmBuyAgain}
      />
    </div>
  );
};

export default OrdersPage;
