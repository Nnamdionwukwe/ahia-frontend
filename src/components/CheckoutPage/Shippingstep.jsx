import { MapPin, Gift, Lock, AlertCircle, Check } from "lucide-react";
import styles from "./Shippingstep.module.css";

export default function ShippingStep({
  shippingAddress,
  orderData,
  selectedItems,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod,
  setShowItemDetails,
  setShowGiftModal,
  setCurrentStep,
}) {
  return (
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
        <div className={styles.sectionLabel}>
          Item details ({orderData.itemCount})
        </div>
        <button
          className={styles.viewDetailsBtn}
          onClick={() => setShowItemDetails(true)}
        >
          View details
        </button>
        <div className={styles.itemPreview}>
          {selectedItems.slice(0, 4).map((item, idx) => (
            <div key={idx} className={styles.itemThumb}>
              <img
                src={item.image_url || item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/100?text=No+Image";
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
          <span className={styles.radioDetail}>
            Delivery: Arrives in NG in as little as 7 days
          </span>
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
          <span>
            Eligible to save an extra ₦
            {Math.abs(orderData.limitedDiscount).toLocaleString()} on this order
          </span>
          <span className={styles.timer}>11:54:44</span>
        </div>
      </section>
    </>
  );
}
