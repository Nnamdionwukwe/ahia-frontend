import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import styles from "./CheckOutHeader.module.css";

export default function CheckOutHeader({
  currentStep,
  orderData,
  setShowConfirmCancel,
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.header}>
      {currentStep === "payment" ? (
        <button
          className={styles.backButton}
          onClick={() => setShowConfirmCancel(true)}
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      ) : (
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <h1 className={styles.headerTitle}>
        {currentStep === "shipping" ? "Checkout" : "Payment"} (
        {orderData.itemCount})
      </h1>

      <div className={styles.headerSpacer} />
    </div>
  );
}
