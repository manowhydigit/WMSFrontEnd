import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import GridOnIcon from "@mui/icons-material/GridOn";
import SendIcon from "@mui/icons-material/Send";
import { Pagination } from "antd";
import sampleFile from "../assets/sample-files/Sample_Grn_Upload.xls";
import * as XLSX from "xlsx";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import { Modal, message } from "antd";

import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  SearchOutlined,
  ClearOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
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
  Divider,
} from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import dayjs from "dayjs";
import axios from "axios";
import "./PS.css";
import { showToast } from "../utils/toast-component";
import sampleGrnExcelFile from "../assets/sample-files/Sample_Grn_Upload.xls";
import { Tabs } from "antd";
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const LrTable = ({
  lrTableData,
  setLrTableData,
  partNoList,
  handleDeleteRow,
  handleTableChange,
  handlePartNoChange,
  handleBinQtyChange,
}) => {
  const columns = [
    {
      title: "Action",
      key: "action",
      fixed: "left",
      width: 80,
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() =>
            handleDeleteRow(record.id, lrTableData, setLrTableData)
          }
          danger
          type="text"
          style={{ color: "white" }}
        />
      ),
    },
    {
      title: "S.No",
      key: "sno",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "qrCode", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "LR No/HAWB No/HBL No *",
      dataIndex: "lr_Hawb_Hbl_No",
      key: "lr_Hawb_Hbl_No",
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "lr_Hawb_Hbl_No", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Inv No *",
      dataIndex: "invNo",
      key: "invNo",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "invNo", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Shipment No",
      dataIndex: "shipmentNo",
      key: "shipmentNo",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "shipmentNo", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Inv Date",
      dataIndex: "invDate",
      key: "invDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          format="DD-MM-YYYY"
          value={text ? dayjs(text, "DD-MM-YYYY") : null} // Add format here
          onChange={(date) =>
            handleTableChange(
              record.id,
              "invDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Part No *",
      dataIndex: "partNo",
      key: "partNo",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Part No"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handlePartNoChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {partNoList.map((part) => (
            <Option key={part.id} value={part.partno}>
              {part.partno}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Part Desc",
      dataIndex: "partDesc",
      key: "partDesc",
      width: 200,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Inv QTY *",
      dataIndex: "invQty",
      key: "invQty",
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "invQty", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Rec QTY",
      dataIndex: "recQty",
      key: "recQty",
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "recQty", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Short QTY",
      dataIndex: "shortQty",
      key: "shortQty",
      width: 100,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Damage QTY",
      dataIndex: "damageQty",
      key: "damageQty",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "damageQty", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "GRN QTY",
      dataIndex: "grnQty",
      key: "grnQty",
      width: 100,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Batch/Pallet No *",
      dataIndex: "batch_PalletNo",
      key: "batch_PalletNo",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "batch_PalletNo", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Batch Date",
      dataIndex: "batchDate",
      key: "batchDate",
      render: (text, record, index) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          format="DD-MM-YYYY"
          value={text ? dayjs(text, "DD-MM-YYYY") : null} // Add format here
          onChange={(date) =>
            handleTableChange(
              record.id,
              "batchDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Exp Date",
      dataIndex: "expDate",
      key: "expDate",
      render: (text, record, index) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          format="DD-MM-YYYY"
          value={text ? dayjs(text, "DD-MM-YYYY") : null} // Add format here
          onChange={(date) =>
            handleTableChange(
              record.id,
              "expDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Bin QTY *",
      dataIndex: "palletQty",
      key: "palletQty",
      width: 100,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleBinQtyChange(e, record, index)}
          style={inputStyle}
        />
      ),
    },
    {
      title: "No of Bins *",
      dataIndex: "noOfPallets",
      key: "noOfPallets",
      width: 120,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Damage Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      render: (text, record) => (
        <Select
          style={selectStyle}
          value={text}
          onChange={(value) => handleTableChange(record.id, "remarks", value)}
          disabled={!record.damageQty}
        >
          <Option value="">Select Option</Option>
          <Option value="OPTION 1">OPTION 1</Option>
          <Option value="OPTION 2">OPTION 2</Option>
          <Option value="OPTION 3">OPTION 3</Option>
        </Select>
      ),
    },
  ];

  // Styles
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

  const datePickerStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const selectStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };
};
// import {
//   default as sampleFile,
//   default as sampleGrnExcelFile,
// } from "../../../assets/sample-files/Sample_Grn_Upload.xls";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const { Option } = Select;

const GRN = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [hue1, setHue1] = useState(() => {
    const savedHue1 = localStorage.getItem("menuHue1");
    return savedHue1 !== null ? parseInt(savedHue1) : 260;
  });
  const [hue2, setHue2] = useState(() => {
    const savedHue2 = localStorage.getItem("menuHue2");
    return savedHue2 !== null ? parseInt(savedHue2) : 160;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [performanceGoalsData, setPerformanceGoalsData] = useState([]);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginUserId, setLoginUserId] = useState(
    localStorage.getItem("userId")
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

  const [isLoadingGatePass, setIsLoadingGatePass] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [modeOfShipmentList, setModeOfShipmentList] = useState([]);
  const [carrierList, setCarrierList] = useState([]);
  const [gatePassIdList, setGatePassIdList] = useState([]);
  const [binTypeList, setBinTypeList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [gatePassIdEdit, setGatePassIdEdit] = useState("");
  const [editDocDate, setEditDocDate] = useState(dayjs());
  const [enableGatePassFields, setEnableGatePassFields] = useState(false);
  const [noDataFound, setnoDataFound] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    editDocDate: dayjs(),
    grnType: "GRN",
    entrySlNo: "",
    date: dayjs(),
    tax: "",
    grnType: "",
    gatePassId: "",
    gatePassDate: null,
    grnDate: dayjs(),
    customerPo: "",
    vas: false,
    supplierShortName: "",
    supplier: "",
    billOfEntry: "",
    capacity: "",
    modeOfShipment: "",
    carrier: "",
    vesselNo: "",
    hsnNo: "",
    vehicleType: "",
    contact: "",
    sealNo: "",
    lrNo: "",
    driverName: "",
    securityName: "",
    containerNo: "",
    lrDate: dayjs(),
    goodsDesc: "",
    vehicleNo: "",
    vesselDetails: "",
    lotNo: "",
    destinationFrom: "",
    destinationTo: "",
    noOfPallets: "",
    invoiceNo: "",
    noOfPacks: "",
    totAmt: "",
    totGrnQty: "",
    freeze: false,
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: new Date(),
    grnType: "",
    entrySlNo: "",
    date: null,
    tax: "",
    gatePassId: "",
    gatePassDate: null,
    grnDate: null,
    customerPo: "",
    vas: false,
    supplierShortName: "",
    supplier: "",
    billOfEntry: "",
    capacity: "",
    modeOfShipment: "",
    carrier: "",
    vesselNo: "",
    hsnNo: "",
    vehicleType: "",
    contact: "",
    sealNo: "",
    lrNo: "",
    driverName: "",
    securityName: "",
    containerNo: "",
    lrDate: null,
    goodsDesc: "",
    vehicleNo: "",
    vesselDetails: "",
    lotNo: "",
    destinationFrom: "",
    destinationTo: "",
    noOfPallets: "",
    invoiceNo: "",
    noOfPacks: "",
    totAmt: "",
    totGrnQty: "",
    remarks: "",
  });

  const [lrTableData, setLrTableData] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [lrTableErrors, setLrTableErrors] = useState([]);

  const lrNoDetailsRefs = useRef([]);

  const [value, setValue] = useState(0);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  const paginatedData = listViewData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [grnType, setGrnType] = useState(""); // Add this state for GRN Type

  const listViewColumns = [
    { accessorKey: "grnDate", header: "GRN Date", size: 140 },
    { accessorKey: "docId", header: "GRN No", size: 140 },
    { accessorKey: "gatePassId", header: "Gate Pass Id", size: 140 },
    { accessorKey: "supplier", header: "Supplier", size: 140 },
    { accessorKey: "totalGrnQty", header: "GRN QTY", size: 140 },
  ];

  // Add these improved date functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;

    try {
      // Handle various date formats
      let date;

      if (typeof dateString === "string") {
        // Try different date formats
        if (dateString.includes("-")) {
          const parts = dateString.split("-");
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            date = dayjs(dateString, "YYYY-MM-DD");
          } else if (parts[0].length === 2) {
            // DD-MM-YYYY format
            date = dayjs(dateString, "DD-MM-YYYY");
          }
        } else {
          // Try parsing as ISO string
          date = dayjs(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dayjs(dateString);
      } else if (dayjs.isDayjs(dateString)) {
        date = dateString;
      }

      return date && date.isValid() ? date.format("DD-MM-YYYY") : null;
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return null;
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 4
      ) {
        return dateString;
      }

      // Convert from DD-MM-YYYY to YYYY-MM-DD
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 2
      ) {
        const date = dayjs(dateString, "DD-MM-YYYY");
        return date.isValid() ? date.format("YYYY-MM-DD") : null;
      }

      // Handle dayjs objects
      if (dayjs.isDayjs(dateString)) {
        return dateString.format("YYYY-MM-DD");
      }

      return null;
    } catch (error) {
      console.warn("Date API conversion error:", error, dateString);
      return null;
    }
  };

  // Update the handleDateChange function
  const handleDateChange = (field, date) => {
    const formattedDate = date ? date.format("DD-MM-YYYY") : null;
    setFormData({ ...formData, [field]: formattedDate });
  };

  // Update the handleTableChange function for date fields
  const handleTableChange = (id, field, value) => {
    // For date fields, ensure we're storing in DD-MM-YYYY format
    if (["invDate", "batchDate", "expDate"].includes(field)) {
      if (value && dayjs(value).isValid()) {
        value = dayjs(value).format("DD-MM-YYYY");
      }
    }

    setLrTableData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Theme configuration
  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };

  const handleGrnTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      grnType: value,
      gatePassId: "", // Clear gate pass ID when changing GRN type
    }));

    // If GRN Type is "GATE PASS", fetch the gate pass IDs
    if (value === "GATE PASS") {
      getAllGatePassId();
    } else {
      // Clear the gate pass list if not GATE PASS
      setGatePassIdList([]);
    }
  };

  // Get new GRN document ID
  const getNewGrnDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getGRNDocid?branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      if (response.data && response.data.paramObjectsMap) {
        setFormData((prevData) => ({
          ...prevData,
          docId: response.data.paramObjectsMap.grnDocid || "", // Use empty string if null
        }));
      }
    } catch (error) {
      console.error("Error fetching GRN document ID:", error);
    }
  };

  // Get all gate pass IDs
  const getAllGatePassId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getGatePassInNoForPedningGRN?branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );

      if (response.data && response.data.paramObjectsMap) {
        const gatePassList = response.data.paramObjectsMap.gatePassInVO || [];

        // Make sure each gate pass object has both docId and id
        const validGatePassList = gatePassList.filter(
          (gp) => gp.id && gp.docId
        );

        setGatePassIdList(validGatePassList);

        if (validGatePassList.length === 0) {
          showToast("info", "No pending gate passes found");
        }
      } else {
        setGatePassIdList([]);
        showToast("warning", "No gate pass data available");
      }
    } catch (error) {
      console.error("Error fetching gate passes:", error);
      setGatePassIdList([]);
      showToast("error", "Failed to fetch gate passes");
    }
  };

  // Get all suppliers
  const getAllSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/supplier?cbranch=${loginBranch}&client=${loginClient}&orgid=${orgId}`
      );

      // Check response.data.status instead of response.status
      if (response.data?.status) {
        // Sort carriers by ID in descending order (highest ID first)
        const sortedSupplier = (
          response.data.paramObjectsMap.supplierVO || []
        ).sort((a, b) => b.id - a.id);
        setSupplierList(sortedSupplier);
      } else {
        showToast("warning", "No supplier data found");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showToast("error", "Error", "Failed to fetch suppliers");
    }
  };

  // Get all modes of shipment
  const getAllModesOfShipment = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/getAllModeOfShipment?orgId=${orgId}`
      );
      setModeOfShipmentList(response.data.paramObjectsMap.modOfShipments);
    } catch (error) {
      console.error("Error fetching modes of shipment:", error);
    }
  };

  // Get all carriers
  const getAllCarriers = async (selectedModeOfShipment) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getCarrierNameByCustomer?cbranch=${loginBranch}&client=${loginClient}&orgid=${orgId}&shipmentMode=${selectedModeOfShipment}`
      );
      setCarrierList(response.data.paramObjectsMap.CarrierVO);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  // Get all part numbers
  const getAllPartNo = async () => {
    try {
      // Validate required parameters
      if (!loginBranchCode || !loginClient || !orgId) {
        throw new Error(
          "Missing required parameters (branch, client, or orgId)"
        );
      }

      // Make the API request with proper parameter casing (orgid vs orgId)
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/material`,
        {
          params: {
            cbranch: loginBranchCode,
            client: loginClient,
            orgid: orgId, // Note: using 'orgid' as it appears in your working endpoint
          },
        }
      );

      // Check response structure and status
      if (!response.data?.paramObjectsMap?.materialVO) {
        throw new Error("Invalid response structure from API");
      }

      // Transform the data for easier use in your application
      const partNos = response.data.paramObjectsMap.materialVO
        .filter((item) => item.partno) // Only include items with part numbers
        .map((item) => ({
          id: item.id,
          partNo: item.partno,
          description: item.partDesc,
          sku: item.sku,
          unit: item.purchaseUnit,
          barcode: item.barcode,
          // Include other relevant fields
          ...item,
        }));

      setPartNoList(partNos);

      return partNos; // Optional: return the data if needed elsewhere
    } catch (error) {
      console.error("Error fetching part numbers:", error);

      // User-friendly error handling
      let errorMessage = "Failed to load part numbers";
      if (error.response) {
        errorMessage =
          error.response.data?.paramObjectsMap?.message ||
          `Server responded with ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error notification
      notification.error({
        message: "Error",
        description: errorMessage,
        duration: 5,
      });

      setPartNoList([]); // Reset or maintain previous state as needed
      throw error; // Re-throw if you want calling code to handle it
    }
  };

  // Get all GRNs

  const getAllGrns = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getAllGrn?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      const grnData = response?.data?.paramObjectsMap.grnVO || [];
      setListViewData(grnData);
    } catch (error) {
      console.error("Error fetching GRN data:", error);
      setListViewData([]);
    }
  };
  // Function to fetch and populate data based on selected Gate Pass ID
  // Update the handleGatePassIdChange function to properly handle dates
  // Update the handleGatePassIdChange function to properly set all the date fields
  const handleGatePassIdChange = async (gatePassId) => {
    if (!gatePassId) return;

    setIsLoadingGatePass(true);
    try {
      const selectedGatePass = gatePassIdList.find(
        (gp) => gp.docId === gatePassId
      );

      if (!selectedGatePass || !selectedGatePass.id) {
        showToast("error", "Invalid gate pass selection");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        gatePassId: gatePassId,
      }));

      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn/${selectedGatePass.id}`
      );

      if (response.data && response.data.status === true) {
        const gatePassData = response.data.paramObjectsMap.GatePassIn;

        // Use the improved formatDateForDisplay function instead of parseAndFormatDate
        // Populate form data with properly formatted dates
        setFormData((prev) => ({
          ...prev,
          docId: gatePassData.docId || "",
          docDate:
            formatDateForDisplay(gatePassData.docdate) ||
            dayjs().format("DD-MM-YYYY"),
          entrySlNo: gatePassData.entryNo || "",
          date:
            formatDateForDisplay(gatePassData.entryDate) ||
            dayjs().format("DD-MM-YYYY"),
          gatePassDate:
            formatDateForDisplay(gatePassData.docdate) ||
            dayjs().format("DD-MM-YYYY"),
          supplierShortName: gatePassData.supplierShortName || "",
          supplier: gatePassData.supplier || "",
          modeOfShipment: gatePassData.modeOfShipment || "",
          carrier: gatePassData.carrier || "",
          vehicleType: gatePassData.vehicleType || "",
          contact: gatePassData.contact || "",
          driverName: gatePassData.driverName || "",
          securityName: gatePassData.securityName || "",
          vehicleNo: gatePassData.vehicleNo || "",
          goodsDesc: gatePassData.goodsDescription || "",
          lotNo: gatePassData.lotNo || "",
          freeze: gatePassData.freeze || false,
        }));

        // Populate table data with properly formatted dates using formatDateForDisplay
        if (
          gatePassData.gatePassDetailsVO &&
          gatePassData.gatePassDetailsVO.length > 0
        ) {
          const tableData = gatePassData.gatePassDetailsVO.map(
            (detail, index) => ({
              id: detail.id || Date.now() + index,
              qrCode: "",
              lr_Hawb_Hbl_No: detail.irNoHaw || "",
              invNo: detail.invoiceNo || "",
              invDate: formatDateForDisplay(detail.invoiceDate),
              partNo: detail.partNo || "",
              partDesc: detail.partDescription || "",
              sku: detail.sku || "",
              invQty: detail.invQty?.toString() || "0",
              recQty: detail.recQty?.toString() || "0",
              shortQty: detail.shortQty?.toString() || "0",
              damageQty: detail.damageQty?.toString() || "0",
              grnQty: detail.grnQty?.toString() || "0",
              batch_PalletNo: detail.batchNo || "",
              batchDate: formatDateForDisplay(detail.batchDate),
              expDate: formatDateForDisplay(detail.expDate),
              palletQty: "",
              noOfPallets: "",
              remarks: detail.remarks || "",
            })
          );
          setLrTableData(tableData);
        }

        if (gatePassData.modeOfShipment) {
          getAllCarriers(gatePassData.modeOfShipment);
        }

        showToast("success", "Gate pass data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching gate pass details:", error);
      showToast("error", "Failed to load gate pass details");
    } finally {
      setIsLoadingGatePass(false);
    }
  };

  // Get GRN by ID
  // Utility function for safe date formatting
  const safeFormatDateForDisplay = (date) => {
    if (!date) return "";

    // Handle string dates, Date objects, and timestamps
    try {
      // If it's already a valid date string in display format, return as is
      if (typeof date === "string" && date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        return date;
      }

      // Convert to Date object if it's a string or timestamp
      const dateObj = new Date(date);

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date:", date);
        return "";
      }

      // Format the date (adjust this based on your formatDateForDisplay implementation)
      return dateObj.toLocaleDateString("en-GB"); // DD-MM-YYYY format
    } catch (error) {
      console.warn("Date formatting error:", error, "for date:", date);
      return "";
    }
  };

  const getGrnById = async (row) => {
    console.log("THE SELECTED GRN ID IS:", row.id);
    setEditId(row.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getGrnById?id=${row.id}`
      );
      console.log("API Response:", response);

      if (response.data && response.data.status === true) {
        setViewMode("form");
        setListView(false);
        const particularGrn = response.data.paramObjectsMap.Grn;
        setGatePassIdEdit(particularGrn.docId);

        setFormData({
          docId: particularGrn.docId,
          editDocDate: formatDateForDisplay(particularGrn.docdate),
          docDate: formatDateForDisplay(particularGrn.docDate),
          entrySlNo: particularGrn.entryNo,
          date: formatDateForDisplay(particularGrn.entryDate),
          gatePassId: particularGrn.docId,
          gatePassDate: formatDateForDisplay(particularGrn.gatePassDate),
          grnDate: formatDateForDisplay(particularGrn.grnDate),
          customerPo: particularGrn.customerPo,
          vas: particularGrn.vas === true ? true : false,
          supplierShortName: particularGrn.supplierShortName,
          supplier: particularGrn.supplier,
          billOfEntry: particularGrn.billOfEnrtyNo,
          capacity: particularGrn.capacity,
          modeOfShipment: particularGrn.modeOfShipment,
          vesselNo: particularGrn.vesselNo,
          hsnNo: particularGrn.hsnNo,
          vehicleType: particularGrn.vehicleType,
          contact: particularGrn.contact,
          sealNo: particularGrn.sealNo,
          lrNo: particularGrn.lrNo,
          driverName: particularGrn.driverName,
          securityName: particularGrn.securityName,
          containerNo: particularGrn.containerNo,
          lrDate: formatDateForDisplay(particularGrn.lrDate),
          goodsDesc: particularGrn.goodsDescripition,
          vehicleNo: particularGrn.vehicleNo,
          vesselDetails: particularGrn.vesselDetails,
          lotNo: particularGrn.lotNo,
          destinationFrom: particularGrn.destinationFrom,
          destinationTo: particularGrn.destinationTo,
          noOfPallets: particularGrn.noOfBins,
          invoiceNo: particularGrn.invoiceNo,
          noOfPacks: particularGrn.noOfPacks,
          totAmt: particularGrn.totAmt,
          totGrnQty: particularGrn.totalGrnQty,

          freeze: particularGrn.freeze !== null ? particularGrn.freeze : false,
          remarks: particularGrn.remarks,
        });
        getAllCarriers(particularGrn.modeOfShipment);
        setFormData((prevData) => ({
          ...prevData,
          carrier: particularGrn.carrier.toUpperCase(),
        }));

        setLrTableData(
          particularGrn.grnDetailsVO.map((row) => ({
            id: row.id,
            qrCode: row.qrCode,
            lr_Hawb_Hbl_No: row.lrNoHawbNo,
            invNo: row.invoiceNo,
            shipmentNo: row.shipmentNo,
            invDate: formatDateForDisplay(row.invoiceDate),
            partNo: row.partNo,
            partDesc: row.partDesc,
            sku: row.sku,
            invQty: row.invQty,
            recQty: row.recQty,
            damageQty: row.damageQty,
            grnQty: row.grnQty,
            subStockQty: row.subStockQty,
            batch_PalletNo: row.batchNo,
            batchDate: formatDateForDisplay(row.batchDate),
            expDate: formatDateForDisplay(row.expDate),
            shortQty: row.shortQty,
            damageQty: row.damageQty,
            palletQty: row.binQty,
            noOfPallets: row.noOfBins,
            pkgs: row.pkgs,
            weight: row.weight,
            mrp: row.mrp,
            amt: row.amt,
            batchQty: 0,
            rate: 0,
            binType: "abc",
          }))
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Get gate pass grid details by gate pass ID
  const getGatePassGridDetailsByGatePassId = async (selectedGatePassId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/grn/getGatePassInDetailsForPendingGRN?branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&gatePassDocId=${formData.gatePassId}&orgId=${orgId}`
      );
      console.log("THE GATE PASS IDS GRID DETAILS IS:", response);
      if (response.status === true) {
        const gridDetails = response.paramObjectsMap.gatePassInVO;
        console.log("THE PALLET DETAILS ARE:", gridDetails);

        setLrTableData(
          gridDetails.map((row) => ({
            id: row.id,
            lr_Hawb_Hbl_No: row.lrNoHaw,
            invNo: row.invoiceNo,
            invDate: row.invoiceDate
              ? dayjs(row.invoiceDate).format("YYYY-MM-DD")
              : null,
            batchDate: row.batchDate
              ? dayjs(row.batchDate).format("YYYY-MM-DD")
              : null,
            expDate: row.expDate
              ? dayjs(row.expDate).format("YYYY-MM-DD")
              : null,
            partNo: row.partNo,
            partDesc: row.partDesc,
            sku: row.sku,
            invQty: row.invQty,
            recQty: row.recQty,
            shortQty: row.shortQty,
            damageQty: row.damageQty,
            grnQty: row.genQty,
            invoiceDate: row.invoiceDate,
            partNo: row.partNo,
            partDesc: row.partDesc,
            sku: row.sku,
            invQty: row.invQty,
            recQty: row.recQty,
            shortQty: row.shortQty,
            weight: row.weight,
            batch_PalletNo: row.batchNo,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    getNewGrnDocId();
    getAllGatePassId();
    getAllSuppliers();
    getAllModesOfShipment();
    getAllPartNo();
    getAllGrns();
  }, []);

  // Calculate total GRN quantity when table data changes
  useEffect(() => {
    const totalQty = lrTableData.reduce(
      (sum, row) => sum + (parseInt(row.grnQty, 10) || 0),
      0
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      totGrnQty: totalQty,
    }));
  }, [lrTableData]);

  // Format the data for Excel export
  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0].format("YYYY-MM-DD");
      const toDate = selectedDateRange[1].format("YYYY-MM-DD");

      // Fetch GRN data from the correct API endpoint
      const response = await axios.get(
        `${API_URL}/api/grn/getAllGrn?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      if (response.data.status && response.data.paramObjectsMap.grnVO) {
        const allGrnData = response.data.paramObjectsMap.grnVO;

        // Filter data based on the selected date range
        const filteredGrnData = allGrnData.filter((item) => {
          // Convert the date string to a format that can be compared
          let itemDate;
          if (item.grnDate) {
            // Handle different date formats that might come from the API
            if (item.grnDate.includes("-")) {
              const parts = item.grnDate.split("-");
              if (parts[0].length === 4) {
                // YYYY-MM-DD format
                itemDate = item.grnDate;
              } else if (parts[0].length === 2) {
                // DD-MM-YYYY format, convert to YYYY-MM-DD
                itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            } else {
              // If it's a timestamp or other format, try to parse it
              itemDate = dayjs(item.grnDate).format("YYYY-MM-DD");
            }
          }

          return itemDate && itemDate >= fromDate && itemDate <= toDate;
        });

        if (filteredGrnData.length > 0) {
          // Format filtered data for Excel
          const excelData = formatDataForExcel(filteredGrnData);

          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, "GRN Data");

          // Generate Excel file and download
          XLSX.writeFile(wb, `GRN_${fromDate}_to_${toDate}.xlsx`);

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

  // Format the data for Excel export
  const formatDataForExcel = (grnData) => {
    const excelData = [];

    grnData.forEach((mainRecord) => {
      if (mainRecord.grnDetailsVO && mainRecord.grnDetailsVO.length > 0) {
        // Create a row for each detail record
        mainRecord.grnDetailsVO.forEach((detail) => {
          excelData.push({
            "Document ID": mainRecord.docId,
            "Document Date": formatDateForDisplay(mainRecord.docdate),
            "GRN Date": formatDateForDisplay(mainRecord.grnDate),
            "Entry No": mainRecord.entryNo,
            "Gate Pass ID": mainRecord.gatePassId,
            Supplier: mainRecord.supplier,
            "Supplier Short Name": mainRecord.supplierShortName,
            "Mode of Shipment": mainRecord.modeOfShipment,
            Carrier: mainRecord.carrier,
            "E-Way Bill": mainRecord.billOfEnrtyNo,
            "LR No/HAWB No": detail.lrNoHawbNo,
            "Invoice No": detail.invoiceNo,
            "Invoice Date": formatDateForDisplay(detail.invoiceDate),
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            SKU: detail.sku,
            "Invoice Qty": detail.invQty,
            "Received Qty": detail.recQty,
            "Short Qty": detail.shortQty,
            "Damage Qty": detail.damageQty,
            "GRN Qty": detail.grnQty,
            "Batch/Pallet No": detail.batchNo,
            "Batch Date": formatDateForDisplay(detail.batchDt),
            "Expiry Date": formatDateForDisplay(detail.expdate),
            "Bin Qty": detail.binQty,
            "No of Bins": detail.noOfBins,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
            Remarks: mainRecord.remarks,
          });
        });
      } else {
        // Create a row even if there are no details
        excelData.push({
          "Document ID": mainRecord.docId,
          "Document Date": formatDateForDisplay(mainRecord.docdate),
          "GRN Date": formatDateForDisplay(mainRecord.grnDate),
          "Entry No": mainRecord.entryNo,
          "Gate Pass ID": mainRecord.gatePassId,
          Supplier: mainRecord.supplier,
          "Supplier Short Name": mainRecord.supplierShortName,
          "Mode of Shipment": mainRecord.modeOfShipment,
          Carrier: mainRecord.carrier,
          "E-Way Bill": mainRecord.billOfEnrtyNo,
          "LR No/HAWB No": "",
          "Invoice No": "",
          "Invoice Date": "",
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "Invoice Qty": "",
          "Received Qty": "",
          "Short Qty": "",
          "Damage Qty": "",
          "GRN Qty": "",
          "Batch/Pallet No": "",
          "Batch Date": "",
          "Expiry Date": "",
          "Bin Qty": "",
          "No of Bins": "",
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
          Remarks: mainRecord.remarks,
        });
      }
    });

    return excelData;
  };

  // Update refs when table data changes
  useEffect(() => {
    lrNoDetailsRefs.current = lrTableData.map((_, index) => ({
      lr_Hawb_Hbl_No:
        lrNoDetailsRefs.current[index]?.lr_Hawb_Hbl_No || React.createRef(),
      invNo: lrNoDetailsRefs.current[index]?.invNo || React.createRef(),
      partNo: lrNoDetailsRefs.current[index]?.partNo || React.createRef(),
      invQty: lrNoDetailsRefs.current[index]?.invQty || React.createRef(),
      palletQty: lrNoDetailsRefs.current[index]?.palletQty || React.createRef(),
      noOfPallets:
        lrNoDetailsRefs.current[index]?.noOfPallets || React.createRef(),
    }));
  }, [lrTableData]);

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllGrns();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  // Add this function to handle Entry No changes and fetch data
  const handleEntryNoChange = async (value) => {
    if (!value) return;

    try {
      setLoading(true);

      // Fetch entry details
      const entryResponse = await axios.get(
        `${API_URL}/api/gatePassIn/getEntryNoDetails?branchCode=${loginBranchCode}&client=${loginClient}&entryNo=${value}&finYear=${loginFinYear}&orgId=${orgId}`
      );

      if (
        entryResponse.data.status &&
        entryResponse.data.paramObjectsMap.entryNoDetails
      ) {
        const entryDetails =
          entryResponse.data.paramObjectsMap.entryNoDetails[0];

        // Update form with entry details
        setFormData((prev) => ({
          ...prev,
          supplierShortName: entryDetails.supplierShortName || "",
          supplier: entryDetails.supplier || "",
          modeOfShipment: entryDetails.modeOfShipment || "",
          carrier: entryDetails.carrierShortName || "",
        }));

        // Fetch carrier list based on mode of shipment
        if (entryDetails.modeOfShipment) {
          getAllCarriers(entryDetails.modeOfShipment);
        }

        // Fetch fill details for the grid
        const fillResponse = await axios.get(
          `${API_URL}/api/gatePassIn/getEntryNoFillDetails?branchCode=${loginBranchCode}&client=${loginClient}&entryNo=${value}&finYear=${loginFinYear}&orgId=${orgId}`
        );

        if (
          fillResponse.data.status &&
          fillResponse.data.paramObjectsMap.entryNoFillDetails
        ) {
          const fillDetails =
            fillResponse.data.paramObjectsMap.entryNoFillDetails;

          // Transform fill details to match table structure
          const tableData = fillDetails.map((detail, index) => ({
            id: index + 1,
            qrCode: "",
            lr_Hawb_Hbl_No: detail.irNoHaw || "",
            invNo: detail.invoiceNo || "",
            invDate: detail.invoiceDate || null,
            partNo: detail.partNo || "",
            partDesc: detail.partDesc || "",
            sku: detail.sku || "",
            invQty: detail.invQty?.toString() || "0",
            recQty: detail.recQty?.toString() || "0",
            shortQty: detail.shortQty?.toString() || "0",
            damageQty: detail.damageQty?.toString() || "0",
            grnQty: detail.grnQty?.toString() || "0",
            batch_PalletNo: detail.batchNo || "",
            batchDate: detail.batchDate || null,
            expDate: detail.expDate || null,
            remarks: "",
          }));

          setLrTableData(tableData);
        }
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
      showToast("error", "Failed to fetch entry details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;

    let errorMessage = "";
    let updatedValue = value.toUpperCase();

    switch (name) {
      case "docCode":
      case "capacity":
      case "vesselNo":
      case "hsnNo":
        if (!alphaNumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        }
        break;
      case "driverName":
      case "securityName":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabets are allowed";
        }
        break;
      case "contact":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid mobile format";
        }
        updatedValue = value.slice(0, 10);
        break;
      case "noOfPallets":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numeric characters are allowed";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === "grnType") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
        }));
        setEnableGatePassFields(updatedValue === "GATE PASS");
      } else if (name === "gatePassId") {
        const selectedId = gatePassIdList.find((id) => id.docId === value);
        if (selectedId) {
          setFormData((prevData) => ({
            ...prevData,
            gatePassId: selectedId.docId,
            entrySlNo: selectedId.entryNo,
            gatePassDate: dayjs(selectedId.docDate).format("YYYY-MM-DD"),
            supplierShortName: selectedId.supplier,
            supplier: selectedId.supplierShortName,
            modeOfShipment: selectedId.modeOfShipment.toUpperCase(),
            vehicleType: selectedId.vehicleType.toUpperCase(),
            contact: selectedId.contact,
            driverName: selectedId.driverName,
            securityName: selectedId.securityName,
            lrDate: dayjs(selectedId.lrDate).format("YYYY-MM-DD"),
            goodsDesc: selectedId.goodsDescription,
            vehicleNo: selectedId.vehicleNo,
            lotNo: selectedId.lotNo,
          }));
          getAllCarriers(selectedId.modeOfShipment);
          setFormData((prevData) => ({
            ...prevData,
            carrier: selectedId.carrier.toUpperCase(),
          }));
          console.log("THE SELECTED GATEPASS ID IS:", selectedId.docId);

          getGatePassGridDetailsByGatePassId(selectedId.docId);
        }
      } else if (name === "supplierShortName") {
        const selectedName = supplierList.find(
          (supplier) => supplier.supplierShortName === updatedValue
        );
        if (selectedName) {
          setFormData((prevData) => ({
            ...prevData,
            supplierShortName: selectedName.supplierShortName,
            supplier: selectedName.supplier,
          }));
        }
      } else if (name === "modeOfShipment") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
        }));
        getAllCarriers(updatedValue);
      } else if (name === "vas") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
        }));
      }

      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      setTimeout(() => {
        const inputElement = document.querySelector(`[name=${name}]`);
        if (inputElement) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      grnType: "GRN",
      entrySlNo: "",
      date: dayjs(),
      grnType: "", // Reset GRN type
      gatePassId: "", // Reset gate pass ID
      tax: "",
      vehicleDetails: "",
      gatePassDate: null,
      grnDate: dayjs(),
      customerPo: "",
      vas: false,
      supplierShortName: "",
      supplier: "",
      billOfEntry: "",
      capacity: "",
      modeOfShipment: "",
      carrier: "",
      vesselNo: "",
      hsnNo: "",
      vehicleType: "",
      contact: "",
      sealNo: "",
      lrNo: "",
      driverName: "",
      securityName: "",
      containerNo: "",
      lrDate: dayjs(),
      goodsDesc: "",
      vehicleNo: "",
      vesselDetails: "",
      lotNo: "",
      destinationFrom: "",
      destinationTo: "",
      noOfPallets: "",
      invoiceNo: "",
      noOfPacks: "",
      totAmt: "",
      totGrnQty: "",
      remarks: "",
    });
    setFieldErrors({
      docDate: "",
      grnType: "",
      entrySlNo: "",
      date: "",
      tax: "",
      gatePassId: "",
      gatePassDate: "",
      grnDate: null,
      customerPo: "",
      vas: false,
      supplierShortName: "",
      supplier: "",
      billOfEntry: "",
      capacity: "",
      modeOfShipment: "",
      carrier: "",
      vesselNo: "",
      hsnNo: "",
      vehicleType: "",
      contact: "",
      sealNo: "",
      lrNo: "",
      driverName: "",
      securityName: "",
      containerNo: "",
      lrDate: null,
      goodsDesc: "",
      vehicleNo: "",
      vesselDetails: "",
      lotNo: "",
      destinationFrom: "",
      destinationTo: "",
      noOfPallets: "",
      invoiceNo: "",
      noOfPacks: "",
      totAmt: "",
      totGrnQty: "",
      remarks: "",
    });
    getNewGrnDocId();
    setEditId("");
    setLrTableData([]);
    setLrTableErrors([]);
  };

  const handleTableClear = (table) => {
    if (table === "lrTableData") {
      setLrTableData([]);
      setLrTableErrors([]);
    }
  };

  const handleSave = async () => {
    if (loading) return;
    console.log("Save button clicked"); // Debug log

    const errors = {};
    let firstInvalidFieldRef = null;

    // Validate form fields
    if (!formData.grnDate) errors.grnDate = "GRN Date is required";
    if (!formData.billOfEntry) errors.billOfEntry = "E-way Bill is required";
    if (!formData.supplierShortName)
      errors.supplierShortName = "Supplier Short Name is required";
    if (!formData.modeOfShipment)
      errors.modeOfShipment = "Mode of Shipment is required";
    if (!formData.carrier) errors.carrier = "Carrier is required";

    // If validation passes, proceed with saving
    setIsLoading(true);

    try {
      const lrVo = lrTableData.map((row) => ({
        ...(editId && { id: row.id }),
        qrCode: row.qrCode || "",
        lrNoHawbNo: row.lr_Hawb_Hbl_No || "",
        invoiceNo: row.invNo || "",
        shipmentNo: row.shipmentNo || "",
        invoiceDate: row.invDate ? formatDateForAPI(row.invDate) : null,
        partNo: row.partNo || "",
        partDesc: row.partDesc || "",
        sku: row.sku || "",
        invQty: parseInt(row.invQty) || 0,
        recQty: parseInt(row.recQty) || 0,
        damageQty: parseInt(row.damageQty) || 0,
        subStockQty: parseInt(row.subStockQty) || 0,
        batchNo: row.batch_PalletNo || "",
        batchDt: row.batchDate ? formatDateForAPI(row.batchDate) : null,
        expdate: row.expDate ? formatDateForAPI(row.expDate) : null,
        binQty: parseInt(row.palletQty) || 0,
        noOfBins: parseInt(row.noOfPallets) || 0,
        pkgs: parseInt(row.pkgs) || 0,
        weight: parseFloat(row.weight) || 0,
        mrp: parseFloat(row.mrp) || 0,
        amount: parseFloat(row.amt) || 0,
        batchQty: 0,
        rate: 0,
        binType: "RACK STORAGE",
        freeze: row.freeze || false,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        entryNo: formData.entrySlNo || "",
        entryDate: formData.date ? formatDateForAPI(formData.date) : null,
        gatePassId: editId ? gatePassIdEdit : formData.gatePassId || "",
        gatePassDate: formData.gatePassDate
          ? formatDateForAPI(formData.gatePassDate)
          : null,
        grnDate: formData.grnDate ? formatDateForAPI(formData.grnDate) : null,
        customerPo: formData.customerPo || "",
        vas: formData.vas || false,
        supplierShortName: formData.supplierShortName || "",
        supplier: formData.supplier || "",
        billOfEnrtyNo: formData.billOfEntry || "",
        modeOfShipment: formData.modeOfShipment || "",
        carrier: formData.carrier || "",
        vesselNo: formData.vesselNo || "",
        hsnNo: formData.hsnNo || "",
        vehicleType: formData.vehicleType || "",
        contact: formData.contact || "",
        sealNo: formData.sealNo || "",
        lrNo: formData.lrNo || "",
        driverName: formData.driverName || "",
        securityName: formData.securityName || "",
        containerNo: formData.containerNo || "",
        lrDate: formData.lrDate ? formatDateForAPI(formData.lrDate) : null,
        goodsDescripition: formData.goodsDesc || "",
        vehicleNo: formData.vehicleNo || "",
        vesselDetails: formData.vesselDetails || "",
        lotNo: formData.lotNo || "",
        destinationFrom: formData.destinationFrom || "",
        destinationTo: formData.destinationTo || "",
        noOfBins: parseInt(formData.noOfPallets) || 0,
        invoiceNo: formData.invoiceNo || "",
        orgId: orgId,
        createdBy: loginUserName,
        grnDetailsDTO: lrVo,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        fifoFlag: "abc",
        vehicleDetails: "abc",
        freeze: false,
      };

      console.log("DATA TO SAVE IS:", saveFormData);

      const response = await axios.put(
        `${API_URL}/api/grn/createUpdateGRN`,
        saveFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response);

      if (response.data && response.data.status === true) {
        showToast(
          "success",
          editId ? "GRN Updated Successfully" : "GRN created successfully"
        );
        handleClear();
        getAllGrns();
      } else {
        const errorMessage =
          response.data?.paramObjectsMap?.errorMessage ||
          response.data?.message ||
          "GRN creation failed";
        showToast("error", errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "GRN creation failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.paramObjectsMap?.errorMessage ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      }

      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePartNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedPartNo = partNoList.find((p) => p.partno === value);
    setLrTableData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPartNo ? selectedPartNo.partDesc : "",
              sku: selectedPartNo ? selectedPartNo.sku : "",
            }
          : r
      )
    );
    setLrTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        partNo: !value ? "Part No is required" : "",
      };
      return newErrors;
    });
  };

  const handleSampleExcelDownload = () => {
    const link = document.createElement("a");
    link.href = sampleGrnExcelFile;
    link.download = "sample_GRN.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true); // Open dialog
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false); // Close dialog
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    handleBulkUploadClose();
  };

  const handleBinQtyChange = (event, row, index) => {
    const value = event.target.value;
    const maxPalletQty = row.grnQty || 0;
    const intPattern = /^\d*$/;

    if (value === "") {
      setLrTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, palletQty: value, noOfBin: "" } : r
        )
      );
      setLrTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          palletQty: "Bin Qty is required",
        };
        return newErrors;
      });
    } else if (!intPattern.test(value)) {
      setLrTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          palletQty: "Only numbers are allowed",
        };
        return newErrors;
      });
    } else if (Number(value) <= 0) {
      setLrTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          palletQty: "Bin Qty must be greater than zero",
        };
        return newErrors;
      });
    } else if (Number(value) > maxPalletQty) {
      setLrTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          palletQty: `Pallet Qty cannot exceed ${maxPalletQty}`,
        };
        return newErrors;
      });
    } else {
      const noOfBin = Math.ceil(maxPalletQty / Number(value));

      setLrTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, palletQty: value, noOfPallets: noOfBin } : r
        )
      );
      setLrTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], palletQty: "" };
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === "Tab" && row.id === table[table.length - 1].id) {
      e.preventDefault();

      handleAddRow();
    }
  };

  // Add this function definition with other handler functions

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      qrCode: "",
      lr_Hawb_Hbl_No: "",
      invNo: "",
      shipmentNo: "",
      invDate: null,
      partNo: "",
      partDesc: "",
      sku: "",
      invQty: "",
      recQty: "",
      shortQty: "",
      damageQty: "",
      grnQty: "",
      subStockQty: "",
      batch_PalletNo: "",
      batchDate: null,
      expDate: null,
      palletQty: "",
      noOfPallets: "",
      pkgs: "",
      weight: "",
      mrp: "",
      amt: "",
      batchQty: 0,
      rate: 0,
      binType: "abc",
      remarks: "",
    };
    setLrTableData([...lrTableData, newRow]);
    setLrTableErrors([
      ...lrTableErrors,
      {
        qrCode: "",
        lr_Hawb_Hbl_No: "",
        invNo: "",
        shipmentNo: "",
        partNo: "",
        partDesc: "",
        sku: "",
        invQty: "",
        recQty: "",
        shortQty: "",
        damageQty: "",
        grnQty: "",
        subStockQty: "",
        batch_PalletNo: "",
        batchDate: "",
        expDate: "",
        palletQty: "",
        noOfPallets: "",
        pkgs: "",
        weight: "",
        mrp: "",
        amt: "",
        remarks: "",
      },
    ]);
  };
  // const isLastRowEmpty = (table) => {
  //   const lastRow = table[table.length - 1];
  //   if (!lastRow) return false;
  //   if (table === lrTableData) {
  //     return (
  //       !lastRow.lr_Hawb_Hbl_No ||
  //       !lastRow.invNo ||
  //       !lastRow.partNo ||
  //       !lastRow.invQty ||
  //       !lastRow.batch_PalletNo ||
  //       !lastRow.palletQty ||
  //       !lastRow.noOfPallets
  //     );
  //   }
  //   return false;
  // };

  // const displayRowError = (table) => {
  //   if (table === lrTableData) {
  //     setLrTableErrors((prevErrors) => {
  //       const newErrors = [...prevErrors];
  //       newErrors[table.length - 1] = {
  //         ...newErrors[table.length - 1],
  //         lr_Hawb_Hbl_No: !table[table.length - 1].lr_Hawb_Hbl_No
  //           ? "Lr_Hawb_Hbl_No is required"
  //           : "",
  //         invNo: !table[table.length - 1].invNo ? "Inv No is required" : "",
  //         partNo: !table[table.length - 1].partNo ? "Part No is required" : "",
  //         invQty: !table[table.length - 1].invQty ? "InvQty is required" : "",
  //         batch_PalletNo: !table[table.length - 1].batch_PalletNo
  //           ? "Batch No is required"
  //           : "",
  //         palletQty: !table[table.length - 1].palletQty
  //           ? "Bin Qty is required"
  //           : "",
  //         noOfPallets: !table[table.length - 1].noOfPallets
  //           ? "No of Bins is required"
  //           : "",
  //       };
  //       return newErrors;
  //     });
  //   }
  // };

  const handleDeleteRow = (id, table, setTable) => {
    setTable(table.filter((row) => row.id !== id));
  };

  const columns = [
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() =>
            handleDeleteRow(record.id, lrTableData, setLrTableData)
          }
          danger
          type="text"
          style={{ color: "white" }}
        />
      ),
    },
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
    },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "qrCode", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "LR No/HAWB No/HBL No *",
      dataIndex: "lr_Hawb_Hbl_No",
      key: "lr_Hawb_Hbl_No",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "lr_Hawb_Hbl_No", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Inv No *",
      dataIndex: "invNo",
      key: "invNo",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "invNo", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Shipment No",
      dataIndex: "shipmentNo",
      key: "shipmentNo",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "shipmentNo", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Inv Date",
      dataIndex: "invDate",
      key: "invDate",
      render: (text, record, index) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "invDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Part No *",
      dataIndex: "partNo",
      key: "partNo",
      render: (text, record, index) => (
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Select Part No"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handlePartNoChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {partNoList.map((part) => (
            <Option key={part.id} value={part.partno}>
              {part.partno}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Part Desc",
      dataIndex: "partDesc",
      key: "partDesc",
      render: (text) => (
        <Input
          value={text}
          readOnly
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => (
        <Input
          value={text}
          readOnly
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Inv QTY *",
      dataIndex: "invQty",
      key: "invQty",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "invQty", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Rec QTY",
      dataIndex: "recQty",
      key: "recQty",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "recQty", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Short QTY",
      dataIndex: "shortQty",
      key: "shortQty",
      render: (text) => (
        <Input
          value={text}
          readOnly
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Damage QTY",
      dataIndex: "damageQty",
      key: "damageQty",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "damageQty", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "GRN QTY",
      dataIndex: "grnQty",
      key: "grnQty",
      render: (text) => (
        <Input
          value={text}
          readOnly
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Batch/Pallet No *",
      dataIndex: "batch_PalletNo",
      key: "batch_PalletNo",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "batch_PalletNo", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Batch Date",
      dataIndex: "batchDate",
      key: "batchDate",
      render: (text, record, index) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "batchDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Exp Date",
      dataIndex: "expDate",
      key: "expDate",
      render: (text, record, index) => (
        <DatePicker
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "expDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
        />
      ),
    },
    {
      title: "Bin QTY *",
      dataIndex: "palletQty",
      key: "palletQty",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleBinQtyChange(e, record, index)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "No of Bins *",
      dataIndex: "noOfPallets",
      key: "noOfPallets",
      render: (text) => (
        <Input
          value={text}
          readOnly
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
      ),
    },
    {
      title: "Damage Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (text, record, index) => (
        <Select
          style={{ width: 200 }}
          value={text}
          onChange={(value) => handleTableChange(record.id, "remarks", value)}
          disabled={!record.damageQty}
        >
          <Option value="">Select Option</Option>
          <Option value="OPTION 1">OPTION 1</Option>
          <Option value="OPTION 2">OPTION 2</Option>
          <Option value="OPTION 3">OPTION 3</Option>
        </Select>
      ),
    },
  ];

  return (
    <ConfigProvider theme={themeConfig}>
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
              <div className="form-containerSG">
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
                        alignItems: "center",
                      }}
                    >
                      GRN
                    </Typography.Title>
                    <Typography.Text
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Create and manage Goods Receipt Notes
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
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => console.log("Search Clicked")}
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
                  loading={isLoading}
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
                  onClick={handleSampleExcelDownload}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Download
                </Button>
              </div>

              {/* Main Form */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Left Form Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <Tabs
                    className="white-tabs"
                    defaultActiveKey="1"
                    style={{ color: "#fff" }}
                  >
                    <TabPane
                      tab="Basic Information"
                      key="1"
                      style={{ color: "#fff" }}
                    >
                      <div
                        style={{
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "20px",
                          padding: "20px",
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      >
                        <Form layout="vertical">
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Document No
                                  </span>
                                }
                              >
                                <Input
                                  name="docId"
                                  value={formData.docId}
                                  onChange={handleInputChange}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Document Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.docDate
                                      ? dayjs(formData.docDate, "DD-MM-YYYY")
                                      : null
                                  } // Add format here
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            {!editId && (
                              <Col span={4}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      GRN Type
                                    </span>
                                  }
                                >
                                  <Select
                                    value={formData.grnType}
                                    onChange={(value) =>
                                      setFormData({
                                        ...formData,
                                        grnType: value,
                                      })
                                    }
                                    disabled={formData.freeze}
                                    style={{
                                      background: "rgba(255, 255, 255, 0.1)",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.3)",
                                      color: "white",
                                    }}
                                  >
                                    <Option value="GATE PASS">GATE PASS</Option>
                                    <Option value="GRN">GRN</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                            )}
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Entry No
                                  </span>
                                }
                              >
                                <Input
                                  name="entrySlNo"
                                  value={formData.entrySlNo}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      entrySlNo: e.target.value,
                                    });
                                  }}
                                  onBlur={() =>
                                    handleEntryNoChange(formData.entrySlNo)
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleEntryNoChange(formData.entrySlNo);
                                    }
                                  }}
                                  disabled={formData.freeze}
                                  style={inputStyle}
                                />
                                {/* <Input
                                  name="entrySlNo"
                                  value={formData.entrySlNo}
                                  onChange={handleInputChange}
                                  disabled={
                                    formData.grnType === "GATE PASS" ||
                                    formData.freeze
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                /> */}
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Entry Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  className="white-datepicker"
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.date
                                      ? dayjs(formData.date, "DD-MM-YYYY")
                                      : null
                                  } // Add format here
                                  onChange={(date) =>
                                    handleDateChange("date", date)
                                  }
                                  disabled={
                                    formData.grnType === "GRN" ||
                                    formData.freeze
                                  }
                                />
                              </Form.Item>
                            </Col>
                            {editId ? (
                              <Col span={4}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      Gate Pass ID
                                    </span>
                                  }
                                >
                                  <Input
                                    value={gatePassIdEdit}
                                    disabled
                                    style={{
                                      background: "rgba(255, 255, 255, 0.1)",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.3)",
                                      color: "white",
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                            ) : (
                              <Col span={4}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      Gate Pass No
                                    </span>
                                  }
                                >
                                  <Select
                                    style={selectStyle}
                                    value={formData.gatePassId}
                                    onChange={handleGatePassIdChange}
                                    disabled={
                                      formData.freeze ||
                                      formData.grnType !== "GATE PASS"
                                    } // Add this condition
                                    loading={
                                      gatePassIdList.length === 0 ||
                                      isLoadingGatePass
                                    }
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    }
                                  >
                                    <Option value="">Select Gate Pass</Option>
                                    {gatePassIdList.map((gatePass) => (
                                      <Option
                                        key={gatePass.id}
                                        value={gatePass.docId}
                                      >
                                        {gatePass.docId} -{" "}
                                        {gatePass.supplierShortName}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            )}
                          </Row>

                          {/* Second Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Gate Pass Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  className="white-datepicker"
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.gatePassDate
                                      ? dayjs(
                                          formData.gatePassDate,
                                          "DD-MM-YYYY"
                                        )
                                      : null
                                  } // Add format here
                                  disabled
                                />
                              </Form.Item>
                            </Col>

                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GRN Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  value={
                                    formData.grnDate
                                      ? dayjs(formData.grnDate, "DD-MM-YYYY")
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("grnDate", date)
                                  }
                                  disabled={formData.freeze}
                                  format="DD-MM-YYYY"
                                  className="white-datepicker"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Customer PO
                                  </span>
                                }
                              >
                                <Input
                                  name="customerPo"
                                  value={formData.customerPo}
                                  onChange={handleInputChange}
                                  disabled={editId || formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier Short Name *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  value={formData.supplierShortName}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      supplierShortName: value,
                                      supplier:
                                        supplierList.find(
                                          (s) => s.supplierShortName === value
                                        )?.supplier || "",
                                    })
                                  }
                                  disabled={editId || formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {supplierList?.map((row) => (
                                    <Option
                                      key={row.id}
                                      value={row.supplierShortName.toUpperCase()}
                                    >
                                      {row.supplierShortName.toUpperCase()}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier
                                  </span>
                                }
                              >
                                <Input
                                  name="supplier"
                                  value={formData.supplier}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    E-Way Bill *
                                  </span>
                                }
                              >
                                <Input
                                  name="billOfEntry"
                                  value={formData.billOfEntry}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Mode Of Shipment *
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.modeOfShipment}
                                  onChange={(value) => {
                                    setFormData({
                                      ...formData,
                                      modeOfShipment: value,
                                      carrier: "",
                                    });
                                    getAllCarriers(value);
                                  }}
                                  disabled={editId || formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  {modeOfShipmentList?.map((row, index) => (
                                    <Option
                                      key={index}
                                      value={row.shipmentMode.toUpperCase()}
                                    >
                                      {row.shipmentMode.toUpperCase()}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Carrier *
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.carrier}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      carrier: value,
                                    })
                                  }
                                  disabled={editId || formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  {carrierList?.map((row) => (
                                    <Option
                                      key={row.id}
                                      value={row.carrier.toUpperCase()}
                                    >
                                      {row.carrier.toUpperCase()}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Remarks</span>
                                }
                              >
                                <Input
                                  name="remarks"
                                  value={formData.remarks}
                                  onChange={handleInputChange}
                                  disabled={editId || formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>

                    <TabPane tab="Additional Information" key="2">
                      <div
                        style={{
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "20px",
                          padding: "20px",
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <Form layout="vertical">
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vehicle No
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleNo"
                                  value={formData.vehicleNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Contact No
                                  </span>
                                }
                              >
                                <Input
                                  name="contact"
                                  value={formData.contact}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Invoice No
                                  </span>
                                }
                              >
                                <Input
                                  name="invoiceNo"
                                  value={formData.invoiceNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Seal No</span>
                                }
                              >
                                <Input
                                  name="sealNo"
                                  value={formData.sealNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>LR No</span>
                                }
                              >
                                <Input
                                  name="lrNo"
                                  value={formData.lrNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>VAS</span>
                                }
                              >
                                <Checkbox
                                  checked={formData.vas}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      vas: e.target.checked,
                                    })
                                  }
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Driver Name
                                  </span>
                                }
                              >
                                <Input
                                  name="driverName"
                                  value={formData.driverName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Security Name
                                  </span>
                                }
                              >
                                <Input
                                  name="securityName"
                                  value={formData.securityName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Container No
                                  </span>
                                }
                              >
                                <Input
                                  name="containerNo"
                                  value={formData.containerNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>LR Date</span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  format="DD-MM-YYYY"
                                  className="white-datepicker"
                                  value={
                                    formData.lrDate
                                      ? dayjs(formData.lrDate, "DD-MM-YYYY")
                                      : null
                                  } // Add format here
                                  onChange={(date) =>
                                    handleDateChange("lrDate", date)
                                  }
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Goods Desc
                                  </span>
                                }
                              >
                                <Input
                                  name="goodsDesc"
                                  value={formData.goodsDesc}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vehicle Type
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleType"
                                  value={formData.vehicleType}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vessel Details
                                  </span>
                                }
                              >
                                <Input
                                  name="vesselDetails"
                                  value={formData.vesselDetails}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Lot No</span>
                                }
                              >
                                <Input
                                  name="lotNo"
                                  value={formData.lotNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Destination From
                                  </span>
                                }
                              >
                                <Input
                                  name="destinationFrom"
                                  value={formData.destinationFrom}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Destination To
                                  </span>
                                }
                              >
                                <Input
                                  name="destinationTo"
                                  value={formData.destinationTo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>HSN No</span>
                                }
                              >
                                <Input
                                  name="hsnNo"
                                  value={formData.hsnNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Capacity
                                  </span>
                                }
                              >
                                <Input
                                  name="capacity"
                                  value={formData.capacity}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Fourth Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vessel No
                                  </span>
                                }
                              >
                                <Input
                                  name="vesselNo"
                                  value={formData.vesselNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    No of Pallets
                                  </span>
                                }
                              >
                                <Input
                                  name="noOfPallets"
                                  value={formData.noOfPallets}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>

              {/* Table Section */}
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
                    {!editId && (
                      <>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Add Row
                        </Button>
                        <Button
                          icon={<GridOnIcon />}
                          onClick={getGatePassGridDetailsByGatePassId}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Fill Grid
                        </Button>
                      </>
                    )}
                    <Button
                      icon={<ClearOutlined />}
                      onClick={() => handleTableClear("lrTableData")}
                      style={{
                        marginRight: "8px",
                        background: "rgba(255, 99, 132, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div
                  className="table-container"
                  style={{
                    position: "relative",
                    width: "100%",
                    overflowX: "auto", // Horizontal scrolling
                    fontSize: "11px",
                    marginLeft: "0",
                    backgroundColor: "transparent",
                    maxHeight: "500px",
                    overflowY: "auto", // Vertical scrolling
                    marginTop: "10px",
                    // Scrollbar styling for webkit browsers (Chrome, Safari)
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
                    // Scrollbar styling for Firefox
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
                      <col style={{ width: "60px" }} /> {/* Action */}
                      <col style={{ width: "60px" }} /> {/* S.No */}
                      <col style={{ width: "120px" }} /> {/* QR Code */}
                      <col style={{ width: "180px" }} />{" "}
                      {/* LR No/HAWB No/HBL No */}
                      <col style={{ width: "120px" }} /> {/* Inv No */}
                      <col style={{ width: "120px" }} /> {/* Shipment No */}
                      <col style={{ width: "120px" }} /> {/* Inv Date */}
                      <col style={{ width: "150px" }} /> {/* Part No */}
                      <col style={{ width: "200px" }} /> {/* Part Desc */}
                      <col style={{ width: "100px" }} /> {/* SKU */}
                      <col style={{ width: "100px" }} /> {/* Inv QTY */}
                      <col style={{ width: "100px" }} /> {/* Rec QTY */}
                      <col style={{ width: "100px" }} /> {/* Short QTY */}
                      <col style={{ width: "120px" }} /> {/* Damage QTY */}
                      <col style={{ width: "100px" }} /> {/* GRN QTY */}
                      <col style={{ width: "150px" }} /> {/* Batch/Pallet No */}
                      <col style={{ width: "120px" }} /> {/* Batch Date */}
                      <col style={{ width: "120px" }} /> {/* Exp Date */}
                      <col style={{ width: "100px" }} /> {/* Bin QTY */}
                      <col style={{ width: "120px" }} /> {/* No of Bins */}
                      <col style={{ width: "180px" }} /> {/* Damage Remarks */}
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
                          QR Code
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          LR No/HAWB No/HBL No{" "}
                          <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Inv No <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Shipment No
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Inv Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Part No <span style={{ color: "white" }}>*</span>
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
                          SKU
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Inv QTY <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Rec QTY
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Short QTY
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Damage QTY
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          GRN QTY
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Batch/Pallet No{" "}
                          <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Batch Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Exp Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Bin QTY <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          No of Bins <span style={{ color: "white" }}>*</span>
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Damage Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lrTableData.map((row, index) => (
                        <tr
                          key={`row-${index}-${row.id}`}
                          style={{
                            borderBottom: "1px dashed white",
                            color: "white",
                          }}
                        >
                          {/* Action */}
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleDeleteRow(
                                  row.id,
                                  lrTableData,
                                  setLrTableData
                                )
                              }
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

                          {/* QR Code */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.qrCode}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "qrCode",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* LR No/HAWB No/HBL No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.lr_Hawb_Hbl_No}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "lr_Hawb_Hbl_No",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Inv No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.invNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "invNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Shipment No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.shipmentNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "shipmentNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Inv Date */}

                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.invDate
                                  ? dayjs(row.invDate, "DD-MM-YYYY")
                                  : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "invDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              format="DD-MM-YYYY"
                              className="white-datepicker"
                            />
                          </td>

                          {/* Part No */}
                          <td style={{ padding: "8px" }}>
                            <Select
                              showSearch
                              style={selectStyle}
                              placeholder="Select Part No"
                              optionFilterProp="children"
                              value={row.partNo}
                              onChange={(value) =>
                                handlePartNoChange(row, index, {
                                  target: { value },
                                })
                              }
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {partNoList.map((part) => (
                                <Option key={part.id} value={part.partno}>
                                  {part.partno}
                                </Option>
                              ))}
                            </Select>
                          </td>

                          {/* Part Desc */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.partDesc}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* SKU */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.sku}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Inv QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.invQty}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "invQty",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Rec QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.recQty}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "recQty",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Short QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.shortQty}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Damage QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.damageQty}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "damageQty",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* GRN QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.grnQty}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Batch/Pallet No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.batch_PalletNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "batch_PalletNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* Batch Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.batchDate
                                  ? dayjs(row.batchDate, "DD-MM-YYYY")
                                  : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "batchDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              format="DD-MM-YYYY"
                              className="white-datepicker"
                            />
                          </td>

                          {/* Exp Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.expDate
                                  ? dayjs(row.expDate, "DD-MM-YYYY")
                                  : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "expDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              format="DD-MM-YYYY"
                              className="white-datepicker"
                            />
                          </td>

                          {/* Bin QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.palletQty}
                              onChange={(e) =>
                                handleBinQtyChange(e, row, index)
                              }
                              style={inputStyle}
                            />
                          </td>

                          {/* No of Bins */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.noOfPallets}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Damage Remarks */}
                          <td style={{ padding: "8px" }}>
                            <Select
                              style={selectStyle}
                              value={row.remarks}
                              onChange={(value) =>
                                handleTableChange(row.id, "remarks", value)
                              }
                              disabled={!row.damageQty}
                            >
                              <Option value="">Select Option</Option>
                              <Option value="OPTION 1">OPTION 1</Option>
                              <Option value="OPTION 2">OPTION 2</Option>
                              <Option value="OPTION 3">OPTION 3</Option>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "16px",
                  }}
                >
                  <div>
                    <Typography.Text style={{ color: "white" }}>
                      Total GRN Qty: {formData.totGrnQty}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "90vh",
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
                    GRN List
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    View and manage GRN entries
                  </Typography.Text>
                </div>
                <div></div>
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
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Input
                    placeholder="Search by GRN No, Supplier, or Gate Pass ID"
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "300px",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                    prefix={
                      <SearchOutlined
                        style={{ color: "rgba(255, 255, 255, 0.5)" }}
                      />
                    }
                  />

                  <Space>
                    <RangePicker
                      className="white-datepicker"
                      value={selectedDateRange}
                      onChange={setSelectedDateRange}
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
                      Add Entry
                    </Button>
                  </Space>
                </div>

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
                          textAlign: "center",
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
                        GRN Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        GRN No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Gate Pass ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Supplier
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        GRN QTY
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listViewData
                      .filter(
                        (item) =>
                          !searchTerm ||
                          (item.docId &&
                            item.docId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.supplier &&
                            item.supplier
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.gatePassId &&
                            item.gatePassId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`grn-${index}-${item.id}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
                              textAlign: "center",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() =>
                                item && item.id
                                  ? getGrnById(item)
                                  : alert("Invalid row data")
                              }
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
                            {dayjs(item.grnDate).format("DD-MM-YYYY")}
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
                            {item.gatePassId}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.supplier}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.totalGrnQty}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {listViewData.length > 0 && (
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
                      {Math.min(currentPage * pageSize, listViewData.length)} of{" "}
                      {listViewData.length} items
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
                      { length: Math.ceil(listViewData.length / pageSize) },
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
                            Math.ceil(listViewData.length / pageSize)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(listViewData.length / pageSize)
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
                          Math.ceil(listViewData.length / pageSize)
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          currentPage ===
                          Math.ceil(listViewData.length / pageSize)
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
                )}
              </div>
            </div>
          )}
        </div>

        {/* <Modal
                  visible={uploadOpen}
                  onCancel={() => setUploadOpen(false)}
                  footer={null}
                  width={600}
                  closable={false}
                  className="upload-modal"
                  style={{
                    padding: "0",
                  }}
                > */}
        <CommonBulkUpload
          open={uploadOpen}
          handleClose={() => setUploadOpen(false)}
          title="Upload Gate Pass In Files"
          uploadText="Upload file"
          downloadText="Sample File"
          onSubmit={handleSubmit}
          sampleFileDownload={sampleFile}
          handleFileUpload={handleFileUpload}
          apiUrl={`${API_URL}/api/grn/ExcelUploadForGrn?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}`}
          screen="GRN"
        />
        {/* </Modal> */}
      </div>
    </ConfigProvider>
  );
};

// Define these styles outside your component
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

const datePickerStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

const selectStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.1)",
  color: "white",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

export default GRN;
