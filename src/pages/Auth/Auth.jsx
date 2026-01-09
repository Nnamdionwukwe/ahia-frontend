// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import styles from "./Auth.module.css";

const Auth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState("login"); // login or signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    fullName: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { phoneNumber: formData.phoneNumber, password: formData.password }
          : {
              phoneNumber: formData.phoneNumber,
              password: formData.password,
              full_name: formData.fullName,
            };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const { user, tokens } = response.data;

      setAuth(user, tokens.accessToken, tokens.refreshToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/google/verify`, {
        idToken: credentialResponse.credential,
      });

      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.logo}>AHIA</h1>

        <h2>{mode === "login" ? "Sign In" : "Create Account"}</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Google Sign-In */}
        <div className={styles.googleSignin}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In failed")}
          />
        </div>

        <div className={styles.divider}>
          or {mode === "login" ? "sign in" : "sign up"} with phone
        </div>

        {/* Phone Form */}
        <form onSubmit={handlePhoneAuth}>
          {mode === "signup" && (
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+234-8101234567"
              disabled={loading}
              required
            />
            <small>Format: +country-number (e.g., +234-8101234567)</small>
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className={styles.toggle}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className={styles.toggleLink}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className={styles.toggleLink}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <p className={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
