import CelebrationIcon from "@mui/icons-material/Celebration";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useNavigate } from "react-router-dom";

const Overview = ({ userName = "User" }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize(); // Automatically adjusts confetti to window size
  const navigate = useNavigate();

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, []);

  const Listing = () => {
    navigate("/Listing"); // Navigate to the approved list page
  };


  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        minHeight: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        position: "relative",
      }}
    >
      {/* Confetti */}
      {showConfetti && <Confetti width={width} height={height} />}

      <Card
        sx={{
          width: 500,
          boxShadow: 0,
          border: "1px solid #f1f1f1",
          borderRadius: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
        }}
      >
        {/* Content Section */}
        <CardContent
          sx={{
            flex: 1,
            padding: { xs: 3, md: 5 },
            textAlign: "center",
          }}
        >
          {/* Icons and Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <CelebrationIcon
              sx={{ fontSize: 40, color: "#FF5722" }}
              aria-label="Celebration"
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Welcome, {localStorage.getItem("nickName")}!
            </Typography>
          </Box>

          {/* Subtext */}
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              marginBottom: 3,
              fontSize: "1rem",
            }}
          >
            We're thrilled to have you here! Let's make your experience amazing.
          </Typography>

          {/* Action Buttons */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                onClick={Listing}
                sx={{
                  borderColor: "#FF5722",
                  color: "#FF5722",
                  "&:hover": {
                    backgroundColor: "#FFECE4",
                    borderColor: "#FF5722",
                  },
                }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Overview;
