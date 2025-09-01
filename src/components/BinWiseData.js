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
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

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
          console.log(
            "Setting binDetails:",
            binResponse.data.paramObjectsMap.binDetails
          );
          setWarehouseClientData(binResponse.data.paramObjectsMap.binDetails);
        } else if (Array.isArray(binResponse.data)) {
          console.log("Setting root array:", binResponse.data);
          setWarehouseClientData(binResponse.data);
        } else {
          console.warn("No binDetails found in response");
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
      return commonBin.binStatus === "Occupied" ? "#ffa500" : "green";
    }
    return "grey";
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
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCloseDialog}>
        <DialogTitle>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={6}>
              <Typography variant="h5" component="div">
                Warehouse Location
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#ffa500",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">
                        {client}'s Occupied Bin
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "green",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">Empty</Typography>
                    </Box>
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "grey",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">Others</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={1} container justifyContent="flex-end">
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Typography>Loading warehouse data...</Typography>
          ) : !warehouseData.length ? (
            <Typography>No warehouse data available.</Typography>
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
                      sx={{ mb: 1 }}
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
                              border: "1px solid #ccc",
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
                                borderColor: "black",
                                transform: "scale(1.05)",
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
      </Dialog>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {popoverData && popoverData.length > 0 ? (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            {popoverData.map((data, index) => (
              <Card key={index} sx={{ mb: 1 }}>
                <CardContent sx={{ padding: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <InventoryIcon color="secondary" />
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        Part No: {data.partNo || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.partDesc || "No description available"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      <strong>Location:</strong> {selectedBin || "N/A"}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Available Qty:</strong>{" "}
                      {data.avilQty || data.availableQty || "0"}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Status:</strong> {data.status || ""}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography>No data available for this bin.</Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default BinWiseData;
