import React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Pagination,
  Spin,
  Typography,
  Checkbox,
  message,
  Tabs,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import sampleFile from "../assets/sample-files/Sample_Opening_Stock_Upload.xlsx";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const OpeningStock = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [editId, setEditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // Data states
  const [openingStockList, setOpeningStockList] = useState([]);
  const [openingStockItems, setOpeningStockItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [binList, setBinList] = useState([]);
  const [partList, setPartList] = useState([]);

  // Add missing function implementations
  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "table" : "form");
  };

  const handleClear = () => {
    form.resetFields();
    setOpeningStockItems([]);
    setSelectedRows([]);
  };

  const handleSave = () => {
    setIsSubmitting(true);
    // Add your save logic here
    setTimeout(() => {
      setIsSubmitting(false);
      message.success("Saved successfully");
    }, 1000);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = () => {
    // Add your submit logic here
    console.log("Submit");
  };

  const handleFileUpload = () => {
    // Add your file upload logic here
    console.log("File upload");
  };

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
                minHeight: "80dvh",
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
                    Opening Stock
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage opening stock entries
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
                    backgroundColor: "transparent",
                    color: "white",
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
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                  }}
                >
                  Clear
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  loading={isSubmitting}
                  onClick={handleSave}
                  className="primary-action-btn"
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                  }}
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

              {/* Add form content here */}
              <div style={{ marginTop: "20px", color: "white" }}>
                <Text>Form content will go here</Text>
              </div>
            </div>
          ) : (
            <div>
              {/* Table view content would go here */}
              <Text>Table view content will go here</Text>
            </div>
          )}
        </div>

        {uploadOpen && (
          <CommonBulkUpload
            open={uploadOpen}
            handleClose={handleBulkUploadClose}
            title="Upload Files"
            uploadText="Upload file"
            downloadText="Sample File"
            onSubmit={handleSubmit}
            sampleFileDownload={sampleFile}
            handleFileUpload={handleFileUpload}
            apiUrl={`${API_URL}/api/Reports/OpeningStockUpload?branch=${branch}&branchCode=${branchCode}&client=${client}&createdBy=${loginUserName}&customer=${customer}&finYear=${finYear}&orgId=${orgId}&warehouse=${warehouse}`}
            screen="Opening Stock"
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
        />
      </div>
    </ConfigProvider>
  );
};

export default OpeningStock;
