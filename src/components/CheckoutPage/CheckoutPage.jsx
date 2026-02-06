import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  MapPin,
  CreditCard,
  Lock,
  Gift,
  AlertCircle,
  Check,
} from "lucide-react";
import styles from "./CheckoutPage.module.css";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import ItemDetailsModal from "./ItemDetailsModal";
import CheckOutHeader from "./CheckOutHeader";
import ShippingStep from "./Shippingstep";
import PaymentStep from "./Paymentstep";
import OrderSummary from "./OrderSummary";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getSelectedTotals, getAlmostSoldOutCount } = useCartStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState("shipping");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [giftMessage, setGiftMessage] = useState("Hope you enjoy this gift!");
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get cart data
  const selectedItems = items.filter((item) => item.is_selected);
  const selectedTotals = getSelectedTotals();
  const almostGoneCount = getAlmostSoldOutCount();

  // Shipping address from user profile
  const shippingAddress = user?.address || {
    name: "Nnamdi Michael Onwukwe",
    phone: "+234 803 774 8573",
    address: "The loft apartment, Patients Effiong Street",
    city: "Abuja, Federal Capital Territory Nigeria",
  };

  const orderData = {
    itemsTotal: selectedTotals.subtotal,
    itemsDiscount: selectedTotals.discount,
    subtotalAfterDiscount: selectedTotals.subtotal - selectedTotals.discount,
    limitedDiscount: -34884,
    subtotal: selectedTotals.subtotal - selectedTotals.discount - 34884,
    shipping: 0,
    credit: -1600,
    orderTotal:
      selectedTotals.subtotal - selectedTotals.discount - 34884 - 1600,
    itemCount: selectedItems.length,
    savings: selectedTotals.discount,
    timeRemaining: "11:53:01",
  };

  const handleContinuePayment = () => {
    setShowConfirmCancel(false);
    setCurrentStep("payment");
  };

  const handleSubmitOrder = async () => {
    if (currentStep === "shipping") {
      setShowConfirmCancel(true);
    } else {
      // Process payment
      navigate("/order-success");
    }
  };

  const handleScanCard = () => {
    console.log("Scan card initiated");
  };

  if (selectedItems.length === 0) {
    return (
      <div className={styles.container}>
        <CheckOutHeader
          currentStep={currentStep}
          orderData={orderData}
          setShowConfirmCancel={setShowConfirmCancel}
        />
        <div className={styles.emptyCheckout}>
          <p>No items selected for checkout</p>
          <button
            className={styles.shopNowButton}
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Component */}
      <CheckOutHeader
        currentStep={currentStep}
        orderData={orderData}
        setShowConfirmCancel={setShowConfirmCancel}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Info Banner */}
        <div className={styles.infoBanner}>
          <Check size={20} className={styles.checkIcon} />
          <span>
            Free shipping for you · ₦1,600 Credit for delay · All data is
            safeguarded
          </span>
        </div>

        {/* Shipping Step */}
        {currentStep === "shipping" && (
          <ShippingStep
            shippingAddress={shippingAddress}
            orderData={orderData}
            selectedItems={selectedItems}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setShowItemDetails={setShowItemDetails}
            setShowGiftModal={setShowGiftModal}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* Payment Step */}
        {currentStep === "payment" && (
          <PaymentStep shippingAddress={shippingAddress} />
        )}
      </div>

      {/* Order Summary */}
      <OrderSummary orderData={orderData} />

      {/* Submit Button */}
      <button className={styles.submitButton} onClick={handleSubmitOrder}>
        {currentStep === "shipping"
          ? `Submit order (${orderData.itemCount})`
          : `Pay ₦${Math.max(orderData.orderTotal, 0).toLocaleString()}`}
      </button>

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setShowConfirmCancel(false)}
            >
              <X size={24} />
            </button>
            <h3>Are you sure you want to cancel payment?</h3>
            <p>
              Details will need to be filled in again if you leave now, you can
              continue entering card details or scan your card. Scan card is
              fast and simple!
            </p>
            <div className={styles.modalBenefits}>
              <div>
                <Check size={24} />
                <span>Security privacy</span>
              </div>
              <div>
                <Lock size={24} />
                <span>Safe payment</span>
              </div>
            </div>
            <button
              className={styles.primaryButton}
              onClick={handleContinuePayment}
            >
              Continue to pay
            </button>
            <button className={styles.secondaryButton} onClick={handleScanCard}>
              📷 Scan card
            </button>
            <button
              className={styles.tertiaryButton}
              onClick={() => navigate("/cart")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gift Message Modal */}
      {showGiftModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setShowGiftModal(false)}
            >
              <X size={24} />
            </button>
            <h3>Gift message</h3>
            <p>Sellers offer free gift message cards.</p>
            <label>* Gift message</label>
            <textarea
              className={styles.textarea}
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              maxLength={200}
            />
            <div className={styles.charCount}>{giftMessage.length}/200</div>
            <label>From</label>
            <select className={styles.select}>
              <option>Leave as blank (default)</option>
              <option>From me</option>
            </select>
            <button
              className={styles.primaryButton}
              onClick={() => setShowGiftModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemDetails && (
        <ItemDetailsModal
          items={selectedItems}
          onClose={() => setShowItemDetails(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
