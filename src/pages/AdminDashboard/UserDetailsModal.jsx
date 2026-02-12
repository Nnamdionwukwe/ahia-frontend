import React, { useState } from "react";
import axios from "axios";
import { X, Edit2, Trash2, Save, XCircle } from "lucide-react";
import styles from "./UserDetailsModal.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const UserDetailsModal = ({
  selectedUser,
  setSelectedUser,
  onUserUpdated,
  onUserDeleted,
}) => {
  const { accessToken } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: selectedUser?.full_name || "",
    email: selectedUser?.email || "",
    phone_number: selectedUser?.phone_number || "",
    role: selectedUser?.role || "customer",
    is_verified: selectedUser?.is_verified || false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${selectedUser.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.success) {
        alert("User updated successfully!");
        setIsEditing(false);

        // Update selected user with new data
        setSelectedUser(response.data.user);

        // Notify parent component to refresh user list
        if (onUserUpdated) {
          onUserUpdated(response.data.user);
        }
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update user. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUser.full_name || "this user"}? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    // Double confirmation for admin users
    if (selectedUser.role === "admin") {
      const doubleConfirm = window.confirm(
        "⚠️ WARNING: You are about to delete an ADMIN user. Are you absolutely sure?",
      );
      if (!doubleConfirm) return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/users/${selectedUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.success) {
        alert("User deleted successfully!");

        // Notify parent component to remove user from list
        if (onUserDeleted) {
          onUserDeleted(selectedUser.id);
        }

        // Close modal
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete user. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setFormData({
      full_name: selectedUser.full_name || "",
      email: selectedUser.email || "",
      phone_number: selectedUser.phone_number || "",
      role: selectedUser.role || "customer",
      is_verified: selectedUser.is_verified || false,
    });
    setIsEditing(false);
  };

  return (
    selectedUser && (
      <div
        className={styles.modalOverlay}
        onClick={() => setSelectedUser(null)}
      >
        <div className={styles.userModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{isEditing ? "Edit User" : "User Details"}</h2>
            <button onClick={() => setSelectedUser(null)}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {isEditing ? (
              /* Edit Mode */
              <>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="is_verified"
                      checked={formData.is_verified}
                      onChange={handleInputChange}
                      className={styles.checkbox}
                    />
                    <span>Verified User</span>
                  </label>
                </div>

                <div className={styles.formInfo}>
                  <p>
                    <strong>Signup Method:</strong>{" "}
                    {selectedUser.signup_method || "phone"}
                  </p>
                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              /* View Mode */
              <>
                <div className={styles.userDetailRow}>
                  <span>Full Name:</span>
                  <strong>{selectedUser.full_name || "N/A"}</strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Email:</span>
                  <strong>{selectedUser.email || "N/A"}</strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Phone:</span>
                  <strong>{selectedUser.phone_number || "N/A"}</strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Role:</span>
                  <strong
                    className={
                      selectedUser.role === "admin" ? styles.adminBadge : ""
                    }
                  >
                    {selectedUser.role || "customer"}
                  </strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Status:</span>
                  <strong
                    className={
                      selectedUser.is_verified
                        ? styles.verified
                        : styles.unverified
                    }
                  >
                    {selectedUser.is_verified ? "✓ Verified" : "✗ Unverified"}
                  </strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Signup Method:</span>
                  <strong>{selectedUser.signup_method || "phone"}</strong>
                </div>
                <div className={styles.userDetailRow}>
                  <span>Joined:</span>
                  <strong>
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div className={styles.modalActions}>
            {isEditing ? (
              <>
                <button
                  className={styles.saveButton}
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <XCircle size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit2 size={18} />
                  Edit User
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteUser}
                  disabled={loading}
                >
                  <Trash2 size={18} />
                  {loading ? "Deleting..." : "Delete User"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default UserDetailsModal;
