import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Upload, Plus, Trash2 } from "lucide-react";
import styles from "./ProductEditModal.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    original_price: product?.original_price || "",
    discount_percentage: product?.discount_percentage || 0,
    category: product?.category || "",
    brand: product?.brand || "",
    stock_quantity: product?.stock_quantity || 0,
    images: product?.images || [],
    tags: product?.tags || [],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: parseFloat(formData.original_price || formData.price),
        discount_percentage: parseFloat(formData.discount_percentage || 0),
        stock_quantity: parseInt(formData.stock_quantity || 0),
      };

      let response;
      if (product) {
        // Update existing product
        response = await axios.put(
          `${API_URL}/api/products/${product.id}`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
      } else {
        // Create new product
        response = await axios.post(`${API_URL}/api/products`, dataToSend, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (response.data.success) {
        alert(
          product
            ? "Product updated successfully!"
            : "Product created successfully!",
        );
        onSave(response.data.product);
        onClose();
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(error.response?.data?.error || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{product ? "Edit Product" : "Create New Product"}</h2>
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
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Electronics"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Nike"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className={styles.formSection}>
              <h3>Pricing & Stock</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price (₦) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Original Price (₦)</label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className={styles.formSection}>
              <h3>Product Images</h3>

              <div className={styles.imagesList}>
                {formData.images.map((url, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img src={url} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImageButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.addImage}>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                <button type="button" onClick={handleAddImage}>
                  <Plus size={18} />
                  Add Image
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className={styles.formSection}>
              <h3>Tags</h3>

              <div className={styles.tagsList}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              <div className={styles.addTag}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button type="button" onClick={handleAddTag}>
                  <Plus size={18} />
                  Add Tag
                </button>
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
                : product
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
