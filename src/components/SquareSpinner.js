import React from 'react';
import './SquareSpinner.css'; // Import the CSS file

const SquareSpinner = () => {
  return (
    <div className="spinner-square">
      <div className="square-1 square"></div>
      <div className="square-2 square"></div>
      <div className="square-3 square"></div>
    </div>
  );
};

export default SquareSpinner;
