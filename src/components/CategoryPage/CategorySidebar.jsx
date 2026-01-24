import React from "react";
import styles from "./CategorySidebar.module.css";

const CategorySidebar = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.featuredBadge}>Featured</div>
      </div>

      <div className={styles.categoryList}>
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`${styles.categoryItem} ${
              activeCategory === cat.name ? styles.active : ""
            }`}
            onClick={() => onCategoryClick && onCategoryClick(cat.name)}
          >
            <span className={styles.categoryIcon}>{cat.icon}</span>
            <span className={styles.categoryName}>{cat.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CategorySidebar;
