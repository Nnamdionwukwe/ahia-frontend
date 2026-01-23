import React, { useState, useEffect } from "react";
import styles from "./SeasonalFlashSaleBanner.module.css";

const SaleBannerItem = ({ sale, index, isSeasonal, allSales }) => {
  const [saleTimeLeft, setSaleTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // const calculateTimeLeft = () => {
    //   if (!sale || !sale.end_time) {
    //     setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    //     return;
    //   }

    //   const now = new Date().getTime();
    //   const end = new Date(sale.end_time).getTime();
    //   const difference = end - now;

    //   if (difference > 0) {
    //     setSaleTimeLeft({
    //       hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    //       minutes: Math.floor((difference / 1000 / 60) % 60),
    //       seconds: Math.floor((difference / 1000) % 60),
    //     });
    //   } else {
    //     setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    //   }
    // };
    const calculateTimeLeft = () => {
      if (!sale || !sale.start_time || !sale.end_time) {
        console.warn("Sale data is incomplete or invalid", sale);
        setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date().getTime();
      const start = new Date(sale.start_time).getTime();
      const end = new Date(sale.end_time).getTime();

      console.log("Current time:", new Date(now).toISOString());
      console.log("Sale start time:", new Date(start).toISOString());
      console.log("Sale end time:", new Date(end).toISOString());

      if (now < start) {
        console.log("Sale not started yet");
        setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return; // Sale hasn't started
      }

      const difference = end - now;

      if (difference > 0) {
        setSaleTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        console.log("Sale has ended");
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
    : "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)";

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
  allSeasonalSales = [],
  allFlashSales = [],
}) => {
  // Check if we have any sales at all
  const hasSeasonalSales = allSeasonalSales.length > 0;
  const hasFlashSales = allFlashSales.length > 0;

  if (!hasSeasonalSales && !hasFlashSales) {
    return null;
  }

  return (
    <div className={styles.salesContainer}>
      {/* Render all seasonal sales */}
      {hasSeasonalSales && (
        <div className={styles.salesGroup}>
          {allSeasonalSales.map((sale, index) => (
            <SaleBannerItem
              key={sale.id || `seasonal-${index}`}
              sale={sale}
              index={index}
              isSeasonal={true}
              allSales={allSeasonalSales}
            />
          ))}
        </div>
      )}

      {/* Render all flash sales */}
      {hasFlashSales && (
        <div className={styles.salesGroup}>
          {allFlashSales.map((sale, index) => (
            <SaleBannerItem
              key={sale.id || `flash-${index}`}
              sale={sale}
              index={index}
              isSeasonal={false}
              allSales={allFlashSales}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SeasonalFlashSaleBanner;
