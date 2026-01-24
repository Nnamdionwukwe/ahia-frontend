import React from "react";
import { ShoppingCart, ChevronRight } from "lucide-react";
import styles from "./MainContent.module.css";

const MainContent = ({
  shopByCategory,
  products,
  onAddToCart,
  sortBy,
  onSortChange,
}) => {
  return (
    <main className={styles.mainContent}>
      {/* Shop by Category Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shop by category</h2>
        <div className={styles.categoryGrid}>
          {shopByCategory.map((cat, idx) => (
            <div key={idx} className={styles.categoryCard}>
              {cat.hot && <span className={styles.hotBadge}>HOT</span>}
              <div className={styles.categoryIcon}>{cat.icon}</div>
              <p className={styles.categoryName}>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Items Section */}
      <section className={styles.section}>
        <div className={styles.trendingHeader}>
          <h2 className={styles.sectionTitle}>Trending items</h2>
          <button className={styles.sortButton} onClick={onSortChange}>
            Sort by <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              {product.hot && (
                <div className={styles.productBadge}>
                  Product Operation Instructions
                </div>
              )}

              <div className={styles.productImageContainer}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
                <button
                  onClick={() => onAddToCart(product)}
                  className={styles.addToCartBtn}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart size={16} />
                </button>
              </div>

              <div className={styles.productInfo}>
                {product.rating && (
                  <div className={styles.rating}>
                    <span className={styles.stars}>
                      {"⭐".repeat(Math.floor(product.rating))}
                    </span>
                    <span className={styles.reviewCount}>
                      {product.reviews}
                    </span>
                  </div>
                )}

                <div className={styles.productName}>{product.name}</div>

                <div className={styles.priceContainer}>
                  <span className={styles.price}>
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.sold && (
                    <span className={styles.soldCount}>
                      {product.sold >= 1000
                        ? `${Math.floor(product.sold / 1000)}K+`
                        : product.sold}{" "}
                      sold
                    </span>
                  )}
                </div>

                {product.discount && (
                  <div className={styles.discountBadge}>
                    {product.discount}% OFF
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default MainContent;
