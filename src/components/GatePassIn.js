import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import GridOnIcon from "@mui/icons-material/GridOn";
import SendIcon from "@mui/icons-material/Send";
import { Pagination } from "antd";

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

import { Modal, message } from "antd";
import { DownloadOutlined, CloseOutlined } from "@ant-design/icons";
const { TabPane } = Tabs;
const { Text } = Typography;

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
          style={{ color: "#ff4d4f" }}
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
          style={datePickerStyle}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "invDate",
              date ? date.format("YYYY-MM-DD") : null
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
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "batchDate",
              date ? date.format("YYYY-MM-DD") : null
            )
          }
        />
      ),
    },
    {
      title: "Exp Date",
      dataIndex: "expDate",
      key: "expDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "expDate",
              date ? date.format("YYYY-MM-DD") : null
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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const { Option } = Select;

const GatePassIn = () => {
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
  const [pagenation, setPagination] = useState(5);
  const [performanceGoalsData, setPerformanceGoalsData] = useState([]);
  const paginatedData = performanceGoalsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [filters, setFilters] = useState("");
  const [sorter, setSorter] = useState("");
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

  const [selectedFile, setSelectedFile] = useState(null);

  const handleSampleDownload = () => {
    // Implement your sample download logic
    message.info("Downloading sample file...");
  };

  // Form state
  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    editDocDate: dayjs(),
    entrySlNo: "",
    date: dayjs(),
    gatePassId: "",
    gatePassDate: null,
    supplierShortName: "",
    supplier: "",
    modeOfShipment: "",
    carrier: "",
    vehicleType: "",
    contact: "",
    driverName: "",
    securityName: "",
    vehicleNo: "",
    goodsDesc: "",
    freeze: false,
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: new Date(),
    entrySlNo: "",
    date: null,
    gatePassId: "",
    gatePassDate: null,
    supplierShortName: "",
    supplier: "",
    modeOfShipment: "",
    carrier: "",
    vehicleType: "",
    contact: "",
    driverName: "",
    securityName: "",
    vehicleNo: "",
    goodsDesc: "",
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
  const listViewColumns = [
    { accessorKey: "docDate", header: "Doc Date", size: 140 },
    { accessorKey: "docId", header: "Doc ID", size: 140 },
    { accessorKey: "supplier", header: "Supplier", size: 140 },
    { accessorKey: "modeOfShipment", header: "Mode of Shipment", size: 140 },
    { accessorKey: "vehicleType", header: "Vehicle Type", size: 140 },
    { accessorKey: "driverName", header: "Driver Name", size: 140 },
    { accessorKey: "securityName", header: "Security Person", size: 140 },
  ];

  // Theme configuration
  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };

  // Get new Gate Pass document ID
  const getNewGatePassDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/getGatePassInDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.GatePassInDocId,
      }));
    } catch (error) {
      console.error("Error fetching Gate Pass document ID:", error);
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
      setModeOfShipmentList(response.paramObjectsMap.modOfShipments);
    } catch (error) {
      console.error("Error fetching modes of shipment:", error);
    }
  };

  // Get all carriers
  const getAllCarriers = async (selectedModeOfShipment) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/carrier/getAllActiveCarrier?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&shipmentMode=${selectedModeOfShipment}`
      );
      setCarrierList(response.paramObjectsMap.carrierVO);
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

  // Get all Gate Passes
  const getAllGatePasses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn?branchCode=${loginBranch}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      setListViewData(response.paramObjectsMap.gatePassInVO);
    } catch (error) {
      console.error("Error fetching Gate Pass data:", error);
    }
  };

  // Get Gate Pass by ID
  const getGatePassById = async (row) => {
    console.log("THE SELECTED GATE PASS ID IS:", row.original.id);
    setEditId(row.original.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn/${row.original.id}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListView(false);
        const particularGatePass = response.paramObjectsMap.GatePassIn;
        setGatePassIdEdit(particularGatePass.docId);

        setFormData({
          docId: particularGatePass.docId,
          editDocDate: particularGatePass.docdate,
          docDate: particularGatePass.docDate,
          entrySlNo: particularGatePass.entryNo,
          date: particularGatePass.entryDate,
          supplierShortName: particularGatePass.supplierShortName,
          supplier: particularGatePass.supplier,
          modeOfShipment: particularGatePass.modeOfShipment,
          carrier: particularGatePass.carrier,
          vehicleType: particularGatePass.vehicleType,
          contact: particularGatePass.contact,
          driverName: particularGatePass.driverName,
          securityName: particularGatePass.securityName,
          vehicleNo: particularGatePass.vehicleNo,
          goodsDesc: particularGatePass.goodsDescription,
          freeze: particularGatePass.freeze,
        });
        getAllCarriers(particularGatePass.modeOfShipment);
        setFormData((prevData) => ({
          ...prevData,
          carrier: particularGatePass.carrier.toUpperCase(),
        }));

        setLrTableData(
          particularGatePass.gatePassDetailsVO.map((row) => ({
            id: row.id,
            qrCode: row.qrCode,
            lr_Hawb_Hbl_No: row.irNoHaw,
            invNo: row.invoiceNo,
            invDate: dayjs(row.invoiceDate).format("DD-MM-YYYY"),
            partNo: row.partNo,
            partDesc: row.partDescription,
            sku: row.sku,
            invQty: row.invQty,
            recQty: row.recQty,
            damageQty: row.damageQty,
            grnQty: row.grnQty,
            batch_PalletNo: row.batchNo,
            batchDate: dayjs(row.batchDate).format("DD-MM-YYYY"),
            expDate: dayjs(row.expDate).format("DD-MM-YYYY"),
            shortQty: row.shortQty,
            damageQty: row.damageQty,
            remarks: row.remarks,
          }))
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    getNewGatePassDocId();
    getAllSuppliers();
    getAllModesOfShipment();
    getAllPartNo();
    getAllGatePasses();
  }, []);

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;

    let errorMessage = "";
    let updatedValue = value.toUpperCase();

    switch (name) {
      case "contact":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid mobile format";
        }
        updatedValue = value.slice(0, 10);
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === "supplierShortName") {
        const selectedName = supplierList.find(
          (supplier) => supplier.supplierShortName === updatedValue
        );
        if (selectedName) {
          setFormData({
            ...formData,
            supplierShortName: selectedName.supplierShortName,
            supplier: selectedName.supplier,
          });
        }
      } else if (name === "modeOfShipment") {
        setFormData({
          ...formData,
          [name]: updatedValue,
        });
        getAllCarriers(updatedValue);
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

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : null;
    setFormData({ ...formData, [field]: formattedDate });
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      entrySlNo: "",
      date: dayjs(),
      supplierShortName: "",
      supplier: "",
      modeOfShipment: "",
      carrier: "",
      vehicleType: "",
      contact: "",
      driverName: "",
      securityName: "",
      vehicleNo: "",
      goodsDesc: "",
      remarks: "",
    });
    setFieldErrors({
      docDate: "",
      entrySlNo: "",
      date: "",
      supplierShortName: "",
      supplier: "",
      modeOfShipment: "",
      carrier: "",
      vehicleType: "",
      contact: "",
      driverName: "",
      securityName: "",
      vehicleNo: "",
      goodsDesc: "",
      remarks: "",
    });
    getNewGatePassDocId();
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

  const handleTableChange = (pagination, filters, sorter) => {
    // Your implementation here
    // For example:
    setPagination(pagination);
    setFilters(filters);
    setSorter(sorter);
    // Or any other logic you need for table changes
  };

  const handleSave = async () => {
    const errors = {};
    let firstInvalidFieldRef = null;
    if (!formData.entrySlNo) errors.entrySlNo = "Entry No is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.supplierShortName)
      errors.supplierShortName = "Supplier Short Name is required";
    if (!formData.modeOfShipment)
      errors.modeOfShipment = "Mode of Shipment is required";
    if (!formData.carrier) errors.carrier = "Carrier is required";

    let lrTableDataValid = true;
    if (
      !lrTableData ||
      !Array.isArray(lrTableData) ||
      lrTableData.length === 0
    ) {
      lrTableDataValid = false;
      setLrTableErrors([{ general: "Lr Table Data is required" }]);
    } else {
      const newTableErrors = lrTableData.map((row, index) => {
        const rowErrors = {};
        if (!row.lr_Hawb_Hbl_No) {
          rowErrors.lr_Hawb_Hbl_No = "Lr_Hawb_Hbl_No is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef =
              lrNoDetailsRefs.current[index].lr_Hawb_Hbl_No;
          lrTableDataValid = false;
        }
        if (!row.invNo) {
          rowErrors.invNo = "Inv No is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef = lrNoDetailsRefs.current[index].invNo;
          lrTableDataValid = false;
        }
        if (!row.partNo) {
          rowErrors.partNo = "Part No is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef = lrNoDetailsRefs.current[index].partNo;
          lrTableDataValid = false;
        }
        if (!row.invQty) {
          rowErrors.invQty = "Inv QTY is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef = lrNoDetailsRefs.current[index].invQty;
          lrTableDataValid = false;
        }
        if (!row.recQty) {
          rowErrors.recQty = "Rec QTY is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef = lrNoDetailsRefs.current[index].recQty;
          lrTableDataValid = false;
        }
        if (!row.damageQty) {
          rowErrors.damageQty = "Damage QTY is required";
          if (!firstInvalidFieldRef)
            firstInvalidFieldRef = lrNoDetailsRefs.current[index].damageQty;
          lrTableDataValid = false;
        }
        return rowErrors;
      });
      setLrTableErrors(newTableErrors);
    }
    setFieldErrors(errors);

    if (!lrTableDataValid || Object.keys(errors).length > 0) {
      if (firstInvalidFieldRef && firstInvalidFieldRef.current) {
        firstInvalidFieldRef.current.focus();
      }
    }
    if (Object.keys(errors).length === 0 && lrTableDataValid) {
      setIsLoading(true);

      const lrVo = lrTableData.map((row) => ({
        ...(editId && { id: row.id }),
        qrCode: row.qrCode,
        irNoHaw: row.lr_Hawb_Hbl_No,
        invoiceNo: row.invNo,
        invoiceDate: row.invDate
          ? dayjs(row.invDate).format("YYYY-MM-DD")
          : null,
        partNo: row.partNo,
        partDescription: row.partDesc,
        sku: row.sku,
        invQty: parseInt(row.invQty),
        recQty: parseInt(row.recQty),
        damageQty: parseInt(row.damageQty),
        grnQty: parseInt(row.grnQty),
        batchNo: row.batch_PalletNo,
        batchDate: row.batchDate
          ? dayjs(row.batchDate).format("YYYY-MM-DD")
          : null,
        expDate: row.expDate ? dayjs(row.expDate).format("YYYY-MM-DD") : null,
        remarks: row.remarks,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        entryNo: formData.entrySlNo,
        entryDate: formData.date
          ? dayjs(formData.date).format("YYYY-MM-DD")
          : null,
        docdate: formData.docDate
          ? dayjs(formData.docDate).format("YYYY-MM-DD")
          : null,
        supplierShortName: formData.supplierShortName,
        supplier: formData.supplier,
        modeOfShipment: formData.modeOfShipment,
        carrier: formData.carrier,
        vehicleType: formData.vehicleType,
        contact: formData.contact,
        driverName: formData.driverName,
        securityName: formData.securityName,
        vehicleNo: formData.vehicleNo,
        goodsDescription: formData.goodsDesc,
        orgId: orgId,
        createdBy: loginUserName,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        gatePassInDetailsDTO: lrVo,
      };

      console.log("DATA TO SAVE IS:", saveFormData);

      try {
        const response = await axios.put(
          `${API_URL}/gatePassIn/createUpdateGatePassIn`,
          saveFormData
        );
        if (response.status === true) {
          console.log("Response:", response);
          showToast(
            "success",
            editId
              ? "Gate Pass Updated Successfully"
              : "Gate Pass created successfully"
          );
          handleClear();
          getAllGatePasses();
          setIsLoading(false);
        } else {
          showToast(
            "error",
            response.paramObjectsMap.errorMessage || "Gate Pass creation failed"
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "Gate Pass creation failed");
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
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
    link.download = "sample_GatePass.xls";
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

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      qrCode: "",
      lr_Hawb_Hbl_No: "",
      invNo: "",
      invDate: null,
      partNo: "",
      partDesc: "",
      sku: "",
      invQty: "",
      recQty: "",
      shortQty: "",
      damageQty: "",
      grnQty: "",
      batch_PalletNo: "",
      batchDate: null,
      expDate: null,
      remarks: "",
    };
    setLrTableData([...lrTableData, newRow]);
    setLrTableErrors([
      ...lrTableErrors,
      {
        qrCode: "",
        lr_Hawb_Hbl_No: "",
        invNo: "",
        partNo: "",
        partDesc: "",
        sku: "",
        invQty: "",
        recQty: "",
        shortQty: "",
        damageQty: "",
        grnQty: "",
        batch_PalletNo: "",
        batchDate: "",
        expDate: "",
        remarks: "",
      },
    ]);
  };

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
              date ? date.format("YYYY-MM-DD") : null
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
      title: "Rec QTY *",
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
      title: "Damage QTY *",
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
      title: "Batch/Pallet No",
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
              date ? date.format("YYYY-MM-DD") : null
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
              date ? date.format("YYYY-MM-DD") : null
            )
          }
        />
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "remarks", e.target.value)
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
        />
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
                      Gate Pass In
                    </Typography.Title>
                    <Typography.Text
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Create and manage Gate Pass In entries
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
                {!formData.freeze && (
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isLoading}
                    style={{
                      background: "rgba(108, 99, 255, 0.7)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Save
                  </Button>
                )}
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
                                  style={inputStyle}
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
                                  style={datePickerStyle}
                                  value={
                                    formData.docDate
                                      ? dayjs(formData.docDate)
                                      : null
                                  }
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Entry/SI No *
                                  </span>
                                }
                              >
                                <Input
                                  name="entrySlNo"
                                  value={formData.entrySlNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={inputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Date *</span>
                                }
                              >
                                <DatePicker
                                  style={datePickerStyle}
                                  value={
                                    formData.date ? dayjs(formData.date) : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("date", date)
                                  }
                                  disabled={formData.freeze}
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
                                  style={selectStyle}
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
                                  style={readOnlyInputStyle}
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
                                    Mode Of Shipment *
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
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
                                  style={selectStyle}
                                  value={formData.carrier}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      carrier: value,
                                    })
                                  }
                                  disabled={editId || formData.freeze}
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
                                  style={inputStyle}
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
                                    Vehicle Type
                                  </span>
                                }
                              >
                                <Select
                                  style={selectStyle}
                                  value={formData.vehicleType}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      vehicleType: value,
                                    })
                                  }
                                  disabled={formData.freeze}
                                >
                                  <Option value="45 FEET">45 FEET</Option>
                                  <Option value="CANTER">CANTER</Option>
                                  <Option value="CONTAINER">CONTAINER</Option>
                                  <Option value="TEMPO">TEMPO</Option>
                                </Select>
                              </Form.Item>
                            </Col>
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
                                  style={inputStyle}
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
                                  style={inputStyle}
                                  inputProps={{ maxLength: 10 }}
                                />
                              </Form.Item>
                            </Col>
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
                                  style={inputStyle}
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
                                    Security Person
                                  </span>
                                }
                              >
                                <Input
                                  name="securityName"
                                  value={formData.securityName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={inputStyle}
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
                                  style={inputStyle}
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
                      <col style={{ width: "180px" }} /> {/* Remarks */}
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
                          Rec QTY <span style={{ color: "white" }}>*</span>
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
                          Damage QTY <span style={{ color: "white" }}>*</span>
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
                          Batch/Pallet No
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
                          Remarks
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

                          {/* Inv Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={row.invDate ? dayjs(row.invDate) : null}
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "invDate",
                                  date ? date.format("YYYY-MM-DD") : null
                                )
                              }
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
                                row.batchDate ? dayjs(row.batchDate) : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "batchDate",
                                  date ? date.format("YYYY-MM-DD") : null
                                )
                              }
                            />
                          </td>

                          {/* Exp Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={row.expDate ? dayjs(row.expDate) : null}
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "expDate",
                                  date ? date.format("YYYY-MM-DD") : null
                                )
                              }
                            />
                          </td>

                          {/* Remarks */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.remarks}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
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
              {/* List View Header */}
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
                      Gate Pass In List
                    </Typography.Title>
                    <Typography.Text
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      View and manage Gate Pass In entries
                    </Typography.Text>
                  </div>
                  <div>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={toggleViewMode}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none",
                      }}
                    >
                      New Entry
                    </Button>
                  </div>
                </div>
              </div>

              {/* List View Content */}
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
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Input
                      placeholder="Search..."
                      prefix={<SearchOutlined />}
                      style={{
                        width: 200,
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      icon={<RestartAltIcon />}
                      onClick={() => {
                        setSearchTerm("");
                        getAllGatePasses();
                      }}
                      style={{
                        background: "rgba(108, 99, 255, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    overflowX: "auto",
                    maxHeight: "calc(100vh - 300px)",
                  }}
                >
                  <Table
                    columns={[
                      {
                        title: "Action",
                        key: "action",
                        render: (_, record) => (
                          <Button
                            icon={<RightCircleOutlined />}
                            onClick={() => getGatePassById(record)}
                            type="text"
                            style={{ color: "#6C63FF" }}
                          />
                        ),
                      },
                      {
                        title: "Doc Date",
                        dataIndex: "docDate",
                        key: "docDate",
                        render: (text) =>
                          text ? dayjs(text).format("DD-MM-YYYY") : "",
                      },
                      {
                        title: "Doc ID",
                        dataIndex: "docId",
                        key: "docId",
                      },
                      {
                        title: "Supplier",
                        dataIndex: "supplier",
                        key: "supplier",
                      },
                      {
                        title: "Mode of Shipment",
                        dataIndex: "modeOfShipment",
                        key: "modeOfShipment",
                      },
                      {
                        title: "Vehicle Type",
                        dataIndex: "vehicleType",
                        key: "vehicleType",
                      },
                      {
                        title: "Driver Name",
                        dataIndex: "driverName",
                        key: "driverName",
                      },
                      {
                        title: "Security Person",
                        dataIndex: "securityName",
                        key: "securityName",
                      },
                    ]}
                    dataSource={listViewData}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Upload Dialog */}
        <Modal
          title={
            <div
              style={{
                backgroundColor: "#6C63FF",
                color: "white",
                padding: "16px",
                margin: "-20px -24px 20px -24px",
                borderRadius: "8px 8px 0 0",
              }}
            >
              Bulk Upload Gate Pass In
            </div>
          }
          visible={uploadOpen}
          onCancel={() => setUploadOpen(false)}
          footer={null}
          width={500}
          closable={false}
          className="upload-modal"
          bodyStyle={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setUploadOpen(false)}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          />

          {/* Upload Area */}
          <div
            style={{
              width: "100%",
              padding: "40px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              background: "rgba(108, 99, 255, 0.05)",
              borderRadius: "8px",
              border: "2px dashed rgba(108, 99, 255, 0.5)",
              cursor: "pointer",
              marginBottom: "20px",
              textAlign: "center",
            }}
            onClick={() => document.getElementById("bulk-upload-input").click()}
          >
            <CloudUploadOutlined
              style={{ fontSize: "48px", color: "#6C63FF" }}
            />
            <Text strong style={{ color: "#6C63FF" }}>
              {selectedFile
                ? selectedFile.name
                : "Drag and drop your file here or click to browse"}
            </Text>
            <Text type="secondary">Supported formats: .xls, .xlsx</Text>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="bulk-upload-input"
          />

          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <Button
              type="primary"
              onClick={() =>
                document.getElementById("bulk-upload-input").click()
              }
              style={{ background: "#6C63FF", borderColor: "#6C63FF" }}
            >
              Choose File
            </Button>
            <Button
              onClick={handleSampleDownload}
              style={{ color: "#6C63FF", borderColor: "#6C63FF" }}
            >
              Download Sample
            </Button>
          </div>

          <Text type="secondary" style={{ marginBottom: "24px" }}>
            Note: Please ensure the Excel file follows the sample format.
          </Text>

          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setUploadOpen(false)}
              style={{ color: "#6C63FF", borderColor: "#6C63FF" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ background: "#6C63FF", borderColor: "#6C63FF" }}
            >
              Upload
            </Button>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default GatePassIn;

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
