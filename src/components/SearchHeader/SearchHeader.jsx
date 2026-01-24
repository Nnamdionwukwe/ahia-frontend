import React, { useState } from "react";
import SearchOverlay from "../SearchOverlay/SearchOverlay";
import { FiSearch, FiCamera } from "react-icons/fi";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./SearchHeader.module.css";
import CategoryPage from "../CategoryPage/CategoryPage";

const SearchHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
    }
  };

  return (
    <>
      <BottomNav />
      <header className={styles.header}>
        <div className={styles.container}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="perfume display stand"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                onFocus={() => setSearchOpen(true)}
              />

              <button
                type="button"
                className={styles.cameraButton}
                aria-label="Search by image"
              >
                <FiCamera />
              </button>

              <button
                type="submit"
                className={styles.searchButton}
                aria-label="Search"
              >
                <FiSearch />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* <CategoryPage /> */}

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default SearchHeader;
