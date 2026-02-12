import React from "react";
import { Users, UserCheck, Crown, UserX } from "lucide-react";
import styles from "./UserStats.module.css";

const UserStats = ({ users }) => {
  return (
    <div className={styles.userStatsGrid}>
      <div className={styles.userStatCard}>
        <Users size={24} className={styles.userStatIcon} />
        <div>
          <p>Total Users</p>
          <h3>{users.length}</h3>
        </div>
      </div>
      <div className={styles.userStatCard}>
        <UserCheck size={24} className={styles.userStatIcon} />
        <div>
          <p>Verified Users</p>
          <h3>{users.filter((u) => u.is_verified).length}</h3>
        </div>
      </div>
      <div className={styles.userStatCard}>
        <Crown size={24} className={styles.userStatIcon} />
        <div>
          <p>Admin Users</p>
          <h3>{users.filter((u) => u.role === "admin").length}</h3>
        </div>
      </div>
      <div className={styles.userStatCard}>
        <UserX size={24} className={styles.userStatIcon} />
        <div>
          <p>Inactive Users</p>
          <h3>{users.filter((u) => !u.is_verified).length}</h3>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
