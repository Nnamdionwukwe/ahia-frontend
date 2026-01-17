// ============================================
// SearchOverlay.jsx
// ============================================
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiCamera,
  FiClock,
  FiTrendingUp,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";
import axios from "axios";
import styles from "./SearchOverlay.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    { text: "rotating stand", emoji: "🔥" },
    { text: "rotating display stand", emoji: "🔥" },
    { text: "shoes men", emoji: "👟" },
    { text: "docking station laptop", emoji: "💻" },
    { text: "content creation equipment", emoji: "🎥" },
  ]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchAutocomplete(searchQuery);
      } else {
        setSuggestions({ products: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAutocomplete = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/api/search/autocomplete`, {
        params: { q: query },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;

    // Save to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      10
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (search) => {
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <button onClick={onClose} className={styles.backBtn}>
            <FiX size={24} />
          </button>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <FiSearch className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="perfume display stand"
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={styles.clearBtn}
              >
                <FiX />
              </button>
            )}
            <button type="button" className={styles.cameraBtn}>
              <FiCamera size={20} />
            </button>
          </form>
          <button
            type="submit"
            onClick={handleSubmit}
            className={styles.searchBtn}
          >
            <FiSearch size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Show autocomplete if typing */}
          {searchQuery.length >= 2 &&
          (suggestions.products.length > 0 ||
            suggestions.categories.length > 0) ? (
            <div className={styles.autocomplete}>
              {suggestions.categories.length > 0 && (
                <div className={styles.section}>
                  <h3>Categories</h3>
                  {suggestions.categories.map((category, idx) => (
                    <div
                      key={idx}
                      className={styles.suggestionItem}
                      onClick={() => handleSearch(category)}
                    >
                      <FiSearch className={styles.itemIcon} />
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              )}

              {suggestions.products.length > 0 && (
                <div className={styles.section}>
                  <h3>Products</h3>
                  {suggestions.products.slice(0, 5).map((product, idx) => (
                    <div
                      key={idx}
                      className={styles.productItem}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.images && product.images[0] && (
                        <img src={product.images[0]} alt={product.name} />
                      )}
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>
                          {product.name}
                        </span>
                        <span className={styles.productPrice}>
                          ₦{parseInt(product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recently Searched */}
              {recentSearches.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3>
                      <FiClock /> Recently searched
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className={styles.clearAllBtn}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  {recentSearches.map((search, idx) => (
                    <div key={idx} className={styles.recentItem}>
                      <div
                        className={styles.recentText}
                        onClick={() => handleSearch(search)}
                      >
                        <FiClock className={styles.itemIcon} />
                        <span>{search}</span>
                      </div>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className={styles.removeBtn}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Right Now */}
              <div className={styles.section}>
                <h3>
                  <FiTrendingUp /> Popular right now
                </h3>
                <div className={styles.popularGrid}>
                  {popularSearches.map((item, idx) => (
                    <div
                      key={idx}
                      className={styles.popularChip}
                      onClick={() => handleSearch(item.text)}
                    >
                      <span className={styles.emoji}>{item.emoji}</span>
                      <span className={styles.chipText}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browsing History */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Browsing history</h3>
                  <FiChevronRight />
                </div>
                <div className={styles.historyGrid}>
                  {[1, 2, 3, 4].map((_, idx) => (
                    <div key={idx} className={styles.historyCard}>
                      <div className={styles.historyImage}>
                        <div className={styles.imagePlaceholder}>📦</div>
                      </div>
                      <div className={styles.rating}>
                        ⭐ {(4 + Math.random()).toFixed(1)}
                      </div>
                      <div className={styles.historyPrice}>
                        ₦
                        {(Math.random() * 50000 + 5000)
                          .toFixed(0)
                          .toLocaleString()}
                        <span className={styles.discount}>
                          -{Math.floor(Math.random() * 60 + 20)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;

// ============================================
// Usage in Header or Navigation
// ============================================
/*
// Add to your Header.jsx or wherever you have the search bar

import React, { useState } from 'react';
import SearchOverlay from './SearchOverlay/SearchOverlay';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header>
        <button onClick={() => setSearchOpen(true)}>
          Search
        </button>
      </header>
      
      <SearchOverlay 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </>
  );
};
*/
