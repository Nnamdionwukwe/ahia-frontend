import React from "react";
import styles from "./UserDetailsModal.module.css";

const UserDetailsModal = ({ selectedUser, setSelectedUser }) => {
  return (
    selectedUser && (
      <div
        className={styles.modalOverlay}
        onClick={() => setSelectedUser(null)}
      >
        <div className={styles.userModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>User Details</h2>
            <button onClick={() => setSelectedUser(null)}>×</button>
          </div>
          <div className={styles.modalBody}>
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
              <strong>{selectedUser.role || "customer"}</strong>
            </div>
            <div className={styles.userDetailRow}>
              <span>Status:</span>
              <strong>
                {selectedUser.is_verified ? "Verified" : "Unverified"}
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
          </div>
          <div className={styles.modalActions}>
            <button className={styles.editButton}>Edit User</button>
            <button className={styles.deleteButton}>Delete User</button>
          </div>
        </div>
      </div>
    )
  );
};

export default UserDetailsModal;
