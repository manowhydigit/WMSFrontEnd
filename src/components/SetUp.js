import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Trans.css";
import "./PartyMasterUpdate.css";
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
import DocumentMapping from "./DocumentMapping";

// Grouped menu items with categories
const menuCategories = [
  {
    category: "Basic Masters",
    items: [
      { name: "Customer", backendName: "CUSTOMER" },
      { name: "FinYear", backendName: "FINYEAR" },
      { name: "CellType", backendName: "CELLTYPE" },
      { name: "DocType", backendName: "DOCTYPE" },
      { name: "Employee", backendName: "EMPLOYEE" },
      { name: "LocationType", backendName: "LOCATIONTYPE" },
    ],
  },
  {
    category: "Mappings",
    items: [
      { name: "DocumentMapping", backendName: "DOCUMENTMAPPING" },
      { name: "LocationMapping", backendName: "LOCATIONMAPPING" },
    ],
  },
  {
    category: "Warehouse Management",
    items: [
      { name: "Warehouse", backendName: "WAREHOUSE" },
      { name: "WarehouseLocation", backendName: "WAREHOUSELOCATION" },
      { name: "WH Approved List", backendName: "WHAPPROVEDLIST" },
    ],
  },
  {
    category: "Reviews",
    items: [
      { name: "Pre Goals", backendName: "PREGOALS" },
      { name: "Self Review", backendName: "SELFREVIEW" },
    ],
  },
];

const routes = {
  Customer: "/Customer",
  FinYear: "/FinYear",
  CellType: "/CellType",
  DocType: "/DocType",
  DocumentMapping: "/DocumentMapping",
  Employee: "/Employee",
  LocationType: "/LocationType",
  LocationMapping: "/LocationMapping",
  Warehouse: "/Warehouse",
  WarehouseLocation: "/WarehouseLocation",
  "WH Approved List": "/WHApprovedList",
  "Pre Goals": "/PreGoals",
  "Self Review": "/SelfReview",
};

const SetUp = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Filter menu items based on allowedScreens
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    let userScreens = [];

    if (userData?.roleVO) {
      userData.roleVO.forEach((role) => {
        role.responsibilityVO.forEach((resp) => {
          userScreens = [...userScreens, ...resp.screensVO];
        });
      });
    }

    // Normalize screen names (remove spaces, convert to uppercase)
    const normalizedUserScreens = userScreens.map((screen) =>
      screen.replace(/\s+/g, "").toUpperCase()
    );

    // Filter menuCategories based on normalized screens
    const filteredCategories = menuCategories
      .map((category) => {
        const filteredItems = category.items.filter((menu) => {
          const normalizedMenuName = menu.backendName
            .replace(/\s+/g, "")
            .toUpperCase();
          return normalizedUserScreens.includes(normalizedMenuName);
        });
        return { ...category, items: filteredItems };
      })
      .filter((category) => category.items.length > 0); // Remove empty categories

    setFilteredMenuItems(filteredCategories);
  }, []);

  // Filter further based on search term
  const filteredAndSearchedMenuItems = filteredMenuItems
    .map((category) => {
      const filteredItems = category.items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { ...category, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  const buttonStyles = {
    display: "flex",
    width: "200px",
    height: "40px",
    justifyContent: "center",
    alignItems: "center",
    margin: "0.5rem",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "16px",
    color: "black",
    textDecoration: "none",
    transition: "all 0.35s",
    cursor: "pointer",
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#5D576B";
      document.body.style.color = "#fff";
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
    }
  }, [theme]);

  return (
    <div
      className="sticky-note sticky-note-one1"
      style={{
        padding: "20px",
        marginTop: "70px",
        backgroundColor: "#fff",
        width: "800px",
        minHeight: "10px",
        padding: "20px",
        margin: "70px auto 0",
        filter: "drop-shadow(0px 1px 10px rgba(0, 0, 0, 0.3))",
      }}
    >
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

      {/* Grouped Buttons */}
      <div style={{ marginTop: "20px" }}>
        {filteredAndSearchedMenuItems.map((category, catIndex) => (
          <div key={catIndex} style={{ marginBottom: "30px" }}>
            <Typography.Title
              level={4}
              style={{
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              {category.category}
            </Typography.Title>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                justifyContent: "flex-start",
              }}
            >
              {category.items.map((item, index) => (
                <div
                  key={index}
                  style={buttonStyles}
                  onClick={() => handleNavigate(routes[item.name])}
                >
                  <Button className="button11" style={{ fontSize: "14px" }}>
                    {item.name}
                  </Button>
                </div>
              ))}
            </div>
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

export default SetUp;
