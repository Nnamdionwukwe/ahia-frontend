import React from "react";
import styles from "./ProductDescription.module.css";

const ProductDescription = ({ description }) => {
  if (!description) return null;

  return (
    <div className={styles.description}>
      <p>{description}</p>
    </div>
  );
};

export default ProductDescription;
