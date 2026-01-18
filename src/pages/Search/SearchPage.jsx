import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./SearchPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    inStock: searchParams.get("inStock") !== "false",
    sort: searchParams.get("sort") || "relevance",
    page: searchParams.get("page") || "1",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Perform search
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        ...filters,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axios.get(`${API_URL}/api/search`, { params });

      setProducts(response.data.products || []);
      setFacets(response.data.facets || null);
      setPagination(response.data.pagination || null);

      // Update URL
      const newParams = new URLSearchParams(params);
      setSearchParams(newParams);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, setSearchParams]);

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

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial search on mount or when params change
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [performSearch]);

  // Fetch autocomplete suggestions
  const fetchAutocomplete = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/api/search/autocomplete`, {
        params: { q: query },
      });

      // Validate response data
      const validatedData = {
        products: (response.data.products || []).filter((p) => p && p.id),
        categories: response.data.categories || [],
      };

      setSuggestions(validatedData);
      setShowAutocomplete(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions({ products: [], categories: [] });
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setShowAutocomplete(false);
    performSearch();
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: "1" }));
  };

  // Apply filters
  const applyFilters = () => {
    performSearch();
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      inStock: true,
      sort: "relevance",
      page: "1",
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage.toString() }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle product click with validation
  const handleProductClick = (productId) => {
    if (!productId) {
      console.error("Invalid product ID");
      return;
    }
    navigate(`/product/${productId}`);
  };

  // Re-run search when filters change
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [filters.page]);

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <form
          onSubmit={handleSearch}
          className={styles.searchForm}
          ref={autocompleteRef}
        >
          <div className={styles.searchInputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() =>
                searchQuery.length >= 2 && setShowAutocomplete(true)
              }
              placeholder="Search for products..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions({ products: [], categories: [] });
                }}
                className={styles.clearBtn}
              >
                <FiX />
              </button>
            )}
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>

          {/* Autocomplete Dropdown */}
          {showAutocomplete &&
            (suggestions.products.length > 0 ||
              suggestions.categories.length > 0) && (
              <div className={styles.autocomplete}>
                {suggestions.categories.length > 0 && (
                  <div className={styles.autocompleteSection}>
                    <h4>Categories</h4>
                    {suggestions.categories.map((category, idx) => (
                      <div
                        key={idx}
                        className={styles.autocompleteItem}
                        onClick={() => {
                          handleFilterChange("category", category);
                          setShowAutocomplete(false);
                          performSearch();
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className={styles.autocompleteSection}>
                    <h4>Products</h4>
                    {suggestions.products.map((product) => (
                      <div
                        key={product.id}
                        className={styles.autocompleteProduct}
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.name} />
                        )}
                        <div>
                          <div className={styles.productName}>
                            {product.name}
                          </div>
                          <div className={styles.productPrice}>
                            ₦{parseInt(product.price).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </form>

        {/* Filter Toggle */}
        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filters
          {Object.values(filters).filter(
            (v) => v && v !== "relevance" && v !== "1" && v !== true
          ).length > 0 && (
            <span className={styles.filterBadge}>
              {
                Object.values(filters).filter(
                  (v) => v && v !== "relevance" && v !== "1" && v !== true
                ).length
              }
            </span>
          )}
        </button>
      </div>

      <div className={styles.content}>
        {/* Filters Sidebar */}
        <div
          className={`${styles.sidebar} ${
            showFilters ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className={styles.closeSidebar}
            >
              <FiX />
            </button>
          </div>

          {/* Sort */}
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className={styles.select}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Category */}
          {facets?.categories && facets.categories.length > 0 && (
            <div className={styles.filterGroup}>
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                {facets.categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.key} ({cat.doc_count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <label>Price Range</label>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className={styles.priceInput}
              />
            </div>
            {facets?.priceRanges && facets.priceRanges.length > 0 && (
              <div className={styles.priceRanges}>
                {facets.priceRanges.map((range) => (
                  <div key={range.key} className={styles.priceRangeOption}>
                    {range.key} ({range.doc_count})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className={styles.filterGroup}>
            <label>Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className={styles.select}
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & up</option>
              <option value="3">3★ & up</option>
              <option value="2">2★ & up</option>
            </select>
          </div>

          {/* In Stock */}
          <div className={styles.filterGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) =>
                  handleFilterChange("inStock", e.target.checked)
                }
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Actions */}
          <div className={styles.filterActions}>
            <button onClick={applyFilters} className={styles.applyBtn}>
              Apply Filters
            </button>
            <button onClick={clearFilters} className={styles.clearBtn}>
              Clear All
            </button>
          </div>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {/* Results Header */}
          {pagination && (
            <div className={styles.resultsHeader}>
              <p>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Searching...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && products.length === 0 && searchQuery && (
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>

              <div className={styles.pageNumbers}>
                {[...Array(Math.min(pagination.pages, 5))].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`${styles.pageNum} ${
                        pagination.page === pageNum ? styles.active : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
