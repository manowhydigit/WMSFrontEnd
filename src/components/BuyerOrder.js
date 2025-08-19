import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import axios from "axios";
import "./PS.css";

const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const BuyerOrder = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [listViewData, setListViewData] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const paginatedData = buyerOrderList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Form state
  const [formData, setFormData] = useState({
    orderNo: "",
    orderDate: dayjs(),
    customer: "",
    customerName: "",
    supplier: "",
    supplierName: "",
    deliveryDate: dayjs().add(7, "day"),
    paymentTerms: "NET 30",
    shippingMethod: "ROAD",
    remarks: "",
    status: "DRAFT",
    totalAmount: 0,
    totalQuantity: 0,
  });

  // Order items table
  const [orderItems, setOrderItems] = useState([]);

  // Get new order number
  const getNewOrderNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/buyer-order/getNextOrderNo?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}`
      );
      setFormData((prev) => ({ ...prev, orderNo: response.data.orderNo }));
    } catch (error) {
      console.error("Error fetching order number:", error);
    }
  };

  // Get all customers
  const getAllCustomers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/customer/getAllActiveCustomers?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}`
      );
      setCustomerList(response.data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Get all suppliers
  const getAllSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/supplier/getAllActiveSuppliers?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}`
      );
      setSupplierList(response.data.suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Get all part numbers
  const getAllPartNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/part/getAllActiveParts?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}`
      );
      setPartNoList(response.data.parts);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  // Get all buyer orders
  const getAllBuyerOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/buyer-order/getAll?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}`
      );
      setBuyerOrderList(response.data.orders);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    getNewOrderNo();
    getAllCustomers();
    getAllSuppliers();
    getAllPartNo();
    getAllBuyerOrders();
  }, []);

  // Calculate totals when order items change
  useEffect(() => {
    const totalQty = orderItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const totalAmt = orderItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
    }));
  }, [orderItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleCustomerChange = (value) => {
    const selectedCustomer = customerList.find((c) => c.id === value);
    setFormData((prev) => ({
      ...prev,
      customer: value,
      customerName: selectedCustomer?.name || "",
    }));
  };

  const handleSupplierChange = (value) => {
    const selectedSupplier = supplierList.find((s) => s.id === value);
    setFormData((prev) => ({
      ...prev,
      supplier: value,
      supplierName: selectedSupplier?.name || "",
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      quantity: "",
      unitPrice: "",
      amount: "",
      deliveryDate: formData.deliveryDate,
      status: "PENDING",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Calculate amount if quantity or unitPrice changes
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

  const handleDeleteItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleSaveOrder = async () => {
    setIsSubmitting(true);

    const orderData = {
      ...formData,
      orderDate: dayjs(formData.orderDate).format("YYYY-MM-DD"),
      deliveryDate: dayjs(formData.deliveryDate).format("YYYY-MM-DD"),
      items: orderItems.map((item) => ({
        partNo: item.partNo,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        deliveryDate: dayjs(item.deliveryDate).format("YYYY-MM-DD"),
        status: item.status,
      })),
      createdBy: loginUserName,
      branchCode: loginBranchCode,
      client: loginClient,
      orgId: orgId,
    };

    try {
      const url = editId
        ? `${API_URL}/buyer-order/update/${editId}`
        : `${API_URL}/buyer-order/create`;

      const method = editId ? "put" : "post";

      const response = await axios[method](url, orderData);

      if (response.data.success) {
        notification.success({
          message: editId ? "Order Updated" : "Order Created",
          description: `Buyer order ${
            editId ? "updated" : "created"
          } successfully.`,
        });
        handleClear();
        getAllBuyerOrders();
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to save order",
        });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      notification.error({
        message: "Error",
        description: "Failed to save order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      orderNo: "",
      orderDate: dayjs(),
      customer: "",
      customerName: "",
      supplier: "",
      supplierName: "",
      deliveryDate: dayjs().add(7, "day"),
      paymentTerms: "NET 30",
      shippingMethod: "ROAD",
      remarks: "",
      status: "DRAFT",
      totalAmount: 0,
      totalQuantity: 0,
    });
    setOrderItems([]);
    setEditId("");
    getNewOrderNo();
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleEditOrder = (order) => {
    setEditId(order.id);
    setFormData({
      orderNo: order.orderNo,
      orderDate: dayjs(order.orderDate),
      customer: order.customerId,
      customerName: order.customerName,
      supplier: order.supplierId,
      supplierName: order.supplierName,
      deliveryDate: dayjs(order.deliveryDate),
      paymentTerms: order.paymentTerms,
      shippingMethod: order.shippingMethod,
      remarks: order.remarks,
      status: order.status,
      totalAmount: order.totalAmount,
      totalQuantity: order.totalQuantity,
    });
    setOrderItems(
      order.items.map((item) => ({
        id: Date.now() + Math.random(),
        partNo: item.partNo,
        partDesc: item.partDesc,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        deliveryDate: dayjs(item.deliveryDate),
        status: item.status,
      }))
    );
    setViewMode("form");
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
                    Buyer Order
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage buyer orders
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
                  onClick={handleSaveOrder}
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
              {/* Main Form */}
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
                        <Form layout="vertical">
                          {/* First Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Order No
                                  </span>
                                }
                              >
                                <Input
                                  name="orderNo"
                                  value={formData.orderNo}
                                  onChange={handleInputChange}
                                  disabled
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
                                    Order Date *
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
                                  value={formData.orderDate}
                                  onChange={(date) =>
                                    handleDateChange("orderDate", date)
                                  }
                                  disabled={!!editId}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Customer *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.customer}
                                  onChange={handleCustomerChange}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!!editId}
                                >
                                  {customerList.map((customer) => (
                                    <Option
                                      key={customer.id}
                                      value={customer.id}
                                    >
                                      {customer.name}
                                    </Option>
                                  ))}
                                </Select>
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
                                  disabled
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
                                    Supplier *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.supplier}
                                  onChange={handleSupplierChange}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  disabled={!!editId}
                                >
                                  {supplierList.map((supplier) => (
                                    <Option
                                      key={supplier.id}
                                      value={supplier.id}
                                    >
                                      {supplier.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.supplierName}
                                  disabled
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
                                    Delivery Date *
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
                                  value={formData.deliveryDate}
                                  onChange={(date) =>
                                    handleDateChange("deliveryDate", date)
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Payment Terms
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.paymentTerms}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentTerms: value,
                                    }))
                                  }
                                >
                                  <Option value="NET 30">NET 30</Option>
                                  <Option value="NET 45">NET 45</Option>
                                  <Option value="NET 60">NET 60</Option>
                                  <Option value="CASH">CASH</Option>
                                  <Option value="ADVANCE">ADVANCE</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Shipping Method
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.shippingMethod}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      shippingMethod: value,
                                    }))
                                  }
                                >
                                  <Option value="ROAD">ROAD</Option>
                                  <Option value="AIR">AIR</Option>
                                  <Option value="SEA">SEA</Option>
                                  <Option value="RAIL">RAIL</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Status</span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.status}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      status: value,
                                    }))
                                  }
                                >
                                  <Option value="DRAFT">DRAFT</Option>
                                  <Option value="CONFIRMED">CONFIRMED</Option>
                                  <Option value="CANCELLED">CANCELLED</Option>
                                  <Option value="COMPLETED">COMPLETED</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Third Row - Full width Remarks */}
                          <Row gutter={16}>
                            <Col span={20}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Remarks</span>
                                }
                              >
                                <Input
                                  name="remarks"
                                  value={formData.remarks}
                                  onChange={handleInputChange}
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

                    {/* <TabPane tab="Additional Information" key="2">
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
                          
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Contact Person
                                  </span>
                                }
                              >
                                <Input
                                  name="contactPerson"
                                  value={formData.contactPerson}
                                  onChange={handleInputChange}
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
                                    Contact Number
                                  </span>
                                }
                              >
                                <Input
                                  name="contactNumber"
                                  value={formData.contactNumber}
                                  onChange={handleInputChange}
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
                                  <span style={{ color: "#fff" }}>Email</span>
                                }
                              >
                                <Input
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
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
                                  <span style={{ color: "#fff" }}>Tax ID</span>
                                }
                              >
                                <Input
                                  name="taxId"
                                  value={formData.taxId}
                                  onChange={handleInputChange}
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
                                    Currency
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.currency}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      currency: value,
                                    }))
                                  }
                                >
                                  <Option value="USD">USD</Option>
                                  <Option value="EUR">EUR</Option>
                                  <Option value="GBP">GBP</Option>
                                  <Option value="INR">INR</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Incoterms
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.incoterms}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      incoterms: value,
                                    }))
                                  }
                                >
                                  <Option value="EXW">EXW</Option>
                                  <Option value="FOB">FOB</Option>
                                  <Option value="CIF">CIF</Option>
                                  <Option value="DDP">DDP</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Port of Loading
                                  </span>
                                }
                              >
                                <Input
                                  name="portOfLoading"
                                  value={formData.portOfLoading}
                                  onChange={handleInputChange}
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
                                    Port of Discharge
                                  </span>
                                }
                              >
                                <Input
                                  name="portOfDischarge"
                                  value={formData.portOfDischarge}
                                  onChange={handleInputChange}
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
                                    Final Destination
                                  </span>
                                }
                              >
                                <Input
                                  name="finalDestination"
                                  value={formData.finalDestination}
                                  onChange={handleInputChange}
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
                                    Payment Method
                                  </span>
                                }
                              >
                                <Select
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  value={formData.paymentMethod}
                                  onChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentMethod: value,
                                    }))
                                  }
                                >
                                  <Option value="TT">TT</Option>
                                  <Option value="LC">LC</Option>
                                  <Option value="DP">DP</Option>
                                  <Option value="DA">DA</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane> */}
                  </Tabs>
                </div>
              </div>

              {/* Order Items Table */}
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
                        <col style={{ width: "60px" }} /> {/* Action */}
                        <col style={{ width: "60px" }} /> {/* S.No */}
                        <col style={{ width: "150px" }} /> {/* Part No */}
                        <col style={{ width: "200px" }} /> {/* Part Desc */}
                        <col style={{ width: "100px" }} /> {/* Quantity */}
                        <col style={{ width: "100px" }} /> {/* Unit Price */}
                        <col style={{ width: "120px" }} /> {/* Amount */}
                        <col style={{ width: "120px" }} /> {/* Delivery Date */}
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
                            Sku *
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
                            Avl Qty
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
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px dashed white",
                              color: "white",
                            }}
                          >
                            {/* Action */}
                            <td style={{ padding: "8px", textAlign: "center" }}>
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
                                showSearch
                                style={selectStyle}
                                value={item.partNo}
                                onChange={(value) => {
                                  const selectedPart = partNoList.find(
                                    (p) => p.partNo === value
                                  );
                                  handleItemChange(item.id, "partNo", value);
                                  handleItemChange(
                                    item.id,
                                    "partDesc",
                                    selectedPart?.description || ""
                                  );
                                }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {partNoList.map((part) => (
                                  <Option key={part.partNo} value={part.partNo}>
                                    {part.partNo}
                                  </Option>
                                ))}
                              </Select>
                            </td>

                            {/* Part Desc */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.partDesc}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Quantity */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.sku}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>

                            {/* Unit Price */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.batchno}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "batchno",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>

                            {/* Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.avlqty}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </td>

                            {/* Amount */}
                            <td style={{ padding: "8px" }}>
                              <Input
                                value={item.orderqty}
                                style={readOnlyInputStyle}
                              />
                            </td>
                            {/* Status */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "16px",
                    }}
                  >
                    <div>
                      <Typography.Text style={{ color: "white" }}>
                        Total Quantity: {formData.totalQuantity}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text style={{ color: "white" }}>
                        Total Amount: {formData.totalAmount.toFixed(2)}
                      </Typography.Text>
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
                }}
              >
                <Button
                  icon={<UnorderedListOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginLeft: "870px",
                    marginRight: "-20px",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  {viewMode === "form" ? "List" : "Form"}
                </Button>
              </div>

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
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Order No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Order Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Customer
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
                        Total Amount
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
                    {paginatedData.map((order, index) => (
                      <tr
                        key={`order-${index}-${order.id}`}
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
                          {" "}
                          {order.orderNo}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {dayjs(order.orderDate).format("DD-MM-YYYY")}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {order.customerName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {order.supplierName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {order.totalAmount.toFixed(2)}
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
                            className={`status-${order.status.toLowerCase()}`}
                          >
                            {order.status}
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
                            onClick={() => handleEditOrder(order)}
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
                    {Math.min(currentPage * pageSize, listViewData.length)} of{" "}
                    {listViewData.length} items
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
                    { length: Math.ceil(listViewData.length / pageSize) },
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
                          Math.ceil(listViewData.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(listViewData.length / pageSize)
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
                        Math.ceil(listViewData.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(listViewData.length / pageSize)
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
      </div>
    </ConfigProvider>
  );
};

export default BuyerOrder;
