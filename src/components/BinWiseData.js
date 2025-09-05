import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Popover,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

// Glass design styles
const glassStyle = {
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

// Styled components with glass effect
const GlassDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    ...glassStyle,
    backgroundColor: "rgba(28, 27, 29, 0.9)",
    color: "white",
    // backgroundImage:
    //   "url(https://assets.codepen.io/13471/abstract-light.jpg), linear-gradient(to right in oklab, hsl(260 50% 75%), hsl(220 50% 75%))",
    backgroundSize: "cover",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  ...glassStyle,
  backgroundColor: "rgba(28, 27, 29, 0.7)",
  color: "white",
  marginBottom: "8px",
}));

const GlassPopover = styled(Popover)(({ theme }) => ({
  ...glassStyle,
  color: "white",
  padding: "20px",
  height: "100%",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px rgba(108, 99, 255, 0.3)",
  },
}));

// This is the main component that displays the warehouse data
const BinWiseData = ({ userName = "User", open, onClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverData, setPopoverData] = useState(null);
  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouseClientData, setWarehouseClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState("");
  const orgId = localStorage.getItem("orgId");
  const branchCode = localStorage.getItem("branchcode");
  const warehouse = localStorage.getItem("warehouse");
  const client = localStorage.getItem("client");

  // Fetch the warehouse data when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch storage details
        const storageResponse = await axios.get(
          `${API_URL}/api/dashboardController/getStorageDetails?orgId=${orgId}&branchCode=${branchCode}&warehouse=${warehouse}`
        );

        // Check response structure - adjust based on your API
        if (storageResponse.data && storageResponse.data.paramObjectsMap) {
          setWarehouseData(
            storageResponse.data.paramObjectsMap.storageDetails || []
          );
        } else if (
          storageResponse.data &&
          Array.isArray(storageResponse.data)
        ) {
          setWarehouseData(storageResponse.data);
        }

        // Fetch bin details for client
        const binResponse = await axios.get(
          `${API_URL}/api/dashboardController/getBinDetailsForClientWise?orgId=${orgId}&branchCode=${branchCode}&warehouse=${warehouse}&client=${client}`
        );

        // Check response structure - adjust based on your API
        if (binResponse.data?.paramObjectsMap?.binDetails) {
          setWarehouseClientData(binResponse.data.paramObjectsMap.binDetails);
        } else if (Array.isArray(binResponse.data)) {
          setWarehouseClientData(binResponse.data);
        } else {
          setWarehouseClientData([]);
        }
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, orgId, branchCode, warehouse, client]);

  const getBinDetail = async (bin) => {
    setSelectedBin(bin);
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboardController/getBinDetails?orgId=${orgId}&branchCode=${branchCode}&warehouse=${warehouse}&client=${client}&bin=${bin}`
      );

      // Check response structure - adjust based on your API
      if (response.data && response.data.paramObjectsMap) {
        setPopoverData(response.data.paramObjectsMap.binDetails || []);
      } else if (response.data && Array.isArray(response.data)) {
        setPopoverData(response.data);
      } else {
        setPopoverData([]);
      }
    } catch (error) {
      console.error("Error fetching bin details:", error);
      setPopoverData([]);
    }
  };

  // Find common bins between warehouseData and warehouseClientData
  const getCommonBins = () => {
    if (!warehouseData.length || !warehouseClientData.length) return [];

    // Create a Set of bins from warehouseData
    const warehouseBins = new Set(
      warehouseData.map((location) => location.bin)
    );

    // Filter client bins and map them to include binStatus
    const commonBinsWithStatus = warehouseClientData
      .filter((location) => warehouseBins.has(location.bin))
      .map((location) => ({
        bin: location.bin,
        binStatus: location.binStatus || "Unknown",
      }));

    return commonBinsWithStatus;
  };

  const commonBins = getCommonBins();

  const getColorByAvailability = (bin) => {
    const commonBin = commonBins.find((item) => item.bin === bin);
    if (commonBin) {
      return commonBin.binStatus === "Occupied" ? "#14857bff" : "#08dd4fff";
    }
    return "rgba(255, 255, 255, 0.3)";
  };

  const handleClick = (event, location) => {
    setAnchorEl(event.currentTarget);
    getBinDetail(location);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverData(null);
  };

  const handleCloseDialog = () => {
    handleClosePopover();
    if (onClose) onClose();
  };

  const popoverOpen = Boolean(anchorEl);

  // Group warehouse data by levels (A, B, C)
  const groupByLevel = (data) => {
    if (!data || !data.length) return {};

    return data.reduce((acc, location) => {
      const { level } = location;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(location);
      return acc;
    }, {});
  };

  const groupedData = groupByLevel(warehouseData);

  return (
    <>
      <GlassDialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={6}>
              <Typography
                variant="h5"
                component="div"
                sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
              >
                Warehouse Location - {client}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  width: "400px",
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#14857bff",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "#43e7ccff" }}>
                        Occupied Bin
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#08dd4fff",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "white" }}>
                        Empty
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "white" }}>
                        Others
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={1} container justifyContent="flex-end">
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Typography sx={{ color: "white" }}>
              Loading warehouse data...
            </Typography>
          ) : !warehouseData.length ? (
            <Typography sx={{ color: "white" }}>
              No warehouse data available.
            </Typography>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {Object.keys(groupedData)
                .sort((a, b) => {
                  if (a.length === 1 && b.length !== 1) return -1;
                  if (a.length !== 1 && b.length === 1) return 1;
                  return a.localeCompare(b);
                })
                .map((level) => (
                  <Grid item xs={12} key={level}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      align="center"
                      sx={{ mb: 1, color: "white" }}
                    >
                      Level {level}
                    </Typography>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      {groupedData[level].map((location, index) => (
                        <Grid item key={index}>
                          <Box
                            sx={{
                              width: 65,
                              height: 40,
                              backgroundColor: getColorByAvailability(
                                location.bin
                              ),
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              color: "white",
                              cursor: "pointer",
                              padding: "5px",
                              transition: "0.3s",
                              "&:hover": {
                                borderColor: "#6C63FF",
                                transform: "scale(1.05)",
                                boxShadow: "0 0 10px rgba(108, 99, 255, 0.5)",
                              },
                            }}
                            onClick={(event) =>
                              handleClick(event, location.bin)
                            }
                          >
                            {location.bin}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          )}
        </DialogContent>
      </GlassDialog>

      <GlassPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {popoverData && popoverData.length > 0 ? (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            {popoverData.map((data, index) => (
              <GlassCard key={index}>
                <CardContent sx={{ padding: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <InventoryIcon sx={{ color: "#6C63FF" }} />
                    </Grid>
                    <Grid item xs>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: "white" }}
                      >
                        Part No: {data.partNo || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        {data.partDesc || "No description available"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: "white" }}>
                      <strong>Location:</strong> {selectedBin || "N/A"}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "white" }}>
                      <strong>Available Qty:</strong>{" "}
                      {data.avilQty || data.availableQty || "0"}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "white" }}>
                      <strong>Status:</strong> {data.status || ""}
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ color: "white" }}>
              No data available for this bin.
            </Typography>
          </Box>
        )}
      </GlassPopover>
    </>
  );
};

export default BinWiseData;
