import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save";
import { showToast } from "../utils/toast-component";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const { Option } = Select;
const { TabPane } = Tabs;

const PendingPickRequest = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [loginFinYear] = useState(localStorage.getItem("finYear"));
  const [loginClient] = useState(localStorage.getItem("client"));
  const [loginBranch] = useState(localStorage.getItem("branch"));
  const [loginBranchCode] = useState(localStorage.getItem("branchcode"));
  const [loginCustomer] = useState(localStorage.getItem("customer"));
  const [loginWarehouse] = useState(localStorage.getItem("warehouse"));
  const [loginUserName] = useState(localStorage.getItem("userName"));
  const [viewMode, setViewMode] = useState("list");
  const [rowData, setRowData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: "S No",
      dataIndex: "sno",
      key: "sno",
      width: 80,
    },
    {
      title: "Buyer Order No",
      dataIndex: "buyerOrderNo",
      key: "buyerOrderNo",
      width: 150,
    },
    {
      title: "Buyer Order Date",
      dataIndex: "buyerOrderDate",
      key: "buyerOrderDate",
      width: 200,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Buyer Ref Date",
      dataIndex: "buyerRefDate",
      key: "buyerRefDate",
      width: 200,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Buyer Ref No",
      dataIndex: "buyerRefNo",
      key: "buyerRefNo",
      width: 150,
    },
    {
      title: "Buyers Reference",
      dataIndex: "buyersReference",
      key: "buyersReference",
      width: 200,
    },
    {
      title: "Buyers Reference Date",
      dataIndex: "buyersReferenceDate",
      key: "buyersReferenceDate",
      width: 200,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 150,
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      width: 200,
    },
    // {
    //   title: "Client Short Name",
    //   dataIndex: "clientShortName",
    //   key: "clientShortName",
    //   width: 150,
    // },
    // {
    //   title: "Customer Name",
    //   dataIndex: "customerName",
    //   key: "customerName",
    //   width: 200,
    // },
    // {
    //   title: "Customer Short Name",
    //   dataIndex: "customerShortName",
    //   key: "customerShortName",
    //   width: 150,
    // },
  ];

  useEffect(() => {
    getPendingPickDetails();
  }, []);

  const getPendingPickDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/pickrequest/getPendingPickDetails?branchCode=${loginBranchCode}&finYear=${loginFinYear}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        setRowData(
          response.data.paramObjectsMap.pendingPickdetails.map(
            (item, index) => ({
              ...item,
              key: index,
              sno: index + 1,
            })
          )
        );
      } else {
        showToast(
          "error",
          response.data.paramObjectsMap?.errorMessage || "Report Fetch failed"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Report Fetch failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Utility to normalize date
  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return "";

    // If it's already in YYYY-MM-DD format
    if (
      typeof dateValue === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
      return dateValue;
    }

    // If it's like "2025-08-24 00:00:00.0"
    if (typeof dateValue === "string" && dateValue.includes(" ")) {
      return dateValue.split(" ")[0]; // keep only date part
    }

    // If it's a Date or other string
    const parsed = dayjs(dateValue);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  };

  const handleSelectedRows = async () => {
    if (selectedRows.length === 0) {
      showToast("error", "Please select at least one order");
      return;
    }

    setIsLoading(true);

    const saveFormData = selectedRows.map((row) => ({
      branch: loginBranch,
      branchCode: loginBranchCode,
      buyerOrderDate: formatDateForAPI(row.buyerOrderDate),
      buyerOrderNo: row.buyerOrderNo,
      buyerRefDate: formatDateForAPI(row.buyerRefDate),
      buyerRefNo: row.buyerRefNo,
      buyersReference: row.buyersReference || "",
      client: loginClient,
      clientName: row.clientName,
      clientShortName: row.clientShortName,
      createdBy: loginUserName,
      customer: loginCustomer,
      customerName: row.customerName,
      customerShortName: row.customerShortName,
      finYear: loginFinYear,
      invoiceNo: row.invoiceNo || "",
      orgId: parseInt(orgId, 10) || 0,
      warehouse: loginWarehouse,
    }));

    console.log("📦 Final payload to API:", saveFormData);

    try {
      const response = await axios.post(
        `${API_URL}/api/pickrequest/createMultiplePickRequest`,
        saveFormData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === true) {
        showToast("success", "Multiple Pick Requests created successfully");
        handleClear();
        getPendingPickDetails();
      } else {
        showToast(
          "error",
          response.data.paramObjectsMap?.errorMessage ||
            "Multiple Pick Request creation failed"
        );
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      showToast(
        "error",
        err.response?.data?.paramObjectsMap?.errorMessage ||
          "Multiple Pick Request creation failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // In the JSX, update the onClick handler:

  const handleClear = () => {
    setSelectedRows([]);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  // Handle select all on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all rows on current page
      const currentPageRows = rowData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );
      // Merge with existing selected rows, avoiding duplicates
      const newSelectedRows = [...selectedRows];
      currentPageRows.forEach((row) => {
        if (
          !newSelectedRows.some((selectedRow) => selectedRow.key === row.key)
        ) {
          newSelectedRows.push(row);
        }
      });
      setSelectedRows(newSelectedRows);
    } else {
      // Deselect all rows on current page
      const currentPageRowKeys = rowData
        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .map((row) => row.key);
      setSelectedRows(
        selectedRows.filter((row) => !currentPageRowKeys.includes(row.key))
      );
    }
  };

  // Handle individual row selection
  const handleRowSelect = (row, e) => {
    if (e.target.checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(
        selectedRows.filter((selectedRow) => selectedRow.key !== row.key)
      );
    }
  };

  // Check if all rows on current page are selected
  const isAllSelected = () => {
    const currentPageRows = rowData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    return (
      currentPageRows.length > 0 &&
      currentPageRows.every((row) =>
        selectedRows.some((selectedRow) => selectedRow.key === row.key)
      )
    );
  };

  // Check if some but not all rows on current page are selected
  const isSomeSelected = () => {
    const currentPageRows = rowData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    return (
      currentPageRows.some((row) =>
        selectedRows.some((selectedRow) => selectedRow.key === row.key)
      ) && !isAllSelected()
    );
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
                padding: "20px",
              }}
            >
              <Typography.Title level={3} style={{ color: "#fff", margin: 0 }}>
                Generating Multiple Pick Requests
              </Typography.Title>
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
                  {viewMode === "form" ? "List View" : "Form View"}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="action-buttons"
              style={{
                display: "flex",
                gap: "10px",
                padding: "0 20px 20px 20px",
              }}
            >
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
                onClick={handleSelectedRows} // Now it will work correctly
                loading={isSubmitting}
                className="primary-action-btn"
                style={{
                  background: "rgba(108, 99, 255, 0.3)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Generate Multiple Pick Requests
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

            {/* Table Section */}
            <div
              className="table-container"
              style={{
                position: "relative",
                width: "90%",
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
                    {/* Add checkbox column header */}
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        color: "white",
                        width: "50px",
                      }}
                    >
                      <Checkbox
                        onChange={handleSelectAll}
                        checked={isAllSelected()}
                        indeterminate={isSomeSelected()}
                      />
                    </th>
                    {columns.map((column) => (
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
                  </tr>
                </thead>
                <tbody>
                  {rowData
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((row, index) => {
                      const isSelected = selectedRows.some(
                        (selectedRow) => selectedRow.key === row.key
                      );

                      return (
                        <tr
                          key={`row-${index}-${row.key || index}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          {/* Add checkbox for each row */}
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleRowSelect(row, e)}
                            />
                          </td>
                          {columns.map((column) => (
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
                                ? column.render(row[column.dataIndex], row)
                                : row[column.dataIndex]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {/* Pagination */}
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
                    padding: "2px 8px",
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
                      Math.min(prev + 1, Math.ceil(rowData.length / pageSize))
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
                    padding: "2px 8px",
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
                    padding: "2px 4px",
                    borderRadius: "4px",
                  }}
                >
                  {["5", "10", "20", "50"].map((size) => (
                    <option
                      key={size}
                      value={size}
                      style={{ background: "#1A1A2E" }}
                    >
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </ConfigProvider>
  );
};

export default PendingPickRequest;
