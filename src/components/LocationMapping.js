import React, { useState, useEffect } from "react";
import {
  Button,
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
import CommonBulkUpload from "../utils/CommonBulkUpload";
import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;

const LocationMapping = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [loginUserName] = useState(localStorage.getItem("userName"));
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // Data states
  const [branchList, setBranchList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [mappingList, setMappingList] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [loginBranchCode] = useState(localStorage.getItem("branchcode"));
  const [loginBranch] = useState(localStorage.getItem("branch"));
  const [loginCustomer] = useState(localStorage.getItem("customer"));
  const [loginClient] = useState(localStorage.getItem("client"));
  const [loginWarehouse] = useState(localStorage.getItem("warehouse"));
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [rowNoList, setRowNoList] = useState([]);
  const [levelNoList, setLevelNoList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    branch: "",
    location: "",
    locationType: "",
    rowNo: "",
    levelNo: "",
    active: true,
  });

  const [mappingTableData, setMappingTableData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    branch: "",
    location: "",
    locationType: "",
    rowNo: "",
    levelNo: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.locationType) {
      getAllRownoByCompanyAndWarehouseAndLocationType();
    }
  }, [formData.locationType]);

  useEffect(() => {
    if (formData.rowNo) {
      getAllLevelnoByCompanyAndWarehouseAndLocationTypeAndRowno();
    }
  }, [formData.rowNo]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getAllWarehousesByLoginBranch(),
        getAllLocationMappings(),
        getAllWarehouses(),
        getAllLocationTypes(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showToast("error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const getAllLocationTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/locationtype/warehouse?orgid=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data?.status) {
        setLocationTypeList(response.data.paramObjectsMap?.Locationtype || []);
      }
    } catch (error) {
      console.error("Error fetching location types:", error);
      showToast("error", "Failed to fetch location types");
    }
  };

  const getAllRownoByCompanyAndWarehouseAndLocationType = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/rowno/locationtype/warehouse?locationtype=${formData.locationType}&orgid=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data?.status) {
        setRowNoList(response.data.paramObjectsMap?.Rowno || []);
      }
    } catch (error) {
      console.error("Error fetching row numbers:", error);
      showToast("error", "Failed to fetch row numbers");
    }
  };

  const getAllLevelnoByCompanyAndWarehouseAndLocationTypeAndRowno =
    async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/warehousemastercontroller/levelno/rowno/locationtype/warehouse?locationtype=${formData.locationType}&orgid=${orgId}&rowno=${formData.rowNo}&warehouse=${loginWarehouse}`
        );
        if (response.data?.status) {
          setLevelNoList(response.data.paramObjectsMap?.Levelno || []);
        }
      } catch (error) {
        console.error("Error fetching level numbers:", error);
        showToast("error", "Failed to fetch level numbers");
      }
    };

  const getAllWarehousesByLoginBranch = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouse/branch?branchcode=${loginBranchCode}&orgid=${orgId}`
      );
      console.log("THE WAREHOUSEES IS:", response);
      if (response.status === true) {
        setWarehouseList(response.paramObjectsMap.Warehouse);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const getAllLocationMappings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/locationmapping?branch=${loginBranch}&client=${loginClient}&orgid=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data?.status) {
        setMappingList(response.data.paramObjectsMap?.locationMappingVO || []);
      }
    } catch (error) {
      console.error("Error fetching location mappings:", error);
      showToast("error", "Failed to fetch location mappings");
    }
  };

  const getAllWarehouses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouse/branch?branchcode=${loginBranchCode}&orgid=${orgId}`
      );
      if (response.data?.status) {
        setWarehouseList(response.data.paramObjectsMap?.warehouseVOs || []);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      showToast("error", "Failed to fetch warehouses");
    }
  };

  const getPendingMappings = async () => {
    try {
      if (!formData.branch || !formData.location) return;

      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getPendingLocationMapping`,
        {
          params: {
            branch: formData.branch,
            location: formData.location,
            orgId: orgId,
          },
        }
      );

      if (response.data?.status) {
        setMappingTableData(
          response.data.paramObjectsMap?.locationMappingVO || []
        );
      }
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
      showToast("error", "Failed to fetch pending mappings");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      branch: "",
      location: "",
      locationType: "",
      rowNo: "",
      levelNo: "",
      active: true,
    });
    setMappingTableData([]);
    setFieldErrors({
      branch: "",
      location: "",
      locationType: "",
      rowNo: "",
      levelNo: "",
    });
    setEditId("");
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.branch) errors.branch = "Branch is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.locationType)
      errors.locationType = "Location type is required";
    if (!formData.rowNo) errors.rowNo = "Row number is required";
    if (!formData.levelNo) errors.levelNo = "Level number is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast("error", "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(editId && { id: editId }),
        branch: formData.branch,
        location: formData.location,
        locationType: formData.locationType,
        rowNo: formData.rowNo,
        levelNo: formData.levelNo,
        locationMappingDetailsDTO: mappingTableData.map((item) => ({
          warehouseName: item.warehouseName,
          warehouseCode: item.warehouseCode,
          area: item.area,
          rack: item.rack,
          shelf: item.shelf,
          bin: item.bin,
        })),
        active: formData.active,
        orgId: parseInt(orgId),
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/api/warehousemastercontroller/createLocationMapping`,
        payload
      );

      if (response.data?.status) {
        showToast(
          "success",
          editId
            ? "Location mapping updated successfully"
            : "Location mapping created successfully"
        );
        handleClear();
        getAllLocationMappings();
      } else {
        showToast(
          "error",
          response.data?.paramObjectsMap?.errorMessage || "Operation failed"
        );
      }
    } catch (error) {
      console.error("Error saving location mapping:", error);
      showToast(
        "error",
        error.response?.data?.message || "An error occurred while saving"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMapping = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      branch: record.branch,
      location: record.location,
      locationType: record.locationType || "",
      rowNo: record.rowNo || "",
      levelNo: record.levelNo || "",
      active: record.active === "Active",
    });

    setMappingTableData(
      record.locationMappingDetailsVO?.map((item) => ({
        id: item.id,
        warehouseName: item.warehouseName,
        warehouseCode: item.warehouseCode,
        area: item.area,
        rack: item.rack,
        shelf: item.shelf,
        bin: item.bin,
      })) || []
    );
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (
      (name === "branch" || name === "location") &&
      (name === "branch"
        ? value && formData.location
        : formData.branch && value)
    ) {
      getPendingMappings();
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

  const showToast = (type, message) => {
    notification[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      placement: "topRight",
    });
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
                    Location Mapping Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Map locations to branches and warehouses
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
                  onClick={() => getPendingMappings()}
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
                  apiUrl={`warehousemastercontroller/LocationMappingUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="LocationMapping"
                />
              )}

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
                      label={<span style={{ color: "#fff" }}>Branch *</span>}
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
                        style={{ width: "100%" }}
                      >
                        {branchList.map((branch) => (
                          <Option key={branch.branchCode} value={branch.branch}>
                            {branch.branch}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Location *</span>}
                      validateStatus={fieldErrors.location ? "error" : ""}
                      help={fieldErrors.location}
                    >
                      <Select
                        showSearch
                        placeholder="Select Location"
                        value={formData.location || undefined}
                        onChange={(value) =>
                          handleInputChange("location", value)
                        }
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%" }}
                      >
                        {locationList.map((location) => (
                          <Option
                            key={location.locationCode}
                            value={location.locationName}
                          >
                            {location.locationName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Location Type *</span>
                      }
                      validateStatus={fieldErrors.locationType ? "error" : ""}
                      help={fieldErrors.locationType}
                    >
                      <Select
                        showSearch
                        placeholder="Select Location Type"
                        value={formData.locationType || undefined}
                        onChange={(value) =>
                          handleInputChange("locationType", value)
                        }
                        style={{ width: "100%" }}
                      >
                        {locationTypeList.map((type) => (
                          <Option key={type} value={type}>
                            {type}
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
                      label={<span style={{ color: "#fff" }}>Row No *</span>}
                      validateStatus={fieldErrors.rowNo ? "error" : ""}
                      help={fieldErrors.rowNo}
                    >
                      <Select
                        showSearch
                        placeholder="Select Row No"
                        value={formData.rowNo || undefined}
                        onChange={(value) => handleInputChange("rowNo", value)}
                        disabled={!formData.locationType}
                        style={{ width: "100%" }}
                      >
                        {rowNoList.map((row) => (
                          <Option key={row} value={row}>
                            {row}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Level No *</span>}
                      validateStatus={fieldErrors.levelNo ? "error" : ""}
                      help={fieldErrors.levelNo}
                    >
                      <Select
                        showSearch
                        placeholder="Select Level No"
                        value={formData.levelNo || undefined}
                        onChange={(value) =>
                          handleInputChange("levelNo", value)
                        }
                        disabled={!formData.rowNo}
                        style={{ width: "100%" }}
                      >
                        {levelNoList.map((level) => (
                          <Option key={level} value={level}>
                            {level}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

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
                        Mapping Details
                      </Typography.Title>
                      <Typography.Text
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          paddingLeft: "20px",
                        }}
                      >
                        Manage location mappings
                      </Typography.Text>
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
                            Warehouse Name
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Warehouse Code
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Area
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Rack
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Shelf
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
                        </tr>
                      </thead>
                      <tbody>
                        {mappingTableData.length > 0 ? (
                          mappingTableData.map((row, index) => (
                            <tr
                              key={`mapping-row-${index}`}
                              style={{
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                                color: "white",
                                backgroundColor:
                                  index % 2 === 0
                                    ? "rgba(255, 255, 255, 0.02)"
                                    : "rgba(255, 255, 255, 0.05)",
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
                                {row.warehouseName}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  color: "white",
                                  fontSize: "11px",
                                }}
                              >
                                {row.warehouseCode}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  color: "white",
                                  fontSize: "11px",
                                }}
                              >
                                {row.area}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  color: "white",
                                  fontSize: "11px",
                                }}
                              >
                                {row.rack}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  color: "white",
                                  fontSize: "11px",
                                }}
                              >
                                {row.shelf}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  color: "white",
                                  fontSize: "11px",
                                }}
                              >
                                {row.bin}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                padding: "12px",
                                color: "white",
                              }}
                            >
                              <strong>
                                {formData.branch && formData.location
                                  ? "No pending mappings found"
                                  : "Select branch and location to view mappings"}
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
                    Location Mapping Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all location mappings
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
                        Location
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Location Type
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Row No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Level No
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
                    {mappingList.length > 0 ? (
                      mappingList
                        .slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        )
                        .map((mapping, index) => (
                          <tr
                            key={`mapping-${index}-${mapping.id}`}
                            style={{
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              color: "white",
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(255, 255, 255, 0.02)"
                                  : "rgba(255, 255, 255, 0.05)",
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
                              {mapping.branch}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {mapping.location}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {mapping.locationType || "-"}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {mapping.rowNo || "-"}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {mapping.levelNo || "-"}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {mapping.active === "Active" ? "Yes" : "No"}
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
                                  onClick={() => handleEditMapping(mapping)}
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
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "12px",
                            color: "white",
                          }}
                        >
                          <strong>No location mappings found</strong>
                        </td>
                      </tr>
                    )}
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
                    {Math.min(currentPage * pageSize, mappingList.length)} of{" "}
                    {mappingList.length} items
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
                    { length: Math.ceil(mappingList.length / pageSize) },
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
                          Math.ceil(mappingList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(mappingList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(mappingList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(mappingList.length / pageSize)
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

export default LocationMapping;
