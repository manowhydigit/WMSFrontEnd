import React, { useEffect, useRef, useState } from "react";
import {
  Button,
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
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  getAllActiveCitiesByState,
  getAllActiveCountries,
  getAllActiveStatesByCountry,
} from "../utils/CommonFunctions";
import ToastComponent, { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Supplier_Upload.xlsx";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;
const { TabPane } = Tabs;

const Supplier = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [editId, setEditId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [supplierList, setSupplierList] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Filter data based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = supplierList.filter((supplier) =>
        Object.values(supplier).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(supplierList);
    }
  }, [searchText, supplierList]);

  // Handle Excel download
  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, "Suppliers.xlsx");
  };

  // Form state
  const [formData, setFormData] = useState({
    supplierName: "",
    shortName: "",
    supplierType: "",
    pan: "",
    tanNo: "",
    contactPerson: "",
    mobile: "",
    address: "",
    country: "",
    state: "",
    city: "",
    controlBranch: localStorage.getItem("branchcode"),
    pincode: "",
    email: "",
    eccNo: "",
    active: true,
  });

  const [fieldErrors, setFieldErrors] = useState({
    supplierName: "",
    shortName: "",
    supplierType: "",
    pan: "",
    tanNo: "",
    contactPerson: "",
    mobile: "",
    address: "",
    country: "",
    state: "",
    city: "",
    controlBranch: "",
    pincode: "",
    email: "",
    eccNo: "",
    active: true,
  });

  // Initialize data on component mount
  useEffect(() => {
    getAllSuppliers();
    getAllCountries();
  }, []);

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

  const getAllStates = async (countryName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/state/?country=${countryName}&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.stateVO) {
        setStateList(response.data.paramObjectsMap.stateVO);
      } else {
        showToast("warning", "No state data found");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      showToast("error", "Failed to fetch states");
    }
  };

  const getAllCities = async (stateName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/city/state?state=${stateName}&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.cityVO) {
        setCityList(response.data.paramObjectsMap.cityVO);
      } else {
        showToast("warning", "No city data found");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showToast("error", "Failed to fetch cities");
    }
  };

  // Handle country change
  const handleCountryChange = (value) => {
    setFormData({
      ...formData,
      country: value,
      state: "",
      city: "",
    });
    getAllStates(value);
  };

  // Handle state change
  const handleStateChange = (value) => {
    setFormData({
      ...formData,
      state: value,
      city: "",
    });
    getAllCities(value);
  };

  const getAllSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/supplier?cbranch=${branchCode}&client=${client}&orgid=${orgId}`
      );

      // Check response.data.status instead of response.status
      if (response.data?.status) {
        // Sort carriers by ID in descending order (highest ID first)
        const sortedSupplier = (
          response.data.paramObjectsMap.supplierVO || []
        ).sort((a, b) => b.id - a.id);
        setSupplierList(sortedSupplier);
      } else {
        showToast("warning", "No supplier data found");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showToast("error", "Error", "Failed to fetch suppliers");
    }
  };

  const handleEditSupplier = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      supplierName: record.supplier,
      shortName: record.supplierShortName,
      supplierType: record.supplierType,
      pan: record.panNo,
      tanNo: record.tanNo,
      contactPerson: record.contactPerson,
      mobile: record.mobileNo,
      address: record.addressLine1,
      country: record.country,
      state: record.state,
      city: record.city,
      controlBranch: record.cbranch,
      pincode: record.zipCode,
      email: record.email,
      eccNo: record.eccNo,
      active: record.active === "Active",
    });

    // Load states and cities when editing
    if (record.country) {
      getAllStates(record.country).then(() => {
        if (record.state) {
          getAllCities(record.state);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9 ]*$/;

    switch (name) {
      case "supplierName":
      case "shortName":
      case "contactPerson":
        if (!alphanumericRegex.test(value)) {
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
          errorMessage = "Only AlphaNumeric are allowed";
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
      setFieldErrors({ ...fieldErrors, [name]: "" });
      const updatedValue =
        name === "email" ? value.toLowerCase() : value.toUpperCase();
      setFormData({ ...formData, [name]: updatedValue });
    }
  };

  const handleSave = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.supplierName)
      errors.supplierName = "Supplier Name is required";
    if (!formData.shortName) errors.shortName = "Short Name is required";
    if (!formData.supplierType)
      errors.supplierType = "Supplier Type is required";
    if (!formData.pan) errors.pan = "Pan is required";
    if (!formData.tanNo) errors.tanNo = "Tan is required";
    if (!formData.contactPerson)
      errors.contactPerson = "Contact Person is required";
    if (!formData.mobile) {
      errors.mobile = "Mobile is required";
    } else if (formData.mobile.length < 10) {
      errors.mobile = "Mobile No must be ten digit";
    }
    if (!formData.address) errors.address = "Address is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.city) errors.city = "City is required";
    if (formData.pincode.length > 0 && formData.pincode.length < 6) {
      errors.pincode = "Pincode must be six digit";
    }
    if (formData.pan.length > 0 && formData.pan.length < 10) {
      errors.pan = "PAN must be ten digit";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid MailID Format";
    }
    if (!formData.controlBranch)
      errors.controlBranch = "Control Branch is required";
    if (!formData.eccNo) errors.eccNo = "Ecc No is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        ...formData,
        panNo: formData.pan,
        tanNo: formData.tanNo,
        mobileNo: formData.mobile,
        addressLine1: formData.address,
        zipCode: formData.pincode,
        cbranch: formData.controlBranch,
        supplier: formData.supplierName,
        supplierShortName: formData.shortName,
        orgId: orgId,
        createdBy: loginUserName,
        branchCode: branchCode,
        branch: branch,
        client: client,
        customer: customer,
        warehouse: warehouse,
      };

      try {
        const method = editId ? "put" : "post";
        const response = await axios[method](
          `${API_URL}/api/warehousemastercontroller/createUpdateSupplier`,
          saveFormData
        );
        if (response.status === true) {
          showToast(
            "success",
            editId ? "Supplier Updated" : "Supplier Created",
            editId
              ? "Supplier updated successfully"
              : "Supplier created successfully"
          );
          handleClear();
          getAllSuppliers();
        } else {
          showToast(
            "error",
            "Error",
            response.paramObjectsMap.errorMessage || "Operation failed"
          );
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "Error", error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      supplierName: "",
      shortName: "",
      supplierType: "",
      pan: "",
      tanNo: "",
      contactPerson: "",
      mobile: "",
      address: "",
      country: "",
      state: "",
      city: "",
      controlBranch: localStorage.getItem("branchcode"),
      pincode: "",
      email: "",
      eccNo: "",
      active: true,
    });
    setFieldErrors({
      supplierName: "",
      shortName: "",
      supplierType: "",
      pan: "",
      tanNo: "",
      contactPerson: "",
      mobile: "",
      address: "",
      country: "",
      state: "",
      city: "",
      controlBranch: "",
      pincode: "",
      email: "",
      eccNo: "",
      active: true,
    });
    setEditId("");
    setStateList([]);
    setCityList([]);
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllSuppliers();
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
                    Supplier Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage suppliers
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
                  apiUrl={`${API_URL}/api/warehousemastercontroller/SupplierUpload?branch=${branch}&branchCode=${loginBranchCode}&client=${client}&createdBy=${loginUserName}&customer=${customer}&orgId=${orgId}&warehouse=${warehouse}`}
                  screen="Supplier"
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
                      tab="Supplier Information"
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
                                    Supplier Name *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.supplierName ? "error" : ""
                                }
                                help={fieldErrors.supplierName}
                              >
                                <Input
                                  name="supplierName"
                                  value={formData.supplierName}
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
                                    Supplier Type *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.supplierType ? "error" : ""
                                }
                                help={fieldErrors.supplierType}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.supplierType}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      supplierType: value,
                                    }))
                                  }
                                >
                                  <Option value="VENDOR">VENDOR</Option>
                                  <Option value="SUB CONTRACTOR">
                                    SUB CONTRACTOR
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>PAN *</span>
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
                          </Row>

                          {/* Second Row */}
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>TAN *</span>
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
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Address *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.address ? "error" : ""
                                }
                                help={fieldErrors.address}
                              >
                                <Input
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row */}
                          <Row gutter={16}>
                            <Col span={6}>
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
                                  onChange={handleCountryChange}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
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
                            <Col span={6}>
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
                                  onChange={handleStateChange}
                                  disabled={!formData.country}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
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
                            <Col span={6}>
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
                                    setFormData({ ...formData, city: value })
                                  }
                                  disabled={!formData.state}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {cityList.map((city) => (
                                    <Option key={city.id} value={city.cityName}>
                                      {city.cityName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
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
                          </Row>

                          {/* Fourth Row */}
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
                                    Control Branch *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.controlBranch ? "error" : ""
                                }
                                help={fieldErrors.controlBranch}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.controlBranch}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      controlBranch: value,
                                    }))
                                  }
                                >
                                  <Option value={loginBranchCode}>
                                    {loginBranchCode}
                                  </Option>
                                  <Option value="ALL">ALL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    ECC No *
                                  </span>
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
                  Supplier List
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
                {/* Search and Download Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    padding: "0 20px",
                  }}
                >
                  <Input
                    placeholder="Search suppliers..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      width: 300,
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExcelDownload}
                    style={{
                      background: "rgba(108, 99, 255, 0.3)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Export to Excel
                  </Button>
                </div>

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
                        Supplier Name
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
                        Supplier Type
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Contact Person
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Mobile
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
                    {supplierList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((supplier, index) => (
                        <tr
                          key={`supplier-${index}-${supplier.id}`}
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
                            {supplier.supplier}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.supplierShortName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.supplierType}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.contactPerson}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.mobileNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.cbranch}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {supplier.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditSupplier(supplier)}
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
                    {Math.min(currentPage * pageSize, supplierList.length)} of{" "}
                    {supplierList.length} items
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
                    { length: Math.ceil(supplierList.length / pageSize) },
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
                          Math.ceil(supplierList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(supplierList.length / pageSize)
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
                        Math.ceil(supplierList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(supplierList.length / pageSize)
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

export default Supplier;
