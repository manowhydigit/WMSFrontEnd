import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PreviewIcon from "@mui/icons-material/Preview";
import CloseIcon from "@mui/icons-material/Close";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import MainCard from "./MainCard";
import SkeletonEarningCard from "./EarningCard";
import axios from "axios";
import BinWiseData from "./BinWiseData";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";

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
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: "80vh",
  background: "#1c1b1dff",
  marginTop: "50px",
  backgroundSize: "cover",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const CardWrapper = styled(MainCard)(({ theme }) => ({
  ...glassStyle,
  color: "white",
  padding: "20px",
  height: "80%",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px rgba(108, 99, 255, 0.3)",
  },
}));

const StatCard = styled(MainCard)(({ theme }) => ({
  ...glassStyle,
  color: "white",
  padding: "20px",
  height: "80%",
  textAlign: "center",
}));

// Define a vibrant color palette
const COLORS = ["#14857bff", "#08dd4fff"];

// GaugeValueRangeNoSnap Component
const GaugeValueRangeNoSnap = ({
  completedGRNData,
  pendingGRNData,
  pendingPutawayData,
  completedPutawayData,
  completedBuyerOrderData,
  pendingBuyerOrderData,
  completedPickRequestData,
  pendingPickRequestData,
}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState({
    grnCompleted: false,
    grnPending: false,
    putawayCompleted: false,
    putawayPending: false,
    buyerOrderCompleted: false,
    buyerOrderPending: false,
    pickRequestCompleted: false,
    pickRequestPending: false,
  });
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState([]);
  const [dialogType, setDialogType] = useState("");

  const grnChartSeries = [completedGRNData.length, pendingGRNData.length];
  const putawayChartSeries = [
    completedPutawayData.length,
    pendingPutawayData.length,
  ];
  const buyerOrderChartSeries = [
    completedBuyerOrderData.length,
    pendingBuyerOrderData.length,
  ];
  const pickRequestChartSeries = [
    completedPickRequestData.length,
    pendingPickRequestData.length,
  ];

  const handleOpenDialog = (title, data, type) => {
    setDialogTitle(title);
    setDialogData(data);
    setDialogType(type);
    setOpenDialog((prev) => ({ ...prev, [type]: true }));
  };

  const handleCloseDialog = (type) => {
    setOpenDialog((prev) => ({ ...prev, [type]: false }));
  };

  // Create a function to generate chart options with custom click handlers
  const createChartOptions = (onDataPointSelection, labels, colors) => ({
    chart: {
      type: "pie",
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: onDataPointSelection,
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: "white",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val.toFixed(0)}%`;
      },
      style: {
        colors: ["white"],
      },
    },
    labels: labels,
    colors: colors,
  });

  const grnChartOptions = createChartOptions(
    (event, chartContext, config) => {
      const { dataPointIndex } = config;
      const isCompleted = dataPointIndex === 0;
      handleOpenDialog(
        isCompleted ? "Completed GRN" : "Pending GRN",
        isCompleted ? completedGRNData : pendingGRNData,
        isCompleted ? "grnCompleted" : "grnPending"
      );
    },
    ["Completed", "Pending"],
    ["#6DD5ED", "#2193B0"]
  );

  const putawayChartOptions = createChartOptions(
    (event, chartContext, config) => {
      const { dataPointIndex } = config;
      const isCompleted = dataPointIndex === 0;
      handleOpenDialog(
        isCompleted ? "Completed Putaway" : "Pending Putaway",
        isCompleted ? completedPutawayData : pendingPutawayData,
        isCompleted ? "putawayCompleted" : "putawayPending"
      );
    },
    ["Completed", "Pending"],
    ["#00C49F", "#FFBB28"]
  );

  const buyerOrderChartOptions = createChartOptions(
    (event, chartContext, config) => {
      const { dataPointIndex } = config;
      const isCompleted = dataPointIndex === 0;
      handleOpenDialog(
        isCompleted ? "Completed Buyer Orders" : "Pending Buyer Orders",
        isCompleted ? completedBuyerOrderData : pendingBuyerOrderData,
        isCompleted ? "buyerOrderCompleted" : "buyerOrderPending"
      );
    },
    ["Completed", "Pending"],
    ["#FF8042", "#FFBB28"]
  );

  const pickRequestChartOptions = createChartOptions(
    (event, chartContext, config) => {
      const { dataPointIndex } = config;
      const isCompleted = dataPointIndex === 0;
      handleOpenDialog(
        isCompleted ? "Completed Pick Requests" : "Pending Pick Requests",
        isCompleted ? completedPickRequestData : pendingPickRequestData,
        isCompleted ? "pickRequestCompleted" : "pickRequestPending"
      );
    },
    ["Completed", "Pending"],
    ["#8884D8", "#82CA9D"]
  );

  const renderTable = (data, type) => {
    let columns = [];

    switch (type) {
      case "grnCompleted":
      case "grnPending":
        columns = [
          { header: "GRN No", key: "grnNo" },
          {
            header: "GRN Date",
            key: "grnDate",
            format: (date) => dayjs(date).format("DD-MM-YYYY"),
          },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "putawayCompleted":
      case "putawayPending":
        columns = [
          { header: "Putaway No", key: "putawayNo" },
          { header: "Reference No", key: "refNo" },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "buyerOrderCompleted":
      case "buyerOrderPending":
        columns = [
          { header: "Order No", key: "orderNo" },
          {
            header: "Order Date",
            key: "orderDate",
            format: (date) => dayjs(date).format("DD-MM-YYYY"),
          },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "pickRequestCompleted":
      case "pickRequestPending":
        columns = [
          { header: "Pick Request No", key: "pickNo" },
          {
            header: "Status",
            key: "status",
            // format: (date) => dayjs(date).format("DD-MM-YYYY"),
          },
          { header: "Qty", key: "pickQty" },
        ];
        break;
      default:
        columns = [];
    }

    return (
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} sx={{ color: "white" }}>
                    {col.format ? col.format(item[col.key]) : item[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDialog = (type, title, data) => (
    <Dialog
      open={openDialog[type]}
      onClose={() => handleCloseDialog(type)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          ...glassStyle,
          color: "white",
          backgroundColor: "rgba(28, 27, 29, 0.8)",
        },
      }}
    >
      <DialogTitle>
        {title} &nbsp; &nbsp;{" "}
        <Chip
          label={data.length}
          color={type.includes("Completed") ? "success" : "warning"}
        />
        <IconButton
          onClick={() => handleCloseDialog(type)}
          sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {data.length > 0 ? (
          renderTable(data, type)
        ) : (
          <Typography sx={{ color: "black" }}>No data found!</Typography>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      {/* GRN Chart */}
      <Card
        sx={{
          padding: "16px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "280px",
          height: "240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...glassStyle,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "600", mb: 1 }}
        >
          GRN
        </Typography>
        <Box sx={{ width: "100%", height: "100%" }}>
          {grnChartSeries.some((val) => val > 0) ? (
            <ReactApexChart
              options={grnChartOptions}
              series={grnChartSeries}
              type="pie"
              height={200}
            />
          ) : (
            <div
              style={{
                color: "black",
                textAlign: "center",
                paddingTop: "80px",
              }}
            >
              No data available
            </div>
          )}
        </Box>
      </Card>

      {/* Putaway Chart */}
      <Card
        sx={{
          padding: "16px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "280px",
          height: "240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...glassStyle,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "600", mb: 1 }}
        >
          Putaway
        </Typography>
        <Box sx={{ width: "100%", height: "100%" }}>
          {putawayChartSeries.some((val) => val > 0) ? (
            <ReactApexChart
              options={putawayChartOptions}
              series={putawayChartSeries}
              type="pie"
              height={200}
            />
          ) : (
            <div
              style={{
                color: "white",
                textAlign: "center",
                paddingTop: "80px",
              }}
            >
              No data available
            </div>
          )}
        </Box>
      </Card>

      {/* Buyer Order Chart */}
      <Card
        sx={{
          padding: "16px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "280px",
          height: "240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...glassStyle,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "600", mb: 1 }}
        >
          Buyer Order
        </Typography>
        <Box sx={{ width: "100%", height: "100%" }}>
          {buyerOrderChartSeries.some((val) => val > 0) ? (
            <ReactApexChart
              options={buyerOrderChartOptions}
              series={buyerOrderChartSeries}
              type="pie"
              height={200}
            />
          ) : (
            <div
              style={{
                color: "white",
                textAlign: "center",
                paddingTop: "80px",
              }}
            >
              No data available
            </div>
          )}
        </Box>
      </Card>

      {/* Pick Request Chart */}
      <Card
        sx={{
          padding: "16px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "280px",
          height: "240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...glassStyle,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "600", mb: 1 }}
        >
          Pick Request
        </Typography>
        <Box sx={{ width: "100%", height: "100%" }}>
          {pickRequestChartSeries.some((val) => val > 0) ? (
            <ReactApexChart
              options={pickRequestChartOptions}
              series={pickRequestChartSeries}
              type="pie"
              height={200}
            />
          ) : (
            <div
              style={{
                color: "white",
                textAlign: "center",
                paddingTop: "80px",
              }}
            >
              No data available
            </div>
          )}
        </Box>
      </Card>

      {/* Dialogs for each chart type */}
      {renderDialog("grnCompleted", "Completed GRN", completedGRNData)}
      {renderDialog("grnPending", "Pending GRN", pendingGRNData)}
      {renderDialog(
        "putawayCompleted",
        "Completed Putaway",
        completedPutawayData
      )}
      {renderDialog("putawayPending", "Pending Putaway", pendingPutawayData)}
      {renderDialog(
        "buyerOrderCompleted",
        "Completed Buyer Orders",
        completedBuyerOrderData
      )}
      {renderDialog(
        "buyerOrderPending",
        "Pending Buyer Orders",
        pendingBuyerOrderData
      )}
      {renderDialog(
        "pickRequestCompleted",
        "Completed Pick Requests",
        completedPickRequestData
      )}
      {renderDialog(
        "pickRequestPending",
        "Pending Pick Requests",
        pendingPickRequestData
      )}
    </Box>
  );
};

// WarehouseOccupancyCard Component (unchanged)
const WarehouseOccupancyCard = ({ isLoading }) => {
  const hasDataLoaded = useRef(false);
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [warehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [occupancyData, setOccupancyData] = useState({
    occupied: 0,
    available: 0,
  });
  const [binDetails, setBinDetails] = useState([]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    fetchWarehouseDataForClient();
  }, []);

  const fetchWarehouseDataForClient = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboardController/getBinDetailsForClientWise?orgId=${orgId}&branchCode=${branchCode}&warehouse=${warehouse}&client=${client}`
      );
      if (response.data.status) {
        setBinDetails(response.data.paramObjectsMap.binDetails || []);
        calculateOccupancy(response.data.paramObjectsMap.binDetails);
      }
    } catch (error) {
      console.error("Error fetching warehouse client data:", error);
    }
  };

  const calculateOccupancy = (binDetails) => {
    const occupied = binDetails.filter(
      (bin) => bin.binStatus === "Occupied"
    ).length;
    const available = binDetails.filter(
      (bin) => bin.binStatus === "Empty"
    ).length;
    setOccupancyData({ occupied, available });
  };

  const data = [
    { name: "Occupied", value: occupancyData.occupied },
    { name: "Available", value: occupancyData.available },
  ];

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <CardWrapper>
          <Box
            sx={{
              cursor: "pointer",
              mb: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "-20px",
            }}
            onClick={handleDialogOpen}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "white" }}
            >
              Warehouse Occupancy
            </Typography>
            <Typography variant="body2" sx={{ color: "white" }}>
              <PreviewIcon sx={{ marginRight: 0 }} /> View
            </Typography>
          </Box>

          <Box sx={{ width: "100%", height: "100px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="70%"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "white" }}>
            {occupancyData.occupied} Occupied / {occupancyData.available}{" "}
            Available
          </Typography>
          <BinWiseData
            open={dialogOpen}
            onClose={handleDialogClose}
            occupancyData={occupancyData}
            binDetails={binDetails}
          />
        </CardWrapper>
      )}
    </>
  );
};

// Main Dashboard Component
const Dashboard1 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [completedGRNData, setCompletedGRNData] = useState([]);
  const [pendingGRNData, setPendingGRNData] = useState([]);
  const [completedPutawayData, setCompletedPutawayData] = useState([]);
  const [pendingPutawayData, setPendingPutawayData] = useState([]);
  const [completedBuyerOrderData, setCompletedBuyerOrderData] = useState([]);
  const [pendingBuyerOrderData, setPendingBuyerOrderData] = useState([]);
  const [completedPickRequestData, setCompletedPickRequestData] = useState([]);
  const [pendingPickRequestData, setPendingPickRequestData] = useState([]);

  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );

  const currentMonth = dayjs().format("YYYY-MM");

  const getAllGRNData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getGrnStatusForDashBoard?orgId=${orgId}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&warehouse=${loginWarehouse}&month=${currentMonth}`
      );

      if (response.data.status === true) {
        const grnData = response.data.paramObjectsMap.grnDashboard || [];
        const pendingList = grnData.filter((item) => item.status === "Pending");
        const completedList = grnData.filter(
          (item) => item.status === "Complete"
        );

        setPendingGRNData(pendingList);
        setCompletedGRNData(completedList);
      }
    } catch (error) {
      console.error("Error fetching GRN data:", error);
    }
  };

  const getAllPutawayData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/putaway/getPutawayForDashBoard?orgId=${orgId}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&month=${currentMonth}`
      );

      if (response.data.status === true) {
        const putawayData =
          response.data.paramObjectsMap.putawayDashboard || [];
        const pendingList = putawayData.filter(
          (item) => item.status === "Pending"
        );
        const completedList = putawayData.filter(
          (item) => item.status === "Complete"
        );

        setPendingPutawayData(pendingList);
        setCompletedPutawayData(completedList);
      }
    } catch (error) {
      console.error("Error fetching putaway data:", error);
    }
  };

  const getAllBuyerOrderData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getBuyerorderDashboard?orgId=${orgId}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&warehouse=${loginWarehouse}`
      );

      if (response.data.status === true) {
        const buyerOrderData =
          response.data.paramObjectsMap.buyerorderDashboard || [];
        const pendingList = buyerOrderData.filter(
          (item) => item.status === "Pending"
        );
        const completedList = buyerOrderData.filter(
          (item) => item.status === "Complete"
        );

        setPendingBuyerOrderData(pendingList);
        setCompletedBuyerOrderData(completedList);
      }
    } catch (error) {
      console.error("Error fetching buyer order data:", error);
    }
  };

  const getAllPickRequestData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/pickrequest/getPicrequestDashboard?orgId=${orgId}&branchCode=${branchCode}&client=${client}&finyear=${finYear}`
      );

      if (response.data.status === true) {
        const pickRequestData =
          response.data.paramObjectsMap.picrequestDashboard || [];
        const pendingList = pickRequestData.filter(
          (item) => item.status === "Pending"
        );
        const completedList = pickRequestData.filter(
          (item) => item.status === "Complete"
        );

        setPendingPickRequestData(pendingList);
        setCompletedPickRequestData(completedList);
      }
    } catch (error) {
      console.error("Error fetching pick request data:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        getAllGRNData(),
        getAllPutawayData(),
        getAllBuyerOrderData(),
        getAllPickRequestData(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <DashboardContainer>
      <Box
        className="form-containerSG"
        sx={{
          ...glassStyle,
          padding: "20px",
          marginTop: "0px",
          width: "90%",
          maxWidth: "1200px",
          maxHeight: "230px",
        }}
      >
        <Grid container spacing={3}>
          {/* Warehouse Occupancy Card */}
          <Grid item xs={12} sm={6} md={4}>
            <WarehouseOccupancyCard isLoading={isLoading} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard>
              <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                Inbound Orders
              </Typography>
              <Typography variant="h4" sx={{ color: "white" }}>
                {completedGRNData.length + pendingGRNData.length}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                GRN
              </Typography>
            </StatCard>
          </Grid>

          {/* Additional dashboard cards can be added here */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard>
              <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                Outbound Orders
              </Typography>
              <Typography variant="h4" sx={{ color: "white" }}>
                {completedBuyerOrderData.length + pendingBuyerOrderData.length}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Buyer Orders
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      </Box>

      {/* GaugeValueRangeNoSnap Component with all four charts */}
      <Box
        sx={{
          ...glassStyle,
          padding: "20px",
          marginTop: "20px",
          width: "90%",
          maxWidth: "1200px",
        }}
      >
        <GaugeValueRangeNoSnap
          completedGRNData={completedGRNData}
          pendingGRNData={pendingGRNData}
          completedPutawayData={completedPutawayData}
          pendingPutawayData={pendingPutawayData}
          completedBuyerOrderData={completedBuyerOrderData}
          pendingBuyerOrderData={pendingBuyerOrderData}
          completedPickRequestData={completedPickRequestData}
          pendingPickRequestData={pendingPickRequestData}
        />
      </Box>
    </DashboardContainer>
  );
};

export default Dashboard1;
