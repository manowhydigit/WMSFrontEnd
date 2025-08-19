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
  InputNumber,
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
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import ToastComponent from "../utils/toast-component";
import { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Material_Upload.xlsx";
import * as XLSX from "xlsx";

const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const Item = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginBranch, setLoginBranch] = useState(
    localStorage.getItem("branch")
  );
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [itemList, setItemList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [filteredItemList, setFilteredItemList] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    itemType: "",
    partNo: "",
    partDesc: "",
    custPartNo: "",
    groupName: "",
    styleCode: "",
    baseSku: "",
    purchaseUnit: "",
    storageUnit: "",
    fsn: "",
    saleUnit: "",
    type: "",
    sku: "",
    skuQty: "",
    ssku: "",
    sskuQty: "",
    weightSkuUom: "",
    hsnCode: "",
    controlBranch: localStorage.getItem("branchcode"),
    criticalStockLevel: "",
    status: "R",
    parentChildKey: "CHILD",
    barcode: "",
    skuCategory: "",
    movingType: "",
    active: true,
  });

  const [itemTableData, setItemTableData] = useState([
    { id: 1, mrp: "", fDate: null, tDate: null },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    partNo: "",
    partDesc: "",
    sku: "",
    ssku: "",
    status: "",
  });

  // Initialize data on component mount
  useEffect(() => {
    getAllItems();
    getAllUnits();
    getAllGroups();
  }, []);

  // Fetch all items
  const getAllItems = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/material?cbranch=${loginBranchCode}&client=${loginClient}&orgid=${orgId}`
      );
      if (response.data.status === true) {
        // Sort items by ID in descending order (highest ID first)
        const sortedItems = response.data.paramObjectsMap.materialVO.sort(
          (a, b) => b.id - a.id
        );

        setItemList(sortedItems);
        setFilteredItemList(sortedItems);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      showToast("error", "Error", "Failed to fetch items");
    }
  };

  // Fetch all units
  const getAllUnits = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllUnit`
      );
      if (response.data.status === true) {
        setUnitList(response.data.paramObjectsMap.unitVO);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Fetch all groups
  const getAllGroups = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/group?orgid=${orgId}`
      );
      if (response.data.status === true) {
        setGroupList(response.data.paramObjectsMap.groupVO);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // Handle edit item
  const handleEditItem = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      itemType: record.itemType,
      partNo: record.partno,
      partDesc: record.partDesc,
      custPartNo: record.custPartno,
      groupName: record.groupName,
      styleCode: record.styleCode,
      baseSku: record.baseSku,
      purchaseUnit: record.purchaseUnit,
      storageUnit: record.storageUnit,
      fsn: record.fsn,
      saleUnit: record.saleUnit,
      type: record.type,
      sku: record.sku,
      skuQty: record.skuQty,
      ssku: record.ssku,
      sskuQty: record.sskuQty,
      weightSkuUom: record.weightofSkuAndUom,
      hsnCode: record.hsnCode,
      controlBranch: record.cbranch,
      criticalStockLevel: record.criticalStockLevel,
      status: record.status,
      parentChildKey: record.parentChildKey,
      barcode: record.barcode,
      skuCategory: record.skuCategory,
      movingType: record.movingType,
      active: record.active === "Active",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation
    let errorMessage = "";
    if (name === "baseSku" || name === "ssku") {
      if (!/^[A-Za-z0-9]*$/.test(value)) {
        errorMessage = "Only alphanumeric characters are allowed";
      } else if (value.length > 12) {
        errorMessage = "Max 12 characters allowed";
      }
    } else if (name === "fsn" || name === "hsnCode") {
      if (!/^[0-9]*$/.test(value)) {
        errorMessage = "Only numbers are allowed";
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

  // Handle save item
  const handleSaveItem = async () => {
    // Validate form
    const errors = {};
    if (!formData.partNo) errors.partNo = "Part No is required";
    if (!formData.partDesc) errors.partDesc = "Part Description is required";
    if (!formData.sku) errors.sku = "SKU is required";
    if (!formData.ssku) errors.ssku = "SSKU is required";
    if (!formData.status) errors.status = "Status is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    const itemData = {
      ...(editId && { id: editId }),
      ...formData,
      createdBy: loginUserName,
      branch: loginBranch,
      branchCode: loginBranchCode,
      warehouse: loginWarehouse,
      customer: loginCustomer,
      client: loginClient,
      orgId: orgId,
      itemVo: itemTableData.map((row) => ({
        mrp: row.mrp,
        fromdate: dayjs(row.fDate).format("DD-MM-YYYY"),
        todate: dayjs(row.tDate).format("DD-MM-YYYY"),
      })),
    };

    try {
      const method = editId ? "put" : "post";
      const response = await axios[method](
        `${API_URL}/api/warehousemastercontroller/createUpdateMaterial`,
        itemData
      );

      if (response.data.status === true) {
        showToast(
          "success",
          editId ? "Item Updated" : "Item Created",
          `Item ${editId ? "updated" : "created"} successfully.`
        );
        handleClear();
        getAllItems();
      } else {
        showToast(
          "error",
          "Error",
          response.data.message || "Failed to save item"
        );
      }
    } catch (error) {
      console.error("Error saving item:", error);
      showToast("error", "Error", "Failed to save item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      itemType: "",
      partNo: "",
      partDesc: "",
      custPartNo: "",
      groupName: "",
      styleCode: "",
      baseSku: "",
      purchaseUnit: "",
      storageUnit: "",
      fsn: "",
      saleUnit: "",
      type: "",
      sku: "",
      skuQty: "",
      ssku: "",
      sskuQty: "",
      weightSkuUom: "",
      hsnCode: "",
      controlBranch: localStorage.getItem("branchcode"),
      criticalStockLevel: "",
      status: "R",
      parentChildKey: "CHILD",
      barcode: "",
      skuCategory: "",
      movingType: "",
      active: true,
    });
    setItemTableData([{ id: 1, mrp: "", fDate: null, tDate: null }]);
    setFieldErrors({
      partNo: "",
      partDesc: "",
      sku: "",
      ssku: "",
      status: "",
    });
    setEditId("");
  };

  // Handle add row to item table
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      mrp: "",
      fDate: null,
      tDate: null,
    };
    setItemTableData([...itemTableData, newRow]);
  };

  // Handle delete row from item table
  const handleDeleteRow = (id) => {
    setItemTableData(itemTableData.filter((row) => row.id !== id));
  };

  // Toggle between form and list view
  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllItems();
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

  useEffect(() => {
    setFilteredItemList(itemList);
  }, [itemList]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  // Apply all filters
  const applyFilters = (term, status) => {
    let filtered = itemList;

    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.partno.toLowerCase().includes(lowerTerm) ||
          item.partDesc.toLowerCase().includes(lowerTerm) ||
          item.sku.toLowerCase().includes(lowerTerm)
      );
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    setFilteredItemList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleExcelDownload = () => {
    // Prepare data for Excel
    const excelData = filteredItemList.map((item) => ({
      "Part No": item.partno,
      "Part Description": item.partDesc,
      SKU: item.sku,
      Status: item.status,
      Active: item.active,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items");

    // Generate file name with timestamp
    const fileName = `Items_Export_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
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
                    Item Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage items
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
                  icon={<SaveOutlined />}
                  onClick={handleSaveItem}
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
                  apiUrl={`${API_URL}/api/warehousemastercontroller/MaterialUpload?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&orgId=${orgId}&warehouse=${loginWarehouse}`}
                  screen="Item Master"
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
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ color: "#fff" }}
                  >
                    <TabPane
                      tab="Basic Information"
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
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Item Type
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.itemType}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      itemType: value,
                                    })
                                  }
                                >
                                  <Option value="GROUP">GROUP</Option>
                                  <Option value="ITEM">ITEM</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Part No *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.partNo ? "error" : ""
                                }
                                help={fieldErrors.partNo}
                              >
                                <Input
                                  name="partNo"
                                  value={formData.partNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Part Desc *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.partDesc ? "error" : ""
                                }
                                help={fieldErrors.partDesc}
                              >
                                <Input
                                  name="partDesc"
                                  value={formData.partDesc}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Cust Part No
                                  </span>
                                }
                              >
                                <Input
                                  name="custPartNo"
                                  value={formData.custPartNo}
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
                                    Group Name
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.groupName}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      groupName: value,
                                    })
                                  }
                                >
                                  {groupList.map((group) => (
                                    <Option
                                      key={group.id}
                                      value={group.groupName}
                                    >
                                      {group.groupName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Style Code
                                  </span>
                                }
                              >
                                <Input
                                  name="styleCode"
                                  value={formData.styleCode}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Base SKU
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.baseSku ? "error" : ""
                                }
                                help={fieldErrors.baseSku}
                              >
                                <Input
                                  name="baseSku"
                                  value={formData.baseSku}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Purchase Unit
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.purchaseUnit}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      purchaseUnit: value,
                                    })
                                  }
                                >
                                  {unitList.map((unit) => (
                                    <Option key={unit.id} value={unit.unitName}>
                                      {unit.unitName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Storage Unit
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.storageUnit}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      storageUnit: value,
                                    })
                                  }
                                >
                                  {unitList.map((unit) => (
                                    <Option key={unit.id} value={unit.unitName}>
                                      {unit.unitName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>SKU *</span>
                                }
                                validateStatus={fieldErrors.sku ? "error" : ""}
                                help={fieldErrors.sku}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.sku}
                                  onChange={(value) =>
                                    setFormData({ ...formData, sku: value })
                                  }
                                >
                                  {unitList.map((unit) => (
                                    <Option key={unit.id} value={unit.unitName}>
                                      {unit.unitName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>SSKU *</span>
                                }
                                validateStatus={fieldErrors.ssku ? "error" : ""}
                                help={fieldErrors.ssku}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.ssku}
                                  onChange={(value) =>
                                    setFormData({ ...formData, ssku: value })
                                  }
                                >
                                  {unitList.map((unit) => (
                                    <Option key={unit.id} value={unit.unitName}>
                                      {unit.unitName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Control Branch
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.controlBranch}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      controlBranch: value,
                                    })
                                  }
                                >
                                  <Option value={loginBranchCode}>
                                    {loginBranchCode}
                                  </Option>
                                  <Option value="ALL">ALL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Status *
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.status ? "error" : ""
                                }
                                help={fieldErrors.status}
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.status}
                                  onChange={(value) =>
                                    setFormData({ ...formData, status: value })
                                  }
                                >
                                  <Option value="R">R</Option>
                                  <Option value="H">H</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Parent Child Key
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.parentChildKey}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      parentChildKey: value,
                                    })
                                  }
                                >
                                  <Option value="PARENT">PARENT</Option>
                                  <Option value="CHILD">CHILD</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    SKU Category
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.skuCategory}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      skuCategory: value,
                                    })
                                  }
                                >
                                  <Option value="OPENSTORAGE">
                                    Open Storage
                                  </Option>
                                  <Option value="COLDSTORAGE">
                                    Cold Storage
                                  </Option>
                                  <Option value="STRONG">Strong</Option>
                                  <Option value="REGULAR">Regular</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Moving Type
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.movingType}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      movingType: value,
                                    })
                                  }
                                >
                                  <Option value="FAST">Fast</Option>
                                  <Option value="MEDIUM">Medium</Option>
                                  <Option value="SLOW">Slow</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

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
                        </Form>
                      </div>
                    </TabPane>

                    <TabPane
                      tab="Additional Details"
                      key="2"
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
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>FSN</span>
                                }
                              >
                                <Input
                                  name="fsn"
                                  value={formData.fsn}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Sale Unit
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.saleUnit}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      saleUnit: value,
                                    })
                                  }
                                >
                                  {unitList.map((unit) => (
                                    <Option key={unit.id} value={unit.unitName}>
                                      {unit.unitName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Type</span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.type}
                                  onChange={(value) =>
                                    setFormData({ ...formData, type: value })
                                  }
                                >
                                  <Option value="TYPE 1">TYPE 1</Option>
                                  <Option value="TYPE 2">TYPE 2</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>SKU Qty</span>
                                }
                              >
                                <InputNumber
                                  name="skuQty"
                                  value={formData.skuQty}
                                  onChange={(value) =>
                                    setFormData({ ...formData, skuQty: value })
                                  }
                                  style={{ ...inputStyle, width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    SSKU Qty
                                  </span>
                                }
                              >
                                <InputNumber
                                  name="sskuQty"
                                  value={formData.sskuQty}
                                  onChange={(value) =>
                                    setFormData({ ...formData, sskuQty: value })
                                  }
                                  style={{ ...inputStyle, width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Weight SKU UOM
                                  </span>
                                }
                              >
                                <Input
                                  name="weightSkuUom"
                                  value={formData.weightSkuUom}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    HSN Code
                                  </span>
                                }
                              >
                                <Input
                                  name="hsnCode"
                                  value={formData.hsnCode}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Critical Stock Level
                                  </span>
                                }
                              >
                                <Input
                                  name="criticalStockLevel"
                                  value={formData.criticalStockLevel}
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
                                  <span style={{ color: "#fff" }}>Barcode</span>
                                }
                              >
                                <Input
                                  name="barcode"
                                  value={formData.barcode}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>

                    {/* <TabPane
                      tab="Pricing Details"
                      key="3"
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
                        <div style={{ marginBottom: "16px" }}>
                          <Button
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                            style={{
                              background: "rgba(108, 99, 255, 0.3)",
                              color: "#fff",
                              border: "none",
                              marginRight: "8px",
                            }}
                          >
                            Add Row
                          </Button>
                          <Button
                            icon={<ClearOutlined />}
                            onClick={() =>
                              setItemTableData([
                                { id: 1, mrp: "", fDate: null, tDate: null },
                              ])
                            }
                            style={{
                              background: "rgba(108, 99, 255, 0.3)",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Clear
                          </Button>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
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
                                  Action
                                </th>
                                <th
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  S.No
                                </th>
                                <th
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  MRP
                                </th>
                                <th
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  From Date
                                </th>
                                <th
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  To Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemTableData.map((row, index) => (
                                <tr
                                  key={row.id}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <td style={{ padding: "12px" }}>
                                    <Button
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDeleteRow(row.id)}
                                      style={{
                                        background: "transparent",
                                        color: "#ff4d4f",
                                        border: "none",
                                      }}
                                    />
                                  </td>
                                  <td
                                    style={{ padding: "12px", color: "white" }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <InputNumber
                                      value={row.mrp}
                                      onChange={(value) => {
                                        setItemTableData(
                                          itemTableData.map((r) =>
                                            r.id === row.id
                                              ? { ...r, mrp: value }
                                              : r
                                          )
                                        );
                                      }}
                                      style={{ ...inputStyle, width: "100%" }}
                                    />
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <DatePicker
                                      value={
                                        row.fDate ? dayjs(row.fDate) : null
                                      }
                                      onChange={(date) => {
                                        setItemTableData(
                                          itemTableData.map((r) =>
                                            r.id === row.id
                                              ? {
                                                  ...r,
                                                  fDate: date
                                                    ? date.toDate()
                                                    : null,
                                                  tDate:
                                                    date &&
                                                    r.tDate &&
                                                    date.isAfter(dayjs(r.tDate))
                                                      ? null
                                                      : r.tDate,
                                                }
                                              : r
                                          )
                                        );
                                      }}
                                      style={{ ...inputStyle, width: "100%" }}
                                    />
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <DatePicker
                                      value={
                                        row.tDate ? dayjs(row.tDate) : null
                                      }
                                      onChange={(date) => {
                                        setItemTableData(
                                          itemTableData.map((r) =>
                                            r.id === row.id
                                              ? {
                                                  ...r,
                                                  tDate: date
                                                    ? date.toDate()
                                                    : null,
                                                }
                                              : r
                                          )
                                        );
                                      }}
                                      disabled={!row.fDate}
                                      disabledDate={(current) => {
                                        return (
                                          row.fDate &&
                                          current &&
                                          current.isBefore(dayjs(row.fDate))
                                        );
                                      }}
                                      style={{ ...inputStyle, width: "100%" }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabPane> */}
                  </Tabs>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "90vh",
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
                    Item Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all items
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
                  maxHeight: "400px",
                  overflowY: "auto",
                  marginTop: "20px",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Input
                    placeholder="Search by Part No, Description, or SKU"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
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
                  />{" "}
                  {/* <Button
                    icon={<SyncOutlined />}
                    onClick={getAllItems}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      marginRight: "10px",
                      border: "none",
                    }}
                  >
                    Refresh
                  </Button> */}
                  {/* Excel Download Button */}
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
                        Part No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Part Description
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        SKU
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Status
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
                    {filteredItemList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`item-${index}-${item.id}`}
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
                            {item.partno}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.partDesc}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.sku}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.status}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditItem(item)}
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
                    {Math.min(currentPage * pageSize, filteredItemList.length)}{" "}
                    of {filteredItemList.length} items
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
                    { length: Math.ceil(filteredItemList.length / pageSize) },
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
                          Math.ceil(filteredItemList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredItemList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(itemList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(itemList.length / pageSize)
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

export default Item;
