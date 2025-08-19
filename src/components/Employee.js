import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Input,
  notification,
  Row,
  Spin,
  Typography,
  Table,
  Select,
  Form,
  Checkbox,
  DatePicker,
  Space,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ToastComponent from "../utils/toast-component";
import { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;

const Employee = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // Data states
  const [branchList, setBranchList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    empCode: "",
    empName: "",
    gender: "",
    branch: "",
    branchCode: "",
    dept: "",
    designation: "",
    dob: null,
    doj: null,
    active: true,
  });

  // Error states
  const [fieldErrors, setFieldErrors] = useState({
    empCode: "",
    empName: "",
    gender: "",
    branch: "",
    dept: "",
    designation: "",
    dob: "",
    doj: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([getAllBranches(), getAllEmployees()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllActiveBranches?orgId=${orgId}`
      );
      if (response.data.status) {
        setBranchList(response.data.paramObjectsMap.branchVOs);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const getAllEmployees = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`
      );
      if (response.data.status) {
        setEmployeeList(response.data.paramObjectsMap.employeeVO);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      empCode: "",
      empName: "",
      gender: "",
      branch: "",
      branchCode: "",
      dept: "",
      designation: "",
      dob: null,
      doj: null,
      active: true,
    });
    setFieldErrors({
      empCode: "",
      empName: "",
      gender: "",
      branch: "",
      dept: "",
      designation: "",
      dob: "",
      doj: "",
    });
    setEditId("");
  };

  // Handle save employee
  const handleSave = async () => {
    // Form validation
    const errors = {};
    if (!formData.empCode) errors.empCode = "Employee code is required";
    if (!formData.empName) errors.empName = "Employee name is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.branch) errors.branch = "Branch is required";
    if (!formData.dept) errors.dept = "Department is required";
    if (!formData.designation) errors.designation = "Designation is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.doj) errors.doj = "Date of joining is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(editId && { id: editId }),
        employeeCode: formData.empCode,
        employeeName: formData.empName,
        gender: formData.gender,
        branch: formData.branch,
        branchCode: formData.branchCode,
        department: formData.dept,
        designation: formData.designation,
        dateOfBirth: dayjs(formData.dob).format("YYYY-MM-DD"),
        joiningDate: dayjs(formData.doj).format("YYYY-MM-DD"),
        active: formData.active,
        orgId: orgId,
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/warehousemastercontroller/createUpdateEmployee`,
        payload
      );

      if (response.data.status) {
        showToast(
          "success",
          editId
            ? "Employee updated successfully"
            : "Employee created successfully"
        );
        handleClear();
        getAllEmployees();
      } else {
        showToast(
          "error",
          response.data.paramObjectsMap.errorMessage || "Operation failed"
        );
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      showToast("error", "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit employee
  const handleEditEmployee = (record) => {
    setEditId(record.id);
    setViewMode("form");

    const selectedBranch = branchList.find((br) => br.branch === record.branch);

    setFormData({
      empCode: record.employeeCode,
      empName: record.employeeName,
      gender: record.gender,
      branch: record.branch,
      branchCode: selectedBranch ? selectedBranch.branchCode : "",
      dept: record.department,
      designation: record.designation,
      dob: dayjs(record.dateOfBirth),
      doj: dayjs(record.joiningDate),
      active: record.active === "Active",
    });
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is filled
    if (value) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Handle branch selection to set branchCode
    if (name === "branch") {
      const selectedBranch = branchList.find((br) => br.branch === value);
      if (selectedBranch) {
        setFormData((prev) => ({
          ...prev,
          branchCode: selectedBranch.branchCode,
        }));
      }
    }
  };

  // Toggle between form and list view
  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
    if (viewMode === "list") {
      handleClear();
    }
  };

  // Bulk upload handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);
  const handleFileUpload = (file) => console.log("File to upload:", file);
  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: theme === "dark" ? "dark-mode" : "" },
      }}
    >
      <div
        className={`performance-goals-gd-container ${
          theme === "dark" ? "dark-mode" : ""
        }`}
      >
        {isSubmitting && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "var(--bg-body-gradient)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Spin size="large" tip="Submitting..." />
          </div>
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
            <div
              style={{
                padding: "20px",
                marginTop: "20px",
                display: "revert",
                placeContent: "center",
                overflowY: "none",
                minHeight: "20dvh",
                background: "#159957",
                background: "var(--bg-body-gradient)",
              }}
            >
              {/* Header */}
              <div
                className="form-containerSG"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{ color: "#fff", margin: 0 }}
                  >
                    Employee Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage employees
                  </Typography.Text>
                </div>
                <div>
                  <Button
                    icon={<UnorderedListOutlined />}
                    onClick={toggleViewMode}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "none",
                    }}
                  >
                    List View
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <Button
                  icon={<SearchOutlined />}
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Search
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Clear
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isSubmitting}
                  className="primary-action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={handleBulkUploadOpen}
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Upload
                </Button>
                <Button
                  icon={<CloudDownloadOutlined />}
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Download
                </Button>
              </div>

              {uploadOpen && (
                <CommonBulkUpload
                  open={uploadOpen}
                  handleClose={handleBulkUploadClose}
                  title="Upload Files"
                  uploadText="Upload file"
                  onSubmit={handleSubmitUpload}
                  handleFileUpload={handleFileUpload}
                  apiUrl={`warehousemastercontroller/EmployeeUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="Employee"
                />
              )}

              {/* Main Form */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Employee Code</span>
                      }
                      validateStatus={fieldErrors.empCode ? "error" : ""}
                      help={fieldErrors.empCode}
                    >
                      <Input
                        placeholder="Enter Employee Code"
                        style={{ color: "white" }}
                        value={formData.empCode}
                        onChange={(e) =>
                          handleInputChange(
                            "empCode",
                            e.target.value.toUpperCase()
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Employee Name</span>
                      }
                      validateStatus={fieldErrors.empName ? "error" : ""}
                      help={fieldErrors.empName}
                    >
                      <Input
                        placeholder="Enter Employee Name"
                        value={formData.empName}
                        style={{ color: "white" }}
                        onChange={(e) =>
                          handleInputChange(
                            "empName",
                            e.target.value.toUpperCase()
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Gender</span>}
                      validateStatus={fieldErrors.gender ? "error" : ""}
                      help={fieldErrors.gender}
                    >
                      <Select
                        placeholder="Select Gender"
                        value={formData.gender || undefined}
                        onChange={(value) => handleInputChange("gender", value)}
                      >
                        <Option value="MALE">Male</Option>
                        <Option value="FEMALE">Female</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Branch</span>}
                      validateStatus={fieldErrors.branch ? "error" : ""}
                      help={fieldErrors.branch}
                    >
                      <Select
                        showSearch
                        placeholder="Select Branch"
                        value={formData.branch || undefined}
                        onChange={(value) => handleInputChange("branch", value)}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {branchList.map((branch) => (
                          <Option key={branch.branchCode} value={branch.branch}>
                            {branch.branch}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Department</span>}
                      validateStatus={fieldErrors.dept ? "error" : ""}
                      help={fieldErrors.dept}
                    >
                      <Select
                        placeholder="Select Department"
                        value={formData.dept || undefined}
                        onChange={(value) => handleInputChange("dept", value)}
                      >
                        <Option value="DEPT1">DEPT1</Option>
                        <Option value="DEPT2">DEPT2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Designation</span>}
                      validateStatus={fieldErrors.designation ? "error" : ""}
                      help={fieldErrors.designation}
                    >
                      <Select
                        placeholder="Select Designation"
                        value={formData.designation || undefined}
                        onChange={(value) =>
                          handleInputChange("designation", value)
                        }
                      >
                        <Option value="DESIGNATION1">DESIGNATION1</Option>
                        <Option value="DESIGNATION2">DESIGNATION2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Date Of Birth</span>
                      }
                      validateStatus={fieldErrors.dob ? "error" : ""}
                      help={fieldErrors.dob}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        value={formData.dob}
                        onChange={(date) => handleInputChange("dob", date)}
                        disabledDate={(current) => {
                          return (
                            current && current > dayjs().subtract(18, "years")
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Date Of Join</span>
                      }
                      validateStatus={fieldErrors.doj ? "error" : ""}
                      help={fieldErrors.doj}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        value={formData.doj}
                        onChange={(date) => handleInputChange("doj", date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Active</span>}
                    >
                      <Checkbox
                        checked={formData.active}
                        onChange={(e) =>
                          handleInputChange("active", e.target.checked)
                        }
                        style={{ marginTop: "8px", color: "white" }}
                      >
                        Is Active
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "70vh",
                background: "#159957",
                background: "var(--bg-body-gradient)",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{
                      color: "#fff",
                      margin: 0,
                      paddingLeft: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    Employee Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all employees
                  </Typography.Text>
                </div>
                <Button
                  icon={<PlusOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginRight: "20px",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  Add New
                </Button>
              </div>

              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "95%",
                  margin: "0 auto",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "calc(100vh - 250px)",
                  overflowY: "auto",
                  marginTop: "20px",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#159957",
                    background: "var(--bg-body-gradient)",
                  }}
                >
                  <thead style={{ backgroundColor: "revert" }}>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Employee Code
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Employee Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Branch
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Department
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Designation
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Joining Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Active
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((employee, index) => (
                        <tr
                          key={`employee-${index}-${employee.id}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.employeeCode}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.employeeName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.branch}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.department}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.designation}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.joiningDate}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {employee.active === "Active" ? "Yes" : "No"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <Space>
                              <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleEditEmployee(employee)}
                                style={{ color: "white" }}
                              />
                              {/* <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                              /> */}
                            </Space>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                    paddingRight: "20px",
                    color: "white",
                  }}
                >
                  <span style={{ marginRight: "16px", fontSize: "12px" }}>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, employeeList.length)} of{" "}
                    {employeeList.length} items
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    Prev
                  </button>

                  {Array.from(
                    { length: Math.ceil(employeeList.length / pageSize) },
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          backgroundColor:
                            currentPage === i + 1
                              ? "rgba(255,255,255,0.2)"
                              : "transparent",
                          color: "white",
                          border: "1px solid white",
                          margin: "0 2px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          minWidth: "28px",
                        }}
                      >
                        {i + 1}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(employeeList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(employeeList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage ===
                        Math.ceil(employeeList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(employeeList.length / pageSize)
                          ? 0.5
                          : 1,
                    }}
                  >
                    Next
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid white",
                      marginLeft: "8px",
                      padding: "2px 4px",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="5" style={{ background: "#1A1A2E" }}>
                      5 / page
                    </option>
                    <option value="10" style={{ background: "#1A1A2E" }}>
                      10 / page
                    </option>
                    <option value="20" style={{ background: "#1A1A2E" }}>
                      20 / page
                    </option>
                    <option value="50" style={{ background: "#1A1A2E" }}>
                      50 / page
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastComponent />
    </ConfigProvider>
  );
};

export default Employee;
