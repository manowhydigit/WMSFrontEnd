import React, { useState, useEffect } from "react";
import "./TiltCard.css"; // Import your styles here

const TiltCard = () => {
  const [tilted, setTilted] = useState(false);

  const toggleTilt = () => {
    setTilted((prev) => !prev);
  };

  useEffect(() => {
    if (window.location.pathname.match(/fullcpgrid/i)) {
      setTimeout(() => {
        setTilted(true);
      }, 1000);
    }
  }, []);

  return (
    <div
      className={`background ${tilted ? "details" : ""}`}
      onClick={toggleTilt}
      onTouchStart={toggleTilt}
    >
      <div className="card">
        <div className="photo"></div>
        <h2></h2>
        <p></p>
        <div className="chart">
          <div className="bar bar1">
            <span>20,000</span>
          </div>
          <div className="bar bar2">
            <span>10,000</span>
          </div>
          <div className="bar bar3">
            <span>15,000</span>
          </div>
          <div className="bar bar4">
            <span>24,000</span>
          </div>
          <div className="bar bar5">
            <span>7,000</span>
          </div>
          <div className="bar bar6">
            <span>7,000</span>
          </div>
          <div className="bar bar7">
            <span>10,000</span>
          </div>
        </div>
        <h3>93,000</h3>
      </div>
      {/* <div className="info">Click to toggle details view</div> */}
    </div>
  );
};

export default TiltCard;
