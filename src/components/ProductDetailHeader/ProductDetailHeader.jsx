import styles from "./ProductDetailHeader.module.css";

const ProductDetailHeader = ({ activeTab, setActiveTab, setShowExitModal }) => {
  const handleClose = () => {
    setShowExitModal(true);
  };

  return (
    <div className={styles.header}>
      <button onClick={handleClose} className={styles.backButton}>
        ←
      </button>
      <div className={styles.headerTabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "overview" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "reviews" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
        {/* {displayImages.length > 2 && (
          <button
            className={`${styles.tab} ${
              activeTab === "gallery" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        )} */}
        <button
          className={`${styles.tab} ${
            activeTab === "recommended" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("recommended")}
        >
          Recommended
        </button>
      </div>
      <div className={styles.headerActions}>
        <button className={styles.iconButton}>🔍</button>
        <button className={styles.iconButton}>📤</button>
      </div>
    </div>
  );
};

export default ProductDetailHeader;
