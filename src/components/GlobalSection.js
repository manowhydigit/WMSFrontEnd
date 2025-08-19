import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { IconWorld } from "@tabler/icons-react";

import { ToastContainer } from "react-toastify";
import { showToast } from "../utils/toast-component";
// material-ui
import { Form, Modal } from "antd"; // Added missing imports
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CardActions,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "./GlobalSection.css";

// third-party

// project imports

// assets

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

// notification status options

// ==============================|| NOTIFICATION ||============================== //

const GlobalSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down("md"));
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [finYearValue, setFinYearValue] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [customerValue, setCustomerValue] = useState("");
  const [warehouseValue, setWarehouseValue] = useState("");
  const [clientValue, setClientValue] = useState("");
  const [branchValue, setBranchValue] = useState("");
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem("orgId")));
  const [userId, setUserId] = useState(localStorage.getItem("usersId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [branchVO, setBranchVO] = useState([]);
  const [finVO, setFinVO] = useState([]);
  const [warehouseVO, setWarehouseVO] = useState([]);
  const [customerVO, setCustomerVO] = useState([]);
  const [clientVO, setClientVO] = useState([]);
  const [globalParameter, setGlobalParameter] = useState([]);
  const [branchName, setBranchName] = useState("");

  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  useEffect(() => {
    getGlobalParameter();
    getAccessBranch();
    getFinYear();
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [selectedBranch, setSelectedBranch] = useState({
    branch: "",
    branchcode: "",
  });

  const getAccessBranch = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/globalparamBranchByUserName?orgid=${orgId}&userName=${userName}`
      );
      // Response has "GlopalParameters" array (note the typo in the API response)
      setBranchVO(result.data?.paramObjectsMap?.GlopalParameters || []);
      console.log("Branch Data:", result.data);
    } catch (err) {
      console.log("error", err);
      setBranchVO([]);
    }
  };

  const getFinYear = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/getAllFInYearByOrgId?orgId=${orgId}`
      );
      setFinVO(result.data?.paramObjectsMap?.financialYearVOs || []);
      console.log("Test", result.data);
    } catch (err) {
      console.log("error", err);
      setFinVO([]); // Ensure state is cleared on error
    }
  };

  const getCustomer = async (branchcode) => {
    const formData = {
      branchcode: branchcode,
      orgid: orgId,
      userName: userName,
    };

    const queryParams = new URLSearchParams(formData).toString();

    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/globalparamCustomerByUserName?${queryParams}`
      );
      // Response has "GlopalParameterCustomer" array
      setCustomerVO(
        result.data?.paramObjectsMap?.GlopalParameterCustomer || []
      );
      console.log("Customer Data:", result.data);
    } catch (err) {
      console.log("error", err);
      setCustomerVO([]);
    }
  };

  const getClient = async (customer, branchCode) => {
    const formData = {
      branchcode: branchCode,
      orgid: orgId,
      userName: userName,
      customer: customer,
    };

    const queryParams = new URLSearchParams(formData).toString();

    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/globalparamClientByUserName?${queryParams}`
      );
      // Response has "GlopalParameterClient" array
      setClientVO(result.data?.paramObjectsMap?.GlopalParameterClient || []);
      console.log("Client Data:", result.data);
    } catch (err) {
      console.log("error", err);
      setClientVO([]);
    }
  };

  const getWareHouse = async (branchcode) => {
    try {
      const result = await axios.get(
        `${API_URL}/api/warehousemastercontroller/warehouse/branch?branchcode=${branchcode}&orgid=${orgId}`
      );
      // Make sure we're getting the array correctly from the response
      const warehouses = result.data?.paramObjectsMap?.Warehouse || [];
      setWarehouseVO(warehouses);
      console.log("Warehouse Data:", warehouses);
    } catch (err) {
      console.log("error", err);
      setWarehouseVO([]);
    }
  };

  const getGlobalParameter = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/api/commonmaster/globalparam/username?orgid=${orgId}&userId=${userId}`
      );
      const globalParameterVO = result.data?.paramObjectsMap?.globalParam;
      if (globalParameterVO) {
        setGlobalParameter(globalParameterVO);
        // Set all values first
        setCustomerValue(globalParameterVO.customer || "");
        setClientValue(globalParameterVO.client || "");
        setFinYearValue(globalParameterVO.finYear || "");
        setWarehouseValue(globalParameterVO.warehouse || "");
        setBranchValue(globalParameterVO.branchcode || "");
        setBranchName(globalParameterVO.branch || "");

        // Then fetch dependent data
        getCustomer(globalParameterVO.branchcode);
        getClient(globalParameterVO.customer, globalParameterVO.branchcode);
        getWareHouse(globalParameterVO.branchcode);

        // Set form values
        form.setFieldsValue({
          finYear: globalParameterVO.finYear,
          branch: globalParameterVO.branchcode,
          customer: globalParameterVO.customer,
          client: globalParameterVO.client,
          warehouse: globalParameterVO.warehouse,
        });
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  const handleSubmit = async () => {
    const formData = {
      branch: branchName,
      branchcode: branchValue,
      customer: customerValue,
      client: clientValue,
      finYear: finYearValue,
      warehouse: warehouseValue,
      userid: userId,
      orgId,
    };
    try {
      const result = await axios.put(
        `${API_URL}/api/commonmaster/globalparam`,
        formData
      );
      showToast("success", "Global Parameter updated succesfully");
      // setOpen(false);
      console.log("Test", result);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (globalParameter) {
      form.setFieldsValue({
        finYear: finYearValue,
        branch: branchValue,
        customer: customerValue,
        client: clientValue,
        warehouse: warehouseValue,
      });
    }
  }, [globalParameter, form]);

  const handleBranchChange = (event) => {
    const branchcode = event.target.value;
    const branch = branchVO.find((option) => option.branchcode === branchcode);

    if (branch) {
      setSelectedBranch({ branch: branch.branch, branchcode: branchcode });
      setBranchName(branch.branch);
      form.setFieldsValue({ branch: branchcode });
    }

    setBranchValue(branchcode);
    getCustomer(branchcode);
  };

  // Similarly update other handlers:
  const handleCustomerChange = (event) => {
    const value = event.target.value;
    setCustomerValue(value);
    form.setFieldsValue({ customer: value });
    getClient(value, selectedBranch.branchcode);
  };

  const handleClientChange = (event) => {
    const value = event.target.value;
    setClientValue(value);
    form.setFieldsValue({ client: value });
    getWareHouse(selectedBranch.branchcode);
  };

  const handleWarehouseChange = (event) => {
    const value = event.target.value;
    setWarehouseValue(value);
    form.setFieldsValue({ warehouse: value });
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    if (event?.target.value) setValue(event?.target.value);
  };

  const handleFinYearChange = (event) => {
    setFinYearValue(event.target.value);
  };

  // Glass effect styles
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    color: "#fff",
  };

  const textFieldStyle = {
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(255, 255, 255, 0.8)",
      },
    },
    "& .MuiSelect-icon": {
      color: "rgba(255, 255, 255, 0.7)",
    },
  };

  const buttonStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
  };

  return (
    <>
      <Box
        sx={{
          mr: 2,
          [theme.breakpoints.down("md")]: {
            mr: 2,
          },
        }}
      >
        <ButtonBase sx={{ borderRadius: "12px" }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: "all .2s ease-in-out",
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&[aria-controls="menu-list-grow"],&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light,
              },
            }}
            ref={anchorRef}
            aria-controls={open ? "menu-list-grow" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconWorld stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>
      <Modal
        title={null}
        visible={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={400}
        closable={false}
        className="glass-card-modal"
        bodyStyle={{
          padding: 0,
          background: "transparent",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="glass-card">
          <button className="close-popup" onClick={() => setOpen(false)}>
            &times;
          </button>

          <div className="card-header">
            <p>Global Parameters</p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="form-content">
              <Form.Item
                name="finYear"
                label="Fin Year"
                className="glass-form-item"
                rules={[{ required: true, message: "Please select fin year!" }]}
              >
                <TextField
                  select
                  fullWidth
                  style={{ color: "white" }}
                  size="small"
                  className="glass-input"
                  value={finYearValue}
                  onChange={(e) => setFinYearValue(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="" disabled></option>
                  {finVO?.map((option) => (
                    <option key={option.id} value={option.finYear}>
                      {option.finYear}
                    </option>
                  ))}
                </TextField>
              </Form.Item>

              <Form.Item
                name="branch"
                label="Branch"
                className="glass-form-item"
                rules={[{ required: true, message: "Please select branch!" }]}
              >
                <TextField
                  select
                  fullWidth
                  style={{ color: "white" }}
                  size="small"
                  className="glass-input"
                  value={branchValue}
                  onChange={handleBranchChange}
                  SelectProps={{ native: true }}
                >
                  <option value="" disabled></option>
                  {branchVO.map((option) => (
                    <option key={option.branchcode} value={option.branchcode}>
                      {option.branch}
                    </option>
                  ))}
                </TextField>
              </Form.Item>

              <Form.Item
                name="customer"
                label="Customer"
                className="glass-form-item"
                rules={[{ required: true, message: "Please select customer!" }]}
              >
                <TextField
                  select
                  fullWidth
                  style={{ color: "white" }}
                  size="small"
                  className="glass-input"
                  value={customerValue}
                  onChange={handleCustomerChange}
                  SelectProps={{ native: true }}
                >
                  <option value="" disabled></option>
                  {customerVO?.map((option) => (
                    <option key={option.customer} value={option.customer}>
                      {option.customer}
                    </option>
                  ))}
                </TextField>
              </Form.Item>

              <Form.Item
                name="client"
                label="Client"
                className="glass-form-item"
                rules={[{ required: true, message: "Please select client!" }]}
              >
                <TextField
                  select
                  fullWidth
                  style={{ color: "white" }}
                  size="small"
                  className="glass-input"
                  value={clientValue}
                  onChange={handleClientChange}
                  SelectProps={{ native: true }}
                >
                  <option value="" disabled></option>
                  {clientVO?.map((option) => (
                    <option key={option.client} value={option.client}>
                      {option.client}
                    </option>
                  ))}
                </TextField>
              </Form.Item>

              <Form.Item
                name="warehouse"
                label="Warehouse"
                className="glass-form-item"
                rules={[
                  { required: true, message: "Please select warehouse!" },
                ]}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  className="glass-input"
                  value={warehouseValue}
                  onChange={handleWarehouseChange}
                  SelectProps={{ native: true }}
                >
                  <option value="" disabled></option>
                  {warehouseVO?.map((option) => (
                    <option key={option.Warehouse} value={option.Warehouse}>
                      {option.Warehouse}
                    </option>
                  ))}
                </TextField>
              </Form.Item>
            </div>

            <div className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  margin: "0",
                  padding: "4px 8px",
                  borderRadius: "0 8px",
                  border: "1px solid white",
                }}
              >
                Update
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default GlobalSection;
