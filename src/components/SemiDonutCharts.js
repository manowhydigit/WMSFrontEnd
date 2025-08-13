import React from "react";
import "./SemiDonutCharts.css";

// const semiDonutData = [
//   { label: "HTML5", percentage: 80, fill: "#FF3D00" },
//   { label: "CSS3", percentage: 90, fill: "#039BE5" },
// ];

const multiGraphData = [
  { name: "jQuery", percentage: 80, fill: "#0669AD" },
  { name: "Angular", percentage: 60, fill: "#E62A39" },
  { name: "React", percentage: 30, fill: "#FEDA3E" },
];

const SemiDonutCharts = () => {
  return (
    <div className="charts-wrapper">
      

      <div className="multi-graph margin">
        JavaScript
        {multiGraphData.map((item, index) => (
          <div
            key={index}
            className="graph"
            data-name={item.name}
            style={{ "--percentage": item.percentage, "--fill": item.fill }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SemiDonutCharts;
