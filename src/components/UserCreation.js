import AddIcon from "@mui/icons-material/Add";
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
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
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
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { encryptPassword } from "../utils/encPassword";
import { notification } from "antd";
import ChangePasswordPopup from "../utils/changePassword";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const UserCreation = () => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [tabIndex, setTabIndex] = useState(0);
  const [branchList, setBranchList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCode: "",
    nickName: "",
    email: "",
    password: "",
    userType: "",
    mobileNo: "",
    active: true,
  });

  const [roles, setRoles] = useState([
    { role: "", roleId: "", startDate: null, endDate: null, id: generateId() },
  ]);
  const [branches, setBranches] = useState([
    { branchCode: "", branch: "", id: generateId() },
  ]);
  const [clients, setClients] = useState([
    { customer: "", client: "", rowClientList: [], id: generateId() },
  ]);
  const [branchData, setBranchData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  const [roleErrors, setRoleErrors] = useState([
    { role: "", startDate: "", endDate: "" },
  ]);
  const [branchErrors, setBranchErrors] = useState([{ branchCode: "" }]);
  const [clientErrors, setClientErrors] = useState([
    { customer: "", client: "" },
  ]);
  const [fieldErrors, setFieldErrors] = useState({
    employeeName: "",
    employeeCode: "",
    nickName: "",
    email: "",
    mobileNo: "",
    userType: "",
  });

  const [isListView, setIsListView] = useState(false);
  const [editId, setEditId] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem("usersId"));
  const [loading, setLoading] = useState({
    roles: false,
    branches: false,
    clients: false,
    employees: false,
  });

  // Helper function to generate unique IDs
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  useEffect(() => {
    fetchInitialData();
  }, [orgId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchData(),
        fetchRolesData(),
        fetchBranchesData(),
        fetchCustomersData(),
        fetchEmployeesData(),
        getAllBranches(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      notification.error({
        message: "Initialization Error",
        description: "Failed to load initial data",
      });
    }
  };

  const fetchCustomersData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/customer?orgid=${orgId}`
      );
      if (response.data.status === true) {
        setCustomerList(response.data.paramObjectsMap.CustomerVO);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchEmployeesData = async () => {
    setLoading((prev) => ({ ...prev, employees: true }));
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`
      );
      if (response.data.status === true) {
        setEmployeeList(response.data.paramObjectsMap.employeeVO || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployeeList([]);
    } finally {
      setLoading((prev) => ({ ...prev, employees: false }));
    }
  };

  const fetchClientsByCustomer = async (customer, rowId) => {
    setLoading((prev) => ({ ...prev, clients: true }));
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/client?customer=${customer}&orgid=${orgId}`
      );
      if (response.data.status === true) {
        setClients((prev) =>
          prev.map((item) =>
            item.id === rowId
              ? {
                  ...item,
                  rowClientList: response.data.paramObjectsMap.clientVO || [],
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading((prev) => ({ ...prev, clients: false }));
    }
  };

  const getAllActiveBranches = async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/branch?orgid=${orgId}`
      );
      if (response.data.status === true) {
        return response.data.paramObjectsMap.branchVO
          .filter((row) => row.active === "Active")
          .map(({ id, branch, branchCode }) => ({ id, branch, branchCode }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchBranchesData = async () => {
    setLoading((prev) => ({ ...prev, branches: true }));
    try {
      const response = await getAllActiveBranches(orgId);
      if (response && Array.isArray(response)) {
        setBranchData(response);
      } else {
        setBranchData([]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranchData([]);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branches data.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, branches: false }));
    }
  };

  const fetchRolesData = async () => {
    setLoading((prev) => ({ ...prev, roles: true }));
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/allActiveRolesByOrgId?orgId=${orgId}`
      );
      if (response.data.status === true) {
        setRoleList(response.data.paramObjectsMap.rolesVO || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoleList([]);
    } finally {
      setLoading((prev) => ({ ...prev, roles: false }));
    }
  };

  const handleSelectUser = (id) => {
    setUserId(id);
    setIsListView(false);
  };

  // In fetchUserData
  const fetchUserData = async () => {
    setEditId(true);
    try {
      // First ensure all necessary data is loaded
      await Promise.all([
        fetchRolesData(),
        fetchBranchesData(),
        fetchCustomersData(),
      ]);

      const response = await axios.get(
        `${API_URL}/api/auth/getUserById?userId=${userId}`
      );

      if (response?.data?.paramObjectsMap?.userVO) {
        const user = response.data.paramObjectsMap.userVO;

        // Initialize formData with proper defaults
        setFormData({
          employeeName: user.employeeName || "",
          employeeCode: user.userName || "",
          nickName: user.nickName || "",
          email: user.email || "",
          password: "",
          userType: user.userType,
          mobileNo: user.mobileNo || "",
          active: user.active !== undefined ? user.active : true,
          id: user.id || null,
        });

        // Set roles with proper roleId mapping
        const rolesWithIds = Array.isArray(user.roleAccessVO)
          ? user.roleAccessVO.map((role) => {
              const fullRole = roleList.find((r) => r.role === role.role) || {};
              return {
                role: role.role || "",
                roleId: fullRole.id || role.roleId || "",
                startDate: role.startDate ? new Date(role.startDate) : null,
                endDate: role.endDate ? new Date(role.endDate) : null,
                id: generateId(),
              };
            })
          : [
              {
                role: "",
                roleId: "",
                startDate: null,
                endDate: null,
                id: generateId(),
              },
            ];
        setRoles(rolesWithIds);

        // Set branches - ensure we have the latest branch data first
        const branchData = await getAllActiveBranches(orgId);
        const branchesWithIds = Array.isArray(user.branchAccessibleVO)
          ? user.branchAccessibleVO.map((branch) => {
              // Find the branch in the latest branch data
              const fullBranch = branchData.find(
                (b) =>
                  b.branchCode === branch.branchCode ||
                  b.branch === branch.branch
              );
              return {
                branchCode: fullBranch
                  ? fullBranch.branchCode
                  : branch.branchCode || "",
                branch: fullBranch ? fullBranch.branch : branch.branch || "",
                id: generateId(),
              };
            })
          : [{ branchCode: "", branch: "", id: generateId() }];
        setBranches(branchesWithIds);

        // Set clients with proper client lists
        if (Array.isArray(user.clientAccessVO)) {
          const clientsWithData = await Promise.all(
            user.clientAccessVO.map(async (client) => {
              // Fetch clients for this customer
              const clientsResponse = await axios.get(
                `${API_URL}/api/warehousemastercontroller/client?customer=${client.customer}&orgid=${orgId}`
              );

              const rowClientList =
                clientsResponse.data.status === true
                  ? clientsResponse.data.paramObjectsMap.clientVO || []
                  : [];

              return {
                customer: client.customer || "",
                client: client.client || "",
                rowClientList: rowClientList,
                id: generateId(),
              };
            })
          );
          setClients(clientsWithData);
        } else {
          setClients([
            { customer: "", client: "", rowClientList: [], id: generateId() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while fetching user details.",
      });
    }
  };

  useEffect(() => {
    console.log("Form Data:", formData);
    console.log("Roles:", roles);
    console.log("Branches:", branches);
    console.log("Clients:", clients);
  }, [formData, roles, branches, clients]);

  // Set branches with proper branch mapping
  // Set branches with proper branch mapping

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/allUsersByOrgId?orgId=${orgId}`
      );
      if (response.data.status === true) {
        setListViewData(response.data.paramObjectsMap.userVO || []);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
      setListViewData([]);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeName: "",
      employeeCode: "",
      nickName: "",
      email: "",
      password: "",
      userType: "",
      mobileNo: "",
      active: true,
    });
    setRoles([
      {
        role: "",
        roleId: "",
        startDate: null,
        endDate: null,
        id: generateId(),
      },
    ]);
    setBranches([{ branchCode: "", branch: "", id: generateId() }]);
    setClients([
      { customer: "", client: "", rowClientList: [], id: generateId() },
    ]);
    setRoleErrors([{ role: "", startDate: "", endDate: "" }]);
    setBranchErrors([{ branchCode: "" }]);
    setClientErrors([{ customer: "", client: "" }]);
    setFieldErrors({
      employeeName: "",
      employeeCode: "",
      nickName: "",
      email: "",
      mobileNo: "",
      userType: "",
    });
    setEditId(false);
    setUserId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let errorMessage = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numericRegex = /^[0-9]*$/;

    switch (name) {
      case "email":
        if (!emailRegex.test(value)) {
          errorMessage = "Invalid email format";
        }
        break;
      case "mobileNo":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numbers allowed";
        } else if (value.length > 10) {
          errorMessage = "Mobile number must be 10 digits";
        }
        break;
      case "employeeName":
        const selectedEmp = employeeList.find(
          (emp) => emp.employeeName === value
        );
        if (selectedEmp) {
          setFormData((prev) => ({
            ...prev,
            employeeName: selectedEmp.employeeName,
            employeeCode: selectedEmp.employeeCode || "",
            [name]: value,
          }));
          return;
        }
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleActiveChange = (e) => {
    setFormData({ ...formData, active: e.target.checked });
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = roles.map((role, i) =>
      i === index ? { ...role, [field]: value } : role
    );
    setRoles(updatedRoles);

    if (field === "role") {
      const selectedRole = roleList.find((r) => r.role === value);
      if (selectedRole) {
        const updatedRolesWithId = updatedRoles.map((role, i) =>
          i === index ? { ...role, roleId: selectedRole.id } : role
        );
        setRoles(updatedRolesWithId);
      }
    }

    const newErrors = [...roleErrors];
    newErrors[index] = {
      ...newErrors[index],
      [field]: !value ? `${field} is required` : "",
    };
    setRoleErrors(newErrors);
  };

  const handleBranchChange = (index, field, value) => {
    const updatedBranches = branches.map((branch, i) => {
      if (i === index) {
        // When branchCode is selected, update both branchCode and branch name
        if (field === "branchCode") {
          const selectedBranch = branchData.find((b) => b.branchCode === value);
          return {
            ...branch,
            branchCode: value,
            branch: selectedBranch ? selectedBranch.branch : "",
          };
        }
        return { ...branch, [field]: value };
      }
      return branch;
    });
    setBranches(updatedBranches);

    const newErrors = [...branchErrors];
    newErrors[index] = {
      ...newErrors[index],
      [field]: !value ? `${field} is required` : "",
    };
    setBranchErrors(newErrors);
  };

  const handleClientChange = (index, field, value) => {
    const updatedClients = clients.map((client, i) => {
      if (i === index) {
        const updatedClient = { ...client, [field]: value };
        if (field === "customer") {
          fetchClientsByCustomer(value, client.id);
          updatedClient.client = "";
        }
        return updatedClient;
      }
      return client;
    });
    setClients(updatedClients);

    const newErrors = [...clientErrors];
    newErrors[index] = {
      ...newErrors[index],
      [field]: !value ? `${field} is required` : "",
    };
    setClientErrors(newErrors);
  };

  const handleAddRole = () => {
    if (isLastRowEmpty(roles)) {
      displayRowError(roles, "role");
      return;
    }
    setRoles([
      ...roles,
      {
        role: "",
        roleId: "",
        startDate: null,
        endDate: null,
        id: generateId(),
      },
    ]);
    setRoleErrors([...roleErrors, { role: "", startDate: "", endDate: "" }]);
  };

  const handleAddBranch = () => {
    if (isLastRowEmpty(branches)) {
      displayRowError(branches, "branch");
      return;
    }
    setBranches([
      ...branches,
      { branchCode: "", branch: "", id: generateId() },
    ]);
    setBranchErrors([...branchErrors, { branchCode: "" }]);
  };

  const handleAddClient = () => {
    if (isLastRowEmpty(clients)) {
      displayRowError(clients, "client");
      return;
    }
    setClients([
      ...clients,
      { customer: "", client: "", rowClientList: [], id: generateId() },
    ]);
    setClientErrors([...clientErrors, { customer: "", client: "" }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === roles) {
      return !lastRow.role || !lastRow.startDate;
    } else if (table === branches) {
      return !lastRow.branchCode;
    } else if (table === clients) {
      return !lastRow.customer || !lastRow.client;
    }
    return false;
  };

  const displayRowError = (table, type) => {
    if (type === "role") {
      setRoleErrors((prev) => {
        const newErrors = [...prev];
        newErrors[table.length - 1] = {
          role: !table[table.length - 1].role ? "Role is required" : "",
          startDate: !table[table.length - 1].startDate
            ? "Start date is required"
            : "",
          endDate: !table[table.length - 1].endDate
            ? "End date is required"
            : "",
        };
        return newErrors;
      });
    } else if (type === "branch") {
      setBranchErrors((prev) => {
        const newErrors = [...prev];
        newErrors[table.length - 1] = {
          branchCode: !table[table.length - 1].branchCode
            ? "Branch code is required"
            : "",
        };
        return newErrors;
      });
    } else if (type === "client") {
      setClientErrors((prev) => {
        const newErrors = [...prev];
        newErrors[table.length - 1] = {
          customer: !table[table.length - 1].customer
            ? "Customer is required"
            : "",
          client: !table[table.length - 1].client ? "Client is required" : "",
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
    setRoleErrors(roleErrors.filter((_, i) => i !== index));
  };

  const handleDeleteBranch = (index) => {
    setBranches(branches.filter((_, i) => i !== index));
    setBranchErrors(branchErrors.filter((_, i) => i !== index));
  };

  const handleDeleteClient = (index) => {
    setClients(clients.filter((_, i) => i !== index));
    setClientErrors(clientErrors.filter((_, i) => i !== index));
  };

  const getAvailableBranches = (currentIndex) => {
    if (!branchData || !Array.isArray(branchData)) return [];

    const selectedBranchCodes = branches
      .filter((_, i) => i !== currentIndex)
      .map((b) => b.branchCode);
    return branchData.filter(
      (b) => !selectedBranchCodes.includes(b.branchCode)
    );
  };

  const getAvailableRoles = (currentIndex) => {
    if (!Array.isArray(roleList)) return [];

    const selectedRoles = roles
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.role);
    return roleList.filter((r) => !selectedRoles.includes(r.role));
  };

  const handleSave = async () => {
    // Validate required fields
    const errors = {};
    if (!formData.employeeName)
      errors.employeeName = "Employee name is required";
    if (!formData.employeeCode)
      errors.employeeCode = "Employee code is required";
    if (!formData.nickName) errors.nickName = "Nick name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.userType) errors.userType = "User type is required";
    if (!formData.mobileNo) errors.mobileNo = "Mobile number is required";

    // Validate roles
    const roleValidation = roles.map((role) => ({
      role: !role.role ? "Role is required" : "",
      startDate: !role.startDate ? "Start date is required" : "",
      endDate: !role.endDate ? "End date is required" : "",
    }));

    // Validate branches
    const branchValidation = branches.map((branch) => ({
      branchCode: !branch.branchCode ? "Branch code is required" : "",
    }));

    // Validate clients
    const clientValidation = clients.map((client) => ({
      customer: !client.customer ? "Customer is required" : "",
      client: !client.client ? "Client is required" : "",
    }));

    // Set all errors
    setFieldErrors(errors);
    setRoleErrors(roleValidation);
    setBranchErrors(branchValidation);
    setClientErrors(clientValidation);

    // Check if any errors exist
    const hasErrors =
      Object.values(errors).some(Boolean) ||
      roleValidation.some((r) => r.role || r.startDate || r.endDate) ||
      branchValidation.some((b) => b.branchCode) ||
      clientValidation.some((c) => c.customer || c.client);

    if (hasErrors) {
      notification.error({
        message: "Validation Error",
        description: "Please fill all required fields correctly",
      });
      return;
    }

    // Prepare payload
    const payload = {
      active: formData.active,
      email: formData.email,
      employeeName: formData.employeeName,
      nickName: formData.nickName,
      mobileNo: formData.mobileNo,
      password: userId ? undefined : encryptPassword(formData.password),
      userType: formData.userType.toUpperCase(), // Ensure uppercase
      roleAccessDTO: roles.map((role) => ({
        role: role.role,
        roleId: role.roleId ? parseInt(role.roleId) : 0,
        startDate: dayjs(role.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(role.endDate).format("YYYY-MM-DD"),
      })),
      branchAccessDTOList: branches.map((branch) => ({
        branchCode: branch.branchCode,
        branch: branch.branch,
      })),
      clientAccessDTOList: clients.map((client) => ({
        customer: client.customer,
        client: client.client,
      })),
      userName: formData.employeeCode,
      orgId: parseInt(orgId),
      id: editId ? parseInt(formData.id) : 0,
    };

    // Log payload for debugging
    console.log("Sending payload:", payload);

    try {
      // Determine if we're creating or updating
      const response = await axios.put(`${API_URL}/api/auth/signup`, payload);

      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: "Success",
          description: editId
            ? "User updated successfully"
            : "User created successfully",
        });
        handleClear();
        fetchData();
        setIsListView(true);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      let errorMessage = "An error occurred while saving user";

      if (error.response) {
        errorMessage =
          error.response.data.message ||
          JSON.stringify(error.response.data) ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "No response received from server";
      }

      notification.error({
        message: "Error",
        description: errorMessage,
      });
    }
  };

  // const handleSave = async () => {
  //   const errors = {};
  //   if (!formData.employeeName)
  //     errors.employeeName = "Employee name is required";
  //   if (!formData.employeeCode)
  //     errors.employeeCode = "Employee code is required";
  //   if (!formData.nickName) errors.nickName = "Nick name is required";
  //   if (!formData.email) errors.email = "Email is required";
  //   if (!formData.userType) errors.userType = "User type is required";
  //   if (!formData.mobileNo) errors.mobileNo = "Mobile number is required";

  //   setFieldErrors(errors);

  //   let rolesValid = true;
  //   const newRoleErrors = roles.map((role) => {
  //     const errors = {};
  //     if (!role.role) {
  //       errors.role = "Role is required";
  //       rolesValid = false;
  //     }
  //     if (!role.startDate) {
  //       errors.startDate = "Start date is required";
  //       rolesValid = false;
  //     }
  //     if (!role.endDate) {
  //       errors.endDate = "End date is required";
  //       rolesValid = false;
  //     }
  //     return errors;
  //   });
  //   setRoleErrors(newRoleErrors);

  //   let branchesValid = true;
  //   const newBranchErrors = branches.map((branch) => {
  //     const errors = {};
  //     if (!branch.branchCode) {
  //       errors.branchCode = "Branch code is required";
  //       branchesValid = false;
  //     }
  //     return errors;
  //   });
  //   setBranchErrors(newBranchErrors);

  //   let clientsValid = true;
  //   const newClientErrors = clients.map((client) => {
  //     const errors = {};
  //     if (!client.customer) {
  //       errors.customer = "Customer is required";
  //       clientsValid = false;
  //     }
  //     if (!client.client) {
  //       errors.client = "Client is required";
  //       clientsValid = false;
  //     }
  //     return errors;
  //   });
  //   setClientErrors(newClientErrors);

  //   if (
  //     Object.keys(errors).length > 0 ||
  //     !rolesValid ||
  //     !branchesValid ||
  //     !clientsValid
  //   ) {
  //     notification.error({
  //       message: "Validation Error",
  //       description: "Please fill all required fields",
  //     });
  //     return;
  //   }

  //   const payload = {
  //     active: formData.active,
  //     email: formData.email,
  //     employeeCode: formData.employeeCode,
  //     employeeName: formData.employeeName,
  //     nickName: formData.nickName,
  //     mobileNo: formData.mobileNo,
  //     password: userId ? undefined : encryptPassword(formData.password),
  //     ppassword: formData.password,
  //     userType: formData.userType,
  //     roleAccessDTO: roles.map((role) => ({
  //       role: role.role,
  //       roleId: role.roleId,
  //       startDate: dayjs(role.startDate).format("YYYY-MM-DD"),
  //       endDate: dayjs(role.endDate).format("YYYY-MM-DD"),
  //     })),
  //     branchAccessDTOList: branches.map((branch) => ({
  //       branchCode: branch.branchCode,
  //       branch: branch.branch,
  //     })),
  //     clientAccessDTOList: clients.map((client) => ({
  //       customer: client.customer,
  //       client: client.client,
  //     })),
  //     userName: formData.employeeCode,
  //     id: editId ? formData.id : undefined,
  //     orgId: orgId,
  //   };

  //   try {
  //     const response = await axios.put(`${API_URL}/api/auth/signup`, payload);
  //     if (response.status === 200 || response.status === 201) {
  //       notification.success({
  //         message: "Success",
  //         description: userId
  //           ? "User updated successfully"
  //           : "User created successfully",
  //       });
  //       handleClear();
  //       fetchData();
  //       setIsListView(true);
  //     }
  //   } catch (error) {
  //     console.error("Error saving user:", error);
  //     notification.error({
  //       message: "Error",
  //       description:
  //         error.response?.data?.message ||
  //         "An error occurred while saving user",
  //     });
  //   }
  // };

  const handleBackToList = () => {
    setIsListView(true);
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
          <IconButton onClick={() => setIsListView(false)}>
            <AddIcon sx={{ color: "#28a745" }} />
          </IconButton>
        </Tooltip>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Employee</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>UserId</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listViewData.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  sx={{
                    cursor: "pointer",
                    color: "#007bff",
                    textDecoration: "underline",
                  }}
                  onClick={() => handleSelectUser(user.id)}
                >
                  {user.employeeName}
                </TableCell>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.active ? "Yes" : "No"}</TableCell>
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

      <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <FormControl
              fullWidth
              size="small"
              error={!!fieldErrors.employeeName}
            >
              <InputLabel>Employee Name</InputLabel>
              <Select
                label="Employee Name"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                disabled={loading.employees}
              >
                {loading.employees ? (
                  <MenuItem disabled>Loading employees...</MenuItem>
                ) : employeeList.length > 0 ? (
                  employeeList.map((emp) => (
                    <MenuItem key={emp.id} value={emp.employeeName}>
                      {emp.employeeName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No employees found</MenuItem>
                )}
              </Select>
              {fieldErrors.employeeName && (
                <FormHelperText>{fieldErrors.employeeName}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Employee Code"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleInputChange}
              size="small"
              fullWidth
              disabled
              error={!!fieldErrors.employeeCode}
              helperText={fieldErrors.employeeCode}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Nick Name"
              name="nickName"
              value={formData.nickName}
              onChange={handleInputChange}
              size="small"
              fullWidth
              error={!!fieldErrors.nickName}
              helperText={fieldErrors.nickName}
            />
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small" error={!!fieldErrors.userType}>
              <InputLabel>User Type</InputLabel>
              <Select
                label="User Type"
                name="userType"
                value={formData.userType ? formData.userType.toUpperCase() : ""}
                onChange={handleInputChange}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="USER">USER</MenuItem>
              </Select>
              {fieldErrors.userType && (
                <FormHelperText>{fieldErrors.userType}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Mobile No"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleInputChange}
              size="small"
              fullWidth
              error={!!fieldErrors.mobileNo}
              helperText={fieldErrors.mobileNo}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              size="small"
              fullWidth
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              size="small"
              fullWidth
              disabled={!!userId}
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.active}
                  onChange={handleActiveChange}
                  name="active"
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2 }}>
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Roles" />
            <Tab label="Branch Accessible" />
            <Tab label="Client Access" />
          </Tabs>
        </Box>

        {tabIndex === 0 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRole}
              sx={{ mb: 2 }}
              disabled={loading.roles}
            >
              Add Role
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Action</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={role.id || index}>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteRole(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!roleErrors[index]?.role}
                        >
                          <Select
                            value={role.role}
                            onChange={(e) =>
                              handleRoleChange(index, "role", e.target.value)
                            }
                            disabled={loading.roles}
                          >
                            {loading.roles ? (
                              <MenuItem disabled>Loading roles...</MenuItem>
                            ) : getAvailableRoles(index).length > 0 ? (
                              getAvailableRoles(index).map((r) => (
                                <MenuItem key={r.id} value={r.role}>
                                  {r.role}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No roles available</MenuItem>
                            )}
                          </Select>
                          {roleErrors[index]?.role && (
                            <FormHelperText>
                              {roleErrors[index].role}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          selected={role.startDate}
                          onChange={(date) =>
                            handleRoleChange(index, "startDate", date)
                          }
                          selectsStart
                          startDate={role.startDate}
                          endDate={role.endDate}
                          minDate={new Date()}
                          dateFormat="dd-MM-yyyy"
                          customInput={
                            <TextField
                              size="small"
                              fullWidth
                              error={!!roleErrors[index]?.startDate}
                              helperText={roleErrors[index]?.startDate}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          selected={role.endDate}
                          onChange={(date) =>
                            handleRoleChange(index, "endDate", date)
                          }
                          selectsEnd
                          startDate={role.startDate}
                          endDate={role.endDate}
                          minDate={role.startDate || new Date()}
                          dateFormat="dd-MM-yyyy"
                          customInput={
                            <TextField
                              size="small"
                              fullWidth
                              error={!!roleErrors[index]?.endDate}
                              helperText={roleErrors[index]?.endDate}
                            />
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddBranch}
              sx={{ mb: 2 }}
              disabled={loading.branches}
            >
              Add Branch
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Action</TableCell>
                    <TableCell>Branch Code</TableCell>
                    <TableCell>Branch Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch, index) => (
                    <TableRow key={branch.id || index}>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteBranch(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!branchErrors[index]?.branchCode}
                        >
                          <Select
                            value={branch.branchCode}
                            onChange={(e) =>
                              handleBranchChange(
                                index,
                                "branchCode",
                                e.target.value
                              )
                            }
                            disabled={loading.branches}
                          >
                            {loading.branches ? (
                              <MenuItem disabled>Loading branches...</MenuItem>
                            ) : branchData.length > 0 ? (
                              branchData.map((b) => (
                                <MenuItem key={b.id} value={b.branchCode}>
                                  {b.branchCode}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                No branches available
                              </MenuItem>
                            )}
                          </Select>
                          {branchErrors[index]?.branchCode && (
                            <FormHelperText>
                              {branchErrors[index].branchCode}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={branch.branch}
                          size="small"
                          fullWidth
                          disabled
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClient}
              sx={{ mb: 2 }}
              disabled={loading.clients}
            >
              Add Client
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Action</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Client</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={client.id || index}>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteClient(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!clientErrors[index]?.customer}
                        >
                          <Select
                            value={client.customer}
                            onChange={(e) =>
                              handleClientChange(
                                index,
                                "customer",
                                e.target.value
                              )
                            }
                          >
                            {customerList.length > 0 ? (
                              customerList.map((cust) => (
                                <MenuItem
                                  key={cust.id}
                                  value={cust.customerName}
                                >
                                  {cust.customerName}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No customers found</MenuItem>
                            )}
                          </Select>
                          {clientErrors[index]?.customer && (
                            <FormHelperText>
                              {clientErrors[index].customer}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!clientErrors[index]?.client}
                        >
                          <Select
                            value={client.client}
                            onChange={(e) =>
                              handleClientChange(
                                index,
                                "client",
                                e.target.value
                              )
                            }
                            disabled={!client.customer}
                          >
                            {client.rowClientList.length > 0 ? (
                              client.rowClientList.map((cli) => (
                                <MenuItem key={cli.client} value={cli.client}>
                                  {cli.client}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                {client.customer
                                  ? "No clients found"
                                  : "Select customer first"}
                              </MenuItem>
                            )}
                          </Select>
                          {clientErrors[index]?.client && (
                            <FormHelperText>
                              {clientErrors[index].client}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};
