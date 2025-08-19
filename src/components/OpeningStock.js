import React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Pagination,
  Spin,
  Typography,
  Checkbox,
  message,
  Tabs,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Opening_Stock_Upload.xlsx";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const OpeningStock = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [editId, setEditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // Data states
  const [openingStockList, setOpeningStockList] = useState([]);
  const [openingStockItems, setOpeningStockItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [binList, setBinList] = useState([]);
  const [partList, setPartList] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    entryNo: "",
    totalQty: "",
  });

  useEffect(() => {
    getDocId();
    getAllOpeningStocks();
    getBinList();
  }, []);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/openingStock/getOpeningStockDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.openingStockDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
      message.error("Failed to fetch document ID");
    }
  };

  const getAllOpeningStocks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/api/openingStock/getAllOpeningStockByOrgId?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&customer=${customer}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setOpeningStockList(response.data.paramObjectsMap.openingStockVO || []);
      }
    } catch (error) {
      console.error("Error fetching opening stocks:", error);
      message.error("Failed to fetch opening stocks");
    } finally {
      setIsLoading(false);
    }
  };

  const getBinList = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/openingStock/getBinList?orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setBinList(response.data.paramObjectsMap.binList || []);
      }
    } catch (error) {
      console.error("Error fetching bin list:", error);
      message.error("Failed to fetch bin list");
    }
  };

  const getPartList = async (bin) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/openingStock/getPartList?bin=${bin}&orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}`
      );
      if (response.data.status === true) {
        setPartList(response.data.paramObjectsMap.partList || []);
      }
    } catch (error) {
      console.error("Error fetching part list:", error);
      message.error("Failed to fetch part list");
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      bin: "",
      partNo: "",
      partDesc: "",
      sku: "",
      uom: "",
      qty: "",
      rate: "",
      amount: "",
    };
    setOpeningStockItems([...openingStockItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setOpeningStockItems(openingStockItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setOpeningStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleBinChange = (id, value) => {
    handleItemChange(id, "bin", value);
    if (value) {
      getPartList(value);
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      entryNo: "",
      totalQty: "",
    });
    setOpeningStockItems([]);
    getDocId();
    setEditId("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const saveData = {
        ...formData,
        openingStockDetailsDTO: openingStockItems.map((item) => ({
          ...(editId && { id: item.id }),
          bin: item.bin,
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
          uom: item.uom,
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        orgId,
        branch,
        branchCode,
        client,
        customer,
        warehouse,
        finYear,
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/api/openingStock/createUpdateOpeningStock`,
        saveData
      );

      if (response.data.status === true) {
        message.success(
          editId
            ? "Opening Stock updated successfully"
            : "Opening Stock created successfully"
        );
        handleClear();
        getAllOpeningStocks();
      } else {
        message.error(response.data.message || "Failed to save Opening Stock");
      }
    } catch (error) {
      console.error("Error saving Opening Stock:", error);
      message.error("Failed to save Opening Stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditOpeningStock = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      entryNo: record.entryNo,
      totalQty: record.totalQty,
    });

    setOpeningStockItems(
      record.openingStockDetailsVO?.map((item) => ({
        id: item.id,
        bin: item.bin,
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        uom: item.uom,
        qty: item.qty,
        rate: item.rate,
        amount: item.amount,
      })) || []
    );

    setViewMode("form");
  };

  const handlePartNoChange = (id, value) => {
    const selectedPart = partList.find((part) => part.partNo === value);
    setOpeningStockItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: value,
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              uom: selectedPart?.uom || "",
            }
          : item
      )
    );
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleUploadSubmit = () => {
    console.log("Submit clicked");
    setUploadOpen(false);
  };

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
                    Opening Stock
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage opening stock entries
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
                    backgroundColor: "transparent",
                    color: "white",
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
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                  }}
                >
                  Clear
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  loading={isSubmitting}
                  onClick={handleSave}
                  className="primary-action-btn"
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={() => setUploadOpen(true)}
                  className="action-btn"
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                  }}
                >
                  Upload
                </Button>
              </div>

              {/* Main Form */}
              <div className="form-sections">
                <Tabs defaultActiveKey="1" className="white-tabs">
                  <TabPane tab="Basic Information" key="1">
                    <div className="form-section-card">
                      <Form layout="vertical" form={form}>
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Document No
                                </span>
                              }
                            >
                              <Input
                                value={formData.docId}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Document Date
                                </span>
                              }
                            >
                              <DatePicker
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.docDate)}
                                disabled
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Entry No</span>
                              }
                            >
                              <Input
                                value={formData.entryNo}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    entryNo: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Total Qty</span>
                              }
                            >
                              <Input
                                value={formData.totalQty}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </TabPane>
                </Tabs>

                {/* Items Table */}
                <div className="table-section">
                  <div
                    style={{
                      backdropFilter: "blur(10px)",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "20px",
                      padding: "20px",
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={handleAddItem}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>

                    <div
                      className="table-container"
                      style={{
                        position: "relative",
                        width: "100%",
                        overflowX: "auto",
                        fontSize: "11px",
                        marginLeft: "0",
                        backgroundColor: "transparent",
                        maxHeight: "500px",
                        overflowY: "auto",
                        marginTop: "10px",
                        "&::-webkit-scrollbar": {
                          height: "8px",
                          width: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <table
                        style={{
                          width: "max-content",
                          minWidth: "100%",
                          borderCollapse: "collapse",
                          backgroundColor: "transparent",
                        }}
                      >
                        <colgroup>
                          <col style={{ width: "50px" }} /> {/* Action */}
                          <col style={{ width: "50px" }} /> {/* S.No */}
                          <col style={{ width: "120px" }} /> {/* Bin */}
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "100px" }} /> {/* SKU */}
                          <col style={{ width: "100px" }} /> {/* UOM */}
                          <col style={{ width: "100px" }} /> {/* Qty */}
                          <col style={{ width: "100px" }} /> {/* Rate */}
                          <col style={{ width: "100px" }} /> {/* Amount */}
                        </colgroup>
                        <thead
                          style={{
                            backgroundColor: "revert",
                          }}
                        >
                          <tr
                            style={{
                              borderBottom: "1px dashed #000",
                              zIndex: 2,
                              position: "sticky",
                              top: 0,
                              backgroundColor: "transparent",
                            }}
                          >
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color: "white",
                              }}
                            >
                              Action
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color: "white",
                              }}
                            >
                              S.No
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Part No *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Part Description
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              SKU
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              UOM
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Rate
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {openingStockItems.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: "1px dashed white",
                                color: "white",
                              }}
                            >
                              {/* Action */}
                              <td
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteItem(item.id)}
                                  danger
                                  type="text"
                                  style={{ color: "#ff4d4f" }}
                                />
                              </td>

                              {/* S.No */}
                              <td
                                style={{
                                  padding: "8px",
                                  textAlign: "center",
                                  color: "white",
                                  fontSize: "14px",
                                }}
                              >
                                {index + 1}
                              </td>

                              {/* Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.bin}
                                  onChange={(value) =>
                                    handleBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  <Option value="">--Select--</Option>
                                  {binList.map((bin) => (
                                    <Option key={bin.bin} value={bin.bin}>
                                      {bin.bin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Part No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.partNo}
                                  onChange={(value) =>
                                    handlePartNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  disabled={!item.bin}
                                >
                                  <Option value="">--Select--</Option>
                                  {partList.map((part) => (
                                    <Option
                                      key={part.partNo}
                                      value={part.partNo}
                                    >
                                      {part.partNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Part Description */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.partDesc}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* SKU */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.sku}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* UOM */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.uom}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "uom",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.qty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "qty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Rate */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.rate}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Amount */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.amount}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                            </tr>
                          ))}
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
                background: "var(--bg-body-gradient)",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-body-gradient)",
                  padding: "0 60px",
                }}
              >
                <Typography.Title
                  level={3}
                  style={{ color: "#fff", margin: "20px 0" }}
                >
                  Opening Stock List
                </Typography.Title>
                <Button
                  icon={
                    viewMode === "form" ? (
                      <UnorderedListOutlined />
                    ) : (
                      <FormOutlined />
                    )
                  }
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  {viewMode === "form" ? "List View" : "New Opening Stock"}
                </Button>
              </div>
              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "100%",
                  overflowX: "auto",
                  fontSize: "11px",
                  marginLeft: "0",
                  backgroundColor: "transparent",
                  maxHeight: "500px",
                  overflowY: "auto",
                  marginTop: "10px",
                  "&::-webkit-scrollbar": {
                    height: "8px",
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  },
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
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
                        S.No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Document No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Document Date
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
                        Total Qty
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Created By
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Created Date
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
                    {openingStockList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((record, index) => (
                        <tr
                          key={record.id}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        >
                          <td style={{ padding: "12px" }}>
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td style={{ padding: "12px" }}>{record.docId}</td>
                          <td style={{ padding: "12px" }}>
                            {dayjs(record.docDate).format("DD-MM-YYYY")}
                          </td>
                          <td style={{ padding: "12px" }}>{record.entryNo}</td>
                          <td style={{ padding: "12px" }}>{record.totalQty}</td>
                          <td style={{ padding: "12px" }}>
                            {record.createdBy}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {dayjs(record.createdDate).format("DD-MM-YYYY")}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Button
                              type="link"
                              onClick={() => handleEditOpeningStock(record)}
                              style={{ color: "#1890ff" }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={openingStockList.length}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    showSizeChanger
                    showQuickJumper
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Modal
          title={null}
          visible={uploadOpen}
          onCancel={() => setUploadOpen(false)}
          footer={null}
          width={400}
          closable={false}
          className="glass-card-modal"
          bodyStyle={{
            padding: 0,
            background: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            marginTop: "-50px",
          }}
        >
          <div className="glass-card">
            {/* Close button */}
            <button
              className="close-popup"
              onClick={() => setUploadOpen(false)}
            >
              &times;
            </button>

            {/* Header */}
            <div className="card-header">
              <p>Upload Opening Stock</p>
            </div>

            {/* Content */}
            <div className="form-content" style={{ textAlign: "center" }}>
              {/* Upload area */}
              <div
                style={{
                  padding: "30px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "2px dashed rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <CloudUploadOutlined
                  style={{ fontSize: "48px", color: "rgba(24, 144, 255, 0.8)" }}
                />
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "16px",
                  }}
                >
                  Drag and drop your file here or click to browse
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "12px",
                  }}
                >
                  Supported formats: .xls, .xlsx
                </Text>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />

              {/* Browse Button */}
              <label htmlFor="file-upload">
                <Button
                  style={{
                    background: "rgba(108, 99, 255, 0.2)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    marginTop: "15px",
                  }}
                >
                  Browse Files
                </Button>
              </label>

              {/* Sample File Download */}
              <div style={{ marginTop: "20px" }}>
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Download sample file
                </Text>
                <br />
                <Button
                  type="link"
                  href={sampleFile}
                  download="sample_opening_stock.xls"
                  style={{
                    color: "rgba(24, 144, 255, 0.9)",
                    padding: 0,
                    height: "auto",
                  }}
                >
                  <DownloadOutlined /> Sample Opening Stock.xls
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions" style={{ marginTop: "20px" }}>
              <Button
                onClick={() => setUploadOpen(false)}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "1px solid white",
                  marginRight: "10px",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleUploadSubmit}
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  border: "1px solid white",
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </Modal>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
        />
      </div>
    </ConfigProvider>
  );
};

export default OpeningStock;
