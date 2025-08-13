import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { encryptPassword } from "../utils/encPassword";

import { notification } from "antd";

import { getAllRoles } from "../services/api";
import ChangePasswordPopup from "../utils/changePassword";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

export const UserCreation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCode: "",
    nickName: "",
    email: "",
    password: "",
    userType: "",
    active: true,
  });
  const [roles, setRoles] = useState([
    { role: "", startDate: "", endDate: "" },
  ]);

  const [roledata, setRoleData] = useState([
    { role: "", startDate: "", endDate: "" },
  ]);

  const [isListView, setIsListView] = useState(false);
  const [userId, setUserId] = useState(null); // Tracks the selected user ID for editing
  const [users, setUsers] = useState([]); // User list for the embedded list view
  const [allUser, setAllUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState([]); // User list for the embedded list view
  const [data, setData] = useState([]);
  // Fetch data if in Edit Mode
  const [nickName, setNickName] = useState(null);
  const [editId, setEditId] = useState(false);

  useEffect(() => {
    fetchData();
    fetchRolesData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchRolesData = () => {
    setLoading(true);
    console.log("role", "test");
    getAllRoles()
      .then((response) => {
        setRoleData(response);
        setLoading(false);
        console.log("role", response);
      })
      .catch(() => {
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch updated data for the Roles.",
        });
        setLoading(false);
      });
  };

  const handleSelectUser = (id) => {
    setUserId(id);
    setIsListView(false);
  };

  const fetchUserData = async () => {
    setEditId(true);
    try {
      // Fetch user data by ID
      const response = await axios.get(
        `${API_URL}/api/auth/getUserById?userId=${userId}`
      );

      // Check if the response contains the expected user data
      if (response && response.data) {
        const user = response.data.paramObjectsMap.userVO;

        // Safely set form data, using default values if some fields are missing
        setFormData({
          employeeName: user.employeeName || "",
          employeeCode: user.employeeCode || "",
          nickName: user.nickName || "",
          email: user.email || "",
          password: "", // Do not set the password for security
          userType: user.userType || "",
          active: user.active !== undefined ? user.active : true,
          id: user.id || null,
        });

        // Safely set roles, ensuring `roleAccessVO` exists and is an array
        setRoles(
          Array.isArray(user.roleAccessVO)
            ? user.roleAccessVO.map((role) => ({
                role: role.role || "",
                startDate: role.startDate || "",
                endDate: role.endDate || "",
              }))
            : [] // Default to an empty array if `roleAccessVO` is missing or invalid
        );
      } else {
        console.error("Invalid user data format:", response);
        alert("Failed to load user details. Invalid response format.");
      }
    } catch (error) {
      // Log error details and display a user-friendly message
      console.error("Error fetching user data:", error);
      alert("An error occurred while fetching user details. Please try again.");
    }
  };

  const fetchData = () => {
    setLoading(true);
    getAllUsers()
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch(() => {
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch updated data for the listing.",
        });
        setLoading(false);
      });
  };

  // const fetchData = () => {
  //   setLoading(true);
  //   getAllUsers()
  //     .then((response) => {
  //       setAllUser(response);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       notification.error({
  //         message: "Data Fetch Error",
  //         description: "Failed to fetch updated data for the listing.",
  //       });
  //       setLoading(false);
  //     });
  // };

  const handleClear = () => {
    setFormData({
      employeeName: "",
      employeeCode: "",
      nickName: "",
      email: "",
      password: "",
      userType: "",
      active: true,
    });
    setRoles([{ role: "", startDate: "", endDate: "" }]);
    setEditId(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = roles.map((role, i) =>
      i === index ? { ...role, [field]: value } : role
    );
    setRoles(updatedRoles);
  };

  const handleAddRole = () => {
    setRoles([...roles, { role: "", startDate: "", endDate: "" }]);
  };

  const handleDeleteRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Basic validation
    if (
      !formData.employeeName ||
      !formData.employeeCode ||
      !formData.userType ||
      !formData.email
      // ||
      // (!userId && !formData.password) // Password is required for new users
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      active: formData.active === "Active" ? true : false,
      email: formData.email,
      employeeCode: formData.employeeCode,
      employeeName: formData.employeeName,
      nickName: formData.nickName,
      password: userId ? undefined : encryptPassword(formData.password), // Don't send password if editing
      ppassword: formData.password,
      userType: formData.userType,
      roleAccessDTO: roles.map((role) => ({
        role: role.role,
        startDate: role.startDate,
        endDate: role.endDate,
        roleId: 0, // Default value
      })),
      userName: formData.employeeCode,
      id: editId ? formData.id : undefined,
    };

    try {
      const response = userId
        ? await axios.put(`${API_URL}/api/auth/signup`, payload) // Update user
        : await axios.put(`${API_URL}/api/auth/signup`, payload); // Create user

      if (response.status === 200 || response.status === 201) {
        alert(
          userId ? "User updated successfully!" : "User created successfully!"
        );
        handleClear();
        onBack(); // Navigate back to list
      } else {
        alert("Failed to save user.");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("An error occurred while saving.");
    }
  };

  const onBack = () => {
    setIsListView(false);
  };

  const handleBackToList = () => {
    setIsListView(true);
    setUserId(null); // Clear the selected user
    handleClear();
  };

  return isListView ? (
    <Box
      sx={{ padding: 2, backgroundColor: "#F3F4F6", borderRadius: 2, mt: 8 }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        User List
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Tooltip title="New">
          <IconButton onClick={onBack}>
            <AddIcon sx={{ color: "#28a745" }} />
          </IconButton>
        </Tooltip>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Employee Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>User Type</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  sx={{
                    cursor: "pointer",
                    color: "#007bff",
                    textDecoration: "underline",
                  }}
                  onClick={() => handleSelectUser(user.id)}
                >
                  {user.nickName}
                </TableCell>

                <TableCell>{user.email}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <Tooltip title="Edit User">
                    <IconButton onClick={() => handleSelectUser(user.id)}>
                      <EditIcon sx={{ color: "#ffc107" }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <Box
      sx={{ padding: 2, backgroundColor: "#F3F4F6", borderRadius: 2, mt: 8 }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h5">
          {userId ? "Edit User" : "Create User"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <ChangePasswordPopup />
          <Tooltip title="Search">
            <IconButton>
              <SearchIcon sx={{ color: "#007bff" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={handleClear}>
              <CloseIcon sx={{ color: "#dc3545" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View List">
            <IconButton onClick={handleBackToList}>
              <ListAltIcon sx={{ color: "#28a745" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save">
            <IconButton onClick={handleSave}>
              <SaveIcon sx={{ color: "#ffc107" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Rest of the form remains the same */}
      <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {[
            {
              label: "Employee Name",
              name: "employeeName",
              value: "{formData.employeeName}",
            },
            { label: "Employee Code", name: "employeeCode" },
            { label: "Nick Name", name: "nickName", value: { nickName } },
            { label: "Email", name: "email" },
            { label: "Password", name: "password" },
          ].map((field) => (
            <Grid item xs={3} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                type={field.name === "password" ? "password" : "text"}
                value={formData[field.name]}
                onChange={handleInputChange}
                size="small"
                fullWidth
              />
            </Grid>
          ))}
          <Grid item xs={3}>
            <Select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              size="small"
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select User Type
              </MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="approve1">Approve1</MenuItem>
              <MenuItem value="approve2">Approve2</MenuItem>
              <MenuItem value="approve3">Approve3</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
              <Typography>Active</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Roles Tab */}
      <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Tabs value={tabIndex} onChange={(_, index) => setTabIndex(index)}>
            <Tab label="Roles" />
          </Tabs>
          {tabIndex === 0 && (
            <Button
              variant="outlined"
              onClick={handleAddRole}
              startIcon={<AddCircleOutlineIcon />}
            >
              Add Role
            </Button>
          )}
        </Box>

        {tabIndex === 0 && (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: 3 }}
          >
            <Table>
              {/* Table Header */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Action</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {roles?.map((role, index) => (
                  <TableRow key={index}>
                    {/* Action Column */}
                    <TableCell>
                      <Tooltip title="Delete Role">
                        <IconButton onClick={() => handleDeleteRole(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    {/* Role Selection Column */}
                    <TableCell>
                      <Select
                        size="small"
                        value={roles[index]?.role || ""} // Correctly set the value for the specific role
                        onChange={(e) =>
                          handleRoleChange(index, "role", e.target.value)
                        } // Update the role in the roles state
                        fullWidth
                      >
                        {roledata.map((roleOption) => (
                          <MenuItem key={roleOption.id} value={roleOption.role}>
                            {roleOption.role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>

                    {/* Start Date Column */}
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={role.startDate || ""}
                        onChange={(e) =>
                          handleRoleChange(index, "startDate", e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    {/* End Date Column */}
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={role.endDate || ""}
                        onChange={(e) =>
                          handleRoleChange(index, "endDate", e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};
