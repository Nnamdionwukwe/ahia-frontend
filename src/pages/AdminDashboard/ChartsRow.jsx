import React from "react";
import { BarChart3, Search } from "lucide-react";
import styles from "./ChartsRow.module.css";

const ChartsRow = ({ dauData, popularSearches }) => {
  return (
    <div className={styles.chartsRow}>
      {/* Daily Active Users Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3>Daily Active Users</h3>
          <BarChart3 size={20} />
        </div>
        <div className={styles.chartBody}>
          <div className={styles.barChart}>
            {dauData.slice(0, 14).map((day, index) => {
              const maxUsers = Math.max(...dauData.map((d) => d.active_users));
              const height = (day.active_users / maxUsers) * 100;
              return (
                <div key={index} className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{ height: `${height}%` }}
                    title={`${day.active_users} users`}
                  />
                  <span className={styles.barLabel}>
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Searches */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3>Popular Searches</h3>
          <Search size={20} />
        </div>
        <div className={styles.listBody}>
          {popularSearches.slice(0, 10).map((search, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.listRank}>#{index + 1}</div>
              <div className={styles.listContent}>
                <p>{search.query}</p>
                <span>{search.search_count} searches</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsRow;
