import React from "react";
import styles from "./SoldCountProductTitle.module.css";

const SoldCountProductTitle = ({ productData, flashSale }) => {
  return (
    <>
      {/* Product Title */}
      <h1 className={styles.productName}>{productData.name}</h1>

      {/* Sold Count & Store */}
      <div className={styles.productMeta}>
        <span className={styles.soldCount}>
          <span className={styles.fireIcon}>🔥</span>
          {flashSale?.sold_quantity || 0}+ sold
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.storeName}>
          Sold by {productData.store_name || "Store"}
        </span>
      </div>
    </>
  );
};

export default SoldCountProductTitle;
