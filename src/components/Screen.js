import {
  Box,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import TableComp from "../utils/TableComp";
import ResponsibilitiesTab from "./Roles/ResponsibilitiesTab";
import RolesTab from "./Roles/RolesTab";
import ScreenTab from "./Roles/ScreenTab";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

export const Screen = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [screenDataList, setScreenDataList] = useState([]);
  const [resDataList, setResDataList] = useState([]);
  const [roleDataList, setRoleDataList] = useState([]);
  // State for tab 1 (Screen)
  const [screenData, setScreenData] = useState({
    screenCode: "",
    screenName: "",
    active: "",
  });

  const [screenListView, setScreenListView] = useState(false);
  const [resListView, setResListView] = useState(false);
  const [roleListView, setRoleListView] = useState(false);
  const [editId, setEditId] = useState(false);

  const handleScreenList = () => {
    setScreenListView(!screenListView);
  };

  const handleResList = () => {
    setResListView(!resListView);
  };

  const handleRoleList = () => {
    setRoleListView(!roleListView);
  };

  // State for tab 2 (Responsibilities)
  const [responsibilitiesData, setResponsibilitiesData] = useState({
    responsibility: "",
    screenName: [],
    active: false,
  });

  // State for tab 3 (Roles)
  const [rolesData, setRolesData] = useState({
    role: "",
    responsibility: "",
    active: false,
  });

  useEffect(() => {
    getScreenNames();
    getResponsibility();
    getRole();
  }, []);

  // Handle input changes for fields in each tab
  const handleScreenChange = (e) => {
    const { name, value } = e.target;
    setScreenData({ ...screenData, [name]: value });
    console.log("Screen", screenData);
  };

  const handleResponsibilitiesChange = (event) => {
    const { name, value } = event.target;

    if (name === "screenName") {
      // Handle multi-select for screen
      setResponsibilitiesData((prevState) => ({
        ...prevState,
        [name]: typeof value === "string" ? value.split(",") : value,
      }));
    } else {
      setResponsibilitiesData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleRolesChange = (e) => {
    const { name, value } = e.target;
    setRolesData({ ...rolesData, [name]: value });
  };

  const handleClearScreen = () => {
    setScreenData({
      screenCode: "",
      screenName: "",
      active: "",
    });
  };

  const handleClearRes = () => {
    setResponsibilitiesData({
      responsibility: "",
      screenName: "",
      active: false,
    });
  };

  const handleClearRole = () => {
    setRolesData({
      role: "",
      responsibility: "",
      active: false,
    });
  };

  const screenHeaders = ["id", "screenName", "screenCode", "active"]; // Example header
  const resHeaders = ["id", "responsibility", "screenName", "active"]; // Example header
  const roleHeaders = ["id", "role", "responsibility", "active"]; // Example header

  const getScreenNames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/getAllScreenNames`);

      if (response.status === 200) {
        // Extract only the screenName values and set them in screenData

        setScreenDataList(response.data.paramObjectsMap.screenNamesVO); // Setting only screenName values in the state
      } else {
        console.error("Failed to fetch screen names");
      }
    } catch (error) {
      console.error("Error fetching screen names:", error);
      alert("Error occurred while fetching screen names.");
    }
  };

  const getScreenById = async (row) => {
    setEditId(true);
    setScreenListView(false);

    console.log("Test", row);
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/screenNamesById?id=${row.id}`
      );

      if (response.status === 200) {
        // Extract only the screenName values and set them in screenData

        const screen = response.data.paramObjectsMap.screenNamesVO;

        setScreenData({
          screenCode: screen.screenCode,
          screenName: screen.screenName,
          active: screen.active === "Active" ? true : false,
          id: screen.id,
        });
      } else {
        console.error("Failed to fetch screen names");
      }
    } catch (error) {
      console.error("Error fetching screen names:", error);
      alert("Error occurred while fetching screen names.");
    }
  };

  const handleScreenSave = async () => {
    // Validate input fields
    if (!screenData.screenCode || screenData.screenCode.trim() === "") {
      alert("Screen Code is required.");
      return;
    }
    if (!screenData.screenName || screenData.screenName.trim() === "") {
      alert("Screen Name is required.");
      return;
    }

    const payload = {
      active: screenData.active,
      createdBy: localStorage.getItem("userName"),
      screenCode: screenData.screenCode,
      screenName: screenData.screenName,
      id: editId ? screenData.id : undefined, // Include 'id' only if 'editId' is true
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/createUpdateScreenNames`,
        payload
      );

      if (response.data.status === true) {
        getScreenNames(); // Replace with your sound file path
        handleClearScreen();

        // Success logic here
        // notification.success({
        //   message: `Item ${item.id} Rejected`,
        //   description: `You have rejected item ${item.id}.`,
        // });
        // fetchData();
        // setIsModalOpen(false);
      } else {
        // Handle failure response
        // notification.error({
        //   message: `Item ${item.id} failed`,
        // });
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      alert(errorMessage); // Show error message
    }
  };

  const getResponsibility = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/allResponsibility`);

      if (response.status === 200) {
        const responsibilityData =
          response.data.paramObjectsMap.responsibilityVO;

        // Transform the data for the table
        const transformedData = transformDataForTable(responsibilityData);
        setResDataList(transformedData);
      } else {
        console.error("Failed to fetch responsibilities");
      }
    } catch (error) {
      console.error("Error fetching responsibilities:", error);
      alert("Error occurred while fetching responsibilities.");
    }
  };

  const getResById = async (row) => {
    setEditId(true);
    setResListView(false);

    try {
      const response = await axios.get(
        `${API_URL}/api/auth/responsibilityById?id=${row.id}`
      );

      if (response.status === 200) {
        const screen = response.data.paramObjectsMap.responsibilityVO;

        // Map the screen names from the API response
        const screenNames = screen.screensVO.map((screen) => screen.screenName);

        setResponsibilitiesData({
          responsibility: screen.responsibility,
          screenName: screenNames, // Set screenName as an array of names
          active: screen.active === "Active" ? true : false,
          id: screen.id,
        });
      } else {
        console.error("Failed to fetch responsibility details");
      }
    } catch (error) {
      console.error("Error fetching responsibility details:", error);
      alert("Error occurred while fetching responsibility details.");
    }
  };

  const getRoleById = async (row) => {
    setEditId(true);
    setRoleListView(false);

    console.log("Test", row);
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/rolesById?id=${row.id}`
      );

      if (response.status === 200) {
        // Extract only the screenName values and set them in screenData

        const screen = response.data.paramObjectsMap.rolesVO;
        const screenNames = screen.rolesReposibilitiesVO.map(
          (screen) => screen.responsibility
        );

        setRolesData({
          role: screen.role,
          responsibility: screenNames,
          active: screen.active === "Active" ? true : false,
          id: screen.id,
        });
      } else {
        console.error("Failed to fetch screen names");
      }
    } catch (error) {
      console.error("Error fetching screen names:", error);
      alert("Error occurred while fetching screen names.");
    }
  };

  const getRole = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/allRoles`);

      if (response.status === 200) {
        // Extract only the screenName values and set them in screenData
        // Setting only screenName values in the state
        const roleData = response.data.paramObjectsMap.rolesVO;

        const transformedData = transformDataForTableForRole(roleData);
        setRoleDataList(transformedData);
      } else {
        console.error("Failed to fetch screen names");
      }
    } catch (error) {
      console.error("Error fetching screen names:", error);
      alert("Error occurred while fetching screen names.");
    }
  };

  const handleResponsibilitiesSave = async () => {
    // Validate input fields
    if (
      !responsibilitiesData.responsibility ||
      responsibilitiesData.responsibility === ""
    ) {
      alert("Responsibility is required.");
      return;
    }
    if (
      !responsibilitiesData.screenName ||
      responsibilitiesData.screenName === ""
    ) {
      alert("Screen Name is required.");
      return;
    }

    const payload = {
      active: responsibilitiesData.active,
      createdBy: localStorage.getItem("userName"),
      responsibility: responsibilitiesData.responsibility, // Assuming 'responsibility' maps to 'name'
      screensDTO: responsibilitiesData.screenName.map((screenName) => ({
        screenName,
      })),
      id: editId ? responsibilitiesData.id : undefined,
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/createUpdateResponsibility`,
        payload
      );

      if (response.data.status === true) {
        handleClearRes();
        getResponsibility();
      } else {
        // Handle failure response
        // notification.error({
        //   message: `Item ${item.id} failed`,
        // });
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      alert(errorMessage); // Show error message
    }
  };

  const handleRolesSave = async () => {
    // Validate input fields
    if (!rolesData.responsibility || rolesData.responsibility === "") {
      alert("Responsibility is required.");
      return;
    }
    if (!rolesData.role || rolesData.role === "") {
      alert("Screen Name is required.");
      return;
    }

    const payload = {
      active: rolesData.active,
      createdBy: localStorage.getItem("userName"),
      rolesResponsibilityDTO: rolesData.responsibility.map(
        (responsibility) => ({
          responsibility,
        })
      ),
      role: rolesData.role,
      id: editId ? rolesData.id : undefined,
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/createUpdateRoles`,
        payload
      );

      if (response.data.status === true) {
        handleClearRole();
        getRole();

        // Success logic here
        // notification.success({
        //   message: `Item ${item.id} Rejected`,
        //   description: `You have rejected item ${item.id}.`,
        // });
        // fetchData();
        // setIsModalOpen(false);
      } else {
        // Handle failure response
        // notification.error({
        //   message: `Item ${item.id} failed`,
        // });
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      alert(errorMessage); // Show error message
    }
  };

  const transformDataForTable = (responsibilityData) => {
    return responsibilityData.map((item) => ({
      id: item.id,
      responsibility: item.responsibility,
      screenName: item.screensVO.map((screen) => screen.screenName).join(", "),
      active: item.active,
      createdBy: item.createdBy,
    }));
  };

  const transformDataForTableForRole = (RoleData) => {
    return RoleData.map((item) => ({
      id: item.id,
      role: item.role,
      responsibility: item.rolesReposibilitiesVO
        .map((screen) => screen.responsibility)
        .join(", "),
      active: item.active,
    }));
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#F3F4F6", borderRadius: 2 }}>
      {/* Header with Icons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 1, mt: 4 }}
      >
        <Typography variant="h5">Roles And Responsibilities</Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2 }}>
        <Tabs value={tabIndex} onChange={(_, index) => setTabIndex(index)}>
          <Tab label="Screen" />
          <Tab label="Responsibilities" />
          <Tab label="Roles" />
        </Tabs>

        {/* Tab 1: Screen */}
        {tabIndex === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  {/* <Typography variant="h6">Screen</Typography> */}

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Search">
                      <IconButton>
                        <SearchIcon sx={{ color: "#007bff" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                      <IconButton onClick={handleClearScreen}>
                        <CloseIcon sx={{ color: "#dc3545" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View List">
                      <IconButton onClick={handleScreenList}>
                        <ListAltIcon sx={{ color: "#28a745" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton onClick={handleScreenSave}>
                        <SaveIcon sx={{ color: "#ffc107" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {screenListView ? (
              <TableComp
                headers={screenHeaders}
                data={screenDataList}
                onEdit={getScreenById}
              />
            ) : (
              <ScreenTab
                screenData={screenData}
                handleScreenChange={handleScreenChange}
              />
            )}

            {/* <CommonTable /> */}
          </Box>
        )}

        {/* Tab 2: Responsibilities */}
        {tabIndex === 1 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Search">
                      <IconButton>
                        <SearchIcon sx={{ color: "#007bff" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                      <IconButton onClick={handleClearRes}>
                        <CloseIcon sx={{ color: "#dc3545" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View List">
                      <IconButton onClick={handleResList}>
                        <ListAltIcon sx={{ color: "#28a745" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton onClick={handleResponsibilitiesSave}>
                        <SaveIcon sx={{ color: "#ffc107" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {resListView ? (
              <TableComp
                headers={resHeaders}
                data={resDataList}
                onEdit={getResById}
              />
            ) : (
              <ResponsibilitiesTab
                responsibilitiesData={responsibilitiesData}
                handleResponsibilitiesChange={handleResponsibilitiesChange}
              />
            )}
          </Box>
        )}

        {/* Tab 3: Roles */}
        {tabIndex === 2 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Search">
                      <IconButton>
                        <SearchIcon sx={{ color: "#007bff" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                      <IconButton onClick={handleClearRole}>
                        <CloseIcon sx={{ color: "#dc3545" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View List">
                      <IconButton onClick={handleRoleList}>
                        <ListAltIcon sx={{ color: "#28a745" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton onClick={handleRolesSave}>
                        <SaveIcon sx={{ color: "#ffc107" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {roleListView ? (
              <TableComp
                headers={roleHeaders}
                data={roleDataList}
                onEdit={getRoleById}
              />
            ) : (
              <RolesTab
                rolesData={rolesData}
                handleRolesChange={handleRolesChange}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
