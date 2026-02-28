import React, { useState, useEffect } from "react";
import { FiX, FiMinus, FiPlus, FiCheck } from "react-icons/fi";
import axios from "axios";
import styles from "./ProductVariantModal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Props
 *  product     – { id, name, images, price } — normal usage from ProductCard
 *  variantId   – UUID — alternative: resolve product from variant (BuyAgainSheet usage)
 *  selectOnly  – true → button says "Confirm", hides qty, doesn't add to cart
 *  onAddToCart – (variantId, qty, imageUrl, variantLabel) => void
 */
const ProductVariantModal = ({
  isOpen,
  onClose,
  product: productProp,
  variantId: initialVariantId,
  onAddToCart,
  selectOnly = false,
}) => {
  const [product, setProduct] = useState(productProp || null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    color: null,
    size: null,
  });
  const [selectedImage, setSelectedImage] = useState(
    productProp?.images?.[0] || null,
  );

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(1);
    setSelectedOptions({ color: null, size: null });
    setSelectedVariant(null);

    if (productProp) {
      setProduct(productProp);
      setSelectedImage(productProp.images?.[0] || null);
      fetchVariants(productProp.id);
    } else if (initialVariantId) {
      // Resolve product from variant ID first
      resolveProductFromVariant(initialVariantId);
    }
  }, [isOpen]);

  const resolveProductFromVariant = async (vId) => {
    setLoading(true);
    try {
      // Single call returns both variant and parent product
      const res = await axios.get(`${API_URL}/api/products/variant/${vId}`);
      const p = res.data.product;
      setProduct(p);
      setSelectedImage(p.images?.[0] || null);
      await fetchVariants(p.id, vId);
    } catch (err) {
      console.error("Failed to resolve product from variant:", err);
      setLoading(false);
    }
  };

  const fetchVariants = async (productId, preSelectVariantId = null) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/products/${productId}/variants`,
      );
      const fetched = response.data.variants || [];
      setVariants(fetched);

      // Pre-select the variant the user already had
      const toPreselect = preSelectVariantId
        ? fetched.find((v) => v.id === preSelectVariantId)
        : fetched.length === 1
          ? fetched[0]
          : null;

      if (toPreselect) {
        setSelectedVariant(toPreselect);
        setSelectedOptions({
          color: toPreselect.color,
          size: toPreselect.size,
        });
        if (toPreselect.image_url) setSelectedImage(toPreselect.image_url);
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const availableColors = [
    ...new Set(variants.map((v) => v.color).filter(Boolean)),
  ];
  const availableSizes = [
    ...new Set(variants.map((v) => v.size).filter(Boolean)),
  ];

  // Sync selectedVariant when options change
  useEffect(() => {
    if (!selectedOptions.color && !selectedOptions.size) return;
    const match = variants.find((v) => {
      const colorOk =
        !selectedOptions.color || v.color === selectedOptions.color;
      const sizeOk = !selectedOptions.size || v.size === selectedOptions.size;
      return colorOk && sizeOk;
    });
    setSelectedVariant(match || null);

    if (match?.image_url) {
      setSelectedImage(match.image_url);
    } else if (match && product?.images && selectedOptions.color) {
      const uniqueColors = [
        ...new Set(variants.map((v) => v.color).filter(Boolean)),
      ];
      const idx = uniqueColors.indexOf(selectedOptions.color);
      setSelectedImage(
        idx !== -1 && product.images[idx]
          ? product.images[idx]
          : product.images[0],
      );
    }
  }, [selectedOptions, variants]);

  const handleColorSelect = (color) => {
    setSelectedOptions((p) => ({ ...p, color }));
    const uniqueColors = [
      ...new Set(variants.map((v) => v.color).filter(Boolean)),
    ];
    const idx = uniqueColors.indexOf(color);
    if (product?.images && idx !== -1 && product.images[idx]) {
      setSelectedImage(product.images[idx]);
    }
  };

  const handleSizeSelect = (size) =>
    setSelectedOptions((p) => ({ ...p, size }));

  const handleQuantityChange = (delta) => {
    const n = quantity + delta;
    if (n >= 1 && n <= (selectedVariant?.stock_quantity || 999)) setQuantity(n);
  };

  const handleAction = () => {
    if (!selectedVariant) {
      alert("Please select all product options");
      return;
    }
    const label = [selectedVariant.color, selectedVariant.size]
      .filter(Boolean)
      .join(" / ");
    const newPrice = calculatePrice();
    onAddToCart(selectedVariant.id, quantity, selectedImage, label, newPrice);
    onClose();
  };

  const calculatePrice = () => {
    if (!selectedVariant || !product) return product?.price || 0;
    const base = selectedVariant.base_price || product.price;
    const discount = selectedVariant.discount_percentage || 0;
    return base - (base * discount) / 100;
  };

  if (!isOpen || !product) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>{selectOnly ? "Change Variant" : "Select Options"}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <FiX size={24} />
          </button>
        </div>

        {/* Product info */}
        <div className={styles.productInfo}>
          <div className={styles.imageContainer}>
            <div className={styles.productImage}>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = product.images?.[0] || "";
                  }}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className={styles.imageGallery}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`${styles.galleryThumb} ${selectedImage === img ? styles.galleryThumbActive : ""}`}
                  >
                    <img
                      src={img}
                      alt={`img-${idx}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
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

        {/* Options */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading options...</div>
          ) : (
            <>
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
                          v.stock_quantity > 0,
                      );
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            isAvailable && handleColorSelect(color)
                          }
                          disabled={!isAvailable}
                          className={`${styles.colorBtn} ${isSelected ? styles.active : ""} ${!isAvailable ? styles.disabled : ""}`}
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
                          v.stock_quantity > 0,
                      );
                      return (
                        <button
                          key={idx}
                          onClick={() => isAvailable && handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`${styles.sizeBtn} ${isSelected ? styles.active : ""} ${!isAvailable ? styles.disabled : ""}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!selectOnly && selectedVariant && (
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
          {!selectOnly && (
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>Total:</span>
              <span className={styles.totalPrice}>
                ₦{parseInt(calculatePrice() * quantity).toLocaleString()}
              </span>
            </div>
          )}
          <button
            onClick={handleAction}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            className={styles.addToCartBtn}
          >
            {!selectedVariant
              ? "Select Options"
              : selectedVariant.stock_quantity === 0
                ? "Out of Stock"
                : selectOnly
                  ? "Confirm"
                  : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;
