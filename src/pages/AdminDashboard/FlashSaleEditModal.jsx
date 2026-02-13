import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Plus, Trash2, Calendar, DollarSign } from "lucide-react";
import styles from "./FlashSaleEditModal.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FlashSaleEditModal = ({ sale, onClose, onSave }) => {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: sale?.title || "",
    description: sale?.description || "",
    startTime: sale?.start_time
      ? new Date(sale.start_time).toISOString().slice(0, 16)
      : "",
    endTime: sale?.end_time
      ? new Date(sale.end_time).toISOString().slice(0, 16)
      : "",
    discountPercentage: sale?.discount_percentage || 10,
    maxQuantity: 100,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        discountPercentage: parseFloat(formData.discountPercentage),
        maxQuantity: parseInt(formData.maxQuantity),
        productIds: selectedProducts,
      };

      // Validation
      if (new Date(dataToSend.startTime) >= new Date(dataToSend.endTime)) {
        alert("End time must be after start time");
        setLoading(false);
        return;
      }

      if (selectedProducts.length === 0) {
        alert("Please select at least one product");
        setLoading(false);
        return;
      }

      let response;
      if (sale) {
        // Update existing flash sale
        response = await axios.put(
          `${API_URL}/api/flash-sales/${sale.id}`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
      } else {
        // Create new flash sale
        response = await axios.post(`${API_URL}/api/flash-sales`, dataToSend, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (response.data.success) {
        alert(
          sale
            ? "Flash sale updated successfully!"
            : "Flash sale created successfully!",
        );
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save flash sale:", error);
      alert(error.response?.data?.error || "Failed to save flash sale");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{sale ? "Edit Flash Sale" : "Create New Flash Sale"}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Info */}
            <div className={styles.formSection}>
              <h3>Basic Information</h3>

              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Weekend Flash Sale"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter sale description"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Discount Percentage *</label>
                  <div className={styles.inputWithIcon}>
                    <DollarSign size={18} />
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      required
                      min="1"
                      max="100"
                      placeholder="10"
                    />
                    <span className={styles.inputSuffix}>%</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Max Quantity per Product</label>
                  <input
                    type="number"
                    name="maxQuantity"
                    value={formData.maxQuantity}
                    onChange={handleChange}
                    min="1"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Time Period */}
            <div className={styles.formSection}>
              <h3>
                <Calendar size={18} />
                Time Period
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Time *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Time *</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.timeInfo}>
                <p>
                  Duration:{" "}
                  {formData.startTime && formData.endTime
                    ? `${Math.round(
                        (new Date(formData.endTime) -
                          new Date(formData.startTime)) /
                          (1000 * 60 * 60),
                      )} hours`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Products Selection */}
            <div className={styles.formSection}>
              <h3>Select Products ({selectedProducts.length} selected)</h3>

              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className={styles.productsList}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`${styles.productItem} ${
                      selectedProducts.includes(product.id)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => {}}
                    />
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                    />
                    <div className={styles.productInfo}>
                      <h4>{product.name}</h4>
                      <div className={styles.productMeta}>
                        <span className={styles.price}>
                          {formatCurrency(product.price)}
                        </span>
                        <span className={styles.salePrice}>
                          {formatCurrency(
                            product.price *
                              (1 - formData.discountPercentage / 100),
                          )}
                        </span>
                        <span className={styles.discount}>
                          {formData.discountPercentage}% OFF
                        </span>
                      </div>
                      <span className={styles.category}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className={styles.emptyProducts}>
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              <Save size={18} />
              {loading
                ? "Saving..."
                : sale
                  ? "Update Flash Sale"
                  : "Create Flash Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashSaleEditModal;
