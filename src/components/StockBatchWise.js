import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Button, ConfigProvider, DatePicker, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { showToast } from "../utils/toast-component";
import * as XLSX from "xlsx";
import {
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Title } = Typography;

export const StockBatchWise = () => {
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
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [formData, setFormData] = useState({
    partNo: "",
    batch: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    partNo: "",
    batch: "",
  });
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    getAllPartNo();
  }, []);

  const getAllBatch = async (selectedPartNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/Reports/getBatchForBatchWiseReport?branchCode=${loginBranchCode}&client=${loginClient}&customer=${loginCustomer}&orgId=${orgId}&partNo=${selectedPartNo}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setBatchList(response.paramObjectsMap.stockDetails);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllPartNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Reports/getPartNoForBatchWiseReport?branchCode=${loginBranchCode}&client=${loginClient}&customer=${loginCustomer}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        const partData = response.data.paramObjectsMap.stockDetails;
        const allParts = [
          { partNo: "ALL", partDesc: "All Parts", id: null },
          ...partData,
        ];
        setPartList(allParts);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      partNo: "",
      batch: "",
    });
    setFieldErrors({
      partNo: "",
      batch: "",
    });
    setListView(false);
  };

  const handleSearch = async () => {
    const errors = {};
    if (!formData.batch) {
      errors.batch = "Batch No is required";
    }
    if (!formData.partNo) {
      errors.partNo = "Part No is required";
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/Reports/getStockReportBatchWise?batch=${formData.batch}&branchCode=${loginBranchCode}&client=${loginClient}&customer=${loginCustomer}&orgId=${orgId}&partNo=${formData.partNo}&warehouse=${loginWarehouse}`
        );
        if (response.data.status === true) {
          setRowData(response.data.paramObjectsMap.stockDetails);
          setIsLoading(false);
          setListView(true);
        } else {
          showToast(
            "error",
            response.paramObjectsMap.message || "Report Fetch failed"
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

  const handleBatchNoChange = (event, newValue) => {
    if (newValue && newValue.batch) {
      setFormData((prevData) => ({
        ...prevData,
        batch: newValue.batch,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        batch: "",
      }));
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      batch: "",
    }));
  };

  const handlePartNoChange = (event, newValue) => {
    if (newValue && newValue.partNo) {
      setFormData((prevData) => ({
        ...prevData,
        partNo: newValue.partNo,
        batch: "",
      }));
      setBatchList([]);
      getAllBatch(newValue.partNo);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        partNo: "",
        batch: "",
      }));
      setBatchList([]);
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      partNo: "",
    }));
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
        "Batch No",
        "Available Quantity",
      ];

      // Data rows
      const dataRows = rowData.map((item, index) => [
        index + 1,
        item.partNo || "-",
        item.partDesc || "-",
        item.batch || "-",
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
                  fill: { fgColor: { rgb: "E6E6FA" } },
                };
              } else {
                // Value cells
                worksheet[cellAddress].s = {
                  font: { bold: true, color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "F0F8FF" } },
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
        { wch: 15 }, // Batch No
        { wch: 20 }, // Available Quantity
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Batch Summary");

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
      const fileName = `Stock_Batch_Summary_${dayjs().format(
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
                Stock Batch Wise Report
              </Typography.Title>
              <Typography.Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                To View Your Stock Summary by Batch
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
                  <Autocomplete
                    disablePortal
                    freeSolo
                    options={partList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.partNo
                    }
                    size="small"
                    value={formData.partNo || null}
                    onChange={handlePartNoChange}
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
                    freeSolo
                    options={batchList}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.batch || ""
                    }
                    size="small"
                    value={formData.batch || null}
                    onChange={handleBatchNoChange}
                    onInputChange={(e, newInputValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        batch: newInputValue,
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
                        label="Batch No"
                        error={!!fieldErrors.batch}
                        helperText={fieldErrors.batch}
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
                          S.No
                        </th>
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
                          Batch No
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
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>
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
                          colSpan={4}
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

export default StockBatchWise;
