import CelebrationIcon from "@mui/icons-material/Celebration";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useNavigate } from "react-router-dom";
import "./Dashboard1.css";
import {
  getApprove1Db,
  getApprove1TblDb,
  getApprove1ChartDb,
} from "../services/api";
import { notification } from "antd";
import { Pie, Line, Radar, radialLinear } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";

const Dashboard1 = ({ userName = "User" }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize(); // Automatically adjusts confetti to window size
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [tbldata, setTblData] = useState([]);

  const [chartdata, setChartData] = useState([]);

  const chartHeight = 350;
  const chartWidth = 650;
  const radius = 250;
  const fillOpacity = 10;
  const chartOptions = { maintainAspectRatio: false, responsive: false };

  const chartDivRef = useRef(null); // Ref to h

  useEffect(() => {
    getApprove1Db()
      .then((response) => {
        setData(response); // Assuming the API returns an object with the expected properties
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });

    getApprove1TblDb()
      .then((response) => {
        setTblData(response); // Assuming the API returns an object with the expected properties
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });

    getApprove1ChartDb()
      .then((response) => {
        setChartData(response); // Assuming the API returns an object with the expected properties
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });
  }, []);

  // If data is not available, return a loading state
  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  // const pieData = {
  //   labels: chartdata.map((item) => item.partyName),
  //   datasets: [
  //     {
  //       data: chartdata.map((item) => parseInt(item.cnUnApprove)), // Assuming cnApprove is numeric
  //       backgroundColor: [
  //         "#FF6384",
  //         "#36A2EB",
  //         "#FFCE56",
  //         "#FF9F40",
  //         "#4BC0C0",
  //         "#9966FF",
  //         "#FF66B2",
  //         "#FF6666",
  //         "#66FF66",
  //         "#66FFFF",
  //         "#FF9966",
  //         "#FF33FF",
  //         "#00FFFF",
  //         "#99CCFF",
  //         "#CC99FF",
  //         "#FFCC99",
  //       ], // Adjust color as needed
  //       hoverBackgroundColor: [
  //         "#FF6384",
  //         "#36A2EB",
  //         "#FFCE56",
  //         "#FF9F40",
  //         "#4BC0C0",
  //         "#9966FF",
  //         "#FF66B2",
  //         "#FF6666",
  //         "#66FF66",
  //         "#66FFFF",
  //         "#FF9966",
  //         "#FF33FF",
  //         "#00FFFF",
  //         "#99CCFF",
  //         "#CC99FF",
  //         "#FFCC99",
  //       ], // Adjust hover color as needed
  //     },
  //   ],
  // };
  const backgroundColors = [
    "#2b92d8",
    "#2ab96a",
    "#e9c061",
    "#d95d6b",
    "#9173d8",
    "#9966FF",
    "#FF66B2",
    "#FF6666",
    "#66FF66",
    "#66FFFF",
    "#FF9966",
    "#FF33FF",
    "#00FFFF",
    "#99CCFF",
    "#CC99FF",
    "#FFCC99",
  ];

  const hoverBackgroundColors = [
    "#2b92d8",
    "#2ab96a",
    "#e9c061",
    "#d95d6b",
    "#9173d8",
    "#9966FF",
    "#FF66B2",
    "#FF6666",
    "#66FF66",
    "#66FFFF",
    "#FF9966",
    "#FF33FF",
    "#00FFFF",
    "#99CCFF",
    "#CC99FF",
    "#FFCC99",
  ];

  const pieData = {
    labels: chartdata.map((item) => item.partyName),
    datasets: [
      {
        data: chartdata.map((item) => parseInt(item.cnUnApprove)),
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors,
      },
    ],
  };

  // Options for the 3D-like effect
  // Options for the chart with shadow effects
  // const options = {
  //   responsive: true,
  //   plugins: {
  //     tooltip: {
  //       enabled: true,
  //       callbacks: {
  //         label: function (tooltipItem) {
  //           return `${tooltipItem.label}:  ${tooltipItem.raw} (3D Effect)`;
  //         },
  //       },
  //     },
  //     legend: {
  //       position: "top",
  //       labels: {
  //         usePointStyle: true,
  //       },
  //     },
  //     title: {
  //       display: true,
  //       text: "Top 5 CN Customer", // This will display the title at the top of the chart
  //       font: {
  //         size: 20, // Adjust the font size of the title
  //         weight: "bold", // Set font weight to bold for better visibility
  //       },
  //       padding: {
  //         bottom: 20, // Add some space between the title and the chart
  //       },
  //     },
  //   },
  //   elements: {
  //     arc: {
  //       borderWidth: 4, // Border width for segments
  //       borderColor: "#fff", // White border for better separation of segments
  //       hoverOffset: 5, // Slightly separated on hover for 3D effect
  //     },
  //   },
  //   animation: {
  //     animateScale: true, // Makes the chart animate on scale, giving a 3D-like effect
  //   },

  //   // Adding shadow effect before and after drawing the chart
  //   plugins: {
  //     beforeDraw: function (chart) {
  //       const ctx = chart.ctx;
  //       ctx.save();
  //       ctx.shadowColor = "5px 15px 15px rgba(0, 0, 0, 0.5)"; // Dark shadow color
  //       ctx.dropshadow = "0px 15px 5px rgba(0,0,0,0.5)";

  //       ctx.shadowBlur = 20; // Shadow blur effect
  //       ctx.shadowOffsetX = 40; // Shadow X offset
  //       ctx.shadowOffsetY = 40; // Shadow Y offset
  //     },
  //     afterDraw: function (chart) {
  //       const ctx = chart.ctx;
  //       ctx.restore();
  //     },
  //   },
  // };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            return `  ${tooltipItem.raw} `;
          },
        },
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: function (context) {
          // Only display title if there's at least one non-zero value
          const chart = context.chart;
          const data = chart.data.datasets[0]?.data || [];
          return data.some((value) => value > 0);
        },
        text: "Un Approved Credit Notes", // Title text
        font: {
          size: 20, // Font size of the title
          weight: "bold", // Font weight
        },
        padding: {
          bottom: 20, // Padding to avoid overlapping with the chart
        },
      },
      beforeDraw: function (chart) {
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0]; // The first dataset (there's only one in this case)

        // Loop over each arc (segment) of the doughnut chart
        chart.getDatasetMeta(0).data.forEach((arc, index) => {
          ctx.save();
          // Apply a different shadow to each arc (segment)
          ctx.shadowColor = ctx.shadowColor[index % ctx.shadowColor.length];
          ctx.shadowBlur = 15 + index * 5; // Varying shadow blur
          ctx.shadowOffsetX = 5 + index * 2; // Varying X offset for each arc
          ctx.shadowOffsetY = 5 + index * 2; // Varying Y offset for each arc

          // Draw the arc with the shadow applied
          arc.draw();
          ctx.restore();
        });
      },
      afterDraw: function (chart) {
        // Any actions to perform after drawing the chart (optional)
      },
    },
    elements: {
      arc: {
        borderWidth: 4, // Border width for segments
        borderColor: "#fff", // White border for better separation of segments
        hoverOffset: 5, // Slightly separated on hover for 3D effect
      },
    },
    animation: {
      animateScale: true, // Makes the chart animate on scale, giving a 3D-like effect
    },
  };

  return (
    <div className="row mb-5" style={{ marginTop: "20px" }}>
      {data.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <div className="row w-row">
              <div className="basic-column w-col w-col-3">
                <div className="tag-wrapper">
                  <div
                    className="number-card number-card-content1"
                    style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
                  >
                    <h1 className="number-card-number">Invoice</h1>
                    <div className="number-card-dollars"></div>
                    <div className="number-card-divider"></div>
                    <div className="number-card-progress-wrapper">
                      <div className="tagline number-card-currency">
                        Approved <br />
                        Pending
                      </div>
                      <div className="number-card-progress">
                        {item.invApprove} <br />
                        {item.invUnApprove}
                      </div>{" "}
                    </div>
                  </div>
                  <div className="divider"></div>
                </div>
              </div>
              <div className="basic-column w-col w-col-3">
                <div className="tag-wrapper">
                  <div
                    className="number-card number-card-content2"
                    style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
                  >
                    <h1 className="number-card-number">Credit Note</h1>
                    <div className="number-card-dollars"></div>
                    <div className="number-card-divider"></div>
                    <div className="number-card-progress-wrapper">
                      <div className="tagline number-card-currency">
                        Approved <br />
                        Pending
                      </div>
                      <div className="number-card-progress">
                        {item.cnApprove} <br />
                        {item.cnUnApprove}
                      </div>
                    </div>
                  </div>
                  <div className="divider"></div>
                </div>
              </div>
              {/* <div className="basic-column w-col w-col-3">
                <div className="tag-wrapper">
                  <div
                    className="number-card number-card-content3"
                    style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
                  >
                    <h1 className="number-card-number">Max CN</h1>
                    <div className="number-card-dollars"></div>
                    <div className="number-card-divider"></div>
                    <div className="number-card-progress-wrapper">
                      <div className="tagline number-card-currency"></div>
                      <div className="number-card-progress"></div>
                    </div>
                  </div>
                  <div className="divider"></div>
                </div>
              </div>
              <div className="basic-column w-col w-col-3">
                <div className="tag-wrapper">
                  <div
                    className="number-card number-card-content4"
                    style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
                  >
                    <h1 className="number-card-number">Min CN</h1>
                    <div className="number-card-dollars"></div>
                    <div className="number-card-divider"></div>
                    <div className="number-card-progress-wrapper">
                      <div className="tagline number-card-currency"></div>
                      <div className="number-card-progress"></div>
                    </div>
                  </div>
                  <div className="divider"></div>
                </div>
              </div> */}
            </div>

            <div
              style={{
                marginLeft: "-610px",
                marginTop: "-50px",
              }}
            >
              {/* HTML Table Section */}

              <h2 className="aa_h2"></h2>
              <table
                className="aa_htmlTable"
                style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
              >
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th colspan="2">Invoice</th>
                    <th colspan="2">Credit Note</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Approved</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {tbldata.map((item, index) => (
                    <tr key={index} style={{ color: "white" }}>
                      <td>{item.branchCode}</td>
                      <td>{item.invApprove}</td>
                      <td>{item.invUnApprove}</td>
                      <td>{item.cnApprove}</td>
                      <td>{item.cnUnApprove}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ fontWeight: "bold" }}>
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      {/* Calculate total of Invoice Approved */}
                      {tbldata.reduce(
                        (sum, item) => sum + parseFloat(item.invApprove || 0),
                        0
                      )}
                    </td>
                    <td>
                      {/* Calculate total of Invoice Un Approved */}
                      {tbldata.reduce(
                        (sum, item) => sum + parseFloat(item.invUnApprove || 0),
                        0
                      )}
                    </td>
                    <td>
                      {/* Calculate total of Credit Note Approved */}
                      {tbldata.reduce(
                        (sum, item) => sum + parseFloat(item.cnApprove || 0),
                        0
                      )}
                    </td>
                    <td>
                      {/* Calculate total of Credit Note Un Approved */}
                      {tbldata.reduce(
                        (sum, item) => sum + parseFloat(item.cnUnApprove || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* <div>
              <section
                style={{
                  height: "70px",
                  marginLeft: "580px",
                  marginTop: "-380px",
                }}
              >
                <Doughnut
                  data={pieData}
                  height={chartHeight}
                  width={chartWidth}
                  // radius={radius}
                  options={options}
                  // fillOpacity={fillOpacity}
                />
              </section>
            </div> */}

            <div
              style={{ position: "relative", width: "100%", height: "400px" }}
            >
              <div
                style={{
                  // position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "300px",
                  height: "300px",
                  marginLeft: "880px",
                  marginTop: "-180px",
                  // borderRadius: "50%",
                  // boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <Doughnut
                  data={pieData}
                  options={options}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: "20px",
                  }}
                />
              </div>

              {/* Optional decorative elements */}
              {/* <div
                style={{
                  // position: "absolute",
                  top: "10%",
                  left: "10%",
                  width: "80%",
                  height: "80%",
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 50px rgba(0, 0, 0, 0.1)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              /> */}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Dashboard1;
