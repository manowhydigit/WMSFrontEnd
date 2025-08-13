import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Modal,
  Upload,
  Switch,
  notification,
  Spin,
  ConfigProvider,
  Image,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  CrownOutlined,
  BarsOutlined,
  TeamOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  getUserBranch,
  getPerformanceGoalsByUserName,
  getPerformanceGoalsById,
} from "../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  PlusCircleOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Space, Col, Rate, Slider, Checkbox } from "antd";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SendIcon from "@mui/icons-material/Send";
import {
  DownloadOutlined,
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { fetchEmployees } from "../services/api";
import axios from "axios";
import confetti from "canvas-confetti";
import gsap from "gsap";
import Nobills from "../Nobills.jpg";
import rewindbutton from ".././rewindbutton.png";
import ButtonTrans from "./ButtonTrans";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import "./PerformanceGoalsGD.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import moment from "moment";
// import "./EmployeeMaster.css";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const EmployeeMaster = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("form");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchNames, setBranchNames] = useState([]); // Initialize as empty array
  const [branches, setBranches] = useState([]); // State to store branches
  const [pbranchname, setPbranchName] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    branch: false,
    employee: false,
    code: false,
  });

  const validateForm = () => {
    const errors = {
      branch: !formData.branch?.trim(),
      employee: !formData.employee?.trim(),
      code: !formData.code?.trim(),
    };
    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  // Form state
  const [formData, setFormData] = useState({
    branch: "",
    employee: "",
    code: "",
    dob: "",
    doj: "",
    department: "",
    designation: "",
    level: "",
    reportingto: "",
    reportingtocode: "",
    mailid: "",
    mobile: "",
    active: true,
    existingImageUrl: null, // Add this field
    // image: null,
    imageFile: null, // Store the File object directly
    imageUrl: null, // Store the URL for preview
    imageChanged: false,
  });

  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };

  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#1A1A2E";
      document.body.style.color = "#FFFFFF";
    } else {
      document.body.style.backgroundColor = "#F9FAFE";
      document.body.style.color = "#32325D";
    }
    fetchEmployees1();
  }, [theme]);

  useEffect(() => {
    getUserBranch()
      .then((response) => {
        setBranchNames(response); // Assuming the API returns a list of branch objects
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });
  }, []);

  const fetchEmployees1 = () => {
    setLoading(true);
    fetchEmployees()
      .then((response) => {
        setEmployees(response);
        setLoading(false);
        console.log("Employees", employees);
      })
      .catch(() => {
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch updated data for the listing.",
        });
        setLoading(false);
      });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: false,
      });
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
        imageChanged: true, // Mark that image has been changed
      }));
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }
    try {
      // Format the payload to match backend expectations
      const payload = {
        branch: formData.branch || "",
        active: formData.active.toString(),
        branch: formData.branch || "",
        code: formData.code,
        createdBy: localStorage.getItem("userName"),
        department: formData.department,
        designation: formData.designation,
        mailid: formData.mailid,
        mobile: formData.mobile,
        dob:
          formData.dob && moment(formData.dob, "DD/MM/YYYY").isValid()
            ? moment(formData.dob, "DD/MM/YYYY").format("YYYY-MM-DD") // Format API expects
            : null,
        doj:
          formData.doj && moment(formData.doj, "DD/MM/YYYY").isValid()
            ? moment(formData.doj, "DD/MM/YYYY").format("YYYY-MM-DD") // Format API expects
            : null,
        employee: formData.employee,
        id: editId || 0,
        lvl: formData.lvl,
        reportingto: formData.reportingto,
        reportingtocode: formData.reportingtocode,
        attachment:
          !formData.imageChanged && formData.existingImageUrl
            ? formData.existingImageUrl.replace("data:image/jpeg;base64,", "")
            : null,
      };

      const url = `${API_URL}/api/employeemaster/updateEmpMaster`;

      // First submit employee data
      const response = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        handleCelebrate();
        const savedEmployee = response.data.paramObjectsMap.empMasVO;
        const employeeId = savedEmployee.id;

        // setFormData({
        //   imageFile: response.data.paramObjectsMap.empMasVO[0].attachment,
        // });

        // Only upload image if a new one was selected
        // Only upload image if it was changed
        console.log("img", response.data.paramObjectsMap.empMasVO.attachment);
        if (
          formData.imageChanged &&
          formData.imageFile
          //  || typeof formData.imageFile === "object"
        ) {
          console.log("emp img", formData.imageFile);
          await handleFileImageUpload(formData.imageFile, employeeId);
        }
        // If image wasn't changed, the existing image remains

        notification.success({
          message: "Success",
          description: editId
            ? "Employee updated successfully!"
            : "Employee created successfully!",
        });

        // Reset form and fetch updated list
        resetForm();
        fetchEmployees();
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to save employee data",
      });
    }
  };

  // For file uploads (separate endpoint)
  const handleFileImageUpload = async (file, employeeId) => {
    try {
      const imageformData = new FormData();
      imageformData.append("EmployeeMasterid", employeeId); // Add ID to form data as in Postman
      imageformData.append("file", file); // Append the actual File object

      const response = await axios.put(
        `${API_URL}/api/employeemaster/uploadEmpImage`,
        imageformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "Employee image uploaded successfully!",
        });
        return true;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      notification.error({
        message: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload file",
      });
      throw error; // Re-throw to be caught by parent function
    }
  };
  const handleEdit = (employee) => {
    console.log("Employee data from API:", employee); // Debug log
    setEditId(employee.id);
    setFormData({
      branch: employee.branch,
      employee: employee.employee,
      code: employee.code,
      dob: employee.dob ? moment(employee.dob).format("DD/MM/YYYY") : "",
      doj: employee.doj ? moment(employee.doj).format("DD/MM/YYYY") : "",
      department: employee.department,
      designation: employee.designation,
      lvl: employee.lvl,
      reportingto: employee.reportingto,
      reportingtocode: employee.reportingtocode,
      active: employee.active,
      mailid: employee.mailid,
      mobile: employee.mobile,
      // Store both the existing image URL and the attachment data
      existingImageUrl: employee.attachment
        ? `data:image/jpeg;base64,${employee.attachment}`
        : null,
      imageFile: null, // Reset file object
      imageUrl: employee.attachment
        ? `data:image/jpeg;base64,${employee.attachment}`
        : null,
      imageChanged: false, // Reset the changed flagr preview
    });
    setViewMode("form");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/employees/${id}`);
      notification.success({
        message: "Success",
        description: "Employee deleted successfully!",
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      notification.error({
        message: "Error",
        description: "Failed to delete employee",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      code: "",
      dob: "",
      doj: "",
      department: "",
      designation: "",
      lvl: "",
      reportingto: "",
      reportingtocode: "",
      mailid: "",
      mobile: "",
      active: true,
      imageFile: null,
      imageUrl: null,
      existingImage: null,
      imageChanged: false,
      active: true,
      imageFile: null,
      imageUrl: null,
      existingImage: null,
      imageChanged: false,
    });
    setEditId(null);
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, fetch fresh data
      fetchEmployees1();
    }
    setViewMode(viewMode === "form" ? "list" : "form");

    // Reset form when switching away from it
    if (viewMode === "form") {
      resetForm();
    }
  };
  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const branchs = [
    "AHM",
    "AHMW",
    "BLR",
    "BLRC",
    "BLRW",
    "CBE",
    "CCU",
    "CCUW",
    "COK",
    "CORP",
    "DEL",
    "DELW",
    "HAR",
    "HOHW",
    "HYD",
    "HYDW",
    "HYDZ",
    "ISK",
    "IXY",
    "JPR",
    "JSR",
    "LUH",
    "MAA",
    "MAAC",
    "MAAW",
    "MUM",
    "MUMC",
    "MUMW",
    "PNQ",
    "PNQW",
    "TUT",
    "TUTU",
    "VTZ",
  ];

  const departments = [
    "HR",
    "Finance",
    "IT",
    "Operations",
    "Marketing",
    "Sales",
    "R&D",
  ];
  const designations = [
    "Manager",
    "Developer",
    "Analyst",
    "Director",
    "VP",
    "Executive",
  ];
  const levels = ["L1", "L2", "L3", "L4", "L5"];

  const downloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Employees");

      // Define columns
      worksheet.columns = [
        { header: "Branch", key: "branch", width: 10 },
        { header: "Employee", key: "employeeName", width: 25 },
        { header: "Code", key: "employeeCode", width: 15 },
        { header: "DOB", key: "dob", width: 15 },
        { header: "DOJ", key: "doj", width: 15 },
        { header: "Department", key: "department", width: 20 },
        { header: "Designation", key: "designation", width: 20 },
        { header: "Lvl", key: "level", width: 10 },
        { header: "ReportingTo", key: "reportingHead", width: 25 },
        { header: "ReportingToCode", key: "reportingHeadCode", width: 20 },
        { header: "Active", key: "active", width: 10 },
        { header: "Mailid", key: "mailid", width: 20 },
        { header: "Mobile", key: "mobile", width: 20 },
      ];

      worksheet.dataValidations.add("A2:A100", {
        type: "list",
        allowBlank: true,
        formulae: [`"${branchs.join(",")}"`],
      });

      // Add dropdown validation for department, designation, and level
      worksheet.dataValidations.add("F2:F100", {
        type: "list",
        allowBlank: true,
        formulae: [`"${departments.join(",")}"`],
      });

      worksheet.dataValidations.add("G2:G100", {
        type: "list",
        allowBlank: true,
        formulae: [`"${designations.join(",")}"`],
      });

      worksheet.dataValidations.add("H2:H100", {
        type: "list",
        allowBlank: true,
        formulae: [`"${levels.join(",")}"`],
      });

      // Style header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Generate file and download
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Employee_Master_Template.xlsx");
    } catch (error) {
      console.error("Error generating template:", error);
      notification.error({
        message: "Error",
        description: "Failed to generate template file.",
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      // Create FormData object and append the file
      const formData = new FormData(); // Note: Capital 'F' in FormData
      formData.append("files", file);
      formData.append("createdBy", localStorage.getItem("userName"));

      // Send as multipart/form-data
      const response = await axios.post(
        `${API_URL}/api/employeemaster/excelUploadForEmployeeMaster`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Import Successful",
          description: response.data.message || "File uploaded successfully",
        });

        fetchEmployees1();
      }
    } catch (error) {
      notification.error({
        message: "Import Failed",
        description: error.response?.data?.message || "Error processing file",
      });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleBranchChange = (value) => {
    setFormData({ ...formData, branch: value });
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {record.image ? (
            <img
              src={record.image}
              alt={text}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                marginRight: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#6C63FF",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              {text.charAt(0).toUpperCase()}
            </div>
          )}
          {text}
        </div>
      ),
    },

    {
      title: "Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Reporting Head",
      dataIndex: "reportingHead",
      key: "reportingHead",
    },
    {
      title: "Head Code",
      dataIndex: "reportingHeadCode",
      key: "reportingHeadCode",
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <span style={{ color: active ? "#52c41a" : "#f5222d" }}>
          {active ? <CheckOutlined /> : <CloseOutlined />}
        </span>
      ),
    },
    {
      title: "Mailid",
      dataIndex: "mailid",
      key: "mailid",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      render: (mobile) => mobile || "-", // Show dash if empty
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#6C63FF" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ color: "#ff4d4f" }}
          />
        </Space>
      ),
    },
  ];

  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/PS");
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className={`performance-goals-gd-container ${
          theme === "dark" ? "dark-mode" : ""
        }`}
      >
        <div
          style={{
            display: "revert",
            placecontent: "center",
            minheight: "90dvh",
            background: "#159957",
            background: "var(--bg-body-gradient)",
          }}
        >
          <div
            className="containerSG"
            style={{
              padding: "20px",
              marginTop: "50px",
              display: "revert",
              placecontent: "center",
              overflowY: "none",
              minheight: "80dvh",
              background: "#159957",
              background: "var(--bg-body-gradient)",

              // height: "87vh",
            }}
          >
            <div
              className="form-containerSG"
              style={{
                backdropFilter: "blur(10px)",
                borderRadius: "25px",
                boxShadow: "0 15px 35px rgba(108, 99, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                overflow: "hidden",
                position: "relative",
                height: "80vh", // Set a fixed height for the form container

                minHeight: "350px", // Minimum height
                minWidth: "1000px",
                marginTop: "-10px",
              }}
            >
              <Button
                type="primary"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  margin: "0",
                  padding: "4px 8px",
                  borderRadius: "0",
                }}
                onClick={handleImageClick}
                icon={<UnorderedListOutlined />}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <div
                className="form-headerSG"
                style={{
                  padding: "1px",
                  color: "white",
                  textAlign: "center",
                  maxHeight: "500px",
                  marginTop: "-50px",
                }}
              >
                {/* <h3
                  style={{
                    fontWeight: 600,
                    marginBottom: "10px",
                    fontSize: "38px",
                    color: "white",
                    fontFamily: "'lobster'",
                    fontWeight: "normal",
                  }}
                >
                  Performance Goals
                </h3> */}

                <h3 className="performance-heading">Employee Master</h3>
                <p style={{ opacity: 0.9, fontWeight: 500, fontSize: "16px" }}>
                  Manage your employee records and information.
                </p>
              </div>
              {viewMode === "form" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginleft: "-50px",
                  }}
                >
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      // border: "1px solid white",
                      margin: "0",
                      padding: "4px 8px",
                      borderRadius: "8px 0",
                    }}
                    onClick={resetForm}
                  >
                    Clear
                  </Button>
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      // border: "1px solid white",
                      margin: "0",
                      padding: "4px 8px",
                      borderRadius: "0",
                    }}
                    onClick={toggleViewMode}
                    icon={<BarsOutlined />}
                  >
                    List
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      // border: "1px solid white",
                      margin: "0",
                      padding: "4px 8px",
                      borderRadius: "0 8px",
                    }}
                    onClick={handleSubmit}
                  >
                    {editId ? "Update" : "Submit"}
                  </Button>
                </div>
              ) : (
                ""
              )}
              <div
                style={{
                  padding: "40px",
                  height: "calc(100% - 100px)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {viewMode === "form" ? (
                  <form>
                    <div
                      className="form-group"
                      style={{
                        marginBottom: "25px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "24px",
                      }}
                    >
                      <div style={{ flex: "1 1 150px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Branch <span style={{ color: "white" }}>*</span>
                        </label>
                        <Select
                          style={{
                            width: "100%",
                            borderRadius: "12px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: validationErrors.branch
                              ? "1px solid white"
                              : "1px solid #ADB5BD",
                          }}
                          value={formData.branch || undefined}
                          id="branch-select"
                          onChange={(value) =>
                            handleInputChange("branch", value)
                          }
                          placeholder="Select Branch"
                          suffixIcon={
                            <ApartmentOutlined style={{ color: "white" }} />
                          }
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          <Option value="">Select Branch</Option>
                          {branchNames?.map((branch) => (
                            <Option
                              key={branch.branchCode}
                              value={branch.branchName}
                            >
                              {branch.branchName}
                            </Option>
                          ))}
                        </Select>
                        {validationErrors.branch && (
                          <div
                            style={{
                              color: "white",
                              fontSize: "12px",
                              marginTop: "4px",
                              animation: "fadeIn 0.3s ease-in",
                            }}
                          >
                            Branch is required
                          </div>
                        )}
                      </div>
                      <div style={{ flex: "1 1 250px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Employee <span style={{ color: "white" }}>*</span>
                        </label>
                        <Input
                          prefix={<UserOutlined />}
                          value={formData.employee}
                          onChange={(e) =>
                            handleInputChange("employee", e.target.value)
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "10px",
                            borderRadius: "12px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        />
                        {validationErrors.employee && (
                          <div
                            style={{
                              color: "white",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Employee name is required
                          </div>
                        )}
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Code <span style={{ color: "white" }}>*</span>
                        </label>
                        <Input
                          prefix={<IdcardOutlined />}
                          value={formData.code}
                          onChange={(e) =>
                            handleInputChange("code", e.target.value)
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "10px",
                            borderRadius: "12px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        />
                        {validationErrors.code && (
                          <div
                            style={{
                              color: "white",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Employee code is required
                          </div>
                        )}
                      </div>

                      <div style={{ flex: "1 1 150px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Date of Birth
                        </label>
                        <DatePicker
                          style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid #ADB5BD",
                            color: "white",
                          }}
                          format="DD/MM/YYYY"
                          value={
                            formData.dob
                              ? moment(formData.dob, "DD/MM/YYYY")
                              : null
                          } // Set the value
                          suffixIcon={
                            <CalendarOutlined style={{ color: "white" }} />
                          }
                          onChange={(date, dateString) =>
                            handleInputChange("dob", dateString)
                          }
                          allowClear={false}
                          disabledDate={(current) => {
                            const today = moment();
                            return (
                              current &&
                              (current.isSame(today, "day") ||
                                current.isAfter(today))
                            );
                          }}
                          inputReadOnly={true}
                        />
                      </div>

                      <div style={{ flex: "1 1 150px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Date of Join
                        </label>
                        <DatePicker
                          style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid #ADB5BD",
                            color: "white",
                          }}
                          format="DD/MM/YYYY"
                          value={
                            formData.doj
                              ? moment(formData.doj, "DD/MM/YYYY")
                              : null
                          } // Set the value
                          suffixIcon={
                            <CalendarOutlined style={{ color: "white" }} />
                          }
                          onChange={(date, dateString) =>
                            handleInputChange("doj", dateString)
                          }
                          allowClear={false}
                          disabledDate={(current) => {
                            const today = moment();
                            return (
                              current &&
                              (current.isSame(today, "day") ||
                                current.isAfter(today))
                            );
                          }}
                          inputReadOnly={true}
                        />
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Department
                        </label>
                        <Select
                          style={{
                            width: "100%",
                            borderRadius: "12px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          }}
                          value={formData.department}
                          onChange={(value) =>
                            handleInputChange("department", value)
                          }
                          suffixIcon={
                            <ApartmentOutlined style={{ color: "white" }} />
                          }
                        >
                          {departments.map((dept) => (
                            <Option key={dept} value={dept}>
                              {dept}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Designation
                        </label>
                        <Select
                          style={{
                            width: "100%",
                            borderRadius: "12px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          }}
                          value={formData.designation}
                          onChange={(value) =>
                            handleInputChange("designation", value)
                          }
                          suffixIcon={
                            <CrownOutlined style={{ color: "white" }} />
                          }
                        >
                          {designations.map((desg) => (
                            <Option key={desg} value={desg}>
                              {desg}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ flex: "1 1 20px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Level
                        </label>
                        <Select
                          style={{
                            width: "100%",
                            borderRadius: "12px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          }}
                          value={formData.lvl}
                          onChange={(value) => handleInputChange("lvl", value)}
                          suffixIcon={
                            <BarsOutlined style={{ color: "white" }} />
                          }
                        >
                          {levels.map((lvl) => (
                            <Option key={lvl} value={lvl}>
                              {lvl}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Reporting Head
                        </label>
                        <Input
                          prefix={<TeamOutlined />}
                          value={formData.reportingto}
                          onChange={(e) =>
                            handleInputChange("reportingto", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "12px",
                            height: "40px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        />
                      </div>

                      <div style={{ flex: "1 1 150px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Head Code
                        </label>
                        <Input
                          prefix={<IdcardOutlined />}
                          value={formData.reportingtocode}
                          onChange={(e) =>
                            handleInputChange("reportingtocode", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            height: "40px",
                            borderRadius: "12px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        />
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Mailid <span style={{ color: "white" }}>*</span>
                        </label>
                        <Input
                          prefix={<IdcardOutlined />}
                          value={formData.mailid}
                          onChange={(e) =>
                            handleInputChange("mailid", e.target.value)
                          }
                          style={{
                            width: "70%",
                            height: "40px",
                            padding: "10px",
                            borderRadius: "12px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        />
                        {validationErrors.mailid && (
                          <div
                            style={{
                              color: "white",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Mailid is required
                          </div>
                        )}
                      </div>

                      <div style={{ flex: "1 1 50px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                            marginLeft: "-90px",
                          }}
                        >
                          Mobile Number
                        </label>
                        <Input
                          prefix={<PhoneOutlined />} // Add this import at the top: import { PhoneOutlined } from '@ant-design/icons';
                          value={formData.mobile}
                          onChange={(e) =>
                            handleInputChange("mobile", e.target.value)
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "10px",
                            borderRadius: "12px",
                            border: "1px solid #ADB5BD",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                            marginLeft: "-90px",
                          }}
                        />
                      </div>

                      <div style={{ flex: "1 1 100px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          Active
                        </label>
                        <Switch
                          checked={formData.active}
                          onChange={(checked) =>
                            handleInputChange("active", checked)
                          }
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          style={{
                            backgroundColor: formData.active
                              ? "#52c41a"
                              : "#f5222d",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Upload Button */}
                        <div style={{ flex: "0 0 auto" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              color: "#fff",
                            }}
                          >
                            Profile Image
                          </label>
                          <Upload
                            beforeUpload={handleFileChange}
                            showUploadList={false}
                            accept="image/*"
                          >
                            <Button
                              icon={<UploadOutlined />}
                              style={{
                                width: "150px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                color: "white",
                                border: "1px solid #ADB5BD",
                              }}
                            >
                              Upload Image
                            </Button>
                          </Upload>
                        </div>

                        {/* Image Preview (Right Side) */}
                        {(formData.imageUrl || formData.existingImageUrl) && (
                          <div
                            style={{
                              cursor: "pointer",
                              transition: "transform 0.2s",
                              ":hover": { transform: "scale(1.05)" },
                            }}
                            onClick={() => setIsModalOpen(true)}
                          >
                            <img
                              src={
                                formData.imageUrl ||
                                `data:image/jpeg;base64,${formData.existingImage}`
                              }
                              alt="Preview"
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #ADB5BD",
                              }}
                            />
                          </div>
                        )}

                        {/* Full-Screen Modal */}
                        <Modal
                          open={isModalOpen}
                          onCancel={() => setIsModalOpen(false)}
                          footer={null}
                          centered
                          width="80vw"
                          bodyStyle={{ padding: 0, textAlign: "center" }}
                        >
                          <Image
                            src={formData.imageUrl}
                            alt="Full Preview"
                            style={{
                              maxHeight: "80vh",
                              width: "auto",
                              borderRadius: "8px",
                            }}
                          />
                        </Modal>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <Input
                        placeholder="Search employees..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                          width: 300,
                          borderRadius: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          border: "1px solid #ADB5BD",
                        }}
                      />

                      <div style={{ display: "flex" }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            resetForm();
                            setViewMode("form");
                          }}
                          style={{
                            // marginRight: "1px",
                            backgroundColor: "transparent",
                            color: "white",
                            // border: "1px solid white",
                          }}
                        >
                          Add Employee
                        </Button>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={downloadTemplate}
                          style={{
                            // marginRight: "1px",
                            backgroundColor: "transparent",
                            color: "white",
                            // border: "1px solid white",
                          }}
                        >
                          Template
                        </Button>
                        <Button
                          type="primary"
                          icon={<UploadOutlined />}
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                          style={{
                            backgroundColor: "transparent",
                            color: "white",
                            // border: "1px solid white",
                          }}
                        >
                          Import
                          <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                          />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="table-container"
                      style={{
                        width: "107%",
                        overflowX: "auto",
                        fontSize: "12px",
                        marginLeft: "-40px",
                        backgroundColor: "transparent",
                        background: "transparent",
                        maxHeight: "500px",
                        overflowY: "auto",
                        marginTop: "20px",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          backgroundColor: "transparent",
                        }}
                      >
                        <thead style={{ backgroundColor: "revert" }}>
                          <tr
                            style={{
                              borderBottom: "1px dashed #000",
                            }}
                          >
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              #
                            </th>

                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Employee
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Code
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Branch
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Department
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Designation
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Level
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Reporting Head
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Head Code
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                backgroundColor: "revert",
                              }}
                            >
                              Active
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {employees
                            .filter((emp) =>
                              Object.values(emp).some(
                                (val) =>
                                  val &&
                                  val
                                    .toString()
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase())
                              )
                            )
                            .map((employees, index) => (
                              <tr
                                key={`row-${index}-${employees.id}`}
                                style={{
                                  borderBottom: "1px dashed white",
                                  color: "white",
                                  cursor: "pointer",
                                  ":hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  },
                                }}
                                onClick={() => handleEdit(employees)}
                              >
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "center",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {index + 1}
                                </td>

                                {/* Employee cell with image */}
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {employees.attachment ? (
                                    <img
                                      src={`data:image/jpeg;base64,${employees.attachment}`}
                                      alt={employees.employee}
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        marginRight: 8,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImage(
                                          `data:image/jpeg;base64,${employees.attachment}`
                                        );
                                        setImageModalVisible(true);
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        backgroundColor: "#6C63FF",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 8,
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {employees.employee
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  )}
                                  {employees.employee}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.code}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.branch}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.department}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.designation}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.lvl}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.reportingto}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {employees.reportingtocode}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: employees.active
                                        ? "white"
                                        : "black",
                                    }}
                                  >
                                    {employees.active ? "Yes" : "No"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {/* Image Modal */}
                      <Modal
                        visible={imageModalVisible}
                        footer={null}
                        onCancel={() => setImageModalVisible(false)}
                        width="60%"
                        bodyStyle={{
                          padding: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "transparent",
                        }}
                      >
                        {currentImage && (
                          <img
                            src={currentImage}
                            alt="Employee"
                            style={{
                              maxWidth: "50%",
                              maxHeight: "50vh",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                      </Modal>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};
export default EmployeeMaster;
