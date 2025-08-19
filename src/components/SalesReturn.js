import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  FormOutlined,
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
import {
  getAllActiveGroups,
  getAllActiveSupplier,
  getAllShipmentModes,
  getAllActiveCarrier,
} from "../utils/CommonFunctions";

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

export const SalesReturn = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [prNoList, setPrNoList] = useState([]);
  const [listView, setListView] = useState(false);
  const [editId, setEditId] = useState("");
  const [supplierList, setSupplierList] = useState([]);
  const [modeOfShipmentList, setModeOfShipmentList] = useState([]); // Correct
  const [carrierList, setCarrierList] = useState([]);
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
  const [finYear, setFinYear] = useState("2024");
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [salesReturnList, setSalesReturnList] = useState([]);
  const [salesReturnItems, setSalesReturnItems] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs(),
    prNo: "",
    prDate: null,
    boNo: "",
    boDate: dayjs(),
    entryNo: "",
    entryDate: dayjs(),
    buyerName: "",
    buyerType: "",
    supplierShortName: "",
    supplier: "",
    modeOfShipment: "",
    carrier: "",
    driver: "",
    vehicleType: "",
    vehicleNo: "",
    contact: "",
    securityPerson: "",
    timeIn: "",
    timeOut: "",
    goodsDesc: "",
    totalReturnQty: "",
    freeze: false,
  });

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
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  useEffect(() => {
    getAllSalesReturns();
    getPrNo();
    getAllSuppliers();
    getAllModesOfShipment();
    getDocId();
  }, []);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/salesReturn/getSalesReturnDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setFormData((prev) => ({
          ...prev,
          docId: response.data.paramObjectsMap.SalesReturnDocId,
        }));
      }
    } catch (error) {
      console.error("Error fetching doc ID:", error);
    }
  };

  const getAllSalesReturns = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/salesReturn/getAllSalesReturnByOrgId?orgId=${orgId}&branchCode=${branchCode}&branch=${branch}&client=${client}&warehouse=${warehouse}&finYear=${finYear}`
      );
      if (response.data.status === true) {
        setSalesReturnList(response.data.paramObjectsMap.salesReturnVO);
      }
    } catch (error) {
      console.error("Error fetching sales returns:", error);
    }
  };

  const getPrNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pickrequest/getAllPickRequestByOrgId?branch=${branch}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&orgId=${orgId}&warehouse=${warehouse}`
      );
      if (
        response.data.status === true &&
        response.data.paramObjectsMap &&
        Array.isArray(response.data.paramObjectsMap.pickRequestVO)
      ) {
        const prData = response.data.paramObjectsMap.pickRequestVO.filter(
          (row) => row.cancel === false && row.status === "Confirm"
        );
        setPrNoList(prData);
      }
    } catch (error) {
      console.error("Error fetching pick requests:", error);
    }
  };

  const getAllSuppliers = async () => {
    try {
      const supplierData = await getAllActiveSupplier(
        branchCode,
        client,
        orgId
      );
      // Ensure supplierData is an array before setting state
      if (Array.isArray(supplierData)) {
        setSupplierList(supplierData);
      } else {
        console.error("Supplier data is not an array:", supplierData);
        setSupplierList([]); // Set to empty array if data is invalid
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSupplierList([]); // Set to empty array on error
    }
  };

  const getAllModesOfShipment = async () => {
    try {
      const shipmentModeData = await getAllShipmentModes(orgId);
      setModeOfShipmentList(shipmentModeData);
    } catch (error) {
      console.error("Error fetching modes of shipment:", error);
    }
  };

  const getAllCarriers = async (selectedModeOfShipment) => {
    try {
      const carrierData = await getAllActiveCarrier(
        branchCode,
        client,
        orgId,
        selectedModeOfShipment
      );
      setCarrierList(carrierData);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  const getCurrentTime = () => dayjs().format("HH:mm:ss");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, timeOut: getCurrentTime() }));
  }, []);

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      lrNo: "",
      invNo: "",
      partNo: "",
      partDesc: "",
      pickQty: "",
      returnQty: "",
      damageQty: "",
      batchNo: "",
      batchDate: "",
      expDate: "",
      noOfBin: "",
      binQty: "",
      remarks: "",
    };
    setSalesReturnItems([...salesReturnItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setSalesReturnItems(salesReturnItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setSalesReturnItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Recalculate total return quantity when returnQty changes
    if (field === "returnQty") {
      const totalReturnQty = salesReturnItems.reduce((sum, item) => {
        return (
          sum +
          (item.id === id
            ? parseFloat(value) || 0
            : parseFloat(item.returnQty) || 0)
        );
      }, 0);
      setFormData((prev) => ({ ...prev, totalReturnQty }));
    }
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs(),
      prNo: "",
      prDate: null,
      boNo: "",
      boDate: dayjs(),
      entryNo: "",
      entryDate: dayjs(),
      buyerName: "",
      buyerType: "",
      supplierShortName: "",
      supplier: "",
      modeOfShipment: "",
      carrier: "",
      driver: "",
      vehicleType: "",
      vehicleNo: "",
      contact: "",
      securityPerson: "",
      timeIn: "",
      timeOut: getCurrentTime(),
      goodsDesc: "",
      totalReturnQty: "",
      freeze: false,
    });
    setSalesReturnItems([]);
    getDocId();
    setEditId("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const saveData = {
        ...formData,
        salesReturnDetailsDTO: salesReturnItems.map((item) => ({
          ...item,
          returnQty: parseFloat(item.returnQty) || 0,
          damageQty: parseFloat(item.damageQty) || 0,
          binQty: parseFloat(item.binQty) || 0,
          noOfBin: parseFloat(item.noOfBin) || 0,
        })),
        orgId,
        branch,
        branchCode,
        client,
        customer,
        warehouse,
        finYear,
        createdBy: loginUserName,
      };

      const response = await axios.put(
        `${API_URL}/salesReturn/createUpdateSalesReturn`,
        saveData
      );

      if (response.data.status === true) {
        message.success(
          editId
            ? "Sales Return updated successfully"
            : "Sales Return created successfully"
        );
        handleClear();
        getAllSalesReturns();
      } else {
        message.error(response.data.message || "Failed to save Sales Return");
      }
    } catch (error) {
      console.error("Error saving Sales Return:", error);
      message.error("Failed to save Sales Return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditSalesReturn = (record) => {
    setEditId(record.id);
    setFormData({
      docId: record.docId,
      docDate: record.docDate,
      prNo: record.prNo,
      prDate: record.prDate,
      boNo: record.boNo,
      boDate: record.boDate,
      entryNo: record.entryNo,
      entryDate: record.entryDate,
      buyerName: record.buyerName,
      buyerType: record.buyerType,
      supplierShortName: record.supplierShortName,
      supplier: record.supplier,
      modeOfShipment: record.modeOfShipment,
      carrier: record.carrier,
      driver: record.driver,
      vehicleType: record.vehicleType,
      vehicleNo: record.vehicleNo,
      contact: record.contact,
      securityPerson: record.securityPerson,
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      goodsDesc: record.goodsDesc,
      totalReturnQty: record.totalReturnQty,
      freeze: record.freeze,
    });

    setSalesReturnItems(
      record.salesReturnDetailsVO?.map((item) => ({
        id: item.id,
        lrNo: item.lrno,
        invNo: item.invoiceNo,
        partNo: item.partNo,
        partDesc: item.partDesc,
        pickQty: item.pickQty,
        returnQty: item.retQty,
        damageQty: item.damageQty,
        batchNo: item.batchNo,
        batchDate: item.batchDate,
        expDate: item.expDate,
        noOfBin: item.noOfBin,
        binQty: item.binQty,
        remarks: item.remarks,
      })) || []
    );

    setViewMode("form");
  };

  const getAllFillGrid = async () => {
    if (!formData.prNo) {
      message.error("PR No is required");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/salesReturn/getSalesReturnFillGridDetails?branchCode=${branchCode}&client=${client}&orgId=${orgId}&docId=${formData.prNo}`
      );

      if (response.data.status === true) {
        setFillGridData(response.data.paramObjectsMap.salesReturnDetailsVO);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching fill grid data:", error);
    }
  };

  const handleSaveSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
    setSalesReturnItems([...salesReturnItems, ...selectedData]);
    setSelectedRows([]);
    setSelectAll(false);
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
                    Sales Return
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage Sales Returns
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
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.docDate)}
                                disabled
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>PR No</span>
                              }
                            >
                              <Select
                                value={formData.prNo}
                                onChange={(value) => {
                                  const selectedPr = prNoList.find(
                                    (pr) => pr.docId === value
                                  );
                                  setFormData({
                                    ...formData,
                                    prNo: value,
                                    prDate: selectedPr?.docDate || null,
                                    boNo: selectedPr?.buyerOrderNo || "",
                                    boDate: selectedPr?.buyerOrderDate || null,
                                    buyerName: selectedPr?.clientName || "",
                                  });
                                }}
                                style={selectStyle}
                                showSearch
                                optionFilterProp="children"
                              >
                                {prNoList.map((pr) => (
                                  <Option key={pr.docId} value={pr.docId}>
                                    {pr.docId}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>PR Date</span>
                              }
                            >
                              <DatePicker
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.prDate)}
                                disabled
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>BO No</span>
                              }
                            >
                              <Input
                                value={formData.boNo}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>BO Date</span>
                              }
                            >
                              <DatePicker
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.boDate)}
                                disabled
                              />
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
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Entry Date
                                </span>
                              }
                            >
                              <DatePicker
                                style={{ width: "100%", ...inputStyle }}
                                value={dayjs(formData.entryDate)}
                                onChange={(date) =>
                                  setFormData({ ...formData, entryDate: date })
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Name
                                </span>
                              }
                            >
                              <Input
                                value={formData.buyerName}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Buyer Type
                                </span>
                              }
                            >
                              <Input
                                value={formData.buyerType}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Supplier Short Name
                                </span>
                              }
                            >
                              <Select
                                value={formData.supplierShortName}
                                onChange={(value) => {
                                  const selectedSupplier = Array.isArray(
                                    supplierList
                                  )
                                    ? supplierList.find(
                                        (s) => s.supplierShortName === value
                                      )
                                    : null;
                                  setFormData({
                                    ...formData,
                                    supplierShortName: value,
                                    supplier: selectedSupplier?.supplier || "",
                                  });
                                }}
                                style={selectStyle}
                                showSearch
                                optionFilterProp="children"
                              >
                                {Array.isArray(supplierList) &&
                                  supplierList.map((supplier) => (
                                    <Option
                                      key={supplier.supplierShortName}
                                      value={supplier.supplierShortName}
                                    >
                                      {supplier.supplierShortName}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Supplier</span>
                              }
                            >
                              <Input
                                value={formData.supplier}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </TabPane>

                  <TabPane tab="Additional Information" key="2">
                    <div className="form-section-card">
                      <Form layout="vertical">
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Mode of Shipment
                                </span>
                              }
                            >
                              <Select
                                value={formData.modeOfShipment}
                                onChange={(value) => {
                                  setFormData({
                                    ...formData,
                                    modeOfShipment: value,
                                  });
                                  getAllCarriers(value);
                                }}
                                style={selectStyle}
                              >
                                {Array.isArray(modeOfShipmentList) &&
                                  modeOfShipmentList.map((mode) => (
                                    <Option
                                      key={mode.shipmentMode}
                                      value={mode.shipmentMode}
                                    >
                                      {mode.shipmentMode}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Carrier</span>
                              }
                            >
                              <Select
                                value={formData.carrier}
                                onChange={(value) =>
                                  setFormData({ ...formData, carrier: value })
                                }
                                style={selectStyle}
                              >
                                {carrierList.map((carrier) => (
                                  <Option
                                    key={carrier.carrier}
                                    value={carrier.carrier}
                                  >
                                    {carrier.carrier}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Driver</span>
                              }
                            >
                              <Input
                                value={formData.driver}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    driver: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Vehicle Type
                                </span>
                              }
                            >
                              <Input
                                value={formData.vehicleType}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    vehicleType: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Vehicle No
                                </span>
                              }
                            >
                              <Input
                                value={formData.vehicleNo}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    vehicleNo: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Contact</span>
                              }
                            >
                              <Input
                                value={formData.contact}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    contact: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Security Person
                                </span>
                              }
                            >
                              <Input
                                value={formData.securityPerson}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    securityPerson: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Time In</span>
                              }
                            >
                              <Input
                                value={formData.timeIn}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Time Out</span>
                              }
                            >
                              <Input
                                value={formData.timeOut}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>
                                  Goods Description
                                </span>
                              }
                            >
                              <TextArea
                                rows={2}
                                value={formData.goodsDesc}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    goodsDesc: e.target.value,
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
                          icon={<ClearOutlined />}
                          onClick={getAllFillGrid}
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
                          onClick={() => setSalesReturnItems([])}
                          style={{
                            marginRight: "8px",
                            background: "rgba(108, 99, 255, 0.3)",
                            color: "#fff",
                            border: "none",
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
                          <col style={{ width: "120px" }} /> {/* LR No */}
                          <col style={{ width: "120px" }} /> {/* Invoice No */}
                          <col style={{ width: "120px" }} /> {/* Part No */}
                          <col style={{ width: "200px" }} /> {/* Part Desc */}
                          <col style={{ width: "100px" }} /> {/* Pick Qty */}
                          <col style={{ width: "100px" }} /> {/* Return Qty */}
                          <col style={{ width: "100px" }} /> {/* Damage Qty */}
                          <col style={{ width: "100px" }} /> {/* Batch No */}
                          <col style={{ width: "100px" }} /> {/* Batch Date */}
                          <col style={{ width: "100px" }} /> {/* Exp Date */}
                          <col style={{ width: "100px" }} /> {/* Bin Qty */}
                          <col style={{ width: "100px" }} /> {/* No Of Bins */}
                          <col style={{ width: "200px" }} /> {/* Remarks */}
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
                              LR No *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Invoice No *
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
                              Pick Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Return Qty
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Damage Qty
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
                              Batch Date
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Exp Date
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              Bin Qty *
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                color: "white",
                              }}
                            >
                              No Of Bins *
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
                          {salesReturnItems.map((item, index) => (
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

                              {/* LR No */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.lrNo}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "lrNo",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Invoice No */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.invNo}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "invNo",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Part No */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.partNo}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "partNo",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Part Desc */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.partDesc}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "partDesc",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
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

                              {/* Return Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.returnQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "returnQty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Damage Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.damageQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "damageQty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Batch No */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.batchNo}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "batchNo",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Batch Date */}
                              <td style={{ padding: "8px" }}>
                                <DatePicker
                                  style={{ width: "100%", ...inputStyle }}
                                  value={
                                    item.batchDate
                                      ? dayjs(item.batchDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleItemChange(item.id, "batchDate", date)
                                  }
                                />
                              </td>

                              {/* Exp Date */}
                              <td style={{ padding: "8px" }}>
                                <DatePicker
                                  style={{ width: "100%", ...inputStyle }}
                                  value={
                                    item.expDate ? dayjs(item.expDate) : null
                                  }
                                  onChange={(date) =>
                                    handleItemChange(item.id, "expDate", date)
                                  }
                                />
                              </td>

                              {/* Bin Qty */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.binQty}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "binQty",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* No Of Bins */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.noOfBin}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "noOfBin",
                                      e.target.value
                                    )
                                  }
                                  style={inputStyle}
                                />
                              </td>

                              {/* Remarks */}
                              <td style={{ padding: "8px" }}>
                                <Input
                                  value={item.remarks}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "remarks",
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

                {/* Summary Section */}
                <div className="summary-section">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label={
                          <span style={{ color: "#fff" }}>
                            Total Return Qty
                          </span>
                        }
                      >
                        <Input
                          value={formData.totalReturnQty}
                          readOnly
                          style={readOnlyInputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label={<span style={{ color: "#fff" }}>Freeze</span>}
                      >
                        <Checkbox
                          checked={formData.freeze}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              freeze: e.target.checked,
                            })
                          }
                          style={{ color: "#fff" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          ) : (
            // List View
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
                  Sales Return List
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
                  {viewMode === "form" ? "List View" : "New Sales Return"}
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
                        PR No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Buyer Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Supplier
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Total Qty
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
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReturnList
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
                            {item.prNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.buyerName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.supplier}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.totalReturnQty}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <span
                              className={`status-${
                                item.freeze ? "frozen" : "draft"
                              }`}
                            >
                              {item.freeze ? "Frozen" : "Draft"}
                            </span>
                          </td>
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
                              onClick={() => handleEditSalesReturn(item)}
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
                    {Math.min(currentPage * pageSize, salesReturnList.length)}{" "}
                    of {salesReturnList.length} items
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
                    { length: Math.ceil(salesReturnList.length / pageSize) },
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
                          Math.ceil(salesReturnList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(salesReturnList.length / pageSize)
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
                        Math.ceil(salesReturnList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(salesReturnList.length / pageSize)
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
              Fill Grid
            </div>
          }
          open={modalOpen}
          onOk={handleSaveSelectedRows}
          onCancel={() => {
            setModalOpen(false);
            setSelectedRows([]);
            setSelectAll(false);
          }}
          modalRender={(modal) => <PaperComponent>{modal}</PaperComponent>}
          width={1200}
          okText="Save Selected"
          cancelText="Cancel"
        >
          <div style={{ marginBottom: 16 }}>
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              style={{ marginRight: 8 }}
            >
              Select All
            </Checkbox>
            <span>{selectedRows.length} item(s) selected</span>
          </div>
          <Table
            dataSource={fillGridData}
            columns={[
              {
                title: "Select",
                dataIndex: "id",
                key: "select",
                render: (_, record, index) => (
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
                  />
                ),
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
                title: "Pick Qty",
                dataIndex: "pickQty",
                key: "pickQty",
              },
              {
                title: "Batch No",
                dataIndex: "batchNo",
                key: "batchNo",
              },
              {
                title: "Batch Date",
                dataIndex: "batchDate",
                key: "batchDate",
                render: (text) => text && dayjs(text).format("DD-MM-YYYY"),
              },
              {
                title: "Exp Date",
                dataIndex: "expDate",
                key: "expDate",
                render: (text) => text && dayjs(text).format("DD-MM-YYYY"),
              },
            ]}
            rowKey={(record, index) => index}
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default SalesReturn;
