import React from "react";
import "./MonthGraph.css"; // Optional if using external CSS

const data = [
  { value: 5, height: "6%", caption: "Nov\n2010" },
  { value: 15, height: "18%", caption: "Dec\n2010" },
  { value: 0, height: "0%", caption: "Jan\n2011" },
  { value: 50, height: "60%", caption: "Feb\n2011" },
  { value: 35, height: "42%", caption: "Mar\n2011" },
  { value: 20, height: "24%", caption: "Apr\n2011" },
  { value: 15, height: "21%", caption: "May\n2011" },
  { value: 10, height: "12%", caption: "Jun\n2011" },
  { value: 5, height: "6%", caption: "Jul\n2011" },
  { value: 3, height: "3.6%", caption: "Aug\n2011" },
  { value: 0, height: "0%", caption: "Sep\n2011" },
  { value: 1, height: "1.2%", caption: "Oct\n2011" },
];

const MonthGraph = ({ yearchartData }) => {
  return (
    <>
      <div
        className="graph-caption"
        style={{
          whiteSpace: "pre-line",
          marginTop: "-42px",
          fontSize: "12px",
          marginBottom: "50px",
        }}
      >
        {" "}
        Value in Lacs
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <div
          id="graph-notrevised"
          style={{ marginTop: "-25px", width: "800px" }}
        >
          {yearchartData.map((item, index) => (
            <div
              className="graph-section"
              key={index}
              style={{
                margin: "0 5px",
                textAlign: "center",
              }}
            >
              <div className="graph-value">{item.value}</div>
              <div
                className="graph-bar"
                style={{
                  height: item.height,
                  backgroundColor: "#3498db",
                  width: "20px",
                  margin: "0 auto",
                  //   margin: "0 10px",
                }}
              ></div>
              <div
                className="graph-caption"
                style={{
                  whiteSpace: "pre-line",
                  marginTop: "4px",
                  fontSize: "12px",
                }}
              >
                {item.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MonthGraph;
