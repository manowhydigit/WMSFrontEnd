import React, { useEffect, useState, useRef } from "react";
import {
  Button,
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
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Checkbox,
  Space,
} from "antd";
import {
  CloudUploadOutlined,
  SearchOutlined,
  ClearOutlined,
  DeleteOutlined,
  TableOutlined,
  FormOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  AppstoreAddOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  RightCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/sample_Stock_Restate_.xls";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";
import * as XLSX from "xlsx";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { RangePicker } = DatePicker;

const StockRestate = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [editId, setEditId] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fillGridOpen, setFillGridOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedModalRows, setSelectedModalRows] = useState([]);

  const [loginUserName] = useState(localStorage.getItem("userName"));
  const [loginBranchCode] = useState(localStorage.getItem("branchcode"));
  const [loginBranch] = useState(localStorage.getItem("branch"));
  const [loginCustomer] = useState(localStorage.getItem("customer"));
  const [loginClient] = useState(localStorage.getItem("client"));
  const [loginWarehouse] = useState(localStorage.getItem("warehouse"));
  const [loginFinYear] = useState(localStorage.getItem("finYear"));

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [stockRestateList, setStockRestateList] = useState([]);
  const [detailTableData, setDetailTableData] = useState([]);
  const [fromBinList, setFromBinList] = useState([]);
  const [toBinList, setToBinList] = useState([]);
  const [grnNoList, setGrnNoList] = useState([]);
  const [batchNoList, setBatchNoList] = useState([]);
  const [transferType] = useState([
    { name: "HOLD", value: "HOLD" },
    { name: "DEFECTIVE", value: "DEFECTIVE" },
    { name: "RELEASE", value: "RELEASE" },
    { name: "VAS", value: "VAS" },
  ]);

  // Add toast management
  const isMounted = useRef(true);
  const [toastId, setToastId] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    getAllStockRestate();
    getFromBin();
    getNewStockRestateDocId();

    return () => {
      isMounted.current = false;
      // Clean up any active toasts when component unmounts
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  // Safe toast function
  const showToast = (messageText, type = "default") => {
    if (!isMounted.current) return null;

    let id;
    switch (type) {
      case "error":
        id = toast.error(messageText);
        break;
      case "success":
        id = toast.success(messageText);
        break;
      case "warning":
        id = toast.warning(messageText);
        break;
      default:
        id = toast(messageText);
    }
    setToastId(id);
    return id;
  };

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    transferFrom: "",
    transferTo: "",
    transferFromFlag: "",
    transferToFlag: "",
    selectedTransferFromFlag: "",
    entryNo: "",
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(stockRestateList);
      return;
    }

    const filtered = stockRestateList.filter((item) =>
      item.DocId?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const [searchParams, setSearchParams] = useState({
    fromDate: dayjs().startOf("month"),
    toDate: dayjs(),
    docId: "",
    status: "ALL",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTableData, setModalTableData] = useState([]);
  const [filteredModalData, setFilteredModalData] = useState([]);
  const [modalFilters, setModalFilters] = useState({
    partNo: "",
    fromBin: "",
  });

  useEffect(() => {
    getAllStockRestate();
    getFromBin();
    getNewStockRestateDocId();
  }, []);

  // Filter modal data when filters change
  useEffect(() => {
    let filteredData = modalTableData;

    if (modalFilters.partNo) {
      filteredData = filteredData.filter((item) =>
        item.partNo?.toLowerCase().includes(modalFilters.partNo.toLowerCase())
      );
    }

    if (modalFilters.fromBin) {
      filteredData = filteredData.filter((item) =>
        item.fromBin?.toLowerCase().includes(modalFilters.fromBin.toLowerCase())
      );
    }

    setFilteredModalData(filteredData);
  }, [modalTableData, modalFilters]);

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

  // Search functionality
  useEffect(() => {
    if (searchText) {
      const filtered = stockRestateList.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(stockRestateList);
    }
  }, [searchText, stockRestateList]);

  // Excel download function
  const downloadExcel = async () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    setDownloadLoading(true);
    try {
      const fromDate = selectedDateRange[0];
      const toDate = selectedDateRange[1];

      // Fetch Stock Restate data
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getAllStockRestate?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      if (
        response.data.status &&
        response.data.paramObjectsMap.stockRestateVO
      ) {
        const allStockRestateData =
          response.data.paramObjectsMap.stockRestateVO;

        // Filter data based on the selected date range
        const filteredStockRestateData = allStockRestateData.filter((item) => {
          if (!item.docDate) return false;

          let itemDate;
          if (item.docDate.includes("-")) {
            const parts = item.docDate.split("-");
            if (parts[0].length === 4) {
              itemDate = item.docDate;
            } else if (parts[0].length === 2) {
              itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          } else {
            itemDate = dayjs(item.docDate).format("YYYY-MM-DD");
          }

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

        if (filteredStockRestateData.length > 0) {
          const excelData = formatStockRestateDataForExcel(
            filteredStockRestateData
          );

          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          XLSX.utils.book_append_sheet(wb, ws, "Stock Restate Data");

          const fileName = `Stock_Restate_${fromDate}_to_${toDate}.xlsx`;
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

  // Format data for Excel
  const formatStockRestateDataForExcel = (stockRestateData) => {
    const excelData = [];

    stockRestateData.forEach((mainRecord) => {
      if (
        mainRecord.stockRestateDetailsVO &&
        mainRecord.stockRestateDetailsVO.length > 0
      ) {
        mainRecord.stockRestateDetailsVO.forEach((detail) => {
          excelData.push({
            "Doc ID": mainRecord.docId || "",
            "Doc Date": formatDateForDisplay(mainRecord.docDate),
            "Transfer From": mainRecord.transferFrom || "",
            "Transfer To": mainRecord.transferTo || "",
            "Entry No": mainRecord.entryNo || "",
            "From Bin": detail.fromBin || "",
            "From Bin Type": detail.fromBinType || "",
            "Part No": detail.partNo || "",
            "Part Description": detail.partDesc || "",
            SKU: detail.sku || "",
            "GRN No": detail.grnNo || "",
            "Batch No": detail.batch || "",
            "To Bin": detail.toBin || "",
            "To Bin Type": detail.toBinType || "",
            "From Qty": detail.fromQty || "",
            "To Qty": detail.toQty || "",
            Remarks: detail.remarks || "",
            "Created By": mainRecord.createdBy || "",
          });
        });
      } else {
        excelData.push({
          "Doc ID": mainRecord.docId || "",
          "Doc Date": formatDateForDisplay(mainRecord.docDate),
          "Transfer From": mainRecord.transferFrom || "",
          "Transfer To": mainRecord.transferTo || "",
          "Entry No": mainRecord.entryNo || "",
          "From Bin": "",
          "From Bin Type": "",
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "GRN No": "",
          "Batch No": "",
          "To Bin": "",
          "To Bin Type": "",
          "From Qty": "",
          "To Qty": "",
          Remarks: "",
          "Created By": mainRecord.createdBy || "",
        });
      }
    });

    return excelData;
  };

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";

    try {
      let date;
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts[0].length === 4) {
          date = dayjs(dateString, "YYYY-MM-DD");
        } else if (parts[0].length === 2) {
          date = dayjs(dateString, "DD-MM-YYYY");
        }
      } else {
        date = dayjs(dateString);
      }

      return date && date.isValid() ? date.format("DD-MM-YYYY") : "";
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return "";
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

  const getFillGridDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/api/stockRestate/getFillGridDetailsForStockRestate?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&tranferFromFlag=${formData.transferFromFlag}&tranferToFlag=${formData.transferToFlag}&warehouse=${loginWarehouse}&entryNo=${formData.entryNo}`
      );

      if (response.data.status === true) {
        const gridDetails = response.data.paramObjectsMap.fillGridDetails || [];

        const modalData = gridDetails.map((row, index) => ({
          id: row.id || index,
          fromBin: row.fromBin || "",
          fromBinClass: row.fromBinClass || "",
          fromBinType: row.fromBinType || "",
          fromCellType: row.fromCellType || "",
          partNo: row.partNo || "",
          partDesc: row.partDesc || "",
          sku: row.sku || "",
          grnNo: row.grnNo || "",
          grnDate: row.grnDate || "",
          batchNo: row.batchNo || "",
          batchDate: row.batchDate || "",
          expDate: row.expDate || "",
          toBin: row.toBin || "",
          toBinType: row.ToBinType || "",
          toBinClass: row.ToBinClass || "",
          toCellType: row.ToCellType || "",
          fromQty: row.fromQty || 0,
          toQty: row.toQty || 0,
          remainQty: (row.fromQty || 0) - (row.toQty || 0),
          fromCore: row.fromCore || "",
          toCore: row.ToCore || "",
          qcFlag: row.qcFlag || "",
        }));

        setModalTableData(modalData);
        setFilteredModalData(modalData);
        setIsModalVisible(true);
      } else {
        message.error("Failed to fetch grid details");
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
      message.error("Error fetching grid details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseFillGridData = () => {
    if (selectedModalRows.length === 0) {
      message.warning("Please select at least one record");
      return;
    }

    setDetailTableData(selectedModalRows);
    setIsModalVisible(false);
    setModalFilters({ partNo: "", fromBin: "" });
    setSelectedModalRows([]); // Clear selection after use
    message.success("Selected data applied successfully");
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalFilters({ partNo: "", fromBin: "" });
    setSelectedModalRows([]);
  };

  const handleOpenModal = () => {
    if (!formData.transferFromFlag || !formData.transferToFlag) {
      message.error("Please select Transfer From and Transfer To first");
      return;
    }
    getFillGridDetails();
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
    const selectedPart = row.rowPartNoList?.find(
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
              grnNo: selectedGrnNo?.grnNo || "",
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
              batchNo: selectedBatchNo?.batchNo || "",
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
              toBin: selectedToBin?.toBin || "",
              toBinType: selectedToBin?.tobinType || "",
              toBinClass: selectedToBin?.toBinClass || "",
              toCellType: selectedToBin?.toCellType || "",
              toCore: selectedToBin?.toCore || "",
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

      // Validate required fields
      if (!formData.transferFrom || !formData.transferTo) {
        showToast("Please select Transfer From and Transfer To", "error");
        return;
      }

      if (detailTableData.length === 0) {
        showToast("Please add at least one item", "error");
        return;
      }

      const formattedDocDate = formData.docDate.format("YYYY-MM-DD");

      const saveData = {
        ...(editId && { id: parseInt(editId) }),
        ...formData,
        docDate: formattedDocDate,
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
          grnDate: item.grnDate
            ? dayjs(item.grnDate).format("YYYY-MM-DD")
            : null,
          batch: item.batchNo,
          batchDate: item.batchDate
            ? dayjs(item.batchDate).format("YYYY-MM-DD")
            : null,
          expDate: item.expDate
            ? dayjs(item.expDate).format("YYYY-MM-DD")
            : null,
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
        showToast(
          editId
            ? "Stock Restate updated successfully"
            : "Stock Restate created successfully",
          "success"
        );
        handleClear();
        getAllStockRestate();
      } else {
        showToast(
          response.data.message || "Failed to save Stock Restate",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving Stock Restate:", error);
      showToast("Failed to save Stock Restate", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllStockRestate();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  const handleEditStockRestate = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: dayjs(record.docDate),
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
        grnDate: item.grnDate ? dayjs(item.grnDate) : null, // Convert string to Day.js object
        batchNo: item.batch,
        batchDate: item.batchDate ? dayjs(item.batchDate) : null,
        expDate: item.expDate ? dayjs(item.expDate) : null,
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

  const handleUploadSubmit = () => {
    console.log("Submit clicked");
    setUploadOpen(false);
    getAllStockRestate();
  };

  const getAvailableTransferTo = (transferFrom) => {
    return transferType.filter((item) => !transferFrom.includes(item.value));
  };

  // Custom Glass Modal Component
  const GlassModal = ({
    visible,
    onCancel,
    title,
    children,
    width = 1200,
    footer = null,
  }) => {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={footer}
        width={width}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        maskClosable={false} // ✅ Prevent close when clicking outside
        keyboard={false}
        styles={{
          body: {
            padding: 0,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
          },
          header: {
            background: "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px 16px 0 0",
            color: "white",
            padding: "16px 24px",
            color: "white",
          },
          content: {
            backdropFilter: "blur(5px)",
            background: "transparent",
            color: "white",
          },
          mask: {
            backdropFilter: "blur(5px)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
          },
        }}
        title={title}
      >
        <div
          style={{
            padding: "24px",
            background: "transparent",
            background: "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 极致的玻璃效果设计)",
            borderRadius: "16px 16px 0 0",
            color: "white",
            padding: "16px 24px",
            color: "white",
          }}
          onClick={(e) => e.stopPropagation()} // ✅ prevent bubbling from child clicks
        >
          {children}
        </div>
      </Modal>
    );
  };

  const handleModalRowSelect = (e, record) => {
    if (e.target.checked) {
      setSelectedModalRows([...selectedModalRows, record]);
    } else {
      setSelectedModalRows(
        selectedModalRows.filter((row) => row.id !== record.id)
      );
    }
  };

  const handleConfirmSelection = () => {
    if (selectedModalRows.length === 0) {
      message.warning("Please select at least one record");
      return;
    }

    setDetailTableData(selectedModalRows);
    setIsModalVisible(false);
    setModalFilters({ partNo: "", fromBin: "" });
    setSelectedModalRows([]);
    message.success("Selected data applied successfully");
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedModalRows([...filteredModalData]);
    } else {
      setSelectedModalRows([]);
    }
  };
  // Fill Grid Modal Columns
  const fillGridColumns = [
    {
      title: "Select",
      key: "selection",
      fixed: "left",
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedModalRows.some((row) => row.id === record.id)}
          onChange={(e) => handleModalRowSelect(e, record)}
        />
      ),
    },
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
    },
    {
      title: "From Bin",
      dataIndex: "fromBin",
      key: "fromBin",
    },
    {
      title: "Part No",
      dataIndex: "partNo",
      key: "partNo",
    },
    {
      title: "Part Description",
      dataIndex: "partDesc",
      key: "partDesc",
    },
    {
      title: "GRN No",
      dataIndex: "grnNo",
      key: "grnNo",
    },
    {
      title: "Batch No",
      dataIndex: "batchNo",
      key: "batchNo",
    },
    {
      title: "To Bin",
      dataIndex: "toBin",
      key: "toBin",
    },
    {
      title: "From Qty",
      dataIndex: "fromQty",
      key: "fromQty",
      render: (text) => text || 0,
    },
    {
      title: "To Qty",
      dataIndex: "toQty",
      key: "toQty",
      render: (text) => text || 0,
    },
  ];

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
    background: "rgba(255, 255, 255, 极致的玻璃效果设计)",
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
                  disabled={editId > 0} // ✅ disable if EditId > 0
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
                                className="white-datepicker"
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={formData.docDate}
                                disabled
                                format="DD-MM-YYYY"
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
                                onChange={(value) => {
                                  const transferFromFlag =
                                    value === "DEFECTIVE"
                                      ? "D"
                                      : value === "HOLD"
                                      ? "H"
                                      : value === "RELEASE"
                                      ? "R"
                                      : value === "VAS"
                                      ? "V"
                                      : "";

                                  setFormData({
                                    ...formData,
                                    transferFrom: value,
                                    transferFromFlag: transferFromFlag, // Only set transferFromFlag
                                  });

                                  // Call API to get from bin list with the new flag
                                  getFromBin(transferFromFlag);
                                }}
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
                                onChange={(value) => {
                                  const transferToFlag =
                                    value === "DEFECTIVE"
                                      ? "D"
                                      : value === "HOLD"
                                      ? "H"
                                      : value === "RELEASE"
                                      ? "R"
                                      : value === "VAS"
                                      ? "V"
                                      : "";

                                  setFormData({
                                    ...formData,
                                    transferTo: value,
                                    transferToFlag: transferToFlag,
                                  });

                                  // Call API to get to bin details with the transferFromFlag
                                  getToBinDetails(formData.transferFromFlag);
                                }}
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
                        <Button
                          icon={<AppstoreAddOutlined />}
                          onClick={handleOpenModal}
                          className="action-btn"
                          style={{
                            backgroundColor: "transparent",
                            color: "white",
                            border: "none",
                          }}
                          disabled={
                            !formData.transferFromFlag ||
                            !formData.transferToFlag
                          }
                        >
                          Fill Grid
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
              className="form-containerSG"
              style={{
                minHeight: "80vh",
                background: "var(--bg-body-gradient)",
                marginTop: "20px",
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
                  Stock Restate List
                </Typography.Title>
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
                  margin: "10px auto",
                  background: "var(--bg-body-gradient)",
                }}
              >
                {" "}
                <Space>
                  {/* Search Input */}
                  <Input
                    placeholder="Search stock restate..."
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

                  {/* Date Range Picker */}
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
                      border:
                        "1px solid rgba(255, 255, 255, 极致的玻璃效果设计)",
                      color: "white",
                    }}
                    placeholder={["From Date", "To Date"]}
                    format="DD-MM-YYYY"
                  />

                  {/* Download Excel Button */}
                  <Button
                    icon={<DownloadOutlined />}
                    loading={downloadLoading}
                    onClick={downloadExcel}
                    style={{
                      backgroundColor: "rgba(40, 167, 69, 0.3)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Export Excel
                  </Button>

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
                    Add New
                  </Button>
                </Space>
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
                        Doc No
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
                        Transfer From
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Transfer To
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRestateList
                      .filter(
                        (item) =>
                          !searchTerm ||
                          (item.docId &&
                            item.docId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={`sales-return-${index}-${item.id}`}
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
                              onClick={() => handleEditStockRestate(item)}
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
                            {item.transferFrom}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.transferTo}
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
                    {Math.min(currentPage * pageSize, stockRestateList.length)}{" "}
                    of {stockRestateList.length} items
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
                    { length: Math.ceil(stockRestateList.length / pageSize) },
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
                          Math.ceil(stockRestateList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(stockRestateList.length / pageSize)
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
                        Math.ceil(stockRestateList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(stockRestateList.length / pageSize)
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
        <GlassModal
          visible={isModalVisible}
          onCancel={handleCloseModal}
          // title="Fill Grid Details"
          width={1200}
          // Replace the existing footer with this:
          footer={[
            <Button key="cancel" onClick={handleCloseModal}>
              Cancel
            </Button>,
            <Button
              key="ok"
              type="primary"
              onClick={handleConfirmSelection}
              disabled={selectedModalRows.length === 0}
            >
              OK ({selectedModalRows.length} selected)
            </Button>,
          ]}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Text style={{ color: "white" }}>Fill Grid Details</Text>
              <Form.Item
                label={<span style={{ color: "#fff" }}>Selection</span>}
              >
                <Checkbox
                  indeterminate={
                    selectedModalRows.length > 0 &&
                    selectedModalRows.length < filteredModalData.length
                  }
                  checked={
                    filteredModalData.length > 0 &&
                    selectedModalRows.length === filteredModalData.length
                  }
                  onChange={handleSelectAll}
                >
                  {<span style={{ color: "#fff" }}>Select All</span>} (
                  <Text style={{ color: "white" }}>
                    {selectedModalRows.length} selected)
                  </Text>
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={<span style={{ color: "#fff" }}>Part No Search</span>}
              >
                <Input
                  placeholder="Search by part number..."
                  value={modalFilters.partNo}
                  onChange={(e) =>
                    setModalFilters({
                      ...modalFilters,
                      partNo: e.target.value,
                    })
                  }
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <span style={{ color: "#fff" }}>
                    From Bin (Pallet) Search
                  </span>
                }
              >
                <Input
                  placeholder="Search by from bin..."
                  value={modalFilters.fromBin}
                  onChange={(e) =>
                    setModalFilters({
                      ...modalFilters,
                      fromBin: e.target.value,
                    })
                  }
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span style={{ color: "#fff" }}>Actions</span>}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setModalFilters({ partNo: "", fromBin: "" })}
                  style={{ marginRight: 8 }}
                >
                  Clear Filters
                </Button>
                <Text style={{ color: "white" }}>
                  Showing {filteredModalData.length} of {modalTableData.length}{" "}
                  items
                </Text>
              </Form.Item>
            </Col>
          </Row>

          {/* Data Table */}
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
              className="table-container"
              style={{
                position: "relative",
                width: "100%",
                overflowX: "auto",
                fontSize: "11px",
                backgroundColor: "transparent",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {" "}
              <table
                style={{
                  width: "max-content",
                  minWidth: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "transparent",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px dashed #000",
                      zIndex: 2,
                      position: "sticky",
                      top: 0,
                      backgroundColor: "transparent",
                    }}
                  >
                    <th style={{ backgroundColor: "transparent" }}>Select</th>
                    <th style={{ backgroundColor: "transparent" }}>S.No</th>
                    <th style={{ backgroundColor: "transparent" }}>From Bin</th>
                    <th style={{ backgroundColor: "transparent" }}>Part No</th>
                    <th style={{ backgroundColor: "transparent" }}>
                      Part Description
                    </th>
                    <th style={{ backgroundColor: "transparent" }}>GRN No</th>
                    <th style={{ backgroundColor: "transparent" }}>Batch No</th>
                    <th style={{ backgroundColor: "transparent" }}>To Bin</th>
                    <th style={{ backgroundColor: "transparent" }}>From Qty</th>
                    <th style={{ backgroundColor: "transparent" }}>To Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalData.map((row, index) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: "1px dashed rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <td>
                        <Checkbox
                          checked={selectedModalRows.some(
                            (r) => r.id === row.id
                          )}
                          onChange={(e) => handleModalRowSelect(e, row)}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{row.fromBin}</td>
                      <td>{row.partNo}</td>
                      <td>{row.partDesc}</td>
                      <td>{row.grnNo}</td>
                      <td>{row.batchNo}</td>
                      <td>{row.toBin}</td>
                      <td style={{ textAlign: "right" }}>{row.fromQty || 0}</td>
                      <td style={{ textAlign: "right" }}>{row.toQty || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassModal>
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
