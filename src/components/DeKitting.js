import {
  CloudUploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  DeleteOutlined,
  TableOutlined,
  FormOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import {
  Button,
  Card,
  Table,
  Modal,
  Pagination,
  Spin,
  message,
  Tabs,
  Row,
  Col,
  ConfigProvider,
  Checkbox,
  Form,
  Input,
  DatePicker,
  Select,
  Typography,
} from "antd";

import ClearIcon from "@mui/icons-material/Clear";
import FormatListBulletedTwoToneIcon from "@mui/icons-material/FormatListBulletedTwoTone";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

// For Material-UI components:
import { TextField, FormControl, Box, Tab } from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { showToast } from "../utils/toast-component";

import axios from "axios";
import ActionButton from "../utils/ActionButton";
const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const DeKitting = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem("orgId")));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState("");
  const [partNoList, setPartNoList] = useState([]);
  const [batchNoList, setBatchNoList] = useState([]);
  const [binsData, setBinsData] = useState([]);
  const [docId, setDocId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );

  const [searchParams, setSearchParams] = useState({
    fromDate: dayjs().startOf("month"),
    toDate: dayjs(),
    docId: "",
    status: "ALL",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [client, setClient] = useState(localStorage.getItem("client"));
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  // const [finYear, setFinYear] = useState(localStorage.getItem('finYear') ? localStorage.getItem('finYear') : '2024');
  const [finYear, setFinYear] = useState("2024");
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [value, setValue] = useState(0);
  const [partNoOptions, setPartNoOptions] = useState([]);
  const [formData, setFormData] = useState({
    docId: docId,
    docDate: dayjs(),
    active: true,
    freeze: false,
  });
  const [parentTable, setParentTable] = useState([
    {
      id: 1,
      partNo: "",
      partDesc: "",
      batchDate: "",
      batchNo: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      bin: "",
      expDate: "",
      avlQty: "",
      qty: "",
    },
  ]);

  // const lrNoDetailsRefs = useRef(
  //   parentTable.map(() => ({
  //     partNo: React.createRef(),
  //     qty: React.createRef()
  //   }))
  // );

  // useEffect(() => {
  //   // If the length of the table changes, update the refs
  //   if (lrNoDetailsRefs.current.length !== parentTable.length) {
  //     lrNoDetailsRefs.current = parentTable.map(
  //       (_, index) =>
  //         lrNoDetailsRefs.current[index] || {
  //           partNo: React.createRef(),
  //           qty: React.createRef()
  //         }
  //     );
  //   }
  // }, [parentTable.length]);

  const lrNoDetailsRefs = useRef([]);

  useEffect(() => {
    lrNoDetailsRefs.current = parentTable.map((_, index) => ({
      partNo: lrNoDetailsRefs.current[index]?.partNo || React.createRef(),
      qty: lrNoDetailsRefs.current[index]?.qty || React.createRef(),
    }));
  }, [parentTable]);

  const [childTable, setChildTable] = useState([
    {
      id: 1,
      partNo: "",
      partDesc: "",
      batchNo: "",
      batchDate: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      lotNo: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
      qty: "",
    },
  ]);

  const formatDate = (date) => {
    return dayjs(date).format("DD/MM/YYYY"); // Format to DD/MM/YYYY
  };

  const today = formatDate(new Date());

  const handleAddRow = () => {
    if (isLastRowEmpty(parentTable)) {
      displayRowError(parentTable);
      return;
    }
    const newRow = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      batchDate: "",
      batchNo: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      bin: "",
      expDate: "",
      avlQty: "",
      qty: "",
    };
    setParentTable([...parentTable, newRow]);
    setParentTableErrors([
      ...parentTableErrors,
      {
        partNo: "",
        partDesc: "",
        batchDate: "",
        batchNo: "",
        bin: "",
        binClass: "",
        binType: "",
        cellType: "",
        core: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        bin: "",
        expDate: "",
        avlQty: "",
        qty: "",
      },
    ]);
  };
  const handleAddRow1 = () => {
    const newRow = {
      id: Date.now(),
      partNo: "",
      partDesc: "",
      batchNo: "",
      batchDate: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      lotNo: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
      qty: "",
    };
    setChildTable([...childTable, newRow]);
    setChildTableErrors([
      ...childTableErrors,
      {
        partNo: "",
        partDesc: "",
        batchNo: "",
        batchDate: "",
        bin: "",
        binClass: "",
        binType: "",
        cellType: "",
        core: "",
        lotNo: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        expDate: "",
        qty: "",
      },
    ]);
    getDocId();
  };

  const [parentTableErrors, setParentTableErrors] = useState([
    {
      partNo: "",
      partDesc: "",
      batchDate: "",
      batchNo: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      bin: "",
      expDate: "",
      avlQty: "",
      qty: "",
    },
  ]);
  const [childTableErrors, setChildTableErrors] = useState([
    {
      partNo: "",
      partDesc: "",
      batchNo: "",
      batchDate: "",
      bin: "",
      binClass: "",
      binType: "",
      cellType: "",
      core: "",
      lotNo: "",
      sku: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
      qty: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: "",
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: "docId", header: "Document No", size: 140 },
    { accessorKey: "docDate", header: "Document Date", size: 140 },
  ];

  const [listViewData, setListViewData] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  useEffect(() => {
    getDocId();
    getAllDeKittingByOrgId();
    getAllPartNo();
    getAllBinDetails();
    getAllChildPart();
  }, []);

  const getAllBinDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllBinDetails?warehouse=${warehouse}&branchCode=${branchCode}&client=${client}&orgId=${orgId}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        console.log(
          "response.paramObjectsMap.Bins:",
          response.paramObjectsMap.Bins
        );
        setBinsData(response.paramObjectsMap.Bins);
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
        `${API_URL}/api/deKitting/getPartNoFromStockForDeKittingParent?branch=${branch}&branchCode=${branchCode}&client=${client}&orgId=${orgId}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        console.log("paramObjectsMap:", response.paramObjectsMap);

        const partData = response.paramObjectsMap.partNoDetails.map(
          ({ partNo, partDesc, sku }) => ({ partNo, partDesc, sku })
        );

        setPartNoList(partData);
      } else {
        console.error("API Error:", response);
        return response;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  };

  const handlePartNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedPartNo = partNoList.find((p) => p.partNo === value);
    setParentTable((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              partNo: value,
              partDesc: selectedPartNo ? selectedPartNo.partDesc : "",
              sku: selectedPartNo ? selectedPartNo.sku : "",
            }
          : r
      )
    );
    setParentTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        partNo: !value ? "Part No is required" : "",
      };
      return newErrors;
    });

    if (value) {
      getGrnNo(value, row);
    }
  };

  const getGrnNo = async (selectedRowPartNo, row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getGrnDetailsForDekittingParent?branch=${branch}&branchCode=${branchCode}&client=${client}&orgId=${orgId}&partNo=${selectedRowPartNo}`
      );
      console.log("THE FROM GRN NO LIST IS:", response);
      if (response.status === true) {
        setParentTable((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowGrnNoList: response.paramObjectsMap.grnDetails,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleGrnNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedGrnNo = row.rowGrnNoList.find((row) => row.grnNo === value);
    setParentTable((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              grnNo: selectedGrnNo.grnNo,
              grnDate: selectedGrnNo ? selectedGrnNo.grnDate : "",
            }
          : r
      )
    );
    setParentTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        grnNo: !value ? "GRN No is required" : "",
      };
      return newErrors;
    });
    getBatchNo(row.partNo, value, row);
  };

  const getBatchNo = async (selectedPartNo, selectedGrnNo, row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getBatchNoForDeKittingParent?branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${selectedGrnNo}&orgId=${orgId}&partNo=${selectedPartNo}`
      );
      console.log("getBatchNoForDeKittingParent IS:", response);
      if (response.status === true) {
        setParentTable((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowBatchNoList: response.paramObjectsMap.batchDetails,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleBatchNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedBatchNo = row.rowBatchNoList.find(
      (row) => row.batchNo === value
    );
    setParentTable((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              batchNo: selectedBatchNo.batchNo,
              batchDate: selectedBatchNo ? selectedBatchNo.batchDate : "",
              expDate: selectedBatchNo ? selectedBatchNo.expDate : "",
            }
          : r
      )
    );
    setParentTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        batchNo: !value ? "Batch No is required" : "",
      };
      return newErrors;
    });
    getBinDetails(value, row.grnNo, row.partNo, row);
  };

  const getBinDetails = async (
    selectedBatchNo,
    selectedGrnNo,
    selectedPartNo,
    row
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getBinForDeKittingParent?batchNo=${selectedBatchNo}&branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${selectedGrnNo}&orgId=${orgId}&partNo=${selectedPartNo}`
      );
      console.log("THE TO BIN LIST ARE:", response);
      if (response.status === true) {
        setParentTable((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowBinList: response.paramObjectsMap.binDetails,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleBinChange = (row, index, event) => {
    const value = event.target.value;

    console.log("THE ROW.PARTNO IS:", row);

    const selectedBin = row.rowBinList.find((bin) => bin.bin === value);

    setParentTable((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              bin: value,
              binType: selectedBin ? selectedBin.binType : "",
              binClass: selectedBin ? selectedBin.binclass : "",
              cellType: selectedBin ? selectedBin.celltype : "",
              core: selectedBin ? selectedBin.core : "",
            }
          : r
      )
    );

    setParentTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        bin: !value ? "Bin is required" : "",
      };
      return newErrors;
    });

    getAvlQty(row.batchNo, value, row.grnNo, row.partNo, row);
  };

  const getAvlQty = async (
    selectedBatchNo,
    selectedBin,
    selectedGrnNo,
    selectedPartNo,
    row
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getAvlQtyForDeKittingParent?batchNo=${selectedBatchNo}&bin=${selectedBin}&branch=${branch}&branchCode=${branchCode}&client=${client}&grnNo=${selectedGrnNo}&orgId=${orgId}&partNo=${selectedPartNo}`
      );
      console.log("THE ROW. TO BIN IS IS:", selectedBin);
      console.log("avlQty", response.paramObjectsMap.avlQty);

      setParentTable((prevData) =>
        prevData.map((r) =>
          r.id === row.id
            ? {
                ...r,
                avlQty: response.paramObjectsMap.avlQty,
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error fetching locationType data:", error);
    }
  };

  const getAllDeKittingByOrgId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getAllDeKittingByOrgId?orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}&finYear=${finYear}&warehouse=${warehouse}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.deKittingVO);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllChildPart = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getPartNoforDeKittingChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        const options = response.paramObjectsMap.partNoChild.map((item) => ({
          partNo: item.partNo,
          partDesc: item.partDesc,
          sku: item.sku,
        }));
        setPartNoOptions(options);
        console.log("Mapped Part No Options:", options);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const appendGNToDocumentId = (docId) => {
    const index = docId.indexOf("DK");
    if (index !== -1) {
      return `${docId.slice(0, index + 2)}GN${docId.slice(index + 2)}`;
    }
    return docId;
  };

  useEffect(() => {
    console.log("childTable has been updated:", childTable);
  }, [childTable]);

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getDeKittingDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setDocId(response.paramObjectsMap.deKittingDocId);
        setFormData((prevFormData) => ({
          ...prevFormData,
          docId: response.paramObjectsMap.deKittingDocId,
        }));
        const modifiedDocId = appendGNToDocumentId(
          response.paramObjectsMap.deKittingDocId
        );
        console.log("Modified docId:", modifiedDocId);

        setChildTable((prevParentTableData) =>
          prevParentTableData.map((row) => ({
            ...row,
            grnNo: modifiedDocId,
          }))
        );

        // setChildTable((prevParentTableData) =>
        //   prevParentTableData.map((row) => ({
        //     ...row,
        //     grnNo: modifiedDocId // Set the same grnNo for all rows
        //   }))
        // );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDeKittingById = async (row) => {
    console.log("THE SELECTED DEKITTING ID IS:", row.original.id);
    setEditId(row.original.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/deKitting/getDeKittingById?id=${row.original.id}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListView(false);
        const particularDekitting = response.paramObjectsMap.deKittingVO;
        console.log("THE PARTICULAR DeKitting IS:", particularDekitting);
        getAllBinDetails();
        setFormData({
          docId: particularDekitting.docId,
          docDate: particularDekitting.docDate
            ? dayjs(particularDekitting.docDate)
            : dayjs(),
          active: particularDekitting.active === true,
          customer: particularDekitting.customer,
          branch: particularDekitting.branch,
          warehouse: particularDekitting.warehouse,
          freeze: particularDekitting.freeze,
        });

        setParentTable(
          particularDekitting.deKittingParentVO.map((detail) => ({
            id: detail.id,
            partNo: detail.partNo || "",
            partDesc: detail.partDesc || "",
            batchNo: detail.batchNo || "",
            batchDate: detail.batchDate || "",
            bin: detail.bin || "",
            binType: detail.binType || "",
            cellType: detail.cellType || "",
            core: detail.core || "",
            sku: detail.sku || "",
            grnNo: detail.grnNo || "",
            grnDate: detail.grnDate || "",
            expDate: detail.expDate || "",
            qty: detail.qty || "",
          }))
        );

        setChildTable(
          particularDekitting.deKittingChildVO.map((detail) => ({
            id: detail.id,
            partNo: detail.partNo || "",
            partDesc: detail.partDesc || "",
            batchNo: detail.batchNo || "",
            batchDate: detail.batchDate || "",
            bin: detail.bin || "",
            sku: detail.sku || "",
            grnNo: detail.grnNo || "",
            grnDate: detail.grnDate || "",
            expDate: detail.expDate || "",
            qty: detail.qty || "",
          }))
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    let errorMessage = "";

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      if (name === "active") {
        setFormData({ ...formData, [name]: checked });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleDeleteRow = (id) => {
    setParentTable(parentTable.filter((row) => row.id !== id));
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === parentTable) {
      return (
        !lastRow.partNo ||
        !lastRow.grnNo ||
        !lastRow.batchNo ||
        !lastRow.bin ||
        !lastRow.qty
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === parentTable) {
      setParentTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          partNo: !table[table.length - 1].partNo ? "Part No is required" : "",
          grnNo: !table[table.length - 1].grnNo ? "Grn No is required" : "",
          batchNo: !table[table.length - 1].batchNo
            ? "Batch No is required"
            : "",
          bin: !table[table.length - 1].bin ? "Bin is required" : "",
          qty: !table[table.length - 1].qty ? "Qty is required" : "",
        };
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === "Tab" && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      } else {
        handleAddRow();
      }
    }
  };
  const handleDeleteRow1 = (id) => {
    setChildTable(childTable.filter((row) => row.id !== id));
  };

  const handleClear = () => {
    setFormData({ docDate: dayjs() });
    setEditId("");
    setParentTable([
      {
        id: 1,
        partNo: "",
        partDesc: "",
        batchDate: "",
        batchNo: "",
        bin: "",
        binClass: "",
        binType: "",
        cellType: "",
        core: "",
        sku: "",
        grnNo: "",
        grnDate: "",
        bin: "",
        expDate: "",
        avlQty: "",
        qty: "",
      },
    ]);
    setChildTable([
      {
        id: 1,
        partNo: "",
        partDesc: "",
        batchNo: "",
        batchDate: "",
        bin: "",
        binClass: "",
        binType: "",
        cellType: "",
        core: "",
        lotNo: "",
        sku: "",
        // grnNo: '',
        grnDate: "",
        expDate: "",
        qty: "",
      },
    ]);
    setFieldErrors({
      docId: "",
      docDate: "",
    });
    getDocId();
  };

  const handleSave = async () => {
    // if (editId) {
    //   showToast('error', 'Save is not allowed while editing an existing record');
    //   return;
    // }

    const errors = {};
    let firstInvalidFieldRef = null;

    if (!formData.docId) {
      errors.docId = "Doc Id is required";
    }

    let parentTableDataValid = true;
    const newTableErrors = parentTable.map((row, index) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].partNo;
        parentTableDataValid = false;
      }
      if (!row.qty) {
        rowErrors.qty = "Qty is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].qty;
        parentTableDataValid = false;
      }
      return rowErrors;
    });
    setFieldErrors(errors);

    if (!parentTableDataValid || Object.keys(errors).length > 0) {
      // Focus on the first invalid field
      if (firstInvalidFieldRef && firstInvalidFieldRef.current) {
        firstInvalidFieldRef.current.focus();
      }
    } else {
      // Proceed with form submission
    }

    setParentTableErrors(newTableErrors);

    let childTableDataValid = true;
    const newTableErrors1 = childTable.map((row) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        childTableDataValid = false;
      }
      if (!row.qty) {
        rowErrors.qty = "Qty is required";
        childTableDataValid = false;
      }
      return rowErrors;
    });
    setFieldErrors(errors);
    setChildTableErrors(newTableErrors1);

    if (
      Object.keys(errors).length === 0 &&
      childTableDataValid &&
      parentTableDataValid
    ) {
      setIsLoading(true);
      const ParentVO = parentTable.map((row) => ({
        avlQty: parseInt(row.avlQty),
        batchDate: row.batchDate,
        batchNo: row.batchNo,
        bin: row.bin,
        binClass: row.binClass,
        binType: row.binType,
        cellType: row.cellType,
        core: row.core,
        expDate: row.expDate,
        grnDate: row.grnDate,
        grnNo: row.grnNo,
        partNo: row.partNo,
        partDesc: row.partDesc,
        qty: parseInt(row.qty),
        sku: row.sku,
      }));
      const childVO = childTable.map((row) => ({
        batchDate: row.batchDate,
        batchNo: row.batchNo,
        bin: row.bin,
        binClass: row.binClass,
        binType: row.binType,
        cellType: row.cellType,
        core: row.core,
        expDate: row.expDate,
        grnDate: row.grnDate,
        grnNo: row.grnNo,
        partNo: row.partNo,
        partDesc: row.partDesc,
        qty: parseInt(row.qty),
        sku: row.sku,
      }));

      const saveFormData = {
        branch: branch,
        branchCode: branchCode,
        client: client,
        createdBy: loginUserName,
        customer: customer,
        deKittingChildDTO: childVO,
        deKittingParentDTO: ParentVO,
        finYear: finYear,
        orgId: orgId,
        warehouse: warehouse,
      };

      console.log("DATA TO SAVE IS:", saveFormData);
      try {
        const response = await axios.put(
          `${API_URL}/deKitting/createUpdateDeKitting`,
          saveFormData
        );
        if (response.status === true) {
          console.log("Response:", response);
          handleClear();
          showToast("success", "De-Kitting created successfully");
          getAllDeKittingByOrgId();
          setIsLoading(false);
        } else {
          showToast(
            "error",
            response.paramObjectsMap.errorMessage ||
              "De-Kitting creation failed"
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "De-Kitting creation failed");
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
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
        {isLoading && (
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
            <Spin size="large" tip="Loading..." />
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
          {listView ? (
            <div
              style={{
                padding: "20px",
                marginTop: "20px",
                display: "revert",
                placeContent: "center",
                overflowY: "none",
                minHeight: "20dvh",
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
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{ color: "#fff", margin: 0 }}
                  >
                    De-Kitting List
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    View and manage de-kitting entries
                  </Typography.Text>
                </div>
                <div>
                  <Button
                    icon={<FormOutlined />}
                    onClick={() => setListView(false)}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Form View
                  </Button>
                </div>
              </div>

              {/* Search Filters */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>From Date</span>}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        value={dayjs(searchParams.fromDate)}
                        onChange={(date) =>
                          setSearchParams({
                            ...searchParams,
                            fromDate: date,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>To Date</span>}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        value={dayjs(searchParams.toDate)}
                        onChange={(date) =>
                          setSearchParams({
                            ...searchParams,
                            toDate: date,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Document No</span>}
                    >
                      <Input
                        value={searchParams.docId}
                        onChange={(e) =>
                          setSearchParams({
                            ...searchParams,
                            docId: e.target.value,
                          })
                        }
                        placeholder="Enter document no"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={<span style={{ color: "#fff" }}>Status</span>}
                    >
                      <Select
                        value={searchParams.status}
                        onChange={(value) =>
                          setSearchParams({
                            ...searchParams,
                            status: value,
                          })
                        }
                        style={{ width: "100%" }}
                      >
                        <Option value="ALL">All</Option>
                        <Option value="PENDING">Pending</Option>
                        <Option value="COMPLETED">Completed</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: "right", marginTop: "16px" }}>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => {
                      // Implement search functionality
                      console.log("Search clicked", searchParams);
                    }}
                    style={{ marginRight: "8px" }}
                  >
                    Search
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={() => {
                      setSearchParams({
                        fromDate: dayjs().startOf("month"),
                        toDate: dayjs(),
                        docId: "",
                        status: "ALL",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div
                style={{
                  marginTop: "20px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Table
                  columns={listViewColumns.map((col) => ({
                    title: col.title,
                    dataIndex: col.dataIndex,
                    key: col.key,
                    width: col.width,
                    render: col.render,
                  }))}
                  dataSource={listViewData}
                  rowKey="id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: listViewData.length,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                  }}
                  scroll={{ x: true }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                marginTop: "20px",
                display: "revert",
                placeContent: "center",
                overflowY: "none",
                minHeight: "20dvh",
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
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{ color: "#fff", margin: 0 }}
                  >
                    De-Kitting
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage de-kitting entries
                  </Typography.Text>
                </div>
                <div>
                  <Button
                    icon={<TableOutlined />}
                    onClick={() => setListView(true)}
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
              <div className="action-buttons" style={{ marginTop: 16 }}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                    marginRight: 8,
                  }}
                >
                  Clear
                </Button>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => console.log("Search Clicked")}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                    marginRight: 8,
                  }}
                >
                  Search
                </Button>
                {!formData.freeze && (
                  <Button
                    icon={<SaveOutlined />}
                    loading={isLoading}
                    onClick={!editId ? handleSave : undefined}
                    type="primary"
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Save
                  </Button>
                )}
              </div>

              {/* Main Form */}
              <div className="form-sections">
                <Tabs
                  defaultActiveKey="1"
                  className="white-tabs"
                  activeKey={value.toString()}
                  onChange={(key) => handleChange(null, parseInt(key))}
                >
                  <TabPane tab="De-Kitting Parent" key="0">
                    <div className="form-section-card">
                      <Form layout="vertical">
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
                        </Row>
                      </Form>
                    </div>

                    {/* Parent Items Table */}
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
                            justifyContent: "flex-end",
                            marginBottom: "16px",
                          }}
                        >
                          {!editId && (
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
                              {!editId && <col style={{ width: "50px" }} />}
                              <col style={{ width: "50px" }} />
                              <col style={{ width: "120px" }} />
                              <col style={{ width: "200px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              {!editId && <col style={{ width: "100px" }} />}
                              <col style={{ width: "100px" }} />
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
                                {!editId && (
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                      color: "white",
                                    }}
                                  >
                                    Action
                                  </th>
                                )}
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
                                    padding: "8px",
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
                                  Exp Date
                                </th>
                                {!editId && (
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                      color: "white",
                                    }}
                                  >
                                    Avl Qty
                                  </th>
                                )}
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "white",
                                  }}
                                >
                                  Qty *
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {parentTable.map((row, index) => (
                                <tr
                                  key={row.id}
                                  style={{
                                    borderBottom:
                                      "1px dashed rgba(255, 255, 255, 0.2)",
                                  }}
                                >
                                  {!editId && (
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "center",
                                      }}
                                    >
                                      <Button
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteRow(row.id)}
                                        style={{
                                          color: "#ff4d4f",
                                          background: "transparent",
                                          border: "none",
                                        }}
                                      />
                                    </td>
                                  )}
                                  <td
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.partNo}
                                      onChange={(value) => {
                                        const selectedPart = partNoList.find(
                                          (part) => part.partNo === value
                                        );
                                        if (selectedPart) {
                                          handlePartNoChange(row, index, {
                                            target: { value },
                                          });
                                        }
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">-- Select --</Option>
                                      {partNoList?.map((part) => (
                                        <Option
                                          key={part.id}
                                          value={part.partNo}
                                        >
                                          {part.partNo}
                                        </Option>
                                      ))}
                                    </Select>
                                    {parentTableErrors[index]?.partNo && (
                                      <div className="invalid-feedback">
                                        {parentTableErrors[index].partNo}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.partDesc}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.sku}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.grnNo}
                                      onChange={(value) => {
                                        handleGrnNoChange(row, index, {
                                          target: { value },
                                        });
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">-- Select --</Option>
                                      {Array.isArray(row.rowGrnNoList) &&
                                        row.rowGrnNoList.map(
                                          (g, idx) =>
                                            g &&
                                            g.grnNo && (
                                              <Option
                                                key={g.grnNo}
                                                value={g.grnNo}
                                              >
                                                {g.grnNo}
                                              </Option>
                                            )
                                        )}
                                    </Select>
                                    {parentTableErrors[index]?.grnNo && (
                                      <div className="invalid-feedback">
                                        {parentTableErrors[index].grnNo}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.batchNo}
                                      onChange={(value) => {
                                        handleBatchNoChange(row, index, {
                                          target: { value },
                                        });
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">-- Select --</Option>
                                      {Array.isArray(row.rowBatchNoList) &&
                                        row.rowBatchNoList.map(
                                          (g, idx) =>
                                            g &&
                                            g.batchNo && (
                                              <Option
                                                key={g.batchNo}
                                                value={g.batchNo}
                                              >
                                                {g.batchNo}
                                              </Option>
                                            )
                                        )}
                                    </Select>
                                    {parentTableErrors[index]?.batchNo && (
                                      <div className="invalid-feedback">
                                        {parentTableErrors[index].batchNo}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.bin}
                                      onChange={(value) => {
                                        handleBinChange(row, index, {
                                          target: { value },
                                        });
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">--Select--</Option>
                                      {Array.isArray(row.rowBinList) &&
                                      row.rowBinList.length > 0 ? (
                                        row.rowBinList.map((g) =>
                                          g && g.bin ? (
                                            <Option key={g.bin} value={g.bin}>
                                              {g.bin}
                                            </Option>
                                          ) : null
                                        )
                                      ) : (
                                        <option value="" disabled>
                                          No bins available
                                        </option>
                                      )}
                                    </Select>
                                    {parentTableErrors[index]?.bin && (
                                      <div className="invalid-feedback">
                                        {parentTableErrors[index].bin}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.binType}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="date"
                                      value={row.expDate}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  {!editId && (
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "right",
                                      }}
                                    >
                                      <Input
                                        value={row.avlQty}
                                        readOnly
                                        style={readOnlyInputStyle}
                                      />
                                    </td>
                                  )}
                                  <td
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                    }}
                                  >
                                    <Input
                                      value={row.qty}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setParentTable((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id
                                              ? { ...r, qty: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            qty: !value
                                              ? "Qty is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                    {parentTableErrors[index]?.qty && (
                                      <div className="invalid-feedback">
                                        {parentTableErrors[index].qty}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="De-Kitting Child" key="1">
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
                            justifyContent: "flex-end",
                            marginBottom: "16px",
                          }}
                        >
                          {!editId && (
                            <Button
                              icon={<PlusOutlined />}
                              onClick={handleAddRow1}
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
                              {!editId && <col style={{ width: "50px" }} />}
                              <col style={{ width: "50px" }} />
                              <col style={{ width: "120px" }} />
                              <col style={{ width: "200px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
                              <col style={{ width: "100px" }} />
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
                                {!editId && (
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                      color: "white",
                                    }}
                                  >
                                    Action
                                  </th>
                                )}
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
                                  SKU
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  GRN No
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  GRN Date
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
                                  Batch Date *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
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
                                  Exp Date *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "white",
                                  }}
                                >
                                  Qty *
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {childTable.map((row, index) => (
                                <tr
                                  key={row.id}
                                  style={{
                                    borderBottom:
                                      "1px dashed rgba(255, 255, 255, 0.2)",
                                  }}
                                >
                                  {!editId && (
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "center",
                                      }}
                                    >
                                      <Button
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteRow1(row.id)}
                                        style={{
                                          color: "#ff4d4f",
                                          background: "transparent",
                                          border: "none",
                                        }}
                                      />
                                    </td>
                                  )}
                                  <td
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.partNo}
                                      onChange={(value) => {
                                        const selectedPart = partNoOptions.find(
                                          (option) =>
                                            String(option.partNo) ===
                                            String(value)
                                        );
                                        if (selectedPart) {
                                          setChildTable((prev) => {
                                            return prev.map((r) =>
                                              r.id === row.id
                                                ? {
                                                    ...r,
                                                    partNo: value,
                                                    partDesc:
                                                      selectedPart.partDesc,
                                                    sku: selectedPart.sku,
                                                  }
                                                : r
                                            );
                                          });
                                        }
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            partNo: !value
                                              ? "Part No is required"
                                              : "",
                                            partDescription: !selectedPart
                                              ? "Part Description is required"
                                              : "",
                                            sku: !selectedPart
                                              ? "SKU is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">Select Part No</Option>
                                      {partNoOptions &&
                                        partNoOptions.map((option) => (
                                          <Option
                                            key={option.partNo}
                                            value={option.partNo}
                                          >
                                            {option.partNo}
                                          </Option>
                                        ))}
                                    </Select>
                                    {childTableErrors[index]?.partNo && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].partNo}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.partDesc}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.sku}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.grnNo}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="text"
                                      value={row.grnDate || today}
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.batchNo}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setChildTable((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, batchNo: value }
                                              : r
                                          )
                                        );
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            batchNo: !value
                                              ? "Batch No is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                    {childTableErrors[index]?.batchNo && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].batchNo}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="date"
                                      value={row.batchDate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setChildTable((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, batchDate: value }
                                              : r
                                          )
                                        );
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            batchDate: !value
                                              ? "Batch Date is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                    {childTableErrors[index]?.batchDate && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].batchDate}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.bin}
                                      onChange={(value) => {
                                        const selectedBin = binsData.find(
                                          (bin) => bin.bin === value
                                        );
                                        setChildTable((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? {
                                                  ...r,
                                                  bin: value,
                                                  binClass: selectedBin
                                                    ? selectedBin.binClass
                                                    : "",
                                                  binType: selectedBin
                                                    ? selectedBin.binType
                                                    : "",
                                                  cellType: selectedBin
                                                    ? selectedBin.cellType
                                                    : "",
                                                  core: selectedBin
                                                    ? selectedBin.core
                                                    : "",
                                                }
                                              : r
                                          )
                                        );
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            bin: !value
                                              ? "Bin is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={selectStyle}
                                      showSearch
                                      optionFilterProp="children"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      <Option value="">Select Bin</Option>
                                      {binsData.map((bin) => (
                                        <Option key={bin.bin} value={bin.bin}>
                                          {bin.bin}
                                        </Option>
                                      ))}
                                    </Select>
                                    {childTableErrors[index]?.bin && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].bin}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="date"
                                      value={row.expDate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setChildTable((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, expDate: value }
                                              : r
                                          )
                                        );
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            expDate: !value
                                              ? "Exp Date is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                    {childTableErrors[index]?.expDate && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].expDate}
                                      </div>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                    }}
                                  >
                                    <Input
                                      type="number"
                                      value={row.qty}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setChildTable((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, qty: value }
                                              : r
                                          )
                                        );
                                        setChildTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            qty: !value
                                              ? "Quantity is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                    {childTableErrors[index]?.qty && (
                                      <div className="invalid-feedback">
                                        {childTableErrors[index].qty}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          )}
        </div>

        <ToastContainer position="bottom-right" autoClose={5000} />
      </div>
    </ConfigProvider>
  );
};

export default DeKitting;
