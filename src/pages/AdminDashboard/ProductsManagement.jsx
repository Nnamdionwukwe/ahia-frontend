import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import styles from "./ProductsManagement.module.css";
import useAuthStore from "../../store/authStore";
import ProductEditModal from "./ProductEditModal";
import ProductViewModal from "./ProductViewModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductsManagement = () => {
  const { accessToken } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
      };

      const response = await axios.get(`${API_URL}/api/products`, {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Product deleted successfully!");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    fetchProducts();
  };

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    fetchProducts();
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "#f44336" };
    if (stock < 10) return { label: "Low Stock", color: "#ff9800" };
    return { label: "In Stock", color: "#4caf50" };
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Products Management</h2>
          <p>{filteredProducts.length} products</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Package size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Total Products</p>
            <h3 className={styles.statValue}>{products.length}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>In Stock</p>
            <h3 className={styles.statValue}>
              {products.filter((p) => p.stock_quantity > 0).length}
            </h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <AlertCircle size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Low Stock</p>
            <h3 className={styles.statValue}>
              {
                products.filter(
                  (p) => p.stock_quantity < 10 && p.stock_quantity > 0,
                ).length
              }
            </h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <Package size={24} className={styles.statIcon} />
          <div>
            <p className={styles.statLabel}>Out of Stock</p>
            <h3 className={styles.statValue}>
              {products.filter((p) => p.stock_quantity === 0).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.categoryFilter}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        <button className={styles.refreshButton} onClick={fetchProducts}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading products...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className={styles.productImage}
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div>
                          <p className={styles.productName}>{product.name}</p>
                          <span className={styles.productId}>
                            {product.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {product.category}
                      </span>
                    </td>
                    <td>
                      <div className={styles.priceCell}>
                        <p className={styles.price}>
                          {formatCurrency(product.price)}
                        </p>
                        {product.discount_percentage > 0 && (
                          <span className={styles.discount}>
                            {product.discount_percentage}% off
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.stockNumber}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.stockStatus}
                        style={{ backgroundColor: stockStatus.color }}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.ratingCell}>
                        <span className={styles.rating}>
                          ⭐ {product.rating || 0}
                        </span>
                        <span className={styles.reviews}>
                          ({product.total_reviews || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => setViewProduct(product)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => setSelectedProduct(product)}
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <Package size={64} />
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {(selectedProduct || showCreateModal) && (
        <ProductEditModal
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setShowCreateModal(false);
          }}
          onSave={selectedProduct ? handleProductUpdated : handleProductCreated}
        />
      )}

      {viewProduct && (
        <ProductViewModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsManagement;
