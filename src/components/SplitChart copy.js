import React, { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const SplitChart = ({ multiGraphData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!multiGraphData || !multiGraphData.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: multiGraphData.map((item) => `${item.name}`),
        datasets: [
          {
            data: multiGraphData.map((item) => item.percentage),
            backgroundColor: multiGraphData.map((item) => item.fill),
            borderColor: "rgba(255, 255, 255, 1)",
            borderWidth: 2, // Slightly thicker border for better visibility
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%", // Slightly smaller cutout for increased visibility
        rotation: -90,
        animation: {
          duration: 0, // Disable animations
        },
        plugins: {
          legend: {
            position: "right", // Move legend to right side
            labels: {
              color: "white", // WHITE TEXT FOR LEGEND
              font: {
                size: 12,
                weight: "bold",
              },
              boxWidth: 12,
              padding: 10,
              font: {
                size: 10, // Smaller font for compact legend
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const branch = multiGraphData[context.dataIndex];
                return `Amount Due: ₹${(
                  branch.percentage * 1000
                ).toLocaleString("en-IN")}`;
              },
            },
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
    return <div style={{ width: "165px", height: "165px" }}>No data</div>;
  }

  return (
    <div
      style={{
        width: "205px", // 10% increase from 150px
        height: "205px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginLeft: "300px",
        marginTop: "-200px",
      }}
    >
      <canvas
        ref={chartRef}
        style={{
          display: "block",
          width: "100% !important",
          height: "100% !important",
        }}
      />
    </div>
  );
};

export default SplitChart;
