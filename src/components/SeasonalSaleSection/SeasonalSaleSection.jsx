import React from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import SeasonalSaleFeaturedCard from "../SeasonalSaleFeaturedCard/SeasonalSaleFeaturedCard";
import styles from "./SeasonalSaleSection.module.css";

const SeasonalSaleSection = ({ activeSeasonalSales, seasonalSaleProducts }) => {
  const navigate = useNavigate();

  const handleViewAll = (saleId) => {
    navigate(`/seasonal-sales/${saleId}`);
  };

  // Handle null or undefined cases
  if (!activeSeasonalSales || activeSeasonalSales.length === 0) {
    return null; // Don't show anything if no seasonal sales
  }

  // Filter out sales with no products
  const salesWithProducts = activeSeasonalSales.filter((sale) => {
    const products = seasonalSaleProducts?.[sale.id] || [];
    return products.length > 0;
  });

  if (salesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className={styles.seasonalSaleContainer}>
      {/* Featured Grid - Shows one product per seasonal sale */}
      <div className={styles.featuredGrid}>
        {salesWithProducts.map((sale) => {
          const saleProducts = seasonalSaleProducts[sale.id] || [];

          // Get only the featured (first) product
          const featuredProduct = saleProducts[0];

          if (!featuredProduct) {
            console.warn(`No featured product for seasonal sale ${sale.id}`);
            return null;
          }

          return (
            <SeasonalSaleFeaturedCard
              key={sale.id}
              sale={sale}
              featuredProduct={featuredProduct}
            />
          );
        })}
      </div>

      {/* Footer CTA - View all seasonal sales if multiple */}
      {salesWithProducts.length > 1 && (
        <div className={styles.viewAllContainer}>
          <button
            onClick={() => navigate("/seasonal-sales")}
            className={styles.viewAllBtn}
          >
            <Tag size={20} />
            Browse All Seasonal Sales
          </button>
        </div>
      )}
    </div>
  );
};

export default SeasonalSaleSection;
