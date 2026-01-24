import React from "react";
import { X, Minus, Plus } from "lucide-react";
import styles from "./ProductVariantModal.module.css";

const ProductVariantModal = ({
  product,
  isOpen,
  onClose,
  selectedColor,
  selectedSize,
  quantity,
  onColorSelect,
  onSizeSelect,
  onQuantityChange,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  const isSelectionComplete = selectedColor && selectedSize;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.productInfo}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{product.name}</h3>

              <div className={styles.priceContainer}>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className={styles.estText}>Est.</span>
                <span className={styles.currentPrice}>
                  ₦{product.price.toLocaleString()}
                </span>
              </div>

              {product.discount && (
                <span className={styles.discountBadge}>
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Color</h4>
              <div className={styles.colorGrid}>
                {product.colors.map((color, idx) => (
                  <div
                    key={idx}
                    onClick={() => onColorSelect(color.name)}
                    className={`${styles.colorOption} ${
                      selectedColor === color.name ? styles.selected : ""
                    }`}
                  >
                    <img
                      src={color.image || color.img}
                      alt={color.name}
                      className={styles.colorImage}
                    />
                    <p className={styles.colorName}>{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Size (UK)</h4>
                <button className={styles.sizeGuide}>📏 Size guide</button>
              </div>

              <div className={styles.sizeGrid}>
                {product.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSizeSelect(size)}
                    className={`${styles.sizeButton} ${
                      selectedSize === size ? styles.selected : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service Benefits */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Service/Benefits</h4>
            <div className={styles.benefits}>
              <div className={styles.benefitBadge}>
                Arrives in NG in as little as 7 days
              </div>
              <div className={styles.benefitBadge}>FREE SHIPPING</div>
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.section}>
            <div className={styles.quantityContainer}>
              <span className={styles.quantityLabel}>Qty</span>
              <div className={styles.quantityControls}>
                <button
                  onClick={handleQuantityDecrease}
                  className={styles.quantityButton}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  onClick={handleQuantityIncrease}
                  className={styles.quantityButton}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            disabled={!isSelectionComplete}
            className={`${styles.addToCartButton} ${
              isSelectionComplete ? styles.enabled : styles.disabled
            }`}
          >
            <div className={styles.buttonText}>Select an option</div>
            <div className={styles.buttonSubtext}>
              Arrives in NG in as little as 7 days
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;
