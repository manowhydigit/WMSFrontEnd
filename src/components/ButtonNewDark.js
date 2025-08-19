import React from "react";
import "./ButtonNewDark.css";
import { useNavigate } from "react-router-dom";

const ButtonNewDark = () => {
  const navigate = useNavigate();
  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/Reports");
  };
  return (
    <button
      class="button"
      onClick={handleImageClick}
      style={{ marginTop: "-40px", marginBotton: "50px" }}
    >
      Back
    </button>
  );
};

export default ButtonNewDark;
