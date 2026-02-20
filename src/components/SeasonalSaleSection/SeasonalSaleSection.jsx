import React from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import SeasonalSaleFeaturedCard from "../SeasonalSaleFeaturedCard/SeasonalSaleFeaturedCard";
import styles from "./SeasonalSaleSection.module.css";

const SeasonalSaleSection = ({ activeSeasonalSales, seasonalSaleProducts }) => {
  const navigate = useNavigate();

  if (!activeSeasonalSales || activeSeasonalSales.length === 0) return null;

  const salesWithProducts = activeSeasonalSales.filter((sale) => {
    const products = seasonalSaleProducts?.[sale.id] || [];
    return products.length > 0;
  });

  if (salesWithProducts.length === 0) return null;

  // Dynamic grid class based on number of sales
  const gridClass =
    salesWithProducts.length === 1
      ? styles.featuredGridSingle
      : salesWithProducts.length === 2
        ? styles.featuredGridDouble
        : styles.featuredGridMulti;

  return (
    <div className={styles.seasonalSaleContainer}>
      <div className={gridClass}>
        {salesWithProducts.map((sale) => {
          const saleProducts = seasonalSaleProducts[sale.id] || [];
          const featuredProduct = saleProducts[0];
          if (!featuredProduct) return null;

          return (
            <SeasonalSaleFeaturedCard
              key={sale.id}
              sale={sale}
              featuredProduct={featuredProduct}
            />
          );
        })}
      </div>

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
