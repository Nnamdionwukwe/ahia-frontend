import React, { useState, useEffect } from "react";
import styles from "./ProfileCard.module.css";

const ProfileCard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check user's system preference and local storage on mount
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || (savedTheme === null && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add(styles.darkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add(styles.darkMode);
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove(styles.darkMode);
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div>
      <button onClick={toggleDarkMode}>
        Switch to {isDarkMode ? "Light" : "Dark"} Mode
      </button>
      <div className={styles.profileCard}>
        {/* Component content goes here, using classes from the CSS module */}
        <div className={styles.header}>
          {/* ... profile image, name, stats ... */}
          <h2>Nnamdi Onwukwe</h2>
        </div>
        {/* ... reviews section ... */}
      </div>
    </div>
  );
};

export default ProfileCard;
