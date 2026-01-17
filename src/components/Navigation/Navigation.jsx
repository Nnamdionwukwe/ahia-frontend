import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navigation.module.css";

const Navigation = () => {
  const categories = [
    { id: 1, name: "Electronics", path: "/?category=electronics" },
    { id: 2, name: "Clothing", path: "/?category=clothing" },
    { id: 3, name: "Home", path: "/?category=home" },
    { id: 4, name: "Sports", path: "/?category=sports" },
    { id: 5, name: "Beauty", path: "/?category=beauty" },
    { id: 6, name: "Furniture", path: "/?category=furniture" },
    { id: 1, name: "Electronics", path: "/?category=electronics" },
    { id: 2, name: "Clothing", path: "/?category=clothing" },
    { id: 3, name: "Home", path: "/?category=home" },
    { id: 4, name: "Sports", path: "/?category=sports" },
    { id: 5, name: "Beauty", path: "/?category=beauty" },
    { id: 6, name: "Furniture", path: "/?category=furniture" },
    { id: 1, name: "Electronics", path: "/?category=electronics" },
    { id: 2, name: "Clothing", path: "/?category=clothing" },
    { id: 3, name: "Home", path: "/?category=home" },
    { id: 4, name: "Sports", path: "/?category=sports" },
    { id: 5, name: "Beauty", path: "/?category=beauty" },
    { id: 6, name: "Furniture", path: "/?category=furniture" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {categories.map((cat) => (
          <Link key={cat.id} to={cat.path} className={styles.link}>
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
