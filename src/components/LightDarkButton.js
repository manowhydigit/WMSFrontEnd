import React, { useState, useEffect } from "react";
import "./LightDarkButton.css";
import { Directions } from "@mui/icons-material";

const LightDarkButton = () => {
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
  }, [isChecked]); // Dependency array to re-run effect when `isChecked` changes

  return (
    <div style={{ display: "flex" }}>
      <p style={{ fontSize: "16px" }}>Light</p> &nbsp;&nbsp;
      <input
        id="checkboxInput"
        type="checkbox"
        checked={isChecked}
        onChange={toggleTheme} // Call toggleTheme when checkbox is clicked
      />
      <label
        className="toggleSwitch"
        htmlFor="checkboxInput"
        style={{ marginTop: "7px" }}
      ></label>
      &nbsp;&nbsp;&nbsp;
      <p style={{ fontSize: "16px" }}>Dark</p> &nbsp;&nbsp;
    </div>
  );
};

export default LightDarkButton;
