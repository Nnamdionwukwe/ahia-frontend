import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, CreditCard, Lock, Shield, Check, Mail } from "lucide-react";
import styles from "./Paymentstep.module.css";
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

  // Email state - since user object doesn't have email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  // Card input states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
  });

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

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
  };

  // Card number formatting (spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Expiry date formatting (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails({ ...cardDetails, cardNumber: formatted });
    setCardErrors({ ...cardErrors, cardNumber: false });
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardDetails({ ...cardDetails, expiryDate: formatted });
    setCardErrors({ ...cardErrors, expiryDate: false });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "").slice(0, 4);
    setCardDetails({ ...cardDetails, cvv: value });
    setCardErrors({ ...cardErrors, cvv: false });
  };

  const validateCardInputs = () => {
    const errors = {
      cardNumber: cardDetails.cardNumber.replace(/\s/g, "").length < 13,
      expiryDate: cardDetails.expiryDate.length !== 5,
      cvv: cardDetails.cvv.length < 3,
    };
    setCardErrors(errors);
    return !errors.cardNumber && !errors.expiryDate && !errors.cvv;
  };

  const handlePaystackPayment = async () => {
    if (!paystackPublicKey) {
      setError("Payment gateway not ready. Please refresh the page.");
      return;
    }

    // Validate email
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      setError("Please enter a valid email address");
      return;
    }

    // Validate card inputs before proceeding
    if (!validateCardInputs()) {
      setError("Please fill in all card details correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Initialize payment on backend
      const initResponse = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          email: email,
          amount: Math.max(orderData.orderTotal, 0),
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

      const { reference } = initResponse.data.data;

      // Step 2: Open Paystack popup with card payment
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: Math.round(Math.max(orderData.orderTotal, 0) * 100),
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
        // Clear card details on success
        setCardDetails({ cardNumber: "", expiryDate: "", cvv: "" });
        setEmail("");
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

  return (
    <section className={styles.section}>
      {/* Card Logos */}
      <div className={styles.cardLogos}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
          alt="Visa"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
          alt="Mastercard"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg"
          alt="American Express"
        />
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Email Input */}
      <div className={styles.cardInputGroup}>
        <label>* Email address</label>
        <div
          className={`${styles.cardNumberInput} ${
            emailError ? styles.error : ""
          }`}
        >
          <div className={styles.cardIconWrapper}>
            <Mail size={20} className={styles.cardIcon} />
          </div>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={handleEmailChange}
            className={styles.cardInput}
            disabled={loading}
          />
          {email && validateEmail(email) && (
            <Check size={20} className={styles.checkIcon} />
          )}
        </div>
        {emailError && (
          <p className={styles.errorText}>
            ! Please enter a valid email address.
          </p>
        )}
      </div>

      {/* Card Number */}
      <div className={styles.cardInputGroup}>
        <label>
          * Card number
          <button
            className={styles.scanCardLabel}
            onClick={handlePaystackPayment}
            type="button"
            disabled={loading}
          >
            📷 Scan card
          </button>
        </label>
        <div
          className={`${styles.cardNumberInput} ${
            cardErrors.cardNumber ? styles.error : ""
          }`}
        >
          <div className={styles.cardIconWrapper}>
            <CreditCard size={20} className={styles.cardIcon} />
          </div>
          <input
            type="text"
            placeholder="Card number"
            value={cardDetails.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            className={styles.cardInput}
            disabled={loading}
          />
          {cardDetails.cardNumber.replace(/\s/g, "").length >= 13 && (
            <Check size={20} className={styles.checkIcon} />
          )}
        </div>
        {cardErrors.cardNumber && (
          <p className={styles.errorText}>! Please enter card number.</p>
        )}
      </div>

      {/* Expiry Date and CVV */}
      <div className={styles.cardInputRow}>
        <div className={styles.cardInputGroup}>
          <label>* Expiration date</label>
          <input
            type="text"
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={handleExpiryChange}
            maxLength={5}
            className={cardErrors.expiryDate ? styles.error : ""}
            disabled={loading}
          />
          {cardErrors.expiryDate && (
            <p className={styles.errorText}>! Invalid expiry date.</p>
          )}
        </div>
        <div className={styles.cardInputGroup}>
          <label>
            * CVV{" "}
            <span className={styles.helpIcon} title="3-4 digit security code">
              (?)
            </span>
          </label>
          <div className={styles.cvvInput}>
            <input
              type="password"
              placeholder="3-4 digits"
              value={cardDetails.cvv}
              onChange={handleCvvChange}
              maxLength={4}
              className={cardErrors.cvv ? styles.error : ""}
              disabled={loading}
            />
            <Lock size={16} className={styles.lockIcon} />
          </div>
          {cardErrors.cvv && <p className={styles.errorText}>! Invalid CVV.</p>}
        </div>
      </div>

      {/* Billing Address */}
      <div className={styles.cardInputGroup}>
        <label>
          * Billing address{" "}
          <span className={styles.helpIcon} title="Address for billing">
            (?)
          </span>
        </label>
        <div className={styles.addressPreview}>
          <p>
            {shippingAddress.name}, {shippingAddress.address}
          </p>
        </div>
      </div>

      {/* Pay Now Button */}
      <button
        className={styles.payButton}
        onClick={handlePaystackPayment}
        disabled={loading || !paystackPublicKey}
      >
        {loading ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Processing...
          </>
        ) : (
          <>
            <Lock size={20} />
            Pay ₦{Math.max(orderData.orderTotal, 0).toLocaleString()}
          </>
        )}
      </button>

      {/* Security Badges */}
      <div className={styles.securityBadges}>
        <div className={styles.badge}>
          <Lock size={20} />
          <span>SSL Encrypted</span>
        </div>
        <div className={styles.badge}>
          <Shield size={20} />
          <span>PCI Compliant</span>
        </div>
        <div className={styles.badge}>
          <CreditCard size={20} />
          <span>Secure Payment</span>
        </div>
      </div>
    </section>
  );
};

export default PaymentStep;
