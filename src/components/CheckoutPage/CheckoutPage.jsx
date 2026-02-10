import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  X,
  MapPin,
  CreditCard,
  Lock,
  Gift,
  AlertCircle,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import styles from "./CheckoutPage.module.css";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import ItemDetailsModal from "./ItemDetailsModal";
import CheckOutHeader from "./CheckOutHeader";
import ShippingStep from "./Shippingstep";
import OrderSummary from "./OrderSummary";
import PaymentStep from "./Paymentstep";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getSelectedTotals, getAlmostSoldOutCount } = useCartStore();
  const selectedTotals = getSelectedTotals();
  const { user, accessToken } = useAuthStore();

  const [currentStep, setCurrentStep] = useState("shipping");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [giftMessage, setGiftMessage] = useState("Hope you enjoy this gift!");
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");

  // Use ref to store orderId for immediate access
  const orderIdRef = useRef(null);
  const [orderId, setOrderId] = useState(null);

  // Store card validation function from PaymentStep
  const cardValidationRef = useRef(null);

  // Get cart data
  const selectedItems = items.filter((item) => item.is_selected);
  const almostGoneCount = getAlmostSoldOutCount();

  // Shipping address from user profile
  const shippingAddress = user?.address || {
    name: user?.full_name || "Nnamdi Michael Onwukwe",
    phone: user?.phone_number || "+234 803 774 8573",
    address: "The loft apartment, Patients Effiong Street",
    city: "Abuja, Federal Capital Territory Nigeria",
  };

  // Calculate order totals
  const itemsTotal = selectedTotals.subtotal || 0;
  const itemsDiscount = selectedTotals.discount || 0;
  const subtotalAfterDiscount = itemsTotal - itemsDiscount;
  const limitedDiscount = -34884;
  const subtotal = subtotalAfterDiscount + limitedDiscount;
  const shipping = 0;
  const credit = -1600;
  const orderTotal = subtotal + shipping + credit;

  const orderData = {
    itemsTotal: itemsTotal,
    itemsDiscount: itemsDiscount,
    subtotalAfterDiscount: subtotalAfterDiscount,
    limitedDiscount: limitedDiscount,
    subtotal: subtotal,
    shipping: shipping,
    credit: credit,
    orderTotal: selectedTotals.total || 0,
    itemCount: selectedItems.length,
    savings: itemsDiscount + Math.abs(limitedDiscount) + Math.abs(credit),
    timeRemaining: "11:53:01",
  };

  // Fetch Paystack public key
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/payments/public-key`);
        if (response.data.success) {
          setPaystackPublicKey(response.data.public_key);
        }
      } catch (error) {
        console.error("Failed to fetch Paystack public key:", error);
      }
    };

    fetchPublicKey();
  }, []);

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

  // Create order in database
  const createOrder = async () => {
    setCreatingOrder(true);
    try {
      const deliveryAddress = `${shippingAddress.address}, ${shippingAddress.city}`;

      const response = await axios.post(
        `${API_URL}/api/orders/checkout`,
        {
          delivery_address: deliveryAddress,
          payment_method: "paystack",
          promo_code: null,
          shipping_method: shippingMethod,
          gift_message: giftMessage || null,
          total_amount: Math.max(orderTotal, 0),
          discount_amount: Math.abs(limitedDiscount) + Math.abs(credit),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success && response.data.order) {
        const id = response.data.order.id || response.data.order._id;

        console.log("✅ Order created with ID:", id);

        if (!id) {
          throw new Error("Order ID not found in API response");
        }

        // Store in ref for immediate access
        orderIdRef.current = id;

        // Store in state
        setOrderId(id);

        // Store in sessionStorage as backup
        sessionStorage.setItem("currentOrderId", id);

        return id;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "Failed to create order. Please try again.",
      );
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  // Paystack payment handler
  const handlePaystackPayment = async () => {
    // Use ref to get the most current orderId
    const currentOrderId = orderIdRef.current || orderId;

    if (!paystackPublicKey) {
      alert("Payment gateway not ready. Please refresh the page.");
      return;
    }

    if (!currentOrderId) {
      alert("Order ID is missing. Please go back and try again.");
      console.error(
        "Missing orderId. Ref:",
        orderIdRef.current,
        "State:",
        orderId,
      );
      return;
    }

    setLoading(true);

    try {
      // Get email
      const email =
        user?.email ||
        (user?.phone_number
          ? `${user.phone_number.replace(/[^0-9]/g, "")}@customer.ahia.com`
          : `customer_${user?.id}@ahia.com`);

      console.log("💳 Initializing payment for orderId:", currentOrderId);

      // Step 1: Initialize payment
      const initResponse = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          email: email,
          amount: Math.max(orderData.orderTotal, 0),
          order_id: currentOrderId,
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

      // Step 2: Open Paystack popup
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
        },
        callback: function (response) {
          verifyPayment(response.reference);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setLoading(false);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to initialize payment. Please try again.",
      );
    }
  };

  // Verify payment
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
        const verifiedOrderId =
          verifyResponse.data.data.order_id || orderIdRef.current || orderId;

        // Clear session storage
        sessionStorage.removeItem("currentOrderId");
        orderIdRef.current = null;

        setLoading(false);
        navigate(
          `/order-success?reference=${reference}&order_id=${verifiedOrderId}`,
        );
      } else {
        alert("Payment verification failed. Please contact support.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      alert(
        "Payment verification failed. Please contact support with your transaction reference.",
      );
      setLoading(false);
    }
  };

  // Handle submit order button - Validate card then create order
  const handleSubmitOrder = async () => {
    if (currentStep === "shipping") {
      // Just move to payment step - don't create order yet
      console.log("✅ Moving to payment step");
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      // Check payment method
      if (paymentMethod === "bank-transfer") {
        // Bank transfer flow - create order and initialize bank transfer
        const newOrderId = await createOrder();

        if (!newOrderId) {
          alert("Failed to create order. Please try again.");
          return;
        }

        console.log("✅ Order created, initializing bank transfer");

        // Initialize bank transfer
        try {
          const response = await axios.post(
            `${API_URL}/api/payments/bank-transfer/initialize`,
            {
              order_id: newOrderId,
              amount: Math.max(orderData.orderTotal, 0),
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.data.success) {
            // Navigate to bank transfer page
            navigate(
              `/bank-transfer?reference=${response.data.data.reference}&order_id=${newOrderId}`,
            );
          } else {
            throw new Error("Failed to initialize bank transfer");
          }
        } catch (error) {
          console.error("Bank transfer initialization error:", error);
          alert(
            error.response?.data?.message ||
              "Failed to initialize bank transfer. Please try again.",
          );
        }
        return;
      }

      // For card/Paystack - validate card details first
      if (cardValidationRef.current) {
        const isValid = cardValidationRef.current();
        if (!isValid) {
          alert("Please fill in all card details correctly before proceeding.");
          return;
        }
      }

      // Card details are valid - create order
      const newOrderId = await createOrder();

      if (!newOrderId) {
        alert("Failed to create order. Please try again.");
        return;
      }

      console.log(
        "✅ Order created after card validation, opening Paystack with orderId:",
        newOrderId,
      );

      // Open Paystack payment window
      if (paymentMethod === "paystack" || paymentMethod === "card") {
        handlePaystackPayment();
      }
    }
  };

  // Guard clauses
  if (!accessToken) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCheckout}>
          <p>Please login to continue</p>
          <button
            className={styles.shopNowButton}
            onClick={() => navigate("/auth")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

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
      {/* Header */}
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

        {/* Payment Step - Show when on payment step */}
        {currentStep === "payment" && (
          <PaymentStep
            shippingAddress={shippingAddress}
            orderData={orderData}
            orderId={orderIdRef.current || orderId}
            user={user}
            onPayment={handlePaystackPayment}
            onValidateCard={(validateFn) => {
              cardValidationRef.current = validateFn;
            }}
          />
        )}
      </div>

      {/* Order Summary */}
      <OrderSummary orderData={orderData} />

      {/* Submit Button */}
      <button
        className={styles.submitButton}
        onClick={handleSubmitOrder}
        disabled={creatingOrder || loading}
      >
        {loading ? (
          <>
            <Loader2 className={styles.spinner} size={20} />
            Processing payment...
          </>
        ) : creatingOrder ? (
          "Creating order..."
        ) : currentStep === "shipping" ? (
          `Submit order (${orderData.itemCount})`
        ) : (
          `Pay ₦${Math.max(orderData.orderTotal, 0).toLocaleString()}`
        )}
      </button>

      {/* Confirm Cancel Modal - Only shows when user tries to leave */}
      {showConfirmCancel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setShowConfirmCancel(false)}
            >
              <X size={24} />
            </button>
            <h3>⚠️ Incomplete Checkout</h3>
            <p>
              You haven't completed your checkout yet. Are you sure you want to
              leave? You have {orderData.itemCount} items in your cart with a
              total of ₦{Math.max(orderData.orderTotal, 0).toLocaleString()}.
            </p>
            <div className={styles.modalBenefits}>
              <div>
                <AlertCircle size={24} />
                <span>Your cart items will be saved</span>
              </div>
              <div>
                <Clock size={24} />
                <span>Limited time offers may expire</span>
              </div>
            </div>
            <button
              className={styles.primaryButton}
              onClick={() => setShowConfirmCancel(false)}
            >
              Continue checkout
            </button>
            <button
              className={styles.tertiaryButton}
              onClick={() => navigate("/cart")}
            >
              Leave anyway
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
