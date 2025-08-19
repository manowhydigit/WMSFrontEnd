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
  Space,
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
  AppstoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ToastComponent from "../utils/toast-component";
import { showToast } from "../utils/toast-component";
import CommonBulkUpload from "../utils/CommonBulkUpload";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;
const { TabPane } = Tabs;

const WarehouseLocation = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  // Data states
  const [warehouseList, setWarehouseList] = useState([]);
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [binCategoryList, setBinCategoryList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [commonCore, setCommonCore] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    branch: branch,
    warehouse: "",
    locationType: "",
    rowNo: "",
    levelIdentity: "",
    cellFrom: "",
    cellTo: "",
    active: true,
    orgId: orgId,
  });

  const [binTableData, setBinTableData] = useState([
    {
      id: 1,
      bin: "",
      binCategory: "",
      status: "",
      core: "",
    },
  ]);

  const [binTableErrors, setBinTableErrors] = useState([
    {
      bin: "",
      binCategory: "",
      status: "",
      core: "",
    },
  ]);

  // Error states
  const [fieldErrors, setFieldErrors] = useState({
    warehouse: "",
    locationType: "",
    rowNo: "",
    levelIdentity: "",
    cellFrom: "",
    cellTo: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getAllWarehousesByLoginBranch(),
        getAllLocationTypes(),
        getAllCellCategories(),
        getAllWarehousesLocations(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllWarehousesLocations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouselocation?branch=${branch}&orgid=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data.status) {
        setLocationList(response.data.paramObjectsMap.warehouseLocationVO);
      }
    } catch (error) {
      console.error("Error fetching warehouse locations:", error);
    }
  };

  const getAllWarehousesByLoginBranch = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouse/branch?branchcode=${branchCode}&orgid=${orgId}`
      );
      if (response.data.status) {
        setWarehouseList(response.data.paramObjectsMap.Warehouse);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const getAllCellCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllCellTypeByOrgId?orgId=${orgId}`
      );
      if (response.data.status) {
        setBinCategoryList(response.data.paramObjectsMap.cellTypeVO);
      }
    } catch (error) {
      console.error("Error fetching cell categories:", error);
    }
  };

  const getAllLocationTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllBinTypeByOrgId?orgId=${orgId}`
      );
      if (response.data.status) {
        setLocationTypeList(response.data.paramObjectsMap.binTypeVO);
      }
    } catch (error) {
      console.error("Error fetching location types:", error);
    }
  };

  const getLocationById = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getWarehouselocationById?id=${id}`
      );
      if (response.data.status) {
        const location = response.data.paramObjectsMap.warehouseLocationVO;
        setFormData({
          warehouse: location.warehouse,
          locationType: location.binType,
          rowNo: location.rowNo,
          levelIdentity: location.level,
          cellFrom: location.cellFrom,
          cellTo: location.cellTo,
          active: location.active === "Active" ? true : false,
        });

        setBinTableData(
          location.warehouseLocationDetailsVO.map((loc) => ({
            id: loc.id,
            bin: loc.bin,
            binCategory: loc.binCategory,
            status: loc.status,
            core: loc.core,
          }))
        );
        setEditId(id);
        setViewMode("form");
      }
    } catch (error) {
      console.error("Error fetching warehouse location:", error);
    }
  };

  const getAllBinDetails = async () => {
    const errors = {};
    if (!formData.warehouse) errors.warehouse = "Warehouse is required";
    if (!formData.levelIdentity)
      errors.levelIdentity = "Level Identity is required";
    if (!formData.cellTo) errors.cellTo = "Cell To is required";
    if (!formData.rowNo) errors.rowNo = "Row is required";

    if (Object.keys(errors).length === 0) {
      try {
        const response = await axios.get(
          `${API_URL}/api/warehousemastercontroller/getPalletno?endno=${formData.cellTo}&level=${formData.levelIdentity}&rowno=${formData.rowNo}&startno=${formData.cellFrom}`
        );

        if (response.data.status) {
          const palletDetails = response.data.paramObjectsMap.pallet;
          const updatedBinTableData = palletDetails.map((plt) => ({
            id: plt.id,
            bin: plt.bin,
            binCategory: plt.bincategory,
            status: plt.status === "T" ? "True" : "False",
            core: commonCore,
          }));

          setBinTableData(updatedBinTableData);
        }
      } catch (error) {
        console.error("Error fetching bin details:", error);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleInputChange = (name, value) => {
    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9 ]*$/;
    const specialCharsRegex = /^[A-Za-z0-9#_\-/\\]*$/;

    let errorMessage = "";

    switch (name) {
      case "cellFrom":
      case "cellTo":
        if (!numericRegex.test(value))
          errorMessage = "Only Numbers are allowed";
        break;
      case "rowNo":
        if (!specialCharsRegex.test(value))
          errorMessage =
            "Only alphanumeric and /, -, _, \\ characters are allowed";
        break;
      case "levelIdentity":
        if (!alphanumericRegex.test(value))
          errorMessage = "Only alphanumeric characters are allowed";
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      if (name === "locationType") {
        const selectedLocationType = locationTypeList.find(
          (loc) => loc.binType === value
        );
        if (selectedLocationType) {
          setCommonCore(selectedLocationType.core);
        }
      }

      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    }
  };

  const isLastRowEmpty = () => {
    const lastRow = binTableData[binTableData.length - 1];
    return (
      !lastRow.bin || !lastRow.binCategory || !lastRow.status || !lastRow.core
    );
  };

  const displayRowError = () => {
    setBinTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[binTableData.length - 1] = {
        ...newErrors[binTableData.length - 1],
        bin: !binTableData[binTableData.length - 1].bin
          ? "Bin is required"
          : "",
        binCategory: !binTableData[binTableData.length - 1].binCategory
          ? "Bin Category is required"
          : "",
        status: !binTableData[binTableData.length - 1].status
          ? "Status is required"
          : "",
        core: !binTableData[binTableData.length - 1].core
          ? "Core is required"
          : "",
      };
      return newErrors;
    });
  };

  const handleAddRow = () => {
    if (isLastRowEmpty()) {
      displayRowError();
      return;
    }
    const newRow = {
      id: Date.now(),
      bin: "",
      binCategory: "",
      status: "",
      core: "",
    };
    setBinTableData([...binTableData, newRow]);
    setBinTableErrors([
      ...binTableErrors,
      {
        bin: "",
        binCategory: "",
        status: "",
        core: "",
      },
    ]);
  };

  const handleDeleteRow = (id) => {
    setBinTableData(binTableData.filter((row) => row.id !== id));
  };

  const handleClear = () => {
    setEditId("");
    setFormData({
      branch: branch,
      warehouse: "",
      locationType: "",
      rowNo: "",
      levelIdentity: "",
      cellFrom: "",
      cellTo: "",
      active: true,
    });
    setBinTableData([
      {
        id: 1,
        bin: "",
        binCategory: "",
        status: "",
        core: "",
      },
    ]);
    setFieldErrors({
      warehouse: "",
      locationType: "",
      rowNo: "",
      levelIdentity: "",
      cellFrom: "",
      cellTo: "",
    });
    setBinTableErrors("");
  };

  const handleTableClear = () => {
    setBinTableData([
      { id: 1, bin: "", binCategory: "", status: "", core: "" },
    ]);
    setBinTableErrors("");
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.branch) errors.branch = "Branch is required";
    if (!formData.warehouse) errors.warehouse = "Warehouse is required";
    if (!formData.locationType)
      errors.locationType = "Location Type is required";
    if (!formData.rowNo) errors.rowNo = "Row Number is required";
    if (!formData.levelIdentity)
      errors.levelIdentity = "Level Identity is required";
    if (!formData.cellFrom) errors.cellFrom = "Cell From is required";
    if (!formData.cellTo) errors.cellTo = "Cell To is required";

    let binTableDataValid = true;
    const newTableErrors = binTableData.map((row) => {
      const rowErrors = {};
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        binTableDataValid = false;
      }
      if (!row.binCategory) {
        rowErrors.binCategory = "Bin Category is required";
        binTableDataValid = false;
      }
      if (!row.status) {
        rowErrors.status = "Status is required";
        binTableDataValid = false;
      }
      if (!row.core) {
        rowErrors.core = "Core is required";
        binTableDataValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setBinTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && binTableDataValid) {
      setIsSubmitting(true);

      const binVo = binTableData.map((row) => ({
        ...(editId && { id: row.id }),
        bin: row.bin,
        binCategory: row.binCategory,
        status: row.status,
        core: row.core,
      }));

      const payload = {
        ...(editId && { id: editId }),
        branch: formData.branch,
        branchCode: branchCode,
        warehouse: formData.warehouse,
        binType: formData.locationType,
        rowNo: formData.rowNo,
        level: formData.levelIdentity,
        cellFrom: formData.cellFrom,
        cellTo: formData.cellTo,
        warehouseLocationDetailsDTO: binVo,
        active: formData.active,
        orgId: orgId,
        createdBy: loginUserName,
      };

      try {
        const response = await axios.put(
          `${API_URL}/api/warehousemastercontroller/warehouselocation`,
          payload
        );

        if (response.data.status) {
          showToast(
            "success",
            editId
              ? "Warehouse Location updated successfully"
              : "Warehouse Location created successfully"
          );
          handleClear();
          getAllWarehousesLocations();
        } else {
          showToast(
            "error",
            response.data.paramObjectsMap.errorMessage || "Operation failed"
          );
        }
      } catch (error) {
        console.error("Error saving warehouse location:", error);
        showToast("error", "An error occurred while saving");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
    if (viewMode === "list") {
      handleClear();
    }
  };

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
                    Warehouse Location Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage warehouse location information
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
                  apiUrl={`warehousemastercontroller/WarehouseLocationUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="WarehouseLocation"
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
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Branch</span>}
                    >
                      <Input
                        placeholder="Branch"
                        value={formData.branch}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Warehouse</span>}
                      validateStatus={fieldErrors.warehouse ? "error" : ""}
                      help={fieldErrors.warehouse}
                    >
                      <Select
                        placeholder="Select Warehouse"
                        value={formData.warehouse}
                        onChange={(value) =>
                          handleInputChange("warehouse", value)
                        }
                        disabled={!!editId}
                      >
                        {warehouseList.map((warehouse) => (
                          <Option
                            key={warehouse.id}
                            value={warehouse.Warehouse}
                          >
                            {warehouse.Warehouse}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Location Type</span>
                      }
                      validateStatus={fieldErrors.locationType ? "error" : ""}
                      help={fieldErrors.locationType}
                    >
                      <Select
                        placeholder="Select Location Type"
                        value={formData.locationType}
                        onChange={(value) =>
                          handleInputChange("locationType", value)
                        }
                        disabled={!!editId}
                      >
                        {locationTypeList.map((type) => (
                          <Option key={type.id} value={type.binType}>
                            {type.binType}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
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
                        style={{ marginTop: "8px" }}
                      >
                        Is Active
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Row No</span>}
                      validateStatus={fieldErrors.rowNo ? "error" : ""}
                      help={fieldErrors.rowNo}
                    >
                      <Input
                        placeholder="Enter Row No"
                        value={formData.rowNo}
                        onChange={(e) =>
                          handleInputChange("rowNo", e.target.value)
                        }
                        disabled={!!editId}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Level Identity</span>
                      }
                      validateStatus={fieldErrors.levelIdentity ? "error" : ""}
                      help={fieldErrors.levelIdentity}
                    >
                      <Input
                        placeholder="Enter Level Identity"
                        value={formData.levelIdentity}
                        onChange={(e) =>
                          handleInputChange("levelIdentity", e.target.value)
                        }
                        disabled={!!editId}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Cell From</span>}
                      validateStatus={fieldErrors.cellFrom ? "error" : ""}
                      help={fieldErrors.cellFrom}
                    >
                      <Input
                        placeholder="Enter Cell From"
                        value={formData.cellFrom}
                        onChange={(e) =>
                          handleInputChange("cellFrom", e.target.value)
                        }
                        disabled={!!editId}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Cell To</span>}
                      validateStatus={fieldErrors.cellTo ? "error" : ""}
                      help={fieldErrors.cellTo}
                    >
                      <Input
                        placeholder="Enter Cell To"
                        value={formData.cellTo}
                        onChange={(e) =>
                          handleInputChange("cellTo", e.target.value)
                        }
                        disabled={!!editId}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Bin Details Section */}
                <div style={{ marginTop: "24px" }}>
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
                          Bin Details
                        </Typography.Title>
                        <Typography.Text
                          style={{
                            color: "rgba(255, 255, 255, 0.8)",
                            paddingLeft: "20px",
                          }}
                        >
                          Manage warehouse bin details
                        </Typography.Text>
                      </div>
                      <div>
                        <Button
                          icon={<AppstoreOutlined />}
                          onClick={getAllBinDetails}
                          style={{
                            backgroundColor: "transparent",
                            color: "white",
                            marginRight: "10px",
                            marginTop: "20px",
                            border: "none",
                          }}
                        >
                          Fill Grid
                        </Button>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          style={{
                            backgroundColor: "transparent",
                            color: "white",
                            marginRight: "20px",
                            marginTop: "20px",
                            border: "none",
                          }}
                        >
                          Add Bin
                        </Button>
                      </div>
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
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.3)",
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
                              Bin
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin Category
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
                              Core
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {binTableData.length > 0 ? (
                            binTableData.map((row, index) => (
                              <tr
                                key={`bin-row-${index}`}
                                style={{
                                  borderBottom:
                                    "1px solid rgba(255, 255, 255, 0.1)",
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
                                  <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteRow(row.id)}
                                    style={{ color: "#ff4d4f" }}
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {index + 1}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  <Input
                                    value={row.bin}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setBinTableData((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, bin: value }
                                            : r
                                        )
                                      );
                                      setBinTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = {
                                          ...newErrors[index],
                                          bin: !value ? "Bin is required" : "",
                                        };
                                        return newErrors;
                                      });
                                    }}
                                    status={
                                      binTableErrors[index]?.bin ? "error" : ""
                                    }
                                  />
                                  {binTableErrors[index]?.bin && (
                                    <div
                                      style={{
                                        color: "#ff4d4f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {binTableErrors[index].bin}
                                    </div>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  <Select
                                    style={{ width: "100%" }}
                                    value={row.binCategory}
                                    onChange={(value) => {
                                      setBinTableData((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, binCategory: value }
                                            : r
                                        )
                                      );
                                      setBinTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = {
                                          ...newErrors[index],
                                          binCategory: !value
                                            ? "Bin Category is required"
                                            : "",
                                        };
                                        return newErrors;
                                      });
                                    }}
                                    status={
                                      binTableErrors[index]?.binCategory
                                        ? "error"
                                        : ""
                                    }
                                  >
                                    <Option value="">Select Category</Option>
                                    {binCategoryList.map((category) => (
                                      <Option
                                        key={category.id}
                                        value={category.cellType}
                                      >
                                        {category.cellType}
                                      </Option>
                                    ))}
                                  </Select>
                                  {binTableErrors[index]?.binCategory && (
                                    <div
                                      style={{
                                        color: "#ff4d4f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {binTableErrors[index].binCategory}
                                    </div>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  <Select
                                    style={{ width: "100%" }}
                                    value={row.status}
                                    onChange={(value) => {
                                      setBinTableData((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, status: value }
                                            : r
                                        )
                                      );
                                      setBinTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = {
                                          ...newErrors[index],
                                          status: !value
                                            ? "Status is required"
                                            : "",
                                        };
                                        return newErrors;
                                      });
                                    }}
                                    status={
                                      binTableErrors[index]?.status
                                        ? "error"
                                        : ""
                                    }
                                  >
                                    <Option value="">Select Status</Option>
                                    <Option value="True">True</Option>
                                    <Option value="False">False</Option>
                                  </Select>
                                  {binTableErrors[index]?.status && (
                                    <div
                                      style={{
                                        color: "#ff4d4f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {binTableErrors[index].status}
                                    </div>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  <Input
                                    value={row.core}
                                    disabled
                                    status={
                                      binTableErrors[index]?.core ? "error" : ""
                                    }
                                  />
                                  {binTableErrors[index]?.core && (
                                    <div
                                      style={{
                                        color: "#ff4d4f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {binTableErrors[index].core}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                <strong style={{ color: "white" }}>
                                  No bin details found
                                </strong>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                    Warehouse Location Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all warehouse locations
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
                        Branch
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Warehouse
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Bin Type
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Row
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Level
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Start
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        End
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
                    {locationList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((location, index) => (
                        <tr
                          key={`location-${index}-${location.id}`}
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
                            {location.branch}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.warehouse}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.binType}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.rowNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.level}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.cellFrom}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.cellTo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {location.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => getLocationById(location.id)}
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
                    {Math.min(currentPage * pageSize, locationList.length)} of{" "}
                    {locationList.length} items
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
                    { length: Math.ceil(locationList.length / pageSize) },
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
                          Math.ceil(locationList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(locationList.length / pageSize)
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
                        Math.ceil(locationList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(locationList.length / pageSize)
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

export default WarehouseLocation;
