import React from "react";
// import './ExpenseCardItem.css'; // Separate CSS for styling the card

const ExpenseCardItem = ({ expense, onClick }) => {
  // Inline styles for the card
  const cardStyle = {
    backgroundColor: "#445b72",
    padding: "15px",
    margin: "10px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
    borderRadius: "10px",
    opacity: 0,
    animation: "fadeIn 0.5s forwards",
  };

  const iconStyle = {
    fontSize: "25px",
    marginBottom: "10px",
    color: "black",
    transition: "transform 0.3s ease",
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    color: "gold",
    marginBottom: "5px",
  };

  const descriptionStyle = {
    fontSize: "12px",
    color: "black",
    textAlign: "center",
  };

  const descriptionItemStyle = {
    margin: "3px 0",
  };

  // Hover effects
  const handleHover = (e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";
  };

  const handleHoverOut = (e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  };

  return (
    <div
      style={cardStyle}
      onClick={() => onClick(expense.id)}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverOut}
    >
      <div style={iconStyle}>
        <i className={`fa-solid ${expense.icon}`} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={titleStyle}>{expense.title}</div>
        <div style={descriptionStyle}>
          <p
            style={{ ...descriptionItemStyle, fontSize: "15px", color: "#fff" }}
          >
            Code: {expense.empCode}
          </p>
          <p
            style={{ ...descriptionItemStyle, fontSize: "15px", color: "#fff" }}
          >
            Employee: {expense.empName}
          </p>
          <p
            style={{ ...descriptionItemStyle, fontSize: "15px", color: "#fff" }}
          >
            Exp Amt: {expense.totamt}
          </p>
        </div>
      </div>
      <div
        className="right"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="barcode">{expense.empCode}</div>
      </div>
    </div>
  );
};

export default ExpenseCardItem;
