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
  Spin,
  Typography,
  Table,
  Select,
  Form,
  Checkbox,
  Divider,
  Tabs,
  Space,
  message,
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
  BarcodeOutlined,
  QrcodeOutlined,
  PrinterOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import axios from "axios";
import "./PS.css";

const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const DeliveryChallan = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editId, setEditId] = useState("");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );
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
  const [listViewData, setListViewData] = useState([]);
  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deliveryChallanDocId, setDeliveryChallanDocId] = useState("");
  const [editBuyerOrderNo, setEditBuyerOrderNo] = useState("");

  const [showScanner, setShowScanner] = useState(false);

  // Helper function to safely convert to Day.js
  // Helper function to safely convert to Day.js with proper format
  const safeDayjs = (dateValue, format = "YYYY-MM-DD") => {
    if (!dateValue) return null;
    if (dayjs.isDayjs(dateValue)) return dateValue;

    // Try to parse with different formats
    const date = dayjs(dateValue, format);
    return date.isValid() ? date : null;
  };

  // Helper function to format dates for display
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return "";
    const date = safeDayjs(dateValue);
    return date ? date.format("DD-MM-YYYY") : "";
  };

  // Helper function to format dates for API (YYYY-MM-DD)
  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return null;
    const date = safeDayjs(dateValue);
    return date && date.isValid() ? date.format("YYYY-MM-DD") : null;
  };

  // Special function to handle boDate formatting
  const formatBoDateForAPI = (dateValue) => {
    if (!dateValue) return null;

    // If it's an ISO string with timezone, extract just the date part
    if (typeof dateValue === "string" && dateValue.includes("T")) {
      return dateValue.split("T")[0];
    }

    const date = safeDayjs(dateValue);
    return date && date.isValid() ? date.format("YYYY-MM-DD") : null;
  };

  // Form state
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    buyerOrderNo: "",
    pickReqDate: null,
    invoiceNo: "",
    containerNO: "",
    vechileNo: "",
    exciseInvoiceNo: "",
    commercialInvoiceNo: "",
    boDate: null,
    buyer: "",
    deliveryTerms: "",
    payTerms: "",
    grWaiverNo: "",
    grWaiverDate: dayjs(),
    bankName: "",
    grWaiverClosureDate: dayjs(),
    gatePassNo: "",
    gatePassDate: dayjs(),
    insuranceNo: "",
    billTo: "",
    shipTo: "",
    automailerGroup: "",
    docketNo: "",
    noOfBoxes: "",
    pkgUom: "",
    grossWeight: "",
    gwtUom: "",
    transportName: "",
    transporterDate: dayjs(),
    packingSlipNo: "",
    bin: "",
    taxType: "",
    remarks: "",
    freeze: false,
  });

  // Delivery Challan items table
  // Delivery Challan items table
  const [deliveryItems, setDeliveryItems] = useState([
    {
      key: 0, // Add key for React
      qrbarcode: "",
      pickRequestNo: "",
      prDate: null,
      partNo: "",
      partDescription: "",
      outBoundBin: "",
      shippedQty: "",
      unitRate: "",
      skuValue: "",
      discount: "",
      tax: "",
      gstTax: "",
      amount: "",
      sgst: "",
      cgst: "",
      igst: "",
      totalGst: "",
      billAmount: "",
      remarks: "",
    },
  ]);

  // Get buyer order table data
  // Get buyer order table data
  // Get buyer order table data - Updated approach
  const getBuyerOrderTableData = async (buyerOrderNo) => {
    try {
      // First, try to get the specific pick request data
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getAllPickRequestFromDeliveryChallan?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      console.log("All pick requests response:", response.data); // Debug log

      // Find the specific pick request by buyerOrderNo
      const pickRequests = response.data.paramObjectsMap.pickRequestVO || [];
      const selectedPickRequest = pickRequests.find(
        (pr) => pr.buyerOrderNo === buyerOrderNo
      );

      if (selectedPickRequest && selectedPickRequest.pickRequestDetailsVO) {
        const tableData = selectedPickRequest.pickRequestDetailsVO.map(
          (item, index) => ({
            key: index,
            qrbarcode: "",
            pickRequestNo: selectedPickRequest.docId || "",
            prDate: safeDayjs(selectedPickRequest.docDate),
            partNo: item.partNo || "",
            partDescription: item.partDesc || "",
            outBoundBin: item.bin || "",
            shippedQty:
              item.pickQty?.toString() || item.orderQty?.toString() || "0",
            unitRate: "0",
            skuValue: "0",
            discount: "0",
            tax: "0",
            gstTax: "0",
            amount: "0",
            sgst: "0",
            cgst: "0",
            igst: "0",
            totalGst: "0",
            billAmount: "0",
            remarks: item.remarks || "",
          })
        );
        setDeliveryItems(tableData);
      } else {
        // If no details found, create empty row with just the pick request info
        const tableData = [
          {
            key: 0,
            qrbarcode: "",
            pickRequestNo: selectedPickRequest?.docId || "",
            prDate: safeDayjs(selectedPickRequest?.docDate),
            partNo: "",
            partDescription: "",
            outBoundBin: "",
            shippedQty: "0",
            unitRate: "0",
            skuValue: "0",
            discount: "0",
            tax: "0",
            gstTax: "0",
            amount: "0",
            sgst: "0",
            cgst: "0",
            igst: "0",
            totalGst: "0",
            billAmount: "0",
            remarks: "",
          },
        ];
        setDeliveryItems(tableData);
      }
    } catch (error) {
      console.error("Error fetching buyer order table data:", error);
      setDeliveryItems([]);
    }
  };

  // Get delivery challan doc id
  const getDeliveryChallanDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getDeliveryChallanDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&finYear=${loginFinYear}`
      );
      setDeliveryChallanDocId(
        response.data.paramObjectsMap.DeliveryChallanDocId
      );
    } catch (error) {
      console.error("Error fetching delivery challan doc id:", error);
    }
  };

  // Get all buyer orders
  // Get all buyer orders
  const getAllBuyerOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getAllPickRequestFromDeliveryChallan?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      // Check if we have pickRequestVO array in the response
      const pickRequests = response.data.paramObjectsMap.pickRequestVO || [];
      setBuyerOrderList(pickRequests);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
      setBuyerOrderList([]);
    }
  };

  // Get buyer order data
  // Get buyer order data
  const getBuyerOrderData = async (buyerOrderNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getBuyerShipToBillToFromBuyerOrderForDeliveryChallan?buyerOrderNo=${buyerOrderNo}`
      );

      // Check the response structure - it might be vasPutawayVO or pickRequestVO
      const buyerData =
        response.data.paramObjectsMap.vasPutawayVO?.[0] ||
        response.data.paramObjectsMap.pickRequestVO?.[0];

      if (buyerData) {
        setFormData((prev) => ({
          ...prev,
          buyer: buyerData.customerName || buyerData.buyer || "",
          billTo: buyerData.customerAddress || buyerData.billTo || "",
          shipTo: buyerData.customerAddress || buyerData.shipTo || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching buyer order data:", error);
    }
  };

  // Get buyer order table data

  // Get all delivery challans
  const getAllDeliveryChallans = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getAllDeliveryChallan?branch=${loginBranch}&branchCode=${loginBranchCode}&finYear=${loginFinYear}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      setListViewData(response.data.paramObjectsMap.DeliveryChallanVO);
    } catch (error) {
      console.error("Error fetching delivery challans:", error);
    }
  };

  // Get delivery challan by id
  const getDeliveryChallanById = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deliverychallan/getDeliveryChallanById?id=${id}`
      );
      const challan = response.data.paramObjectsMap.deliveryChallanVO;
      setDeliveryChallanDocId(challan.docId);
      setEditBuyerOrderNo(challan.buyerOrderNo);

      // Convert all date strings to Day.js objects
      setFormData({
        docDate: safeDayjs(challan.docDate),
        buyerOrderNo: challan.buyerOrderNo,
        pickReqDate: safeDayjs(challan.pickReqDate),
        invoiceNo: challan.invoiceNo,
        containerNO: challan.containerNO,
        vechileNo: challan.vechileNo,
        exciseInvoiceNo: challan.exciseInvoiceNo,
        commercialInvoiceNo: challan.commercialInvoiceNo,
        boDate: safeDayjs(challan.boDate),
        buyer: challan.buyer,
        deliveryTerms: challan.deliveryTerms,
        payTerms: challan.payTerms,
        grWaiverNo: challan.grWaiverNo,
        grWaiverDate: safeDayjs(challan.grWaiverDate),
        bankName: challan.bankName,
        grWaiverClosureDate: safeDayjs(challan.grWaiverClosureDate),
        gatePassNo: challan.gatePassNo,
        gatePassDate: safeDayjs(challan.gatePassDate),
        insuranceNo: challan.insuranceNo,
        billTo: challan.billTo,
        shipTo: challan.shipTo,
        automailerGroup: challan.automailerGroup,
        docketNo: challan.docketNo,
        noOfBoxes: challan.noOfBoxes,
        pkgUom: challan.pkgUom,
        grossWeight: challan.grossWeight,
        gwtUom: challan.gwtUom,
        transportName: challan.transportName,
        transporterDate: safeDayjs(challan.transporterDate),
        packingSlipNo: challan.packingSlipNo,
        bin: challan.bin,
        taxType: challan.taxType,
        remarks: challan.remarks,
        freeze: challan.freeze,
      });

      setDeliveryItems(
        challan.deliveryChallanDetailsVO.map((detail) => ({
          pickRequestNo: detail.pickRequestNo,
          prDate: safeDayjs(detail.prDate),
          partNo: detail.partNo,
          partDescription: detail.partDescription,
          outBoundBin: detail.outBoundBin,
          shippedQty: detail.shippedQty,
          unitRate: detail.unitRate,
          skuValue: detail.skuValue,
          discount: detail.discount,
          tax: detail.tax,
          gstTax: detail.gstTax,
          amount: detail.amount,
          sgst: detail.sgst,
          cgst: detail.cgst,
          igst: detail.igst,
          totalGst: detail.totalGst,
          billAmount: detail.billAmount,
          remarks: detail.remarks,
        }))
      );
    } catch (error) {
      console.error("Error fetching delivery challan by id:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    getDeliveryChallanDocId();
    getAllBuyerOrders();
    getAllDeliveryChallans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleBuyerOrderChange = async (value) => {
    const selectedBuyerOrder = buyerOrderList.find(
      (buyer) => buyer.buyerOrderNo === value
    );

    if (selectedBuyerOrder) {
      setFormData((prev) => ({
        ...prev,
        buyerOrderNo: selectedBuyerOrder.buyerOrderNo,
        invoiceNo: selectedBuyerOrder.invoiceNo || "",
        pickReqDate: safeDayjs(selectedBuyerOrder.docDate),
        boDate: safeDayjs(
          selectedBuyerOrder.buyerRefDate || selectedBuyerOrder.buyerOrderDate
        ),
        buyer: selectedBuyerOrder.customerName || "",
        billTo: selectedBuyerOrder.customerAddress || "",
        shipTo: selectedBuyerOrder.customerAddress || "",
      }));

      // Also fetch additional data from APIs
      await getBuyerOrderData(selectedBuyerOrder.buyerOrderNo);
      await getBuyerOrderTableData(selectedBuyerOrder.buyerOrderNo);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      key: deliveryItems.length, // Use length as key
      qrbarcode: "",
      pickRequestNo: "",
      prDate: null,
      partNo: "",
      partDescription: "",
      outBoundBin: "",
      shippedQty: "",
      unitRate: "",
      skuValue: "",
      discount: "",
      tax: "",
      gstTax: "",
      amount: "",
      sgst: "",
      cgst: "",
      igst: "",
      totalGst: "",
      billAmount: "",
      remarks: "",
    };
    setDeliveryItems([...deliveryItems, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...deliveryItems];
    updatedItems[index][field] = value;
    setDeliveryItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...deliveryItems];
    updatedItems.splice(index, 1);
    setDeliveryItems(updatedItems);
  };

  const handleSaveChallan = async () => {
    setIsSubmitting(true);

    const challanData = {
      ...formData,
      ...(editId && { id: parseInt(editId) }), // Add id only if editId exists
      boDate: formatBoDateForAPI(formData.boDate),
      gatePassDate: formatDateForAPI(formData.gatePassDate),
      grWaiverDate: formatDateForAPI(formData.grWaiverDate),
      grWaiverClosureDate: formatDateForAPI(formData.grWaiverClosureDate),
      pickReqDate: formatDateForAPI(formData.pickReqDate),
      transporterDate: formatDateForAPI(formData.transporterDate),
      branch: loginBranch,
      client: loginClient,
      finYear: loginFinYear,
      warehouse: loginWarehouse,
      deliveryChallanDetailsDTO: deliveryItems.map((item) => ({
        ...(item.id && { id: item.id }), // Add item id only if it exists
        pickRequestNo: item.pickRequestNo,
        prDate: formatDateForAPI(item.prDate),
        partNo: item.partNo,
        partDescription: item.partDescription,
        outBoundBin: item.outBoundBin,
        shippedQty: parseFloat(item.shippedQty) || 0,
        unitRate: parseFloat(item.unitRate) || 0,
        skuValue: parseFloat(item.skuValue) || 0,
        discount: parseFloat(item.discount) || 0,
        tax: parseFloat(item.tax) || 0,
        gstTax: parseFloat(item.gstTax) || 0,
        amount: parseFloat(item.amount) || 0,
        sgst: parseFloat(item.sgst) || 0,
        cgst: parseFloat(item.cgst) || 0,
        igst: parseFloat(item.igst) || 0,
        totalGst: parseFloat(item.totalGst) || 0,
        billAmount: parseFloat(item.billAmount) || 0,
        remarks: item.remarks,
      })),
      createdBy: loginUserName,
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
    };

    // Remove any fields that don't exist in the target JSON structure
    const { docDate, items, ...filteredChallanData } = challanData;

    console.log("Sending data:", filteredChallanData); // Debug log

    try {
      const response = await axios.put(
        `${API_URL}/api/deliverychallan/createUpdatedDeliveryChallan`,
        filteredChallanData
      );

      if (response.data.status) {
        // Changed from response.data.success to response.data.status
        notification.success({
          message: editId ? "Challan Updated" : "Challan Created",
          description:
            response.data.paramObjectsMap?.message ||
            `Delivery challan ${editId ? "updated" : "created"} successfully.`,
        });
        handleClear();
        getAllDeliveryChallans();
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to save challan",
        });
      }
    } catch (error) {
      console.error("Error saving challan:", error);
      notification.error({
        message: "Error",
        description: "Failed to save challan. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      buyerOrderNo: "",
      pickReqDate: null,
      invoiceNo: "",
      containerNO: "",
      vechileNo: "",
      exciseInvoiceNo: "",
      commercialInvoiceNo: "",
      boDate: null,
      buyer: "",
      deliveryTerms: "",
      payTerms: "",
      grWaiverNo: "",
      grWaiverDate: dayjs(),
      bankName: "",
      grWaiverClosureDate: dayjs(),
      gatePassNo: "",
      gatePassDate: dayjs(),
      insuranceNo: "",
      billTo: "",
      shipTo: "",
      automailerGroup: "",
      docketNo: "",
      noOfBoxes: "",
      pkgUom: "",
      grossWeight: "",
      gwtUom: "",
      transportName: "",
      transporterDate: dayjs(),
      packingSlipNo: "",
      bin: "",
      taxType: "",
      remarks: "",
      freeze: false,
    });
    setDeliveryItems([
      {
        pickRequestNo: "",
        prDate: null,
        partNo: "",
        partDescription: "",
        outBoundBin: "",
        shippedQty: "",
        unitRate: "",
        skuValue: "",
        discount: "",
        tax: "",
        gstTax: "",
        amount: "",
        sgst: "",
        cgst: "",
        igst: "",
        totalGst: "",
        billAmount: "",
        remarks: "",
      },
    ]);
    setEditId("");
    setEditBuyerOrderNo("");
    getDeliveryChallanDocId();
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllDeliveryChallans();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  const handleEditChallan = (challan) => {
    setEditId(challan.id);
    getDeliveryChallanById(challan.id);
    setViewMode("form");
  };

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

  const handlePrintBarcode = () => {
    message.info("Printing barcode...");
    // Add barcode printing logic here
  };

  const handlePrintQRCode = () => {
    message.info("Printing QR code...");
    // Add QR code printing logic here
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
                    Delivery Challan
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage delivery challans
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
                  onClick={handleSaveChallan}
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

                <Button
                  icon={<BarcodeOutlined />}
                  onClick={handlePrintBarcode}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "white",
                    border: "none",
                  }}
                >
                  Print Barcode
                </Button>

                <Button
                  icon={<QrcodeOutlined />}
                  onClick={handlePrintQRCode}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "white",
                    border: "none",
                  }}
                >
                  Print QR Code
                </Button>

                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => {
                    handlePrintBarcode();
                    handlePrintQRCode();
                  }}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "white",
                    border: "none",
                  }}
                >
                  Print Both
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
                                  value={deliveryChallanDocId}
                                  disabled
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Document Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.docDate)}
                                  onChange={(date) =>
                                    handleDateChange("docDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            {editId ? (
                              <Col span={4}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      Buyer Order No
                                    </span>
                                  }
                                >
                                  <Input
                                    value={editBuyerOrderNo}
                                    disabled
                                    style={readOnlyInputStyle}
                                  />
                                </Form.Item>
                              </Col>
                            ) : (
                              <Col span={4}>
                                <Form.Item
                                  label={
                                    <span style={{ color: "#fff" }}>
                                      Buyer Order No *
                                    </span>
                                  }
                                >
                                  <Select
                                    showSearch
                                    style={selectStyle}
                                    value={formData.buyerOrderNo}
                                    onChange={handleBuyerOrderChange}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    }
                                    disabled={formData.freeze}
                                  >
                                    {buyerOrderList.map((buyer) => (
                                      <Option
                                        key={buyer.id}
                                        value={buyer.buyerOrderNo}
                                      >
                                        {buyer.buyerOrderNo}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            )}
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Pick Req Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.pickReqDate)}
                                  disabled
                                  format="DD-MM-YYYY"
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
                                  value={formData.invoiceNo}
                                  disabled
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Container No *
                                  </span>
                                }
                              >
                                <Input
                                  name="containerNO"
                                  value={formData.containerNO}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vehicle No *
                                  </span>
                                }
                              >
                                <Input
                                  name="vechileNo"
                                  value={formData.vechileNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Excise Invoice No *
                                  </span>
                                }
                              >
                                <Input
                                  name="exciseInvoiceNo"
                                  value={formData.exciseInvoiceNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Commercial Invoice No *
                                  </span>
                                }
                              >
                                <Input
                                  name="commercialInvoiceNo"
                                  value={formData.commercialInvoiceNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>BO Date</span>
                                }
                              >
                                <DatePicker
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.boDate)}
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Buyer</span>
                                }
                              >
                                <Input
                                  value={formData.buyer}
                                  disabled
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Delivery Terms *
                                  </span>
                                }
                              >
                                <Input
                                  name="deliveryTerms"
                                  value={formData.deliveryTerms}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Pay Terms *
                                  </span>
                                }
                              >
                                <Input
                                  name="payTerms"
                                  value={formData.payTerms}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GR Waiver No *
                                  </span>
                                }
                              >
                                <Input
                                  name="grWaiverNo"
                                  value={formData.grWaiverNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GR Waiver Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.grWaiverDate)}
                                  onChange={(date) =>
                                    handleDateChange("grWaiverDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Fourth Row - 5 columns */}
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
                          color: "#fff",
                        }}
                      >
                        <Form layout="vertical">
                          {/* Fifth Row - 5 columns */}

                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bank Name *
                                  </span>
                                }
                              >
                                <Input
                                  name="bankName"
                                  value={formData.bankName}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GR Waiver Cl Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(
                                    formData.grWaiverClosureDate
                                  )}
                                  onChange={(date) =>
                                    handleDateChange(
                                      "grWaiverClosureDate",
                                      date
                                    )
                                  }
                                  format="DD-MM-YYYY"
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Gate Pass No *
                                  </span>
                                }
                              >
                                <Input
                                  name="gatePassNo"
                                  value={formData.gatePassNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Gate Pass Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.gatePassDate)}
                                  onChange={(date) =>
                                    handleDateChange("gatePassDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Insurance No *
                                  </span>
                                }
                              >
                                <Input
                                  name="insuranceNo"
                                  value={formData.insuranceNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Bill To</span>
                                }
                              >
                                <Input
                                  value={formData.billTo}
                                  disabled
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Ship To</span>
                                }
                              >
                                <Input
                                  value={formData.shipTo}
                                  disabled
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Automailer Group
                                  </span>
                                }
                              >
                                <Input
                                  name="automailerGroup"
                                  value={formData.automailerGroup}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Docket No
                                  </span>
                                }
                              >
                                <Input
                                  name="docketNo"
                                  value={formData.docketNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    No Of Boxes
                                  </span>
                                }
                              >
                                <Input
                                  name="noOfBoxes"
                                  value={formData.noOfBoxes}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Sixth Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>PKG UOM</span>
                                }
                              >
                                <Input
                                  name="pkgUom"
                                  value={formData.pkgUom}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Gross Weight
                                  </span>
                                }
                              >
                                <Input
                                  name="grossWeight"
                                  value={formData.grossWeight}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>GWT UOM</span>
                                }
                              >
                                <Input
                                  name="gwtUom"
                                  value={formData.gwtUom}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Transport Name
                                  </span>
                                }
                              >
                                <Input
                                  name="transportName"
                                  value={formData.transportName}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Transport Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  className="white-datepicker"
                                  style={datePickerStyle}
                                  value={safeDayjs(formData.transporterDate)}
                                  onChange={(date) =>
                                    handleDateChange("transporterDate", date)
                                  }
                                  format="DD-MM-YYYY"
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Seventh Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Packing Slip No
                                  </span>
                                }
                              >
                                <Input
                                  name="packingSlipNo"
                                  value={formData.packingSlipNo}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Bin</span>
                                }
                              >
                                <Input
                                  name="bin"
                                  value={formData.bin}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Tax Type
                                  </span>
                                }
                              >
                                <Input
                                  name="taxType"
                                  value={formData.taxType}
                                  onChange={handleInputChange}
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
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
                                  style={inputStyle}
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Freeze</span>
                                }
                              >
                                <Checkbox
                                  checked={formData.freeze}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      freeze: e.target.checked,
                                    }))
                                  }
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

              {/* Delivery Items Table */}
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
                        onClick={() => setDeliveryItems([])}
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
                        <col style={{ width: "150px" }} />{" "}
                        <col style={{ width: "150px" }} />{" "}
                        {/* Pick Request No */}
                        <col style={{ width: "120px" }} /> {/* PR Date */}
                        <col style={{ width: "120px" }} /> {/* Part No */}
                        <col style={{ width: "200px" }} />{" "}
                        {/* Part Description */}
                        <col style={{ width: "120px" }} /> {/* OutBound Bin */}
                        <col style={{ width: "100px" }} /> {/* Shipped Qty */}
                        <col style={{ width: "100px" }} /> {/* Unit Rate */}
                        <col style={{ width: "120px" }} />{" "}
                        {/* Pack/SKU/Value */}
                        <col style={{ width: "100px" }} /> {/* Discount */}
                        <col style={{ width: "100px" }} /> {/* Tax */}
                        <col style={{ width: "100px" }} /> {/* GST Tax */}
                        <col style={{ width: "120px" }} /> {/* Amount */}
                        <col style={{ width: "100px" }} /> {/* SGST */}
                        <col style={{ width: "100px" }} /> {/* CGST */}
                        <col style={{ width: "100px" }} /> {/* IGST */}
                        <col style={{ width: "120px" }} /> {/* Total GST */}
                        <col style={{ width: "120px" }} /> {/* Bill Amount */}
                        <col style={{ width: "150px" }} /> {/* Remarks */}
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
                            QR/BarCode
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Pick Request No
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            PR Date
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
                            OutBound Bin
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Shipped Qty
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Unit Rate
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Pack/SKU/Value
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Discount
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Tax
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            GST Tax
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
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            SGST
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            CGST
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            IGST
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Total GST
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                            }}
                          >
                            Bill Amount
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
                        {deliveryItems.map((item, index) => (
                          <tr
                            key={item.key}
                            style={{
                              borderBottom: "1px dashed white",
                              color: "white",
                            }}
                          >
                            {/* Action */}
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              <Button
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteItem(index)}
                                danger
                                type="text"
                                style={{ color: "white" }}
                                disabled={formData.freeze}
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

                            <td style={{ padding: "8px" }}>
                              {" "}
                              <Input
                                value={item.qrbarcode}
                                style={{
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                  color: "white",
                                }}
                              />
                            </td>
                            {/* Pick Request No */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.pickRequestNo}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* PR Date */}
                            <td style={{ padding: "8px" }}>
                              <DatePicker
                                className="white-datepicker"
                                style={datePickerStyle}
                                value={safeDayjs(item.prDate)}
                                disabled
                                format="DD-MM-YYYY"
                              />
                            </td>

                            {/* Part No */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.partNo}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Part Description */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.partDescription}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* OutBound Bin */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.outBoundBin}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "outBoundBin",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Shipped Qty */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.shippedQty}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Unit Rate */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.unitRate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unitRate",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Pack/SKU/Value */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.skuValue}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "skuValue",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Discount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.discount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "discount",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Tax */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.tax}
                                onChange={(e) =>
                                  handleItemChange(index, "tax", e.target.value)
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* GST Tax */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.gstTax}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "gstTax",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.amount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* SGST */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.sgst}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "sgst",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* CGST */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.cgst}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "cgst",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* IGST */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.igst}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "igst",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Total GST */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.totalGst}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "totalGst",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Bill Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.billAmount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "billAmount",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
                              />
                            </td>

                            {/* Remarks */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.remarks}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                                disabled={formData.freeze}
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
                <Button
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
                </Button>
              </div>

              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "80%",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "40px",
                  marginLeft: "60px",
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
                        Buyer Order No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Buyer
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Gate Pass No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Transport Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listViewData.map((challan, index) => (
                      <tr
                        key={`challan-${index}-${challan.id}`}
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
                            onClick={() => handleEditChallan(challan)}
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
                          {challan.docId}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {dayjs(challan.docDate).format("DD-MM-YYYY")}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {challan.buyerOrderNo}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {challan.buyer}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {challan.gatePassNo}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {challan.transportName}
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
      </div>
    </ConfigProvider>
  );
};

export default DeliveryChallan;
