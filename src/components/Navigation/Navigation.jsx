import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import styles from "./Navigation.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Navigation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentCategory = searchParams.get("category");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [categories]);

  const fetchCategories = async () => {
    try {
      // Use the dedicated categories endpoint from your productController
      const response = await axios.get(`${API_URL}/api/products/categories`);

      console.log("Categories API Response:", response.data);

      // The controller returns: { categories: [...], total: number }
      const categoriesData = response.data.categories || [];

      // Map the response to the format needed for navigation
      const categoryList = categoriesData.map((cat) => ({
        id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase(),
        count: cat.count,
      }));

      // Add "All" category at the beginning
      setCategories([
        { id: "all", name: "All", slug: "", count: null },
        ...categoryList,
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);

      // Fallback: fetch from products endpoint
      try {
        const response = await axios.get(`${API_URL}/api/products?limit=100`);

        // Handle different response structures
        const products = response.data.data || response.data.products || [];

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ];

        // Create category objects
        const categoryList = uniqueCategories.map((cat) => ({
          id: cat.toLowerCase().replace(/\s+/g, "-"),
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " "),
          slug: cat.toLowerCase(),
        }));

        setCategories([{ id: "all", name: "All", slug: "" }, ...categoryList]);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        // Use hardcoded fallback based on your database
        setCategories([
          { id: "all", name: "All", slug: "" },
          { id: "electronics", name: "Electronics", slug: "electronics" },
          { id: "fashion", name: "Fashion", slug: "fashion" },
          {
            id: "home-kitchen",
            name: "Home & Kitchen",
            slug: "home & kitchen",
          },
          { id: "sports", name: "Sports", slug: "sports" },
          { id: "clothing", name: "Clothing", slug: "clothing" },
          { id: "beauty", name: "Beauty", slug: "beauty" },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleCategoryClick = (slug) => {
    if (slug) {
      navigate(`/?category=${encodeURIComponent(slug)}`);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <nav className={styles.nav}>
        <div className={styles.loading}>Loading categories...</div>
      </nav>
    );
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.wrapper}>
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
        )}

        {/* Categories Container */}
        <div
          ref={scrollRef}
          className={styles.container}
          onScroll={checkScrollButtons}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`${styles.link} ${
                currentCategory === cat.slug ||
                (!currentCategory && cat.slug === "")
                  ? styles.active
                  : ""
              }`}
            >
              {cat.name}
              {cat.count !== null && cat.count !== undefined && (
                <span className={styles.count}> ({cat.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
