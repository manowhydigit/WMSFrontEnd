import { Margin } from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ButtonTrans = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const btnStyle = {
    border: "none",
    width: "8em",
    height: "3em",
    borderRadius: "3em",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    background: isHovered ? "linear-gradient(0deg, #6899fe, blue)" : "#1c1a1c",
    cursor: "pointer",
    transition: "all 450ms ease-in-out",
    boxShadow: isHovered
      ? "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4), inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 4px rgba(255, 255, 255, 0.2), 0px 0px 180px 0px #9917ff"
      : "none",
    transform: isHovered ? "translateY(-2px)" : "none",
    // marginTop: "-40px",
    // marginBotton: "50px",
  };

  const sparkleStyle = {
    fill: isHovered ? "white" : "#aaaaaa",
    transition: "all 800ms ease",
    transform: isHovered ? "scale(1.2)" : "scale(1)",
  };

  const textStyle = {
    fontWeight: "600",
    color: isHovered ? "white" : "#aaaaaa",
    fontSize: "medium",
  };
  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/Transactions");
  };

  return (
    <button
      style={btnStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleImageClick}
    >
      <svg
        style={sparkleStyle}
        className="sparkle"
        id="Layer_1"
        data-name="Layer 1"
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        width="24"
        height="24"
      >
        <path
          clipRule="evenodd"
          d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z"
          fillRule="evenodd"
        ></path>
        <path
          clipRule="evenodd"
          d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z"
          fillRule="evenodd"
        ></path>
      </svg>

      <span style={textStyle} className="text">
        Back
      </span>
    </button>
  );
};

export default ButtonTrans;
