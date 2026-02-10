import React, { useState, useEffect } from "react";
import { Loader2, CreditCard, Lock, Shield, Check } from "lucide-react";
import styles from "./Paymentstep.module.css";

const PaymentStep = ({ shippingAddress, orderData, orderId, onPayment }) => {
  const [loading, setLoading] = useState(false);

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

  // Debug orderId
  useEffect(() => {
    console.log("✅ PaymentStep received orderId:", orderId);
    if (!orderId) {
      console.error("❌ PaymentStep: No orderId provided!");
    }
  }, [orderId]);

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

  const handlePayment = () => {
    if (!orderId) {
      alert("Order ID is missing. Please go back and try again.");
      return;
    }

    // Call parent's payment handler
    if (onPayment) {
      onPayment();
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

      {!orderId && (
        <div className={styles.errorBanner}>
          <span>⚠️ Waiting for order information...</span>
        </div>
      )}

      {/* Card Number */}
      <div className={styles.cardInputGroup}>
        <label>
          * Card number
          <button
            className={styles.scanCardLabel}
            onClick={handlePayment}
            type="button"
            disabled={loading || !orderId}
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
            disabled={loading || !orderId}
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
            disabled={loading || !orderId}
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
              disabled={loading || !orderId}
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

      {/* Order Info Display */}
      {orderId && (
        <div className={styles.orderInfo}>
          <p className={styles.orderIdText}>
            Order ID: <code>{orderId.substring(0, 8)}...</code>
          </p>
        </div>
      )}

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

      <p className={styles.helpText}>
        Click the "Pay" button at the bottom to complete your purchase securely.
      </p>
    </section>
  );
};

export default PaymentStep;
