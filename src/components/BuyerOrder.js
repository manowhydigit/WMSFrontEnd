import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Tabs,
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
  RightCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import GridOnIcon from "@mui/icons-material/GridOn";
import dayjs from "dayjs";
import axios from "axios";
import "./PS.css";
import { showToast } from "../utils/toast-component";

import sampleFile from "../assets/sample-files/sample_data_buyerorder.xls";
import * as XLSX from "xlsx";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import { Modal, message } from "antd";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const BuyerOrder = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginBranch, setLoginBranch] = useState(
    localStorage.getItem("branch")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [orderNoInput, setOrderNoInput] = useState("");

  const [skuDetailsTableData, setSkuDetailsTableData] = useState([
    {
      id: 1,
      partNo: "",
      partDesc: "",
      batchNo: "",
      availQty: "",
      qty: "",
      rowBatchNoList: [],
    },
  ]);

  const lrNoDetailsRefs = useRef([]);

  const [fieldErrors, setFieldErrors] = useState({
    billto: "",
    branch: "",
    branchCode: "",
    buyerShortName: "",
    client: "",
    company: "",
    createdBy: "",
    currency: "",
    customer: "",
    docDate: new Date(),
    exRate: "",
    finYear: "",
    freeze: false,
    invoiceDate: "",
    invoiceNo: "",
    location: "",
    orderDate: "",
    orderNo: "",
    orgId: orgId,
    reMarks: "",
    refDate: "",
    refNo: "",
    shipTo: "",
  });

  const [skuDetails, setSkuDetails] = useState([
    {
      id: 1,
      availQty: 100,
      batchNo: "",
      partDesc: "",
      partNo: "",
      qcflag: true,
      remarks: "TEST",
      sku: "KG",
    },
  ]);

  const [skuDetailsTableErrors, setSkuDetailsTableErrors] = useState([
    {
      availQty: "",
      batchNo: "",
      partDesc: "",
      partNo: "",
      qcflag: "",
      qty: "",
      remarks: "",
      sku: "",
    },
  ]);

  const [buyerList, setBuyerList] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const paginatedData = listViewData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [listView, setListView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(listViewData);
  }, [listViewData]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(listViewData);
      return;
    }

    const filtered = listViewData.filter(
      (item) =>
        item.orderNo?.toLowerCase().includes(value.toLowerCase()) ||
        item.buyer?.toLowerCase().includes(value.toLowerCase()) ||
        item.buyerShortName?.toLowerCase().includes(value.toLowerCase()) ||
        item.billToName?.toLowerCase().includes(value.toLowerCase()) ||
        item.billToShortName?.toLowerCase().includes(value.toLowerCase()) ||
        item.status?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  // Add Excel export function

  // Add these helper functions near the top of your component, after the state declarations

  const filterDataByDateRange = (data, dateRange) => {
    if (dateRange.length !== 2) return data;

    try {
      const fromDate = dayjs(dateRange[0], "DD-MM-YYYY");
      const toDate = dayjs(dateRange[1], "DD-MM-YYYY");

      return data.filter((item) => {
        if (!item.orderDate) return false;

        let itemDate;
        try {
          // Try to parse the date in various formats
          if (item.orderDate.includes("-")) {
            const parts = item.orderDate.split("-");
            if (parts[0].length === 4) {
              // YYYY-MM-DD format
              itemDate = dayjs(item.orderDate, "YYYY-MM-DD");
            } else if (parts[0].length === 2) {
              // DD-MM-YYYY format
              itemDate = dayjs(item.orderDate, "DD-MM-YYYY");
            }
          } else {
            // Try parsing as ISO string or other formats
            itemDate = dayjs(item.orderDate);
          }

          // Check if date parsing was successful
          if (!itemDate.isValid()) {
            console.warn("Invalid date format:", item.orderDate);
            return false;
          }

          // Check if item date is within the selected range (inclusive)
          return (
            itemDate.isSameOrAfter(fromDate, "day") &&
            itemDate.isSameOrBefore(toDate, "day")
          );
        } catch (error) {
          console.warn("Error parsing date:", item.orderDate, error);
          return false;
        }
      });
    } catch (error) {
      console.error("Error in date range filtering:", error);
      return data;
    }
  };
  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0];
      const toDate = selectedDateRange[1];

      // Fetch Buyer Order data from the API endpoint (SERVER-SIDE)
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getAllBuyerOrderByOrgId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      if (response.data.status && response.data.paramObjectsMap.buyerOrderVO) {
        const allBuyerOrderData = response.data.paramObjectsMap.buyerOrderVO;

        // Filter data based on the selected date range (CLIENT-SIDE)
        const filteredBuyerOrderData = allBuyerOrderData.filter((item) => {
          // Convert the date string to a format that can be compared
          let itemDate;
          if (item.orderDate) {
            // Handle different date formats that might come from the API
            if (item.orderDate.includes("-")) {
              const parts = item.orderDate.split("-");
              if (parts[0].length === 4) {
                // YYYY-MM-DD format
                itemDate = item.orderDate;
              } else if (parts[0].length === 2) {
                // DD-MM-YYYY format, convert to YYYY-MM-DD for comparison
                itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            } else {
              // If it's a timestamp or other format, try to parse it
              itemDate = dayjs(item.orderDate).format("YYYY-MM-DD");
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

        if (filteredBuyerOrderData.length > 0) {
          // Format filtered data for Excel
          const excelData = formatBuyerOrderDataForExcel(
            filteredBuyerOrderData
          );

          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, "Buyer Order Data");

          // Generate Excel file and download
          XLSX.writeFile(wb, `Buyer_Order_${fromDate}_to_${toDate}.xlsx`);

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

  const fetchSkuDetailsByOrder = async (orderNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getBoSkuDetails?branchCode=${loginBranchCode}&client=${loginClient}&orderno=${encodeURIComponent(
          orderNumber
        )}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      console.log("Order-based SKU details response:", response);

      if (response.data.status === true) {
        const skuDetails = response.data.paramObjectsMap.skuDetails || [];
        console.log("Order-based SKU details:", skuDetails);

        // Transform the API response to match your table structure
        const transformedData = skuDetails.map((item, index) => ({
          id: index + 1,
          partNo: item.partNo || "",
          partDesc: item.partDesc || "",
          sku: item.sku || "",
          batchNo: item.batch || "",
          avlqty: item.sqty || 0,
          orderqty: item.qty || 0, // Using sqty as quantity
          rowBatchNoList: [], // Will be populated later if needed
          expDate: item.expDate || "",
        }));

        setOrderItems(transformedData);
        showToast(
          "success",
          `Loaded ${transformedData.length} items from order ${orderNumber}`
        );
      } else {
        showToast("error", "No SKU details found for this order");
      }
    } catch (error) {
      console.error("Error fetching order-based SKU details:", error);
      showToast("error", "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  // Format the Buyer Order data for Excel export
  const formatBuyerOrderDataForExcel = (buyerOrderData) => {
    const excelData = [];

    buyerOrderData.forEach((mainRecord) => {
      if (
        mainRecord.buyerOrderDetailsVO &&
        mainRecord.buyerOrderDetailsVO.length > 0
      ) {
        // Create a row for each detail record
        mainRecord.buyerOrderDetailsVO.forEach((detail) => {
          excelData.push({
            "Order No": mainRecord.orderNo,
            "Order Date": formatDateForDisplay(mainRecord.orderDate),
            "Document No": mainRecord.docId,
            "Document Date": formatDateForDisplay(mainRecord.docDate),
            Buyer: mainRecord.buyer || mainRecord.buyerShortName,
            "Bill To": mainRecord.billToName || mainRecord.billToShortName,
            "Ship To": mainRecord.shipToName || mainRecord.shipToShortName,
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            SKU: detail.sku,
            "Batch No": detail.batchNo,
            "Available Qty": detail.availQty,
            "Order Qty": detail.qty,
            "Expiry Date": formatDateForDisplay(detail.expDate),
            Status: mainRecord.status,
            Remarks: detail.remarks,
            "Created By": mainRecord.createdBy,
            Branch: mainRecord.branch,
          });
        });
      } else {
        // Create a row even if there are no details
        excelData.push({
          "Order No": mainRecord.orderNo,
          "Order Date": formatDateForDisplay(mainRecord.orderDate),
          "Document No": mainRecord.docId,
          "Document Date": formatDateForDisplay(mainRecord.docDate),
          Buyer: mainRecord.buyer || mainRecord.buyerShortName,
          "Bill To": mainRecord.billToName || mainRecord.billToShortName,
          "Ship To": mainRecord.shipToName || mainRecord.shipToShortName,
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "Batch No": "",
          "Available Qty": "",
          "Order Qty": "",
          "Expiry Date": "",
          Status: mainRecord.status,
          Remarks: "",
          "Created By": mainRecord.createdBy,
          Branch: mainRecord.branch,
        });
      }
    });

    return excelData;
  };

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";

    try {
      // Handle various date formats
      let date;

      if (typeof dateString === "string") {
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

      return date && date.isValid() ? date.format("DD-MM-YYYY") : "";
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return "";
    }
  };
  // Form state
  const [formData, setFormData] = useState({
    docid: "",
    docdate: dayjs().format("DD-MM-YYYY"),
    orderNo: "",
    orderDate: dayjs().format("DD-MM-YYYY"),
    buyer: "",
    buyerName: "",
    buyerShortName: "", // Add this
    billTo: "", // Add this
    billToName: "", // Add this
    billToShortName: "", // Add this
    shipTo: "", // Add this
    shipToName: "", // Add this
    shipToShortName: "", // Add this
    supplier: "",
    supplierName: "",
    deliveryDate: dayjs().add(7, "day").format("DD-MM-YYYY"),
    paymentTerms: "NET 30",
    shippingMethod: "ROAD",
    remarks: "",
    status: "DRAFT",
    totalAmount: 0,
    totalQuantity: 0,
  });

  // Order items table
  const [orderItems, setOrderItems] = useState([]);

  // Get new order number
  const getNewOrderNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getBuyerOrderDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      setFormData((prev) => ({
        ...prev,
        docid: response.data?.paramObjectsMap?.BuyerOrderDocId,
      }));
    } catch (error) {
      console.error("Error fetching order number:", error);
    }
  };

  const getAllCurrencies = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/currency?orgid=${orgId}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setCurrencyList(response.paramObjectsMap.currencyVO);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllActiveBranches = async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/branch?orgid=${orgId}`
      );
      if (response.status === true) {
        const branchData = response.data.paramObjectsMap.branchVO
          .filter((row) => row.active === "Active")
          .map(({ id, branch, branchCode }) => ({ id, branch, branchCode }));

        return branchData;
      } else {
        console.error("API Error:", response);
        return response;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  };

  const getAllActiveBuyer = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/buyer?cbranch=${loginBranchCode}&client=${loginClient}&orgid=${orgId}`
      );
      console.log("API Response:", response.data);

      if (
        response.data &&
        response.data.paramObjectsMap &&
        response.data.paramObjectsMap.buyerVO
      ) {
        const buyer = response.data.paramObjectsMap.buyerVO;
        setBuyerList(buyer);

        console.log("Processed BuyerData:", buyerList);
        // return buyerList;
      } else {
        console.error("API Error: Missing buyerVO data");
        return [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // Better to throw the error rather than return it
    }
  };

  const getAllBuyerOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getAllBuyerOrderByOrgId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);

      if (response.data && response.data.status === true) {
        const buyerOrders = response.data.paramObjectsMap?.buyerOrderVO;
        if (buyerOrders && Array.isArray(buyerOrders)) {
          setListViewData(buyerOrders);
          console.log("Buyer orders set:", buyerOrders);
        } else {
          console.error("Invalid buyer orders data:", buyerOrders);
          setListViewData([]);
        }
      } else {
        console.error("API returned false status:", response.data);
        setListViewData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListViewData([]);
    }
  };

  const getBuyerOrderById = async (order) => {
    console.log("THE SELECTED BUYER ID IS:", order.id);
    setEditId(order.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getAllBuyerOrderById?id=${order.id}`
      );
      console.log("API Response:", response.data);

      // FIX: Access response.data instead of response directly
      if (
        response.data &&
        response.data.status === true &&
        response.data.paramObjectsMap &&
        response.data.paramObjectsMap.buyerOrderVO
      ) {
        const particularBuyerOrder = response.data.paramObjectsMap.buyerOrderVO;
        console.log("THE PARTICULAR BUYER ORDER IS:", particularBuyerOrder);

        getAllCurrencies();

        // Populate form data - FIXED: Use proper field names from API response
        setFormData((prev) => ({
          ...prev,
          docid: particularBuyerOrder.docId || "",
          docdate: particularBuyerOrder.docDate || dayjs().format("DD-MM-YYYY"),
          orderNo: particularBuyerOrder.orderNo || "",
          orderDate:
            particularBuyerOrder.orderDate || dayjs().format("DD-MM-YYYY"),
          invoiceNo: particularBuyerOrder.invoiceNo || "",
          invoiceDate: particularBuyerOrder.invoiceDate || "",
          buyerShortName: particularBuyerOrder.buyerShortName || "",
          buyerName: particularBuyerOrder.buyer || "",
          billToShortName: particularBuyerOrder.billToShortName || "",
          billToName: particularBuyerOrder.billToName || "",
          shipToShortName: particularBuyerOrder.shipToShortName || "",
          shipToName: particularBuyerOrder.shipToName || "",
          refNo: particularBuyerOrder.refNo || "",
          refDate: particularBuyerOrder.refDate || "",
          remarks: particularBuyerOrder.remarks || "",
          freeze: particularBuyerOrder.freeze || false,
        }));

        // Set order items with proper structure
        const orderItemsData = particularBuyerOrder.buyerOrderDetailsVO.map(
          (bo, index) => ({
            id: bo.id || index + 1,
            partNo: bo.partNo || "",
            partDesc: bo.partDesc || "",
            sku: bo.sku || "",
            batchNo: bo.batchNo || "",
            availQty: bo.availQty || 0,
            quantity: bo.qty || 0,
            rowBatchNoList: [], // Will be populated later
            expDate: bo.expDate || "",
            avlqty: bo.availQty || 0, // Add this for consistency
            orderqty: bo.qty || 0,
          })
        );

        setOrderItems(orderItemsData);

        // Fetch batch numbers for each part
        for (const item of orderItemsData) {
          if (item.partNo) {
            await getBatchNo(item.partNo, item);
          }
        }

        setViewMode("form"); // Switch to form view for editing
      } else {
        console.error("API Error or Unexpected Response:", response.data);
        showToast("error", "Failed to fetch buyer order details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("error", "Error fetching buyer order details");
    }
  };

  const getAllPartNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getPartNoByBuyerOrder?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      setPartNoList(response.data.paramObjectsMap.partNoDetails);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    }
  };

  const getBatchNo = async (selectedPartNo, row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getBatchByBuyerOrder?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&partNo=${selectedPartNo}&warehouse=${loginWarehouse}`
      );
      console.log("THE FROM BIN LIST IS:", response);

      setOrderItems((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                rowBatchNoList: response.data.paramObjectsMap.skuDetails || [],
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleBatchNoChange = (row, value) => {
    const selectedBatch = row.rowBatchNoList.find(
      (batch) => batch.batch === value
    );

    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              batchNo: value,
              expDate: selectedBatch?.expDate || "",
              availQty: selectedBatch?.availQty || "", // Add this if available
            }
          : item
      )
    );

    // Call getAvailQty with the selected batch number and part number
    getAvailQty(value, row.partNo, row);
  };

  const getAvailQty = async (selectedBatchNo, selectedPartNo, row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getAvlQtyForBuyerOrder?batchNo=${selectedBatchNo}&branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&partNo=${selectedPartNo}&warehouse=${loginWarehouse}`
      );
      console.log("Available Qty response:", response);

      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                avlqty: response.data.paramObjectsMap.avlQty || 0,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }
  };

  const handleFullGridFunction = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getBoSkuDetails?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      console.log("THE WAREHOUSE IS:", response);
      if (response.data.status === true) {
        const sku = response.data.paramObjectsMap.skuDetails;
        console.log("THE SKU DETAILS ARE:", sku);

        setSkuDetails(
          sku.map((row) => ({
            id: row.id,
            availQty: row.sqty,
            batchNo: row.batch,
            partDesc: row.partDesc,
            partNo: row.partNo,
            qcflag: row.qcflag,
            qty: row.qty,
            remarks: row.remarks,
            sku: row.sku,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleFullGrid = () => {
    setModalOpen(true);
    handleFullGridFunction();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd } = e.target;

    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;
    const branchNameRegex = /^[A-Za-z0-9@_\-*]*$/;
    const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = "";

    switch (name) {
      case "id":
      case "shortName":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabetic characters are allowed";
        }
        break;
      case "pan":
        if (!alphaNumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid Format";
        }
        break;
      case "branchName":
        if (!branchNameRegex.test(value)) {
          errorMessage =
            "Only alphanumeric characters and @, _, -, * are allowed";
        }
        break;
      case "mobile":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid Format";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === "active") {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else if (name === "buyerShortName") {
        const selectedBuyer = buyerList?.find(
          (row) => row.buyerShortName === value
        );
        console.log("buyer", selectedBuyer);
        if (selectedBuyer) {
          setFormData((prevData) => ({
            ...prevData,
            buyerShortName: value,
            buyerFullName: selectedBuyer.buyer,
          }));
        }
      } else if (name === "billTo") {
        const selectedBillTo = buyerList?.find(
          (row) => row.buyerShortName === value
        );
        if (selectedBillTo) {
          setFormData((prevData) => ({
            ...prevData,
            billTo: value,
            billToName: selectedBillTo.buyer,
            billToShortName: selectedBillTo.buyerShortName,
          }));
        }
      } else if (name === "shipTo") {
        const selectedShipTo = buyerList?.find(
          (row) => row.buyerShortName === value
        );
        if (selectedShipTo) {
          setFormData((prevData) => ({
            ...prevData,
            shipTo: value,
            shipToName: selectedShipTo.buyer,
            shipToShortName: selectedShipTo.buyerShortName,
          }));
        }
      } else {
        const formattedValue = value.toUpperCase();
        setFormData((prevData) => ({ ...prevData, [name]: formattedValue }));
      }

      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    // Preserve cursor position for text inputs
    if (e.target.setSelectionRange && e.target.type !== "checkbox") {
      setTimeout(() => {
        e.target.setSelectionRange(selectionStart, selectionEnd);
      }, 0);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    getNewOrderNo();
    getAllCurrencies();
    getAllActiveBranches(orgId);
    getAllBuyerOrders();
    getAllActiveBuyer(loginBranch, loginClient, orgId);
    getAllPartNo();
  }, []);

  useEffect(() => {
    lrNoDetailsRefs.current = skuDetailsTableData.map((_, index) => ({
      partNo: lrNoDetailsRefs.current[index]?.partNo || React.createRef(),
      batchNo: lrNoDetailsRefs.current[index]?.batchNo || React.createRef(),
      qty: lrNoDetailsRefs.current[index]?.qty || React.createRef(),
    }));
  }, [skuDetailsTableData]);

  // Calculate totals when order items change
  useEffect(() => {
    const totalQty = orderItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const totalAmt = orderItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
    }));
  }, [orderItems]);

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.format("DD-MM-YYYY") : "",
    }));
  };

  const handleBuyerChange = (value) => {
    const selectedBuyer = buyerList.find((buy) => buy.buyerShortName === value);
    setFormData((prev) => ({
      ...prev,
      buyer: value,
      buyerName: selectedBuyer?.buyer || "", // Set the full name
    }));
  };

  // In handleAddItem:
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      sku: "",
      batchNo: "",
      availQty: "",
      quantity: "",
      rowBatchNoList: [],
      deliveryDate: formData.deliveryDate, // Already in DD-MM-YYYY format
      status: "PENDING",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // If partNo changes, fetch batch numbers
    if (field === "partNo" && value) {
      const item = orderItems.find((i) => i.id === id);
      if (item) {
        getBatchNo(value, item);
      }
    }

    // Calculate amount if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      const item = orderItems.find((i) => i.id === id);
      if (item) {
        const qty = field === "quantity" ? value : item.quantity;
        const price = field === "unitPrice" ? value : item.unitPrice;
        const amount = (parseFloat(qty) || 0) * (parseFloat(price) || 0);

        setOrderItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, amount: amount.toFixed(2) } : item
          )
        );
      }
    }
  };

  const handleDeleteItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === skuDetailsTableData) {
      return (
        !lastRow.partNo || !lastRow.partDesc || !lastRow.batchNo || !lastRow.qty
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === skuDetailsTableData) {
      setSkuDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          partNo: !table[table.length - 1].partNo ? "Part No is required" : "",
          partDesc: !table[table.length - 1].partDesc
            ? "Part Desc is required"
            : "",
          qty: !table[table.length - 1].qty ? "Qty is required" : "",
        };
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === "Tab" && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      } else {
        handleAddRow();
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(skuDetailsTableData)) {
      displayRowError(skuDetailsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      availQty: "",
      rowBatchNoList: [],
      batchNo: "",
      partDesc: "",
      partNo: "",
      qcflag: "",
      qty: "",
      remarks: "",
      sku: "",
    };
    setSkuDetailsTableData([...skuDetailsTableData, newRow]);
    setSkuDetailsTableErrors([
      ...skuDetailsTableErrors,
      {
        availQty: "",
        batchNo: "",
        partDesc: "",
        partNo: "",
        qcflag: "",
        qty: "",
        remarks: "",
        sku: "",
      },
    ]);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(skuDetails.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSaveSelectedRows = async () => {
    const selectedData = selectedRows.map((index) => skuDetails[index]);

    setSkuDetailsTableData((prev) => [...selectedData]);

    console.log("Data selected:", selectedData);

    setSelectedRows([]);
    setSelectAll(false);
    handleCloseModal();

    try {
      await Promise.all(
        selectedData.map(async (data, idx) => {
          await getBatchNo(data.partNo, data);
        })
      );
    } catch (error) {
      console.error("Error processing selected data:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      docid: "",
      docdate: dayjs().format("DD-MM-YYYY"),
      orderNo: "",
      orderDate: dayjs().format("DD-MM-YYYY"),
      customer: "",
      customerName: "",
      supplier: "",
      supplierName: "",
      deliveryDate: dayjs().add(7, "day").format("DD-MM-YYYY"),
      paymentTerms: "NET 30",
      shippingMethod: "ROAD",
      remarks: "",
      status: "DRAFT",
      totalAmount: 0,
      totalQuantity: 0,
    });
    setOrderItems([]);
    setEditId("");
    getNewOrderNo();
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

  // Add this function to safely format numbers
  const safeToFixed = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.00";
    }
    return Number(value).toFixed(decimals);
  };
  const handleSaveOrder = async () => {
    if (loading) return;
    const errors = {};
    let firstInvalidFieldRef = null;

    // ✅ Validate main form fields
    if (!formData.orderNo) {
      errors.orderNo = "Order No is required";
    }
    if (!formData.orderDate) {
      errors.orderDate = "Order Date is required";
    }
    if (!formData.buyerShortName) {
      errors.buyerShortName = "Buyer is required";
    }

    // ✅ Validate table data
    let orderItemsValid = true;
    const newTableErrors = orderItems.map((row, index) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        orderItemsValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "Batch No is required";
        orderItemsValid = false;
      }
      if (!row.quantity || row.quantity <= 0) {
        rowErrors.quantity = "Valid Qty is required";
        orderItemsValid = false;
      }
      return rowErrors;
    });

    // ✅ Update state with errors
    setSkuDetailsTableErrors(newTableErrors);
    setFieldErrors(errors);

    // ✅ Proceed with form submission only if all validations pass
    setIsSubmitting(true);

    // Prepare order items data
    const buyerOrderDetailsDTO = orderItems.map((item) => ({
      ...(editId && { id: item.id }),
      partNo: item.partNo,
      partDesc: item.partDesc,
      sku: item.sku,
      batchNo: item.batchNo,
      availQty: item.avlqty || 0,
      qty: item.quantity,
      remarks: item.remarks || "",
      expDate: item.expDate || "",
    }));

    // Prepare the main form data
    const saveFormData = {
      ...(editId && { id: editId }),
      branch: loginBranch,
      branchCode: loginBranchCode,
      buyerOrderDetailsDTO,
      client: loginClient,
      createdBy: loginUserName,
      buyer: formData.billToName || "",
      buyerShortName: formData.billToShortName,
      // Add missing required fields with default values
      billToName: formData.billToName || "",
      billToShortName: formData.billToShortName || "",
      customer: formData.buyer || "",

      docDate: formData.docdate ? formatDateForAPI(formData.docdate) : null,

      docId: formData.docid || "",
      finYear: loginFinYear, // You might need to calculate this
      invoiceDate: formData.invoiceDate
        ? formatDateForAPI(formData.invoiceDate)
        : null,
      invoiceNo: formData.invoiceNo || "",
      orderDate: formData.orderDate
        ? formatDateForAPI(formData.orderDate)
        : null,
      orderNo: formData.orderNo,
      orgId: parseInt(orgId),
      refDate: formData.refDate ? formatDateForAPI(formData.refDate) : null,
      refNo: formData.refNo || "",
      shipToName: formData.shipToName || "",
      shipToShortName: formData.shipToShortName || "",
      warehouse: loginWarehouse,
      // Optional fields from your original code
      ...(formData.deliveryDate && { deliveryDate: formData.deliveryDate }),
      ...(formData.paymentTerms && { paymentTerms: formData.paymentTerms }),
      ...(formData.remarks && { remarks: formData.remarks }),
      ...(formData.shippingMethod && {
        shippingMethod: formData.shippingMethod,
      }),
      ...(formData.status && { status: formData.status }),
      ...(formData.totalAmount && { totalAmount: formData.totalAmount }),
      ...(formData.totalQuantity && { totalQuantity: formData.totalQuantity }),
    };
    console.log("DATA TO SAVE IS:", saveFormData);

    try {
      const response = await axios.put(
        `${API_URL}/api/buyerOrder/createUpdateBuyerOrder`,
        saveFormData
      );

      console.log("API Response:", response);

      if (response.data.status === true) {
        handleClear();
        getAllBuyerOrders();
        showToast(
          "success",
          editId
            ? "Buyer Order Updated Successfully"
            : "Buyer Order created successfully"
        );
      } else {
        showToast(
          "error",
          response.data?.paramObjectsMap?.errorMessage ||
            "Buyer Order creation failed"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Buyer Order creation failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllBuyerOrders();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  const handleClose = () => {
    setFormData({
      customer: "",
      orderDate: "",
      pan: "",
      contactPerson: "",
      mobile: "",
      gstReg: "",
      email: "",
      groupOf: "",
      tanNo: "",
      address: "",
      country: "",
      state: "",
      city: "",
      gst: "",
      active: true,
    });
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

  const datePickerStyle = {
    width: "80%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const selectStyle = {
    width: "90%",
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
                    Buyer Order
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage buyer orders
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
                  onClick={handleSaveOrder}
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
                    width: "100%",
                  }}
                >
                  <Tabs
                    className="white-tabs"
                    defaultActiveKey="1"
                    style={{ color: "#fff" }}
                  >
                    <TabPane
                      tab="Order Information"
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
                          {/* First Row - 5 columns */}
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
                                  name="orderNo"
                                  value={formData.docid}
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
                                    Doc Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={
                                    formData.docdate
                                      ? dayjs(formData.docdate, "DD-MM-YYYY")
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("docdate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled={!!editId}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Order No
                                  </span>
                                }
                              >
                                <Input.Search
                                  name="orderNo"
                                  value={formData.orderNo}
                                  onChange={handleInputChange}
                                  onSearch={() =>
                                    fetchSkuDetailsByOrder(formData.orderNo)
                                  }
                                  enterButton={<SearchOutlined />}
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
                                    Order Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={
                                    formData.orderDate
                                      ? dayjs(formData.orderDate, "DD-MM-YYYY")
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("orderDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled={!!editId}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Buyer *</span>
                                }
                              >
                                <Select
                                  showSearch
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.buyerShortName} // Change this to buyerShortName
                                  onChange={handleBuyerChange}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!!editId}
                                >
                                  {buyerList.map((buy) => (
                                    <Option
                                      key={buy.buyerShortName}
                                      value={buy.buyerShortName}
                                    >
                                      {buy.buyerShortName}
                                      {/* Show both in dropdown */}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyerName}
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
                          </Row>

                          {/* Second Row - 5 columns */}
                          <Row gutter={16}>
                            {/* Bill To Section */}
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bill To *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.billToShortName}
                                  onChange={(value) => {
                                    const selectedBillTo = buyerList.find(
                                      (buy) => buy.buyerShortName === value
                                    );
                                    setFormData((prev) => ({
                                      ...prev,
                                      billToShortName: value,
                                      billToName: selectedBillTo?.buyer || "",
                                    }));
                                  }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {buyerList.map((buy) => (
                                    <Option
                                      key={buy.buyerShortName}
                                      value={buy.buyerShortName}
                                    >
                                      {buy.buyerShortName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bill To Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.billToName}
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

                            {/* Ship To Section */}
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Ship To *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.shipToShortName}
                                  onChange={(value) => {
                                    const selectedShipTo = buyerList.find(
                                      (buy) => buy.buyerShortName === value
                                    );
                                    setFormData((prev) => ({
                                      ...prev,
                                      shipToShortName: value,
                                      shipToName: selectedShipTo?.buyer || "",
                                    }));
                                  }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {buyerList.map((buy) => (
                                    <Option
                                      key={buy.buyerShortName}
                                      value={buy.buyerShortName}
                                    >
                                      {buy.buyerShortName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Ship To Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.shipToName}
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
                                    Delivery Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={
                                    formData.deliveryDate
                                      ? dayjs(
                                          formData.deliveryDate,
                                          "DD-MM-YYYY"
                                        )
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("deliveryDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Payment Terms
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.paymentTerms}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentTerms: value,
                                    }))
                                  }
                                >
                                  <Option value="NET 30">NET 30</Option>
                                  <Option value="NET 45">NET 45</Option>
                                  <Option value="NET 60">NET 60</Option>
                                  <Option value="CASH">CASH</Option>
                                  <Option value="ADVANCE">ADVANCE</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Shipping Method
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.shippingMethod}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      shippingMethod: value,
                                    }))
                                  }
                                >
                                  <Option value="ROAD">ROAD</Option>
                                  <Option value="AIR">AIR</Option>
                                  <Option value="SEA">SEA</Option>
                                  <Option value="RAIL">RAIL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Status</span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.status}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      status: value,
                                    }))
                                  }
                                >
                                  <Option value="DRAFT">DRAFT</Option>
                                  <Option value="CONFIRMED">CONFIRMED</Option>
                                  <Option value="CANCELLED">CANCELLED</Option>
                                  <Option value="COMPLETED">COMPLETED</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Remarks</span>
                                }
                              >
                                <Input
                                  name="remarks"
                                  value={formData.remarks}
                                  onChange={handleInputChange}
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

              {/* Order Items Table */}
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
                        icon={<GridOnIcon />}
                        onClick={fetchSkuDetailsByOrder}
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
                        onClick={() => setOrderItems([])}
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
                        <col style={{ width: "60px" }} /> {/* Action */}
                        <col style={{ width: "60px" }} /> {/* S.No */}
                        <col style={{ width: "150px" }} /> {/* Part No */}
                        <col style={{ width: "200px" }} /> {/* Part Desc */}
                        <col style={{ width: "100px" }} /> {/* Quantity */}
                        <col style={{ width: "100px" }} /> {/* Unit Price */}
                        <col style={{ width: "120px" }} /> {/* Amount */}
                        <col style={{ width: "120px" }} /> {/* Delivery Date */}
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
                            Sku *
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
                            Order Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px dashed white",
                              color: "white",
                            }}
                          >
                            {/* Action */}
                            <td style={{ padding: "8px", textAlign: "center" }}>
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
                              <Select
                                showSearch
                                style={selectStyle}
                                value={item.partNo}
                                onChange={(value) => {
                                  // Find the selected part from partNoList
                                  const selectedPart = partNoList.find(
                                    (p) => p.partNo === value
                                  );

                                  // Update partNo, partDesc, and sku
                                  handleItemChange(item.id, "partNo", value);
                                  handleItemChange(
                                    item.id,
                                    "partDesc",
                                    selectedPart?.description ||
                                      selectedPart?.partDesc ||
                                      ""
                                  );
                                  handleItemChange(
                                    item.id,
                                    "sku",
                                    selectedPart?.sku || ""
                                  );
                                  getBatchNo(value, item);
                                }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {partNoList.map((part) => (
                                  <Option key={part.partNo} value={part.partNo}>
                                    {part.partNo}
                                  </Option>
                                ))}
                              </Select>
                            </td>

                            {/* Part Desc */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.partDesc}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Quantity */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.sku}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>

                            {/* Unit Price */}
                            {/* Batch No - Changed to Dropdown */}
                            <td style={{ padding: "8px" }}>
                              <Select
                                showSearch
                                style={selectStyle}
                                value={item.batchNo}
                                onChange={(value) =>
                                  handleBatchNoChange(item, value)
                                }
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                disabled={!item.partNo} // Disable if no part is selected
                              >
                                {item.rowBatchNoList?.map((batch) => (
                                  <Option key={batch.batch} value={batch.batch}>
                                    {batch.batch}
                                  </Option>
                                ))}
                              </Select>
                            </td>

                            {/* Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.avlqty}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input value={item.orderqty} style={inputStyle} />
                            </td>
                            {/* Status */}
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
                        Total Quantity: {formData.totalQuantity}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text style={{ color: "white" }}>
                        Total Amount: {safeToFixed(formData.totalAmount)}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "80vh",
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
                {/* <Button
                  icon={<UnorderedListOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginLeft: "870px",
                    marginRight: "-20px",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  {viewMode === "form" ? "List" : "Form"}
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
                  marginTop: "40px",
                  marginLeft: "60px",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
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
                    Add Entry
                  </Button>
                </Space>
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
                        Order No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Order Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Customer
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
                        Total Amount
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
                    {paginatedData
                      .filter(
                        (item) =>
                          !searchTerm ||
                          (item.docId &&
                            item.docId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.orderNo &&
                            item.orderNo
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.buyer &&
                            item.buyer
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((order, index) => (
                        <tr
                          key={`order-${index}-${order.id}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <td>
                            {" "}
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() =>
                                order && order.id
                                  ? getBuyerOrderById(order)
                                  : alert("Invalid row data")
                              }
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
                            {order.orderNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {order.orderDate
                              ? dayjs(order.orderDate).format("DD-MM-YYYY")
                              : ""}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {order.buyer || order.buyerShortName || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {order.billToName || order.billToShortName || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {/* Use totalOrderQty instead of totalAmount */}
                            {order.totalOrderQty || 0}
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
                              className={`status-${(
                                order.status || "DRAFT"
                              ).toLowerCase()}`}
                            >
                              {order.status || "DRAFT"}
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
                      currentPage === Math.ceil(listViewData.length / pageSize)
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
          apiUrl={`${API_URL}/api/buyerOrder/ExcelUploadForBuyerOrder?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&type=DOC&warehouse=${loginWarehouse}`}
          screen="Buyer Order"
        />
        {/* </Modal> */}
      </div>
    </ConfigProvider>
  );
};

export default BuyerOrder;
