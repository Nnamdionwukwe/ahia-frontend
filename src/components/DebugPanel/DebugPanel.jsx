// DebugPanel.jsx - Temporary component for debugging
import React from "react";

const DebugPanel = ({
  activeFlashSales,
  flashSaleProducts,
  activeSeasonalSales,
  seasonalSaleProducts,
  products,
}) => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "20px",
        width: "400px",
        maxHeight: "500px",
        overflow: "auto",
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "11px",
        fontFamily: "monospace",
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <h3 style={{ color: "#0ff", marginTop: 0 }}>🐛 Debug Panel</h3>

      <div
        style={{
          marginBottom: "15px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h4 style={{ color: "#f90", margin: "5px 0" }}>
          Flash Sales ({activeFlashSales.length})
        </h4>
        {activeFlashSales.length === 0 ? (
          <div style={{ color: "#f66" }}>❌ No flash sales found</div>
        ) : (
          activeFlashSales.map((sale, idx) => (
            <div
              key={sale.id}
              style={{ marginLeft: "10px", marginBottom: "8px" }}
            >
              <div style={{ color: "#ff0" }}>
                #{idx + 1}: {sale.title}
              </div>
              <div style={{ marginLeft: "10px", fontSize: "10px" }}>
                <div>ID: {sale.id}</div>
                <div>Status: {sale.status}</div>
                <div>
                  Products: {flashSaleProducts[sale.id]?.length || 0}
                  {flashSaleProducts[sale.id]?.length === 0 && (
                    <span style={{ color: "#f66" }}> ⚠️ EMPTY</span>
                  )}
                </div>
                {flashSaleProducts[sale.id]?.length > 0 && (
                  <div style={{ color: "#0f0" }}>
                    ✅ Has {flashSaleProducts[sale.id].length} products
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginBottom: "15px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h4 style={{ color: "#f90", margin: "5px 0" }}>
          Seasonal Sales ({activeSeasonalSales.length})
        </h4>
        {activeSeasonalSales.length === 0 ? (
          <div style={{ color: "#f66" }}>❌ No seasonal sales found</div>
        ) : (
          activeSeasonalSales.map((sale, idx) => (
            <div
              key={sale.id}
              style={{ marginLeft: "10px", marginBottom: "8px" }}
            >
              <div style={{ color: "#ff0" }}>
                #{idx + 1}: {sale.name}
              </div>
              <div style={{ marginLeft: "10px", fontSize: "10px" }}>
                <div>ID: {sale.id}</div>
                <div>
                  Products: {seasonalSaleProducts[sale.id]?.length || 0}
                  {seasonalSaleProducts[sale.id]?.length === 0 && (
                    <span style={{ color: "#f66" }}> ⚠️ EMPTY</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h4 style={{ color: "#f90", margin: "5px 0" }}>
          Regular Products ({products.length})
        </h4>
        {products.length === 0 ? (
          <div style={{ color: "#f66" }}>❌ No products found</div>
        ) : (
          <div style={{ color: "#0f0" }}>
            ✅ {products.length} products loaded
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          paddingTop: "10px",
          borderTop: "1px solid #333",
        }}
      >
        <h4 style={{ color: "#f90", margin: "5px 0" }}>API Endpoints</h4>
        <div style={{ fontSize: "10px" }}>
          <div>Flash Sales: /api/flash-sales/active</div>
          <div>Seasonal: /api/seasonal-sales/active</div>
          <div>Products: /api/products</div>
        </div>
      </div>

      <button
        onClick={() => {
          console.log("=== FULL STATE DUMP ===");
          console.log("Active Flash Sales:", activeFlashSales);
          console.log("Flash Sale Products:", flashSaleProducts);
          console.log("Active Seasonal Sales:", activeSeasonalSales);
          console.log("Seasonal Sale Products:", seasonalSaleProducts);
          console.log("Regular Products:", products);
        }}
        style={{
          marginTop: "10px",
          padding: "8px",
          background: "#0f0",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          fontWeight: "bold",
        }}
      >
        📋 Log Full State to Console
      </button>
    </div>
  );
};

export default DebugPanel;
