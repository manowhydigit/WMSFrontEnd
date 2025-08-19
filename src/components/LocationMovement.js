import React, { useEffect, useState, useRef } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
  TableOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  Select,
  Spin,
  Table,
  Tabs,
  Typography,
  Checkbox,
  Modal,
  message,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sampleFile from "../assets/sample-files/sample_Location_movement.xls";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

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

export const LocationMovement = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem("orgId")));
  const [isLoading, setIsLoading] = useState(false);
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
  const [locationMovementList, setLocationMovementList] = useState([]);
  const [locationMovementItems, setLocationMovementItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Data lists
  const [fromBinList, setFromBinList] = useState([]);
  const [toBinList, setToBinList] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    entryNo: "",
    movedQty: "",
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
    getAllLocationMovements();
    getDocId();
    getAllFromBin();
    getToBinDetails();
  }, []);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getLocationMovementDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.locationMovementDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
    }
  };

  const getAllLocationMovements = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getAllLocationMovementByOrgId?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&customer=${customer}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setLocationMovementList(
          response.data.paramObjectsMap.locationMovementVO
        );
      }
    } catch (error) {
      console.error("Error fetching location movements:", error);
    }
  };

  const getAllFromBin = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getBinFromStockForLocationMovement?&orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}`
      );
      if (response.data.status === true) {
        setFromBinList(response.data.paramObjectsMap.locationMovementDetailsVO);
      }
    } catch (error) {
      console.error("Error fetching from bins:", error);
    }
  };

  const getToBinDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getToBinFromLocationStatusForLocationMovement?branch=${branch}&branchCode=${branchCode}&client=${client}&orgId=${orgId}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setToBinList(response.data.paramObjectsMap.locationMovementDetailsVO);
      }
    } catch (error) {
      console.error("Error fetching to bins:", error);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      fromBin: "",
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      batchNo: "",
      avlQty: "",
      toBin: "",
      toBinType: "",
      toQty: "",
      remainQty: "",
      rowPartNoList: [],
      rowGrnNoList: [],
      rowBatchNoList: [],
    };
    setLocationMovementItems([...locationMovementItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setLocationMovementItems(
      locationMovementItems.filter((item) => item.id !== id)
    );
  };

  const handleItemChange = (id, field, value) => {
    setLocationMovementItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      entryNo: "",
      movedQty: "",
    });
    setLocationMovementItems([]);
    getDocId();
    setEditId("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const saveData = {
        ...formData,
        locationMovementDetailsDTO: locationMovementItems.map((item) => ({
          ...(editId && { id: item.id }),
          fromBin: item.fromBin,
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
          grnNo: item.grnNo,
          batchNo: item.batchNo,
          avlQty: parseFloat(item.avlQty) || 0,
          toBin: item.toBin,
          toBinType: item.toBinType,
          toQty: parseFloat(item.toQty) || 0,
          remainQty: parseFloat(item.remainQty) || 0,
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
        `${API_URL}/locationMovement/createUpdateLocationMovement`,
        saveData
      );

      if (response.data.status === true) {
        toast.success(
          editId
            ? "Location Movement updated successfully"
            : "Location Movement created successfully"
        );
        handleClear();
        getAllLocationMovements();
      } else {
        toast.error(
          response.data.message || "Failed to save Location Movement"
        );
      }
    } catch (error) {
      console.error("Error saving Location Movement:", error);
      toast.error("Failed to save Location Movement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditLocationMovement = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      entryNo: record.entryNo,
      movedQty: record.movedQty,
    });

    setLocationMovementItems(
      record.locationMovementDetailsVO?.map((item) => ({
        id: item.id,
        fromBin: item.fromBin,
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        grnNo: item.grnNo,
        batchNo: item.batchNo,
        avlQty: item.avlQty,
        toBin: item.toBin,
        toBinType: item.toBinType,
        toQty: item.toQty,
        remainQty: item.remainQty,
      })) || []
    );

    setViewMode("form");
  };

  const getAllFillGrid = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getAllForLocationMovementDetailsFillGrid?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&entryNo=${formData.entryNo}`
      );

      if (response.data.status === true) {
        setFillGridData(
          response.data.paramObjectsMap.locationMovementDetailsVO
        );
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setLocationMovementItems([...locationMovementItems, ...selectedData]);
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

  const handleFromBinChange = (id, value) => {
    const selectedFromBin = fromBinList.find((bin) => bin.fromBin === value);
    setLocationMovementItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              fromBin: selectedFromBin?.fromBin || "",
              partNo: "",
              partDesc: "",
              sku: "",
              grnNo: "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowPartNoList: [],
              rowGrnNoList: [],
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      getPartNoList(id, value);
    }
  };

  const getPartNoList = async (id, fromBin) => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getPartNoAndPartDescFromStockForLocationMovement?&orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}&bin=${fromBin}`
      );
      if (response.data.status === true) {
        setLocationMovementItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowPartNoList:
                    response.data.paramObjectsMap.locationMovementDetailsVO,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
    }
  };

  const handlePartNoChange = (id, value) => {
    const selectedPart = locationMovementItems
      .find((item) => item.id === id)
      ?.rowPartNoList.find((part) => part.partNo === value);
    setLocationMovementItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              grnNo: "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowGrnNoList: [],
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      const fromBin = locationMovementItems.find(
        (item) => item.id === id
      )?.fromBin;
      if (fromBin) {
        getGrnNoList(id, fromBin, value);
      }
    }
  };

  const getGrnNoList = async (id, fromBin, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getGrnNoDetailsForLocationMovement?bin=${fromBin}&branch=${branch}&branchCode=${branchCode}&client=${client}&orgId=${orgId}&partNo=${partNo}`
      );
      if (response.data.status === true) {
        setLocationMovementItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowGrnNoList: response.data.paramObjectsMap.grnDetails,
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
    const selectedGrn = locationMovementItems
      .find((item) => item.id === id)
      ?.rowGrnNoList.find((grn) => grn.grnNo === value);
    setLocationMovementItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              batchNo: "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
              rowBatchNoList: [],
            }
          : item
      )
    );

    if (value) {
      const item = locationMovementItems.find((item) => item.id === id);
      if (item && item.fromBin && item.partNo) {
        getBatchNoList(id, item.fromBin, item.partNo, value);
      }
    }
  };

  const getBatchNoList = async (id, fromBin, partNo, grnNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getBatchNoDetailsForLocationMovement?bin=${fromBin}&branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}`
      );
      if (response.data.status === true) {
        setLocationMovementItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBatchNoList: response.data.paramObjectsMap.batchDetails,
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
    const selectedBatch = locationMovementItems
      .find((item) => item.id === id)
      ?.rowBatchNoList.find((batch) => batch.batchNo === value);
    setLocationMovementItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batchNo || "",
              avlQty: "",
              toBin: "",
              toBinType: "",
              toQty: "",
              remainQty: "",
            }
          : item
      )
    );

    if (value) {
      const item = locationMovementItems.find((item) => item.id === id);
      if (item && item.fromBin && item.partNo && item.grnNo) {
        getAvlQty(id, value, item.fromBin, item.partNo, item.grnNo);
      }
    }
  };

  const getAvlQty = async (id, batchNo, fromBin, partNo, grnNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/locationMovement/getFromQtyForLocationMovement?batchNo=${batchNo}&bin=${fromBin}&branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${grnNo}&orgId=${orgId}&partNo=${partNo}`
      );
      if (response.data.status === true) {
        setLocationMovementItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  avlQty: response.data.paramObjectsMap?.fromQty || 0,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }
  };

  const handleToBinChange = (id, value) => {
    const selectedToBin = toBinList.find((bin) => bin.toBin === value);
    setLocationMovementItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              toBin: selectedToBin?.toBin || "",
              toBinType: selectedToBin?.toBinType || "",
            }
          : item
      )
    );
  };

  const handleToQtyChange = (id, value) => {
    const item = locationMovementItems.find((item) => item.id === id);
    if (!item) return;

    const numericValue = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    const numericAvlQty = isNaN(parseInt(item.avlQty, 10))
      ? 0
      : parseInt(item.avlQty, 10);
    const intPattern = /^\d*$/;

    if (value === "") {
      setLocationMovementItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                toQty: "",
                remainQty: "",
              }
            : i
        )
      );
    } else if (intPattern.test(value)) {
      setLocationMovementItems((prev) =>
        prev.map((i) => {
          if (
            i.fromBin === item.fromBin &&
            i.partNo === item.partNo &&
            i.grnNo === item.grnNo &&
            i.batchNo === item.batchNo
          ) {
            const newRemainQty = Math.max(numericAvlQty - numericValue, 0);
            return {
              ...i,
              toQty: i.id === id ? value : i.toQty,
              remainQty: newRemainQty,
            };
          }
          return i;
        })
      );
    }
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleUploadSubmit = () => {
    console.log("Submit clicked");
    setUploadOpen(false);
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
                    Location Movement
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage inventory location movements
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
                                <span style={{ color: "#fff" }}>Moved Qty</span>
                              }
                            >
                              <Input
                                value={formData.movedQty}
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
                        <Button
                          icon={<TableOutlined />}
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
                          onClick={() => setLocationMovementItems([])}
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
                          <col style={{ width: "120px" }} /> {/* From Bin */}
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "120px" }} /> {/* SKU */}
                          <col style={{ width: "120px" }} /> {/* GRN No */}
                          <col style={{ width: "120px" }} /> {/* Batch No */}
                          <col style={{ width: "100px" }} /> {/* Avl Qty */}
                          <col style={{ width: "120px" }} /> {/* To Bin */}
                          <col style={{ width: "100px" }} /> {/* To Bin Type */}
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
                              Avl Qty
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
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              To Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Remain Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {locationMovementItems.map((item, index) => (
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

                              {/* From Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.fromBin}
                                  onChange={(value) =>
                                    handleFromBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
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
                                  disabled={!item.fromBin}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowPartNoList?.map((part) => (
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

                              {/* Batch No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.batchNo}
                                  onChange={(value) =>
                                    handleBatchNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.grnNo}
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

                              {/* Avl Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.avlQty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* To Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.toBin}
                                  onChange={(value) =>
                                    handleToBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.batchNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {toBinList.map((bin) => (
                                    <Option key={bin.toBin} value={bin.toBin}>
                                      {bin.toBin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* To Bin Type */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.toBinType}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* To Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.toQty}
                                  onChange={(e) =>
                                    handleToQtyChange(item.id, e.target.value)
                                  }
                                  style={inputStyle}
                                  disabled={!item.toBin}
                                />
                              </td>

                              {/* Remain Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.remainQty}
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
                  Location Movement List
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
                  {viewMode === "form" ? "List View" : "New Cycle Count"}
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
                        Moved Qty
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
                    {locationMovementList
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
                          <td style={{ padding: "12px" }}>{record.movedQty}</td>
                          <td style={{ padding: "12px" }}>
                            {record.createdBy}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {dayjs(record.createdDate).format("DD-MM-YYYY")}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Button
                              type="link"
                              onClick={() => handleEditLocationMovement(record)}
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
                    total={locationMovementList.length}
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
          bodyStyle={{
            padding: "10px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setModalOpen(false);
                setSelectedRows([]);
                setSelectAll(false);
              }}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSaveSelectedRows}
              style={{
                background: "rgba(108, 99, 255, 0.3)",
                color: "white",
                border: "none",
              }}
            >
              Save Selected
            </Button>,
          ]}
        >
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              marginTop: "10px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "transparent",
              }}
            >
              <colgroup>
                <col style={{ width: "50px" }} /> {/* Select */}
                <col style={{ width: "50px" }} /> {/* S.No */}
                <col style={{ width: "120px" }} /> {/* From Bin */}
                <col style={{ width: "120px" }} /> {/* Part No */}
                <col style={{ width: "200px" }} /> {/* Part Desc */}
                <col style={{ width: "120px" }} /> {/* SKU */}
                <col style={{ width: "120px" }} /> {/* GRN No */}
                <col style={{ width: "120px" }} /> {/* Batch No */}
                <col style={{ width: "100px" }} /> {/* Avl Qty */}
                <col style={{ width: "120px" }} /> {/* To Bin */}
                <col style={{ width: "100px" }} /> {/* To Bin Type */}
                <col style={{ width: "100px" }} /> {/* To Qty */}
                <col style={{ width: "100px" }} /> {/* Remain Qty */}
              </colgroup>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px dashed #000",
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
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                      style={{ color: "white" }}
                    />
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
                    From Bin
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    Part No
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
                    GRN No
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    Batch No
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    Avl Qty
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    To Bin
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
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    To Qty
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      color: "white",
                    }}
                  >
                    Remain Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {fillGridData.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px dashed white",
                      color: "white",
                    }}
                  >
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <Checkbox
                        checked={selectedRows.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, index]);
                          } else {
                            setSelectedRows(
                              selectedRows.filter((i) => i !== index)
                            );
                          }
                        }}
                        style={{ color: "white" }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "white",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ padding: "8px" }}>{item.fromBin}</td>
                    <td style={{ padding: "8px" }}>{item.partNo}</td>
                    <td style={{ padding: "8px" }}>{item.partDesc}</td>
                    <td style={{ padding: "8px" }}>{item.sku}</td>
                    <td style={{ padding: "8px" }}>{item.grnNo}</td>
                    <td style={{ padding: "8px" }}>{item.batchNo}</td>
                    <td style={{ padding: "8px" }}>{item.avlQty}</td>
                    <td style={{ padding: "8px" }}>{item.toBin}</td>
                    <td style={{ padding: "8px" }}>{item.toBinType}</td>
                    <td style={{ padding: "8px" }}>{item.toQty}</td>
                    <td style={{ padding: "8px" }}>{item.remainQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>

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
              <p>Upload Location Movement</p>
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
                  download="sample_Location_movement.xls"
                  style={{
                    color: "rgba(24, 144, 255, 0.9)",
                    padding: 0,
                    height: "auto",
                  }}
                >
                  <DownloadOutlined /> Sample Location Movement.xls
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

export default LocationMovement;
