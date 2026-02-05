import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
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
const [isDarkMode, setIsDarkMode] = useState(false)

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
    subtotal: (selectedTotals.subtotal - selectedTotals.discount) - 34884,
    shipping: 0,
    credit: -1600,
    orderTotal: (selectedTotals.subtotal - selectedTotals.discount) - 34884 - 1600,
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
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Checkout</h1>
          <div className={styles.headerSpacer} />
        </div>
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
      {/* Header */}
      <div className={styles.header}>
      



         {currentStep === "payment" ?       <button
            className={styles.backButton}
            onClick={() => setShowConfirmCancel(true)}
            title="Go back"
          >
            <ChevronLeft size={24} />
          </button> :   <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>}

        <h1 className={styles.headerTitle}>
          {currentStep === "shipping" ? "Checkout" : "Payment"} ({orderData.itemCount})
        </h1>
        <div className={styles.headerSpacer} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Info Banner */}
        <div className={styles.infoBanner}>
          <Check size={20} className={styles.checkIcon} />
          <span>Free shipping for you · ₦1,600 Credit for delay · All data is safeguarded</span>
        </div>

        {/* Shipping Step */}
        {currentStep === "shipping" && (
          <>
            {/* Delivery Address */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <MapPin size={20} />
                <div>
                  <h3>{shippingAddress.name}</h3>
                  <p>{shippingAddress.phone}</p>
                  <p className={styles.addressDetail}>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}</p>
                </div>
              </div>
            </section>

            {/* Item Details */}
            <section className={styles.section}>
              <div className={styles.sectionLabel}>Item details ({orderData.itemCount})</div>
              <button 
  className={styles.viewDetailsBtn}
  onClick={() => setShowItemDetails(true)}
>
  View details >
</button>
              <div className={styles.itemPreview}>
                {selectedItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} className={styles.itemThumb}>
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100?text=No+Image";
                      }}
                    />
                    <span className={styles.itemBadge}>
                      {parseInt(item.available_stock || item.stock || 0) <= 20
                        ? "Almost sold out"
                        : "In stock"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping Methods */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Shipping methods</h3>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === "standard"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                />
                <span>Standard: FREE</span>
                <span className={styles.radioDetail}>Delivery: Arrives in NG in as little as 7 days</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shipping"
                  value="pickup"
                  checked={shippingMethod === "pickup"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                />
                <span>Pickup: FREE 🎁</span>
                <span className={styles.radioDetail}>Delivery: Feb 14-27</span>
              </label>
            </section>

            {/* Payment Methods */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Payment methods</h3>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="payment"
                  value="apple-pay"
                  checked={paymentMethod === "apple-pay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>🍎 Apple Pay</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span onClick={() => setCurrentStep("payment")}>💳 Card</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="payment"
                  value="bank-transfer"
                  checked={paymentMethod === "bank-transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>🏦 Bank transfer</span>
              </label>
            </section>

            {/* Gift Message */}
            <section className={styles.section}>
              <button
                className={styles.giftButton}
                onClick={() => setShowGiftModal(true)}
              >
                <Gift size={20} />
                Add a free gift message card
              </button>
            </section>

            {/* Safety Section */}
            <section className={styles.section}>
              <h3 className={styles.safetyTitle}>
                <Lock size={18} style={{ color: "#10b981" }} />
                Temu protects your safety & privacy
              </h3>
              <div className={styles.safetyGrid}>
                <div className={styles.safetyItem}>
                  <Check size={24} style={{ color: "#10b981" }} />
                  <span>Card info protection</span>
                </div>
                <div className={styles.safetyItem}>
                  <Lock size={24} style={{ color: "#10b981" }} />
                  <span>Secure privacy</span>
                </div>
                <div className={styles.safetyItem}>
                  <AlertCircle size={24} style={{ color: "#10b981" }} />
                  <span>Temu purchase protection</span>
                </div>
              </div>
            </section>

            {/* Eligible Savings */}
            <section className={styles.section}>
              <div className={styles.savingsBox}>
                <Check size={20} style={{ color: "#10b981" }} />
                <span>Eligible to save an extra ₦{Math.abs(orderData.limitedDiscount).toLocaleString()} on this order</span>
                <span className={styles.timer}>11:54:44</span>
              </div>
            </section>
          </>
        )}

        {/* Payment Step */}
        {currentStep === "payment" && (
          <>
            <section className={styles.section}>
           

              <div className={styles.cardInputGroup}>
                <label>* Card number</label>
                <div className={styles.cardNumberInput}>
                  <input type="text" placeholder="Card number" />
                  <button className={styles.scanButton}>📷 Scan card</button>
                </div>
              </div>

              <div className={styles.cardInputRow}>
                <div className={styles.cardInputGroup}>
                  <label>* Expiration date</label>
                  <input type="text" placeholder="MM/YY" />
                </div>
                <div className={styles.cardInputGroup}>
                  <label>* CVV</label>
                  <input type="password" placeholder="3-4 digits" />
                </div>
              </div>

              <div className={styles.cardInputGroup}>
                <label>* Billing address</label>
                <p>{shippingAddress.name}, {shippingAddress.address}</p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Order Summary */}
      <div className={styles.orderSummary}>
        <div className={styles.summaryRow}>
          <span>Item(s) total:</span>
          <span>₦{orderData.itemsTotal.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Item(s) discount:</span>
          <span className={styles.discount}>-₦{Math.abs(orderData.itemsDiscount).toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Limited-time discount:</span>
          <span className={styles.discount}>-₦{Math.abs(orderData.limitedDiscount).toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Subtotal:</span>
          <span>₦{orderData.subtotal.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping:</span>
          <span className={styles.free}>FREE</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Credit:</span>
          <span className={styles.credit}>-₦{Math.abs(orderData.credit).toLocaleString()}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryTotal}>
          <span>Order total:</span>
          <span>₦{Math.max(orderData.orderTotal, 0).toLocaleString()}</span>
        </div>
        <div className={styles.timelineBox}>
          <span className={styles.savings}>💎 ₦{orderData.savings.toLocaleString()} OFF</span>
          <span className={styles.expiresIn}>expires in {orderData.timeRemaining}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={styles.submitButton}
        onClick={handleSubmitOrder}
      >
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
              continue entering card details or scan your card. Scan card is fast
              and simple!
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
            <button
              className={styles.secondaryButton}
              onClick={handleScanCard}
            >
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