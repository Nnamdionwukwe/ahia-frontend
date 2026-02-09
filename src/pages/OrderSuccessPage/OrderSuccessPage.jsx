import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Package, MapPin, Calendar, Download } from "lucide-react";
import axios from "axios";
import styles from "./OrderSuccessPage.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuthStore();

  const [orderDetails, setOrderDetails] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const reference = searchParams.get("reference");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (reference && orderId) {
      fetchOrderDetails();
    }
  }, [reference, orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch transaction details
      const txResponse = await axios.get(
        `${API_URL}/api/payments/transaction/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (txResponse.data.success) {
        setTransaction(txResponse.data.data);
      }

      // Fetch order details
      const orderResponse = await axios.get(
        `${API_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (orderResponse.data) {
        setOrderDetails(orderResponse.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Success Header */}
      <div className={styles.successHeader}>
        <div className={styles.successIcon}>
          <Check size={48} />
        </div>
        <h1>Payment Successful!</h1>
        <p className={styles.thankYou}>
          Thank you for your order. Your payment has been confirmed.
        </p>
      </div>

      {/* Order Info Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Package size={20} />
          <h2>Order Details</h2>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Order ID:</span>
          <span className={styles.value}>{orderId}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Transaction Reference:</span>
          <span className={styles.value}>{reference}</span>
        </div>

        {transaction && (
          <>
            <div className={styles.infoRow}>
              <span className={styles.label}>Amount Paid:</span>
              <span className={styles.valueHighlight}>
                ₦{transaction.amount?.toLocaleString()}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Payment Status:</span>
              <span className={styles.statusBadge}>
                {transaction.status === "success" ? "Paid" : transaction.status}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Payment Method:</span>
              <span className={styles.value}>
                {transaction.payment_method || "Paystack"}
              </span>
            </div>
          </>
        )}

        {orderDetails?.order && (
          <>
            <div className={styles.divider}></div>

            <div className={styles.infoRow}>
              <span className={styles.label}>
                <Calendar size={16} />
                Estimated Delivery:
              </span>
              <span className={styles.value}>
                {new Date(
                  orderDetails.order.estimated_delivery,
                ).toLocaleDateString()}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>
                <MapPin size={16} />
                Delivery Address:
              </span>
              <span className={styles.value}>
                {orderDetails.order.delivery_address}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Order Items */}
      {orderDetails?.items && orderDetails.items.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Order Items ({orderDetails.items.length})</h2>
          </div>

          <div className={styles.itemsList}>
            {orderDetails.items.map((item, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  {item.color && (
                    <p className={styles.variant}>Color: {item.color}</p>
                  )}
                  {item.size && (
                    <p className={styles.variant}>Size: {item.size}</p>
                  )}
                  <p className={styles.quantity}>Quantity: {item.quantity}</p>
                </div>
                <div className={styles.itemPrice}>
                  ₦{(item.unit_price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={() => navigate("/orders")}
        >
          View Orders
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>

      {/* What's Next */}
      <div className={styles.nextSteps}>
        <h3>What happens next?</h3>
        <div className={styles.stepsList}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Order Confirmation</h4>
              <p>You'll receive a confirmation email shortly</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Processing</h4>
              <p>We'll prepare your items for shipping</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Shipping</h4>
              <p>Your order will be dispatched soon</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Delivery</h4>
              <p>
                Estimated delivery:{" "}
                {orderDetails?.order?.estimated_delivery
                  ? new Date(
                      orderDetails.order.estimated_delivery,
                    ).toLocaleDateString()
                  : "5-7 business days"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
