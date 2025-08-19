import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
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

export const PickRequest = () => {
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
  const [orderItems, setOrderItems] = useState([]);
  const [finYear, setFinYear] = useState("2024");
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [form] = Form.useForm();

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: null,
    clientName: "",
    customerName: "",
    customerShortName: "",
    outTime: "",
    clientAddress: "",
    customerAddress: "",
    status: "Edit",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
    pickOrder: "FIFO",
    buyerOrderDate: null,
    freeze: false,
  });

  const [value, setValue] = useState(0);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [itemTableData, setItemTableData] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const [pickRequestItems, setPickRequestItems] = useState([]);

  const paginatedData = buyerOrderList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const [itemTableErrors, setItemTableErrors] = useState([
    {
      availQty: "",
      batchDate: "",
      batchNo: "",
      binClass: "",
      binType: "",
      cellType: "",
      clientCode: "",
      core: "",
      bin: "",
      orderQty: "",
      partDesc: "",
      partNo: "",
      pcKey: "",
      pickQty: "",
      remainQty: "",
      sku: "",
      ssku: "",
      status: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
      stockDate: "",
      qcFlag: "",
      remarks: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: dayjs(),
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: null,
    clientName: "",
    customerName: "",
    customerShortName: "",
    outTime: "",
    clientAddress: "",
    customerAddress: "",
    buyerOrderDate: "",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
  });

  const listViewColumns = [
    { title: "Doc Id", dataIndex: "docId", key: "docId", width: 140 },
    {
      title: "Buyer Order No",
      dataIndex: "buyerOrderNo",
      key: "buyerOrderNo",
      width: 140,
    },
    {
      title: "Buyer order RefNo",
      dataIndex: "buyerRefNo",
      key: "buyerRefNo",
      width: 140,
    },
    { title: "Status", dataIndex: "status", key: "status", width: 140 },
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    console.log("LISTVIEW FIELD CURRENT VALUE IS", listView);
    getAllPickRequest();
    getbuyerRefNo();
    getAllGroups();
    getDocId();
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
      availQty: 0,
      pickQty: 0,
      status: "PENDING", // Optional if you're tracking status
    };
    setPickRequestItems([...pickRequestItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleEditOrder = (order) => {
    setEditId(order.id);
    setFormData({
      orderNo: order.orderNo || "",
      orderDate: dayjs(order.orderDate),
      customer: order.customerId || "",
      customerName: order.customerName || "",
      supplier: order.supplierId || "",
      supplierName: order.supplierName || "",
      deliveryDate: dayjs(order.deliveryDate),
      paymentTerms: order.paymentTerms || "",
      shippingMethod: order.shippingMethod || "",
      remarks: order.remarks || "",
      status: order.status || "PENDING",
      totalAmount: order.totalAmount || 0,
      totalQuantity: order.totalQuantity || 0,
    });
    setOrderItems(
      order.items?.map((item) => ({
        id: Date.now() + Math.random(),
        partNo: item.partNo || "",
        partDesc: item.partDesc || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0,
        deliveryDate: dayjs(item.deliveryDate),
        status: item.status || "PENDING",
      })) || []
    );
    setViewMode("form");
  };

  useEffect(() => {
    const totalQty = itemTableData.reduce(
      (sum, row) => sum + (parseInt(row.pickQty, 10) || 0),
      0
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      totalPickedQty: totalQty,
    }));
  }, [itemTableData]);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pickrequest/getPickRequestDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          docId: response.paramObjectsMap.pickRequestDocId,
        }));
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllPickRequest = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pickrequest/getAllPickRequestByOrgId?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        const pickRequests = response.paramObjectsMap.pickRequestVO.map(
          (item) => ({
            ...item,
            totalAmount: item.totalAmount || 0,
          })
        );
        setListViewData(pickRequests);
        setBuyerOrderList(pickRequests);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getbuyerRefNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pickrequest/getBuyerRefNoForPickRequest?orgId=${orgId}&branchCode=${branchCode}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setBuyerOrderNoList(response.paramObjectsMap.buyerOrderVO);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getCurrentTime = () => {
    return dayjs().format("HH:mm:ss");
  };

  const getOutTime = () => {
    setFormData((prev) => ({ ...prev, outTime: getCurrentTime() }));
  };

  useEffect(() => {
    getOutTime();
  }, []);

  const getAllGroups = async () => {
    try {
      const groupData = await getAllActiveGroups(orgId);
      console.log("THE GROUP DATA IS:", groupData);
      setGroupList(groupData);
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
  };

  const getAllItemById = async (row) => {
    console.log("THE SELECTED ITEM ID IS:", row.id);
    setEditId(row.id);

    try {
      const response = await axios.get(
        `${API_URL}/pickrequest/getPickRequestById?id=${row.id}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListView(false);
        const data = response.paramObjectsMap.pickRequestVO;
        const totalPickedQty = data.pickRequestDetailsVO.reduce(
          (sum, detail) => sum + (detail.pickQty || 0),
          0
        );
        console.log("Total Picked Qty:", totalPickedQty);
        setFormData({
          docId: data.docId,
          docDate: data.docDate,
          buyerOrderNo: data.buyerOrderNo,
          buyerRefNo: data.buyerRefNo,
          buyerRefDate: data.buyerRefDate,
          clientName: data.clientName,
          customerName: data.customerName,
          customerShortName: data.customerShortName,
          outTime: data.outTime,
          buyerOrderDate: data.buyerOrderDate,
          clientAddress: data.clientAddress,
          customerAddress: data.customerAddress,
          status: data.status,
          buyersReference: data.buyersReference,
          invoiceNo: data.invoiceNo,
          clientShortName: data.clientShortName,
          pickOrder: data.pickOrder,
          freeze: data.freeze,
          totalPickedQty: data.totalPickQty,
          totalOrderQty: data.totalOrderQty,
        });
        setItemTableData(
          data.pickRequestDetailsVO.map((detail) => ({
            id: detail.id,
            availQty: detail.availQty,
            batchDate: detail.batchDate || "",
            batchNo: detail.batchNo || "",
            binClass: detail.binClass || "",
            binType: detail.binType || "",
            cellType: detail.cellType || "",
            clientCode: detail.clientCode || "",
            core: detail.core || "",
            bin: detail.bin || "",
            orderQty: detail.orderQty || "",
            partDesc: detail.partDesc || "",
            partNo: detail.partNo || "",
            pcKey: detail.pcKey || "",
            pickQty: detail.pickQty || "",
            remainQty: detail.remainQty || "",
            sku: detail.sku || "",
            ssku: detail.ssku || "",
            status: detail.status || "",
            grnNo: detail.grnNo || "",
            grnDate: detail.grnDate || "",
            stockDate: detail.stockDate || "",
            expDate: detail.expDate || "",
            qcFlag: detail.qcFlag || "",
          }))
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cursorPosition = e.target.selectionStart;

    const processedValue =
      name !== "status" && typeof value === "string"
        ? value.toUpperCase()
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));

    setTimeout(() => {
      const inputField = document.querySelector(`[name="${name}"]`);
      if (inputField) {
        inputField.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);

    if (name === "buyerRefNo") {
      const selectedOrder = buyerOrderNoList.find(
        (order) =>
          order.orderNo &&
          processedValue &&
          order.orderNo.toLowerCase() === processedValue.toLowerCase()
      );

      if (selectedOrder) {
        const refDate = selectedOrder.refDate
          ? dayjs(selectedOrder.refDate)
          : null;

        setFormData((prevFormData) => ({
          ...prevFormData,
          buyerRefNo: selectedOrder.orderNo || "",
          buyerRefDate: refDate,
          clientName: selectedOrder.billToName || "",
          clientShortName: selectedOrder.billToShortName || "",
          customerName: selectedOrder.buyer || "",
          customerAddress: selectedOrder.buyerAddress || "",
          clientAddress: selectedOrder.billToAddress || "",
          buyerOrderNo: selectedOrder.docId || "",
          buyersReference: selectedOrder.refNo || "",
          invoiceNo: selectedOrder.invoiceNo || "",
          buyerOrderDate: selectedOrder.docDate || "",
          totalOrderQty: selectedOrder.totalOrderQty || "",
        }));
      } else {
        console.warn("No matching order found for the selected buyerRefNo.");
      }
    }
  };

  const handleAddRow = () => {
    const newRow = {
      availQty: "",
      batchDate: "",
      batchNo: "",
      binClass: "",
      binType: "",
      cellType: "",
      clientCode: "",
      core: "",
      bin: "",
      orderQty: "",
      partDesc: "",
      partNo: "",
      pcKey: "",
      pickQty: "",
      remainQty: "",
      sku: "",
      ssku: "",
      status: "",
    };
    setItemTableData([...itemTableData, newRow]);
    setItemTableErrors([
      ...itemTableErrors,
      {
        availQty: "",
        batchDate: "",
        batchNo: "",
        binClass: "",
        binType: "",
        cellType: "",
        clientCode: "",
        core: "",
        bin: "",
        orderQty: "",
        partDesc: "",
        partNo: "",
        pcKey: "",
        pickQty: "",
        remainQty: "",
        sku: "",
        ssku: "",
        status: "",
        grnNo: "",
        grnDate: "",
        expDate: "",
        stockDate: "",
        qcFlag: "",
        remarks: "",
      },
    ]);
  };

  const handleDeleteRow = (id) => {
    const rowIndex = itemTableData.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = itemTableData.filter((row) => row.id !== id);
      const updatedErrors = itemTableErrors.filter(
        (_, index) => index !== rowIndex
      );
      setItemTableData(updatedData);
      setItemTableErrors(updatedErrors);
    }
  };

  const handleKeyDown = (e, row) => {
    if (
      e.key === "Tab" &&
      row.id === itemTableData[itemTableData.length - 1].id
    ) {
      e.preventDefault();
      handleAddRow();
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
      clientAddress: "",
      customerAddress: "",
      status: "Edit",
      buyersReference: "",
      invoiceNo: "",
      clientShortName: "",
      pickOrder: "FIFO",
      buyerOrderDate: null,
    });
    setItemTableData([]);
    setItemTableErrors([]);
    setFieldErrors({
      docDate: "",
      pickRequestId: "",
      dispatch: "",
      buyerOrderNo: "",
      buyerRefNo: "",
      buyerRefDate: "",
      shipmentMethod: "",
      refNo: "",
      noOfBoxes: "",
      dueDays: "",
      clientName: "",
      customerName: "",
      outTime: "",
      clientAddress: "",
      customerAddress: "",
      status: "",
      boAmentment: "",
      controlBranch: localStorage.getItem("branchCode"),
      active: true,
      charges: "",
      lineDiscount: "",
      roundOff: "",
      invDiscountAmount: "",
      watAmountWithoutForm: "",
      totalAmount: 0,
    });
    getDocId();
    getOutTime();
    setEditId("");
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.buyerRefNo) {
      errors.buyerRefNo = "Buyer Order Ref No is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    setFieldErrors(errors);

    let itemTableDataValid = true;
    if (
      !itemTableData ||
      !Array.isArray(itemTableData) ||
      itemTableData.length === 0
    ) {
      itemTableDataValid = false;
      setItemTableErrors([{ general: "Table Data is required" }]);
    } else {
      const newTableErrors = itemTableData.map((row, index) => {
        const rowErrors = {};

        if (!row.partNo) rowErrors.partNo = "Part No is required";
        if (!row.grnNo) rowErrors.grnNo = "Grn No is required";
        if (!row.batchNo) rowErrors.batchNo = "Batch No is required";
        if (!row.bin) rowErrors.bin = "Bin is required";

        if (Object.keys(rowErrors).length > 0) itemTableDataValid = false;

        return rowErrors;
      });

      setItemTableErrors(newTableErrors);
    }

    if (Object.keys(errors).length === 0 && itemTableDataValid) {
      setIsLoading(true);
      const itemVo = itemTableData.map((row) => ({
        availQty: row.availQty,
        batchDate: row.batchDate,
        batchNo: row.batchNo,
        binClass: row.binClass,
        binType: row.binType,
        cellType: row.cellType,
        core: row.core,
        bin: row.bin,
        grnNo: row.grnNo,
        orderQty: row.orderQty,
        partDesc: row.partDesc,
        partNo: row.partNo,
        pickQty: row.pickQty,
        remainQty: row.remainQty,
        sku: row.sku,
        qcFlag: row.qcFlag,
        remarks: row.remarks,
        stockDate: row.stockDate,
        status: row.status,
        expDate: row.expDate,
        grnDate: row.grnDate,
      }));

      console.log("itemVO", itemVo);

      const saveFormData = {
        ...(editId && { id: editId }),
        docId: formData.docId,
        docDate: formData.docDate,
        buyerOrderNo: formData.buyerOrderNo,
        buyerRefNo: formData.buyerRefNo,
        buyerRefDate: formData.buyerRefDate,
        clientName: formData.clientName,
        client: client,
        customerName: formData.customerName,
        customerShortName: formData.customerShortName,
        outTime: formData.outTime,
        clientAddress: formData.clientAddress,
        customerAddress: formData.customerAddress,
        status: formData.status,
        buyersReference: formData.buyersReference,
        invoiceNo: formData.invoiceNo,
        clientShortName: formData.clientShortName,
        pickOrder: formData.pickOrder,
        pickRequestDetailsDTO: itemVo,
        branch: branch,
        branchCode: branchCode,
        finYear: finYear,
        warehouse: warehouse,
        orgId: orgId,
        customer: customer,
        client: client,
        createdBy: loginUserName,
        buyerOrderDate: formData.buyerOrderDate,
      };

      console.log("DATA TO SAVE IS:", saveFormData);

      try {
        const response = await axios.put(
          `${API_URL}/pickrequest/createUpdatePickRequest`,
          saveFormData
        );
        if (response.status === true) {
          console.log("Response:", response);
          handleClear();
          message.success(
            editId ? "Pick Updated Successfully" : "Pick created successfully"
          );
          getAllPickRequest();
        } else {
          message.error(
            response.paramObjectsMap.errorMessage || "Pick creation failed"
          );
        }
      } catch (error) {
        console.error("Error:", error);
        message.error("Pick creation failed");
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
    setDownloadPdf(false);
  };

  const handleClose = () => {
    setFormData({
      itemType: "",
      partNo: "",
      partDesc: "",
      custPartNo: "",
      groupName: "",
      styleCode: "",
      baseSku: "",
      addDesc: "",
      purchaseUnit: "",
      storageUnit: "",
      fixedCapAcrossLocn: "",
      fsn: "",
      saleUnit: "",
      type: "",
      serialNoFlag: "",
      sku: "",
      skuQty: "",
      ssku: "",
      sskuQty: "",
      zoneType: "",
      weightSkuUom: "",
      hsnCode: "",
      parentChildKey: "",
      controlBranch: "",
      criticalStockLevel: "",
      criticalStock: "",
      bchk: "",
      status: "",
      barcode: "",
      active: true,
      freeze: false,
    });
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format("DD-MM-YYYY");
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const getAllFillGrid = async () => {
    const errors = {};
    if (!formData.buyerRefNo) {
      errors.buyerRefNo = "Buyer Order Ref No is required";
    }
    if (Object.keys(errors).length === 0) {
      setModalOpen(true);
      try {
        const response = await axios.get(
          `${API_URL}/pickrequest/getFillGridDetailsForPickRequest?orgId=${orgId}&branchCode=${branchCode}&client=${client}&buyerOrderDocId=${formData.buyerOrderNo}&pickStatus=${formData.status}`
        );
        console.log("API Response:", response);

        if (response.status === true) {
          const fillGridDetails = response.paramObjectsMap.fillGridDetails;
          setFillGridData(fillGridDetails);
          setItemTableErrors([{ general: "" }]);
        } else {
          console.error("API Error:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    const binValues = selectedData.map((row) => row.bin);

    setItemTableData([...itemTableData, ...selectedData]);

    console.log("Selected Data:", selectedData);

    setSelectedRows([]);
    setSelectAll(false);
    handleCloseModal();
  };

  const handleCloseModal = () => {
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

  const GeneratePdf = (row) => {
    console.log("PDF-Data =>", row);
    setPdfData(row);
    setDownloadPdf(true);
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

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
                    Pick Request
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage Pick Requests
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
                        <Form layout="vertical" form={form}>
                          {/* First Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Doc ID</span>
                                }
                              >
                                <Input
                                  value={formData.docId}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      docId: e.target.value,
                                    })
                                  }
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
                                    Doc Date
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
                                  value={formData.docDate}
                                  onChange={(date) =>
                                    setFormData({ ...formData, docDate: date })
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Order No
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyerOrderNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyerOrderNo: e.target.value,
                                    })
                                  }
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
                                    Buyer Order Date
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
                                  value={formData.buyerOrderDate}
                                  onChange={(date) =>
                                    setFormData({
                                      ...formData,
                                      buyerOrderDate: date,
                                    })
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Ref No
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyerRefNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyerRefNo: e.target.value,
                                    })
                                  }
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
                                    Buyer Ref Date
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
                                  value={formData.buyerRefDate}
                                  onChange={(date) =>
                                    setFormData({
                                      ...formData,
                                      buyerRefDate: date,
                                    })
                                  }
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
                                    Client Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.clientName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientName: e.target.value,
                                    })
                                  }
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
                                    Customer Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.customerName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerName: e.target.value,
                                    })
                                  }
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
                                    Customer Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.customerShortName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerShortName: e.target.value,
                                    })
                                  }
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
                                  <span style={{ color: "#fff" }}>Status</span>
                                }
                              >
                                <Select
                                  value={formData.status}
                                  onChange={(value) =>
                                    setFormData({ ...formData, status: value })
                                  }
                                  style={selectStyle}
                                >
                                  <Option value="Edit">Edit</Option>
                                  <Option value="Confirm">Confirm</Option>
                                  <Option value="Freeze">Freeze</Option>
                                </Select>
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
                          color: "#fff",
                        }}
                      >
                        <Form layout="vertical">
                          {/* Third Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer's Reference
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyersReference}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyersReference: e.target.value,
                                    })
                                  }
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
                                  value={formData.invoiceNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      invoiceNo: e.target.value,
                                    })
                                  }
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
                                    Client Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.clientShortName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientShortName: e.target.value,
                                    })
                                  }
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
                                    Pick Order
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.pickOrder}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      pickOrder: value,
                                    })
                                  }
                                  style={selectStyle}
                                >
                                  <Option value="FIFO">FIFO</Option>
                                  <Option value="LIFO">LIFO</Option>
                                  <Option value="FEFO">FEFO</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Out Time
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.outTime}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      outTime: e.target.value,
                                    })
                                  }
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

                          {/* Address Fields */}
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
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientAddress: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
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
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerAddress: e.target.value,
                                    })
                                  }
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
                            onClick={() => getAllFillGrid([])}
                            style={{
                              marginRight: "8px",
                              background: "rgba(255, 99, 132, 0.3)",
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
                            <col style={{ width: "68px" }} /> {/* Action */}
                            <col style={{ width: "50px" }} /> {/* S.No */}
                            <col style={{ width: "120px" }} /> {/* Part No */}
                            <col style={{ width: "200px" }} /> {/* Part Desc */}
                            <col style={{ width: "100px" }} /> {/* Bin */}
                            <col style={{ width: "100px" }} /> {/* SKU */}
                            <col style={{ width: "100px" }} /> {/* Batch No */}
                            {/* Batch Date */}
                            <col style={{ width: "100px" }} /> {/* Order Qty */}
                            <col style={{ width: "100px" }} /> {/* Avail Qty */}
                            <col style={{ width: "100px" }} /> {/* Pick Qty */}
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
                                Bin
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
                                Avail Qty
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
                            </tr>
                          </thead>
                          <tbody>
                            {pickRequestItems.map((item, index) => (
                              <tr
                                key={item.id}
                                style={{
                                  borderBottom: "1px dashed white",
                                  color: "white",
                                }}
                              >
                                {/* Action */}
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                  }}
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

                                {/* Bin */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.bin}
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

                                {/* Avail Qty */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.availQty}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Pick Qty */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.pickQty}
                                    onChange={(e) =>
                                      handleItemChange(
                                        item.id,
                                        "pickQty",
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
                  Buyer Orders List
                </Typography.Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  New Order
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
                      {listViewColumns.map((column) => (
                        <th
                          key={column.key}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          {column.title}
                        </th>
                      ))}
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
                    {paginatedData.map((order, index) => (
                      <tr
                        key={order.id}
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
                        {listViewColumns.map((column) => (
                          <td
                            key={column.key}
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {column.render
                              ? column.render(
                                  order[column.dataIndex],
                                  order,
                                  index
                                )
                              : order[column.dataIndex]}
                          </td>
                        ))}
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
                            onClick={() => {
                              handleEditOrder(order);
                              toggleViewMode();
                            }}
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
                    {Math.min(currentPage * pageSize, buyerOrderList.length)} of{" "}
                    {buyerOrderList.length} items
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
                    { length: Math.ceil(buyerOrderList.length / pageSize) },
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
                          Math.ceil(buyerOrderList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(buyerOrderList.length / pageSize)
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
                        Math.ceil(buyerOrderList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(buyerOrderList.length / pageSize)
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
              }}
              id="draggable-dialog-title"
            >
              Fill Grid Details
            </div>
          }
          open={modalOpen}
          onCancel={handleCloseModal}
          footer={[
            <Button key="back" onClick={handleCloseModal}>
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
          modalRender={(modal) => <PaperComponent>{modal}</PaperComponent>}
        >
          <div style={{ marginBottom: "16px" }}>
            <Checkbox checked={selectAll} onChange={handleSelectAll}>
              Select All
            </Checkbox>
          </div>
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
                      const newSelectedRows = [...selectedRows];
                      if (e.target.checked) {
                        newSelectedRows.push(index);
                      } else {
                        const idx = newSelectedRows.indexOf(index);
                        if (idx > -1) {
                          newSelectedRows.splice(idx, 1);
                        }
                      }
                      setSelectedRows(newSelectedRows);
                    }}
                  />
                ),
              },
              { title: "Part No", dataIndex: "partNo", key: "partNo" },
              { title: "Part Desc", dataIndex: "partDesc", key: "partDesc" },
              { title: "Order Qty", dataIndex: "orderQty", key: "orderQty" },
              { title: "Bin", dataIndex: "bin", key: "bin" },
              { title: "Batch No", dataIndex: "batchNo", key: "batchNo" },
              { title: "GRN No", dataIndex: "grnNo", key: "grnNo" },
            ]}
            rowKey={(record, index) => index}
            pagination={false}
            scroll={{ x: true }}
          />
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default PickRequest;
