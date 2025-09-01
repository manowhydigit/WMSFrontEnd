import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import GridOnIcon from "@mui/icons-material/GridOn";
import SendIcon from "@mui/icons-material/Send";
import { Pagination } from "antd";
import sampleFile from "../assets/sample-files/Sample_Grn_Upload.xls";
import * as XLSX from "xlsx";
import CommonBulkUpload from "../utils/CommonBulkUpload";

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
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
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
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
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
    const link = document.createElement("a");
    link.href = sampleFile; // This should be the imported file
    link.download = "sample_GatePass.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const entrySlNoRef = useRef(formData.entrySlNo);

  // Update the ref whenever the value changes
  useEffect(() => {
    entrySlNoRef.current = formData.entrySlNo;
  }, [formData.entrySlNo]);

  const [lrTableData, setLrTableData] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [lrTableErrors, setLrTableErrors] = useState([]);

  const lrNoDetailsRefs = useRef([]);

  const [value, setValue] = useState(0);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [loadingEntry, setLoadingEntry] = useState(false);

  const [entryNoValue, setEntryNoValue] = useState("");
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

      // Check if response.data exists and has paramObjectsMap
      if (response.data && response.data.paramObjectsMap) {
        setFormData((prevData) => ({
          ...prevData,
          docId: response.data.paramObjectsMap.GatePassInDocId || "", // Use empty string if null
        }));
      }
    } catch (error) {
      console.error("Error fetching Gate Pass document ID:", error);
    }
  };

  // Get all suppliers
  const getAllSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/supplier?cbranch=${loginBranchCode}&client=${loginClient}&orgid=${orgId}`
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
        `${API_URL}/api/warehousemastercontroller/getCarrierNameByCustomer?cbranch=${loginBranchCode}&client=${loginClient}&orgid=${orgId}&shipmentMode=${selectedModeOfShipment}`
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

  // Get all Gate Passes
  const getAllGatePasses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn?branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      setListViewData(response.data.paramObjectsMap.gatePassInVO);
    } catch (error) {
      console.error("Error fetching Gate Pass data:", error);
    }
  };

  // Debounce the entry number input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.entrySlNo && formData.entrySlNo.length > 3) {
        handleEntryNoChange(formData.entrySlNo);
      }
    }, 800); // Wait 800ms after typing stops

    return () => {
      clearTimeout(handler);
    };
  }, [formData.entrySlNo]);
  // Get Gate Pass by ID
  // Get Gate Pass by ID
  // FIXED DATE HANDLING IN handleSave FUNCTION
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

      // FIXED DATE HANDLING - Convert DD-MM-YYYY to proper format for API
      const lrVo = lrTableData.map((row) => ({
        ...(editId && { id: row.id }),
        qrCode: row.qrCode,
        irNoHaw: row.lr_Hawb_Hbl_No,
        invoiceNo: row.invNo,
        invoiceDate: row.invDate ? convertToAPIDateFormat(row.invDate) : null,
        partNo: row.partNo,
        partDescription: row.partDesc,
        sku: row.sku,
        invQty: parseFloat(row?.invQty || 0),
        recQty: parseFloat(row?.recQty || 0),
        shortQty: parseFloat(row?.shortQty || 0),
        damageQty: parseFloat(row?.damageQty || 0),
        grnQty: parseFloat(row?.grnQty || 0),
        batchNo: row.batch_PalletNo,
        batchDate: row.batchDate ? convertToAPIDateFormat(row.batchDate) : null,
        expDate: row.expDate ? convertToAPIDateFormat(row.expDate) : null,
        remarks: row.remarks,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        entryNo: formData.entrySlNo,
        entryDate: formData.date ? convertToAPIDateFormat(formData.date) : null,
        docdate: formData.docDate
          ? convertToAPIDateFormat(formData.docDate)
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
          `${API_URL}/api/gatePassIn/createUpdateGatePassIn`,
          saveFormData
        );
        if (response.data.status === true) {
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
            response.data.paramObjectsMap.errorMessage ||
              "Gate Pass creation failed"
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

  // ADD THIS HELPER FUNCTION FOR DATE CONVERSION
  const convertToAPIDateFormat = (dateString) => {
    if (!dateString) return null;

    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
        return dateString;
      }

      // Convert from DD-MM-YYYY to YYYY-MM-DD
      if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
        const parts = dateString.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      // Handle other formats or return original if unknown
      return dateString;
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return dateString;
    }
  };

  // FIX THE getGatePassById FUNCTION TO PROPERLY HANDLE EDIT MODE
  const getGatePassById = async (item) => {
    console.log("THE SELECTED GATE PASS ID IS:", item.id);
    setEditId(item.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn/${item.id}`
      );
      console.log("API Response:", response.data);

      if (response.data?.status === true) {
        setViewMode("form");
        const particularGatePass = response.data.paramObjectsMap.GatePassIn;
        setGatePassIdEdit(particularGatePass.docId);

        // Format dates properly - FIXED DATE HANDLING
        const formattedData = {
          docId: particularGatePass.docId,
          docDate: particularGatePass.docDate || particularGatePass.docdate,
          entrySlNo: particularGatePass.entryNo,
          date: convertToDDMMYYYY(particularGatePass.entryDate),
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
        };

        setFormData(formattedData);
        getAllCarriers(particularGatePass.modeOfShipment);

        // Set carrier after a small delay to ensure carrier list is loaded
        setTimeout(() => {
          setFormData((prevData) => ({
            ...prevData,
            carrier: particularGatePass.carrier?.toUpperCase() || "",
          }));
        }, 100);

        // Format table data dates - FIXED DATE HANDLING
        setLrTableData(
          particularGatePass.gatePassDetailsVO.map((detail) => ({
            id: detail.id,
            qrCode: detail.qrCode,
            lr_Hawb_Hbl_No: detail.irNoHaw,
            invNo: detail.invoiceNo,
            invDate: convertToDDMMYYYY(detail.invoiceDate),
            partNo: detail.partNo,
            partDesc: detail.partDescription,
            sku: detail.sku,
            invQty: detail.invQty,
            recQty: detail.recQty,
            damageQty: detail.damageQty,
            grnQty: detail.grnQty,
            batch_PalletNo: detail.batchNo,
            batchDate: convertToDDMMYYYY(detail.batchDate),
            expDate: convertToDDMMYYYY(detail.expDate),
            shortQty: detail.shortQty,
            remarks: detail.remarks,
          }))
        );
      } else {
        console.error("API Error:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // FIX THE convertToDDMMYYYY FUNCTION TO HANDLE MORE DATE FORMATS
  const convertToDDMMYYYY = (dateString) => {
    if (!dateString) return null;

    try {
      // Handle null/undefined
      if (!dateString) return null;

      // If it's already in DD-MM-YYYY format, return as-is
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 2
      ) {
        return dateString;
      }

      // Handle YYYY-MM-DD format
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 4
      ) {
        const parts = dateString.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      // Handle Date objects
      if (dateString instanceof Date) {
        return dayjs(dateString).format("DD-MM-YYYY");
      }

      // Handle dayjs objects
      if (dayjs.isDayjs(dateString)) {
        return dateString.format("DD-MM-YYYY");
      }

      // Handle timestamps
      if (typeof dateString === "number") {
        return dayjs(dateString).format("DD-MM-YYYY");
      }

      // Return as-is if format is unknown
      return dateString;
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return null;
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
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllGatePasses();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  // Date formatting utility
  // Date formatting utility - FIXED VERSION
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Ensure we're working with a Day.js object
    let date;

    if (typeof dateString === "string" || dateString instanceof Date) {
      date = dayjs(dateString);
    } else if (dayjs.isDayjs(dateString)) {
      date = dateString;
    } else {
      return String(dateString); // Return as string if not a recognizable date format
    }

    // Check if it's a valid date
    if (date.isValid()) {
      return date.format("DD-MM-YYYY");
    }

    // If invalid, try to handle common date formats manually
    try {
      if (typeof dateString === "string") {
        // Handle YYYY-MM-DD format
        if (dateString.includes("-")) {
          const parts = dateString.split("-");
          if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        // Handle other formats if needed
      }
      return String(dateString); // Return as string if we can't format it
    } catch (error) {
      return String(dateString);
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

  // Add this function to handle Entry No changes and fetch data
  // Fix the handleEntryNoChange function
  const handleEntryNoChange = async (value) => {
    if (!value || value.length < 3) return; // Minimum length check

    try {
      setLoadingEntry(true);
      console.log("Fetching details for entry no:", value);

      // Fetch entry details
      const entryResponse = await axios.get(
        `${API_URL}/api/gatePassIn/getEntryNoDetails`,
        {
          params: {
            branchCode: loginBranchCode,
            client: loginClient,
            entryNo: value,
            finYear: loginFinYear,
            orgId: orgId,
          },
        }
      );

      console.log("Entry Response:", entryResponse.data);

      // Check if response has data
      if (entryResponse.data?.status && entryResponse.data.paramObjectsMap) {
        const entryDetails = entryResponse.data.paramObjectsMap.entryNoDetails;

        // Handle both array and object responses
        let entryData;
        if (Array.isArray(entryDetails)) {
          entryData = entryDetails[0]; // Take first item if array
        } else if (typeof entryDetails === "object") {
          entryData = entryDetails; // Use directly if object
        }

        if (entryData) {
          // Update form with entry details
          setFormData((prev) => ({
            ...prev,
            supplierShortName: entryData.supplierShortName || "",
            supplier: entryData.supplier || "",
            modeOfShipment: entryData.modeOfShipment || "",
            carrier: entryData.carrierShortName || entryData.carrier || "",
            vehicleType: entryData.vehicleType || "",
            contact: entryData.contact || "",
            driverName: entryData.driverName || "",
            securityName: entryData.securityName || "",
            vehicleNo: entryData.vehicleNo || "",
            goodsDesc: entryData.goodsDescription || "",
          }));

          // Fetch carrier list based on mode of shipment if available
          if (entryData.modeOfShipment) {
            getAllCarriers(entryData.modeOfShipment);
          }

          // Fetch fill details for the grid
          const fillResponse = await axios.get(
            `${API_URL}/api/gatePassIn/getEntryNoFillDetails`,
            {
              params: {
                branchCode: loginBranchCode,
                client: loginClient,
                entryNo: value,
                finYear: loginFinYear,
                orgId: orgId,
              },
            }
          );

          console.log("Fill Response:", fillResponse.data);

          if (fillResponse.data?.status && fillResponse.data.paramObjectsMap) {
            const fillDetails =
              fillResponse.data.paramObjectsMap.entryNoFillDetails;

            let fillData;
            if (Array.isArray(fillDetails)) {
              fillData = fillDetails;
            } else if (typeof fillDetails === "object") {
              fillData = [fillDetails]; // Wrap in array if single object
            } else {
              fillData = [];
            }

            // Transform fill details to match table structure
            const tableData = fillData.map((detail, index) => ({
              id: index + 1,
              qrCode: detail.qrCode || "",
              lr_Hawb_Hbl_No: detail.irNoHaw || "",
              invNo: detail.invoiceNo || "",
              invDate: detail.invoiceDate
                ? convertToDDMMYYYY(detail.invoiceDate)
                : null,
              partNo: detail.partNo || "",
              partDesc: detail.partDesc || detail.partDescription || "",
              sku: detail.sku || "",
              invQty: detail.invQty?.toString() || "0",
              recQty: detail.recQty?.toString() || "0",
              shortQty: detail.shortQty?.toString() || "0",
              damageQty: detail.damageQty?.toString() || "0",
              grnQty: detail.grnQty?.toString() || "0",
              batch_PalletNo: detail.batchNo || "",
              batchDate: detail.batchDate
                ? convertToDDMMYYYY(detail.batchDate)
                : null,
              expDate: detail.expDate
                ? convertToDDMMYYYY(detail.expDate)
                : null,
              remarks: detail.remarks || "",
            }));

            setLrTableData(tableData);
            showToast("success", "Entry details loaded successfully");
          }
        } else {
          showToast("warning", "No details found for this entry number");
        }
      } else {
        showToast("warning", "Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
      let errorMessage = "Failed to fetch entry details";

      if (error.response?.data?.paramObjectsMap?.message) {
        errorMessage = error.response.data.paramObjectsMap.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast("error", errorMessage);
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format("DD-MM-YYYY") : null;
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

  const handleTableChange = (idOrPagination, fieldOrFilters, valueOrSorter) => {
    // Check if this is a row data change (first parameter is id)
    if (
      typeof idOrPagination === "number" ||
      typeof idOrPagination === "string"
    ) {
      // This is a row data change
      const id = idOrPagination;
      const field = fieldOrFilters;
      let value = valueOrSorter; // Change const to let to allow reassignment

      // Prevent negative numbers for quantity fields
      if (["invQty", "recQty", "shortQty", "damageQty"].includes(field)) {
        const numValue = parseFloat(value);
        if (numValue < 0 || isNaN(numValue)) {
          value = "0"; // Set to 0 if negative or not a number
        }
      }

      setLrTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            const updatedRow = { ...row, [field]: value };

            // Calculate GRN QTY whenever relevant quantity fields change
            if (["invQty", "recQty", "shortQty", "damageQty"].includes(field)) {
              const recQty = parseFloat(updatedRow.recQty) || 0;
              const shortQty = parseFloat(updatedRow.shortQty) || 0;
              const damageQty = parseFloat(updatedRow.damageQty) || 0;

              // Validate that short + damage doesn't exceed received quantity
              if (shortQty + damageQty > recQty) {
                // You can show a warning toast here if needed
                console.warn(
                  "Short + Damage quantity cannot exceed Received quantity"
                );
              }

              // Calculate GRN QTY: Rec QTY - (Short QTY + Damage QTY)
              const grnQty = Math.max(0, recQty - (shortQty + damageQty));

              updatedRow.grnQty = grnQty.toString();
            }

            return updatedRow;
          }
          return row;
        })
      );
    } else {
      // This is a table control change (pagination, filters, sorter)
      const pagination = idOrPagination;
      const filters = fieldOrFilters;
      const sorter = valueOrSorter;

      // Your table control implementation here
      setPagination(pagination);
      setFilters(filters);
      setSorter(sorter);
      // Or any other logic you need for table changes
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
      invQty: "0",
      recQty: "0",
      shortQty: "0",
      damageQty: "0",
      grnQty: "0",
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

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  // Function to download Excel
  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0].format("YYYY-MM-DD");
      const toDate = selectedDateRange[1].format("YYYY-MM-DD");

      // Fetch all data from API
      const response = await axios.get(
        `${API_URL}/api/gatePassIn/gatePassIn?branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );

      if (response.data.status && response.data.paramObjectsMap.gatePassInVO) {
        // Filter data by date range on the client side
        const allGatePassData = response.data.paramObjectsMap.gatePassInVO;

        // Filter data based on the selected date range
        const filteredGatePassData = allGatePassData.filter((item) => {
          const docDate = item.docdate;
          return docDate >= fromDate && docDate <= toDate;
        });

        if (filteredGatePassData.length > 0) {
          // Format filtered data for Excel
          const excelData = formatDataForExcel(filteredGatePassData);

          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, "Gate Pass In Data");

          // Generate Excel file and download
          XLSX.writeFile(wb, `GatePassIn_${fromDate}_to_${toDate}.xlsx`);

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
  const formatDataForExcel = (gatePassData) => {
    const excelData = [];

    gatePassData.forEach((mainRecord) => {
      if (
        mainRecord.gatePassDetailsVO &&
        mainRecord.gatePassDetailsVO.length > 0
      ) {
        // Create a row for each detail record
        mainRecord.gatePassDetailsVO.forEach((detail) => {
          excelData.push({
            "Document ID": mainRecord.docId,
            "Document Date": mainRecord.docdate,
            "Entry Date": mainRecord.entryDate,
            Supplier: mainRecord.supplier,
            "Mode of Shipment": mainRecord.modeOfShipment,
            Carrier: mainRecord.carrier,
            "IR No/HAW": detail.irNoHaw,
            "Invoice No": detail.invoiceNo,
            "Invoice Date": detail.invoiceDate,
            "Part No": detail.partNo,
            "Part Description": detail.partDescription,
            SKU: detail.sku,
            "Invoice Qty": detail.invQty,
            "Received Qty": detail.recQty,
            "Short Qty": detail.shortQty,
            "Damage Qty": detail.damageQty,
            "GRN Qty": detail.grnQty,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
          });
        });
      } else {
        // Create a row even if there are no details
        excelData.push({
          "Document ID": mainRecord.docId,
          "Document Date": mainRecord.docdate,
          "Entry Date": mainRecord.entryDate,
          Supplier: mainRecord.supplier,
          "Mode of Shipment": mainRecord.modeOfShipment,
          Carrier: mainRecord.carrier,
          "IR No/HAW": "",
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
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
        });
      }
    });

    return excelData;
  };

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
                      background: "rgba(108, 99, 255, 0.3)",
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
                                  className="white-datepicker"
                                  value={
                                    formData.docDate
                                      ? dayjs(formData.docDate)
                                      : null
                                  }
                                  disabled
                                  format="DD-MM-YYYY"
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
                                  onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    setFormData({
                                      ...formData,
                                      entrySlNo: value,
                                    });
                                  }}
                                  onBlur={(e) =>
                                    handleEntryNoChange(e.target.value)
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleEntryNoChange(e.target.value);
                                    }
                                  }}
                                  disabled={formData.freeze}
                                  style={inputStyle}
                                  suffix={
                                    loadingEntry ? <Spin size="small" /> : null
                                  }
                                />
                                {loadingEntry && (
                                  <div
                                    style={{
                                      color: "white",
                                      fontSize: "12px",
                                      marginTop: "5px",
                                    }}
                                  >
                                    Loading entry details...
                                  </div>
                                )}
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
                                    formData.date
                                      ? dayjs(formData.date, "DD-MM-YYYY")
                                      : null
                                  } // Parse as DD/MM/YYYY
                                  onChange={(date) =>
                                    setFormData({
                                      ...formData,
                                      date: date
                                        ? date.format("DD-MM-YYYY")
                                        : null, // Store as DD/MM/YYYY
                                    })
                                  }
                                  format="DD-MM-YYYY"
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

                          {/* Inv Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.invDate
                                  ? dayjs(row.invDate, "DD-MM-YYYY")
                                  : null
                              } // Add format for parsing
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "invDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              format="DD-MM-YYYY"
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
                            <Input value={row.shortQty} readOnly />
                          </td>

                          {/* Damage QTY */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.damageQty || ""}
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
                          {/* Batch Date */}
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
                            />
                          </td>

                          {/* Exp Date */}
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
                    Gate Pass In List
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    View and manage Gate Pass In entries
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
                    placeholder="Search by Doc ID, Supplier, or Driver Name"
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
                        // marginRight: "20px",
                        // marginTop: "20px",
                        // border: "none",
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
                        Doc Date
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
                        Supplier
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Mode of Shipment
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Vehicle Type
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Driver Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Security Person
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
                          (item.driverName &&
                            item.driverName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`gatepass-${index}-${item.id}`}
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
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() => getGatePassById(item)}
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
                            {formatDate(item.docdate)}
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
                            {item.modeOfShipment}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.vehicleType}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.driverName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.securityName}
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

        {/* Bulk Upload Dialog */}
        {/* Bulk Upload Dialog */}
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
          screen="GatePassIn"
        />
        {/* </Modal> */}
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
  color: "white",
};

const selectStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.1)",
  color: "white",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};
