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
  Divider,
  Tabs,
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
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

import { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Carrier_Upload.xlsx";
import * as XLSX from "xlsx";

const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const Carrier = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem("orgId")));
  const [editId, setEditId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );

  const [client, setClient] = useState(localStorage.getItem("client"));

  const [cbranch, setCBranch] = useState(localStorage.getItem("cbranch"));
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [carrierList, setCarrierList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [shipmentModeFilter, setShipmentModeFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredCarrierList, setFilteredCarrierList] = useState([]);

  // Initialize filtered list
  useEffect(() => {
    setFilteredCarrierList(carrierList);
  }, [carrierList]);

  // Apply filters
  useEffect(() => {
    let filtered = carrierList;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (carrier) =>
          (carrier.carrier &&
            carrier.carrier.toLowerCase().includes(lowerTerm)) ||
          (carrier.carrierShortName &&
            carrier.carrierShortName.toLowerCase().includes(lowerTerm)) ||
          (carrier.cbranch && carrier.cbranch.toLowerCase().includes(lowerTerm))
      );
    }

    if (shipmentModeFilter) {
      filtered = filtered.filter(
        (carrier) => carrier.shipmentMode === shipmentModeFilter
      );
    }

    if (activeFilter !== null) {
      filtered = filtered.filter((carrier) =>
        activeFilter ? carrier.active === "Active" : carrier.active !== "Active"
      );
    }

    setFilteredCarrierList(filtered);
    setCurrentPage(1);
  }, [searchTerm, shipmentModeFilter, activeFilter, carrierList]);

  // Excel Download Function
  const handleExcelDownload = () => {
    // Prepare data for Excel
    const excelData = filteredCarrierList.map((carrier) => ({
      "Carrier Name": carrier.carrier,
      "Short Name": carrier.carrierShortName,
      "Shipment Mode": carrier.shipmentMode,
      "Control Branch": carrier.cbranch,
      Active: carrier.active === "Active" ? "Yes" : "No",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Carriers");

    // Generate file name with timestamp
    const fileName = `Carriers_Export_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
  };

  // Form state
  const [formData, setFormData] = useState({
    carrier: "",
    carrierShortName: "",
    shipmentMode: "",
    cbranch: localStorage.getItem("branchcode"),
    active: true,
    branch: localStorage.getItem("branch"),
    branchCode: localStorage.getItem("branchcode"),
    warehouse: localStorage.getItem("warehouse"),
    customer: localStorage.getItem("customer"),
    client: localStorage.getItem("client"),
    orgId: orgId,
  });

  const [fieldErrors, setFieldErrors] = useState({
    carrier: "",
    carrierShortName: "",
    shipmentMode: "",
    cbranch: "",
  });

  // Initialize data on component mount
  useEffect(() => {
    getAllCarriers();
  }, []);

  // Fetch all carriers
  const getAllCarriers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/carrier?orgid=${orgId}&client=${formData.client}&cbranch=${formData.branchCode}`
      );
      if (response.data?.status) {
        // Sort carriers by ID in descending order (highest ID first)
        const sortedCarriers = (
          response.data.paramObjectsMap.carrierVO || []
        ).sort((a, b) => b.id - a.id);
        setCarrierList(sortedCarriers);
      }
    } catch (error) {
      console.error("Error fetching carriers:", error);
      showToast("error", "Error", "Failed to fetch carriers");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation
    let errorMessage = "";
    if (name === "carrier" || name === "carrierShortName") {
      if (!/^[A-Za-z ]*$/.test(value)) {
        errorMessage = "Only alphabetic characters are allowed";
      }
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      const updatedValue = value.toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: updatedValue }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  // Handle edit carrier
  const handleEditCarrier = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      carrier: record.carrier,
      carrierShortName: record.carrierShortName,
      shipmentMode: record.shipmentMode,
      cbranch: record.cbranch,
      active: record.active === "Active",
      branch: record.branch,
      branchCode: record.branchCode,
      warehouse: record.warehouse,
      customer: record.customer,
      client: record.client,
      orgId: orgId,
    });
  };

  // Handle save carrier
  const handleSaveCarrier = async () => {
    // Validate form
    const errors = {};
    if (!formData.carrier) errors.carrier = "Carrier Name is required";
    if (!formData.carrierShortName)
      errors.carrierShortName = "Short Name is required";
    if (!formData.shipmentMode)
      errors.shipmentMode = "Shipment Mode is required";
    if (!formData.cbranch) errors.cbranch = "Control Branch is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    const carrierData = {
      ...(editId && { id: editId }),
      ...formData,
      createdBy: loginUserName,
    };

    try {
      const method = editId ? "put" : "post";
      const response = await axios[method](
        `${API_URL}/api/warehousemastercontroller/createUpdateCarrier`,
        carrierData
      );

      if (response.data.status === true) {
        showToast(
          "success",
          editId ? "Carrier Updated" : "Carrier Created",
          `Carrier ${editId ? "updated" : "created"} successfully.`
        );
        handleClear();
        getAllCarriers();
      } else {
        showToast(
          "error",
          "Error",
          response.data.message || "Failed to save carrier"
        );
      }
    } catch (error) {
      console.error("Error saving carrier:", error);
      showToast("error", "Error", "Failed to save carrier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      carrier: "",
      carrierShortName: "",
      shipmentMode: "",
      cbranch: localStorage.getItem("branchcode"),
      active: true,
      branch: localStorage.getItem("branch"),
      branchCode: localStorage.getItem("branchcode"),
      warehouse: localStorage.getItem("warehouse"),
      customer: localStorage.getItem("customer"),
      client: localStorage.getItem("client"),
      orgId: orgId,
    });
    setFieldErrors({
      carrier: "",
      carrierShortName: "",
      shipmentMode: "",
      cbranch: "",
    });
    setEditId("");
  };

  // Toggle between form and list view
  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllCarriers();
    }
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

  const readOnlyInputStyle = {
    ...inputStyle,
    background: "rgba(255, 255, 255, 0.05)",
    cursor: "not-allowed",
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
                    Carrier Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage carriers
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
                  onClick={handleSaveCarrier}
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
                  downloadText="Sample File"
                  onSubmit={handleSubmitUpload}
                  sampleFileDownload={sampleFile}
                  handleFileUpload={handleFileUpload}
                  apiUrl={`${API_URL}/api/warehousemastercontroller/CarrierlUpload?branch=${formData.branch}&branchCode=${formData.branchCode}&client=${formData.client}&createdBy=${loginUserName}&customer=${formData.customer}&orgId=${orgId}&warehouse=${formData.warehouse}`}
                  screen="Carrier"
                />
              )}

              {/* Main Form */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Left Form Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    width: "100%",
                  }}
                >
                  <Tabs
                    className="white-tabs"
                    defaultActiveKey="1"
                    style={{ color: "#fff" }}
                  >
                    <TabPane
                      tab="Carrier Information"
                      key="1"
                      style={{ color: "#fff" }}
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
                          {/* First Row - 4 columns */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Carrier Name *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.carrier ? "error" : ""
                                }
                                help={fieldErrors.carrier}
                              >
                                <Input
                                  name="carrier"
                                  value={formData.carrier}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Short Name *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.carrierShortName ? "error" : ""
                                }
                                help={fieldErrors.carrierShortName}
                              >
                                <Input
                                  name="carrierShortName"
                                  value={formData.carrierShortName}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Shipment Mode *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.shipmentMode ? "error" : ""
                                }
                                help={fieldErrors.shipmentMode}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.shipmentMode}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      shipmentMode: value,
                                    }))
                                  }
                                >
                                  <Option value="AIR">AIR</Option>
                                  <Option value="SEA">SEA</Option>
                                  <Option value="ROAD">ROAD</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Control Branch *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.cbranch ? "error" : ""
                                }
                                help={fieldErrors.cbranch}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.cbranch}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      cbranch: value,
                                    }))
                                  }
                                >
                                  <Option value={formData.branchCode}>
                                    {formData.branchCode}
                                  </Option>
                                  <Option value="ALL">ALL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 1 column */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Active</span>
                                }
                              >
                                <Checkbox
                                  checked={formData.active}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      active: e.target.checked,
                                    }))
                                  }
                                  style={{ color: "white" }}
                                >
                                  Active
                                </Checkbox>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "80vh",
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
                <Typography.Title
                  level={3}
                  style={{ color: "#fff", marginLeft: "20px" }}
                >
                  Carrier Master
                </Typography.Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginRight: "20px",
                    border: "none",
                  }}
                >
                  Add New
                </Button>
              </div>

              {/* Search and Filter Controls */}
              <div
                style={{
                  margin: "20px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Input
                  placeholder="Search buyers..."
                  allowClear
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "300px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                  prefix={
                    <SearchOutlined
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    />
                  }
                />

                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExcelDownload}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                    marginLeft: "auto",
                  }}
                >
                  Export to Excel
                </Button>
              </div>
              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "80%",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "380px",
                  overflowY: "auto",
                  marginTop: "40px",
                  marginLeft: "60px",
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
                        Carrier Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Short Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Shipment Mode
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Control Branch
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
                    {carrierList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((carrier, index) => (
                        <tr
                          key={`carrier-${index}-${carrier.id}`}
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
                            {carrier.carrier}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {carrier.carrierShortName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {carrier.shipmentMode}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {carrier.cbranch}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {carrier.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditCarrier(carrier)}
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
                    paddingRight: "50px",
                    color: "white",
                  }}
                >
                  <span style={{ marginRight: "16px", fontSize: "12px" }}>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, carrierList.length)} of{" "}
                    {carrierList.length} items
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
                    { length: Math.ceil(carrierList.length / pageSize) },
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
                          Math.ceil(carrierList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(carrierList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(carrierList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(carrierList.length / pageSize)
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

export default Carrier;
