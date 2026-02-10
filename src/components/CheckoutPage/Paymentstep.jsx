import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import styles from "./PaymentStep.module.css";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PaymentStep = ({ shippingAddress, orderData, orderId }) => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const { items, getSelectedTotals } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [error, setError] = useState("");

  // Get selected items and totals
  const selectedItems = items.filter((item) => item.is_selected);
  const selectedTotals = getSelectedTotals();

  // Fetch Paystack public key on mount
  useEffect(() => {
    fetchPublicKey();
  }, []);

  const fetchPublicKey = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payments/public-key`);
      if (response.data.success) {
        setPaystackPublicKey(response.data.public_key);
      }
    } catch (error) {
      console.error("Failed to fetch Paystack public key:", error);
      setError("Failed to load payment gateway");
    }
  };

  // Load Paystack script
  useEffect(() => {
    if (!paystackPublicKey) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paystackPublicKey]);

  const handlePaystackPayment = async () => {
    if (!paystackPublicKey) {
      setError("Payment gateway not ready. Please refresh the page.");
      return;
    }

    if (!user?.email) {
      setError("User email not found. Please update your profile.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Initialize payment on backend
      const initResponse = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          email: user.email,
          amount: Math.max(orderData.orderTotal, 0), // Amount in Naira
          order_id: orderId,
          metadata: {
            user_id: user.id,
            user_name: user.full_name || shippingAddress.name,
            phone: user.phone_number || shippingAddress.phone,
            items: selectedItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.final_price,
            })),
            item_count: selectedItems.length,
            shipping_address: shippingAddress,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!initResponse.data.success) {
        throw new Error(
          initResponse.data.message || "Payment initialization failed",
        );
      }

      const { reference, authorization_url } = initResponse.data.data;

      // Step 2: Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user.email,
        amount: Math.round(Math.max(orderData.orderTotal, 0) * 100), // Convert to kobo
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: user.full_name || shippingAddress.name,
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: user.phone_number || shippingAddress.phone,
            },
          ],
        },
        onClose: function () {
          setLoading(false);
          setError("Payment cancelled. You can retry when ready.");
        },
        callback: function (response) {
          // Step 3: Verify payment
          verifyPayment(response.reference);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setLoading(false);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to initialize payment. Please try again.",
      );
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const verifyResponse = await axios.get(
        `${API_URL}/api/payments/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (
        verifyResponse.data.success &&
        verifyResponse.data.data.status === "success"
      ) {
        // Payment successful - redirect to success page
        navigate(`/order-success?reference=${reference}&order_id=${orderId}`);
      } else {
        setError("Payment verification failed. Please contact support.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setError(
        "Payment verification failed. Please contact support with your transaction reference.",
      );
      setLoading(false);
    }
  };

  // Alternative: Card payment form (manual entry)
  const handleCardPayment = (e) => {
    e.preventDefault();
    // This will also use Paystack but with manual card entry
    handlePaystackPayment();
  };

  return (
    <section className={styles.section}>
      <div className={styles.paymentHeader}>
        <h3>Payment Method</h3>
        <p className={styles.secureText}>
          🔒 Your payment information is secure and encrypted
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Paystack Payment Button */}
      <div className={styles.paymentOption}>
        <div className={styles.paystackInfo}>
          <img
            src="https://paystack.com/assets/img/logo/logo.svg"
            alt="Paystack"
            className={styles.paystackLogo}
          />
          <div>
            <h4>Pay with Paystack</h4>
            <p>Secure payment via Card, Bank Transfer, or USSD</p>
          </div>
        </div>

        <button
          className={styles.paystackButton}
          onClick={handlePaystackPayment}
          disabled={loading || !paystackPublicKey}
        >
          {loading ? (
            <>
              <Loader2 className={styles.spinner} size={20} />
              Processing...
            </>
          ) : (
            <>Pay ₦{Math.max(orderData.orderTotal, 0).toLocaleString()}</>
          )}
        </button>
      </div>

      {/* Billing Address */}
      <div className={styles.cardInputGroup}>
        <label>Billing Address</label>
        <p className={styles.addressText}>
          {shippingAddress.name}
          <br />
          {shippingAddress.address}
          <br />
          {shippingAddress.city}
        </p>
      </div>

      {/* Security Badges */}
      <div className={styles.securityBadges}>
        <div className={styles.badge}>
          <span>🔒</span>
          <span>SSL Encrypted</span>
        </div>
        <div className={styles.badge}>
          <span>✓</span>
          <span>PCI Compliant</span>
        </div>
        <div className={styles.badge}>
          <span>🛡️</span>
          <span>Secure Payment</span>
        </div>
      </div>
    </section>
  );
};

export default PaymentStep;
