// ============================================
// 1. CartPage.jsx
// ============================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { items, total, itemCount, fetchCart, updateQuantity, removeItem } =
    useCartStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const loadCart = async () => {
      if (accessToken) {
        setLoading(true);
        await fetchCart(accessToken);
        setLoading(false);
      }
    };

    loadCart();
  }, [accessToken, isAuthenticated, navigate, fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    await updateQuantity(itemId, newQuantity);
    setUpdating((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Remove this item from cart?")) {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      await removeItem(itemId);
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const calculateItemPrice = (item) => {
    const price =
      item.base_price -
      (item.base_price * (item.discount_percentage || 0)) / 100;
    return price;
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <FiShoppingBag size={64} />
          <h2>Your Cart is Empty</h2>
          <p>Add items to get started!</p>
          <button onClick={() => navigate("/")} className={styles.shopBtn}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shopping Cart</h1>
        <span className={styles.itemCount}>{itemCount} items</span>
      </div>

      <div className={styles.content}>
        {/* Cart Items */}
        <div className={styles.itemsSection}>
          {items.map((item) => {
            const itemPrice = calculateItemPrice(item);
            const itemTotal = itemPrice * item.quantity;
            const isUpdating = updating[item.id];

            return (
              <div
                key={item.id}
                className={`${styles.cartItem} ${
                  isUpdating ? styles.updating : ""
                }`}
              >
                {/* Product Image */}
                <div
                  className={styles.imageContainer}
                  onClick={() => navigate(`/product/${item.product_id}`)}
                >
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className={styles.imagePlaceholder}>No Image</div>
                  )}
                </div>

                {/* Product Details */}
                <div className={styles.itemDetails}>
                  <h3
                    className={styles.itemName}
                    onClick={() => navigate(`/product/${item.product_id}`)}
                  >
                    {item.name}
                  </h3>

                  {/* Variant Info */}
                  <div className={styles.variantInfo}>
                    {item.color && (
                      <span className={styles.variant}>
                        <strong>Color:</strong> {item.color}
                      </span>
                    )}
                    {item.size && (
                      <span className={styles.variant}>
                        <strong>Size:</strong> {item.size}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className={styles.priceSection}>
                    {item.discount_percentage > 0 && (
                      <span className={styles.originalPrice}>
                        ₦{parseInt(item.base_price).toLocaleString()}
                      </span>
                    )}
                    <span className={styles.currentPrice}>
                      ₦{parseInt(itemPrice).toLocaleString()}
                    </span>
                    {item.discount_percentage > 0 && (
                      <span className={styles.discount}>
                        -{item.discount_percentage}%
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls - Mobile */}
                  <div className={styles.quantityControlsMobile}>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className={styles.quantityBtn}
                    >
                      <FiMinus />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={isUpdating}
                      className={styles.quantityBtn}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                {/* Quantity Controls - Desktop */}
                <div className={styles.quantityControlsDesktop}>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={isUpdating || item.quantity <= 1}
                    className={styles.quantityBtn}
                  >
                    <FiMinus />
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={isUpdating}
                    className={styles.quantityBtn}
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Item Total */}
                <div className={styles.itemTotal}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalPrice}>
                    ₦{parseInt(itemTotal).toLocaleString()}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isUpdating}
                  className={styles.removeBtn}
                  title="Remove item"
                >
                  <FiTrash2 />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal ({itemCount} items)</span>
              <span>₦{parseInt(total).toLocaleString()}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>Free</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>₦0</span>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                ₦{parseInt(total).toLocaleString()}
              </span>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutBtn}>
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/")}
              className={styles.continueBtn}
            >
              Continue Shopping
            </button>
          </div>

          {/* Promo Banner */}
          <div className={styles.promoBanner}>
            <h3>🎉 Free Shipping</h3>
            <p>On all orders - Limited time offer!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

// ============================================
// 2. Add to App.jsx
// ============================================
/*
import CartPage from "./pages/Cart/CartPage";

// In your Routes:
<Route 
  path="/cart" 
  element={isAuthenticated ? <CartPage /> : <Navigate to="/auth" />} 
/>
*/

// ============================================
// 3. Update ProductCard to add items to cart
// ============================================
/*
// In ProductCard.jsx, update the "Add to Cart" button:

import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!accessToken) {
      alert('Please login to add items to cart');
      return;
    }
    
    // Assuming product has a default variant
    const success = await addItem(product.variant_id, 1, accessToken);
    
    if (success) {
      // Show success message
      alert('Added to cart!');
    }
  };
  
  return (
    // ... your existing code
    <button className={styles.button} onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
};
*/
