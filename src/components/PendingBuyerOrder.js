import React, { useState, useEffect } from "react";
import { Button, ConfigProvider, Spin, Typography, Checkbox } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/sample_data_buyerorder.xls";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const PendingBuyerOrder = () => {
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toastId, setToastId] = useState(null);

  useEffect(() => {
    return () => {
      // Clean up any active toasts when component unmounts
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [toastId]);

  const showToast = (message, type = "default") => {
    const id =
      type === "error"
        ? toast.error(message)
        : type === "success"
        ? toast.success(message)
        : toast(message);

    setToastId(id);
    return id;
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    handleBulkUploadClose();
    // After successful upload, refresh the data
    getPendingBuyerOrderDetails();
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  // Add checkbox column
  const columns = [
    {
      title: "Select",
      dataIndex: "selection",
      key: "selection",
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e) => handleCheckboxChange(e, record)}
        />
      ),
    },
    {
      title: "S No",
      dataIndex: "sno",
      key: "sno",
      width: 80,
    },
    {
      title: "Ref No",
      dataIndex: "refNo",
      key: "refNo",
      width: 150,
    },
    {
      title: "Ref Date",
      dataIndex: "refDate",
      key: "refDate",
      width: 120,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Order No",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 150,
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 150,
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      width: 120,
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Ship To Name",
      dataIndex: "shipToName",
      key: "shipToName",
      width: 200,
    },
    {
      title: "Bill To Name",
      dataIndex: "billToName",
      key: "billToName",
      width: 200,
    },
    {
      title: "Buyer Name",
      dataIndex: "buyerName",
      key: "buyerName",
      width: 200,
    },
  ];

  useEffect(() => {
    getPendingBuyerOrderDetails();
  }, []);

  const getPendingBuyerOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/buyerOrder/getPendingBuyerOrderDetails?branchCode=${loginBranchCode}&finYear=${loginFinYear}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.data.status === true) {
        const dataWithKeys =
          response.data.paramObjectsMap.pendingOrderDetails.map(
            (item, index) => ({
              ...item,
              key: index,
              sno: index + 1,
            })
          );
        setRowData(dataWithKeys);
      } else {
        showToast(
          response.paramObjectsMap.errorMessage || "Report Fetch failed",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Report Fetch failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e, record) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRowKeys([...selectedRowKeys, record.key]);
      setSelectedRows([...selectedRows, record]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
      setSelectedRows(selectedRows.filter((row) => row.key !== record.key));
    }
  };

  // Handle select all on current page
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const currentPageData = rowData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    if (isChecked) {
      const newSelectedKeys = [
        ...new Set([
          ...selectedRowKeys,
          ...currentPageData.map((item) => item.key),
        ]),
      ];
      const newSelectedRows = [
        ...selectedRows,
        ...currentPageData.filter(
          (item) => !selectedRowKeys.includes(item.key)
        ),
      ];

      setSelectedRowKeys(newSelectedKeys);
      setSelectedRows(newSelectedRows);
    } else {
      const currentPageKeys = currentPageData.map((item) => item.key);
      const newSelectedKeys = selectedRowKeys.filter(
        (key) => !currentPageKeys.includes(key)
      );
      const newSelectedRows = selectedRows.filter(
        (row) => !currentPageKeys.includes(row.key)
      );

      setSelectedRowKeys(newSelectedKeys);
      setSelectedRows(newSelectedRows);
    }
  };

  const handleGenerateBuyerOrders = async () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one order", "error");
      return;
    }

    const errors = {};
    if (!loginBranch) errors.loginBranch = "Branch is required";
    if (!loginBranchCode) errors.loginBranchCode = "BranchCode is required";
    if (!loginClient) errors.loginClient = "Client is required";
    if (!loginCustomer) errors.loginCustomer = "Customer is required";
    if (!loginWarehouse) errors.loginWarehouse = "Warehouse is required";
    if (!loginFinYear) errors.loginFinYear = "FinYear is required";

    if (Object.keys(errors).length > 0) {
      showToast("Please fix validation errors", "error");
      return;
    }

    setIsSubmitting(true);

    const saveFormData = selectedRows.map((row) => {
      // Format dates for each individual row
      const formattedOrderDate = row.orderDate
        ? dayjs(row.orderDate).format("YYYY-MM-DD")
        : "";
      const formattedRefDate = row.refDate
        ? dayjs(row.refDate).format("YYYY-MM-DD")
        : "";
      const formattedInvoiceDate = row.invoiceDate
        ? dayjs(row.invoiceDate).format("YYYY-MM-DD")
        : "";

      return {
        billToName: row.billToName || "",
        branch: loginBranch || "",
        branchCode: loginBranchCode || "",
        buyerName: row.buyerName || "",
        client: loginClient || "",
        createdBy: loginUserName || "",
        customer: loginCustomer || "",
        finYear: loginFinYear || "",
        invoiceDate: formattedInvoiceDate,
        invoiceNo: row.invoiceNo || "",
        orderDate: formattedOrderDate,
        orderNo: row.orderNo || "",
        orgId: orgId || "",
        refDate: formattedRefDate,
        refNo: row.refNo || "",
        shipToName: row.shipToName || "",
        warehouse: loginWarehouse || "",
      };
    });

    console.log("DATA TO SAVE IS:", saveFormData);

    try {
      const result = await axios.put(
        `${API_URL}/api/buyerOrder/createMultipleBuyerOrder`,
        saveFormData
      );

      if (result.data.status === true) {
        console.log("Response:", result.data);
        showToast("Multiple Buyer Orders created successfully", "success");
        handleClear();
        getPendingBuyerOrderDetails();
      } else {
        showToast(
          result.data.paramObjectsMap?.errorMessage ||
            "Multiple Buyer Order creation failed",
          "error"
        );
      }
    } catch (err) {
      console.log("error", err);
      showToast("Multiple Buyer Order creation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  // Check if all items on current page are selected
  const isAllSelectedOnCurrentPage = () => {
    const currentPageData = rowData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    return (
      currentPageData.length > 0 &&
      currentPageData.every((item) => selectedRowKeys.includes(item.key))
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
                Generating Multiple Buyer Orders
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
                onClick={handleGenerateBuyerOrders}
                loading={isSubmitting}
                className="primary-action-btn"
                style={{
                  background: "rgba(108, 99, 255, 0.3)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Generate Multiple Buyer Orders ({selectedRows.length})
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

            {/* Selection Info */}
            {selectedRows.length > 0 && (
              <div style={{ padding: "0 20px 10px 20px", color: "white" }}>
                <Typography.Text>
                  Selected {selectedRows.length} order(s)
                </Typography.Text>
              </div>
            )}

            {/* Table Section */}
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
                        textAlign: "center",
                        color: "white",
                        width: "80px",
                      }}
                    >
                      <Checkbox
                        checked={isAllSelectedOnCurrentPage()}
                        onChange={handleSelectAll}
                        indeterminate={
                          selectedRowKeys.length > 0 &&
                          !isAllSelectedOnCurrentPage()
                        }
                      />
                    </th>
                    {columns.slice(1).map((column) => (
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
                    .map((row, index) => (
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
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          <Checkbox
                            checked={selectedRowKeys.includes(row.key)}
                            onChange={(e) => handleCheckboxChange(e, row)}
                          />
                        </td>
                        {columns.slice(1).map((column) => (
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
          <CommonBulkUpload
            open={uploadOpen}
            handleClose={() => setUploadOpen(false)}
            title="Upload Buyer Order Files"
            uploadText="Upload file"
            downloadText="Sample File"
            onSubmit={handleSubmit}
            sampleFileDownload={sampleFile}
            apiUrl={`${API_URL}/api/buyerOrder/ExcelUploadForBuyerOrder?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&type=DOC&warehouse=${loginWarehouse}`}
            screen="Buyer Order"
            onSuccess={() => {
              // Refresh the data after successful upload
              getPendingBuyerOrderDetails();
            }}
          />
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </ConfigProvider>
  );
};

export default PendingBuyerOrder;
