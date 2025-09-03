import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  FormOutlined,
  RightCircleOutlined,
  DownloadOutlined,
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
import { getAllActiveGroups } from "../utils/CommonFunctions";
import * as XLSX from "xlsx";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { RangePicker } = DatePicker;

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

export const ReversePick = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [buyerOrderNoList, setBuyerOrderNoList] = useState([]);
  const [listView, setListView] = useState(false);
  const [editId, setEditId] = useState("");
  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);
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
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));

  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [reversePickList, setReversePickList] = useState([]);
  const [reversePickItems, setReversePickItems] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: null,
    clientName: "",
    customerName: "",
    customerShortName: "",
    inTime: "",
    clientAddress: "",
    customerAddress: "",
    status: "Edit",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
    pickRequestDocDate: "",
    boAmendment: "No",
    buyerOrderDate: null,
    pickRequestDocId: "",
    freeze: false,
    totalPickedQty: "",
    totalRevisedQty: "",
  });

  const [value, setValue] = useState(0);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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
    getAllReversePick();
    getPickRequestDetails();
    getAllGroups();
    getDocId();
  }, []);

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      return dayjs(dateString).format("DD-MM-YYYY");
    } catch (error) {
      return dateString;
    }
  };

  // Filter data by date range
  const filterDataByDateRange = (data, dateRange) => {
    if (dateRange.length !== 2) return data;

    const fromDate = dayjs(dateRange[0], "DD-MM-YYYY");
    const toDate = dayjs(dateRange[1], "DD-MM-YYYY");

    return data.filter((item) => {
      const itemDate = dayjs(item.docDate, "DD-MM-YYYY");
      return (
        itemDate.isAfter(fromDate.subtract(1, "day")) &&
        itemDate.isBefore(toDate.add(1, "day"))
      );
    });
  };

  // Format Reverse Pick data for Excel export
  const formatReversePickDataForExcel = (reversePickData) => {
    const excelData = [];

    reversePickData.forEach((mainRecord) => {
      if (
        mainRecord.reversePickDetailsVO &&
        mainRecord.reversePickDetailsVO.length > 0
      ) {
        // Create a row for each detail record
        mainRecord.reversePickDetailsVO.forEach((detail) => {
          excelData.push({
            "Document No": mainRecord.docId,
            "Document Date": formatDateForDisplay(mainRecord.docDate),
            "Pick Request ID": mainRecord.pickRequestDocId,
            "Buyer Order No": mainRecord.buyerOrderNo,
            "Buyer Ref No": mainRecord.buyerRefNo,
            "Buyer Ref Date": formatDateForDisplay(mainRecord.buyerRefDate),
            "Client Name": mainRecord.clientName,
            "Customer Name": mainRecord.customerName,
            Status: mainRecord.status,
            "BO Amendment": mainRecord.boAmendment,
            "In Time": mainRecord.inTime,
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            Bin: detail.bin,
            "Batch No": detail.batchNo,
            "Order Qty": detail.orderQty,
            "Pick Qty": detail.pickQty,
            "Revised Qty": detail.revisedQty,
            "GRN No": detail.grnNo,
            "GRN Date": formatDateForDisplay(detail.grnDate),
            "Total Picked Qty": mainRecord.totalPickQty,
            "Total Revised Qty": mainRecord.totalRevisedQty,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
          });
        });
      } else {
        // Create a row even if there are no details
        excelData.push({
          "Document No": mainRecord.docId,
          "Document Date": formatDateForDisplay(mainRecord.docDate),
          "Pick Request ID": mainRecord.pickRequestDocId,
          "Buyer Order No": mainRecord.buyerOrderNo,
          "Buyer Ref No": mainRecord.buyerRefNo,
          "Buyer Ref Date": formatDateForDisplay(mainRecord.buyerRefDate),
          "Client Name": mainRecord.clientName,
          "Customer Name": mainRecord.customerName,
          Status: mainRecord.status,
          "BO Amendment": mainRecord.boAmendment,
          "In Time": mainRecord.inTime,
          "Part No": "",
          "Part Description": "",
          Bin: "",
          "Batch No": "",
          "Order Qty": "",
          "Pick Qty": "",
          "Revised Qty": "",
          "GRN No": "",
          "GRN Date": "",
          "Total Picked Qty": mainRecord.totalPickQty,
          "Total Revised Qty": mainRecord.totalRevisedQty,
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
        });
      }
    });

    return excelData;
  };

  // Download Excel function
  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0];
      const toDate = selectedDateRange[1];

      // Fetch Reverse Pick data from the API endpoint
      const response = await axios.get(
        `${API_URL}/api/reversePick/getAllReversePick?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );

      if (response.data.status && response.data.paramObjectsMap.reversePickVO) {
        const allReversePickData = response.data.paramObjectsMap.reversePickVO;

        // Filter data based on the selected date range
        const filteredReversePickData = allReversePickData.filter((item) => {
          // Convert the date string to a format that can be compared
          let itemDate;
          if (item.docDate) {
            // Handle different date formats that might come from the API
            if (item.docDate.includes("-")) {
              const parts = item.docDate.split("-");
              if (parts[0].length === 4) {
                // YYYY-MM-DD format
                itemDate = item.docDate;
              } else if (parts[0].length === 2) {
                // DD-MM-YYYY format, convert to YYYY-MM-DD for comparison
                itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            } else {
              // If it's a timestamp or other format, try to parse it
              itemDate = dayjs(item.docDate).format("YYYY-MM-DD");
            }
          }

          // Convert selected dates to YYYY-MM-DD format for comparison
          const fromDateFormatted = dayjs(fromDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          );
          const toDateFormatted = dayjs(toDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          );

          return (
            itemDate &&
            itemDate >= fromDateFormatted &&
            itemDate <= toDateFormatted
          );
        });

        if (filteredReversePickData.length > 0) {
          // Format filtered data for Excel
          const excelData = formatReversePickDataForExcel(
            filteredReversePickData
          );

          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, "Reverse Pick Data");

          // Generate file name with date range
          const fileName = `Reverse_Pick_${fromDate}_to_${toDate}.xlsx`;

          // Generate Excel file and download
          XLSX.writeFile(wb, fileName);

          message.success("Excel file downloaded successfully");
        } else {
          message.error("No data found for the selected date range");
        }
      } else {
        message.error("No data available");
      }
    } catch (error) {
      console.error("Error downloading Excel:", error);
      message.error("Failed to download Excel file");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Filter data based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = reversePickList.filter((reversePick) =>
        Object.values(reversePick).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(reversePickList);
    }
  }, [searchText, reversePickList]);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/reversePick/getReversePickDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.reversePickDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
    }
  };

  const getAllReversePick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/reversePick/getAllReversePick?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setReversePickList(response.data.paramObjectsMap.reversePickVO);
      }
    } catch (error) {
      console.error("Error fetching reverse picks:", error);
    }
  };

  const getPickRequestDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/reversePick/getPickRequestDetailsForReversePick?orgId=${orgId}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&branch=${branch}`
      );
      if (response.data.status === true) {
        setBuyerOrderNoList(response.data.paramObjectsMap.pickRequestVO);
      }
    } catch (error) {
      console.error("Error fetching pick requests:", error);
    }
  };

  const handlePickRequestSelect = async (value) => {
    try {
      // Find the selected pick request from the list
      const selectedPickRequest = buyerOrderNoList.find(
        (order) => order.docId === value
      );

      if (selectedPickRequest) {
        // Update form data with the selected pick request details
        setFormData({
          ...formData,
          pickRequestDocId: selectedPickRequest.docId,
          pickRequestDocDate: selectedPickRequest.docDate,
          buyerOrderNo: selectedPickRequest.buyerOrderNo,
          buyerOrderDate: selectedPickRequest.buyerOrderDate,
          buyerRefNo: selectedPickRequest.buyerRefNo,
          buyerRefDate: selectedPickRequest.buyerRefDate,
          clientName: selectedPickRequest.clientName,
          clientShortName: selectedPickRequest.clientShortName,
          clientAddress: selectedPickRequest.clientAddress,
          customerName: selectedPickRequest.customerName,
          customerShortName: selectedPickRequest.customerShortName,
          customerAddress: selectedPickRequest.customerAddress,
          buyersReference: selectedPickRequest.buyersReference,
          invoiceNo: selectedPickRequest.invoiceNo,
          totalPickedQty: selectedPickRequest.totalPickQty,
        });

        // Also fetch and set the items for the selected pick request
        if (selectedPickRequest.pickRequestDetailsVO) {
          setReversePickItems(
            selectedPickRequest.pickRequestDetailsVO.map((item) => ({
              id: item.id,
              partNo: item.partNo,
              partDesc: item.partDesc,
              core: item.core,
              bin: item.bin,
              sku: item.sku,
              batchNo: item.batchNo,
              batchDate: item.batchDate,
              orderQty: item.orderQty,
              pickQty: item.pickQty,
              revisedQty: 0, // Start with 0 for revised quantity
              grnNo: item.grnNo,
              grnDate: item.grnDate,
              status: item.status,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error handling pick request selection:", error);
      message.error("Failed to load pick request details");
    }
  };

  const getAllGroups = async () => {
    try {
      const groupData = await getAllActiveGroups(orgId);
      setGroupList(groupData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const getCurrentTime = () => dayjs().format("HH:mm:ss");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, inTime: getCurrentTime() }));
  }, []);

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      core: "",
      bin: "",
      sku: "",
      batchNo: "",
      batchDate: "",
      orderQty: 0,
      pickQty: 0,
      revisedQty: 0,
      status: "PENDING",
    };
    setReversePickItems([...reversePickItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setReversePickItems(reversePickItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setReversePickItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Recalculate total revised quantity when revisedQty changes
    if (field === "revisedQty") {
      const totalRevisedQty = reversePickItems.reduce((sum, item) => {
        return (
          sum +
          (item.id === id
            ? parseFloat(value) || 0
            : parseFloat(item.revisedQty) || 0)
        );
      }, 0);
      setFormData((prev) => ({ ...prev, totalRevisedQty }));
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      buyerOrderNo: "",
      buyerRefNo: "",
      buyerRefDate: null,
      clientName: "",
      customerName: "",
      customerShortName: "",
      inTime: getCurrentTime(),
      clientAddress: "",
      customerAddress: "",
      status: "Edit",
      buyersReference: "",
      invoiceNo: "",
      clientShortName: "",
      pickRequestDocDate: "",
      boAmendment: "No",
      buyerOrderDate: null,
      pickRequestDocId: "",
      freeze: false,
      totalPickedQty: "",
      totalRevisedQty: "",
    });
    setReversePickItems([]);
    getDocId();
    setEditId("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const saveData = {
        ...formData,
        // Include the ID when updating an existing record
        ...(editId && { id: editId }), // This line is crucial
        reversePickDetailsDTO: reversePickItems.map((item) => ({
          ...item,
          revisedQty: parseFloat(item.revisedQty) || 0,
        })),
        orgId: parseInt(orgId), // Ensure orgId is number
        branch,
        branchCode,
        client,
        customer,
        warehouse,
        finYear,
        createdBy: loginUserName,
      };

      console.log("Saving data:", saveData); // Debug log

      const response = await axios.put(
        `${API_URL}/api/reversePick/createUpdateReversePick`,
        saveData
      );

      if (response.data.status === true) {
        message.success(
          editId
            ? "Reverse Pick updated successfully"
            : "Reverse Pick created successfully"
        );
        handleClear();
        getAllReversePick();
      } else {
        message.error(response.data.message || "Failed to save Reverse Pick");
      }
    } catch (error) {
      console.error("Error saving Reverse Pick:", error);
      message.error("Failed to save Reverse Pick");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditReversePick = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      buyerOrderNo: record.buyerOrderNo,
      buyerRefNo: record.buyerRefNo,
      buyerRefDate: record.buyerRefDate,
      clientName: record.clientName,
      customerName: record.customerName,
      customerShortName: record.customerShortName,
      inTime: record.inTime,
      clientAddress: record.clientAddress,
      customerAddress: record.customerAddress,
      status: record.status,
      buyersReference: record.buyersReference,
      invoiceNo: record.invoiceNo,
      clientShortName: record.clientShortName,
      pickRequestDocDate: record.pickRequestDocDate,
      boAmendment: record.boAmendment,
      buyerOrderDate: record.buyerOrderDate,
      pickRequestDocId: record.pickRequestDocId,
      freeze: record.freeze,
      totalPickedQty: record.totalPickQty,
      totalRevisedQty: record.totalRevisedQty,
    });

    setReversePickItems(
      record.reversePickDetailsVO?.map((item) => ({
        id: item.id,
        partNo: item.partNo,
        partDesc: item.partDesc,
        core: item.core,
        bin: item.bin,
        sku: item.sku,
        batchNo: item.batchNo,
        batchDate: item.batchDate,
        orderQty: item.orderQty,
        pickQty: item.pickQty,
        revisedQty: item.revisedQty,
        grnNo: item.grnNo,
        grnDate: item.grnDate,
        status: item.status,
      })) || []
    );

    setViewMode("form");
  };

  const getAllFillGrid = async () => {
    if (!formData.pickRequestDocId) {
      message.error("Pick Request ID is required");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/reversePick/getFillGridDetailsForReversePick?orgId=${orgId}&branchCode=${branchCode}&client=${client}&pickRequestDocId=${formData.pickRequestDocId}`
      );

      if (response.data.status === true) {
        setFillGridData(response.data.paramObjectsMap.fillGridDetails);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setReversePickItems([...reversePickItems, ...selectedData]);
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
                    Reverse Pick
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage Reverse Picks
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
                                style={{
                                  color: "white",
                                  width: "100%",
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                                value={
                                  formData.docDate
                                    ? dayjs(formData.docDate)
                                    : null
                                }
                                format="DD-MM-YYYY"
                                disabled
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Pick Request ID
                                </span>
                              }
                            >
                              <Select
                                value={formData.pickRequestDocId}
                                onChange={handlePickRequestSelect} // Changed to use the new function
                                style={selectStyle}
                                showSearch
                                optionFilterProp="children"
                                placeholder="Select Pick Request ID"
                              >
                                {buyerOrderNoList.map((order) => (
                                  <Option key={order.docId} value={order.docId}>
                                    {order.docId}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Pick Request Date
                                </span>
                              }
                            >
                              <DatePicker
                                style={{
                                  color: "white",
                                  width: "100%",
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                                value={
                                  formData.pickRequestDocDate
                                    ? dayjs(formData.pickRequestDocDate)
                                    : null
                                }
                                format="DD-MM-YYYY"
                                disabled
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Order No
                                </span>
                              }
                            >
                              <Input
                                value={formData.buyerOrderNo}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Order Date
                                </span>
                              }
                            >
                              <DatePicker
                                style={{
                                  color: "white",
                                  width: "100%",
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                                value={
                                  formData.buyerOrderDate
                                    ? dayjs(formData.buyerOrderDate)
                                    : null
                                }
                                format="DD-MM-YYYY"
                                disabled
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Ref No
                                </span>
                              }
                            >
                              <Input
                                value={formData.buyerRefNo}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Ref Date
                                </span>
                              }
                            >
                              <DatePicker
                                style={{
                                  color: "white",
                                  width: "100%",
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                                value={
                                  formData.buyerRefDate
                                    ? dayjs(formData.buyerRefDate)
                                    : null
                                }
                                format="DD-MM-YYYY"
                                disabled
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Status</span>
                              }
                            >
                              <Select
                                value={formData.status}
                                onChange={(value) =>
                                  setFormData({ ...formData, status: value })
                                }
                                style={selectStyle}
                                disabled={formData.freeze}
                              >
                                <Option value="Edit">Edit</Option>
                                <Option value="Confirm">Confirm</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  BO Amendment
                                </span>
                              }
                            >
                              <Select
                                value={formData.boAmendment}
                                onChange={(value) =>
                                  setFormData({
                                    ...formData,
                                    boAmendment: value,
                                  })
                                }
                                style={selectStyle}
                                disabled={formData.freeze}
                              >
                                <Option value="Yes">Yes</Option>
                                <Option value="No">No</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>In Time</span>
                              }
                            >
                              <Input
                                value={formData.inTime}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </TabPane>

                  <TabPane tab="Additional Information" key="2">
                    <div className="form-section-card">
                      <Form layout="vertical">
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Client Name
                                </span>
                              }
                            >
                              <Input
                                value={formData.clientName}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Client Short Name
                                </span>
                              }
                            >
                              <Input
                                value={formData.clientShortName}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Customer Name
                                </span>
                              }
                            >
                              <Input
                                value={formData.customerName}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Customer Short Name
                                </span>
                              }
                            >
                              <Input
                                value={formData.customerShortName}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Client Address
                                </span>
                              }
                            >
                              <TextArea
                                rows={2}
                                value={formData.clientAddress}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Customer Address
                                </span>
                              }
                            >
                              <TextArea
                                rows={2}
                                value={formData.customerAddress}
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
                          onClick={() => setReversePickItems([])}
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
                          <col style={{ width: "80px" }} /> {/* Core */}
                          <col style={{ width: "80px" }} /> {/* Bin */}
                          <col style={{ width: "100px" }} /> {/* Batch No */}
                          <col style={{ width: "100px" }} /> {/* Order Qty */}
                          <col style={{ width: "100px" }} /> {/* Pick Qty */}
                          <col style={{ width: "100px" }} /> {/* Revised Qty */}
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
                              Part No
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Part Desc
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Core
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin
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
                              Order Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Pick Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Revised Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {reversePickItems.map((item, index) => (
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
                                  style={{ color: "white" }}
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
                                <Input
                                  value={item.partNo}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Part Desc */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.partDesc}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Core */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.core}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Bin */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.bin}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Batch No */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.batchNo}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Order Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.orderQty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Pick Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.pickQty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Revised Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.revisedQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "revisedQty",
                                      e.target.value
                                    )
                                  }
                                  disabled={formData.freeze}
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

                {/* Summary Section */}
                <div className="summary-section">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label={
                          <span style={{ color: "#fff" }}>
                            Total Picked Qty
                          </span>
                        }
                      >
                        <Input
                          value={formData.totalPickedQty}
                          readOnly
                          style={readOnlyInputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label={
                          <span style={{ color: "#fff" }}>
                            Total Revised Qty
                          </span>
                        }
                      >
                        <Input
                          value={formData.totalRevisedQty}
                          readOnly
                          style={readOnlyInputStyle}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
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
                  Reverse Pick List
                </Typography.Title>
                {/* <Button
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
                  {viewMode === "form" ? "List View" : "New Reverse Pick"}
                </Button> */}
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
                <Input
                  placeholder="Search Reverse Picks..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: 300,
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                  }}
                />

                <RangePicker
                  className="white-datepicker"
                  value={
                    selectedDateRange.length > 0
                      ? [
                          dayjs(selectedDateRange[0], "DD-MM-YYYY"),
                          dayjs(selectedDateRange[1], "DD-MM-YYYY"),
                        ]
                      : null
                  }
                  onChange={(dates) => {
                    if (dates && dates.length === 2) {
                      setSelectedDateRange([
                        dates[0].format("DD-MM-YYYY"),
                        dates[1].format("DD-MM-YYYY"),
                      ]);
                    } else {
                      setSelectedDateRange([]);
                    }
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                  }}
                  placeholder={["From Date", "To Date"]}
                  format="DD-MM-YYYY"
                />

                <Button
                  icon={<DownloadOutlined />}
                  loading={downloadLoading}
                  onClick={downloadExcel}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  Download Excel
                </Button>

                <Button
                  icon={<PlusOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  Add New
                </Button>
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
                        Action
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Doc ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Doc Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Pick Request ID
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
                    </tr>
                  </thead>
                  <tbody>
                    {reversePickList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`reverse-pick-${index}-${item.id}`}
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
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() => handleEditReversePick(item)}
                              style={{ color: "white" }}
                            ></Button>
                          </td>
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
                            {item.pickRequestDocId}
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
                              className={`status-${item.status.toLowerCase()}`}
                            >
                              {item.status}
                            </span>
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
                    {Math.min(currentPage * pageSize, reversePickList.length)}{" "}
                    of {reversePickList.length} items
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
                    { length: Math.ceil(reversePickList.length / pageSize) },
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
                          Math.ceil(reversePickList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(reversePickList.length / pageSize)
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
                        Math.ceil(reversePickList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(reversePickList.length / pageSize)
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
          title="Fill Grid Details"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSaveSelectedRows}
            >
              Save Selected
            </Button>,
          ]}
          width={1000}
        >
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            style={{ marginBottom: 16 }}
          >
            Select All
          </Checkbox>

          <Table
            dataSource={fillGridData}
            columns={[
              {
                title: "Select",
                dataIndex: "select",
                key: "select",
                render: (_, record, index) => (
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
                  />
                ),
              },
              { title: "Part No", dataIndex: "partNo", key: "partNo" },
              { title: "Part Desc", dataIndex: "partDesc", key: "partDesc" },
              { title: "Bin", dataIndex: "bin", key: "bin" },
              { title: "Batch No", dataIndex: "batchNo", key: "batchNo" },
              { title: "GRN No", dataIndex: "grnNo", key: "grnNo" },
              { title: "Order Qty", dataIndex: "orderQty", key: "orderQty" },
              { title: "Pick Qty", dataIndex: "pickQty", key: "pickQty" },
            ]}
            rowKey={(record, index) => index}
            scroll={{ x: true }}
          />
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default ReversePick;
