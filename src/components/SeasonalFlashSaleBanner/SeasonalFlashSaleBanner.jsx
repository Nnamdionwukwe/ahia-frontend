import React, { useState, useEffect } from "react";
import styles from "./SeasonalFlashSaleBanner.module.css";

const SeasonalFlashSaleBanner = ({
  allSeasonalSales = [],
  allFlashSales = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saleTimeLeft, setSaleTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ✅ Merge all sales into one list
  const allSales = React.useMemo(() => {
    const merged = [];

    allSeasonalSales.forEach((sale) => {
      merged.push({ ...sale, _type: "seasonal" });
    });

    allFlashSales.forEach((sale) => {
      merged.push({ ...sale, _type: "flash" });
    });

    return merged;
  }, [allSeasonalSales, allFlashSales]);

  const currentSale = allSales[currentIndex] || null;
  const isSeasonal = currentSale?._type === "seasonal";

  // ✅ Auto-rotate every 4 seconds
  useEffect(() => {
    if (allSales.length <= 1) return;

    const rotator = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSales.length);
    }, 4000);

    return () => clearInterval(rotator);
  }, [allSales.length]);

  // ✅ Countdown timer for current sale
  useEffect(() => {
    if (!currentSale) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(currentSale.start_time).getTime();
      const end = new Date(currentSale.end_time).getTime();

      if (now < start) {
        setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const difference = end - now;

      if (difference > 0) {
        setSaleTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [currentSale]);

  if (!currentSale) return null;

  const backgroundStyle = isSeasonal
    ? currentSale.banner_color
      ? `linear-gradient(90deg, ${currentSale.banner_color} 0%, ${currentSale.banner_color}dd 100%)`
      : "linear-gradient(135deg, #10b981, #06b6d4)"
    : "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)";

  const saleTitle = isSeasonal
    ? currentSale.name || currentSale.title || "SEASONAL SALE"
    : currentSale.title || currentSale.name || "FLASH SALE";

  const saleTagText = isSeasonal
    ? currentSale.season
      ? `${currentSale.season} Sale`
      : currentSale.name || "Seasonal Sale"
    : currentSale.title || "Flash Sale";

  return (
    <div className={styles.salesContainer}>
      <div
        className={styles.flashSaleBanner}
        style={{ background: backgroundStyle }}
      >
        <div className={styles.saleTag}>{saleTitle}</div>
        <div className={styles.flashSaleContent}>
          <div className={styles.flashSaleLeft}>
            <span className={styles.flashIcon}>⚡</span>
            <span>{saleTagText}</span>
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

        {/* ✅ Dot indicators */}
        {allSales.length > 1 && (
          <div className={styles.dotContainer}>
            {allSales.map((_, i) => (
              <div
                key={i}
                className={styles.dot}
                style={{
                  background:
                    i === currentIndex ? "#fff" : "rgba(255,255,255,0.4)",
                  width: i === currentIndex ? "20px" : "8px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalFlashSaleBanner;
