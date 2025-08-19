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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;

const DocType = () => {
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
  const [screenList, setScreenList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [docTypeList, setDocTypeList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    screenCode: "",
    screenName: "",
    docCode: "",
    desc: "",
    active: true,
  });

  const [clientTableData, setClientTableData] = useState([
    {
      id: 1,
      clientCode: "",
      client: "",
    },
  ]);

  // Error states
  const [fieldErrors, setFieldErrors] = useState({
    screenCode: "",
    screenName: "",
    docCode: "",
    desc: "",
  });

  const [clientTableErrors, setClientTableErrors] = useState([
    { clientCode: "", client: "" },
  ]);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        getAllScreens(),
        getAllClients(),
        getAllDocumentTypes(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
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

  const getAllDocumentTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllDocumentType?orgid=${orgId}`
      );
      if (response.data.status) {
        setDocTypeList(response.data.paramObjectsMap.documentTypeVO);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      screenCode: "",
      screenName: "",
      docCode: "",
      desc: "",
      active: true,
    });
    setClientTableData([{ id: 1, clientCode: "", client: "" }]);
    setFieldErrors({
      screenCode: "",
      screenName: "",
      docCode: "",
      desc: "",
    });
    setClientTableErrors([{ clientCode: "", client: "" }]);
    setEditId("");
  };

  // Handle save document type
  const handleSave = async () => {
    // Form validation
    const errors = {};
    if (!formData.screenCode) errors.screenCode = "Screen code is required";
    if (!formData.desc) errors.desc = "Description is required";
    if (!formData.docCode) errors.docCode = "Document code is required";

    // Table validation
    const newTableErrors = clientTableData.map((row) => {
      const rowErrors = {};
      if (!row.clientCode) rowErrors.clientCode = "Client code is required";
      if (!row.client) rowErrors.client = "Client is required";
      return rowErrors;
    });

    setFieldErrors(errors);
    setClientTableErrors(newTableErrors);

    if (
      Object.keys(errors).length > 0 ||
      newTableErrors.some((e) => e.client || e.clientCode)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(editId && { id: editId }),
        screenCode: formData.screenCode,
        docCode: formData.docCode,
        description: formData.desc,
        screenName: formData.screenName,
        documentTypeDetailsDTO: clientTableData.map((row) => ({
          clientCode: row.clientCode,
          client: row.client,
        })),
        active: formData.active,
        orgId: orgId,
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/api/warehousemastercontroller/createUpdateDocumentType`,
        payload
      );

      if (response.data.status) {
        showToast(
          "success",
          editId
            ? "Document type updated successfully"
            : "Document type created successfully"
        );
        handleClear();
        getAllDocumentTypes();
      } else {
        showToast(
          "error",
          response.data.paramObjectsMap.errorMessage || "Operation failed"
        );
      }
    } catch (error) {
      console.error("Error saving document type:", error);
      showToast("error", "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit document type
  const handleEditDocType = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      screenCode: record.screenCode,
      screenName: record.screenName,
      docCode: record.docCode,
      desc: record.description,
      active: record.active === "Active",
    });

    // Set client table data
    if (
      record.documentTypeDetailsVO &&
      record.documentTypeDetailsVO.length > 0
    ) {
      setClientTableData(
        record.documentTypeDetailsVO.map((item) => ({
          id: item.id,
          clientCode: item.clientCode,
          client: item.client,
        }))
      );
    } else {
      setClientTableData([{ id: 1, clientCode: "", client: "" }]);
    }
  };

  // Handle client table changes
  const handleClientTableChange = (index, field, value) => {
    const newData = [...clientTableData];
    newData[index][field] = value;
    setClientTableData(newData);

    // Clear error when field is filled
    if (value) {
      const newErrors = [...clientTableErrors];
      newErrors[index][field] = "";
      setClientTableErrors(newErrors);
    }
  };

  // Add new client row
  const addClientRow = () => {
    setClientTableData([
      ...clientTableData,
      {
        id: clientTableData.length + 1,
        clientCode: "",
        client: "",
      },
    ]);
    setClientTableErrors([
      ...clientTableErrors,
      { clientCode: "", client: "" },
    ]);
  };

  // Remove client row
  const removeClientRow = (index) => {
    if (clientTableData.length === 1) return; // Don't remove the last row

    const newData = [...clientTableData];
    newData.splice(index, 1);
    setClientTableData(newData);

    const newErrors = [...clientTableErrors];
    newErrors.splice(index, 1);
    setClientTableErrors(newErrors);
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
                    Document Type Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage document types
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
                  apiUrl={`warehousemastercontroller/DocTypeUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="DocType"
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
                      label={<span style={{ color: "#fff" }}>Screen Code</span>}
                      validateStatus={fieldErrors.screenCode ? "error" : ""}
                      help={fieldErrors.screenCode}
                    >
                      <Select
                        showSearch
                        placeholder="Select Screen Code"
                        value={formData.screenCode || undefined}
                        onChange={(value) => {
                          const selectedScreen = screenList.find(
                            (screen) => screen.screenCode === value
                          );
                          setFormData({
                            ...formData,
                            screenCode: value,
                            screenName: selectedScreen
                              ? selectedScreen.screenName
                              : "",
                          });
                          setFieldErrors({
                            ...fieldErrors,
                            screenCode: "",
                          });
                        }}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%" }}
                      >
                        {screenList.map((screen) => (
                          <Option
                            key={screen.screenCode}
                            value={screen.screenCode}
                          >
                            {screen.screenCode}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Screen Name</span>}
                    >
                      <Input
                        placeholder="Screen Name"
                        value={formData.screenName}
                        readOnly
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "white",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span style={{ color: "#fff" }}>Document Code</span>
                      }
                      validateStatus={fieldErrors.docCode ? "error" : ""}
                      help={fieldErrors.docCode}
                    >
                      <Input
                        placeholder="Enter Document Code"
                        value={formData.docCode}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "white",
                        }}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            docCode: e.target.value,
                          });
                          setFieldErrors({
                            ...fieldErrors,
                            docCode: "",
                          });
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={16}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Description</span>}
                      validateStatus={fieldErrors.desc ? "error" : ""}
                      help={fieldErrors.desc}
                    >
                      <Input.TextArea
                        placeholder="Enter Description"
                        value={formData.desc}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "white",
                        }}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            desc: e.target.value,
                          });
                          setFieldErrors({
                            ...fieldErrors,
                            desc: "",
                          });
                        }}
                        rows={2}
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
                        Client Details
                      </Typography.Title>
                      <Typography.Text
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          paddingLeft: "20px",
                        }}
                      >
                        Manage client associations
                      </Typography.Text>
                    </div>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={addClientRow}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        marginRight: "20px",
                        marginTop: "20px",
                        border: "none",
                      }}
                    >
                      Add Client
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
                            Client Code
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
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientTableData.map((row, index) => (
                          <tr
                            key={`client-row-${index}`}
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
                              <Select
                                showSearch
                                placeholder="Select Client Code"
                                value={row.clientCode || undefined}
                                onChange={(value) => {
                                  const selectedClient = clientList.find(
                                    (client) => client.clientCode === value
                                  );
                                  handleClientTableChange(
                                    index,
                                    "clientCode",
                                    value
                                  );
                                  handleClientTableChange(
                                    index,
                                    "client",
                                    selectedClient ? selectedClient.client : ""
                                  );
                                }}
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                style={{ width: "100%" }}
                              >
                                {clientList.map((client) => (
                                  <Option
                                    key={client.clientCode}
                                    value={client.clientCode}
                                  >
                                    {client.clientCode}
                                  </Option>
                                ))}
                              </Select>
                              {clientTableErrors[index]?.clientCode && (
                                <div
                                  style={{
                                    color: "#ff4d4f",
                                    fontSize: "12px",
                                  }}
                                >
                                  {clientTableErrors[index].clientCode}
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
                                placeholder="Client"
                                value={row.client}
                                readOnly
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  color: "white",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                }}
                              />
                              {clientTableErrors[index]?.client && (
                                <div
                                  style={{
                                    color: "white",
                                    fontSize: "12px",
                                  }}
                                >
                                  {clientTableErrors[index].client}
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
                              <Space>
                                {index === clientTableData.length - 1 ? (
                                  <Button
                                    type="link"
                                    icon={<PlusOutlined />}
                                    onClick={addClientRow}
                                    style={{ color: "white" }}
                                  />
                                ) : null}
                                {clientTableData.length > 1 && (
                                  <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeClientRow(index)}
                                    danger
                                    style={{ color: "white" }}
                                  />
                                )}
                              </Space>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {clientTableData.length > pageSize && (
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
                          Showing {clientTableData.length} items
                        </span>
                      </div>
                    )}
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
                    Document Type Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all document types
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
                        Screen Code
                      </th>
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
                        Document Code
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Description
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
                    {docTypeList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((docType, index) => (
                        <tr
                          key={`docType-${index}-${docType.id}`}
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
                            {docType.screenCode}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {docType.screenName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {docType.docCode}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {docType.description}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {docType.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditDocType(docType)}
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
                    {Math.min(currentPage * pageSize, docTypeList.length)} of{" "}
                    {docTypeList.length} items
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
                    { length: Math.ceil(docTypeList.length / pageSize) },
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
                          Math.ceil(docTypeList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(docTypeList.length / pageSize)
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      cursor:
                        currentPage === Math.ceil(docTypeList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage === Math.ceil(docTypeList.length / pageSize)
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

export default DocType;
