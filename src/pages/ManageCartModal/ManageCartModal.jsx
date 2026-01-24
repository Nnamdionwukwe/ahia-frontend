// pages/Cart/ManageCartModal/ManageCartModal.jsx
import React, { useState } from "react";
import styles from "./ManageCartModal.module.css";
import useCartStore from "../../store/cartStore";

const ManageCartModal = ({ onClose }) => {
  const { items, toggleSelection, removeSelected } = useCartStore();
  const [selectedItems, setSelectedItems] = useState(
    new Set(items.filter((item) => item.is_selected).map((item) => item.id))
  );

  const handleToggleItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) {
      alert("Please select items to remove");
      return;
    }

    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${selectedItems.size} item(s)?`
    );

    if (confirmRemove) {
      // Remove each selected item
      for (const itemId of selectedItems) {
        await toggleSelection(itemId);
      }
      await removeSelected();
      onClose();
    }
  };

  const allSelected = selectedItems.size === items.length && items.length > 0;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Manage cart ({items.length})</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Select All */}
          <div className={styles.selectAllSection}>
            <label className={styles.selectAllLabel}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className={styles.checkbox}
              />
              <span>Select all ({items.length})</span>
            </label>
          </div>

          {/* Cart Items List */}
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleToggleItem(item.id)}
                  className={styles.itemCheckbox}
                />

                <div className={styles.itemImage}>
                  <img src={item.image_url} alt={item.name} />
                </div>

                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  {(item.color || item.size) && (
                    <p className={styles.itemVariant}>
                      {item.color} {item.size && `x${item.quantity}`}
                    </p>
                  )}
                  <div className={styles.itemPrice}>
                    <span className={styles.price}>
                      ₦{parseFloat(item.final_price || 0).toLocaleString()}
                    </span>
                    {item.discount_percentage > 0 && (
                      <span className={styles.originalPrice}>
                        ₦
                        {parseFloat(
                          item.item_original_price || 0
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.itemQuantity}>x{item.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.removeButton}
            onClick={handleRemoveSelected}
            disabled={selectedItems.size === 0}
          >
            Remove ({selectedItems.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCartModal;
