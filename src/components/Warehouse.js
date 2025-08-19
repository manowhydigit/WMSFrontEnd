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

const Warehouse = () => {
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
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // Data states
  const [clientList, setClientList] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    branch: branch,
    warehouse: "",
    active: true,
  });

  const [clientTableData, setClientTableData] = useState([
    { id: 1, client: "", clientCode: "" },
  ]);
  const [clientTableErrors, setClientTableErrors] = useState([
    { client: "", clientCode: "" },
  ]);

  // Error states
  const [fieldErrors, setFieldErrors] = useState({
    warehouse: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([getAllClients(), getAllWarehouses()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
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

  const getAllWarehouses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouse?orgId=${orgId}`
      );
      if (response.data.status) {
        setWarehouseList(response.data.paramObjectsMap.warehouseVO);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const isLastRowEmpty = () => {
    const lastRow = clientTableData[clientTableData.length - 1];
    return !lastRow.client || !lastRow.clientCode;
  };

  const displayRowError = () => {
    setClientTableErrors((prevErrors) => {
      const newErrors = [...prevErrors];
      newErrors[clientTableData.length - 1] = {
        ...newErrors[clientTableData.length - 1],
        client: !clientTableData[clientTableData.length - 1].client
          ? "Client is required"
          : "",
        clientCode: !clientTableData[clientTableData.length - 1].clientCode
          ? "Client Code is required"
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
      client: "",
      clientCode: "",
    };
    setClientTableData([...clientTableData, newRow]);
    setClientTableErrors([
      ...clientTableErrors,
      { client: "", clientCode: "" },
    ]);
  };

  const handleDeleteRow = (id) => {
    setClientTableData(clientTableData.filter((row) => row.id !== id));
  };

  const handleKeyDown = (e, row) => {
    if (
      e.key === "Tab" &&
      row.id === clientTableData[clientTableData.length - 1].id
    ) {
      e.preventDefault();
      if (isLastRowEmpty()) {
        displayRowError();
      } else {
        handleAddRow();
      }
    }
  };

  const getAvailableClients = (currentRowId) => {
    const selectedClients = clientTableData
      .filter((row) => row.id !== currentRowId)
      .map((row) => row.client);
    return clientList.filter(
      (client) => !selectedClients.includes(client.client)
    );
  };

  const handleClientChange = (row, index, value) => {
    const selectedClient = clientList.find((client) => client.client === value);
    setClientTableData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              client: value,
              clientCode: selectedClient ? selectedClient.clientCode : "",
            }
          : r
      )
    );
    setClientTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        client: !value ? "Client is required" : "",
      };
      return newErrors;
    });
  };

  // Handle clear form
  const handleClear = () => {
    setFormData({
      branch: branch,
      warehouse: "",
      active: true,
    });
    setClientTableData([{ id: 1, client: "", clientCode: "" }]);
    setClientTableErrors([{ client: "", clientCode: "" }]);
    setFieldErrors({
      warehouse: "",
    });
    setEditId("");
  };

  // Handle save warehouse
  const handleSave = async () => {
    // Form validation
    const errors = {};
    if (!formData.warehouse) errors.warehouse = "Warehouse is required";

    let clientTableDataValid = true;
    const newTableErrors = clientTableData.map((row) => {
      const rowErrors = {};
      if (!row.client) {
        rowErrors.client = "Client is required";
        clientTableDataValid = false;
      }
      if (!row.clientCode) {
        rowErrors.clientCode = "Client Code is required";
        clientTableDataValid = false;
      }
      return rowErrors;
    });

    setFieldErrors(errors);
    setClientTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && clientTableDataValid) {
      setIsSubmitting(true);

      try {
        const warehouseClientDTO = clientTableData.map((row) => ({
          client: row.client,
          clientCode: row.clientCode,
        }));

        const payload = {
          ...(editId && { id: editId }),
          branch: formData.branch,
          branchCode: branchCode,
          warehouse: formData.warehouse,
          warehouseClientDTO: warehouseClientDTO,
          active: formData.active,
          orgId: orgId,
          createdBy: loginUserName,
        };

        const response = await axios.put(
          `${API_URL}/api/warehousemastercontroller/createUpdateWarehouse`,
          payload
        );

        if (response.data.status) {
          showToast(
            "success",
            editId
              ? "Warehouse updated successfully"
              : "Warehouse created successfully"
          );
          handleClear();
          getAllWarehouses();
        } else {
          showToast(
            "error",
            response.data.paramObjectsMap.errorMessage || "Operation failed"
          );
        }
      } catch (error) {
        console.error("Error saving warehouse:", error);
        showToast("error", "An error occurred while saving");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle edit warehouse
  const handleEditWarehouse = (record) => {
    setEditId(record.id);
    setViewMode("form");

    setFormData({
      branch: record.branch,
      warehouse: record.warehouse,
      active: record.active === "Active",
    });

    // Set client table data
    if (record.warehouseClientVO && record.warehouseClientVO.length > 0) {
      setClientTableData(
        record.warehouseClientVO.map((item) => ({
          id: item.id,
          client: item.client,
          clientCode: item.clientCode,
        }))
      );
      setClientTableErrors(
        record.warehouseClientVO.map(() => ({ client: "", clientCode: "" }))
      );
    } else {
      setClientTableData([{ id: 1, client: "", clientCode: "" }]);
      setClientTableErrors([{ client: "", clientCode: "" }]);
    }
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    // Validation
    let errorMessage = "";
    if (name === "warehouse") {
      const nameRegex = /^[A-Za-z ]*$/;
      if (!nameRegex.test(value)) {
        errorMessage = "Only alphabet characters are allowed";
      }
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
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
                    Warehouse Master
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage warehouse information and client mappings
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
                  apiUrl={`warehousemastercontroller/WarehouseUpload?orgId=${orgId}&createdBy=${loginUserName}`}
                  screen="Warehouse"
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
                    >
                      <Input
                        placeholder="Branch"
                        value={formData.branch}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Warehouse</span>}
                      validateStatus={fieldErrors.warehouse ? "error" : ""}
                      help={fieldErrors.warehouse}
                    >
                      <Input
                        placeholder="Enter Warehouse"
                        value={formData.warehouse}
                        onChange={(e) =>
                          handleInputChange("warehouse", e.target.value)
                        }
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

                {/* Client Mapping Table */}
                <div style={{ marginTop: "24px" }}>
                  <Typography.Title level={5} style={{ color: "#fff" }}>
                    Client Mappings
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
                          Client Details
                        </Typography.Title>
                        <Typography.Text
                          style={{
                            color: "rgba(255, 255, 255, 0.8)",
                            paddingLeft: "20px",
                          }}
                        >
                          Manage warehouse client mappings
                        </Typography.Text>
                      </div>
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
                          </tr>
                        </thead>
                        <tbody>
                          {clientTableData.length > 0 ? (
                            clientTableData.map((row, index) => (
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
                                  <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteRow(row.id)}
                                    style={{ color: "white" }}
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
                                  <Select
                                    style={{ width: "100%" }}
                                    value={row.client}
                                    onChange={(value) =>
                                      handleClientChange(row, index, value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(e, row)}
                                    status={
                                      clientTableErrors[index]?.client
                                        ? "error"
                                        : ""
                                    }
                                  >
                                    <Option value="">Select Client</Option>
                                    {getAvailableClients(row.id).map(
                                      (client) => (
                                        <Option
                                          key={client.id}
                                          value={client.client}
                                        >
                                          {client.client}
                                        </Option>
                                      )
                                    )}
                                  </Select>
                                  {clientTableErrors[index]?.client && (
                                    <div
                                      style={{
                                        color: "#ff4d4f",
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
                                  {row.clientCode}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">
                                <strong style={{ color: "white" }}>
                                  No client mappings found
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
                    Warehouse Master
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    List of all warehouses
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
                    {warehouseList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((warehouse, index) => (
                        <tr
                          key={`warehouse-${index}-${warehouse.id}`}
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
                            {warehouse.branch}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {warehouse.warehouse}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {warehouse.active === "Active" ? "Yes" : "No"}
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
                                onClick={() => handleEditWarehouse(warehouse)}
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
                    {Math.min(currentPage * pageSize, warehouseList.length)} of{" "}
                    {warehouseList.length} items
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
                    { length: Math.ceil(warehouseList.length / pageSize) },
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
                          Math.ceil(warehouseList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(warehouseList.length / pageSize)
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
                        Math.ceil(warehouseList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(warehouseList.length / pageSize)
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

export default Warehouse;
