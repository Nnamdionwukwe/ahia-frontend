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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([
    { text: "rotating stand", emoji: "🔥" },
    { text: "rotating display stand", emoji: "🔥" },
    { text: "shoes men", emoji: "👟" },
    { text: "docking station laptop", emoji: "💻" },
    { text: "content creation equipment", emoji: "🎥" },
  ]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [browsingHistory, setBrowsingHistory] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Load browsing history when overlay opens
      loadBrowsingHistory();
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
        fetchSearchSuggestions(searchQuery);
      } else {
        setSuggestions({ products: [], categories: [] });
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch autocomplete suggestions
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

  // Fetch "did you mean" suggestions
  const fetchSearchSuggestions = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/api/search/suggestions`, {
        params: { q: query },
      });
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSearchSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Search suggestions error:", error);
    }
  };

  // Load browsing history (recently viewed products)
  const loadBrowsingHistory = async () => {
    try {
      const history = localStorage.getItem("browsingHistory");
      if (history) {
        const productIds = JSON.parse(history).slice(0, 4);

        // Fetch product details for each ID
        const products = await Promise.all(
          productIds.map(async (id) => {
            try {
              const response = await axios.get(
                `${API_URL}/api/products/${id}/details`
              );
              return response.data.product;
            } catch (error) {
              return null;
            }
          })
        );

        setBrowsingHistory(products.filter((p) => p !== null));
      }
    } catch (error) {
      console.error("Error loading browsing history:", error);
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

    // Navigate to search results with query
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
              placeholder="Search products..."
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
          {searchQuery.length >= 2 ? (
            <div className={styles.autocomplete}>
              {/* Did you mean suggestions */}
              {searchSuggestions.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Did you mean?</h3>
                  {searchSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                    >
                      <FiSearch className={styles.itemIcon} />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions.categories && suggestions.categories.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Categories</h3>
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

              {/* Products */}
              {suggestions.products && suggestions.products.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Products</h3>
                  {suggestions.products.slice(0, 5).map((product, idx) => (
                    <div
                      key={idx}
                      className={styles.productItem}
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        onClose();
                      }}
                    >
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={styles.productImage}
                        />
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

              {/* No results */}
              {suggestions.products.length === 0 &&
                suggestions.categories.length === 0 &&
                searchSuggestions.length === 0 && (
                  <div className={styles.noResults}>
                    <p>No results found for "{searchQuery}"</p>
                    <p className={styles.noResultsHint}>
                      Try different keywords or browse categories
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <>
              {/* Recently Searched */}
              {recentSearches.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
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
                <h3 className={styles.sectionTitle}>
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
              {browsingHistory.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Browsing history</h3>
                    <FiChevronRight />
                  </div>
                  <div className={styles.historyGrid}>
                    {browsingHistory.map((product, idx) => (
                      <div
                        key={idx}
                        className={styles.historyCard}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          onClose();
                        }}
                      >
                        <div className={styles.historyImage}>
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} />
                          ) : (
                            <div className={styles.imagePlaceholder}>📦</div>
                          )}
                        </div>
                        {product.rating && (
                          <div className={styles.rating}>
                            ⭐ {product.rating.toFixed(1)}
                          </div>
                        )}
                        <div className={styles.historyPrice}>
                          ₦{parseInt(product.price).toLocaleString()}
                          {product.discount_percentage > 0 && (
                            <span className={styles.discount}>
                              -{product.discount_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
