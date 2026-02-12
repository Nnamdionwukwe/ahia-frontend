import React from "react";
import styles from "./UsersTable.module.css";

const UsersTable = ({ filteredUsers, setSelectedUser }) => {
  return (
    <div className={styles.tableCard}>
      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>User</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.userAvatar}>
                    {user.profile_image ? (
                      <img src={user.profile_image} alt={user.full_name} />
                    ) : (
                      <span>{user.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div>
                    <p className={styles.userName}>
                      {user.full_name || "No Name"}
                    </p>
                    <span className={styles.userId}>
                      {user.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.contactCell}>
                  <p>{user.phone_number || "N/A"}</p>
                  <span>{user.email || "No email"}</span>
                </div>
              </td>
              <td>
                <span
                  className={`${styles.roleBadge} ${styles[user.role || "customer"]}`}
                >
                  {user.role || "customer"}
                </span>
              </td>
              <td>
                <span
                  className={`${styles.statusBadge} ${user.is_verified ? styles.verified : styles.unverified}`}
                >
                  {user.is_verified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className={styles.viewButton}
                  onClick={() => setSelectedUser(user)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
