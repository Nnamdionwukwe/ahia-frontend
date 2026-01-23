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

  const handleViewAll = (saleId) => {
    navigate(`/flash-sales/${saleId}`);
  };

  const handleViewAllSales = () => {
    navigate("/flash-sales");
  };

  // Combine flash sales and seasonal sales
  const allSales = [
    ...(activeFlashSales || []).map((sale) => ({
      ...sale,
      type: "flash",
    })),
    ...(activeSeasonalSales || []).map((sale) => ({
      ...sale,
      type: "seasonal",
    })),
  ];

  // Get products for each sale
  const getSaleProducts = (sale) => {
    if (sale.type === "flash") {
      return flashSaleProducts?.[sale.id] || [];
    } else {
      return seasonalSaleProducts?.[sale.id] || [];
    }
  };

  // Handle null or undefined cases
  if (!allSales || allSales.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Active Sales</h3>
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
  const salesWithProducts = allSales.filter((sale) => {
    const products = getSaleProducts(sale);
    return products.length > 0;
  });

  if (salesWithProducts.length === 0) {
    return (
      <div className={styles.noSalesContainer}>
        <Flame className={styles.noSalesIcon} size={48} />
        <h3>No Products Available</h3>
        <p>Sales are active but products are sold out!</p>
        <button
          onClick={handleViewAllSales}
          className={styles.checkUpcomingBtn}
        >
          View All Sales
        </button>
      </div>
    );
  }

  return (
    <div className={styles.flashSaleContainer}>
      {/* Section Header */}

      {/* Sales Grid - One Product Per Sale */}
      <div className={styles.featuredGrid}>
        {salesWithProducts.map((sale) => {
          const products = getSaleProducts(sale);

          console.log(
            `Rendering ${sale.type === "flash" ? "Flash" : "Seasonal"} Sale ${
              sale.id
            }:`,
            {
              title: sale.title || sale.name,
              type: sale.type,
              productsCount: products.length,
              products,
            }
          );

          // Get the first product as featured product
          const featuredProduct = products[0];

          // Additional safety check
          if (!featuredProduct) {
            console.warn(`No featured product for sale ${sale.id}`);
            return null;
          }

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

      {/* Footer CTA - View all sales */}
      {salesWithProducts.length > 1 && (
        <div className={styles.footerCTA}>
          <button
            onClick={handleViewAllSales}
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
