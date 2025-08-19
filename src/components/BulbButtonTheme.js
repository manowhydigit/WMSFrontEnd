import React, { useState, useEffect } from "react";
import "./BulbButtonTheme.css";
import { useNavigate } from "react-router-dom";

const BulbButtonTheme = () => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(
    localStorage.getItem("theme") === "dark"
  ); // Initialize state based on the saved theme

  const toggleTheme = () => {
    const newTheme = isChecked ? "light" : "dark"; // Toggle between light and dark theme
    setIsChecked(!isChecked); // Toggle the checkbox state
    localStorage.setItem("theme", newTheme); // Save the theme to localStorage
  };

  useEffect(() => {
    const theme = isChecked ? "dark" : "light";
    if (theme === "dark") {
      // Apply dark mode styles
      document.body.style.backgroundColor = "#5D576B";
      document.body.style.color = "#fff"; // White text for dark mode
    } else {
      // Apply light mode styles
      document.body.style.backgroundColor = "#fff"; // Light background for the body
      document.body.style.color = "#000"; // Black text for light mode
    }
  }, [isChecked]); // Dependency array to re-
  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/Reports");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: "-20px" }}>
      <main style={{ display: "flex", alignItems: "center" }}>
        <p style={{ fontSize: "16px", marginRight: "8px" }}>Light</p>
        <input
          className="l"
          type="checkbox"
          onChange={toggleTheme}
          checked={isChecked}
          style={{ marginRight: "10px" }}
        />

        <p style={{ fontSize: "16px", marginLeft: "2px" }}>Dark</p>
      </main>
    </div>
  );
};

export default BulbButtonTheme;
