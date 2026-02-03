// pages/Cart/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CartPage.module.css";
import useCartStore from "../../store/cartStore";
import CartItem from "../CartItem/CartItem";
import ManageCartModal from "../ManageCartModal/ManageCartModal";
import ShareCartModal from "../ShareCartModal/ShareCartModal";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    loading,
    selectedCount,
    totalCount,
    fetchCart,
    toggleSelectAll,
    removeSelected,
    getSelectedTotals,
    getAlmostSoldOutCount,
  } = useCartStore();

  const [showManageModal, setShowManageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const allSelected =
    items.length > 0 && items.every((item) => item.is_selected);
  const selectedTotals = getSelectedTotals();
  const almostGoneCount = getAlmostSoldOutCount();

  const handleCheckout = () => {
    if (selectedCount === 0) {
      alert("Please select items to checkout");
      return;
    }
    navigate("/checkout");
  };

  const handleManageCart = () => {
    setShowManageModal(true);
    setShowMenu(false);
  };

  const handleShareCart = () => {
    setShowShareModal(true);
    setShowMenu(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>

        <div className={styles.headerCenter}>
          <input
            type="checkbox"
            className={styles.selectAllCheckbox}
            checked={allSelected}
            onChange={toggleSelectAll}
          />

          <span className={styles.headerTitle}>All</span>

          <div className={styles.bottomLeft}>
            {selectedCount > 0 && (
              <button className={styles.removeButton} onClick={removeSelected}>
                Remove
              </button>
            )}
          </div>
        </div>
        <h1 className={styles.title}>Cart ({totalCount})</h1>
        <button
          className={styles.menuButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          ☰
        </button>

        {showMenu && (
          <div className={styles.dropdown}>
            <button onClick={handleManageCart}>Manage cart</button>
            <button onClick={handleShareCart}>Share cart</button>
          </div>
        )}
      </div>

      {/* Free Shipping Banner */}
      {items.length > 0 && (
        <div className={styles.freeShippingBanner}>
          <span className={styles.checkIcon}>✓</span>
          <span>Free shipping special for you</span>
          <span className={styles.limitedTime}>Limited-time</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button className={`${styles.filterTab} ${styles.active}`}>
          All({totalCount})
        </button>
        <button className={styles.filterTab}>
          <span className={styles.cartIcon}>🛒</span>
          Selected({selectedCount})
        </button>
      </div>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>🛒</div>
          <p>Your cart is empty</p>
          <button
            className={styles.shopNowButton}
            onClick={() => navigate("/")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className={styles.cartItems}>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Almost Sold Out Alert */}
      {almostGoneCount > 0 && (
        <div className={styles.almostGoneAlert}>
          <span className={styles.fireIcon}>🔥</span>
          <span>{almostGoneCount} items are almost gone!</span>
        </div>
      )}

      {/* Bottom Summary Bar */}
      {items.length > 0 && (
        <div className={styles.bottomBar}>
          <div className={styles.priceInfo}>
            {selectedTotals.discount > 0 && (
              <div className={styles.originalPrice}>
                ₦{selectedTotals.subtotal.toLocaleString()}
              </div>
            )}
            <div className={styles.finalPrice}>
              ₦{selectedTotals.total.toLocaleString()}
              {selectedTotals.discount > 0 && (
                <span className={styles.arrow}>↗</span>
              )}
            </div>
          </div>

          <div className={styles.bottomRight}>
            <button
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              {selectedTotals.discount > 0 && (
                <div className={styles.appliedDiscount}>
                  Applied ₦{selectedTotals.discount.toLocaleString()} off &
                  credit {/* Timer */}
                </div>
              )}
              <div className={styles.checkoutText}>
                <span className={styles.flashIcon}>⚡</span>
                Last day for {selectedTotals.discountPercentage}% off
              </div>
              <div className={styles.checkoutSubtext}>
                Checkout ({selectedCount}) | {/* Timer */}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showManageModal && (
        <ManageCartModal onClose={() => setShowManageModal(false)} />
      )}

      {showShareModal && (
        <ShareCartModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};

export default CartPage;
