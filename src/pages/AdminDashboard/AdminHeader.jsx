import React from "react";
import { Download } from "lucide-react";
import styles from "./AdminHeader.module.css";

const AdminHeader = ({ user, period, setPeriod }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.full_name || "Admin"}</p>
      </div>
      <div className={styles.headerRight}>
        <select
          className={styles.periodSelector}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button className={styles.downloadButton}>
          <Download size={18} />
          Export
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
