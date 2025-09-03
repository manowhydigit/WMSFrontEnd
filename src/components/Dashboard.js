import { Box, CssBaseline } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null to indicate "loading" state

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
