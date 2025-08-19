import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Pagination,
  Spin,
  Typography,
  message,
  Tabs,
  Row,
  Col,
  ConfigProvider,
  Checkbox,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  DeleteOutlined,
  TableOutlined,
  FormOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/sample_Stock_Restate_.xls";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const StockRestate = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [editId, setEditId] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );

  // Data states
  const [stockRestateList, setStockRestateList] = useState([]);
  const [detailTableData, setDetailTableData] = useState([]);
  const [fromBinList, setFromBinList] = useState([]);
  const [toBinList, setToBinList] = useState([]);
  const [grnNoList, setGrnNoList] = useState([]);
  const [batchNoList, setBatchNoList] = useState([]);
  const [transferType, setTransferType] = useState([
    { name: "HOLD", value: "HOLD" },
    { name: "DEFECTIVE", value: "DEFECTIVE" },
    { name: "RELEASE", value: "RELEASE" },
    { name: "VAS", value: "VAS" },
  ]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    transferFrom: "",
    transferTo: "",
    transferFromFlag: "",
    transferToFlag: "",
    entryNo: "",
  });

  const [searchParams, setSearchParams] = useState({
    fromDate: dayjs().startOf("month"),
    toDate: dayjs(),
    docId: "",
    status: "ALL",
  });

  useEffect(() => {
    getAllStockRestate();
    getFromBin();
    getNewStockRestateDocId();
  }, []);

  const getNewStockRestateDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getStockRestateDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.StockRestateDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
      message.error("Failed to fetch document ID");
    }
  };

  const getAllStockRestate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getAllStockRestate?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setStockRestateList(response.data.paramObjectsMap.stockRestateVO || []);
      }
    } catch (error) {
      console.error("Error fetching stock restate:", error);
      message.error("Failed to fetch stock restate");
    } finally {
      setIsLoading(false);
    }
  };

  const getFromBin = async (selectedTransferFromFlag) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getFromBinDetailsForStockRestate?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&tranferFromFlag=${
          selectedTransferFromFlag || ""
        }&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setFromBinList(response.data.paramObjectsMap.fromBinDetails || []);
      }
    } catch (error) {
      console.error("Error fetching from bin list:", error);
      message.error("Failed to fetch from bin list");
    }
  };

  const getToBinDetails = async (selectedTransferFromFlag) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getToBinDetails?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&tranferFromFlag=${selectedTransferFromFlag}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setToBinList(response.data.paramObjectsMap.toBinDetails || []);
      }
    } catch (error) {
      console.error("Error fetching to bin list:", error);
      message.error("Failed to fetch to bin list");
    }
  };

  const getPartNo = async (selectedFromBin, selectedTransferFromFlag, row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getPartNoDetailsForStockRestate?branchCode=${loginBranchCode}&client=${loginClient}&fromBin=${selectedFromBin}&orgId=${orgId}&tranferFromFlag=${selectedTransferFromFlag}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setDetailTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowPartNoList: response.data.paramObjectsMap.partNoDetails,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching part no list:", error);
      message.error("Failed to fetch part no list");
    }
  };

  const getGrnNo = async (selectedRowPartNo, selectedRowFromBin) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getGrnNoDetailsForStockRestate?branchCode=${loginBranchCode}&client=${loginClient}&fromBin=${selectedRowFromBin}&orgId=${orgId}&partNo=${selectedRowPartNo}&tranferFromFlag=${formData.transferFromFlag}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setGrnNoList(response.data.paramObjectsMap.grnNoDetails || []);
      }
    } catch (error) {
      console.error("Error fetching GRN no list:", error);
      message.error("Failed to fetch GRN no list");
    }
  };

  const getBatchNo = async (selectedFromBin, selectedPartNo, selectedGrnNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getbatchNoDetailsForStockRestate?branchCode=${loginBranchCode}&client=${loginClient}&fromBin=${selectedFromBin}&grnNo=${selectedGrnNo}&orgId=${orgId}&partNo=${selectedPartNo}&tranferFromFlag=${formData.transferFromFlag}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setBatchNoList(response.data.paramObjectsMap.batchNoDetails || []);
      }
    } catch (error) {
      console.error("Error fetching batch no list:", error);
      message.error("Failed to fetch batch no list");
    }
  };

  const getFromQty = async (
    selectedBatchNo,
    selectedFromBin,
    selectedGrnNo,
    selectedPartNo,
    row
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getFromQtyForStockRestate?batchNo=${selectedBatchNo}&branchCode=${loginBranchCode}&client=${loginClient}&fromBin=${selectedFromBin}&grnNo=${selectedGrnNo}&orgId=${orgId}&partNo=${selectedPartNo}&tranferFromFlag=${formData.transferFromFlag}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setDetailTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  fromQty: response.data.paramObjectsMap?.fromQty || r.fromQty,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching from quantity:", error);
      message.error("Failed to fetch from quantity");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const specialCharsRegex = /^[A-Za-z0-9#_\-/\\]*$/;

    let errorMessage = "";

    switch (name) {
      case "entryNo":
        if (!specialCharsRegex.test(value)) {
          errorMessage = "Only alphanumeric, #_-/ are allowed";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      message.error(errorMessage);
    } else {
      let updatedData = { ...formData, [name]: value.toUpperCase() };

      if (name === "transferFrom") {
        updatedData.transferFromFlag =
          value === "DEFECTIVE"
            ? "D"
            : value === "HOLD"
            ? "H"
            : value === "RELEASE"
            ? "R"
            : value === "VAS"
            ? "V"
            : "";
        setFromBinList([]);
        getFromBin(updatedData.transferFromFlag);
        getToBinDetails(updatedData.transferFromFlag);
      } else if (name === "transferTo") {
        updatedData.transferToFlag =
          value === "DEFECTIVE"
            ? "D"
            : value === "HOLD"
            ? "H"
            : value === "RELEASE"
            ? "R"
            : value === "VAS"
            ? "V"
            : "";
      }

      setFormData(updatedData);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      fromBin: "",
      fromBinType: "",
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      batchNo: "",
      toBin: "",
      toBinType: "",
      fromQty: "",
      toQty: "",
      remainQty: "",
    };
    setDetailTableData([...detailTableData, newItem]);
  };

  const handleDeleteItem = (id) => {
    setDetailTableData(detailTableData.filter((item) => item.id !== id));
  };

  const handleFromBinChange = (id, value) => {
    const selectedFromBin = fromBinList.find((b) => b.fromBin === value);
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              fromBin: selectedFromBin.fromBin,
              fromBinType: selectedFromBin.fromBinType,
              fromBinClass: selectedFromBin.fromBinClass,
              fromCellType: selectedFromBin.fromCellType,
              fromCore: selectedFromBin.fromCore,
            }
          : item
      )
    );
    if (value) {
      getPartNo(value, formData.transferFromFlag, { id });
    }
  };

  const handlePartNoChange = (id, value) => {
    const row = detailTableData.find((item) => item.id === id);
    const selectedPart = row.rowPartNoList.find(
      (part) => part.partNo === value
    );
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
            }
          : item
      )
    );
    if (value && row.fromBin) {
      getGrnNo(value, row.fromBin);
    }
  };

  const handleGrnNoChange = (id, value) => {
    const selectedGrnNo = grnNoList.find((grn) => grn.grnNo === value);
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrnNo.grnNo,
              grnDate: selectedGrnNo?.grnDate || "",
            }
          : item
      )
    );
    const row = detailTableData.find((item) => item.id === id);
    if (value && row.partNo && row.fromBin) {
      getBatchNo(row.fromBin, row.partNo, value);
    }
  };

  const handleBatchNoChange = (id, value) => {
    const selectedBatchNo = batchNoList.find(
      (batch) => batch.batchNo === value
    );
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatchNo.batchNo,
              batchDate: selectedBatchNo?.batchDate || "",
              expDate: selectedBatchNo?.expDate || "",
            }
          : item
      )
    );
    const row = detailTableData.find((item) => item.id === id);
    if (value && row.partNo && row.fromBin && row.grnNo) {
      getFromQty(value, row.fromBin, row.grnNo, row.partNo, row);
    }
  };

  const handleToBinChange = (id, value) => {
    const selectedToBin = toBinList.find((bin) => bin.toBin === value);
    setDetailTableData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              toBin: selectedToBin.toBin,
              toBinType: selectedToBin.tobinType,
              toBinClass: selectedToBin.toBinClass,
              toCellType: selectedToBin.toCellType,
              toCore: selectedToBin.toCore,
            }
          : item
      )
    );
  };

  const handleToQtyChange = (id, value) => {
    const numericValue = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    const row = detailTableData.find((item) => item.id === id);
    const numericFromQty = isNaN(parseInt(row.fromQty, 10))
      ? 0
      : parseInt(row.fromQty, 10);

    if (value === "") {
      setDetailTableData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                toQty: "",
                remainQty: "",
              }
            : item
        )
      );
    } else if (/^\d*$/.test(value)) {
      setDetailTableData((prev) => {
        let cumulativeToQty = 0;
        let maxAllowedToQty = numericFromQty;
        let shouldClearSubsequentRows = false;

        return prev.map((item) => {
          if (
            item.fromBin === row.fromBin &&
            item.partNo === row.partNo &&
            item.grnNo === row.grnNo &&
            item.batchNo === row.batchNo
          ) {
            if (item.id === id) {
              maxAllowedToQty = numericFromQty - cumulativeToQty;

              if (numericValue > maxAllowedToQty) {
                message.error(`Cannot exceed ${maxAllowedToQty}`);
                return item;
              }

              cumulativeToQty += numericValue;
            } else {
              cumulativeToQty += isNaN(parseInt(item.toQty, 10))
                ? 0
                : parseInt(item.toQty, 10);
            }

            const newRemainQty = Math.max(numericFromQty - cumulativeToQty, 0);

            if (newRemainQty <= 0) {
              shouldClearSubsequentRows = true;
            }

            if (shouldClearSubsequentRows && item.id > id) {
              return {
                ...item,
                toQty: "",
                remainQty: "",
              };
            }

            return {
              ...item,
              toQty: item.id === id ? value : item.toQty,
              remainQty: newRemainQty,
            };
          }
          return item;
        });
      });
    } else {
      message.error("Only numbers are allowed");
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      transferFrom: "",
      transferTo: "",
      transferFromFlag: "",
      transferToFlag: "",
      entryNo: "",
    });
    setDetailTableData([]);
    setEditId("");
    getNewStockRestateDocId();
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const saveData = {
        ...formData,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        warehouse: loginWarehouse,
        finYear: loginFinYear,
        orgId: parseInt(orgId),
        createdBy: loginUserName,
        stockRestateDetailsDTO: detailTableData.map((item) => ({
          ...(editId && { id: item.id }),
          fromBin: item.fromBin,
          fromBinClass: item.fromBinClass,
          fromBinType: item.fromBinType,
          fromCellType: item.fromCellType,
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
          grnNo: item.grnNo,
          grnDate: item.grnDate,
          batch: item.batchNo,
          batchDate: item.batchDate,
          expDate: item.expDate,
          toBin: item.toBin,
          toBinType: item.toBinType,
          toBinClass: item.toBinClass,
          toCellType: item.toCellType,
          fromQty: item.fromQty,
          toQty: parseInt(item.toQty) || 0,
          fromCore: item.fromCore,
          toCore: item.toCore,
          qcFlag: item.qcFlag,
        })),
      };

      const response = await axios.put(
        `${API_URL}/api/stockRestate/createStockRestate`,
        saveData
      );

      if (response.data.status === true) {
        message.success(
          editId
            ? "Stock Restate updated successfully"
            : "Stock Restate created successfully"
        );
        handleClear();
        getAllStockRestate();
      } else {
        message.error(response.data.message || "Failed to save Stock Restate");
      }
    } catch (error) {
      console.error("Error saving Stock Restate:", error);
      message.error("Failed to save Stock Restate");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditStockRestate = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      transferFrom: record.transferFrom,
      transferFromFlag: record.transferFromFlag,
      transferTo: record.transferTo,
      transferToFlag: record.transferToFlag,
      entryNo: record.entryNo,
    });

    setDetailTableData(
      record.stockRestateDetailsVO?.map((item) => ({
        id: item.id,
        fromBin: item.fromBin,
        fromBinClass: item.fromBinClass,
        fromBinType: item.fromBinType,
        fromCellType: item.fromCellType,
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        grnNo: item.grnNo,
        grnDate: item.grnDate,
        batchNo: item.batch,
        batchDate: item.batchDate,
        expDate: item.expDate,
        toBin: item.toBin,
        toBinType: item.toBinType,
        toBinClass: item.toBinClass,
        toCellType: item.toCellType,
        fromQty: item.fromQty,
        toQty: item.toQty,
        fromCore: item.fromCore,
        toCore: item.toCore,
        qcFlag: item.qcFlag,
        remainQty: item.remainQty,
      })) || []
    );

    getFromBin(record.transferFromFlag);
    getToBinDetails(record.transferFromFlag);
    setViewMode("form");
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleUploadSubmit = () => {
    console.log("Submit clicked");
    setUploadOpen(false);
    getAllStockRestate();
  };

  const getAvailableTransferTo = (transferFrom) => {
    return transferType.filter((item) => !transferFrom.includes(item.value));
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: 80,
    },
    {
      title: "Document No",
      dataIndex: "docId",
      key: "docId",
      sorter: (a, b) => a.docId.localeCompare(b.docId),
    },
    {
      title: "Document Date",
      dataIndex: "docDate",
      key: "docDate",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => dayjs(a.docDate).unix() - dayjs(b.docDate).unix(),
    },
    {
      title: "Transfer From",
      dataIndex: "transferFrom",
      key: "transferFrom",
    },
    {
      title: "Transfer To",
      dataIndex: "transferTo",
      key: "transferTo",
    },
    {
      title: "Entry No",
      dataIndex: "entryNo",
      key: "entryNo",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => dayjs(date).format("DD-MM-YYYY HH:mm"),
      sorter: (a, b) =>
        dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleEditStockRestate(record)}
          style={{ color: "#1890ff" }}
        >
          Edit
        </Button>
      ),
      width: 100,
    },
  ];

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
            <Spin size="large" tip="Loading..." />
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
                    Stock Restate
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage stock restate entries
                  </Typography.Text>
                </div>
                <div>
                  <Button
                    icon={<TableOutlined />}
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
                  loading={isLoading}
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
                      <Form layout="vertical">
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
                                <span style={{ color: "#fff" }}>
                                  Transfer From
                                </span>
                              }
                            >
                              <Select
                                value={formData.transferFrom}
                                onChange={(value) =>
                                  setFormData({
                                    ...formData,
                                    transferFrom: value,
                                    transferFromFlag:
                                      value === "DEFECTIVE"
                                        ? "D"
                                        : value === "HOLD"
                                        ? "H"
                                        : value === "RELEASE"
                                        ? "R"
                                        : value === "VAS"
                                        ? "V"
                                        : "",
                                  })
                                }
                                style={selectStyle}
                              >
                                <Option value="">--Select--</Option>
                                {transferType.map((item) => (
                                  <Option key={item.value} value={item.value}>
                                    {item.value}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Transfer To
                                </span>
                              }
                            >
                              <Select
                                value={formData.transferTo}
                                onChange={(value) =>
                                  setFormData({
                                    ...formData,
                                    transferTo: value,
                                    transferToFlag:
                                      value === "DEFECTIVE"
                                        ? "D"
                                        : value === "HOLD"
                                        ? "H"
                                        : value === "RELEASE"
                                        ? "R"
                                        : value === "VAS"
                                        ? "V"
                                        : "",
                                  })
                                }
                                style={selectStyle}
                              >
                                <Option value="">--Select--</Option>
                                {getAvailableTransferTo(
                                  formData.transferFrom
                                ).map((item) => (
                                  <Option key={item.value} value={item.value}>
                                    {item.value}
                                  </Option>
                                ))}
                              </Select>
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
                          <col style={{ width: "120px" }} /> {/* From Bin */}
                          <col style={{ width: "120px" }} />{" "}
                          {/* From Bin Type */}
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "100px" }} /> {/* SKU */}
                          <col style={{ width: "100px" }} /> {/* GRN No */}
                          <col style={{ width: "100px" }} /> {/* Batch No */}
                          <col style={{ width: "120px" }} /> {/* To Bin */}
                          <col style={{ width: "120px" }} /> {/* To Bin Type */}
                          <col style={{ width: "100px" }} /> {/* From Qty */}
                          <col style={{ width: "100px" }} /> {/* To Qty */}
                          <col style={{ width: "100px" }} /> {/* Remain Qty */}
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
                              From Bin *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              From Bin Type
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
                              GRN No *
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
                              To Bin *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              To Bin Type
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "right",
                                color: "white",
                              }}
                            >
                              From Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "right",
                                color: "white",
                              }}
                            >
                              To Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "right",
                                color: "white",
                              }}
                            >
                              Remain Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailTableData.map((row, index) => (
                            <tr
                              key={row.id}
                              style={{
                                borderBottom:
                                  "1px dashed rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              <td
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteItem(row.id)}
                                  style={{
                                    color: "#ff4d4f",
                                    background: "transparent",
                                    border: "none",
                                  }}
                                />
                              </td>
                              <td
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                {index + 1}
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={row.fromBin}
                                  onChange={(value) =>
                                    handleFromBinChange(row.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  <Option value="">--Select--</Option>
                                  {fromBinList.map((bin) => (
                                    <Option
                                      key={bin.fromBin}
                                      value={bin.fromBin}
                                    >
                                      {bin.fromBin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={row.fromBinType}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={row.partNo}
                                  onChange={(value) =>
                                    handlePartNoChange(row.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!row.fromBin}
                                >
                                  <Option value="">--Select--</Option>
                                  {row.rowPartNoList?.map((part) => (
                                    <Option
                                      key={part.partNo}
                                      value={part.partNo}
                                    >
                                      {part.partNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={row.partDesc}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={row.sku}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={row.grnNo}
                                  onChange={(value) =>
                                    handleGrnNoChange(row.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!row.partNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {grnNoList.map((grn) => (
                                    <Option key={grn.grnNo} value={grn.grnNo}>
                                      {grn.grnNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={row.batchNo}
                                  onChange={(value) =>
                                    handleBatchNoChange(row.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!row.grnNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {batchNoList.map((batch) => (
                                    <Option
                                      key={batch.batchNo}
                                      value={batch.batchNo}
                                    >
                                      {batch.batchNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={row.toBin}
                                  onChange={(value) =>
                                    handleToBinChange(row.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  <Option value="">--Select--</Option>
                                  {toBinList.map((bin) => (
                                    <Option key={bin.toBin} value={bin.toBin}>
                                      {bin.toBin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={row.toBinType}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                              <td
                                style={{ padding: "8px", textAlign: "right" }}
                              >
                                <Input
                                  value={row.fromQty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>
                              <td
                                style={{ padding: "8px", textAlign: "right" }}
                              >
                                <Input
                                  value={row.toQty}
                                  onChange={(e) =>
                                    handleToQtyChange(row.id, e.target.value)
                                  }
                                  style={inputStyle}
                                />
                              </td>
                              <td
                                style={{ padding: "8px", textAlign: "right" }}
                              >
                                <Input
                                  value={row.remainQty}
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
                    Stock Restate List
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    View and manage stock restate entries
                  </Typography.Text>
                </div>
                <div>
                  <Button
                    icon={<FormOutlined />}
                    onClick={toggleViewMode}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Form View
                  </Button>
                </div>
              </div>

              {/* Search Filters */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="From Date">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={dayjs(searchParams.fromDate)}
                        onChange={(date) =>
                          setSearchParams({
                            ...searchParams,
                            fromDate: date,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="To Date">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={dayjs(searchParams.toDate)}
                        onChange={(date) =>
                          setSearchParams({
                            ...searchParams,
                            toDate: date,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Document No">
                      <Input
                        value={searchParams.docId}
                        onChange={(e) =>
                          setSearchParams({
                            ...searchParams,
                            docId: e.target.value,
                          })
                        }
                        placeholder="Enter document no"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Status">
                      <Select
                        value={searchParams.status}
                        onChange={(value) =>
                          setSearchParams({
                            ...searchParams,
                            status: value,
                          })
                        }
                        style={{ width: "100%" }}
                      >
                        <Option value="ALL">All</Option>
                        <Option value="PENDING">Pending</Option>
                        <Option value="COMPLETED">Completed</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: "right", marginTop: "16px" }}>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => {
                      // Implement search functionality
                      console.log("Search clicked", searchParams);
                    }}
                    style={{ marginRight: "8px" }}
                  >
                    Search
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={() => {
                      setSearchParams({
                        fromDate: dayjs().startOf("month"),
                        toDate: dayjs(),
                        docId: "",
                        status: "ALL",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div
                style={{
                  marginTop: "20px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Table
                  columns={columns}
                  dataSource={stockRestateList}
                  rowKey="id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: stockRestateList.length,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                  }}
                  scroll={{ x: true }}
                  loading={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Modal
          title="Bulk Upload Stock Restate"
          visible={uploadOpen}
          onCancel={() => setUploadOpen(false)}
          footer={null}
          width={800}
        >
          <CommonBulkUpload
            sampleFile={sampleFile}
            uploadUrl={`${API_URL}/api/stockRestate/uploadStockRestate`}
            onUploadSuccess={handleUploadSubmit}
            params={{
              branch: loginBranch,
              branchCode: loginBranchCode,
              client: loginClient,
              customer: loginCustomer,
              warehouse: loginWarehouse,
              finYear: loginFinYear,
              orgId: orgId,
              createdBy: loginUserName,
            }}
          />
        </Modal>

        <ToastContainer position="bottom-right" autoClose={5000} />
      </div>
    </ConfigProvider>
  );
};

export default StockRestate;
