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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;

const DocumentMapping = () => {
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
  const [finYearList, setFinYearList] = useState([]);
  const [mappingList, setMappingList] = useState([]);
  const [screenList, setScreenList] = useState([]);
  const [clientList, setClientList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    branch: "",
    finYear: "",
    active: true,
  });

  const [mappingTableData, setMappingTableData] = useState([]);

  // Error states
  const [fieldErrors, setFieldErrors] = useState({
    branch: "",
    finYear: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getAllBranches(),
        getAllFinYears(),
        getAllDocumentTypeMappings(),
        getAllScreens(),
        getAllClients(),
      ]);
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

  const getAllFinYears = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllAciveFInYear?orgId=${orgId}`
      );
      if (response.data.status) {
        setFinYearList(response.data.paramObjectsMap.financialYearVOs);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const getAllDocumentTypeMappings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllDocumentTypeMapping?orgId=${orgId}`
      );
      if (response.data.status) {
        setMappingList(response.data.paramObjectsMap.documentTypeMappingVO);
      }
    } catch (error) {
      console.error("Error fetching document type mappings:", error);
    }
  };

  const getAllScreens = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/allScreenNames`
      );
      if (response.data.status) {
        setScreenList(response.data.paramObjectsMap.screenNamesVO);
      }
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  };

  const getAllClients = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getClientAndClientCodeByOrgId?orgId=${orgId}`
      );
      if (response.data.status) {
        setClientList(response.data.paramObjectsMap.CustomerVO);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const getPendingMappings = async () => {
    try {
      if (!formData.branch || !formData.finYear) return;

      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getPendingDocumentTypeMapping`,
        {
          params: {
            branch: formData.branch,
            finYear: formData.finYear,
            orgId: orgId,
          },
        }
      );

      if (response.data.status) {
        setMappingTableData(
          response.data.paramObjectsMap.documentTypeMappingVO
        );
      }
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      branch: "",
      finYear: "",
      active: true,
    });
    setMappingTableData([]);
    setFieldErrors({
      branch: "",
      finYear: "",
    });
    setEditId("");
  };

  // Handle save document type mapping
  const handleSave = async () => {
    // Form validation
    const errors = {};
    if (!formData.branch) errors.branch = "Branch is required";
    if (!formData.finYear) errors.finYear = "Financial year is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(editId && { id: editId }),
        branch: formData.branch,
        finYear: formData.finYear,
        documentTypeMappingDetailsDTO: mappingTableData.map((item) => ({
          screenName: item.screenName,
          screenCode: item.screenCode,
          client: item.client,
          clientCode: item.clientCode,
          docCode: item.docCode,
          prefixField: item.prefixField,
        })),
        active: formData.active,
        orgId: orgId,
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/api/warehousemastercontroller/createDocumentTypeMapping`,
        payload
      );

      if (response.data.status) {
        showToast(
          "success",
          editId
            ? "Document type mapping updated successfully"
            : "Document type mapping created successfully"
        );
        handleClear();
        getAllDocumentTypeMappings();
      } else {
        showToast(
          "error",
          response.data.paramObjectsMap.errorMessage || "Operation failed"
        );
      }
    } catch (error) {
      console.error("Error saving document type mapping:", error);
      showToast("error", "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit document type mapping
  const handleEditMapping = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      branch: record.branch,
      finYear: record.finYear,
      active: record.active === "Active",
    });

    // Set mapping table data
    if (
      record.documentTypeMappingDetailsVO &&
      record.documentTypeMappingDetailsVO.length > 0
    ) {
      setMappingTableData(
        record.documentTypeMappingDetailsVO.map((item) => ({
          id: item.id,
          screenName: item.screenName,
          screenCode: item.screenCode,
          client: item.client,
          clientCode: item.clientCode,
          docCode: item.docCode,
          prefixField: item.prefixField,
        }))
      );
    } else {
      setMappingTableData([]);
    }
  };

  // Handle form input changes
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

    // If both branch and finYear are selected, fetch pending mappings
    if (
      (name === "branch" || name === "finYear") &&
      (name === "branch" ? value && formData.finYear : formData.branch && value)
    ) {
      getPendingMappings();
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
                    Document Type Mapping Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Map document types to branches and financial years
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
                  apiUrl={`warehousemastercontroller/DocTypeMappingUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="DocTypeMapping"
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
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>FinYear</span>}
                      validateStatus={fieldErrors.finYear ? "error" : ""}
                      help={fieldErrors.finYear}
                    >
                      <Select
                        showSearch
                        placeholder="Select Financial Year"
                        value={formData.finYear || undefined}
                        onChange={(value) =>
                          handleInputChange("finYear", value)
                        }
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%" }}
                      >
                        {finYearList.map((year) => (
                          <Option
                            key={year.finYearIdentifier}
                            value={year.finYear}
                          >
                            {year.finYear}
                          </Option>
                        ))}
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
                        style={{ marginTop: "8px" }}
                      >
                        Is Active
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Mapping Table */}
                <div style={{ marginTop: "24px" }}>
                  <Typography.Title level={5} style={{ color: "#fff" }}>
                    Document Type Mappings
                  </Typography.Title>

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
                          Manage document type mappings
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
                              Screen Name
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Screen Code
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Client
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Client Code
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Document Code
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Prefix
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
                                  {row.screenName}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {row.screenCode}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {row.client}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {row.clientCode}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {row.docCode}
                                </td>
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "left",
                                    color: "white",
                                    fontSize: "11px",
                                  }}
                                >
                                  {row.prefixField}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                <strong style={{ color: "white" }}>
                                  {formData.branch && formData.finYear
                                    ? "No pending mappings found"
                                    : "Select branch and financial year to view mappings"}
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
                    Document Type Mapping Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all document type mappings
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
                        Financial Year
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
                    {mappingList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((mapping, index) => (
                        <tr
                          key={`mapping-${index}-${mapping.id}`}
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
                            {mapping.finYear}
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

      <ToastComponent />
    </ConfigProvider>
  );
};

export default DocumentMapping;
