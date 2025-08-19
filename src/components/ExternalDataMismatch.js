import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
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
import ToastComponent from "../utils/toast-component";
import { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";

const { Option } = Select;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const ExternalDataMismatch = () => {
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
  const [mismatchList, setMismatchList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    screen: "",
    entryNo: "",
    uploadedPartNo: "",
    masterPartNo: "",
    uploadedPartDesc: "",
    masterPartDesc: "",
    active: true,
  });

  const [fieldErrors, setFieldErrors] = useState({
    screen: "",
    entryNo: "",
    uploadedPartNo: "",
    masterPartNo: "",
    uploadedPartDesc: "",
    masterPartDesc: "",
  });

  // Initialize data on component mount
  useEffect(() => {
    getAllMismatches();
  }, []);

  // Fetch all mismatches
  const getAllMismatches = async () => {
    try {
      const response = await axios.get();
      if (response.data.status === true) {
        setMismatchList(response.data.paramObjectsMap.mismatchVO);
      }
    } catch (error) {
      console.error("Error fetching mismatches:", error);
      showToast("error", "Error", "Failed to fetch mismatches");
    }
  };

  // Handle edit mismatch
  const handleEditMismatch = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      screen: record.screen,
      entryNo: record.entryNo,
      uploadedPartNo: record.uploadedPartNo,
      masterPartNo: record.masterPartNo,
      uploadedPartDesc: record.uploadedPartDesc,
      masterPartDesc: record.masterPartDesc,
      active: record.active === "Active",
    });
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle save mismatch
  const handleSaveMismatch = async () => {
    // Validate form
    const errors = {};
    if (!formData.screen) errors.screen = "Screen is required";
    if (!formData.entryNo) errors.entryNo = "Entry No is required";
    if (!formData.uploadedPartNo)
      errors.uploadedPartNo = "Uploaded Part No is required";
    if (!formData.masterPartNo)
      errors.masterPartNo = "Master Part No is required";
    if (!formData.uploadedPartDesc)
      errors.uploadedPartDesc = "Uploaded Part Desc is required";
    if (!formData.masterPartDesc)
      errors.masterPartDesc = "Master Part Desc is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    const mismatchData = {
      ...(editId && { id: editId }),
      ...formData,
      orgId: orgId,
      createdBy: loginUserName,
    };

    try {
      const method = editId ? "put" : "post";
      const response = await axios[method](
        `${API_URL}/api/commonmaster/createUpdatePart`,
        mismatchData
      );

      if (response.data.status === true) {
        showToast(
          "success",
          editId ? "Mismatch Updated" : "Mismatch Created",
          `Mismatch ${editId ? "updated" : "created"} successfully.`
        );
        handleClear();
        getAllMismatches();
      } else {
        showToast(
          "error",
          "Error",
          response.data.message || "Failed to save mismatch"
        );
      }
    } catch (error) {
      console.error("Error saving mismatch:", error);
      showToast("error", "Error", "Failed to save mismatch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      screen: "",
      entryNo: "",
      uploadedPartNo: "",
      masterPartNo: "",
      uploadedPartDesc: "",
      masterPartDesc: "",
      active: true,
    });
    setFieldErrors({
      screen: "",
      entryNo: "",
      uploadedPartNo: "",
      masterPartNo: "",
      uploadedPartDesc: "",
      masterPartDesc: "",
    });
    setEditId("");
  };

  // Toggle between form and list view
  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  // Bulk upload handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);
  const handleFileUpload = (file) => console.log("File to upload:", file);
  const handleSubmitUpload = () => {
    console.log("Submit upload");
    handleBulkUploadClose();
  };

  // Styles
  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "100%",
  };

  const selectStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
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
                    External Data Mismatch
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage data mismatches between uploaded and master records
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
                  onClick={handleSaveMismatch}
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
                  apiUrl={`commonmaster/MismatchUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="Mismatch"
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
                      label={<span style={{ color: "#fff" }}>Screen *</span>}
                      validateStatus={fieldErrors.screen ? "error" : ""}
                      help={fieldErrors.screen}
                    >
                      <Select
                        placeholder="Select Screen"
                        value={formData.screen || undefined}
                        onChange={(value) => handleInputChange("screen", value)}
                        style={selectStyle}
                      >
                        <Option value="SCREEN1">SCREEN1</Option>
                        <Option value="SCREEN2">SCREEN2</Option>
                        <Option value="SCREEN3">SCREEN3</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Entry No *</span>}
                      validateStatus={fieldErrors.entryNo ? "error" : ""}
                      help={fieldErrors.entryNo}
                    >
                      <Input
                        placeholder="Enter Entry No"
                        value={formData.entryNo}
                        onChange={(e) =>
                          handleInputChange("entryNo", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>
                          Uploaded Part No *
                        </span>
                      }
                      validateStatus={fieldErrors.uploadedPartNo ? "error" : ""}
                      help={fieldErrors.uploadedPartNo}
                    >
                      <Select
                        placeholder="Select Uploaded Part No"
                        value={formData.uploadedPartNo || undefined}
                        onChange={(value) =>
                          handleInputChange("uploadedPartNo", value)
                        }
                        style={selectStyle}
                      >
                        <Option value="UPLOAD PARTNO1">UPLOAD PARTNO1</Option>
                        <Option value="UPLOAD PARTNO2">UPLOAD PARTNO2</Option>
                        <Option value="UPLOAD PARTNO3">UPLOAD PARTNO3</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Master Part No *</span>
                      }
                      validateStatus={fieldErrors.masterPartNo ? "error" : ""}
                      help={fieldErrors.masterPartNo}
                    >
                      <Select
                        placeholder="Select Master Part No"
                        value={formData.masterPartNo || undefined}
                        onChange={(value) =>
                          handleInputChange("masterPartNo", value)
                        }
                        style={selectStyle}
                      >
                        <Option value="MASTER PARTNO1">MASTER PARTNO1</Option>
                        <Option value="MASTER PARTNO2">MASTER PARTNO2</Option>
                        <Option value="MASTER PARTNO3">MASTER PARTNO3</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>
                          Uploaded Part Desc *
                        </span>
                      }
                      validateStatus={
                        fieldErrors.uploadedPartDesc ? "error" : ""
                      }
                      help={fieldErrors.uploadedPartDesc}
                    >
                      <Input
                        placeholder="Uploaded Part Desc"
                        value={formData.uploadedPartDesc}
                        onChange={(e) =>
                          handleInputChange("uploadedPartDesc", e.target.value)
                        }
                        style={inputStyle}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>
                          Master Part Desc *
                        </span>
                      }
                      validateStatus={fieldErrors.masterPartDesc ? "error" : ""}
                      help={fieldErrors.masterPartDesc}
                    >
                      <Select
                        placeholder="Select Master Part Desc"
                        value={formData.masterPartDesc || undefined}
                        onChange={(value) =>
                          handleInputChange("masterPartDesc", value)
                        }
                        style={selectStyle}
                      >
                        <Option value="MASTER PART DESC1">
                          MASTER PART DESC1
                        </Option>
                        <Option value="MASTER PART DESC2">
                          MASTER PART DESC2
                        </Option>
                        <Option value="MASTER PART DESC3">
                          MASTER PART DESC3
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Active</span>}
                    >
                      <Checkbox
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            active: e.target.checked,
                          })
                        }
                        style={{ color: "white" }}
                      >
                        Active
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
                    External Data Mismatch
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all data mismatches
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
                        Screen
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Entry No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Uploaded Part No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Master Part No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Uploaded Part Desc
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Master Part Desc
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
                    {mismatchList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((mismatch, index) => (
                        <tr
                          key={`mismatch-${index}-${mismatch.id}`}
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
                            {mismatch.screen}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.entryNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.uploadedPartNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.masterPartNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.uploadedPartDesc}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.masterPartDesc}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {mismatch.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditMismatch(mismatch)}
                                style={{ color: "#1890ff" }}
                              />
                              <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
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
                    {Math.min(currentPage * pageSize, mismatchList.length)} of{" "}
                    {mismatchList.length} items
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
                    { length: Math.ceil(mismatchList.length / pageSize) },
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
                          Math.ceil(mismatchList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(mismatchList.length / pageSize)
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
                        Math.ceil(mismatchList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(mismatchList.length / pageSize)
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

export default ExternalDataMismatch;
