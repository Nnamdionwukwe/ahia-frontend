import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import FlashSaleFeaturedCard from "../FlashSaleFeaturedCard/FlashSaleFeaturedCard";
import styles from "./FlashSaleSection.module.css";

const FlashSaleSection = ({
  activeFlashSales,
  activeSeasonalSales,
  flashSaleProducts,
  seasonalSaleProducts,
}) => {
  const navigate = useNavigate();

  const allSales = [
    ...(activeFlashSales || []).map((sale) => ({ ...sale, type: "flash" })),
    ...(activeSeasonalSales || []).map((sale) => ({
      ...sale,
      type: "seasonal",
    })),
  ];

  const getSaleProducts = (sale) =>
    sale.type === "flash"
      ? flashSaleProducts?.[sale.id] || []
      : seasonalSaleProducts?.[sale.id] || [];

  if (allSales.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Active Sales</h3>
        <p>Check back soon for amazing deals!</p>
        <button
          onClick={() => navigate("/flash-sales")}
          className={styles.checkUpcomingBtn}
        >
          View Upcoming Sales
        </button>
      </div>
    );
  }

  const salesWithProducts = allSales.filter(
    (sale) => getSaleProducts(sale).length > 0,
  );

  if (salesWithProducts.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Products Available</h3>
        <p>Sales are active but products are sold out!</p>
        <button
          onClick={() => navigate("/flash-sales")}
          className={styles.checkUpcomingBtn}
        >
          View All Sales
        </button>
      </div>
    );
  }

  // Dynamic grid class based on number of sales
  const gridClass =
    salesWithProducts.length === 1
      ? styles.featuredGridSingle
      : salesWithProducts.length === 2
        ? styles.featuredGridDouble
        : styles.featuredGridMulti;

  return (
    <div className={styles.flashSaleContainer}>
      <div className={gridClass}>
        {salesWithProducts.map((sale) => {
          const featuredProduct = getSaleProducts(sale)[0];
          if (!featuredProduct) return null;

          return (
            <FlashSaleFeaturedCard
              key={`${sale.type}-${sale.id}`}
              sale={sale}
              featuredProduct={featuredProduct}
              saleType={sale.type}
            />
          );
        })}
      </div>

      {salesWithProducts.length > 1 && (
        <div className={styles.footerCTA}>
          <button
            onClick={() => navigate("/flash-sales")}
            className={styles.viewAllSalesBtn}
          >
            <Flame size={20} />
            Browse All Sales
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashSaleSection;
