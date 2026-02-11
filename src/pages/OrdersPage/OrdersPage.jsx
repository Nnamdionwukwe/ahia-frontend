import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ChevronRight,
  Star,
  MoreHorizontal,
  AlertCircle,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  X,
  Building2,
} from "lucide-react";
import styles from "./OrdersPage.module.css";
import useAuthStore from "../../store/authStore";

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

  const getOrderStatus = (order) => {
    if (order.payment_status === "refunded") return "refunded";
    if (order.payment_status === "pending") return "payment_processing";
    if (order.status === "cancelled") return "cancelled";
    if (order.status === "delivered") return "delivered";
    if (order.status === "shipped") return "shipped";
    if (order.status === "processing") return "processing";
    return "pending";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString()}`;
  };

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

  const OrderCard = ({ order }) => {
    const status = getOrderStatus(order);
    const isPaymentProcessing = status === "payment_processing";
    const isRefunded = status === "refunded";

    return (
      <div className={styles.orderCard}>
        {/* Order Header */}
        <div className={styles.orderHeader}>
          {status === "delivered" && (
            <p className={styles.deliveryDate}>
              Delivered on {formatDate(order.delivered_at || order.updated_at)}
            </p>
          )}
          {isPaymentProcessing && (
            <div className={styles.statusBadge}>
              <Clock size={16} />
              <span>Payment processing</span>
            </div>
          )}
          {isRefunded && <p className={styles.refundedText}>Refunded</p>}
        </div>

        {/* Order Items Preview */}
        <div
          className={styles.orderItems}
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          <div className={styles.itemsPreview}>
            {order.items?.slice(0, 6).map((item, index) => (
              <div key={index} className={styles.itemImage}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                />
                {item.quantity > 1 && (
                  <span className={styles.quantityBadge}>x{item.quantity}</span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.orderSummary}>
            <p className={styles.orderTotal}>
              {formatCurrency(order.total_amount)}
            </p>
            <p className={styles.itemCount}>
              {order.item_count || order.items?.length || 0} items
            </p>
          </div>
          <ChevronRight size={20} className={styles.chevron} />
        </div>

        {/* Refund Information */}
        {isRefunded && (
          <div className={styles.refundInfo}>
            <div className={styles.refundHeader}>
              <AlertCircle size={18} />
              <p>
                Refund issued by Temu for the cancelled items. It needs to be
                processed by your financial institution
              </p>
            </div>
            <p className={styles.refundDescription}>
              We've issued your refund for the entire order of{" "}
              {order.item_count} items that you have requested to cancel.
            </p>

            <div className={styles.refundDetails}>
              <div className={styles.refundRow}>
                <span>Total refund amount:</span>
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>

              <div className={styles.paymentMethod}>
                <Building2 size={24} className={styles.paymentLogo} />
                <span>Opay</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

              <button className={styles.proofLink}>
                View proof of refund sent by Temu →
              </button>

              <div className={styles.refundDate}>
                <p>The date refund will be issued by financial institution:</p>
                <p className={styles.dateHighlight}>
                  {formatDate(order.refund_date || order.updated_at)}
                </p>
              </div>

              <button className={styles.trackButton}>Track</button>
            </div>

            <p className={styles.requestedDate}>
              Requested on {formatDate(order.created_at)}
            </p>
          </div>
        )}

        {/* Payment Processing Info */}
        {isPaymentProcessing && (
          <div className={styles.paymentProcessing}>
            <Clock size={18} className={styles.processingIcon} />
            <div className={styles.processingText}>
              <p>
                We've reserved your order.{" "}
                <span className={styles.highlight}>If you haven't paid</span>{" "}
                with {order.payment_method}, you can change your payment method
                to <span className={styles.paymentIcons}>💳 💰 🍎</span> or
                another payment method to{" "}
                <span className={styles.highlight}>
                  receive your items faster.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={styles.moreButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(showMenu === order.id ? null : order.id);
            }}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu === order.id && (
            <div className={styles.menuDropdown}>
              <button onClick={() => navigate(`/orders/${order.id}`)}>
                View details
              </button>
              <button onClick={() => navigate(`/support?order_id=${order.id}`)}>
                Contact support
              </button>
              {status === "payment_processing" && (
                <>
                  <button onClick={() => handleChangePaymentClick(order)}>
                    Change address
                  </button>
                  <button onClick={() => navigate(`/orders/${order.id}`)}>
                    Buy this again
                  </button>
                </>
              )}
              {status === "pending" && (
                <button onClick={() => handleCancelOrderClick(order)}>
                  Cancel order
                </button>
              )}
            </div>
          )}

          {status === "delivered" && (
            <>
              <button className={styles.secondaryButton}>Return/Refund</button>
              <button className={styles.secondaryButton}>Buy this again</button>
              <button className={styles.primaryButton}>Leave a review</button>
            </>
          )}

          {status === "refunded" && (
            <>
              <button className={styles.secondaryButton}>Refund details</button>
              <button className={styles.secondaryButton}>Buy this again</button>
            </>
          )}

          {isPaymentProcessing && (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => handleCancelOrderClick(order)}
              >
                Cancel order
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => handleChangePaymentClick(order)}
              >
                Change payment method
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const ItemsReadyForReview = () => {
    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    if (deliveredOrders.length === 0) return null;

    return (
      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h3>Items ready for review ({deliveredOrders.length})</h3>
          <button onClick={() => setActiveTab("delivered")}>See all →</button>
        </div>
        <div className={styles.reviewItems}>
          {deliveredOrders.slice(0, 3).map((order) =>
            order.items?.slice(0, 1).map((item, idx) => (
              <div key={idx} className={styles.reviewItem}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                />
                <p>{item.name}</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} />
                  ))}
                </div>
              </div>
            )),
          )}
        </div>
      </div>
    );
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
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} className={styles.emptyIcon} />
            <p>No orders found</p>
            <button onClick={() => navigate("/")}>Start shopping</button>
          </div>
        ) : (
          <>
            {activeTab === "all" && <ItemsReadyForReview />}
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}
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
    </div>
  );
};

export default OrdersPage;
