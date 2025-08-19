import { Box, CssBaseline } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null to indicate "loading" state

  // useEffect(() => {
  //   const authToken = localStorage.getItem("authToken");

  //   // If the route is "/authenticate", don't redirect to login
  //   if (location.pathname !== '/authenticate') {
  //     if (!authToken) {
  //       setIsAuthenticated(false);
  //       navigate("/login", { replace: true }); // Redirect to login if not authenticated
  //     } else {
  //       setIsAuthenticated(true);
  //     }
  //   }
  // }, [navigate, location.pathname]);

  // if (isAuthenticated === null) {
  //   // While checking authentication, return a loading spinner or empty state
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   // Prevent rendering the Dashboard if not authenticated
  //   return null;
  // }

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
