import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  X,
  Clock,
  Building2,
  Copy,
  CheckCircle2,
  Info,
  Mail,
  Shield,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import styles from "./BankTransferPayment.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const BankTransferPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuthStore();

  const reference = searchParams.get("reference");
  const orderId = searchParams.get("order_id");

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({
    accountNumber: false,
    amount: false,
  });
  const [timeRemaining, setTimeRemaining] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Fetch payment details
  useEffect(() => {
    if (!reference || !accessToken) {
      navigate("/checkout");
      return;
    }

    fetchPaymentDetails();
  }, [reference, accessToken]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/payments/bank-transfer/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.success) {
        setPaymentDetails(response.data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      setLoading(false);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!paymentDetails) return;

    const updateTimer = () => {
      const expiresAt = new Date(paymentDetails.expires_at);
      const now = new Date();
      const diff = Math.max(0, expiresAt - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );

      if (diff === 0) {
        // Payment expired
        clearInterval(timer);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [paymentDetails]);

  // Copy to clipboard
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };

  // Confirm payment
  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/payments/bank-transfer/confirm`,
        {
          reference: reference,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.success) {
        alert(
          "Payment confirmation received! We'll verify your transfer shortly.",
        );
        // Refresh payment details
        fetchPaymentDetails();
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      alert(error.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
    }
  };

  // Change payment method
  const handleChangePaymentMethod = () => {
    navigate(`/checkout?order_id=${orderId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <RefreshCw className={styles.spinner} size={48} />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Payment not found</p>
          <button onClick={() => navigate("/orders")}>Go to Orders</button>
        </div>
      </div>
    );
  }

  const { bank_details, amount, order } = paymentDetails;

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={() => navigate("/orders")}
        >
          <X size={24} />
        </button>

        {/* Timer Icon */}
        <div className={styles.timerIcon}>
          <Clock size={48} strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <Building2 size={24} />
          <h2>
            Please complete your payment in your banking app within{" "}
            <span className={styles.timer}>{timeRemaining}</span>
          </h2>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <span>Order total: ₦{amount.toLocaleString()}</span>
          <span className={styles.separator}>|</span>
          <button
            className={styles.viewOrder}
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            View this order <ChevronRight size={16} />
          </button>
        </div>

        {/* Bank Details Card */}
        <div className={styles.bankDetails}>
          {/* Account Number */}
          <div className={styles.detailRow}>
            <label>Account number:</label>
            <div className={styles.detailValue}>
              <span className={styles.value}>
                {bank_details.account_number}
              </span>
              <button
                className={styles.copyButton}
                onClick={() =>
                  handleCopy(bank_details.account_number, "accountNumber")
                }
              >
                {copied.accountNumber ? (
                  <CheckCircle2 size={20} className={styles.copied} />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Bank Name */}
          <div className={styles.detailRow}>
            <label>Bank name:</label>
            <div className={styles.detailValue}>
              <span className={styles.value}>{bank_details.bank_name}</span>
            </div>
          </div>

          {/* Beneficiary Name */}
          <div className={styles.detailRow}>
            <label>Beneficiary Name:</label>
            <div className={styles.detailValue}>
              <span className={styles.value}>
                {bank_details.beneficiary_name}
              </span>
            </div>
          </div>

          {/* Amount to Pay */}
          <div className={styles.detailRow}>
            <label>Amount to pay:</label>
            <div className={styles.detailValue}>
              <span className={styles.value}>₦{amount.toLocaleString()}</span>
              <button
                className={styles.copyButton}
                onClick={() => handleCopy(amount.toString(), "amount")}
              >
                {copied.amount ? (
                  <CheckCircle2 size={20} className={styles.copied} />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className={styles.warning}>
            <Info size={20} />
            <span>Transfer exact amount to avoid failure.</span>
          </div>
        </div>

        {/* Help Section */}
        <button className={styles.helpButton}>
          How to use Bank transfer <span className={styles.helpIcon}>(?)</span>
        </button>

        {/* Apple Wallet */}
        <button className={styles.walletButton}>
          <Mail size={20} />
          Add this payment code to Apple Wallet
          <ChevronRight size={20} />
        </button>

        {/* Already Paid */}
        <button
          className={styles.refreshButton}
          onClick={handleConfirmPayment}
          disabled={confirming}
        >
          <RefreshCw size={20} className={confirming ? styles.spinning : ""} />
          {confirming ? "Confirming..." : "Already paid? Update"}
        </button>

        {/* Payment Method Change Info */}
        <div className={styles.infoBox}>
          <Info size={20} />
          <p>
            <span className={styles.highlight}>If you haven't paid</span> with
            Bank transfer, you can change your payment method to{" "}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
              alt="Visa"
              className={styles.paymentLogo}
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className={styles.paymentLogo}
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
              alt="PayPal"
              className={styles.paymentLogo}
            />{" "}
            or another payment method to{" "}
            <span className={styles.highlight}>receive your items faster.</span>
          </p>
        </div>

        {/* Change Payment Method Button */}
        <button
          className={styles.changePaymentButton}
          onClick={handleChangePaymentMethod}
        >
          Change payment method
        </button>

        {/* Footer Info */}
        <div className={styles.footerInfo}>
          <div className={styles.footerItem}>
            <Mail size={20} />
            <p>
              We will follow up with a confirmation email once your payment is
              complete.
            </p>
          </div>
          <div className={styles.footerItem}>
            <Shield size={20} />
            <p>
              <span className={styles.highlight}>We will NOT charge you</span>{" "}
              if the payment fails, and all items from this order will be
              returned to your cart.
            </p>
          </div>
        </div>

        {/* Explore Section */}
        <div className={styles.explore}>
          <h3>Explore your interests</h3>
        </div>
      </div>
    </div>
  );
};

export default BankTransferPayment;
