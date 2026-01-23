import React, { useState, useEffect } from "react";
import styles from "./SeasonalFlashSaleBanner.module.css";

const SaleBannerItem = ({ sale, index, isSeasonal, allSales }) => {
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

  const backgroundStyle = isSeasonal
    ? sale.banner_color
      ? `linear-gradient(90deg, ${sale.banner_color} 0%, ${sale.banner_color}dd 100%)`
      : "linear-gradient(135deg, #10b981, #06b6d4)"
    : undefined;

  return (
    <div
      className={styles.flashSaleBanner}
      style={{
        marginBottom: index < allSales.length - 1 ? "12px" : "0",
        background: backgroundStyle,
      }}
    >
      <div className={styles.saleTag}>
        {isSeasonal ? sale.name || "SEASONAL SALE" : sale.title || "FLASH SALE"}
      </div>
      <div className={styles.flashSaleContent}>
        <div className={styles.flashSaleLeft}>
          <span className={styles.flashIcon}>⚡</span>
          <span>
            {isSeasonal
              ? sale.season
                ? `${sale.season} sale`
                : "Seasonal sale"
              : "Flash sale"}
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.clockIcon}>⏰</span>
          <span className={styles.endsText}>Ends in</span>
        </div>
        <div className={styles.timer}>
          <span className={styles.timerDigit}>
            {String(saleTimeLeft.hours).padStart(2, "0")}
          </span>
          <span className={styles.timerColon}>:</span>
          <span className={styles.timerDigit}>
            {String(saleTimeLeft.minutes).padStart(2, "0")}
          </span>
          <span className={styles.timerColon}>:</span>
          <span className={styles.timerDigit}>
            {String(saleTimeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};

const SeasonalFlashSaleBanner = ({
  flashSale,
  seasonalSale,
  timeLeft,
  allSeasonalSales,
  allFlashSales,
}) => {
  const activeSale = flashSale || seasonalSale;

  // Only show banner if there's an active sale
  if (!activeSale) return null;

  return (
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
  );
};

export default SeasonalFlashSaleBanner;
