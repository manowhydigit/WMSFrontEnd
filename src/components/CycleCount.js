import React, { useEffect, useState, useRef } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
  TableOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
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
import Draggable from "react-draggable";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

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

export const CycleCount = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [editId, setEditId] = useState("");
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
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [cycleCountList, setCycleCountList] = useState([]);
  const [cycleCountItems, setCycleCountItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Data lists
  const [partNoList, setPartNoList] = useState([]);
  const [grnNoList, setGrnNoList] = useState([]);
  const [batchNoList, setBatchNoList] = useState([]);
  const [binList, setBinList] = useState([]);
  const [selectedCycleCountRows, setSelectedCycleCountRows] = useState([]);

  const [cycleCountModalOpen, setCycleCountModalOpen] = useState(false);

  const [selectAllCycleCount, setSelectAllCycleCount] = useState([]);

  const [loginCustomer] = useState(localStorage.getItem("customer"));
  const [loginClient] = useState(localStorage.getItem("client"));
  const [loginWarehouse] = useState(localStorage.getItem("warehouse"));
  const [loginFinYear] = useState(localStorage.getItem("finYear"));
  const [loginBranchCode] = useState(localStorage.getItem("branchcode"));
  const [loginBranch] = useState(localStorage.getItem("branch"));

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    stockStatus: "",
    stockStatusFlag: "",
    statusFlag: "",
    remarks: "",
  });

  // Toast management
  const isMounted = useRef(true);
  const [toastId, setToastId] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    getAllCycleCounts();
    getDocId();

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

  const selectStyle = {
    width: "90%",
    background: "rgba(255, 255, 255, 极致的玻璃效果设计)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getCycleCountInDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.CycleCountInDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
      showToast("Failed to fetch document ID", "error");
    }
  };

  const getAllCycleCounts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getAllCycleCount?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setCycleCountList(response.data.paramObjectsMap.cycleCountVO);
      }
    } catch (error) {
      console.error("Error fetching cycle counts:", error);
      showToast("Failed to fetch cycle counts", "error");
    }
  };

  const getPartNoList = async (stockStatusFlag) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getPartNoByCycleCount?branchCode=${branchCode}&client=${client}&orgId=${orgId}&status=${stockStatusFlag}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setPartNoList(response.data.paramObjectsMap.cycleCountPartNo);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      showToast("Failed to fetch part numbers", "error");
    }
  };

  const deleteToast = () => {
    if (this.props.toastId) {
      toast.dismiss(this.props.toastId);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    getAllCycleCounts();
    getDocId();

    return () => {
      isMounted.current = false;
      // Clean up any active toasts when component unmounts
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      sku: "",
      grnNo: "",
      batchNo: "",
      bin: "",
      binType: "",
      core: "",
      avlQty: "",
      actualQty: "",
      rowGrnNoList: [],
      rowBatchNoList: [],
      rowBinList: [],
    };
    setCycleCountItems([...cycleCountItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setCycleCountItems(cycleCountItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setCycleCountItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      stockStatus: "",
      stockStatusFlag: "",
      statusFlag: "",
      remarks: "",
    });
    setCycleCountItems([]);
    getDocId();
    setEditId("");
  };
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.stockStatus) {
        showToast("Please select Stock Status", "error");
        setIsSubmitting(false);
        return;
      }

      if (cycleCountItems.length === 0) {
        showToast("Please add at least one item", "error");
        setIsSubmitting(false);
        return;
      }

      // Format the date correctly (YYYY-MM-DD)
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
        cycleCountDetailsDTO: cycleCountItems.map((item) => {
          // Find the selected bin details to get binClass, binType, etc.
          const selectedBin = item.rowBinList?.find(
            (bin) => bin.bin === item.bin
          );

          // Find the selected GRN details to get grnDate
          const selectedGrn = item.rowGrnNoList?.find(
            (grn) => grn.grnNo === item.grnNo
          );

          // Find the selected batch details to get batchDate, expDate
          const selectedBatch = item.rowBatchNoList?.find(
            (batch) => batch.batch === item.batchNo
          );

          // Format GRN date (remove time portion if present)
          let formattedGrnDate = "";
          if (selectedGrn?.grnDate) {
            // Extract just the date part (YYYY-MM-DD) from the datetime string
            formattedGrnDate = selectedGrn.grnDate.split(" ")[0];
          }

          // Format batch date and exp date if needed
          let formattedBatchDate = "";
          if (selectedBatch?.batchDate) {
            formattedBatchDate = selectedBatch.batchDate.split(" ")[0];
          }

          let formattedExpDate = "";
          if (selectedBatch?.expDate) {
            formattedExpDate = selectedBatch.expDate.split(" ")[0];
          }

          return {
            ...(editId && { id: item.id }),
            partNo: item.partNo,
            partDescription: item.partDesc,
            sku: item.sku,
            grnNo: item.grnNo,
            grnDate: formattedGrnDate, // Use formatted date
            binClass: selectedBin?.binClass || "Fixed",
            cellType: selectedBin?.cellType || "",
            expDate: formattedExpDate, // Use formatted date
            qcFlag: selectedBin?.qcFlag || "",
            batchNo: item.batchNo,
            batchDate: formattedBatchDate, // Use formatted date
            bin: item.bin,
            binType: selectedBin?.binType || "",
            core: selectedBin?.core || "",
            avlQty: parseFloat(item.avlQty) || 0,
            actualQty: parseFloat(item.actualQty) || 0,
          };
        }),
      };

      console.log("Sending payload:", saveData); // For debugging

      const response = await axios.put(
        `${API_URL}/api/cycleCount/createUpdateCycleCount`,
        saveData
      );

      if (response.data.status === true) {
        showToast(
          editId
            ? "Cycle Count updated successfully"
            : "Cycle Count created successfully",
          "success"
        );
        handleClear();
        getAllCycleCounts();
      } else {
        showToast(
          response.data.message || "Failed to save Cycle Count",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving Cycle Count:", error);
      showToast("Failed to save Cycle Count", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllCycleCounts();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  const handleEditCycleCount = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: dayjs(record.docDate),
      stockStatus: record.stockStatus,
      stockStatusFlag: record.stockStatusFlag,
      statusFlag: record.stockStatusFlag,
      remarks: record.remarks,
    });

    setCycleCountItems(
      record.cycleCountDetailsVO?.map((item) => ({
        id: item.id,
        partNo: item.partNo,
        partDesc: item.partDesc,
        sku: item.sku,
        grnNo: item.grnNo,
        grnDate: item.grnDate,
        batchNo: item.batchNo,
        batchDate: item.batchDate,
        bin: item.bin,
        binType: item.binType,
        binClass: item.binClass,
        cellType: item.cellType,
        expDate: item.expDate,
        qcFlag: item.qcFlag,
        core: item.core,
        avlQty: item.avlQty,
        actualQty: item.actualQty,
        rowGrnNoList: [],
        rowBatchNoList: [],
        rowBinList: [],
      })) || []
    );

    setViewMode("form");
  };

  const getAllFillGrid = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getCycleCountGridDetails?branchCode=${branchCode}&client=${client}&orgId=${orgId}&status=${formData.stockStatusFlag}&warehouse=${warehouse}`
      );

      if (response.data.status === true) {
        setFillGridData(response.data.paramObjectsMap.cycleCountGrid);
        setModalOpen(true);
      } else {
        showToast("Failed to fetch grid details", "error");
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
      showToast("Error fetching grid details", "error");
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setCycleCountItems([...cycleCountItems, ...selectedData]);
    setSelectedRows([]);
    setSelectAll(false);
    setModalOpen(false);
    showToast("Selected items added successfully", "success");
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleStockStatusChange = (value) => {
    const flag =
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
      stockStatus: value,
      stockStatusFlag: flag,
      statusFlag: flag,
    });
    getPartNoList(flag);
  };

  const handlePartNoChange = (id, value) => {
    const selectedPart = partNoList.find((part) => part.partNo === value);
    setCycleCountItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              partNo: selectedPart?.partNo || "",
              partDesc: selectedPart?.partDesc || "",
              sku: selectedPart?.sku || "",
              rowGrnNoList: [],
              grnNo: "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
              binClass: "Fixed",
            }
          : item
      )
    );

    if (value) {
      getGrnNoList(id, value);
    }
  };

  const getGrnNoList = async (id, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getGrnNoByCycleCount?branchCode=${branchCode}&client=${client}&orgId=${orgId}&partNo=${partNo}&status=${formData.stockStatusFlag}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCycleCountItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowGrnNoList: response.data.paramObjectsMap.cycleCountGrnNo,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
      showToast("Failed to fetch GRN numbers", "error");
    }
  };

  const GlassModal = ({
    open,
    onCancel,
    title,
    children,
    width = 1200,
    footer = null,
  }) => {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        footer={footer}
        width={width}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        maskClosable={false}
        keyboard={false}
        styles={{
          body: {
            padding: 0,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 极致的玻璃效果设计)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
          },
          header: {
            background: "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px 16px 0 0",
            color: "white",
            padding: "16px 24px",
          },
          content: {
            backdropFilter: "blur(5px)",
            background: "transparent",
            color: "white",
          },
          mask: {
            backdropFilter: "blur(5px)",
            background: "rgba(0, 0, 0, 0.5)",
          },
        }}
        title={title}
        modalRender={(modal) => <PaperComponent>{modal}</PaperComponent>}
      >
        <div
          style={{
            padding: "24px",
            background: "transparent",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </Modal>
    );
  };

  const handleGrnNoChange = (id, value) => {
    const selectedGrn = cycleCountItems
      .find((item) => item.id === id)
      ?.rowGrnNoList.find((grn) => grn.grnNo === value);
    setCycleCountItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grnNo: selectedGrn?.grnNo || "",
              rowBatchNoList: [],
              batchNo: "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
            }
          : item
      )
    );

    if (value) {
      const partNo = cycleCountItems.find((item) => item.id === id)?.partNo;
      if (partNo) {
        getBatchNoList(id, value, partNo);
      }
    }
  };

  const getBatchNoList = async (id, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getBatchByCycleCount?branchCode=${branchCode}&client=${client}&grnNO=${grnNo}&orgId=${orgId}&partNo=${partNo}&status=${formData.stockStatusFlag}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCycleCountItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBatchNoList: response.data.paramObjectsMap.cycleCountBatch,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching batch numbers:", error);
      showToast("Failed to fetch batch numbers", "error");
    }
  };

  const handleSelectAllCycleCount = (e) => {
    if (e.target.checked) {
      setSelectedRows(fillGridData.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCycleCountSearch = (value, field) => {
    // Implement your search logic here
    console.log(`Searching ${field} for:`, value);
  };

  const handleSaveCycleCountRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setCycleCountItems([...cycleCountItems, ...selectedData]);
    setSelectedRows([]);
    setSelectAll(false);
    setModalOpen(false);
    showToast("Selected items added successfully", "success");
  };

  const handleBatchNoChange = (id, value) => {
    const selectedBatch = cycleCountItems
      .find((item) => item.id === id)
      ?.rowBatchNoList.find((batch) => batch.batch === value);
    setCycleCountItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              batchNo: selectedBatch?.batch || "",
              rowBinList: [],
              bin: "",
              binType: "",
              core: "",
              avlQty: "",
            }
          : item
      )
    );

    if (value) {
      const item = cycleCountItems.find((item) => item.id === id);
      if (item && item.grnNo && item.partNo) {
        getBinList(id, value, item.grnNo, item.partNo);
      }
    }
  };

  const getBinList = async (id, batchNo, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getBinDetailsByCycleCount?batch=${batchNo}&branchCode=${branchCode}&client=${client}&grnNO=${grnNo}&orgId=${orgId}&partNo=${partNo}&status=${formData.stockStatusFlag}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCycleCountItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  rowBinList: response.data.paramObjectsMap.cycleBinDetails,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
      showToast("Failed to fetch bins", "error");
    }
  };

  const handleBinChange = (id, value) => {
    const selectedBin = cycleCountItems
      .find((item) => item.id === id)
      ?.rowBinList.find((bin) => bin.bin === value);
    setCycleCountItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              bin: selectedBin?.bin || "",
              binType: selectedBin?.binType || "",
              core: selectedBin?.core || "",
            }
          : item
      )
    );

    if (value) {
      const item = cycleCountItems.find((item) => item.id === id);
      if (item && item.batchNo && item.grnNo && item.partNo) {
        getAvlQty(id, value, item.batchNo, item.grnNo, item.partNo);
      }
    }
  };

  const getAvlQty = async (id, bin, batchNo, grnNo, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/cycleCount/getAvlQtyByCycleCount?batch=${batchNo}&bin=${bin}&branchCode=${branchCode}&client=${client}&grnNO=${grnNo}&orgId=${orgId}&partNo=${partNo}&status=${formData.stockStatusFlag}&warehouse=${warehouse}`
      );
      if (response.data.status === true) {
        setCycleCountItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  avlQty: response.data.paramObjectsMap.avlQty[0]?.avlQty || 0,
                  status: response.data.paramObjectsMap.avlQty[0]?.status || "",
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
      showToast("Failed to fetch available quantity", "error");
    }
  };

  const handleOpenModal = () => {
    if (!formData.stockStatusFlag) {
      showToast("Please select Stock Status first", "error");
      return;
    }
    getAllFillGrid();
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
                    Cycle Count
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage inventory cycle counts
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
              </div>

              {/* Main Form */}
              <div className="form-sections">
                <Tabs defaultActiveKey="1" className="white-tabs">
                  <TabPane tab="Basic Information" key="1">
                    <div className="form-section-card">
                      <Form layout="vertical" form={form}>
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
                                  Stock Status *
                                </span>
                              }
                            >
                              <Select
                                value={formData.stockStatus}
                                onChange={handleStockStatusChange}
                                style={selectStyle}
                              >
                                <Option value="DEFECTIVE">DEFECTIVE</Option>
                                <Option value="HOLD">HOLD</Option>
                                <Option value="RELEASE">RELEASE</Option>
                                <Option value="VAS">VAS</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Remarks</span>
                              }
                            >
                              <Input
                                value={formData.remarks}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    remarks: e.target.value,
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
                          icon={<TableOutlined />}
                          onClick={handleOpenModal}
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
                          onClick={() => setCycleCountItems([])}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "极致的玻璃效果设计)",
                          }}
                        >
                          Clear Items
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
                          "极致的玻璃效果设计) rgba(0, 0, 0, 0.1)",
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
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "120px" }} /> {/* SKU */}
                          <col style={{ width: "120px" }} /> {/* GRN No */}
                          <col style={{ width: "120px" }} /> {/* Batch No */}
                          <col style={{ width: "120px" }} /> {/* Bin */}
                          <col style={{ width: "100px" }} /> {/* Bin Type */}
                          <col style={{ width: "100px" }} /> {/* Core */}
                          <col style={{ width: "100px" }} /> {/* Avl Qty */}
                          <col style={{ width: "100px" }} /> {/* Actual Qty */}
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
                                textAlign: "极致的玻璃效果设计)",
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
                                padding: "8极致的玻璃效果设计)",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin Type
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Core
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
                              Actual Qty *
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cycleCountItems.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: "1px dashed white",
                                color: "white",
                              }}
                            >
                              {/* Action */}
                              <td
                                style={{ padding: "8px", textAlign: "center" }}
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
                                <Select
                                  value={item.partNo}
                                  onChange={(value) =>
                                    handlePartNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  <Option value="">--Select--</Option>
                                  {partNoList.map((part) => (
                                    <Option
                                      key={part.partNo}
                                      value={part.partNo}
                                    >
                                      {part.partNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Part Description */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.partDesc}
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

                              {/* GRN No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.grnNo}
                                  onChange={(value) =>
                                    handleGrnNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.partNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowGrnNoList?.map((grn) => (
                                    <Option key={grn.grnNo} value={grn.grnNo}>
                                      {grn.grnNo}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Batch No */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.batchNo}
                                  onChange={(value) =>
                                    handleBatchNoChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.grnNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowBatchNoList?.map((batch) => (
                                    <Option
                                      key={batch.batch}
                                      value={batch.batch}
                                    >
                                      {batch.batch}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Bin */}
                              <td style={{ padding: "8px" }}>
                                <Select
                                  value={item.bin}
                                  onChange={(value) =>
                                    handleBinChange(item.id, value)
                                  }
                                  style={selectStyle}
                                  disabled={!item.batchNo}
                                >
                                  <Option value="">--Select--</Option>
                                  {item.rowBinList?.map((bin) => (
                                    <Option key={bin.bin} value={bin.bin}>
                                      {bin.bin}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              {/* Bin Type */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.binType}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Core */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.core}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Avl Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.avlQty}
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </td>

                              {/* Actual Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.actualQty}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const intPattern = /^\d*$/;
                                    if (
                                      intPattern.test(value) ||
                                      value === ""
                                    ) {
                                      handleItemChange(
                                        item.id,
                                        "actualQty",
                                        value
                                      );
                                    }
                                  }}
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
                  Cycle Count List
                </Typography.Title>
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
                  {viewMode === "form" ? "List View" : "New Cycle Count"}
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
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Document No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Document Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Stock Status
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Remarks
                      </th>
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
                    {cycleCountList.map((record) => (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "white",
                        }}
                      >
                        <td style={{ padding: "12px" }}>{record.docId}</td>
                        <td style={{ padding: "12px" }}>
                          {dayjs(record.docDate).format("DD-MM-YYYY")}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {record.stockStatus}
                        </td>
                        <td style={{ padding: "12px" }}>{record.remarks}</td>
                        <td style={{ padding: "12px" }}>
                          <Button
                            type="link"
                            onClick={() => handleEditCycleCount(record)}
                            style={{ color: "#1890ff" }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fill Grid Modal */}
        <GlassModal
          title={
            <div
              style={{
                width: "100%",
                cursor: "move",
                color: "white",
              }}
              id="draggable-dialog-title"
            >
              Cycle Count Details
            </div>
          }
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setSelectedRows([]);
            setSelectAll(false);
          }}
          modalRender={(modal) => <PaperComponent>{modal}</PaperComponent>}
          width={1200}
          bodyStyle={{
            padding: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setModalOpen(false); // FIXED: Changed from setCycleCountModalOpen to setModalOpen
                setSelectedRows([]);
                setSelectAll(false);
              }}
              style={{
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              Cancel
            </Button>,
            <Button
              key="ok"
              type="primary"
              onClick={handleSaveCycleCountRows} // 👈 here
              disabled={selectedRows.length === 0}
              style={{
                background: "rgba(108, 99, 255, 0.3)",
                color: "white",
                border: "none",
              }}
            >
              Process ({selectedRows.length} selected)
            </Button>,
          ]}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span style={{ color: "#fff" }}>Selection</span>}
              >
                <Checkbox
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < fillGridData.length
                  }
                  checked={
                    fillGridData.length > 0 &&
                    selectedRows.length === fillGridData.length
                  }
                  onChange={handleSelectAllCycleCount}
                  style={{ color: "white" }}
                >
                  <span style={{ color: "#fff" }}>Select All</span> (
                  <Text style={{ color: "white" }}>
                    {selectedRows.length} selected
                  </Text>
                  )
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span style={{ color: "#fff" }}>Part No Search</span>}
              >
                <Input
                  placeholder="Search by part number..."
                  prefix={<SearchOutlined />}
                  allowClear
                  onChange={(e) =>
                    handleCycleCountSearch(e.target.value, "partNo")
                  }
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span style={{ color: "#fff" }}>Bin Location Search</span>
                }
              >
                <Input
                  placeholder="Search by bin location..."
                  prefix={<SearchOutlined />}
                  allowClear
                  onChange={(e) =>
                    handleCycleCountSearch(e.target.value, "binLocation")
                  }
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                  }}
                />
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
                marginTop: "10px",
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
                  <col style={{ width: "50px" }} /> {/* Select */}
                  <col style={{ width: "50px" }} /> {/* S.No */}
                  <col style={{ width: "120px" }} /> {/* Bin Location */}
                  <col style={{ width: "120px" }} /> {/* Part No */}
                  <col style={{ width: "200px" }} /> {/* Part Desc */}
                  <col style={{ width: "120px" }} /> {/* Batch No */}
                  <col style={{ width: "100px" }} /> {/* System Qty */}
                  <col style={{ width: "100px" }} /> {/* Counted Qty */}
                  <col style={{ width: "100px" }} /> {/* Variance */}
                  <col style={{ width: "120px" }} /> {/* Counted By */}
                  <col style={{ width: "120px" }} /> {/* Count Date */}
                </colgroup>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px dashed #000",
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
                        backgroundColor: "transparent",
                      }}
                    >
                      Select
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      S.No
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Bin Location
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Part No
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Part Description
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Batch No
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      System Qty
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Counted Qty
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Variance
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Counted By
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                    >
                      Count Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fillGridData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px dashed rgba(255, 255, 255, 0.2)",
                        color: "white",
                        backgroundColor:
                          item.variance !== 0
                            ? "rgba(255, 77, 79, 0.2)"
                            : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <Checkbox
                          checked={selectedRows.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, index]);
                            } else {
                              setSelectedRows(
                                selectedRows.filter((i) => i !== index)
                              );
                            }
                          }}
                          style={{ color: "white" }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          color: "white",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td style={{ padding: "8px" }}>{item.bin}</td>
                      <td style={{ padding: "8px" }}>{item.partNo}</td>
                      <td style={{ padding: "8px" }}>{item.partDesc}</td>
                      <td style={{ padding: "8px" }}>{item.batchNo}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        {item.systemQty}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        {item.countedQty}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          color: item.variance !== 0 ? "#ff4d4f" : "white",
                          fontWeight: item.variance !== 0 ? "bold" : "normal",
                        }}
                      >
                        {item.variance}
                      </td>
                      <td style={{ padding: "8px" }}>{item.countedBy}</td>
                      <td style={{ padding: "8px" }}>{item.countDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassModal>
      </div>
    </ConfigProvider>
  );
};

export default CycleCount;
