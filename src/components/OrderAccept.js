import React from "react";
import "./OrderAccept.css"; // Assuming you have a CSS file for styling

const OrderAccept = () => {
  return (
    <div className="order-accept">
      <h1>Order Accept</h1>

      <div className="order-date">
        <h2>Order Date</h2>
        <p>17/07/2023</p>
        <p>Order</p>
        <p>Accept</p>
      </div>

      <div className="error">
        <h2>Error</h2>
        <p>Source: Exit</p>
        <p>Remarks</p>
      </div>

      <div className="length">
        <h2>Length</h2>
        <p>18/07/2023</p>
      </div>

      <div className="items">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Exp</th>
              <th>Item Name</th>
              <th>US$M</th>
              <th>Rate</th>
              <th>Sty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Chayath</td>
              <td>76</td>
              <td>15.00</td>
              <td>45.00</td>
              <td>605.00</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Charney</td>
              <td>12</td>
              <td>100.00</td>
              <td>2.50</td>
              <td>250.00</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Kuma</td>
              <td>12</td>
              <td>100.00</td>
              <td>1.00</td>
              <td>100.00</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Janabar</td>
              <td>12</td>
              <td>100.00</td>
              <td>0.50</td>
              <td>50.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="search">
        <h2>Search</h2>
        {/* Add search input or functionality here */}
      </div>
    </div>
  );
};

export default OrderAccept;
