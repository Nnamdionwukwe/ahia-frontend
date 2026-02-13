import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Calendar, DollarSign, Palette } from "lucide-react";
import styles from "./SeasonalSaleEditModal.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SEASONS = [
  { value: "spring", label: "Spring", color: "#10b981" },
  { value: "summer", label: "Summer", color: "#f59e0b" },
  { value: "fall", label: "Fall", color: "#f97316" },
  { value: "winter", label: "Winter", color: "#3b82f6" },
  { value: "christmas", label: "Christmas", color: "#dc2626" },
  { value: "black-friday", label: "Black Friday", color: "#1f2937" },
  { value: "new-year", label: "New Year", color: "#8b5cf6" },
  { value: "valentines", label: "Valentine's Day", color: "#ec4899" },
  { value: "easter", label: "Easter", color: "#a855f7" },
  { value: "halloween", label: "Halloween", color: "#f97316" },
];

const SeasonalSaleEditModal = ({ sale, onClose, onSave }) => {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: sale?.name || "",
    season: sale?.season || "spring",
    description: sale?.description || "",
    startTime: sale?.start_time
      ? new Date(sale.start_time).toISOString().slice(0, 16)
      : "",
    endTime: sale?.end_time
      ? new Date(sale.end_time).toISOString().slice(0, 16)
      : "",
    discountPercentage: sale?.discount_percentage || 15,
    bannerColor:
      sale?.banner_color ||
      SEASONS.find((s) => s.value === (sale?.season || "spring"))?.color ||
      "#10b981",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update banner color when season changes
    const selectedSeason = SEASONS.find((s) => s.value === formData.season);
    if (selectedSeason && !sale) {
      setFormData((prev) => ({
        ...prev,
        bannerColor: selectedSeason.color,
      }));
    }
  }, [formData.season]);

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
        name: formData.name,
        season: formData.season,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        discountPercentage: parseFloat(formData.discountPercentage),
        bannerColor: formData.bannerColor,
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
        // Update existing seasonal sale
        response = await axios.put(
          `${API_URL}/api/seasonal-sales/${sale.id}`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
      } else {
        // Create new seasonal sale
        response = await axios.post(
          `${API_URL}/api/seasonal-sales`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
      }

      if (response.data.success) {
        alert(
          sale
            ? "Seasonal sale updated successfully!"
            : "Seasonal sale created successfully!",
        );
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save seasonal sale:", error);
      alert(error.response?.data?.error || "Failed to save seasonal sale");
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
          <h2>{sale ? "Edit Seasonal Sale" : "Create New Seasonal Sale"}</h2>
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
                <label>Sale Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Summer Sale 2026"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Season *</label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  required
                >
                  {SEASONS.map((season) => (
                    <option key={season.value} value={season.value}>
                      {season.label}
                    </option>
                  ))}
                </select>
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
                      placeholder="15"
                    />
                    <span className={styles.inputSuffix}>%</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Banner Color</label>
                  <div className={styles.colorPicker}>
                    <Palette size={18} />
                    <input
                      type="color"
                      name="bannerColor"
                      value={formData.bannerColor}
                      onChange={handleChange}
                    />
                    <span>{formData.bannerColor}</span>
                  </div>
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
                          (1000 * 60 * 60 * 24),
                      )} days`
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
              style={{ backgroundColor: formData.bannerColor }}
            >
              <Save size={18} />
              {loading
                ? "Saving..."
                : sale
                  ? "Update Seasonal Sale"
                  : "Create Seasonal Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonalSaleEditModal;
