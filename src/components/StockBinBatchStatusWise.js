import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ActionButton from "../utils/ActionButton";
import * as XLSX from "xlsx";
import { showToast } from "../utils/toast-component";

import {
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import axios from "axios";

const { Title } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const StockBinBatchStatusWise = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [partList, setPartList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [binList, setBinList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [formData, setFormData] = useState({
    selectedDate: dayjs().format("DD-MM-YYYY"),
    partNo: "",
    batch: "",
    bin: "",
    status: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    selectedDate: "",
    partNo: "",
    batch: "",
    bin: "",
    status: "",
  });
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [totalQty, setTotalQty] = useState(0);

  // Calculate total quantity
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      const total = rowData.reduce((sum, item) => {
        const qty = parseFloat(item.avlQty) || 0;
        return sum + qty;
      }, 0);
      setTotalQty(total);
    } else {
      setTotalQty(0);
    }
  }, [rowData]);

  useEffect(() => {
    getPartNoForStockReportBinAndBatchWise();
  }, []);

  const getPartNoForStockReportBinAndBatchWise = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getPartNoForStockReportBinAndBatchWise?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}&customer=${loginCustomer}`
      );
      const partData = response.data.paramObjectsMap.stockDetails;
      const allParts = [
        { partNo: "ALL", partDesc: "All Parts", id: null },
        ...partData,
      ];
      setPartList(allParts);
    } catch (err) {
      console.log("error", err);
    }
  };

  const getBatchForStockReportBinAndBatchWise = async (partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getBatchForStockReportBinAndBatchWise?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}&customer=${loginCustomer}&partNo=${partNo}`
      );
      setBatchList(response.data.paramObjectsMap.stockDetails);
    } catch (err) {
      console.log("error", err);
    }
  };

  const getBinForStockReportBinAndBatchWise = async (batch) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getBinForStockReportBinAndBatchWise?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}&customer=${loginCustomer}&partNo=${formData.partNo}&batch=${batch}`
      );

      const binData = response.data.paramObjectsMap?.stockDetails || [];
      setBinList(binData);
    } catch (err) {
      console.log("error", err);
      setBinList([]);
    }
  };

  const getStatusForStockReportBinAndBatchWise = async (bin) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getStatusForStockReportBinAndBatchWise?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}&customer=${loginCustomer}&partNo=${formData.partNo}&batch=${formData.batch}&bin=${bin}`
      );

      const statusData = response.data.paramObjectsMap?.stockDetails || [];
      setStatusList(statusData);
    } catch (err) {
      console.log("error", err);
      setStatusList([]);
    }
  };

  const handleStatusChange = (event, newValue) => {
    if (newValue && newValue.status) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        status: newValue.status,
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      selectedDate: dayjs().format("DD-MM-YYYY"),
      partNo: "",
      batch: "",
      bin: "",
      status: "",
    });
    setFieldErrors({
      selectedDate: "",
      partNo: "",
      batch: "",
      bin: "",
      status: "",
    });
    setBatchList([]);
    setBinList([]);
    setStatusList([]);
    setListView(false);
  };

  const handlePartNoChange = (event, newValue) => {
    if (newValue && newValue.partNo) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        partNo: newValue.partNo,
        batch: newValue.partNo === "ALL" ? "ALL" : "",
        bin: newValue.partNo === "ALL" ? "ALL" : "",
        status: newValue.partNo === "ALL" ? "ALL" : "",
      }));

      setBatchList([]);
      setBinList([]);
      setStatusList([]);

      if (newValue.partNo !== "ALL") {
        getBatchForStockReportBinAndBatchWise(newValue.partNo);
      } else {
        // If partNo is ALL, set batchList, binList, and statusList to ALL options
        setBatchList([{ batch: "ALL" }]);
        setBinList([{ bin: "ALL" }]);
        setStatusList([{ status: "ALL" }]);
      }
    }
  };

  useEffect(() => {
    // Force scrollbar to be visible
    const tableContainer = document.querySelector(".table-container");
    if (tableContainer) {
      tableContainer.style.overflowY = "scroll";
    }
  }, []);

  const handleBatchNoChange = (event, newValue) => {
    if (newValue && newValue.batch) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        batch: newValue.batch,
        bin: newValue.batch === "ALL" ? "ALL" : "",
        status: newValue.batch === "ALL" ? "ALL" : "",
      }));

      setBinList([]);
      setStatusList([]);

      if (newValue.batch !== "ALL" && formData.partNo !== "ALL") {
        getBinForStockReportBinAndBatchWise(newValue.batch);
      } else if (newValue.batch === "ALL") {
        // If batch is ALL, set binList and statusList to ALL options
        setBinList([{ bin: "ALL" }]);
        setStatusList([{ status: "ALL" }]);
      }
    }
  };

  const handleBinChange = (event, newValue) => {
    if (newValue && newValue.bin) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        bin: newValue.bin,
        status: newValue.bin === "ALL" ? "ALL" : "",
      }));

      setStatusList([]);

      if (
        newValue.bin !== "ALL" &&
        formData.partNo !== "ALL" &&
        formData.batch !== "ALL"
      ) {
        getStatusForStockReportBinAndBatchWise(newValue.bin);
      } else if (newValue.bin === "ALL") {
        // If bin is ALL, set statusList to ALL option
        setStatusList([{ status: "ALL" }]);
      }
    }
  };
  // Also update your API calls to handle the "ALL" case
  const handleSearch = async () => {
    const errors = {};
    if (!formData.partNo) {
      errors.partNo = "Part No is required";
    }
    if (!formData.batch) {
      errors.batch = "Batch No is required";
    }
    if (!formData.bin) {
      errors.bin = "Bin is required";
    }
    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        // Build the API URL with proper handling for "ALL" values
        const params = new URLSearchParams({
          branchCode: loginBranchCode,
          client: loginClient,
          customer: loginCustomer,
          orgId: orgId,
          warehouse: loginWarehouse,
          partNo: formData.partNo,
          batch: formData.batch,
          bin: formData.bin,
          status: formData.status,
        });

        const response = await axios.get(
          `${API_URL}/api/Reports/getStockReportBinAndBatchWise?${params}`
        );

        if (response.data.status === true) {
          setRowData(response.data.paramObjectsMap.stockDetails || []);
          setIsLoading(false);
          setListView(true);
          setFieldErrors({
            selectedDate: "",
            partNo: "",
            batch: "",
            bin: "",
            status: "",
          });
        } else {
          showToast(
            "error",
            response.data.paramObjectsMap.errorMessage || "Report Fetch failed"
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "Report Fetch failed");
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleExcelDownload = () => {
    if (rowData.length === 0) {
      showToast("warning", "No data to export");
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Header row
      const headerRow = [
        "S.No",
        "Part No",
        "Part Description",
        "Batch",
        "Bin",
        "Status",
        "Available Quantity",
      ];

      // Data rows
      const dataRows = rowData.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.batch || "-",
        item.bin || "-",
        item.status || "-",
        parseFloat(item.avlQty || 0),
      ]);

      // Summary rows
      const summaryRows = [
        [], // Empty row for spacing
        ["", "", "", "", "", "TOTAL QUANTITY:", totalQty],
        ["", "", "", "", "", "TOTAL ITEMS:", rowData.length],
        ["", "", "", "", "", "REPORT DATE:", dayjs().format("YYYY-MM-DD")],
        [
          "",
          "",
          "",
          "",
          "",
          "GENERATED ON:",
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ],
      ];

      // Combine all data
      const excelData = [headerRow, ...dataRows, ...summaryRows];

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Apply styling
      if (worksheet["!ref"]) {
        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // Style header row
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4472C4" } },
              alignment: { horizontal: "center" },
            };
          }
        }

        // Style summary rows (total and info)
        const summaryStartRow = dataRows.length + 1;
        for (let R = summaryStartRow; R <= summaryStartRow + 4; R++) {
          for (let C = 5; C <= 6; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[cellAddress]) {
              if (C === 5) {
                // Label cells
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "E6E6FA" } }, // Lavender background
                };
              } else {
                // Value cells
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "F0F8FF" } }, // Alice blue background
                };
              }
            }
          }
        }
      }

      // Set column widths
      worksheet["!cols"] = [
        { wch: 8 }, // S.No
        { wch: 20 }, // Part No
        { wch: 40 }, // Part Description
        { wch: 15 }, // Batch
        { wch: 15 }, // Bin
        { wch: 15 }, // Status
        { wch: 20 }, // Available Quantity
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Stock Bin Batch Status Summary"
      );

      // Generate and download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `Stock_Bin_Batch_Status_Summary_${dayjs().format(
        "YYYY-MM-DD_HH-mm"
      )}.xlsx`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showToast("success", "Excel report with summary downloaded");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast("error", "Failed to export Excel report");
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
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
        <div
          style={{
            padding: "20px",
            marginTop: "60px",
            display: "revert",
            placeContent: "center",
            overflowY: "none",
            minHeight: "10dvh",
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
              <Typography.Title level={3} style={{ color: "#fff", margin: 0 }}>
                Stock Bin Batch Status Wise Report
              </Typography.Title>
              <Typography.Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                To View Your Stock Summary by Bin, Batch and Status
              </Typography.Text>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              className="form-containerSG"
              style={{
                minHeight: "90vh",
                background: "var(--bg-body-gradient)",
                marginTop: "40px",
              }}
            >
              {/* Search and Filter Controls */}
              <div
                style={{
                  margin: "20px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className="white-datepicker"
                      value={
                        formData.selectedDate
                          ? dayjs(formData.selectedDate, "DD-MM-YYYY")
                          : null
                      }
                      onChange={(date) =>
                        handleDateChange("selectedDate", date)
                      }
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!fieldErrors.selectedDate,
                          helperText: fieldErrors.selectedDate,
                          style: {
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "white",
                            borderRadius: "4px",
                          },
                        },
                      }}
                      format="DD-MM-YYYY"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <Autocomplete
                    disablePortal
                    freeSolo
                    options={partList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.partNo || ""
                    }
                    size="small"
                    value={formData.partNo || null}
                    onChange={handlePartNoChange}
                    sx={{
                      width: 200,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "8px",
                        color: "white",
                        paddingRight: "8px",
                        "&:hover fieldset": {
                          borderColor: "#90caf9",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#673ab7",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "white",
                        fontSize: "0.9rem",
                        padding: "6px 8px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-listbox": {
                        backgroundColor: "#2c2c34",
                        color: "white",
                        borderRadius: "8px",
                        padding: "4px",
                      },
                      "& .MuiAutocomplete-option": {
                        padding: "6px 10px",
                        borderRadius: "6px",
                        "&[aria-selected='true']": {
                          backgroundColor: "#673ab7 !important",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(103,58,183,0.6)",
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Part No"
                        error={!!fieldErrors.partNo}
                        helperText={fieldErrors.partNo}
                        InputLabelProps={{
                          style: { color: "rgba(255, 255, 255, 0.7)" },
                        }}
                      />
                    )}
                  />

                  <Autocomplete
                    disablePortal
                    freeSolo // Add freeSolo to allow typing
                    options={batchList || []}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.batch || ""
                    }
                    size="small"
                    value={formData.batch || null}
                    onChange={handleBatchNoChange}
                    onInputChange={(event, newInputValue) => {
                      // Handle direct typing in the input field
                      if (newInputValue !== formData.batch) {
                        setFormData((prev) => ({
                          ...prev,
                          batch: newInputValue,
                        }));
                      }
                    }}
                    disabled={!formData.partNo || formData.partNo === "ALL"}
                    sx={{
                      width: 180,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "8px",
                        color: "white",
                        paddingRight: "8px",
                        "&:hover fieldset": {
                          borderColor: "#90caf9",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#673ab7",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "white",
                        fontSize: "0.9rem",
                        padding: "6px 8px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-listbox": {
                        backgroundColor: "#2c2c34",
                        color: "white",
                        borderRadius: "8px",
                        padding: "4px",
                      },
                      "& .MuiAutocomplete-option": {
                        padding: "6px 10px",
                        borderRadius: "6px",
                        "&[aria-selected='true']": {
                          backgroundColor: "#673ab7 !important",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(103,58,183,0.6)",
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Batch No"
                        error={!!fieldErrors.batch}
                        helperText={fieldErrors.batch}
                        InputLabelProps={{
                          style: { color: "rgba(255, 255, 255, 0.7)" },
                        }}
                      />
                    )}
                  />

                  <Autocomplete
                    disablePortal
                    freeSolo
                    options={binList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.bin || ""
                    }
                    size="small"
                    value={formData.bin || null}
                    onChange={handleBinChange}
                    disabled={!formData.batch}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "8px",
                        color: "white",
                        paddingRight: "8px",
                        "&:hover fieldset": {
                          borderColor: "#90caf9",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#673ab7",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "white",
                        fontSize: "0.9rem",
                        padding: "6px 8px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-listbox": {
                        backgroundColor: "#2c2c34",
                        color: "white",
                        borderRadius: "8px",
                        padding: "4px",
                      },
                      "& .MuiAutocomplete-option": {
                        padding: "6px 10px",
                        borderRadius: "6px",
                        "&[aria-selected='true']": {
                          backgroundColor: "#673ab7 !important",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(103,58,183,0.6)",
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bin No"
                        error={!!fieldErrors.bin}
                        helperText={fieldErrors.bin}
                        InputLabelProps={{
                          style: { color: "rgba(255, 255, 255, 0.7)" },
                        }}
                      />
                    )}
                  />

                  <Autocomplete
                    disablePortal
                    freeSolo
                    options={statusList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.status || ""
                    }
                    size="small"
                    value={formData.status || null}
                    onChange={handleStatusChange}
                    disabled={!formData.bin}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "8px",
                        color: "white",
                        paddingRight: "8px",
                        "&:hover fieldset": {
                          borderColor: "#90caf9",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#673ab7",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "white",
                        fontSize: "0.9rem",
                        padding: "6px 8px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-listbox": {
                        backgroundColor: "#2c2c34",
                        color: "white",
                        borderRadius: "8px",
                        padding: "4px",
                      },
                      "& .MuiAutocomplete-option": {
                        padding: "6px 10px",
                        borderRadius: "6px",
                        "&[aria-selected='true']": {
                          backgroundColor: "#673ab7 !important",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(103,58,183,0.6)",
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Status"
                        error={!!fieldErrors.status}
                        helperText={fieldErrors.status}
                        InputLabelProps={{
                          style: { color: "rgba(255, 255, 255, 0.7)" },
                        }}
                      />
                    )}
                  />

                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    loading={isLoading}
                    style={{
                      background: "rgba(108, 99, 255, 0.3)",
                      color: "#fff",
                      border: "none",
                      height: "40px",
                    }}
                  >
                    Search
                  </Button>

                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      height: "40px",
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExcelDownload}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Export to Excel
                </Button>
              </div>

              {listView && (
                <div
                  className="table-container"
                  style={{
                    position: "relative",
                    width: "100%",
                    overflowX: "auto",
                    fontSize: "11px",
                    marginLeft: "0",
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
                      width: "100%",
                      borderCollapse: "collapse",
                      background: "var(--bg-body-gradient)",
                      minWidth: "600px",
                    }}
                  >
                    <thead>
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
                          Part No
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Part Description
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Batch
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Bin
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
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            color: "white",
                          }}
                        >
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData
                        .slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        )
                        .map((item, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              color: "white",
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(255, 255, 255, 0.02)"
                                  : "rgba(255, 255, 255, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(255, 255, 255, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                index % 2 === 0
                                  ? "rgba(255, 255, 255, 0.02)"
                                  : "rgba(255, 255, 255, 0.05)";
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
                              {item.partNo}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {item.partDesc}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {item.batch}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {item.bin}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {item.status}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {item.avlQty}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          borderTop: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <td
                          colSpan={5}
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          TOTAL:
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          {totalQty.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Custom Pagination */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "16px",
                      padding: "0 20px",
                      color: "white",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "16px", fontSize: "12px" }}>
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, rowData.length)} of{" "}
                      {rowData.length} items
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
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                      }}
                    >
                      Prev
                    </button>

                    {Array.from(
                      { length: Math.ceil(rowData.length / pageSize) },
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
                            padding: "4px 8px",
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
                            Math.ceil(rowData.length / pageSize)
                          )
                        )
                      }
                      disabled={
                        currentPage === Math.ceil(rowData.length / pageSize)
                      }
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "1px solid white",
                        margin: "0 4px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor:
                          currentPage === Math.ceil(rowData.length / pageSize)
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          currentPage === Math.ceil(rowData.length / pageSize)
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
                        padding: "4px 8px",
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
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </ConfigProvider>
  );
};

export default StockBinBatchStatusWise;
