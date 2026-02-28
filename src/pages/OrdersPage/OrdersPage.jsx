// src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  X,
  Building2,
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(null);

  // Modal states
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

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Countdown timer for payment processing orders
  useEffect(() => {
    if (!selectedOrder || !selectedOrder.payment_expires_at) return;

    const updateCountdown = () => {
      const expiresAt = new Date(selectedOrder.payment_expires_at);
      const now = new Date();
      const diff = Math.max(0, expiresAt - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        params: {
          status: activeTab === "all" ? undefined : activeTab,
          page: 1,
          limit: 50,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrderClick = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
    setShowMenu(null);
  };

  const handleBuyAgainClick = (order) => {
    setSelectedOrder(order);
    setShowPlaceOrderModal(true);
    setShowMenu(null);
  };

  const handleConfirmBuyAgain = () => {
    setShowPlaceOrderModal(false);
    // Add items to cart and navigate to checkout
    navigate("/checkout");
  };

  const handleConfirmCancel = async () => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${selectedOrder.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setShowCancelModal(false);
      setSelectedOrder(null);
      fetchOrders();
      alert("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
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
      // Call API to mark as paid/confirm payment
      await axios.post(
        `${API_URL}/api/payments/bank-transfer/confirm`,
        {
          reference: selectedOrder.payment_reference,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setShowPaymentModal(false);
      alert(
        "Payment confirmation received! We'll verify your transfer shortly.",
      );
      fetchOrders();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      alert("Failed to confirm payment. Please try again.");
    }
  };

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
        <button className={styles.searchButton} onClick={() => {}}>
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

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCancelModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setShowCancelModal(false)}
            >
              <X size={24} />
            </button>

            <div className={styles.modalIcon}>
              <CheckCircle size={48} />
            </div>

            <h2 className={styles.modalTitle}>
              Your order will be processed{" "}
              <span className={styles.modalHighlight}>within 5 min.</span> Are
              you sure you want to cancel this order?
            </h2>

            <ul className={styles.modalList}>
              <li>We will keep your payment safe.</li>
              <li>Once the payment is completed, you will receive an email.</li>
              <li>If canceled, item(s) will be returned to your cart.</li>
            </ul>

            <button
              className={styles.modalPrimaryButton}
              onClick={() => setShowCancelModal(false)}
            >
              Keep this order
            </button>

            <button
              className={styles.modalSecondaryButton}
              onClick={handleConfirmCancel}
            >
              Cancel this order
            </button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPaymentModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPaymentModal(false)}
            >
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>
              Have you already paid for this order?
            </h2>

            <p className={styles.modalDescription}>
              <span className={styles.modalHighlight}>
                If you have already paid with
              </span>{" "}
              <Building2 size={20} className={styles.inlineIcon} /> Bank
              transfer, please wait for your order status to be updated.
            </p>

            <p className={styles.modalDescription}>
              If you haven't paid yet, you can change the payment method to
              complete the payment{" "}
              <span className={styles.modalHighlight}>
                within {countdown || "14:47:50"}
              </span>
              .
            </p>

            <button
              className={styles.modalPrimaryButton}
              onClick={handleContinueToPay}
            >
              Continue to pay
            </button>

            <button
              className={styles.modalSecondaryButton}
              onClick={handleAlreadyPaid}
            >
              Already paid with Bank transfer, update
            </button>
          </div>
        </div>
      )}

      {/* Place Order Again Modal */}
      {showPlaceOrderModal && selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPlaceOrderModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPlaceOrderModal(false)}
            >
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>
              Are you sure you want to place another order?
            </h2>

            <p className={styles.modalDescription}>
              The payment is pending for the original order you placed.{" "}
              <span className={styles.modalHighlight}>
                If you would like to place this order again, the original order
                will be canceled.
              </span>
            </p>

            <p className={styles.modalDescription}>
              If the payment has already been completed, please wait for the
              status to be updated.
            </p>

            <button
              className={styles.modalPrimaryButton}
              onClick={handleConfirmBuyAgain}
            >
              Cancel the original order and buy this again
            </button>

            <button
              className={styles.modalSecondaryButton}
              onClick={() => setShowPlaceOrderModal(false)}
            >
              Wait for the payment status to update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
