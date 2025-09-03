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

export const StockConsolidationBinWise = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
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
  const [binList, setBinList] = useState([]);
  const [formData, setFormData] = useState({
    selectedDate: dayjs().format("DD-MM-YYYY"),
    partNo: "",
    bin: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    selectedDate: "",
    partNo: "",
    bin: "",
  });
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [totalQty, setTotalQty] = useState(0);

  const [batchList, setBatchList] = useState([]);

  const [statusList, setStatusList] = useState([]);

  const getBatchForStockReportBinAndBatchWise = async (partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getBatchForStockReportBinAndBatchWise?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}&customer=${loginCustomer}&partNo=${partNo}`
      );

      // Ensure we always set an array, even if the response structure is different
      const batchData = response.data.paramObjectsMap?.stockDetails || [];
      setBatchList(batchData);
    } catch (err) {
      console.log("error", err);
      setBatchList([]); // Set empty array on error
    }
  };

  // Similarly for other API calls
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

  // Add this useEffect to calculate total whenever rowData changes
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
    getAllPartNo();
  }, []);

  const getAllActivePartDetails = async (cBranch, client, orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/material?cbranch=${cBranch}&client=${client}&orgid=${orgId}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        const partData = response.data.paramObjectsMap.materialVO
          .filter((row) => row.active === "Active")
          .map(({ id, itemType, partno, partDesc, sku }) => ({
            id,
            itemType,
            partno,
            partDesc,
            sku,
          }));

        return partData;
      } else {
        console.error("API Error:", response);
        return response;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  };

  const getAllPartNo = async () => {
    try {
      const partData = await getAllActivePartDetails(
        loginBranchCode,
        loginClient,
        orgId
      );
      console.log("THE PART DATA ARE:", partData);

      const allParts = [
        { partno: "ALL", partDesc: "All Parts", id: null },
        ...partData,
      ];
      setPartList(allParts);
    } catch (error) {
      console.error("Error fetching part data:", error);
    }
  };

  const getAllBin = async (selectedPartNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getBinNoForBinWise?branchCode=${loginBranchCode}&client=${loginClient}&customer=${loginCustomer}&orgId=${orgId}&partNo=${selectedPartNo}&warehouse=${loginWarehouse}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        setBinList(response.data.paramObjectsMap.stockDetails);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      selectedDate: dayjs(),
      partNo: "",
      bin: "",
    });
    setFieldErrors({
      selectedDate: "",
      partNo: "",
      bin: "",
    });
    setListView(false);
  };

  const handleSearch = async () => {
    const errors = {};
    if (!formData.partNo) {
      errors.partNo = "Part No is required";
    }
    if (!formData.bin) {
      errors.bin = "Bin is required";
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/Reports/getStockReportBinWise?bin=${formData.bin}&branchCode=${loginBranchCode}&client=${loginClient}&customer=${loginCustomer}&orgId=${orgId}&partNo=${formData.partNo}&warehouse=${loginWarehouse}`
        );

        if (response.data.status === true) {
          console.log("Response:", response);
          setRowData(response.data.paramObjectsMap.stockDetails);
          setIsLoading(false);
          setListView(true);
        } else {
          showToast(
            "error",
            response.data.paramObjectsMap?.errorMessage || "Report Fetch failed"
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
        "Bin",
        "Available Quantity",
      ];

      // Data rows
      const dataRows = rowData.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.bin || "-",
        parseFloat(item.avlQty || 0),
      ]);

      // Summary rows
      const summaryRows = [
        [], // Empty row for spacing
        ["", "", "", "TOTAL QUANTITY:", totalQty],
        ["", "", "", "TOTAL ITEMS:", rowData.length],
        ["", "", "", "REPORT DATE:", dayjs().format("YYYY-MM-DD")],
        ["", "", "", "GENERATED ON:", dayjs().format("YYYY-MM-DD HH:mm:ss")],
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
          for (let C = 3; C <= 4; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[cellAddress]) {
              if (C === 3) {
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
        { wch: 15 }, // Bin
        { wch: 20 }, // Available Quantity
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Bin Summary");

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
      const fileName = `Stock_Bin_Summary_${dayjs().format(
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

  const handlePartNoChange = (fieldName) => (event, value) => {
    if (value && typeof value === "object") {
      const partNo = value.partno || "";

      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: partNo,
        bin: "", // Clear bin when partNo changes
      }));

      if (partNo && partNo !== "ALL") {
        getAllBin(partNo); // Fetch bin list for selected part number
      } else {
        setBinList([]); // Clear bin list if 'ALL' or empty
      }
    } else if (value === "" || value === null) {
      // Handle case when input is cleared
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: "",
        bin: "",
      }));
      setBinList([]); // Clear bin list
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "", // Clear errors for partNo
    }));
  };

  const handleBinChange = (fieldName) => (event, value) => {
    if (value && typeof value === "object") {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value.Bin || "",
      }));
    } else if (value === "" || value === null) {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: "",
      }));
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "",
    }));
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
                Stock Consolidation - Bin Wise
              </Typography.Title>
              <Typography.Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                To View Your Stock Summary by Bin
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
                marginTop: "20px",
              }}
            >
              {/* Search and Filter Controls */}
              <div
                style={{
                  margin: "30px",
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
                      typeof option === "string" ? option : option.partno
                    }
                    size="small"
                    value={formData.partNo || null}
                    onChange={(e, newValue) => {
                      const partNo =
                        typeof newValue === "string"
                          ? newValue
                          : newValue?.partno || "";

                      setFormData((prev) => ({
                        ...prev,
                        partNo: partNo,
                        bin: "", // Clear bin when partNo changes
                      }));

                      // Call getAllBin automatically when a part number is selected
                      if (partNo && partNo !== "ALL") {
                        getAllBin(partNo);
                      } else {
                        setBinList([]); // Clear bin list if 'ALL' or empty
                      }
                    }}
                    onInputChange={(e, newInputValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        partNo: newInputValue,
                      }));
                    }}
                    sx={{
                      width: 250,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "8px",
                        color: "white",
                        paddingRight: "8px",
                        "&:hover fieldset": {
                          borderColor: "#90caf9", // light blue hover
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#673ab7", // purple focus (like Supplier)
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
                    freeSolo
                    options={binList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.Bin || ""
                    }
                    size="small"
                    value={formData.bin || null}
                    onChange={(e, newValue) => {
                      handleBinChange("bin")(e, newValue);
                    }}
                    onInputChange={(e, newInputValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        bin: newInputValue,
                      }));
                    }}
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
                        label="Bin"
                        error={!!fieldErrors.bin}
                        helperText={fieldErrors.bin}
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
                          Bin
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
                              {item.bin}
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
                          colSpan={3}
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
    </ConfigProvider>
  );
};

export default StockConsolidationBinWise;
