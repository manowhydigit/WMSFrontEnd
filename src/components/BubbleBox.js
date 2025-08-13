import React, { useEffect } from 'react';
import './logintest.css'; // Import the CSS for the bubbles

const BubbleBox = () => {
  // Generate an array of 40 bubbles dynamically
  const bubbles = Array.from({ length: 40 }, (_, index) => (
    <div
      key={index}
      className="bubble"
      style={{
        left: index <= 19 ? `${5 * index}%` : `${-5 * index + 200}%`,
        width: `${Math.random() * 10 + 10}px`,  // Random bubble size between 10px and 20px
        height: `${Math.random() * 10 + 10}px`,
        animationDelay: `${Math.random() * 10}s`,  // Random animation delay
        animationDuration: `${Math.random() * 20 + 10}s`,  // Random animation duration
      }}
    />
  ));

  return <div className="bubble-box">{bubbles}</div>;
};

export default BubbleBox;
