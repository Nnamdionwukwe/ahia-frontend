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
// Components
import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
// Pages
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Settings from "./pages/Settings/Settings";
import "./App.css";
import ProductDetail from "./components/ProductDetail";
import WishlistButton from "./components/WishlistButton/WishlistButton";
import WishlistPage from "./pages/WishListPage/WishlistPage";

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
          <Header />
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/wishlist"
              element={
                isAuthenticated ? <WishlistPage /> : <Navigate to="/auth" />
              }
            />
            {/* <Route path="/wishlist" element={<WishlistButton />} /> */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};
export default App;
