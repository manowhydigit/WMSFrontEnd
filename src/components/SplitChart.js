import React, { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const SplitChart = ({ multiGraphData, display, selectedType }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Convert values to lakhs and format
  const formatInLakhs = (value) => {
    const lakhValue = (value * 100000) / 100000; // Convert to lakhs
    return `₹${lakhValue.toFixed(0)} L`; // Format as ₹X.XX L
  };

  useEffect(() => {
    if (!multiGraphData || !multiGraphData.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        // labels: multiGraphData
        //   .filter((item) => item.percentage !== 0)
        //   .map((item) => `${item.name}:  ${formatInLakhs(item.percentage)}`),
        datasets: [
          {
            data: multiGraphData.map((item) => item.percentage),
            backgroundColor: multiGraphData.map((item) => item.fill),
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180, // Makes it semi-circle (180 degrees)
        rotation: -90, // Starts from top (12 o'clock position)
        cutout: "70%",
        animation: { duration: 0 },
        interaction: {
          mode: "nearest",
          intersect: false,
          axis: "x",
        },
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "white",
              font: { size: 12, weight: "bold" },
              boxWidth: 12,
              padding: 12,
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            bodyColor: "white",
            backgroundColor: "rgba(0,0,0,0.7)",
            displayColors: false,
            caretSize: 10,
            caretPadding: 10,
            cornerRadius: 6,
            padding: 12,
            callbacks: {
              label: (context) => {
                const branch = multiGraphData[context.dataIndex];
                return [
                  // `Branch: ${branch.name}`,
                  `Due: ${branch.due.toLocaleString("en-IN")}`,
                ];
              },
            },
          },
        },
        layout: {
          padding: {
            top: 10,
            bottom: 0, // Extra space at bottom removed
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [multiGraphData]);

  if (!multiGraphData || !multiGraphData.length) {
    return (
      <div style={{ width: "165px", height: "82.5px", color: "white" }}></div>
    );
  }

  return (
    <>
      <div
        style={{
          // width: "360px",
          // height: "230px", // Half height for semi-circle
          width: "280px",
          height: "150px", // Half height for semi-circle
          position: "relative",
          marginTop: "20px", // Space for legend
          marginLeft: "300px",
          marginTop: "-190px",
        }}
      >
        <canvas id="foo" ref={chartRef} width={100} height={100}></canvas>

        {selectedType == "CUSTOMER" && (
          <div
            style={{
              // Half height for semi-circle
              position: "relative",
              marginTop: "20px", // Space for legend
              marginLeft: "-20px",
              marginTop: "10px",
            }}
          >
            SalesPerson - {display}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "10px",
          marginLeft: "300px",
          color: "white",
          fontSize: "12px",
          // fontWeight: "bold",
          marginLeft: "600px",
          marginTop: "-170px",
        }}
      >
        {multiGraphData
          .filter((item) => item.percentage !== 0)
          .map((item, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "10px", marginBottom: "4px" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  backgroundColor: item.fill,
                  borderRadius: "50%",
                  // marginTop: "4px",
                }}
              ></span>
              <span>
                {item.name}: ₹{item.percentage.toLocaleString("en-IN")} L
              </span>
            </div>
          ))}
      </div>
    </>
  );
};

export default SplitChart;
