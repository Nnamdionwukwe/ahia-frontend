import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Download,
  ArrowRight,
} from "lucide-react";
import styles from "./OrderSuccess.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  const reference = searchParams.get("reference");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!reference || !orderId) {
      setError("Missing payment or order information");
      setLoading(false);
      return;
    }

    fetchOrderAndPaymentDetails();
  }, [reference, orderId]);

  const fetchOrderAndPaymentDetails = async () => {
    try {
      setLoading(true);

      // Fetch payment verification
      const paymentResponse = await axios.get(
        `${API_URL}/api/payments/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      // Fetch order details
      const orderResponse = await axios.get(
        `${API_URL}/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      setPaymentDetails(paymentResponse.data.data);
      setOrderDetails(orderResponse.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load order details");
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    // Generate and download receipt
    const receiptContent = `
ORDER RECEIPT
=============
Order ID: ${orderDetails?.order?.id}
Payment Reference: ${reference}
Date: ${new Date(orderDetails?.order?.created_at).toLocaleDateString()}

Amount Paid: ₦${paymentDetails?.amount?.toLocaleString()}
Payment Status: ${paymentDetails?.status}
Payment Method: ${paymentDetails?.channel}

Delivery Address: ${orderDetails?.order?.delivery_address}

Thank you for your purchase!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Confirming your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className={styles.button} onClick={() => navigate("/orders")}>
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Success Header */}
      <div className={styles.successHeader}>
        <div className={styles.successIcon}>
          <CheckCircle size={64} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order Summary */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h2>Order Summary</h2>
          <span className={styles.orderId}>
            Order #{orderDetails?.order?.id?.slice(0, 8)}
          </span>
        </div>

        <div className={styles.summaryDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Order Number:</span>
            <span className={styles.value}>
              {orderDetails?.order?.order_number || "N/A"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Order Date:</span>
            <span className={styles.value}>
              {new Date(orderDetails?.order?.created_at).toLocaleDateString(
                "en-NG",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Total Amount:</span>
            <span className={styles.value}>
              ₦{orderDetails?.order?.total_amount?.toLocaleString()}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Payment Status:</span>
            <span className={`${styles.value} ${styles.statusSuccess}`}>
              {paymentDetails?.status === "success"
                ? "Paid ✓"
                : paymentDetails?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className={styles.paymentCard}>
        <div className={styles.cardHeader}>
          <CreditCard size={24} />
          <h3>Payment Details</h3>
        </div>
        <div className={styles.paymentDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Payment Reference:</span>
            <span className={styles.value}>{reference}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Payment Method:</span>
            <span className={styles.value}>
              {paymentDetails?.channel || "Paystack"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Transaction Date:</span>
            <span className={styles.value}>
              {new Date(paymentDetails?.paid_at || Date.now()).toLocaleString(
                "en-NG",
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {orderDetails?.items && orderDetails.items.length > 0 && (
        <div className={styles.itemsCard}>
          <h3>Order Items ({orderDetails.items.length})</h3>
          <div className={styles.itemsList}>
            {orderDetails.items.map((item, index) => (
              <div key={index} className={styles.orderItem}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                  className={styles.itemImage}
                />
                <div className={styles.itemDetails}>
                  <h4>{item.name}</h4>
                  {item.color && <p>Color: {item.color}</p>}
                  {item.size && <p>Size: {item.size}</p>}
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className={styles.itemPrice}>
                  ₦{(item.unit_price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Information */}
      <div className={styles.deliveryCard}>
        <div className={styles.cardHeader}>
          <Truck size={24} />
          <h3>Delivery Information</h3>
        </div>
        <div className={styles.deliveryDetails}>
          <p className={styles.deliveryAddress}>
            {orderDetails?.order?.delivery_address}
          </p>
          <p className={styles.estimatedDelivery}>
            Estimated Delivery:{" "}
            {new Date(
              orderDetails?.order?.estimated_delivery,
            ).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Order Tracking Timeline */}
      <div className={styles.timelineCard}>
        <h3>Order Status</h3>
        <div className={styles.timeline}>
          <div className={`${styles.timelineStep} ${styles.completed}`}>
            <div className={styles.stepIcon}>✓</div>
            <div className={styles.stepContent}>
              <h4>Order Placed</h4>
              <p>Your order has been received</p>
            </div>
          </div>
          <div className={`${styles.timelineStep} ${styles.completed}`}>
            <div className={styles.stepIcon}>✓</div>
            <div className={styles.stepContent}>
              <h4>Payment Confirmed</h4>
              <p>Payment successfully processed</p>
            </div>
          </div>
          <div className={`${styles.timelineStep} ${styles.pending}`}>
            <div className={styles.stepIcon}>•</div>
            <div className={styles.stepContent}>
              <h4>Processing</h4>
              <p>We're preparing your order</p>
            </div>
          </div>
          <div className={`${styles.timelineStep} ${styles.pending}`}>
            <div className={styles.stepIcon}>•</div>
            <div className={styles.stepContent}>
              <h4>Shipped</h4>
              <p>Your order is on the way</p>
            </div>
          </div>
          <div className={`${styles.timelineStep} ${styles.pending}`}>
            <div className={styles.stepIcon}>•</div>
            <div className={styles.stepContent}>
              <h4>Delivered</h4>
              <p>Order delivered to you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.primaryButton}
          onClick={() => navigate("/orders")}
        >
          <Package size={20} />
          View All Orders
          <ArrowRight size={20} />
        </button>
        <button className={styles.secondaryButton} onClick={downloadReceipt}>
          <Download size={20} />
          Download Receipt
        </button>
        <button className={styles.tertiaryButton} onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>

      {/* Thank You Message */}
      <div className={styles.thankYouCard}>
        <h3>Thank You for Your Order!</h3>
        <p>
          We've sent a confirmation email with your order details. You can track
          your order status from your orders page.
        </p>
        <p className={styles.supportText}>
          Need help? Contact our support team at support@ahia.com
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
