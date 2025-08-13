import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Box, IconButton, Popover, Tooltip } from "@mui/material";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "react-use/lib/useWindowSize";
import * as XLSX from "xlsx";
import "./Reports.css";
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Input,
  notification,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";

// Mock Data for Reports
const clientReportData = [
  { name: "AR - Ageing", code: "" },
  { name: "AR - OutStanding", code: "" },
  { name: "AR - CurrentOS", code: "" },
  { name: "MIS", code: "" },
  { name: "AP - Ageing", code: "" },
  { name: "AP - OutStanding", code: "" },
  { name: "Day Book Branch Wise", code: "" },
  { name: "Party Ledger", code: "" },
  { name: "Ledger Report", code: "" },
  { name: "GSTR1 Filling", code: "" },
  { name: "Profit And Loss", code: "" },
];

const routes = {
  "AR - Ageing": "/ARAgeing",
  "AR - OutStanding": "/ARAgeingOS",
  "AP - Ageing": "/APAgeing",
  "AP - OutStanding": "/APAgeingOS",
  "AR - CurrentOS": "/ARCurrentOS",
  MIS: "/MIS",
  "Day Book": "/DayBookBranchWise",
  "Party Ledger": "/PartyLedger",
  "Ledger Report": "/LedgerReport",
  "GSTR1 Filling": "/GSTR1Filling",
  "Profit And Loss": "/ProfitAndLoss",
};

const Reports = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverReport, setPopoverReport] = useState(null);
  const { width } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleLogout = () => {
    console.log("Logged out");
  };

  const toggleCallBack = () => {
    setIsDarkMode((prevMode) => !prevMode);
    console.log("Toggle", isDarkMode);
  };

  const navigate = useNavigate();

  const buttonStyles = {
    display: "flex",

    width: "200px",
    height: "40px",
    justifyContent: "center",
    alignItems: "center",
    margin: "0.5rem",
    marginTop: "35px",
    // border: "1px solid #979695",
    // borderRadius: "5px",
    textAlign: "center",
    fontSize: "16px",
    // color: "#979695",
    color: "black",
    textDecoration: "none",
    transition: "all 0.35s",
    boxSizing: "border-box",
    // boxShadow: "0.3em 0.3em 0 #181617",
    // backgroundColor: "transparent",
    cursor: "pointer",
  };

  // const hoverStyles = {
  //   boxShadow: "-0.3em -0.3em 0 #181617",
  //   backgroundColor: "#dd6395",
  //   borderColor: "#dd6395",
  //   color: "#fff",
  // };

  const hoverStyles = {
    boxShadow: "-0.3em -0.3em 0 white",
    backgroundColor: "black",
    borderColor: "black",
    color: "white",

    left: 0,
    bordertopcolor: "#51c0ef",
    borderrightcolor: "#51c0ef",
    borderbottomcolor: "#5d576b",
    borderleftcolor: "#5d576b",
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  const handleCardClick = (item) => {
    // Map card names to their respective routes

    // Navigate to the route based on the card name
    if (routes[item.name]) {
      navigate(routes[item.name]);
    } else {
      console.error("No route found for the selected card.");
    }
  };

  const handleDownload = (format) => {
    if (!popoverReport) return;

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.text(`Report: ${popoverReport.name}`, 10, 10);
      doc.text(`Code: ${popoverReport.code}`, 10, 20);
      doc.save(`${popoverReport.name}.pdf`);
    } else if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet([popoverReport]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, `${popoverReport.name}.xlsx`);
    }
    setPopoverAnchor(null); // Close the popover after downloading
  };

  const handleDownloadIconClick = (event, report) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverReport(report);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const isPopoverOpen = Boolean(popoverAnchor);

  const responseScreens = localStorage.getItem("responseScreens");
  console.log("responseScreens", responseScreens);
  // let allowedScreens = [];
  let parsedScreens = [];

  try {
    if (responseScreens) {
      parsedScreens = JSON.parse(responseScreens);
      // allowedScreens = parsedScreens.map((screen) => screen.screenName);
    }
  } catch (error) {
    console.error("Error parsing responseScreens:", error);
  }

  // Filter menu items based on allowedScreens
  const filteredMenuItems = clientReportData.filter((menu) =>
    parsedScreens.includes(menu.name.toUpperCase())
  );

  console.log("menuItems", clientReportData);
  console.log("filteredMenuItems", filteredMenuItems);

  // Filter further based on the search term
  const filteredAndSearchedMenuItems = filteredMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (theme === "dark") {
      // document.body.style.backgroundColor = "#1c1c1c"; // Dark background for the entire page
      document.body.style.backgroundColor = "#5D576B";
      document.body.style.color = "#fff"; // White text for dark mode
    } else {
      document.body.style.backgroundColor = "#fff"; // Light background for the body
      document.body.style.color = "#000"; // Black text for light mode
    }
  }, [theme]);

  return (
    <div
      className="sticky-note sticky-note-one1"
      // className="container"
      style={{
        padding: "20px",
        marginTop: "70px",

        // boxShadow: "0 5px 10px rgba(0, 0, 0, 0.3)",
        backgroundColor: "#fff",
        width: "800px",
        minHeight: "10px",
        padding: "20px",
        margin: "70px auto 0",
        filter: "drop-shadow(0px 1px 10px rgba(0, 0, 0, 0.3))",
      }}
    >
      {/* <div className="InputContainer">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #979695",
          }}
        />
      </div> */}

      <div class="group">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
          </g>
        </svg>
        <input
          placeholder="Search"
          type="search"
          class="input"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Button
        className="button1"
        type="text"
        icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
        onClick={toggleTheme}
        size="small"
        style={{ marginLeft: "550px", marginTop: "-90px" }}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </Button>

      {/* <div class="center">
        <h1> Subscribe </h1>
        <input type="checkbox" name="" />
        <h1> Newsletter </h1>
        <input type="checkbox" name="" />
      </div> */}
      <div
        // className="buttons-wrapper"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px", // Adjust gap between buttons
          justifyContent: "space-between", // Align buttons evenly
          padding: "10px", // Optional: Add padding for spacing
        }}
      >
        {filteredAndSearchedMenuItems.map((item, index) => (
          <div
            // className="btn cube"
            key={index}
            style={buttonStyles}
            onClick={() => handleNavigate(routes[item.name])}
          >
            <a href="#">
              {/* <span className="fold"></span> */}
              <Button className="button11" style={{ fontSize: "14px" }}>
                {item.name}
              </Button>
            </a>
          </div>
        ))}
      </div>
      <div
        style={{
          content: '""',
          display: "block",
          position: "absolute",
          bottom: "-10px",
          left: "0",
          width: "100%",
          height: "10px",
          background:
            "linear-gradient(45deg, transparent 33.333%, #FFF 33.333%, #FFF 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #FFF 33.333%, #FFF 66.667%, transparent 66.667%)",
          backgroundSize: "20px 40px",
          transform: "rotate(180deg)",
        }}
      ></div>
    </div>
  );
};

// <div style={{ backgroundColor: isDarkMode ? "#ffffff" : "#ffffff" }}>

//   {/* Cards */}
//   <br/><br/>
//   <div className="ag-format-container">
//     <div className="ag-courses_box">
//       {filteredMenuItems.map((item, index) => (
//         <div
//           key={index}
//           className="ag-courses_item"
//           style={{ cursor: "pointer" , height:"80px" , width:"80px"}}
//         >
//           <div
//             className="ag-courses-item_link"
//             onClick={() => handleCardClick(item)}
//           >
//             <div className="ag-courses-item_bg"></div>
//             <div className="ag-courses-item_title">{item.name}</div>
//             <div className="ag-courses-item_date-box">
//               <span className="ag-courses-item_date">
//                 {item.code}
//                 &nbsp;

//               </span>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>

//   {/* Popover for Download */}
//   <Popover
//     open={isPopoverOpen}
//     anchorEl={popoverAnchor}
//     onClose={handlePopoverClose}
//     anchorOrigin={{
//       vertical: "bottom",
//       horizontal: "center",
//     }}
//     transformOrigin={{
//       vertical: "top",
//       horizontal: "center",
//     }}
//   >
//     <Box
//       p={1}
//       display="flex"
//       flexDirection="row"
//       alignItems="center"
//       gap={1}
//     >
//       <Tooltip title="Download PDF" arrow>
//         <IconButton onClick={() => handleDownload("pdf")} color="primary">
//           <PictureAsPdfIcon
//             style={{ fontSize: "24px", color: "#E53935" }}
//           />
//         </IconButton>
//       </Tooltip>
//       <Tooltip title="Download Excel" arrow>
//         <IconButton onClick={() => handleDownload("excel")} color="primary">
//           <TableChartIcon style={{ fontSize: "24px", color: "#4CAF50" }} />
//         </IconButton>
//       </Tooltip>
//     </Box>
//   </Popover>
// </div>

//   );
// };

export default Reports;
