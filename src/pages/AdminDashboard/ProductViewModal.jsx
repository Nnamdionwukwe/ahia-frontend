import React from "react";
import { X, Package, DollarSign, Tag, Star } from "lucide-react";
import styles from "./ProductViewModal.module.css";

const ProductViewModal = ({ product, onClose }) => {
  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "#f44336" };
    if (stock < 10) return { label: "Low Stock", color: "#ff9800" };
    return { label: "In Stock", color: "#4caf50" };
  };

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Product Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Images Gallery */}
          <div className={styles.imagesSection}>
            <div className={styles.mainImage}>
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
              />
            </div>
            {product.images?.length > 1 && (
              <div className={styles.imagesThumbnails}>
                {product.images.slice(1).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${product.name} ${index + 2}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <h3 className={styles.productName}>{product.name}</h3>

            <div className={styles.metaInfo}>
              <span className={styles.category}>
                <Tag size={16} />
                {product.category}
              </span>
              {product.brand && (
                <span className={styles.brand}>Brand: {product.brand}</span>
              )}
            </div>

            <div className={styles.priceSection}>
              <div className={styles.currentPrice}>
                {formatCurrency(product.price)}
              </div>
              {product.original_price &&
                product.original_price > product.price && (
                  <>
                    <div className={styles.originalPrice}>
                      {formatCurrency(product.original_price)}
                    </div>
                    <span className={styles.discount}>
                      {product.discount_percentage}% OFF
                    </span>
                  </>
                )}
            </div>

            <div className={styles.stockInfo}>
              <Package size={18} />
              <span>Stock: {product.stock_quantity} units</span>
              <span
                className={styles.stockStatus}
                style={{ backgroundColor: stockStatus.color }}
              >
                {stockStatus.label}
              </span>
            </div>

            {product.rating !== undefined && (
              <div className={styles.ratingInfo}>
                <Star size={18} fill="#ffc107" color="#ffc107" />
                <span className={styles.rating}>{product.rating || 0}</span>
                <span className={styles.reviews}>
                  ({product.total_reviews || 0} reviews)
                </span>
              </div>
            )}

            {product.description && (
              <div className={styles.descriptionSection}>
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className={styles.tagsSection}>
                <h4>Tags</h4>
                <div className={styles.tagsList}>
                  {product.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.additionalInfo}>
              <div className={styles.infoRow}>
                <span>Product ID:</span>
                <strong>{product.id?.substring(0, 12)}...</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Created:</span>
                <strong>
                  {new Date(product.created_at).toLocaleDateString()}
                </strong>
              </div>
              {product.updated_at && (
                <div className={styles.infoRow}>
                  <span>Last Updated:</span>
                  <strong>
                    {new Date(product.updated_at).toLocaleDateString()}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
