import React, { useState, useEffect } from "react";
import { FiX, FiMinus, FiPlus, FiCheck } from "react-icons/fi";
import axios from "axios";
import styles from "./ProductVariantModal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ProductVariantModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    color: null,
    size: null,
  });

  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
    }
  }, [isOpen, product]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/products/${product.id}/variants`
      );
      setVariants(response.data.variants || []);

      if (response.data.variants?.length === 1) {
        const variant = response.data.variants[0];
        setSelectedVariant(variant);
        setSelectedOptions({
          color: variant.color,
          size: variant.size,
        });
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique colors and sizes
  const availableColors = [
    ...new Set(variants.map((v) => v.color).filter(Boolean)),
  ];
  const availableSizes = [
    ...new Set(variants.map((v) => v.size).filter(Boolean)),
  ];

  useEffect(() => {
    if (selectedOptions.color || selectedOptions.size) {
      const matchingVariant = variants.find((v) => {
        const colorMatch =
          !selectedOptions.color || v.color === selectedOptions.color;
        const sizeMatch =
          !selectedOptions.size || v.size === selectedOptions.size;
        return colorMatch && sizeMatch;
      });

      setSelectedVariant(matchingVariant || null);
    }
  }, [selectedOptions, variants]);

  const handleColorSelect = (color) => {
    setSelectedOptions((prev) => ({ ...prev, color }));
  };

  const handleSizeSelect = (size) => {
    setSelectedOptions((prev) => ({ ...prev, size }));
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (selectedVariant?.stock_quantity || 999)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select all product options");
      return;
    }

    // Call the passed in onAddToCart function with variant id and quantity
    onAddToCart(selectedVariant.id, quantity);
    onClose();
  };

  const calculatePrice = () => {
    if (!selectedVariant) return product.price;

    const basePrice = selectedVariant.base_price || product.price;
    const discount = selectedVariant.discount_percentage || 0;
    return basePrice - (basePrice * discount) / 100;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Select Options</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <FiX size={24} />
          </button>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.productImage}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>
          <div className={styles.productDetails}>
            <h3>{product.name}</h3>
            <div className={styles.price}>
              <span className={styles.currentPrice}>
                ₦{parseInt(calculatePrice()).toLocaleString()}
              </span>
              {selectedVariant?.discount_percentage > 0 && (
                <>
                  <span className={styles.originalPrice}>
                    ₦{parseInt(selectedVariant.base_price).toLocaleString()}
                  </span>
                  <span className={styles.discount}>
                    -{selectedVariant.discount_percentage}%
                  </span>
                </>
              )}
            </div>
            {selectedVariant && (
              <div className={styles.stock}>
                {selectedVariant.stock_quantity > 0 ? (
                  <span className={styles.inStock}>
                    {selectedVariant.stock_quantity} in stock
                  </span>
                ) : (
                  <span className={styles.outOfStock}>Out of stock</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading options...</div>
          ) : (
            <>
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>
                    Color:{" "}
                    {selectedOptions.color && (
                      <span className={styles.selected}>
                        {selectedOptions.color}
                      </span>
                    )}
                  </label>
                  <div className={styles.colorGrid}>
                    {availableColors.map((color, idx) => {
                      const isSelected = selectedOptions.color === color;
                      const isAvailable = variants.some(
                        (v) =>
                          v.color === color &&
                          (!selectedOptions.size ||
                            v.size === selectedOptions.size) &&
                          v.stock_quantity > 0
                      );

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            isAvailable && handleColorSelect(color)
                          }
                          disabled={!isAvailable}
                          className={`${styles.colorBtn} ${
                            isSelected ? styles.active : ""
                          } ${!isAvailable ? styles.disabled : ""}`}
                        >
                          <span className={styles.colorName}>{color}</span>
                          {isSelected && (
                            <FiCheck className={styles.checkIcon} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>
                    Size:{" "}
                    {selectedOptions.size && (
                      <span className={styles.selected}>
                        {selectedOptions.size}
                      </span>
                    )}
                  </label>
                  <div className={styles.sizeGrid}>
                    {availableSizes.map((size, idx) => {
                      const isSelected = selectedOptions.size === size;
                      const isAvailable = variants.some(
                        (v) =>
                          v.size === size &&
                          (!selectedOptions.color ||
                            v.color === selectedOptions.color) &&
                          v.stock_quantity > 0
                      );

                      return (
                        <button
                          key={idx}
                          onClick={() => isAvailable && handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`${styles.sizeBtn} ${
                            isSelected ? styles.active : ""
                          } ${!isAvailable ? styles.disabled : ""}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              {selectedVariant && (
                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Quantity</label>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={styles.qtyBtn}
                    >
                      <FiMinus />
                    </button>
                    <span className={styles.qtyValue}>{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={
                        quantity >= (selectedVariant?.stock_quantity || 1)
                      }
                      className={styles.qtyBtn}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              )}

              {/* No variants message */}
              {variants.length === 0 && !loading && (
                <div className={styles.noVariants}>
                  <p>No variants available for this product</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalPrice}>
              ₦{parseInt(calculatePrice() * quantity).toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            className={styles.addToCartBtn}
          >
            {!selectedVariant
              ? "Select Options"
              : selectedVariant.stock_quantity === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;
