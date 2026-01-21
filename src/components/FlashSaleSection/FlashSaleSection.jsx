import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import FlashSaleFeaturedCard from "../FlashSaleFeaturedCard/FlashSaleFeaturedCard";
import styles from "./FlashSaleSection.module.css";

const FlashSaleSection = ({ activeFlashSales, flashSaleProducts }) => {
  const navigate = useNavigate();

  const handleViewAll = (saleId) => {
    navigate(`/flash-sales/${saleId}`);
  };

  const handleViewAllSales = () => {
    navigate("/flash-sales");
  };

  // Handle null or undefined cases
  if (!activeFlashSales || activeFlashSales.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Active Flash Sales</h3>
        <p>Check back soon for amazing deals!</p>
        <button
          onClick={handleViewAllSales}
          className={styles.checkUpcomingBtn}
        >
          View Upcoming Sales
        </button>
      </div>
    );
  }

  // Filter out sales with no products
  const salesWithProducts = activeFlashSales.filter((sale) => {
    const products = flashSaleProducts?.[sale.id] || [];
    return products.length > 0;
  });

  if (salesWithProducts.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Products Available</h3>
        <p>Flash sales are active but products are sold out!</p>
        <button
          onClick={handleViewAllSales}
          className={styles.checkUpcomingBtn}
        >
          View All Flash Sales
        </button>
      </div>
    );
  }

  return (
    <div className={styles.flashSaleContainer}>
      {/* Section Header */}

      {/* Flash Sales Grid - One Product Per Sale */}
      <div className={styles.featuredGrid}>
        {salesWithProducts.map((sale) => {
          const products = flashSaleProducts[sale.id] || [];

          console.log(`Rendering Flash Sale ${sale.id}:`, {
            title: sale.title,
            productsCount: products.length,
            products,
          });

          // Get the first product as featured product
          const featuredProduct = products[0];

          // Additional safety check
          if (!featuredProduct) {
            console.warn(`No featured product for sale ${sale.id}`);
            return null;
          }

          return (
            <FlashSaleFeaturedCard
              key={sale.id}
              sale={sale}
              featuredProduct={featuredProduct}
            />
          );
        })}
      </div>

      {/* Footer CTA - View all flash sales */}
      {salesWithProducts.length > 1 && (
        <div className={styles.footerCTA}>
          <button
            onClick={handleViewAllSales}
            className={styles.viewAllSalesBtn}
          >
            <Flame size={20} />
            Browse All Flash Sales
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashSaleSection;
