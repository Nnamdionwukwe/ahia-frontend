import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import useThemeStore from "./store/themeStore";
import useAuthStore from "./store/authStore";

// Pages
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Settings from "./pages/Settings/Settings";
import ProductDetail from "./components/ProductDetail";
import WishlistPage from "./pages/WishListPage/WishlistPage";
import SearchPage from "./pages/Search/SearchPage";
import CartPage from "./pages/Cart/CartPage";

import "./App.css";
import SearchHeader from "./components/SearchHeader/SearchHeader";
import FlashSalesList from "./pages/FlashSalesList/FlashSalesList";
import FlashSaleDetail from "./pages/FlashSaleDetail";
import SeasonalSaleDetail from "./pages/SeasonalSaleDetails/SeasonalSaleDetails";
import SeasonalSalesList from "./pages/SeasonalSalesList/SeasonalSalesList";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import Profile from "./pages/Accountprofile/Profile";
import ProfileCard from "./pages/Accountprofile/ProfileCard";
import CheckoutPage from "./components/CheckoutPage/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage/OrderSuccessPage";
import OrderDetailsPage from "./pages/OrdersPage/OrderDetailsPage";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import BankTransferPayment from "./pages/Banktransferpayment/Banktransferpayment";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Notifications from "./components/Notifications/Notifications";

const App = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    setTheme(savedTheme);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div className={isDark ? "dark-mode" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/wishlist"
              element={
                isAuthenticated ? <WishlistPage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="/cart"
              element={isAuthenticated ? <CartPage /> : <Navigate to="/auth" />}
            />

            <Route
              path="/checkout"
              element={
                isAuthenticated ? <CheckoutPage /> : <Navigate to="/auth" />
              }
            />
            <Route path="/bank-transfer" element={<BankTransferPayment />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-success-page" element={<OrderSuccessPage />} />
            <Route path="/flash-sales" element={<FlashSalesList />} />

            <Route path="/seasonal-sales" element={<SeasonalSalesList />} />

            <Route path="/flash-sales/:saleId" element={<FlashSaleDetail />} />

            <Route
              path="/seasonal-sales/:id"
              element={<SeasonalSaleDetail />}
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/searchheader" element={<SearchHeader />} />
            <Route path="/categoryPage" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />}
            />

            <Route
              path="/account-profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
            />
            <Route
              path="/admin-dashboard"
              element={
                isAuthenticated ? <AdminDashboard /> : <Navigate to="/auth" />
              }
            />

            <Route
              path="/profile-card"
              element={
                isAuthenticated ? <ProfileCard /> : <Navigate to="/auth" />
              }
            />

            <Route
              path="/notifications"
              element={
                isAuthenticated ? <Notifications /> : <Navigate to="/auth" />
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
