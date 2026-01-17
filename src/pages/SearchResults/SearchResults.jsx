import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiFilter, FiX } from "react-icons/fi";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./SearchResults.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search parameters
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const rating = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "relevance";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const performSearch = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/search`, {
        params: {
          q: query,
          category,
          minPrice,
          maxPrice,
          rating,
          sort,
          page,
          limit: 20,
          inStock: true,
        },
      });

      setProducts(response.data.products || []);
      setFacets(response.data.facets);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 when filtering
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ q: query });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Searching...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back
        </button>
        <h1 className={styles.title}>
          {query ? `Results for "${query}"` : "Search Results"}
        </h1>
        {pagination && (
          <p className={styles.resultCount}>
            {pagination.total.toLocaleString()} results found
          </p>
        )}
      </div>

      {/* Filters Toggle (Mobile) */}
      <div className={styles.mobileFilterToggle}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterBtn}
        >
          <FiFilter /> Filters
        </button>
        <select
          value={sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className={styles.sortSelect}
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <div className={styles.content}>
        {/* Sidebar Filters */}
        <aside
          className={`${styles.sidebar} ${
            showFilters ? styles.showSidebar : ""
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h2>Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className={styles.closeSidebar}
            >
              <FiX />
            </button>
          </div>

          {/* Active Filters */}
          {(category || minPrice || maxPrice || rating) && (
            <div className={styles.activeFilters}>
              <button onClick={clearFilters} className={styles.clearAll}>
                Clear All
              </button>
            </div>
          )}

          {/* Categories */}
          {facets && facets.categories && facets.categories.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>Category</h3>
              {facets.categories.map((cat) => (
                <label key={cat.key} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.key}
                    onChange={() => updateFilter("category", cat.key)}
                  />
                  <span>
                    {cat.key} ({cat.doc_count})
                  </span>
                </label>
              ))}
              {category && (
                <button
                  onClick={() => updateFilter("category", "")}
                  className={styles.clearFilter}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Price Range */}
          {facets && facets.priceRanges && facets.priceRanges.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>Price Range</h3>
              {facets.priceRanges.map((range) => (
                <label key={range.key} className={styles.filterOption}>
                  <input type="checkbox" />
                  <span>
                    {range.key} ({range.doc_count})
                  </span>
                </label>
              ))}
              <div className={styles.customPrice}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className={styles.priceInput}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>
          )}

          {/* Rating */}
          {facets && facets.ratings && facets.ratings.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>Rating</h3>
              {facets.ratings.map((r) => (
                <label key={r.key} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="rating"
                    checked={rating === r.from?.toString()}
                    onChange={() => updateFilter("rating", r.from?.toString())}
                  />
                  <span>
                    {r.key} ({r.doc_count})
                  </span>
                </label>
              ))}
              {rating && (
                <button
                  onClick={() => updateFilter("rating", "")}
                  className={styles.clearFilter}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Brands */}
          {facets && facets.brands && facets.brands.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>Brand</h3>
              {facets.brands.slice(0, 10).map((brand) => (
                <label key={brand.key} className={styles.filterOption}>
                  <input type="checkbox" />
                  <span>
                    {brand.key} ({brand.doc_count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* Products Grid */}
        <main className={styles.main}>
          {products.length > 0 ? (
            <>
              <div className={styles.productsGrid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

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
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`${styles.pageNum} ${
                              pagination.page === pageNum
                                ? styles.activePage
                                : ""
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className={styles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h2>No results found</h2>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
