import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
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
  DatePicker,
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
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PS.css";

const { Option } = Select;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const Customer = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [editId, setEditId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customerList, setCustomerList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({
    customer: "",
    shortName: "",
    pan: "",
    contactPerson: "",
    mobile: "",
    gstReg: "",
    email: "",
    groupOf: "",
    tanNo: "",
    address: "",
    country: "",
    state: "",
    city: "",
    gst: "",
  });

  const [clientTableErrors, setClientTableErrors] = useState([
    {
      client: "",
      clientCode: "",
      clientType: "",
      fifoFife: "",
    },
  ]);
  const [branchTableErrors, setBranchTableErrors] = useState([
    {
      branchCode: "",
      branch: "",
    },
  ]);

  const [clientTableData, setClientTableData] = useState([
    {
      id: 1,
      client: "",
      clientCode: "",
      clientType: "",
      fifoFife: "",
    },
  ]);

  const [branchTableData, setBranchTableData] = useState([
    {
      id: 1,
      branchCode: "",
      branch: "",
    },
  ]);

  const [formData, setFormData] = useState({
    customer: "",
    shortName: "",
    pan: "",
    contactPerson: "",
    mobile: "",
    gstReg: "YES",
    email: "",
    groupOf: "",
    tanNo: "",
    address: "",
    country: "",
    state: "",
    city: "",
    gst: "",
    active: true,
  });

  // Replace your current showToast function with this:
  const showToast = (type, message) => {
    notification[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      placement: "topRight",
    });
  };

  useEffect(() => {
    getAllCustomers();
    getAllBranches();
    getAllCountries();
  }, []);

  const getAllCustomers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/customer?orgid=${orgId}`
      );
      if (response.data?.status === true) {
        setCustomerList(response.data.paramObjectsMap?.CustomerVO || []);
      } else {
        showToast("warning", "No customer data found");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showToast("error", "Failed to fetch customers");
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/branch?orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.branchVO) {
        setBranchList(response.data.paramObjectsMap.branchVO);
      } else {
        showToast("warning", "No branch data found");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      showToast("error", "Failed to fetch branches");
    }
  };

  const getAllCountries = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/country?orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.countryVO) {
        setCountryList(response.data.paramObjectsMap.countryVO);
      } else {
        showToast("warning", "No country data found");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      showToast("error", "Failed to fetch countries");
    }
  };

  const getAllStates = async (country) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/state/?country=${country}&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.stateVO) {
        setStateList(response.data.paramObjectsMap.stateVO);
        setFormData((prev) => ({ ...prev, state: "", city: "" }));
      } else {
        showToast("warning", "No state data found");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      showToast("error", "Failed to fetch states");
    }
  };

  const getAllCities = async (state) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/city/state?state=${state}&orgid=${orgId}`
      );
      if (response.data?.paramObjectsMap?.cityVO) {
        setCityList(response.data.paramObjectsMap.cityVO);
        setFormData((prev) => ({ ...prev, city: "" }));
      } else {
        showToast("warning", "No city data found");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showToast("error", "Failed to fetch cities");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "country") {
      getAllStates(value);
    } else if (name === "state") {
      getAllCities(value);
    } else if (name === "gstReg" && value === "NO") {
      setFormData((prev) => ({ ...prev, gst: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "active" ? checked : value,
    }));
  };

  const handleEditCustomer = (customer) => {
    setEditId(customer.id);
    setViewMode("form");

    axios
      .get(`${API_URL}/api/warehousemastercontroller/customer/${customer.id}`)
      .then((response) => {
        const customerData = response.data.paramObjectsMap.Customer;

        setFormData({
          customer: customerData.customerName,
          shortName: customerData.customerShortName,
          pan: customerData.panNo,
          contactPerson: customerData.contactPerson,
          mobile: customerData.mobileNumber,
          gstReg: customerData.gstRegistration,
          email: customerData.emailId,
          groupOf: customerData.groupOf,
          tanNo: customerData.tanNo,
          address: customerData.address1,
          country: customerData.country,
          state: customerData.state,
          city: customerData.city,
          gst: customerData.gstNo,
          active: customerData.active === "Active",
        });

        setClientTableData(
          customerData.clientVO?.map((cl) => ({
            id: cl.id,
            client: cl.client,
            clientCode: cl.clientCode,
            clientType: cl.clientType,
            fifoFife: cl.fifofife,
          })) || []
        );

        setBranchTableData(
          customerData.clientBranchVO?.map((br) => {
            const branch = branchList.find(
              (b) => b.branchCode === br.branchCode
            );
            return {
              id: br.id,
              branchCode: branch ? branch.branchCode : "",
              branch: branch ? branch.branch : "",
            };
          }) || []
        );
      })
      .catch((error) => {
        console.error("Error fetching customer details:", error);
        showToast("error", "Failed to load customer details");
      });
  };

  const handleSaveCustomer = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid MailID Format";
    }
    if (!formData.customer) {
      errors.customer = "Customer is required";
    }
    if (!formData.shortName) {
      errors.shortName = "Short Name is required";
    }
    if (!formData.contactPerson) {
      errors.contactPerson = "Contact Person is required";
    }
    if (!formData.email) {
      errors.email = "Email ID is required";
    }
    if (!formData.groupOf) {
      errors.groupOf = "Group Of is required";
    }
    if (!formData.address) {
      errors.address = "Address is required";
    }
    if (!formData.country) {
      errors.country = "Country is required";
    }
    if (!formData.state) {
      errors.state = "State is required";
    }
    if (!formData.city) {
      errors.city = "City is required";
    }
    if (!formData.mobile) {
      errors.mobile = "Mobile is required";
    } else if (formData.mobile.length < 10) {
      errors.mobile = "Mobile no must be ten digit";
    }
    if (formData.pan.length > 0 && formData.pan.length < 10) {
      errors.pan = "PAN must be ten digit";
    }
    if (formData.gstReg === "YES" && !formData.gst) {
      errors.gst = "GST is Required";
    } else if (formData.gstReg === "YES" && formData.gst.length < 15) {
      errors.gst = "GST must be fifteen digit";
    }

    let clientTableDataValid = true;
    const newTableErrors = clientTableData.map((row) => {
      const rowErrors = {};
      if (!row.client) {
        rowErrors.client = "Client is required";
        clientTableDataValid = false;
      }
      if (!row.clientCode) {
        rowErrors.clientCode = "Client Code is required";
        clientTableDataValid = false;
      }
      if (!row.clientType) {
        rowErrors.clientType = "Client Type is required";
        clientTableDataValid = false;
      }
      if (!row.fifoFife) {
        rowErrors.fifoFife = "FIFO / FIFE is required";
        clientTableDataValid = false;
      }
      return rowErrors;
    });
    setClientTableErrors(newTableErrors);

    let branchTableDataValid = true;
    const newTableErrors1 = branchTableData.map((row) => {
      const rowErrors = {};
      if (!row.branchCode) {
        rowErrors.branchCode = "Branch Code is required";
        branchTableDataValid = false;
      }
      return rowErrors;
    });
    setFieldErrors(errors);

    setBranchTableErrors(newTableErrors1);

    if (
      Object.keys(errors).length === 0 &&
      branchTableDataValid &&
      clientTableDataValid
    ) {
      setIsLoading(true);
      const clientVo = clientTableData.map((row) => ({
        client: row.client,
        clientCode: row.clientCode,
        clientType: row.clientType,
        fifofife: row.fifoFife,
      }));
      const branchVo = branchTableData.map((row) => ({
        branchCode: row.branchCode,
        branch: row.branch,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        customerName: formData.customer,
        customerShortName: formData.shortName,
        panNo: formData.pan,
        contactPerson: formData.contactPerson,
        mobileNumber: formData.mobile,
        gstRegistration: formData.gstReg,
        emailId: formData.email,
        groupOf: formData.groupOf,
        tanNo: formData.tanNo,
        address1: formData.address,
        address2: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        gstNo: formData.gst,
        clientDTO: clientVo,
        clientBranchDTO: branchVo,
        orgId: orgId,
        createdBy: loginUserName,
      };

      try {
        const response = await axios.put(
          `${API_URL}/api/warehousemastercontroller/createUpdateCustomer`,
          saveFormData
        );

        if (response.data?.status === true) {
          handleClear();
          showToast(
            "success",
            editId
              ? "Customer Updated Successfully"
              : "Customer created successfully"
          );
          getAllCustomers();
        } else {
          showToast(
            "error",
            response.data?.paramObjectsMap?.errorMessage ||
              "Customer operation failed"
          );
        }
      } catch (error) {
        console.error("Error:", error);
        showToast(
          "error",
          error.response?.data?.message || "Customer operation failed"
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      customer: "",
      shortName: "",
      pan: "",
      contactPerson: "",
      mobile: "",
      gstReg: "YES",
      email: "",
      groupOf: "",
      tanNo: "",
      address: "",
      country: "",
      state: "",
      city: "",
      gst: "",
      active: true,
    });
    setClientTableData([
      { id: 1, client: "", clientCode: "", clientType: "", fifoFife: "" },
    ]);
    setBranchTableData([{ id: 1, branchCode: "", branch: "" }]);
    setEditId("");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleAddClientRow = () => {
    setClientTableData([
      ...clientTableData,
      {
        id: Date.now(),
        client: "",
        clientCode: "",
        clientType: "",
        fifoFife: "",
      },
    ]);
  };

  const handleAddBranchRow = () => {
    setBranchTableData([
      ...branchTableData,
      {
        id: Date.now(),
        branchCode: "",
        branch: "",
      },
    ]);
  };

  const handleDeleteRow = (id, tableType) => {
    if (tableType === "client") {
      setClientTableData(clientTableData.filter((item) => item.id !== id));
    } else {
      setBranchTableData(branchTableData.filter((item) => item.id !== id));
    }
  };

  const handleClientTableChange = (id, field, value) => {
    setClientTableData(
      clientTableData.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleBranchTableChange = (id, field, value) => {
    const updatedData = branchTableData.map((item) => {
      if (item.id === id) {
        const branch = branchList.find((b) => b.branchCode === value);
        return {
          ...item,
          [field]: value,
          branch: branch ? branch.branch : "",
        };
      }
      return item;
    });
    setBranchTableData(updatedData);
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

  const customerInfoTabItems = [
    {
      key: "1",
      label: "Customer Information",
      children: (
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
            {/* First Row */}
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Customer Name *</span>}
                >
                  <Input
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Short Name *</span>}
                >
                  <Input
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <span style={{ color: "#fff" }}>Contact Person *</span>
                  }
                >
                  <Input
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Mobile *</span>}
                >
                  <Input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Second Row */}
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Email *</span>}
                >
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Group Of *</span>}
                >
                  <Input
                    name="groupOf"
                    value={formData.groupOf}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={<span style={{ color: "#fff" }}>PAN</span>}>
                  <Input
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={<span style={{ color: "#fff" }}>TAN</span>}>
                  <Input
                    name="tanNo"
                    value={formData.tanNo}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Third Row */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Address *</span>}
                >
                  <Input.TextArea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={inputStyle}
                    rows={2}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>Country *</span>}
                >
                  <Select
                    style={selectStyle}
                    value={formData.country}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        country: value,
                      }));
                      getAllStates(value);
                    }}
                  >
                    {countryList.map((country) => (
                      <Option key={country.id} value={country.countryName}>
                        {country.countryName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>State *</span>}
                >
                  <Select
                    style={selectStyle}
                    value={formData.state}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        state: value,
                      }));
                      getAllCities(value);
                    }}
                    disabled={!formData.country}
                  >
                    {stateList.map((state) => (
                      <Option key={state.id} value={state.stateName}>
                        {state.stateName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={<span style={{ color: "#fff" }}>City *</span>}
                >
                  <Select
                    style={selectStyle}
                    value={formData.city}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: value,
                      }))
                    }
                    disabled={!formData.state}
                  >
                    {cityList.map((city) => (
                      <Option key={city.id} value={city.cityName}>
                        {city.cityName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Fourth Row */}
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={
                    <span style={{ color: "#fff" }}>GST Registration *</span>
                  }
                >
                  <Select
                    style={selectStyle}
                    value={formData.gstReg}
                    onChange={(value) =>
                      handleInputChange({
                        target: { name: "gstReg", value },
                      })
                    }
                  >
                    <Option value="YES">YES</Option>
                    <Option value="NO">NO</Option>
                  </Select>
                </Form.Item>
              </Col>
              {formData.gstReg === "YES" && (
                <Col span={6}>
                  <Form.Item
                    label={<span style={{ color: "#fff" }}>GST No *</span>}
                  >
                    <Input
                      name="gst"
                      value={formData.gst}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={6}>
                <Form.Item
                  name="active"
                  valuePropName="checked"
                  style={{ marginTop: "30px" }}
                >
                  <Checkbox
                    checked={formData.active}
                    onChange={(e) =>
                      handleInputChange({
                        target: {
                          name: "active",
                          checked: e.target.checked,
                        },
                      })
                    }
                    style={{ color: "white" }}
                  >
                    Active
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      ),
    },
    {
      key: "2",
      label: "Client & Branch",
      children: (
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
          <Tabs defaultActiveKey="1">
            <TabPane tab="Client" key="1">
              <div style={{ marginBottom: "16px" }}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddClientRow}
                  style={{
                    marginRight: "8px",
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Client
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={() =>
                    setClientTableData([
                      {
                        id: 1,
                        client: "",
                        clientCode: "",
                        clientType: "",
                        fifoFife: "",
                      },
                    ])
                  }
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
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                  </colgroup>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px dashed #000",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
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
                        Client *
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Client Code *
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Client Type *
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        FIFO/FIFE *
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientTableData.map((item, index) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px dashed white",
                          color: "white",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteRow(item.id, "client")}
                            danger
                            type="text"
                            style={{ color: "#ff4d4f" }}
                          />
                        </td>
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
                        <td style={{ padding: "8px" }}>
                          <Input
                            value={item.client}
                            onChange={(e) =>
                              handleClientTableChange(
                                item.id,
                                "client",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <Input
                            value={item.clientCode}
                            onChange={(e) =>
                              handleClientTableChange(
                                item.id,
                                "clientCode",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <Select
                            style={selectStyle}
                            value={item.clientType}
                            onChange={(value) =>
                              handleClientTableChange(
                                item.id,
                                "clientType",
                                value
                              )
                            }
                          >
                            <Option value="FIXED">FIXED</Option>
                            <Option value="OPEN">OPEN</Option>
                          </Select>
                        </td>
                        <td style={{ padding: "8px" }}>
                          <Select
                            style={selectStyle}
                            value={item.fifoFife}
                            onChange={(value) =>
                              handleClientTableChange(
                                item.id,
                                "fifoFife",
                                value
                              )
                            }
                          >
                            <Option value="FIFO">FIFO</Option>
                            <Option value="FIFE">FIFE</Option>
                            <Option value="LILO">LILO</Option>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabPane>
            <TabPane tab="Branch" key="2">
              <div style={{ marginBottom: "16px" }}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddBranchRow}
                  style={{
                    marginRight: "8px",
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Branch
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={() =>
                    setBranchTableData([{ id: 1, branchCode: "", branch: "" }])
                  }
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
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "60px" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "200px" }} />
                  </colgroup>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px dashed #000",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
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
                        Branch Code *
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Branch Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchTableData.map((item, index) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px dashed white",
                          color: "white",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteRow(item.id, "branch")}
                            danger
                            type="text"
                            style={{ color: "#ff4d4f" }}
                          />
                        </td>
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
                        <td style={{ padding: "8px" }}>
                          <Select
                            showSearch
                            style={selectStyle}
                            value={item.branchCode}
                            onChange={(value) =>
                              handleBranchTableChange(
                                item.id,
                                "branchCode",
                                value
                              )
                            }
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {branchList.map((branch) => (
                              <Option key={branch.id} value={branch.branchCode}>
                                {branch.branchCode}
                              </Option>
                            ))}
                          </Select>
                        </td>
                        <td style={{ padding: "8px" }}>
                          <Input
                            value={item.branch}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabPane>
          </Tabs>
        </div>
      ),
    },
  ];

  const listViewColumns = [
    { title: "Customer", dataIndex: "customerName", key: "customerName" },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    { title: "Email", dataIndex: "emailId", key: "emailId" },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (text) => (text === "Active" ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEditCustomer(record)}>
          Edit
        </Button>
      ),
    },
  ];

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
                    Customer
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage customers
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
                  onClick={handleSaveCustomer}
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

              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
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
                    items={customerInfoTabItems}
                  />
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
                  width: "95%",
                  margin: "0 auto",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "500px",
                  overflowY: "auto",
                  marginTop: "20px",
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
                        Customer Code
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Customer Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Contact Person
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Phone
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Active
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
                    {customerList
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((customer, index) => (
                        <tr
                          key={`customer-${index}-${customer.id}`}
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
                            {customer.customerCode}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {customer.customerName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {customer.contactPerson}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {customer.phone}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {customer.email}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {customer.active === "Active" ? "Yes" : "No"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            <Space>
                              <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleEditCustomer(customer)}
                                style={{ color: "white" }}
                              />
                              {/* <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                                style={{ color: "white" }}
                              /> */}
                            </Space>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                    paddingRight: "20px",
                    color: "white",
                  }}
                >
                  <span style={{ marginRight: "16px", fontSize: "12px" }}>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, customerList.length)} of{" "}
                    {customerList.length} items
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
                    { length: Math.ceil(customerList.length / pageSize) },
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
                          Math.ceil(customerList.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(customerList.length / pageSize)
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
                        Math.ceil(customerList.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(customerList.length / pageSize)
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

export default Customer;
