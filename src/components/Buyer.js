import React, { useEffect, useState } from "react";
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
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./PS.css";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Buyer_Upload.xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const { Option } = Select;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const Buyer = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [isLoading, setIsLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [loginUserName] = useState(localStorage.getItem("userName"));
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [customer] = useState(localStorage.getItem("customer"));
  const [warehouse] = useState(localStorage.getItem("warehouse"));
  const [branch] = useState(localStorage.getItem("branch"));
  const [branchCode] = useState(localStorage.getItem("branchcode"));
  const [client] = useState(localStorage.getItem("client"));

  // Data states
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [buyerList, setBuyerList] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [filteredBuyerList, setFilteredBuyerList] = useState([]);

  // Pagination state

  // Initialize filtered list
  useEffect(() => {
    setFilteredBuyerList(buyerList);
  }, [buyerList]);

  // Apply filters
  useEffect(() => {
    let filtered = buyerList;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (buyer) =>
          buyer.buyerCode.toLowerCase().includes(lowerTerm) ||
          buyer.buyerName.toLowerCase().includes(lowerTerm) ||
          buyer.contactPerson.toLowerCase().includes(lowerTerm) ||
          buyer.email.toLowerCase().includes(lowerTerm)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((buyer) => buyer.status === statusFilter);
    }

    setFilteredBuyerList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, buyerList]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  // Excel Download Function
  const handleExcelDownload = () => {
    // Prepare data for Excel
    const excelData = filteredBuyerList.map((buyer) => ({
      "Buyer Name": buyer.buyer,
      "Short Name": buyer.buyerShortName,
      "Buyer Type": buyer.buyerType,
      PAN: buyer.panNo,
      TAN: buyer.tanNo,
      "Contact Person": buyer.contactPerson,
      Mobile: buyer.mobileNo,
      Active: buyer.active === "Active" ? "Yes" : "No",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buyers");

    // Generate file name with timestamp
    const fileName = `Buyers_Export_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
  };

  // Form state
  const [formData, setFormData] = useState({
    buyerName: "",
    shortName: "",
    buyerType: "",
    pan: "",
    tanNo: "",
    contactPerson: "",
    mobile: "",
    addressLine1: "",
    country: "",
    state: "",
    city: "",
    controlBranch: branchCode,
    pincode: "",
    email: "",
    gst: "YES",
    gstNo: "",
    eccNo: "",
    active: true,
  });

  const [fieldErrors, setFieldErrors] = useState({
    buyerName: "",
    shortName: "",
    buyerType: "",
    pan: "",
    tanNo: "",
    contactPerson: "",
    mobile: "",
    addressLine1: "",
    country: "",
    state: "",
    city: "",
    controlBranch: "",
    pincode: "",
    email: "",
    gst: "",
    gstNo: "",
    eccNo: "",
  });

  // Replace your current showToast function with this:
  const showToast = (type, message) => {
    notification[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      placement: "topRight",
    });
  };
  // Table columns for list view
  const listViewColumns = [
    { title: "Buyer Name", dataIndex: "buyer", key: "buyer" },
    { title: "Short Name", dataIndex: "buyerShortName", key: "buyerShortName" },
    { title: "Buyer Type", dataIndex: "buyerType", key: "buyerType" },
    { title: "PAN", dataIndex: "panNo", key: "panNo" },
    { title: "TAN", dataIndex: "tanNo", key: "tanNo" },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    { title: "Mobile", dataIndex: "mobileNo", key: "mobileNo" },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (text) => (text === "Active" ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          style={{ color: "white" }}
          onClick={() => handleEditBuyer(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Initialize data on component mount
  useEffect(() => {
    getAllBuyer();
    getAllCountries();
  }, []);

  useEffect(() => {
    if (formData.country) {
      getAllStates();
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      getAllCities();
    }
  }, [formData.state]);

  const getAllCountries = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/country?orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.countryVO) {
        setCountryList(response.data.paramObjectsMap.countryVO);
      } else {
        showToast("warning", "No country data found");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      showToast("error", "Failed to fetch countries");
    }
  };
  const getAllStates = async (country) => {
    try {
      // Use the country parameter passed to the function
      const response = await axios.get(
        `${API_URL}/api/commonmaster/state/?country=${
          country || formData.country
        }&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.stateVO) {
        setStateList(response.data.paramObjectsMap.stateVO);
        setFormData((prev) => ({ ...prev, state: "", city: "" }));
      } else {
        showToast("warning", "No state data found");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      showToast("error", "Failed to fetch states");
    }
  };

  const getAllCities = async (state) => {
    try {
      // Use the state parameter passed to the function
      const response = await axios.get(
        `${API_URL}/api/commonmaster/city/state?state=${
          state || formData.state
        }&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.cityVO) {
        setCityList(response.data.paramObjectsMap.cityVO);
        setFormData((prev) => ({ ...prev, city: "" }));
      } else {
        showToast("warning", "No city data found");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showToast("error", "Failed to fetch cities");
    }
  };

  // Update the useEffect hooks to pass the current values
  useEffect(() => {
    if (formData.country) {
      getAllStates(formData.country); // Pass the current country value
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      getAllCities(formData.state); // Pass the current state value
    }
  }, [formData.state]);

  const getAllBuyer = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/buyer?cbranch=${branchCode}&client=${client}&orgid=${orgId}`
      );
      if (response.data?.status) {
        // Sort buyers by ID in descending order (highest ID first)
        const sortedBuyers = (response.data.paramObjectsMap.buyerVO || []).sort(
          (a, b) => b.id - a.id
        );
        setBuyerList(sortedBuyers);
      }
    } catch (error) {
      console.error("Error fetching buyers:", error);
      showToast("error", "Error", "Failed to fetch buyers"); // Added error notification
    }
  };

  const handleEditBuyer = (buyer) => {
    setEditId(buyer.id);
    setViewMode("form");

    setFormData({
      buyerName: buyer.buyer,
      shortName: buyer.buyerShortName,
      buyerType: buyer.buyerType,
      pan: buyer.panNo,
      tanNo: buyer.tanNo,
      contactPerson: buyer.contactPerson,
      mobile: buyer.mobileNo,
      addressLine1: buyer.addressLine1,
      country: buyer.country,
      state: buyer.state,
      city: buyer.city,
      controlBranch: buyer.cbranch,
      pincode: buyer.zipCode,
      email: buyer.email,
      gst: buyer.gst,
      gstNo: buyer.gstNo,
      eccNo: buyer.eccNo,
      active: buyer.active === "Active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active") {
      setFormData({ ...formData, [name]: checked });
      return;
    }

    switch (name) {
      case "buyerName":
      case "shortName":
      case "contactPerson":
        if (!nameRegex.test(value)) {
          errorMessage = "Only Alphabet are allowed";
        }
        break;
      case "mobile":
        if (!numericRegex.test(value)) {
          errorMessage = "Only Numbers are allowed";
        } else if (value.length > 10) {
          errorMessage = "Mobile No must be ten digit";
        }
        break;
      case "pan":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only AlphaNumeric are allowed";
        } else if (value.length > 10) {
          errorMessage = "PAN must be ten digit";
        }
        break;
      case "tanNo":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 15) {
          errorMessage = "TAN must be fifteen digit";
        }
        break;
      case "pincode":
        if (!numericRegex.test(value)) {
          errorMessage = "Only Numbers are allowed";
        } else if (value.length > 6) {
          errorMessage = "Pincode must be six digit";
        }
        break;
      case "gstNo":
        if (formData.gst === "YES") {
          if (!alphanumericRegex.test(value)) {
            errorMessage = "Only AlphaNumeric are allowed";
          } else if (value.length > 15) {
            errorMessage = "GST must be fifteen digit";
          }
        }
        break;
      case "eccNo":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only AlphaNumeric are allowed";
        } else if (value.length > 15) {
          errorMessage = "ECC No must be fifteen digit";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      if (name === "gst" && value === "NO") {
        setFormData({ ...formData, [name]: value, gstNo: "" });
      } else {
        const updatedValue =
          name === "email" ? value.toLowerCase() : value.toUpperCase();
        setFormData((prev) => ({ ...prev, [name]: updatedValue }));
        setFieldErrors({ ...fieldErrors, [name]: "" });
      }
    }
  };

  const handleSaveBuyer = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.buyerName) errors.buyerName = "Buyer Name is required";
    if (!formData.shortName) errors.shortName = "Short Name is required";
    if (formData.pan.length < 10) errors.pan = "PAN must be ten digit";
    if (formData.mobile.length < 10)
      errors.mobile = "Mobile no must be ten digit";
    if (!formData.email) {
      errors.email = "Email ID is Required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid MailID Format";
    }
    if (formData.pincode.length > 0 && formData.pincode.length < 6) {
      errors.pincode = "Invalid Pincode";
    }
    if (formData.gst === "YES" && !formData.gstNo) {
      errors.gstNo = "GST No is Required";
    } else if (formData.gst === "YES" && formData.gstNo.length < 15) {
      errors.gstNo = "GST must be fifteen digit";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        buyer: formData.buyerName,
        buyerShortName: formData.shortName,
        buyerType: formData.buyerType,
        panNo: formData.pan,
        tanNo: formData.tanNo,
        contactPerson: formData.contactPerson,
        mobileNo: formData.mobile,
        addressLine1: formData.addressLine1,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        cbranch: formData.controlBranch,
        zipCode: formData.pincode,
        email: formData.email,
        gst: formData.gst,
        gstNo: formData.gstNo,
        eccNo: formData.eccNo,
        branch: branch,
        branchCode: branchCode,
        client: client,
        createdBy: loginUserName,
        customer: customer,
        orgId: orgId,
        warehouse: warehouse,
      };

      try {
        const response = await axios.put(
          `${API_URL}/api/warehousemastercontroller/buyer`,
          saveFormData
        );
        if (response.data?.status) {
          notification.success({
            message: editId ? "Buyer Updated" : "Buyer Created",
            description: `Buyer ${
              editId ? "updated" : "created"
            } successfully.`,
          });
          handleClear();
          getAllBuyer();
        } else {
          notification.error({
            message: "Error",
            description: response.data?.message || "Failed to save buyer",
          });
        }
      } catch (error) {
        console.error("Error saving buyer:", error);
        notification.error({
          message: "Error",
          description: "Failed to save buyer. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setEditId("");
    setFormData({
      buyerName: "",
      shortName: "",
      buyerType: "",
      pan: "",
      tanNo: "",
      contactPerson: "",
      mobile: "",
      addressLine1: "",
      country: "",
      state: "",
      city: "",
      controlBranch: branchCode,
      pincode: "",
      email: "",
      gst: "YES",
      gstNo: "",
      eccNo: "",
      active: true,
    });
    setFieldErrors({
      buyerName: "",
      shortName: "",
      buyerType: "",
      pan: "",
      tanNo: "",
      contactPerson: "",
      mobile: "",
      addressLine1: "",
      country: "",
      state: "",
      city: "",
      controlBranch: "",
      pincode: "",
      email: "",
      gst: "",
      gstNo: "",
      eccNo: "",
    });
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllBuyer();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
  };

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
        {isLoading && (
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
                    Buyer Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage buyers
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
                  onClick={handleSaveBuyer}
                  loading={isLoading}
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
                  apiUrl={`${API_URL}/api/warehousemastercontroller/BuyerUpload?branch=${branch}&branchCode=${branchCode}&client=${client}&createdBy=${loginUserName}&customer=${customer}&orgId=${orgId}&warehouse=${warehouse}`}
                  screen="Buyer"
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
                      tab="Buyer Information"
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
                          {/* First Row */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Name *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.buyerName ? "error" : ""
                                }
                                help={fieldErrors.buyerName}
                              >
                                <Input
                                  name="buyerName"
                                  value={formData.buyerName}
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
                                  fieldErrors.shortName ? "error" : ""
                                }
                                help={fieldErrors.shortName}
                              >
                                <Input
                                  name="shortName"
                                  value={formData.shortName}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Contact Person *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.contactPerson ? "error" : ""
                                }
                                help={fieldErrors.contactPerson}
                              >
                                <Input
                                  name="contactPerson"
                                  value={formData.contactPerson}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Mobile *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.mobile ? "error" : ""
                                }
                                help={fieldErrors.mobile}
                              >
                                <Input
                                  name="mobile"
                                  value={formData.mobile}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Email *</span>
                                }
                                validateStatus={
                                  fieldErrors.email ? "error" : ""
                                }
                                help={fieldErrors.email}
                              >
                                <Input
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Type *
                                  </span>
                                }
                              >
                                <Select
                                  name="buyerType"
                                  value={formData.buyerType}
                                  onChange={(value) =>
                                    handleInputChange({
                                      target: { name: "buyerType", value },
                                    })
                                  }
                                  style={selectStyle}
                                >
                                  <Option value="LOCAL">LOCAL</Option>
                                  <Option value="EXPORT">EXPORT</Option>
                                  <Option value="STOCK TRANSFER">
                                    STOCK TRANSFER
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>PAN</span>
                                }
                                validateStatus={fieldErrors.pan ? "error" : ""}
                                help={fieldErrors.pan}
                              >
                                <Input
                                  name="pan"
                                  value={formData.pan}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>TAN</span>
                                }
                                validateStatus={
                                  fieldErrors.tanNo ? "error" : ""
                                }
                                help={fieldErrors.tanNo}
                              >
                                <Input
                                  name="tanNo"
                                  value={formData.tanNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row */}
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Address *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.addressLine1 ? "error" : ""
                                }
                                help={fieldErrors.addressLine1}
                              >
                                <Input.TextArea
                                  name="addressLine1"
                                  value={formData.addressLine1}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  rows={2}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Country *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.country ? "error" : ""
                                }
                                help={fieldErrors.country}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.country}
                                  onChange={(value) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      country: value,
                                      state: "",
                                      city: "",
                                    }));
                                  }}
                                >
                                  {countryList.map((country) => (
                                    <Option
                                      key={country.id}
                                      value={country.countryName}
                                    >
                                      {country.countryName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>State *</span>
                                }
                                validateStatus={
                                  fieldErrors.state ? "error" : ""
                                }
                                help={fieldErrors.state}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.state}
                                  onChange={(value) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      state: value,
                                      city: "",
                                    }));
                                  }}
                                  disabled={!formData.country}
                                >
                                  {stateList.map((state) => (
                                    <Option
                                      key={state.id}
                                      value={state.stateName}
                                    >
                                      {state.stateName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>City *</span>
                                }
                                validateStatus={fieldErrors.city ? "error" : ""}
                                help={fieldErrors.city}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.city}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      city: value,
                                    }))
                                  }
                                  disabled={!formData.state}
                                >
                                  {cityList.map((city) => (
                                    <Option key={city.id} value={city.cityName}>
                                      {city.cityName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Fourth Row */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GST Registration *
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.gst}
                                  onChange={(value) =>
                                    handleInputChange({
                                      target: { name: "gst", value },
                                    })
                                  }
                                >
                                  <Option value="YES">YES</Option>
                                  <Option value="NO">NO</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            {formData.gst === "YES" && (
                              <Col span={6}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      GST No *
                                    </span>
                                  }
                                  validateStatus={
                                    fieldErrors.gstNo ? "error" : ""
                                  }
                                  help={fieldErrors.gstNo}
                                >
                                  <Input
                                    name="gstNo"
                                    value={formData.gstNo}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                  />
                                </Form.Item>
                              </Col>
                            )}
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Pincode</span>
                                }
                                validateStatus={
                                  fieldErrors.pincode ? "error" : ""
                                }
                                help={fieldErrors.pincode}
                              >
                                <Input
                                  name="pincode"
                                  value={formData.pincode}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>ECC No</span>
                                }
                                validateStatus={
                                  fieldErrors.eccNo ? "error" : ""
                                }
                                help={fieldErrors.eccNo}
                              >
                                <Input
                                  name="eccNo"
                                  value={formData.eccNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Fifth Row */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Control Branch *
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.controlBranch}
                                  onChange={(value) =>
                                    handleInputChange({
                                      target: { name: "controlBranch", value },
                                    })
                                  }
                                >
                                  <Option value={branchCode}>
                                    {branchCode}
                                  </Option>
                                  <Option value="ALL">ALL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                name="active"
                                valuePropName="checked"
                                style={{ marginTop: "30px" }}
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
                  Buyer Master
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
                  onChange={handleSearch}
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
                  width: "95%",
                  margin: "0 auto",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "500px",
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
                      {listViewColumns.map((column) => (
                        <th
                          key={column.key}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buyerList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((buyer, index) => (
                        <tr
                          key={`buyer-${index}-${buyer.id}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          {listViewColumns.map((column) => (
                            <td
                              key={column.key}
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {column.render
                                ? column.render(buyer[column.dataIndex], buyer)
                                : buyer[column.dataIndex]}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Pagination */}
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
                    {Math.min(currentPage * pageSize, buyerList.length)} of{" "}
                    {buyerList.length} items
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
                    { length: Math.ceil(buyerList.length / pageSize) },
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
                          Math.ceil(buyerList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(buyerList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(buyerList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(buyerList.length / pageSize)
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
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      marginLeft: "8px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {[5, 10, 20, 50, 100].map((size) => (
                      <option
                        key={size}
                        value={size}
                        style={{ backgroundColor: "#333", color: "white" }}
                      >
                        {size} per page
                      </option>
                    ))}
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

export default Buyer;
