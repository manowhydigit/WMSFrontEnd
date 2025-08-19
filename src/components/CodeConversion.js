import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Typography,
  Checkbox,
  Modal,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import axios from "axios";
import { getAllActiveCpartNo } from "../utils/CommonFunctions";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="ant-modal-content"]'}
    >
      <div {...props} />
    </Draggable>
  );
}

export const CodeConversion = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [editId, setEditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [finYear, setFinYear] = useState("2024");
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [codeConversionList, setCodeConversionList] = useState([]);
  const [codeConversionItems, setCodeConversionItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Data lists
  const [partNoList, setPartNoList] = useState([]);
  const [cPartNoList, setCPartNoList] = useState([]);
  const [cPalletList, setCPalletList] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    remarks: "",
    freeze: false,
  });

  // Styles
  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "80%",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    background: "rgba(255, 255, 255, 0.05)",
    cursor: "not-allowed",
  };

  const selectStyle = {
    width: "90%",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  useEffect(() => {
    getAllCodeConversions();
    getAllPartNo();
    getAllCPartNo();
    getAllcPallet();
    getDocId();
  }, []);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/codeconversion/getCodeConversionDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.CodeConversionDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
    }
  };

  const getAllCodeConversions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/codeconversion/getAllCodeConversion?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setCodeConversionList(response.data.paramObjectsMap.codeConversionVO);
      }
    } catch (error) {
      console.error("Error fetching code conversions:", error);
    }
  };

  const getAllPartNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/codeconversion/getPartNoAndPartDescFromStockForCodeConversion?branchCode=${branchCode}&client=${client}&orgId=${orgId}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setPartNoList(response.data.paramObjectsMap.codeConversionVO);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
    }
  };

  const getAllCPartNo = async () => {
    try {
      const cPartData = await getAllActiveCpartNo(branchCode, client, orgId);
      if (cPartData && cPartData.length > 0) {
        setCPartNoList(cPartData);
      }
    } catch (error) {
      console.error("Error fetching C part numbers:", error);
    }
  };

  const getAllcPallet = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/vasputaway/getToBinDetailsVasPutaway?branchCode=${branchCode}&client=${client}&orgId=${orgId}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCPalletList(response.data.paramObjectsMap.ToBin);
      }
    } catch (error) {
      console.error("Error fetching C pallets:", error);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDescription: "",
      grnNo: "",
      binType: "",
      batchNo: "",
      bin: "",
      qty: "",
      actualQty: "",
      convertQty: "",
      cpartNo: "",
      cpartDesc: "",
      csku: "",
      cbin: "",
      remarks: "",
      rowGrnNoList: [],
      rowBinTypeList: [],
      rowBatchNoList: [],
      rowBinList: [],
    };
    setCodeConversionItems([...codeConversionItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setCodeConversionItems(
      codeConversionItems.filter((item) => item.id !== id)
    );
  };

  const handleItemChange = (id, field, value) => {
    setCodeConversionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      remarks: "",
      freeze: false,
    });
    setCodeConversionItems([]);
    getDocId();
    setEditId("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const saveData = {
        ...formData,
        codeConversionDetailsDTO: codeConversionItems.map((item) => ({
          ...(editId && { id: item.id }),
          partNo: item.partNo,
          partDesc: item.partDescription,
          grnNo: item.grnNo,
          binType: item.binType,
          batchNo: item.batchNo,
          bin: item.bin,
          qty: parseFloat(item.qty) || 0,
          actualQty: parseFloat(item.actualQty) || 0,
          convertQty: parseFloat(item.convertQty) || 0,
          cpartNo: item.cpartNo,
          cpartDesc: item.cpartDesc,
          csku: item.csku,
          cbin: item.cbin,
          remarks: item.remarks,
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
        `${API_URL}/codeconversion/createUpdateCodeConversion`,
        saveData
      );

      if (response.data.status === true) {
        message.success(
          editId
            ? "Code Conversion updated successfully"
            : "Code Conversion created successfully"
        );
        handleClear();
        getAllCodeConversions();
      } else {
        message.error(
          response.data.message || "Failed to save Code Conversion"
        );
      }
    } catch (error) {
      console.error("Error saving Code Conversion:", error);
      message.error("Failed to save Code Conversion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditCodeConversion = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      remarks: record.remarks,
      freeze: record.freeze,
    });

    setCodeConversionItems(
      record.codeConversionDetailsVO?.map((item) => ({
        id: item.id,
        partNo: item.partNo,
        partDescription: item.partDesc,
        grnNo: item.grnNo,
        binType: item.binType,
        batchNo: item.batchNo,
        bin: item.bin,
        qty: item.qty,
        actualQty: item.actualQty,
        convertQty: item.convertQty,
        cpartNo: item.cpartNo,
        cpartDesc: item.cpartDesc,
        csku: item.csku,
        cbin: item.cbin,
        remarks: item.remarks,
      })) || []
    );

    setViewMode("form");
  };

  const getAllFillGrid = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getAllFillGridFromStockForCodeConversion?branchCode=${branchCode}&client=${client}&orgId=${orgId}&warehouse=${warehouse}`
      );

      if (response.data.status === true) {
        setFillGridData(response.data.paramObjectsMap.codeConversionVO);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setCodeConversionItems([...codeConversionItems, ...selectedData]);
    setSelectedRows([]);
    setSelectAll(false);
    setModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  // Handler functions for dropdown changes
  const handlePartNoChange = (id, value) => {
    const selectedPart = partNoList.find((part) => part.partNo === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDescription: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              rowGrnNoList: [],
              grnNo: "",
              rowBinTypeList: [],
              binType: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      getGrnNoList(id, value);
    }
  };

  const getGrnNoList = async (id, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getGrnNoAndGrnDateFromStockForCodeConversion?branchCode=${branchCode}&client=${client}&orgId=${orgId}&partNo=${partNo}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCodeConversionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowGrnNoList: response.data.paramObjectsMap.codeConversionVO,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
    }
  };

  const handleGrnNoChange = (id, value) => {
    const selectedGrn = codeConversionItems
      .find((item) => item.id === id)
      ?.rowGrnNoList.find((grn) => grn.grnNo === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              rowBinTypeList: [],
              binType: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const partNo = codeConversionItems.find((item) => item.id === id)?.partNo;
      if (partNo) {
        getBinTypeList(id, value, partNo);
      }
    }
  };

  const getBinTypeList = async (id, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getBinTypeFromStockForCodeConversion?branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCodeConversionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBinTypeList:
                    response.data.paramObjectsMap.codeConversionVO,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching bin types:", error);
    }
  };

  const handleBinTypeChange = (id, value) => {
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              binType: value,
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const item = codeConversionItems.find((item) => item.id === id);
      if (item && item.grnNo && item.partNo) {
        getBatchNoList(id, value, item.grnNo, item.partNo);
      }
    }
  };

  const getBatchNoList = async (id, binType, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getBatchNoFromStockForCodeConversion?binType=${binType}&branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCodeConversionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBatchNoList:
                    response.data.paramObjectsMap.codeConversionVO,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching batch numbers:", error);
    }
  };

  const handleBatchNoChange = (id, value) => {
    const selectedBatch = codeConversionItems
      .find((item) => item.id === id)
      ?.rowBatchNoList.find((batch) => batch.batchNo === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batchNo || "",
              rowBinList: [],
              bin: "",
              qty: "",
            }
          : item
      )
    );

    if (value) {
      const item = codeConversionItems.find((item) => item.id === id);
      if (item && item.binType && item.grnNo && item.partNo) {
        getBinList(id, value, item.binType, item.grnNo, item.partNo);
      }
    }
  };

  const getBinList = async (id, batchNo, binType, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getBinFromStockForCodeConversion?batchNo=${batchNo}&binType=${binType}&branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCodeConversionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBinList: response.data.paramObjectsMap.codeConversionVO,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
    }
  };

  const handleBinChange = (id, value) => {
    const selectedBin = codeConversionItems
      .find((item) => item.id === id)
      ?.rowBinList.find((bin) => bin.bin === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              bin: selectedBin?.bin || "",
            }
          : item
      )
    );

    if (value) {
      const item = codeConversionItems.find((item) => item.id === id);
      if (item && item.batchNo && item.binType && item.grnNo && item.partNo) {
        getQty(id, value, item.batchNo, item.binType, item.grnNo, item.partNo);
      }
    }
  };

  const getQty = async (id, bin, batchNo, binType, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/codeconversion/getAvlQtyCodeConversion?batchNo=${batchNo}&bin=${bin}&binType=${binType}&branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCodeConversionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  qty: response.data.paramObjectsMap.AvgQty || 0,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching quantity:", error);
    }
  };

  const handleCPartNoChange = (id, value) => {
    const selectedCPart = cPartNoList.find((part) => part.partno === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cpartNo: selectedCPart?.partno || "",
              cpartDesc: selectedCPart?.partDesc || "",
              csku: selectedCPart?.sku || "",
            }
          : item
      )
    );
  };

  const handleCBinChange = (id, value) => {
    const selectedCBin = cPalletList.find((bin) => bin.bin === value);
    setCodeConversionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cbin: selectedCBin?.bin || "",
            }
          : item
      )
    );
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
                    Code Conversion
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Convert part codes between different numbering systems
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
                                <span style={{ color: "#fff" }}>Remarks</span>
                              }
                            >
                              <Input
                                value={formData.remarks}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    remarks: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Freeze</span>
                              }
                            >
                              <Checkbox
                                checked={formData.freeze}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    freeze: e.target.checked,
                                  })
                                }
                                style={{ color: "#fff" }}
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
                        <Button
                          icon={<ClearOutlined />}
                          onClick={getAllFillGrid}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Fill Grid
                        </Button>
                        <Button
                          icon={<ClearOutlined />}
                          onClick={() => setCodeConversionItems([])}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Clear Items
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
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "120px" }} /> {/* GRN No */}
                          <col style={{ width: "120px" }} /> {/* Bin Type */}
                          <col style={{ width: "120px" }} /> {/* Batch No */}
                          <col style={{ width: "120px" }} /> {/* Bin */}
                          <col style={{ width: "100px" }} /> {/* Qty */}
                          <col style={{ width: "100px" }} /> {/* Actual Qty */}
                          <col style={{ width: "100px" }} /> {/* Convert Qty */}
                          <col style={{ width: "120px" }} /> {/* C Part No */}
                          <col style={{ width: "200px" }} /> {/* C Part Desc */}
                          <col style={{ width: "120px" }} /> {/* C SKU */}
                          <col style={{ width: "120px" }} /> {/* C Bin */}
                          <col style={{ width: "200px" }} /> {/* Remarks */}
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
                              GRN No *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin Type *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Batch No *
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
                              Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Actual Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Convert Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              C Part No *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              C Part Desc
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              C SKU
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              C Bin *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {codeConversionItems.map((item, index) => (
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
                                >
                                  <Option value="">--Select--</Option>
                                  {partNoList.map((part) => (
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
                                  value={item.partDescription}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* GRN No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.grnNo}
                                  onChange={(value) =>
                                    handleGrnNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.partNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowGrnNoList?.map((grn) => (
                                    <Option key={grn.grnNo} value={grn.grnNo}>
                                      {grn.grnNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Bin Type */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.binType}
                                  onChange={(value) =>
                                    handleBinTypeChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.grnNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowBinTypeList?.map((binType) => (
                                    <Option
                                      key={binType.binType}
                                      value={binType.binType}
                                    >
                                      {binType.binType}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Batch No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.batchNo}
                                  onChange={(value) =>
                                    handleBatchNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.binType}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowBatchNoList?.map((batch) => (
                                    <Option
                                      key={batch.batchNo}
                                      value={batch.batchNo}
                                    >
                                      {batch.batchNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.bin}
                                  onChange={(value) =>
                                    handleBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.batchNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowBinList?.map((bin) => (
                                    <Option key={bin.bin} value={bin.bin}>
                                      {bin.bin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.qty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Actual Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.actualQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "actualQty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Convert Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.convertQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "convertQty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* C Part No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.cpartNo}
                                  onChange={(value) =>
                                    handleCPartNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  <Option value="">--Select--</Option>
                                  {cPartNoList.map((part) => (
                                    <Option
                                      key={part.partno}
                                      value={part.partno}
                                    >
                                      {part.partno}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* C Part Desc */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.cpartDesc}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* C SKU */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.csku}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* C Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.cbin}
                                  onChange={(value) =>
                                    handleCBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  <Option value="">--Select--</Option>
                                  {cPalletList.map((bin) => (
                                    <Option key={bin.bin} value={bin.bin}>
                                      {bin.bin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Remarks */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.remarks}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "remarks",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
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
                  Code Conversion List
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
                  {viewMode === "form" ? "List View" : "New Code Conversion"}
                </Button>
              </div>

              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "80%",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "500px",
                  overflowY: "auto",
                  margin: "40px auto",
                  background: "var(--bg-body-gradient)",
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
                        Remarks
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Freeze
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
                    {codeConversionList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`code-conversion-${index}-${item.id}`}
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
                            {item.docId}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {dayjs(item.docDate).format("DD-MM-YYYY")}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.remarks}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <span
                              className={`status-${
                                item.freeze ? "frozen" : "draft"
                              }`}
                            >
                              {item.freeze ? "Frozen" : "Draft"}
                            </span>
                          </td>
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
                              onClick={() => handleEditCodeConversion(item)}
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
                    justifyContent: "flex-end",
                    marginTop: "16px",
                    paddingRight: "50px",
                    color: "white",
                  }}
                >
                  <span style={{ marginRight: "16px", fontSize: "12px" }}>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(
                      currentPage * pageSize,
                      codeConversionList.length
                    )}{" "}
                    of {codeConversionList.length} items
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
                    { length: Math.ceil(codeConversionList.length / pageSize) },
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
                          Math.ceil(codeConversionList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(codeConversionList.length / pageSize)
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
                        Math.ceil(codeConversionList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(codeConversionList.length / pageSize)
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

        {/* Fill Grid Modal */}
        <Modal
          title={
            <div
              style={{
                width: "100%",
                cursor: "move",
                color: "white",
              }}
              id="draggable-dialog-title"
            >
              Fill Grid
            </div>
          }
          open={modalOpen}
          onOk={handleSaveSelectedRows}
          onCancel={() => {
            setModalOpen(false);
            setSelectedRows([]);
            setSelectAll(false);
          }}
          modalRender={(modal) => <PaperComponent>{modal}</PaperComponent>}
          width={1200}
          okText="Save Selected"
          cancelText="Cancel"
          style={{ top: 20 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              style={{ color: "white" }}
            >
              Select All
            </Checkbox>
          </div>
          <Table
            dataSource={fillGridData}
            rowKey={(record, index) => index}
            pagination={false}
            scroll={{ y: 400 }}
            rowSelection={{
              selectedRowKeys: selectedRows,
              onChange: (selectedRowKeys) => {
                setSelectedRows(selectedRowKeys);
              },
            }}
          >
            <Table.Column
              title="Part No"
              dataIndex="partNo"
              key="partNo"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="Part Description"
              dataIndex="partDesc"
              key="partDesc"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="GRN No"
              dataIndex="grnNo"
              key="grnNo"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="Bin Type"
              dataIndex="binType"
              key="binType"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="Batch No"
              dataIndex="batchNo"
              key="batchNo"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="Bin"
              dataIndex="bin"
              key="bin"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
            <Table.Column
              title="Qty"
              dataIndex="qty"
              key="qty"
              render={(text) => <span style={{ color: "white" }}>{text}</span>}
            />
          </Table>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default CodeConversion;
