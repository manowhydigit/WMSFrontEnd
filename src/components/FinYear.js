import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Input,
  notification,
  Row,
  Space,
  Spin,
  Typography,
  Table,
  Select,
  Form,
  Checkbox,
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

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonBulkUpload from "../utils/CommonBulkUpload";

import dayjs from "dayjs";

const { Option } = Select;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const FinYear = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [data, setData] = useState([]);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [finYearList, setFinYearList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");

  const showToast = (type, message) => {
    notification[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      placement: "topRight",
    });
  };

  const [formData, setFormData] = useState({
    finYear: dayjs(),
    finYearIdentifier: "",
    finYearId: "",
    startDate: dayjs(),
    endDate: dayjs(),
    currentFinYear: false,
    active: true,
    createdBy: localStorage.getItem("userName"),
    orgId: orgId,
    closed: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    finYear: false,
    finYearIdentifier: false,
    finYearId: false,
    startDate: false,
    endDate: false,
  });

  useEffect(() => {
    getAllFinYears();
  }, []);

  const getAllFinYears = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllFInYearByOrgId?orgId=${orgId}`
      );

      if (
        response.data?.status === true &&
        response.data?.paramObjectsMap?.financialYearVOs
      ) {
        setFinYearList(response.data.paramObjectsMap.financialYearVOs);
      } else {
        console.warn(
          "Unexpected financial years response structure:",
          response.data
        );
        setFinYearList([]);
        showToast("warning", "Received unexpected financial years data format");
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      showToast("error", "Failed to fetch financial years");
      setFinYearList([]);
    }
  };

  const handleEditFinYear = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      finYear: record.finYear ? dayjs().year(record.finYear) : dayjs(),
      finYearId: record.finYearId,
      finYearIdentifier: record.finYearIdentifier,
      currentFinYear: record.currentFinYear,
      startDate: record.startDate ? dayjs(record.startDate) : dayjs(),
      endDate: record.endDate ? dayjs(record.endDate) : dayjs(),
      active: record.active,
      orgId: record.orgId,
      createdBy: localStorage.getItem("userName"),
      id: record.id,
      closed: record.closed || false,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    setFieldErrors({ ...fieldErrors, [name]: false });

    if (name === "startDate" || name === "endDate") {
      if (formData.startDate && formData.endDate) {
        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);
        if (start.isAfter(end)) {
          setFieldErrors({ ...fieldErrors, endDate: true });
        } else {
          setFieldErrors({ ...fieldErrors, endDate: false });
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const numericRegex = /^[0-9]*$/;

    let errorMessage = false;

    if (name === "finYearId") {
      if (!numericRegex.test(value)) {
        errorMessage = true;
      }
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: true });
    } else {
      const newValue =
        name === "currentFinYear" || name === "active" || name === "closed"
          ? checked
          : value.toUpperCase();
      setFormData({ ...formData, [name]: newValue });
      setFieldErrors({ ...fieldErrors, [name]: false });
    }
  };

  const getFinYear = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/getAllFInYearByOrgId?orgId=${orgId}`
      );
      if (result) {
        setData(result.paramObjectsMap.financialYearVOs || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveFinYear = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      const errors = {};
      if (!formData.finYear) errors.finYear = true;
      if (!formData.finYearId) errors.finYearId = true;
      if (!formData.finYearIdentifier) errors.finYearIdentifier = true;
      if (!formData.startDate) errors.startDate = true;
      if (!formData.endDate) errors.endDate = true;

      if (formData.startDate && formData.endDate) {
        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);
        if (start.isAfter(end)) {
          errors.endDate = true;
        }
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error("Please fill all required fields correctly", {
          autoClose: 2000,
          theme: "colored",
        });
        return;
      }

      // Prepare payload according to API requirements
      const payload = {
        active: formData.active,
        closed: formData.closed,
        createdBy: formData.createdBy,
        currentFinYear: formData.currentFinYear,
        endDate: dayjs(formData.endDate).format("YYYY-MM-DD"),
        finYear: parseInt(dayjs(formData.finYear).format("YYYY")),
        finYearId: parseInt(formData.finYearId),
        finYearIdentifier: formData.finYearIdentifier,
        id: editId || 0,
        orgId: parseInt(orgId),
        startDate: dayjs(formData.startDate).format("YYYY-MM-DD"),
      };

      const response = await axios.put(
        `${API_URL}/api/commonmaster/createUpdateFinYear`,
        payload
      );

      if (response.data && response.data.status) {
        toast.success(
          editId
            ? "FinYear Updated Successfully"
            : "FinYear Created Successfully",
          { autoClose: 2000, theme: "colored" }
        );
        handleClear();
        getAllFinYears();
      } else {
        throw new Error(
          response.data?.message || "Failed to save financial year"
        );
      }
    } catch (error) {
      console.error("Error saving financial year:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save financial year",
        { autoClose: 2000, theme: "colored" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      finYear: dayjs(),
      finYearIdentifier: "",
      finYearId: "",
      startDate: dayjs(),
      endDate: dayjs(),
      currentFinYear: false,
      active: true,
      createdBy: localStorage.getItem("userName"),
      orgId: orgId,
      closed: false,
    });
    setFieldErrors({
      finYear: false,
      finYearIdentifier: false,
      finYearId: false,
      startDate: false,
      endDate: false,
    });
    setEditId("");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);
  const handleFileUpload = (file) => console.log("File to upload:", file);
  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
  };

  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "100%",
  };

  const datePickerStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
    color: "white",
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
                    Financial Year Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage financial years
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
                  onClick={handleSaveFinYear}
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
                  apiUrl={`commonmaster/FinYearUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="Financial Year"
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      backdropFilter: "blur(10px)",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "20px",
                      padding: "20px",
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                    }}
                  >
                    <Form layout="vertical">
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>
                                Financial Year *
                              </span>
                            }
                            validateStatus={fieldErrors.finYear ? "error" : ""}
                            help={
                              fieldErrors.finYear
                                ? "This field is required"
                                : ""
                            }
                          >
                            <DatePicker
                              picker="year"
                              value={formData.finYear}
                              onChange={(date) =>
                                handleDateChange("finYear", date)
                              }
                              style={datePickerStyle}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>
                                Financial Year ID *
                              </span>
                            }
                            validateStatus={
                              fieldErrors.finYearId ? "error" : ""
                            }
                            help={
                              fieldErrors.finYearId
                                ? "This field is required"
                                : ""
                            }
                          >
                            <Input
                              name="finYearId"
                              value={formData.finYearId}
                              onChange={handleInputChange}
                              style={inputStyle}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>
                                Financial Year Identifier *
                              </span>
                            }
                            validateStatus={
                              fieldErrors.finYearIdentifier ? "error" : ""
                            }
                            help={
                              fieldErrors.finYearIdentifier
                                ? "This field is required"
                                : ""
                            }
                          >
                            <Input
                              name="finYearIdentifier"
                              value={formData.finYearIdentifier}
                              onChange={handleInputChange}
                              style={inputStyle}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>
                                Start Date *
                              </span>
                            }
                            validateStatus={
                              fieldErrors.startDate ? "error" : ""
                            }
                            help={
                              fieldErrors.startDate
                                ? "This field is required"
                                : ""
                            }
                          >
                            <DatePicker
                              value={formData.startDate}
                              onChange={(date) =>
                                handleDateChange("startDate", date)
                              }
                              style={datePickerStyle}
                              format="DD-MM-YYYY"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>End Date *</span>
                            }
                            validateStatus={fieldErrors.endDate ? "error" : ""}
                            help={
                              fieldErrors.endDate
                                ? formData.startDate &&
                                  formData.endDate &&
                                  dayjs(formData.startDate).isAfter(
                                    dayjs(formData.endDate)
                                  )
                                  ? "End date must be after start date"
                                  : "This field is required"
                                : ""
                            }
                          >
                            <DatePicker
                              value={formData.endDate}
                              onChange={(date) =>
                                handleDateChange("endDate", date)
                              }
                              style={datePickerStyle}
                              format="DD-MM-YYYY"
                              disabledDate={(current) => {
                                return (
                                  formData.startDate &&
                                  current &&
                                  current.isBefore(dayjs(formData.startDate))
                                );
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>
                                Current Financial Year
                              </span>
                            }
                          >
                            <Checkbox
                              checked={formData.currentFinYear}
                              onChange={handleInputChange}
                              name="currentFinYear"
                              style={{ color: "white" }}
                            >
                              Current
                            </Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={
                              <span style={{ color: "#fff" }}>Active</span>
                            }
                          >
                            <Checkbox
                              checked={formData.active}
                              onChange={handleInputChange}
                              name="active"
                              style={{ color: "white" }}
                            >
                              Active
                            </Checkbox>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </div>
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
                    Financial Year Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all financial years
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
                        Financial Year
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Year ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Identifier
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Start Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        End Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Current
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
                    {finYearList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((finYear, index) => (
                        <tr
                          key={`finYear-${index}-${finYear.id}`}
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
                            {finYear.finYear}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.finYearId}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.finYearIdentifier}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.startDate
                              ? dayjs(finYear.startDate).format("DD-MM-YYYY")
                              : ""}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.endDate
                              ? dayjs(finYear.endDate).format("DD-MM-YYYY")
                              : ""}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.currentFinYear ? "Yes" : "No"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {finYear.active ? "Yes" : "No"}
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
                                onClick={() => handleEditFinYear(finYear)}
                                style={{ color: "white" }}
                              />
                              <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                                style={{ color: "white" }}
                              />
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
                    {Math.min(currentPage * pageSize, finYearList.length)} of{" "}
                    {finYearList.length} items
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
                    { length: Math.ceil(finYearList.length / pageSize) },
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
                          Math.ceil(finYearList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(finYearList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(finYearList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(finYearList.length / pageSize)
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
    </ConfigProvider>
  );
};

export default FinYear;
