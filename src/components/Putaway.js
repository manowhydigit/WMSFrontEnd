import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";
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
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  SearchOutlined,
  ClearOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import {
  // ... your existing imports
  FormControl,
  FormLabel, // Add this import
  FormHelperText,
  MenuItem,
  InputLabel,
  TextField,
  Tab,
  // ... rest of your imports
} from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import { ExcelRenderer } from "react-excel-renderer";
import dayjs from "dayjs";
import axios from "axios";
import "./PS.css";
import { showToast } from "../utils/toast-component";
import samplePutawayExcelFile from "../assets/sample-files/sample_Putaway.xls";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { initCaps } from "../utils/CommonFunctions";

const { Option } = Select;
const { TabPane } = Tabs;

const PutawayTable = ({
  putawayTableData,
  setPutawayTableData,
  partNoList,
  binList,
  handleDeleteRow,
  handleTableChange,
  handlePartNoChange,
  handleBinChange,
}) => {
  const columns = [
    {
      title: "Action",
      key: "action",
      fixed: "left",
      width: 80,
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() =>
            handleDeleteRow(record.id, putawayTableData, setPutawayTableData)
          }
          danger
          type="text"
          style={{ color: "#ff4d4f" }}
        />
      ),
    },
    {
      title: "S.No",
      key: "sno",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "qrCode", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "GRN No *",
      dataIndex: "grnNo",
      key: "grnNo",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "grnNo", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Part No *",
      dataIndex: "partNo",
      key: "partNo",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Part No"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handlePartNoChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {partNoList.map((part) => (
            <Option key={part.id} value={part.partno}>
              {part.partno}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Part Desc",
      dataIndex: "partDesc",
      key: "partDesc",
      width: 200,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Batch No *",
      dataIndex: "batchNo",
      key: "batchNo",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "batchNo", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Batch Date",
      dataIndex: "batchDate",
      key: "batchDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "batchDate",
              date ? date.format("YYYY-MM-DD") : null
            )
          }
        />
      ),
    },
    {
      title: "Exp Date",
      dataIndex: "expDate",
      key: "expDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text) : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "expDate",
              date ? date.format("YYYY-MM-DD") : null
            )
          }
        />
      ),
    },
    {
      title: "Available Qty *",
      dataIndex: "availableQty",
      key: "availableQty",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "availableQty", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Putaway Qty *",
      dataIndex: "putawayQty",
      key: "putawayQty",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "putawayQty", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
    {
      title: "Bin Location *",
      dataIndex: "binLocation",
      key: "binLocation",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Bin"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handleBinChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {binList.map((bin) => (
            <Option key={bin.id} value={bin.binCode}>
              {bin.binCode}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "remarks", e.target.value)
          }
          style={inputStyle}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={putawayTableData}
      scroll={{ x: 1500 }}
      bordered
      size="small"
      pagination={false}
    />
  );
};

const { TextArea } = Input;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const Putaway = () => {
  // State from your example
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginUserId, setLoginUserId] = useState(
    localStorage.getItem("userId")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginBranch, setLoginBranch] = useState(
    localStorage.getItem("branch")
  );
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [checkedState, setCheckedState] = useState({});
  const [checkAll, setCheckAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [performanceGoalsData, setPerformanceGoalsData] = useState([]);
  const paginatedData = performanceGoalsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [viewMode, setViewMode] = useState("form");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [putawayItems, setPutawayItems] = useState([]);

  const [formData, setFormData] = useState({
    binClass: "Fixed",
    binPick: "Empty",
    binType: "",
    branch: loginBranch,
    branchCode: loginBranchCode,
    briefDesc: "",
    carrier: "",
    client: loginClient,
    contact: "",
    core: "Multi",
    createdBy: loginUserName,
    customer: loginCustomer,
    docId: "",
    docDate: dayjs(),
    enteredPerson: "",
    driverName: "",
    entryNo: "",
    entryDate: null,
    finYear: loginFinYear,
    grnDate: null,
    grnNo: "",
    lotNo: "",
    modeOfShipment: "",
    orgId: orgId,
    status: "Edit",
    securityName: "",
    supplier: "",
    supplierShortName: "",
    totalGrnQty: "",
    vehicleType: "",
    vehicleNo: "",
    warehouse: loginWarehouse,
    freeze: false,
  });

  const [putAwayDetailsTableData, setPutAwayDetailsTableData] = useState([
    {
      batchNo: "",
      recQty: "",
      binType: "",
      cellType: "ACTIVE",
      noOfBins: "",
      bin: "",
      batchDate: "",
      expDate: "",
      partDesc: "",
      shortQty: "",
      grnQty: "",
      damageQty: "",
      pQty: "",
      invQty: "",
      sku: "",
      ssku: "",
      partNo: "",
    },
  ]);

  // const lrNoDetailsRefs = useRef(
  //   putAwayDetailsTableData.map(() => ({
  //     sku: React.createRef(),
  //     bin: React.createRef()
  //   }))
  // );
  // useEffect(() => {
  //   // If the length of the table changes, update the refs
  //   if (lrNoDetailsRefs.current.length !== putAwayDetailsTableData.length) {
  //     lrNoDetailsRefs.current = putAwayDetailsTableData.map(
  //       (_, index) =>
  //         lrNoDetailsRefs.current[index] || {
  //           sku: React.createRef(),
  //           bin: React.createRef()
  //         }
  //     );
  //   }
  // }, [putAwayDetailsTableData.length]);

  const lrNoDetailsRefs = useRef([]);

  useEffect(() => {
    lrNoDetailsRefs.current = putAwayDetailsTableData.map((_, index) => ({
      sku: lrNoDetailsRefs.current[index]?.sku || React.createRef(),
      bin: lrNoDetailsRefs.current[index]?.bin || React.createRef(),
    }));
  }, [putAwayDetailsTableData]);

  const [gridDetailsTableData, setGridDetailsTableData] = useState([
    // {
    //   batchNo: '',
    //   recQty: '',
    //   binType: '',
    //   cellType: 'ACTIVE',
    //   noOfBins: '',
    //   bin: '',
    //   batchDate: '',
    //   expDate: '',
    //   partDesc: '',
    //   shortQty: '',
    //   grnQty: '',
    //   damageQty: '',
    //   pQty: '',
    //   invQty: '',
    //   sku: '',
    //   ssku: '',
    //   partNo: ''
    // }
  ]);
  const [putAwayTableErrors, setPutAwayTableErrors] = useState([
    {
      batch: "",
      bin: "",
      binType: "",
      cellType: "",
      grnQty: "",
      invNo: "",
      invQty: "",
      partDesc: "",
      partNo: "",
      putAwayQty: "",
      recQty: "",
      remarks: "",
      sku: "",
      ssku: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    binClass: "",
    binPick: "",
    binType: "",
    branch: loginBranch,
    branchCode: loginBranchCode,
    carrier: "",
    client: loginClient,
    core: "",
    createdBy: loginUserName,
    customer: loginCustomer,
    enteredPerson: "",
    entryNo: "",
    entryDate: null,
    finYear: "",
    grnDate: null,
    grnNo: "",
    lotNo: "",
    modeOfShipment: "",
    orgId: orgId,
    status: "",
    supplier: "",
    supplierShortName: "",
    warehouse: loginWarehouse,
    docDate: new Date(),
  });
  const listViewColumns = [
    { accessorKey: "status", header: "Status", size: 140 },
    { accessorKey: "docId", header: "Document No", size: 140 },
    { accessorKey: "docDate", header: "Document Date", size: 140 },
    { accessorKey: "grnNo", header: "GRN No", size: 140 },
    { accessorKey: "grnDate", header: "GRN Date", size: 140 },
    { accessorKey: "entryNo", header: "Entry No", size: 140 },
    { accessorKey: "entryDate", header: "Entry Date", size: 140 },
    { accessorKey: "totalGrnQty", header: "Total Grn Qty", size: 140 },
    { accessorKey: "totalPutawayQty", header: "Total Putaway Qty", size: 140 },
    // { accessorKey: 'customer', header: 'Customer', size: 140 },
    // { accessorKey: 'refNo', header: 'Ref No', size: 140 },
    // { accessorKey: 'refDate', header: 'Ref Date', size: 140 },
    // { accessorKey: 'refDate', header: 'Ship To', size: 140 },
    // { accessorKey: 'reMarks', header: 'Remarks', size: 140 }
  ];

  useEffect(() => {
    getPutAwayDocId();
    getAllPutAway();
    getGrnForPutaway();
    getAllLocationTypes();
  }, []);

  useEffect(() => {
    // const totalGrnQty = putAwayDetailsTableData.reduce((sum, row) => sum + (parseInt(row.grnQty, 10) || 0), 0);
    const totalPutawayQty = putAwayDetailsTableData.reduce(
      (sum, row) => sum + (parseInt(row.pQty, 10) || 0),
      0
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      // totalGrnQty: totalGrnQty,
      totalPutawayQty: totalPutawayQty,
    }));
    // console.log('oq', formData.totalPutawayQty);
  }, [putAwayDetailsTableData]);

  useEffect(() => {
    const initialCheckedState = {};
    gridDetailsTableData.forEach((row) => {
      initialCheckedState[row.id] = false;
    });
    setCheckedState(initialCheckedState);
  }, [gridDetailsTableData]);

  const handleCheckboxChange = (id) => {
    setCheckedState((prevCheckedState) => ({
      ...prevCheckedState,
      [id]: !prevCheckedState[id],
    }));

    const allChecked = gridDetailsTableData.every(
      (row) => checkedState[row.id] || row.id === id
    );
    setCheckAll(allChecked);
  };

  const handleCheckAllChange = () => {
    const updatedCheckAll = !checkAll;
    const newCheckedState = {};
    gridDetailsTableData.forEach((row) => {
      newCheckedState[row.id] = updatedCheckAll;
    });
    setCheckedState(newCheckedState);
    setCheckAll(updatedCheckAll);
  };

  const handlePutawayGrid = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/warehousemastercontroller/getAllBinDetails?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      if (response.statusFlag === "Ok" && response.status) {
        const bins = response.paramObjectsMap.Bins;

        const selectedRows = gridDetailsTableData.filter(
          (row) => checkedState[row.id]
        );

        const updatedRows = selectedRows.map((row) => ({
          ...row,
          binOptions: bins.map((bin) => bin.bin),
        }));
        console.log("updatedRows", updatedRows);

        setPutAwayDetailsTableData(updatedRows);
      } else {
        console.error(
          "Failed to fetch bin details:",
          response.paramObjectsMap.message
        );
      }
    } catch (error) {
      console.error("Error fetching bin details:", error);
    }

    handleCloseModal();
  };

  const getPutAwayDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/putaway/getPutAwayDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setFormData((prevData) => ({
          ...prevData,
          docId: response.paramObjectsMap.PutAwayDocId,
        }));
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getGrnForPutaway = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/putaway/getGrnForPutaway?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      setGrnList(response.paramObjectsMap.grnVO);
      console.log("grnVo", response.paramObjectsMap.grnVO);
    } catch (error) {
      console.error("Error fetching gate passes:", error);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      batchNo: "",
      batchDate: null,
      expDate: null,
      grnQty: "",
      putawayQty: "",
      location: "",
    };

    setPutawayItems([...putawayItems, newRow]);
  };

  // const handleFullGrid = () => {
  //   getPutawayGridDetails();
  // };
  const handleCloseModal = () => {
    setModalOpen(false);
    setCheckAll(false);
  };

  const getAllLocationTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/warehousemastercontroller/locationtype/warehouse?orgid=${orgId}&warehouse=${loginWarehouse}`
      );
      if (response.status === true) {
        setLocationTypeList(response.paramObjectsMap.Locationtype);
        console.log(
          "THE LOCATIONTYPE IS:",
          response.paramObjectsMap.Locationtype
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching locationType data:", error);
    }
  };

  const getPutawayGridDetails = async () => {
    const errors = {};
    if (!formData.grnNo) {
      errors.grnNo = "Grn No is required";
    }
    if (!formData.binType) {
      errors.binType = "Bin Type is required";
    }
    if (Object.keys(errors).length === 0) {
      setModalOpen(true);
      try {
        const response = await axios.get(
          `${API_URL}/putaway/getPutawayGridDetails?binClass=${formData.binClass}&binPick=${formData.binPick}&binType=${formData.binType}&branchCode=${loginBranchCode}&client=${loginClient}&grnNo=${formData.grnNo}&orgId=${orgId}&warehouse=${loginWarehouse}`
        );
        console.log("THE GRN IDS GRID DETAILS IS:", response);
        if (response.status === true) {
          const gridDetails = response.paramObjectsMap.gridDetails;
          console.log("THE BIN DETAILS ARE:", gridDetails);

          setGridDetailsTableData(
            gridDetails.map((row) => ({
              id: row.id,
              batchNo: row.batchNo,
              recQty: row.recQty,
              invoiceNo: row.invoiceNo,
              batchNo: row.batchNo,
              binType: row.binType,
              noOfBins: row.noOfBins,
              bin: row.bin,
              remarks: row.remarks,
              batchDate: row.batchDate,
              expDate: row.expDate,
              partDesc: row.partDesc,
              shortQty: row.shortQty,
              grnQty: row.grnQty,
              damageQty: row.damageQty,
              pQty: row.pQty,
              invQty: row.invQty,
              sku: row.sku,
              ssku: row.ssku,
              partNo: row.partNo,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getAllPutAway = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/putaway/getAllPutAway?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.PutAwayVO);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getPutAwayById = async (row) => {
    console.log("THE SELECTED PUTAWAY ID IS:", row);
    setEditId(row.original.id);

    try {
      const response = await axios.get(
        `${API_URL}/putaway/getPutAwayById?id=${row.original.id}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListView(false);
        const particularPutaway = response.paramObjectsMap.putAwayVO;
        console.log("THE PARTICULAR PUTAWAY IS:", particularPutaway);

        // Set the form data
        setFormData({
          docDate: particularPutaway.docDate,
          grnNo: particularPutaway.grnNo,
          docId: particularPutaway.docId,
          grnDate: particularPutaway.grnDate,
          entryNo: particularPutaway.entryNo,
          entryDate: particularPutaway.entryDate,
          core: particularPutaway.core,
          supplierShortName: particularPutaway.supplierShortName,
          supplier: particularPutaway.supplier,
          modeOfShipment: particularPutaway.modeOfShipment,
          carrier: particularPutaway.carrier,
          binType: particularPutaway.binType,
          contact: particularPutaway.contact,
          status: particularPutaway.status,
          // status: particularPutaway.status === 'Edit' ? 'EDIT' : 'CONFIRM' || 'Confirm' ? 'CONFIRM' : 'EDIT',
          lotNo: particularPutaway.lotNo,
          enteredPerson: particularPutaway.enteredPerson,
          binClass: particularPutaway.binClass,
          binPick: particularPutaway.binPick,
          totalGrnQty: particularPutaway.totalGrnQty,
          totalPutawayQty: particularPutaway.totalPutawayQty,
          screenName: particularPutaway.screenName,
          screenCode: particularPutaway.screenCode,
          orgId: particularPutaway.orgId,
          customer: particularPutaway.customer,
          client: particularPutaway.client,
          finYear: particularPutaway.finYear,
          vehicleType: particularPutaway.vehicleType,
          vehicleNo: particularPutaway.vehicleNo,
          driverName: particularPutaway.driverName,
          branch: particularPutaway.branch,
          branchCode: particularPutaway.branchCode,
          warehouse: particularPutaway.warehouse,
          freeze: particularPutaway.freeze,
        });

        // Fetch bin details
        const binResponse = await axios.get(
          `${API_URL}/warehousemastercontroller/getAllBinDetails?branchCode=${particularPutaway.branchCode}&client=${particularPutaway.client}&orgId=${particularPutaway.orgId}&warehouse=${particularPutaway.warehouse}`
        );

        if (binResponse.status === true) {
          const bins = binResponse.paramObjectsMap.Bins.map((bin) => bin.bin);

          // Update putaway details with bin options
          setPutAwayDetailsTableData(
            particularPutaway.putAwayDetailsVO.map((pa) => ({
              partNo: pa.partNo,
              batchNo: pa.batch,
              partDesc: pa.partDesc,
              sku: pa.sku,
              invoiceNo: pa.invoiceNo,
              invQty: pa.invQty,
              recQty: pa.recQty,
              pQty: pa.putAwayQty,
              bin: pa.bin,
              binOptions: bins, // Set bin options here
              remarks: pa.remarks,
              binType: pa.binType,
              shortQty: pa.shortQty,
              grnQty: pa.grnQty,
              binClass: pa.binClass,
              cellType: pa.cellType,
              batchDate: pa.batchDate,
              status: pa.status,
              expDate: pa.expDate,
              qcFlag: pa.qcFlag,
              ssku: pa.ssku,
              ssqty: pa.ssqty,
            }))
          );
        } else {
          console.error("Error fetching bin details:", binResponse);
        }
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } =
      e.target;

    let errorMessage = "";

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      // Handle specific cases
      if (name === "grnNo") {
        const selectedId = grnList.find((id) => id.docId === value);
        if (selectedId) {
          setFormData((prevData) => ({
            ...prevData,
            grnNo: selectedId.docId,
            grnDate: dayjs(selectedId.docDate).format("YYYY-MM-DD"),
            entryNo: selectedId.entryNo,
            entryDate: dayjs(selectedId.entryDate).format("YYYY-MM-DD"),
            gatePassDate: dayjs(selectedId.docDate).format("YYYY-MM-DD"),
            supplierShortName: selectedId.supplierShortName,
            supplier: selectedId.supplier,
            carrier: selectedId.carrier,
            modeOfShipment: selectedId.modeOfShipment.toUpperCase(),
            vehicleType: selectedId.vehicleType.toUpperCase(),
            contact: selectedId.contact,
            driverName: selectedId.driverName.toUpperCase(),
            securityName: selectedId.securityName.toUpperCase(),
            lrDate: dayjs(selectedId.lrDate).format("YYYY-MM-DD"),
            briefDesc: selectedId.goodsDescripition.toUpperCase(),
            vehicleNo: selectedId.vehicleNo,
            lotNo: selectedId.lotNo,
            totalGrnQty: selectedId.totalGrnQty,
          }));
          // Optionally call other functions
          // getPutawayGridDetails(selectedPutawayId);
        }
      } else if (name === "binClass" || name === "binPick") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      } else if (name === "status" || name === "core") {
        setFormData({
          ...formData,
          [name]: name === "core" ? initCaps(value) : value,
        });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: "" });

      // Restore cursor position after state update, only for inputs that support text selection
      setTimeout(() => {
        const inputElement = document.querySelector(`[name=${name}]`);
        if (
          inputElement &&
          (inputElement.tagName === "INPUT" ||
            inputElement.tagName === "TEXTAREA") &&
          (type === "text" ||
            type === "password" ||
            type === "search" ||
            type === "tel" ||
            type === "url")
        ) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleDeleteRow = (id) => {
    setPutAwayDetailsTableData(
      putAwayDetailsTableData.filter((row) => row.id !== id)
    );
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === putAwayDetailsTableData) {
      return (
        !lastRow.partNo || !lastRow.partDesc || !lastRow.batchNo || !lastRow.qty
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === putAwayDetailsTableData) {
      setPutAwayTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          partNo: !table[table.length - 1].partNo ? "Part No is required" : "",
          partDesc: !table[table.length - 1].partDesc
            ? "Part Desc is required"
            : "",
          // batchNo: !table[table.length - 1].batchNo ? 'Batch No is required' : '',
          qty: !table[table.length - 1].qty ? "Qty is required" : "",
        };
        return newErrors;
      });
    }
  };
  const handleKeyDown = (e, row) => {
    if (
      e.key === "Tab" &&
      row.id === putAwayDetailsTableData[putAwayDetailsTableData.length - 1].id
    ) {
      handleAddRow();
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format("DD-MM-YYYY");
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const handleClear = () => {
    setFormData({
      binClass: "Fixed",
      binPick: "Empty",
      binType: "",
      branch: loginBranch,
      branchCode: loginBranchCode,
      briefDesc: "",
      carrier: "",
      client: loginClient,
      contact: "",
      core: "Multi",
      createdBy: loginUserName,
      customer: loginCustomer,
      docDate: dayjs(),
      enteredPerson: "",
      driverName: "",
      entryNo: "",
      entryDate: null,
      finYear: "2024",
      grnDate: null,
      grnNo: "",
      lotNo: "",
      modeOfShipment: "",
      orgId: orgId,
      status: "Edit",
      securityName: "",
      supplier: "",
      supplierShortName: "",
      totalGrnQty: "",
      vehicleType: "",
      vehicleNo: "",
      warehouse: loginWarehouse,
    });
    setPutAwayDetailsTableData([
      {
        id: 1,
        batch: "",
        bin: "",
        binType: "",
        cellType: "",
        grnQty: "",
        invNo: "",
        invQty: "",
        partDesc: "",
        partNo: "",
        batchNo: "",
        pQty: "",
        recQty: "",
        remarks: "",
        sku: "",
        ssku: "",
      },
    ]);
    setPutAwayTableErrors("");
    setFieldErrors({
      binClass: "",
      binPick: "",
      binType: "",
      branch: loginBranch,
      branchCode: loginBranchCode,
      carrier: "",
      client: loginClient,
      core: "",
      createdBy: loginUserName,
      customer: loginCustomer,
      enteredPerson: "",
      entryNo: "",
      entryDate: null,
      finYear: "",
      grnDate: null,
      grnNo: "",
      lotNo: "",
      modeOfShipment: "",
      orgId: orgId,
      status: "",
      supplier: "",
      supplierShortName: "",
      warehouse: loginWarehouse,
    });
    getPutAwayDocId();
    // setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    let firstInvalidFieldRef = null;
    if (!formData.grnNo) {
      errors.grnNo = "Grn No is required";
    }
    if (!formData.binType) {
      errors.binType = "Bin Type is required";
    }
    if (!formData.status) {
      errors.status = "Status is required";
    }
    // if (!formData.binClass) {
    //   errors.binClass = 'Bin Class is required';
    // }
    // if (!formData.binPick) {
    //   errors.binPick = 'Bin Pick is required';
    // }

    let putAwayDetailsTableDataValid = true;
    const newTableErrors = putAwayDetailsTableData.map((row, index) => {
      const rowErrors = {};
      // if (!row.batchNo) {
      //   rowErrors.batchNo = 'Batch No is required';
      //   putAwayDetailsTableDataValid = false;
      // }
      if (!row.sku) {
        rowErrors.sku = "Sku is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].sku;
        putAwayDetailsTableDataValid = false;
      }
      // if (!row.putAwayQty) {
      //   rowErrors.putAwayQty = 'PutAwayQty is required';
      //   putAwayDetailsTableDataValid = false;
      // }
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].bin;
        putAwayDetailsTableDataValid = false;
      }

      return rowErrors;
    });

    if (!putAwayDetailsTableDataValid || Object.keys(errors).length > 0) {
      // Focus on the first invalid field
      if (firstInvalidFieldRef && firstInvalidFieldRef.current) {
        firstInvalidFieldRef.current.focus();
      }
    } else {
      // Proceed with form submission
    }

    setPutAwayTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && putAwayDetailsTableDataValid) {
      setIsLoading(true);
      const putAwayDetailsDTO = putAwayDetailsTableData.map((row) => ({
        batch: row.batchNo,
        batchDate: row.batchDate,
        bin: row.bin,
        binType: row.binType,
        cellType: row.cellType,
        expdate: row.expDate,
        grnQty: row.grnQty,
        invoiceNo: row.invoiceNo,
        invQty: row.invQty,
        partDesc: row.partDesc,
        partNo: row.partNo,
        putAwayQty: row.pQty,
        recQty: row.recQty,
        remarks: row.remarks,
        sku: row.sku,
        ssku: row.ssku,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        binClass: formData.binClass,
        binPick: formData.binPick,
        binType: formData.binType,
        branch: loginBranch,
        branchCode: loginBranchCode,
        carrier: formData.carrier,
        contact: formData.contact,
        client: loginClient,
        core: formData.core,
        createdBy: loginUserName,
        customer: loginCustomer,
        // docDate: dayjs(),
        driverName: formData.driverName,
        enteredPerson: formData.enteredPerson,
        entryDate: formData.entryDate,
        entryNo: formData.entryNo,
        finYear: loginFinYear,
        grnDate: formData.grnDate,
        grnNo: formData.grnNo,
        lotNo: formData.lotNo,
        modeOfShipment: formData.modeOfShipment,
        orgId: orgId,
        putAwayDetailsDTO,
        status: formData.status,
        supplier: formData.supplier,
        supplierShortName: formData.supplierShortName,
        vehicleType: formData.vehicleType,
        vehicleNo: formData.vehicleNo,
        warehouse: loginWarehouse,
      };

      console.log("DATA TO SAVE IS:", saveFormData);
      try {
        const response = await axios.put(
          `${API_URL}/putaway/createUpdatePutAway`,
          saveFormData
        );
        if (response.status === true) {
          console.log("Response:", response);
          handleClear();
          showToast(
            "success",
            editId
              ? " Put Away Updated Successfully"
              : "Put Away created successfully"
          );
          setIsLoading(false);
          getAllPutAway();
          getGrnForPutaway();
        } else {
          showToast(
            "error",
            response.paramObjectsMap.errorMessage || "Put Away creation failed"
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "Put Away creation failed");
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleTableChange = () => {};

  const handleView = () => {
    setListView(!listView);
    setDownloadPdf(false);
  };

  const handleClose = () => {
    setFormData({
      binClass: "",
      binPick: "",
      binType: "",
      branch: loginBranch,
      branchCode: loginBranchCode,
      carrier: "",
      client: loginClient,
      core: "",
      createdBy: loginUserName,
      customer: loginCustomer,
      enteredPerson: "",
      entryNo: "",
      entryDate: null,
      finYear: "",
      grnDate: null,
      grnNo: "",
      lotNo: "",
      modeOfShipment: "",
      orgId: orgId,
      status: "",
      supplier: "",
      supplierShortName: "",
      warehouse: loginWarehouse,
    });
  };

  const GeneratePdf = (row) => {
    console.log("PDF-Data =>", row.original);
    setPdfData(row.original);
    setDownloadPdf(true);
  };
  const handleBulkUploadOpen = () => {
    setUploadOpen(true); // Open dialog
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false); // Close dialog
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    handleBulkUploadClose();
  };

  return (
    <ConfigProvider theme={themeConfig}>
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
              <div className="form-containerSG">
                <div
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
                      style={{
                        color: "#fff",
                        margin: 0,
                        alignItems: "center",
                      }}
                    >
                      Putaway
                    </Typography.Title>
                    <Typography.Text
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Create and manage Putaway operations
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
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => console.log("Search Clicked")}
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
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Clear
                </Button>
                {!formData.freeze && (
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isLoading}
                    style={{
                      background: "rgba(108, 99, 255, 0.7)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Save
                  </Button>
                )}
                <Button
                  // icon={<PrinterOutlined />}
                  // onClick={handlePrint}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Print
                </Button>
              </div>

              {/* Main Form */}
              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
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
                      tab="Basic Information"
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
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Putaway No
                                  </span>
                                }
                              >
                                <Input
                                  name="putawayNo"
                                  value={formData.putawayNo}
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
                                    Putaway Date *
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
                                  className="white-datepicker"
                                  value={
                                    formData.putawayDate
                                      ? dayjs(formData.putawayDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("putawayDate", date)
                                  }
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GRN No *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  value={formData.grnNo}
                                  onChange={(value) => {
                                    const selectedGrn = grnList.find(
                                      (grn) => grn.docId === value
                                    );
                                    setFormData({
                                      ...formData,
                                      grnNo: value,
                                      grnDate: selectedGrn?.docDate || null,
                                      supplier: selectedGrn?.supplier || "",
                                      totalGrnQty: selectedGrn?.totalQty || "",
                                    });
                                  }}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {grnList?.map((row) => (
                                    <Option key={row.id} value={row.docId}>
                                      {row.docId}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GRN Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  className="white-datepicker"
                                  value={
                                    formData.grnDate
                                      ? dayjs(formData.grnDate)
                                      : null
                                  }
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier
                                  </span>
                                }
                              >
                                <Input
                                  name="supplier"
                                  value={formData.supplier}
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
                          </Row>

                          {/* Second Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Status</span>
                                }
                              >
                                <Input
                                  name="status"
                                  value={formData.status}
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
                                    Created By
                                  </span>
                                }
                              >
                                <Input
                                  name="createdBy"
                                  value={formData.createdBy}
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
                                    Created On
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  className="white-datepicker"
                                  value={
                                    formData.createdOn
                                      ? dayjs(formData.createdOn)
                                      : null
                                  }
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Total Qty
                                  </span>
                                }
                              >
                                <Input
                                  name="totalQty"
                                  value={formData.totalGrnQty}
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
                                  <span style={{ color: "#fff" }}>Remarks</span>
                                }
                              >
                                <Input
                                  name="remarks"
                                  value={formData.remarks}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
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
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Class
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.binClass}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      binClass: value,
                                    })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Fixed">Fixed</Option>
                                  <Option value="Floating">Floating</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Pick
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.binPick}
                                  onChange={(value) =>
                                    setFormData({ ...formData, binPick: value })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Empty">Empty</Option>
                                  <Option value="Occupied">Occupied</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Type
                                  </span>
                                }
                              >
                                <Input
                                  name="binType"
                                  value={formData.binType}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
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
                                  <span style={{ color: "#fff" }}>Core</span>
                                }
                              >
                                <Select
                                  value={formData.core}
                                  onChange={(value) =>
                                    setFormData({ ...formData, core: value })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Multi">Multi</Option>
                                  <Option value="Single">Single</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>

                    <TabPane tab="Additional Information" key="2">
                      <div
                        style={{
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "20px",
                          padding: "20px",
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <Form layout="vertical">
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.supplierShortName}
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
                                    Vehicle Type
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleType"
                                  value={formData.vehicleType}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
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
                                    Vehicle No
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleNo"
                                  value={formData.vehicleNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>

                            {/* Second Row - 6 columns */}

                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Security Person Name
                                  </span>
                                }
                              >
                                <Input
                                  name="securityName"
                                  value={formData.securityName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
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
                                    Driver Name
                                  </span>
                                }
                              >
                                <Input
                                  name="driverName"
                                  value={formData.driverName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
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
                  </Tabs>
                </div>
              </div>
              {/* Table Section */}
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
                    {!formData.freeze && (
                      <Button
                        icon={<PlusOutlined />}
                        onClick={handleAddRow}
                        style={{
                          marginRight: "8px",
                          background: "rgba(108, 99, 255, 0.3)",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Add Row
                      </Button>
                    )}
                    <Button
                      icon={<ClearOutlined />}
                      style={{
                        marginRight: "8px",
                        background: "rgba(255, 99, 132, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      style={{
                        marginRight: "8px",
                        background: "rgba(108, 99, 255, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Fill from GRN
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
                      <col style={{ width: "120px" }} /> {/* Batch No */}
                      <col style={{ width: "120px" }} /> {/* Batch Date */}
                      <col style={{ width: "120px" }} /> {/* Exp Date */}
                      <col style={{ width: "100px" }} /> {/* GRN Qty */}
                      <col style={{ width: "100px" }} /> {/* Putaway Qty */}
                      <col style={{ width: "120px" }} /> {/* Location */}
                    </colgroup>
                    <thead>
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
                          Part Desc
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
                          GRN Qty
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Putaway Qty *
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Location *
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {putawayItems.map((row, index) => (
                        <tr
                          key={`row-${index}-${row.id}`}
                          style={{
                            borderBottom: "1px dashed white",
                            color: "white",
                          }}
                        >
                          {/* Action */}
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleDeleteRow(
                                  row.id,
                                  putawayItems,
                                  setPutawayItems
                                )
                              }
                              danger
                              type="text"
                              style={{ color: "#ff4d4f" }}
                              disabled={formData.freeze}
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
                            <Input
                              value={row.partNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "partNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Part Desc */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.partDesc}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Batch No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.batchNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "batchNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Batch Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.batchDate ? dayjs(row.batchDate) : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "batchDate",
                                  date ? date.format("YYYY-MM-DD") : null
                                )
                              }
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Exp Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={row.expDate ? dayjs(row.expDate) : null}
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "expDate",
                                  date ? date.format("YYYY-MM-DD") : null
                                )
                              }
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* GRN Qty */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.grnQty}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Putaway Qty */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.putawayQty}
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Location */}
                          <td style={{ padding: "8px" }}>
                            <Select
                              showSearch
                              style={selectStyle}
                              placeholder="Select Location"
                              optionFilterProp="children"
                              value={row.location}
                              onChange={(value) =>
                                handleTableChange(row.id, "location", value)
                              }
                              disabled={formData.freeze}
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {locationList.map((loc) => (
                                <Option key={loc.id} value={loc.name}>
                                  {loc.name}
                                </Option>
                              ))}
                            </Select>
                          </td>
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
                      Total Putaway Qty: {formData.totalPutawayQty}
                    </Typography.Text>
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
                          fontWeight: "500",
                        }}
                      >
                        Putaway Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Putaway No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        GRN No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Warehouse
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
                        Total Qty
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "white",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.map((row, index) => (
                      <tr
                        key={`row-${index}-${row.id}`}
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
                          {dayjs(row.putawayDate).format("DD-MM-YYYY")}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {row.putawayNo}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {row.grnNo}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {row.warehouse}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {row.status}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {row.totalQty}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          <Button type="link" style={{ color: "#1890ff" }}>
                            View
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

// Styles
const inputStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
};

const readOnlyInputStyle = {
  ...inputStyle,
  color: "rgba(255, 255, 255, 0.7)",
};

const selectStyle = {
  ...inputStyle,
  width: "100%",
};

const datePickerStyle = {
  ...inputStyle,
  width: "100%",
};

export default Putaway;
