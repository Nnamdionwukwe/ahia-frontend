import React, { useState, useEffect } from "react";
import styles from "./SeasonalFlashSaleBanner.module.css";

const SeasonalFlashSaleBanner = ({
  flashSale,
  seasonalSale,
  timeLeft,
  allSeasonalSales,
}) => {
  const activeSale = flashSale || seasonalSale;

  // Component to render individual seasonal sale banners
  const SeasonalSaleBannerItem = ({ sale }) => {
    const [saleTimeLeft, setSaleTimeLeft] = useState({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      const calculateTimeLeft = () => {
        if (!sale || !sale.end_time) {
          setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const now = new Date().getTime();
        const end = new Date(sale.end_time).getTime();
        const difference = end - now;

        if (difference > 0) {
          setSaleTimeLeft({
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }, [sale]);

    const isSaleEnded =
      saleTimeLeft.hours === 0 &&
      saleTimeLeft.minutes === 0 &&
      saleTimeLeft.seconds === 0;

    if (isSaleEnded) return null;
  };

  // Component to render individual flash sale banners
  const FlashSaleBannerItem = ({ sale, index }) => {
    const [saleTimeLeft, setSaleTimeLeft] = useState({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      const calculateTimeLeft = () => {
        if (!sale || !sale.end_time) {
          setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const now = new Date().getTime();
        const end = new Date(sale.end_time).getTime();
        const difference = end - now;

        if (difference > 0) {
          setSaleTimeLeft({
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }, [sale]);

    const isSaleEnded =
      saleTimeLeft.hours === 0 &&
      saleTimeLeft.minutes === 0 &&
      saleTimeLeft.seconds === 0;

    if (isSaleEnded) return null;
  };

  return (
    <>
      {/* Main Seasonal/Flash Sale Banner */}
      {activeSale && (
        <div
          className={styles.flashSaleBanner}
          style={
            seasonalSale?.banner_color
              ? {
                  background: `linear-gradient(90deg, ${seasonalSale.banner_color} 0%, ${seasonalSale.banner_color}dd 100%)`,
                }
              : {}
          }
        >
          <div className={styles.saleTag}>
            {flashSale?.title || seasonalSale?.name || "SALE"}
          </div>
          <div className={styles.flashSaleContent}>
            <div className={styles.flashSaleLeft}>
              <span className={styles.flashIcon}>⚡</span>
              <span>
                {flashSale
                  ? "Flash sale"
                  : seasonalSale?.season
                  ? `${seasonalSale.season} sale`
                  : "Big sale"}
              </span>
              <span className={styles.separator}>|</span>
              <span className={styles.clockIcon}>⏰</span>
              <span className={styles.endsText}>Ends in</span>
            </div>
            <div className={styles.timer}>
              <span className={styles.timerDigit}>
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className={styles.timerColon}>:</span>
              <span className={styles.timerDigit}>
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className={styles.timerColon}>:</span>
              <span className={styles.timerDigit}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeasonalFlashSaleBanner;
