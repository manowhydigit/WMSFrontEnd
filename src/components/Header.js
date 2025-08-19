import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Toolbar,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
  Paper,
} from "@mui/material";
import { notification } from "antd";
import { useWindowSize } from "react-use";
import axios from "axios";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordPopup from "../utils/ResetPassword";
import idea from "../idea.png";
import UWLNL2 from "../UWLNL2.png";
import UWLNL3 from "../UWLNL3.png";
import { gsap } from "gsap";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { ArrowDropDown, ArrowDropUp, Clear } from "@mui/icons-material";
import "./Header.css";
import confetti from "canvas-confetti";
import {
  getHaiCustomerDetails,
  getPartyLedgerPartyName,
  getHaiBranchCustomerDetails,
  getHaiInvCustomerDetails,
  getHaiCustomerRankDetails,
  getHaiProductSummary,
  getHaiCustomerYearProfit,
  getAdminNote,
  getUserNote,
} from "../services/api";
import GaugeSpeedometer from "./GaugeSpeedometer";
import { Doughnut } from "react-chartjs-2";
import DChart from "./DChart";
import SplitChart from "./SplitChart";
import Confetti from "react-confetti";
import TiltCard from "./TiltCard";
import userpng from "../user.png";
import logoonly from "../logoonly.png";
import MonthGraph from "./MonthGraph";
import Typewriter from "./Typewriter";
import giphybrain5 from "../giphybrain5.gif";
import aibrain1 from "../aibrain1.png";

import HAILogo from "../HAILogo.png";
import NotificationBell from "./NotificationBell";
import AnalogClock from "./AnalogClock";
import OrbParticles from "./OrbParticles";
import { useMediaQuery } from "@mui/material";
import UWLLOGON from "../UWLLOGON.png";
import GlobalSection from "./GlobalSection";
const { Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const getPowerEmoji = (index) => {
  const emojis = ["💫", "⚡", "🧠", "🔮", "💪", "🦅", "👻"];
  return emojis[index];
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [time, setTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("userName"));
  const isMobile = useMediaQuery("(max-width:600px)");

  const [isActive, setIsActive] = useState(true);

  const [data, setData] = useState(null);

  // const checkUserActiveStatus = async (username) => {
  //   try {
  //     const response = await fetch(
  //       `${API_URL}/api/Ticket/getUserActiveStatus?userName=${username}`
  //     );
  //     const resData = await response.json();
  //     const isActive =
  //       resData?.paramObjectsMap?.getUserActiveStatus?.[0]?.is_active;

  //     console.log("User is_active:", isActive);

  //     if (isActive === 0) {
  //       handleLogout(); // 👈 Trigger logout if inactive
  //     }
  //   } catch (error) {
  //     console.error("Error checking user status:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (user) {
  //     checkUserActiveStatus(user); // initial call immediately

  //     const interval = setInterval(() => {
  //       checkUserActiveStatus(user); // every 2 minutes
  //     }, 2 * 60 * 1000); // 2 minutes = 120000 ms

  //     return () => clearInterval(interval); // cleanup on unmount
  //   }
  // }, [user]);

  // const checkUserActiveStatus = async (user) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8091/api/Ticket/getUserActiveStatus?userName=${user}`
  //     );
  //     const resData = await response.json(); // rename to avoid conflict
  //     console.log("Full response:", resData);

  //     const isActive =
  //       resData?.paramObjectsMap?.getUserActiveStatus?.[0]?.is_active;
  //     console.log("Is Active:", isActive);

  //     setData(isActive); // ✅ set to your state
  //     console.log("userdata", data);
  //   } catch (error) {
  //     console.error("Error checking user status:", error);
  //     return false;
  //   }
  // };

  // useEffect(() => {
  //   checkUserActiveStatus(user);

  // }, []);

  // Only render SuperPowerModal when needed

  const hiddenPaths = ["/login", "/register", "/authenticate"];

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}`;
    switch (day % 10) {
      case 1:
        return `${day}`;
      case 2:
        return `${day}`;
      case 3:
        return `${day}`;
      default:
        return `${day}`;
    }
  };

  const dayOfWeek = time.toLocaleString("en-US", { weekday: "short" });
  const dayWithSuffix = getDayWithSuffix(time.getDate());
  const month = time.toLocaleString("en-US", { month: "short" });
  const year = time.getFullYear();
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const formattedDate = `${dayOfWeek} ${dayWithSuffix} ${month} ${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  // console.log("user", user);
  const handleLogout = async () => {
    // Clear user data and tokens

    // Navigate to login with isMobile state

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/logout?userName=${localStorage.getItem(
          "userName"
        )}`
      );

      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: "Success",
          description: "Successfully Logged Out.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
    localStorage.clear();
    navigate("/login");
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#1B2631",
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              marginLeft: 7,
              fontFamily: "'Poppins', sans-serif",
              // fontWeight: "bold",
              letterSpacing: "2px",
              color: "#ffffff",
            }}
          >
            {/* <img
              src={logoonly}
              width="50px"
              height="30px"
              alt="Idea"
              style={{
                cursor: "pointer",
              }}
            /> */}
            <img
              src={UWLNL3}
              width="160px"
              height="50px"
              alt="Idea"
              style={{
                // cursor: "pointer",
                marginTop: "-20px",
              }}
            />
            {/* <div style={{ position: "relative" }}>
              <img
                src={UWLNL3}
                alt="Watermark"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 2.05,
                  width: "200px",
                  height: "auto",
                  zIndex: 0,
                  pointerEvents: "none",
                  marginLeft: "-180px",
                }}
              />
            </div> */}

            <div
              style={{
                fontSize: "14px",
                marginLeft: "50px",
                marginTop: "-30px",
              }}
            >
              {" "}
              {/* Uniworld <br />
              Logistics */}
            </div>
          </Typography>
          {/* <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            {formattedDate}- {formattedTime}
          </p> */}
          {!isMobile && (
            // <p
            //   style={{
            //     fontSize: "16px",

            //     // fontWeight: "bold",
            //     marginRight: "10px",
            //   }}
            // >
            //   {formattedDate} - {formattedTime}
            // </p>

            <Button
              variant="contained"
              color="secondary"
              sx={{
                textTransform: "none",
                cursor: "default",
                marginRight: 0.001,

                // color: "#00FFFF",
                // backgroundColor: "#f44336",
                backgroundColor: "transparent",
                fontFamily: "'Orbitron',cursive",
                color: "#00FFFF",
                // boxShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF",
                // "&:hover": { backgroundColor: "#d32f2f" },

                width: "bold",
                // fontSize: "16px",
                // fontFamily: "'Lily Script One', cursive",
              }}
            >
              {formattedDate} - {formattedTime}
            </Button>
          )}
          {/* {user === "admin" && ( 
             <IconButton
            //   onClick={() => setModalOpen(true)}
            //   sx={{
            //     marginX: 3,
            //     "&:hover": {
            //       transform: "scale(1.1)",
            //       transition: "transform 0.3s ease",
            //     },
            //   }}
            // >
              {/* <img
                src={idea}
                width="40px"
                height="40px"
                alt="Idea"
                style={{ cursor: "pointer" }}
              /> */}
          {/* <button class="glowing-btn">
                <span class="glowing-txt">
                  H<span class="faulty-letter">A</span>I
                </span>
              </button> */}
          {/* <a
                class="button444 button-big"
                // style={{ height: "20px", width: "30px", alignItems: "center" }}
              >
                HAI
              </a> */}
          {/* <div className="hai">
                <h2>
                  H<span>A</span>
                  <span>I</span>
                  <i class="fa fa-hand-o-right"></i>
                </h2>
              </div> */}
          {/* <AnalogClock /> */}
          {/* <div class="neon-wrapper">
            <span class="txt">hai</span>
            <span class="gradient"></span>
            <span class="dodge"></span>
          </div> */}
          {/* <div class="containerHAI">
                <div class="circle"></div>
                <div class="tokyo-tower">
                  <div class="antenna"></div>
                  <div class="main-deck"></div>
                  <div class="top-deck"></div>
                  <div class="spire-shadow">
                    <div class="spire-border"></div>
                    <div class="spire-inset"></div>
                    <div class="spire"></div>
                  </div>
                  <div class="base-spire-shadow">
                    <div class="base-spire-border"></div>
                    <div class="base-spire-inset"></div>
                    <div class="base-spire"></div>
                  </div>
                  <div class="arch"></div>
                  <div class="base"></div>
                </div>
                <div class="tokyo-text">
                  <span>T</span>
                  <span class="flicker">O</span>
                  <span>K</span>
                  <span>Y</span>
                  <span class="flicker">O</span>
                </div>
              </div> */}
          {/* <div
            id="container666 button444 button-big"
            style={{
              marginLeft: "50px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => setModalOpen(true)}
          >
            <p id="text">HAI</p>     
            <p id="shadow">
              <span id="glow">H</span>
              <span id="blink">AI</span>
            </p>
          </div> */}
          {/* </IconButton>
          )} */}

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
              <Avatar
                sx={{ marginRight: 1, height: "30px", width: "30px" }}
                alt="User"
                src={userpng}
                // onClick={handlePopoverOpen}
                // style={{ cursor: "pointer" }}
              />

              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#ffffff",
                  fontSize: "14px",
                  // fontWeight: "bold",
                }}
                // onClick={handlePopoverOpen}
                style={{
                  cursor: "pointer",
                }}
              >
                <div style={{ marginLeft: "-15px" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      textTransform: "none",
                      cursor: "default",

                      // color: "#00FFFF",
                      // backgroundColor: "#f44336",
                      backgroundColor: "transparent",
                      // "&:hover": { backgroundColor: "#d32f2f" },

                      width: "bold",
                    }}
                  >
                    Welcome!!! {localStorage.getItem("employeeName")}
                  </Button>
                </div>
                {/* Welcome!!! */}
              </Typography>
            </Box>
          )}
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List>
              <ListItem button>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Popover>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            <div style={{ marginRight: "-20px" }}>
              <NotificationBell />
            </div>
            <div>
              <GlobalSection />
            </div>
            <div>
              <ResetPasswordPopup />
            </div>
            <div style={{ paddingLeft: "10px" }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  // color: "#00FFFF",
                  // backgroundColor: "#f44336",
                  backgroundColor: "transparent",
                  // "&:hover": { backgroundColor: "#d32f2f" },
                  "&:hover": {
                    boxShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF",
                  },
                  width: "bold",
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
