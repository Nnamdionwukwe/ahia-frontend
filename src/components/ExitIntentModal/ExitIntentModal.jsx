import React from "react";
import styles from "./ExitIntentModal.module.css";
import { useNavigate } from "react-router-dom";

const ExitIntentModal = ({ showExitModal, setShowExitModal, timeLeft }) => {
  if (!showExitModal) return null;
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
    setShowExitModal(false);
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={() => setShowExitModal(false)}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowExitModal(false)}
          className={styles.modalClose}
        >
          ×
        </button>

        <div className={styles.modalIcon}>🎁</div>
        <h2 className={styles.modalTitle}>Special Offer</h2>
        <p className={styles.modalSubtitle}>Just for you!</p>

        <div className={styles.modalDivider} />

        <div className={styles.modalDiscount}>15% OFF</div>
        <p className={styles.modalDescription}>
          No min. spend. Valid on select items only
        </p>

        <div className={styles.modalTimer}>
          <span>Expires in</span>
          <div className={styles.modalTimerDigits}>
            <span>{String(timeLeft.hours).padStart(2, "0")}</span>
            <span>:</span>
            <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span>:</span>
            <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowExitModal(false);
            alert("15% discount applied!");
          }}
          className={styles.modalUseButton}
        >
          Use Discount
        </button>

        <button onClick={handleClose} className={styles.modalLeaveButton}>
          No Thanks
        </button>
      </div>
    </div>
  );
};

export default ExitIntentModal;
