import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./PromoBanner.module.css";

const PromoBanner = ({
  items = [
    { text: "Free shipping", icon: "✓" },
    { text: "Price adjustment within 30 days", icon: "✓" },
  ],
  showArrow = true,
  onBannerClick,
  sticky = true,
  className = "",
}) => {
  return (
    <div
      className={`${styles.bannerContainer} ${
        sticky ? styles.sticky : ""
      } ${className}`}
      onClick={onBannerClick}
      role={onBannerClick ? "button" : undefined}
      tabIndex={onBannerClick ? 0 : undefined}
    >
      <div className={styles.content}>
        <div className={styles.itemsContainer}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className={styles.separator}>|</span>}
              <span className={styles.item}>
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                {item.text}
              </span>
            </React.Fragment>
          ))}
        </div>

        {showArrow && <ChevronRight size={16} className={styles.chevron} />}
      </div>
    </div>
  );
};

export default PromoBanner;
