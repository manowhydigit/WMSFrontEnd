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
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import {
  Button,
  Card,
  Table,
  Modal,
  Pagination,
  Spin,
  Typography,
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
  Space,
} from "antd";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { showToast } from "../utils/toast-component";

import axios from "axios";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

export const Kitting = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem("orgId")));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState("");
  const [branchList, setBranchList] = useState([]);
  const [docId, setDocId] = useState("");
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [client, setClient] = useState(localStorage.getItem("client"));
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchParams, setSearchParams] = useState({
    fromDate: dayjs().startOf("month"),
    toDate: dayjs(),
    docId: "",
    status: "ALL",
  });

  const formatDate = (date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      partNo: "",
      partDescription: "",
      rowBatchNoList: [],
      batchNo: "",
      batchDate: null,
      expDate: null,
      lotNo: "",
      rowGrnNoList: [],
      grnNo: "",
      grnDate: "",
      sku: "",
      bin: "",
      avlQty: "",
      qty: "",
      unitRate: "",
      amount: "",
    };
    setChildTableData([...childTableData, newRow]);
    setChildTableErrors([
      ...childTableErrors,
      {
        bin: "",
        partNo: "",
        partDescription: "",
        batchNo: "",
        lotNo: "",
        grnNo: "",
        grnDate: "",
        sku: "",
        avlQty: "",
        qty: "",
        unitRate: "",
        amount: "",
      },
    ]);
  };

  const formatDateToDDMMYYYY = (date) => {
    const today = new Date(date);
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const currentFormattedDate = formatDateToDDMMYYYY(new Date());

  // Function to convert DD-MM-YYYY to a valid Date object for further processing if needed
  const parseDateFromDDMMYYYY = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const lrNoDetailsRefs = useRef([]);
  const lrNoParentDetailsRefs = useRef([]);

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } =
      e.target;

    // Capture the cursor position before the update
    const cursorPosition = { start: selectionStart, end: selectionEnd };

    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;
    const branchNameRegex = /^[A-Za-z0-9@_\-*]*$/;
    const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = "";

    switch (name) {
      case "customer":
      case "shortName":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabetic characters are allowed";
        }
        break;
      case "pan":
        if (!alphaNumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid Format";
        }
        break;
      case "branchName":
        if (!branchNameRegex.test(value)) {
          errorMessage =
            "Only alphanumeric characters and @, _, -, * are allowed";
        }
        break;
      case "mobile":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "Invalid Format";
        }
        break;
      case "gst":
        if (!alphaNumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 15) {
          errorMessage = "Invalid Format";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === "active") {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else if (name === "email") {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value.toUpperCase(),
        }));
      }

      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    // Restore cursor position after state update
    setTimeout(() => {
      const inputElement = document.querySelector(`[name=${name}]`);
      if (inputElement) {
        inputElement.setSelectionRange(
          cursorPosition.start,
          cursorPosition.end
        );
      }
    }, 0);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const getKittingById = async (row) => {
    console.log("THE SELECTED KITTING ID IS:", row.id);
    setEditId(row.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getKittingById?id=${row.id}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        setListView(false);
        const particularKitting = response.data.paramObjectsMap.kittingVO;
        console.log("THE PARTICULAR KITTING IS:", particularKitting);

        // Update form data
        setFormData({
          docId: particularKitting.docId || "",
          docDate: particularKitting.docDate
            ? dayjs(particularKitting.docDate)
            : dayjs(),
          refNo: particularKitting.refNo || "",
          refDate: particularKitting.refDate
            ? dayjs(particularKitting.refDate)
            : null,
          active: particularKitting.active === true,
        });

        // Update childTableData with kittingDetails1VO data
        const childTableDetails = particularKitting.kittingDetails1VO.map(
          (detail, index) => ({
            id: detail.id || Date.now() + index,
            bin: detail.bin || "",
            partNo: detail.partNo || "",
            partDescription: detail.partDescription || "",
            batchNo: detail.batchNo || "",
            lotNo: detail.lotNo || "",
            grnNo: detail.grnNo || "",
            grnDate: detail.grnDate || "",
            sku: detail.sku || "",
            avlQty: detail.avlQty || "",
            qty: detail.qty || "",
            unitRate: detail.unitRate || "",
            amount: detail.amount || "",
            rowGrnNoList: [], // Initialize with empty list
            rowBatchNoList: [], // Initialize with empty list
            rowBinList: [], // Initialize with empty list
          })
        );

        setChildTableData(childTableDetails);

        // Call APIs for each row to populate dropdown data
        const apiPromises = childTableDetails.map(async (row) => {
          try {
            // Get GRN numbers
            const grnResponse = await getAllChildGrnNo(row.partNo, row);
            // Get batch numbers
            const batchResponse = await getAllChildBatchNo(row.grnNo, row);
            // Get bins
            const binResponse = await getAllChildBin(
              row.partNo,
              row.grnNo,
              row.batchNo,
              row
            );
            return { grnResponse, batchResponse, binResponse };
          } catch (error) {
            console.error("Error fetching data for row:", error);
            return null;
          }
        });

        // Wait for all API calls to complete
        await Promise.all(apiPromises);

        // Update parentTableData with kittingDetails2VO data
        if (particularKitting.kittingDetails2VO) {
          const parentTableDetails = particularKitting.kittingDetails2VO.map(
            (detail, index) => ({
              id: detail.id || Date.now() + index + 1000,
              partNo: detail.ppartNo || "",
              partDescription: detail.ppartDesc || "",
              batchNo: detail.pbatchNo || "",
              batchDate: detail.pbatchDate || "",
              lotNo: detail.plotNo || "",
              sku: detail.psku || "",
              qty: detail.pqty || "",
              unitRate: detail.punitRate || "",
              amount: detail.pamount || "",
              grnNo: detail.pgrnNo || "",
              grnDate: detail.pgrnDate || "",
              expDate: detail.pexpDate || "",
              bin: detail.pbin || "",
              core: detail.pcore || "",
              cellType: detail.pcellType || "",
              binType: detail.pbinType || "",
              binClass: detail.pbinClass || "",
            })
          );
          setParentTableData(parentTableDetails);
        }
      } else {
        console.error("API Error:", response.data);
        message.error("Failed to fetch kitting details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error fetching kitting details");
    }
  };
  const handleSave = async () => {
    const formattedDocDate = formData.docDate
      ? dayjs(formData.docDate).format("YYYY-MM-DD")
      : "";

    const formattedGRNDate = formData.grnDate
      ? dayjs(formData.grnDate).format("YYYY-MM-DD")
      : "";
    const errors = {};
    let firstInvalidFieldRef = null;

    // Validate form fields
    if (!formData.docId) {
      errors.docId = "Doc Id is required";
    }
    if (!formData.refNo) {
      errors.refNo = "Ref Id is required";
    }
    if (!formData.refDate) {
      errors.refDate = "Ref Date is required";
    }

    // Validate child table data
    let childTableDataValid = true;
    const newTableErrors = childTableData.map((row, index) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "PartNo is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].partNo;
        childTableDataValid = false;
      }
      if (!row.grnNo) {
        rowErrors.grnNo = "Grn No is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].grnNo;
        childTableDataValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "Batch No is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].batchNo;
        childTableDataValid = false;
      }
      if (!row.bin) {
        rowErrors.bin = "Bin is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].bin;
        childTableDataValid = false;
      }
      if (!row.qty) {
        rowErrors.qty = "qty Type is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoDetailsRefs.current[index].qty;
        childTableDataValid = false;
      }
      return rowErrors;
    });
    setChildTableErrors(newTableErrors);

    // Reset firstInvalidFieldRef before validating parent table data
    let parentTableDataValid = true;
    const newTableErrors1 = parentTableData.map((row, index) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "P PartNo is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoParentDetailsRefs.current[index].partNo;
        parentTableDataValid = false;
      }
      if (!row.grnNo) {
        rowErrors.grnNo = "P Grn No is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoParentDetailsRefs.current[index].grnNo;
        parentTableDataValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "P Batch No is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoParentDetailsRefs.current[index].batchNo;
        parentTableDataValid = false;
      }
      if (!row.bin) {
        rowErrors.bin = "P Bin is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoParentDetailsRefs.current[index].bin;
        parentTableDataValid = false;
      }
      if (!row.qty) {
        rowErrors.qty = "P qty Type is required";
        if (!firstInvalidFieldRef)
          firstInvalidFieldRef = lrNoParentDetailsRefs.current[index].qty;
        parentTableDataValid = false;
      }
      return rowErrors;
    });
    setParentTableErrors(newTableErrors1);

    // Set general form errors
    setFieldErrors(errors);

    if (
      !childTableDataValid ||
      !parentTableDataValid ||
      Object.keys(errors).length > 0
    ) {
      // Focus on the first invalid field
      if (firstInvalidFieldRef && firstInvalidFieldRef.current) {
        firstInvalidFieldRef.current.focus();
      }
    } else {
      // Proceed with form submission
      setIsLoading(true);

      // Mapping child table data for the API
      const childVO = childTableData.map((row) => ({
        bin: row.bin,
        partNo: row.partNo,
        partDescription: row.partDescription,
        batchNo: row.batchNo,
        expDate: row.expDate,
        batchDate: row.batchDate,
        lotNo: row.lotNo,
        grnNo: row.grnNo,
        binType: row.binType,
        binClass: row.binClass,
        cellType: row.cellType,
        core: row.core,
        grnDate: row.grnDate,
        sku: row.sku,
        avlQty: parseInt(row.avlQty),
        qty: parseInt(row.qty),
        unitRate: parseInt(row.unitRate),
        amount: parseInt(row.amount),
        qQcflag: true,
      }));

      // Mapping parent table data for the API
      const ParentVO = parentTableData.map((row) => ({
        ppartNo: row.partNo,
        ppartDescription: row.partDescription,
        pbatchNo: row.batchNo,
        pbatchDate: row.batchDate,
        plotNo: row.lotNo,
        psku: row.sku,
        pqty: parseInt(row.qty),
        pbin: row.bin,
        pgrnNo: row.grnNo,
        pgrnDate: row.grnDate ? convertToYYYYMMDD(row.grnDate) : "",
        pexpDate: row.expDate,
        pqcflag: true,
        pbinType: row.binType,
        pbinClass: row.binClass,
        pcellType: row.cellType,
        pcore: row.core,
      }));

      // Data to save
      const saveFormData = {
        ...(editId && { id: editId }),
        docDate: formattedDocDate,
        refNo: formData.refNo,
        refDate: formData.refDate,
        kittingDetails1DTO: childVO,
        kittingDetails2DTO: ParentVO,
        orgId: orgId,
        createdBy: loginUserName,
        branch: branch,
        branchCode: branchCode,
        client: client,
        customer: customer,
        finYear: finYear,
        warehouse: warehouse,
      };

      console.log("DATA TO SAVE IS:", saveFormData);

      try {
        const response = await axios.put(
          `${API_URL}/api/kitting/createUpdateKitting`,
          saveFormData
        );
        if (response.data.status === true) {
          console.log("Response:", response);
          handleClear();
          showToast(
            "success",
            editId
              ? "Kitting Updated Successfully"
              : "Kitting created successfully"
          );
          getAllKitting();
          setIsLoading(false);
        } else {
          showToast(
            "error",
            response.paramObjectsMap.errorMessage || "Kitting creation failed"
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast("error", "Kitting creation failed");
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      docDate: null,
      refNo: "",
      refDate: "",
      active: true,
    });
    setChildTableData([
      {
        id: 1,
        bin: "",
        partNo: "",
        partDescription: "",
        batchNo: "",
        lotNo: "",
        grnNo: "",
        grnDate: "",
        sku: "",
        avlQty: "",
        qty: "",
        unitRate: "",
        amount: "",
      },
    ]);
    setParentTableData([
      {
        id: 1,
        partNo: "",
        partDescription: "",
        batchNo: "",
        lotNo: "",
        sku: "",
        qty: "",
        unitRate: "",
        amount: "",
        grnNo: "",
        grnDate: "",
        expDate: "",
      },
    ]);
    setFieldErrors({
      docId: "",
      docDate: "",
      refNo: "",
      refDate: "",
    });
    getDocId();
  };

  const convertToYYYYMMDD = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const today = formatDate(new Date());

  const [formData, setFormData] = useState({
    docId: docId,
    docDate: dayjs(),
    refNo: "",
    refDate: "",
    active: true,
  });

  const [value, setValue] = useState(0);
  const [childPartNoList, setChildPartNoList] = useState([]);
  const [partNoOptions1, setPartNoOptions1] = useState([]);
  const [grnOptions, setGrnOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [binOptions, setBinOptions] = useState([]);
  const [rowBatchNo, setRowBatchNo] = useState([]);

  const [childTableData, setChildTableData] = useState([
    {
      id: 1,
      partNo: "",
      partDescription: "",
      rowBatchNoList: [],
      batchNo: "",
      batchDate: null,
      expDate: null,
      lotNo: "",
      rowGrnNoList: [],
      grnNo: "",
      grnDate: "",
      sku: "",
      bin: "",
      avlQty: "",
      qty: "",
      unitRate: "",
      amount: "",
    },
  ]);

  const [parentTableData, setParentTableData] = useState([
    {
      id: 1,
      partNo: "",
      partDescription: "",
      rowBatchNoList: [],
      batchNo: "",
      batchDate: null,
      expDate: null,
      lotNo: "",
      sku: "",
      qty: "",
      unitRate: "",
      amount: "",
      rowGrnNoList: [],
      grnNo: "",
      grnDate: "",
      expDate: "",
      bin: "",
      core: "",
      cellType: "",
      binType: "",
      binClass: "",
    },
  ]);

  const [childTableErrors, setChildTableErrors] = useState([
    {
      bin: "",
      partNo: "",
      partDescription: "",
      batchNo: "",
      lotNo: "",
      grnNo: "",
      grnDate: "",
      sku: "",
      avlQty: "",
      qty: "",
      unitRate: "",
      amount: "",
    },
  ]);

  const [parentTableErrors, setParentTableErrors] = useState([
    {
      partNo: "",
      partDescription: "",
      batchNo: "",
      lotNo: "",
      sku: "",
      qty: "",
      unitRate: "",
      amount: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: "",
    refNo: "",
    refDate: "",
  });

  const [listView, setListView] = useState(false);
  const [toBinList, setToBinList] = useState([]);

  const handleDeleteRow = (id) => {
    setChildTableData(childTableData.filter((row) => row.id !== id));
  };
  const handleKeyDown = (e, row) => {
    if (
      e.key === "Tab" &&
      row.id === childTableData[childTableData.length - 1].id
    ) {
      e.preventDefault();
      handleAddRow();
    }
  };
  const handleDeleteRow1 = (id) => {
    setParentTableData(parentTableData.filter((row) => row.id !== id));
  };

  const listViewColumns = [
    { accessorKey: "docId", header: "Document No", size: 140 },
    { accessorKey: "docDate", header: "Document Date", size: 140 },
    { accessorKey: "refNo", header: "Ref Id", size: 140 },
    { accessorKey: "refDate", header: "Ref Date", size: 140 },
  ];

  const [listViewData, setListViewData] = useState([]);

  // Example usage:

  const getAllKitting = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getAllKitting?orgId=${orgId}&branchCode=${branchCode}&client=${client}&customer=${customer}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        setListViewData(response.data.paramObjectsMap.kittingVOs);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllParentPart = async () => {
    try {
      console.log("Current docId:", docId); // Log the current docId to verify its value

      const response = await axios.get(
        `${API_URL}/api/kitting/getPartNOByParent?orgId=${orgId}&branchCode=${branchCode}&client=${client}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        const options1 = response.data.paramObjectsMap.kittingVO.map(
          (item) => ({
            value: item.partNo,
            partDescription: item.partDesc, // Ensure these fields exist in the response
            sku: item.Sku, // Ensure these fields exist in the response
          })
        );
        setPartNoOptions1(options1);

        // Modify the document ID and set it in the parent table data

        console.log("Updated parentTableData:", parentTableData); // Log the updated parentTableData after state update
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to append "GN" to the document ID
  const appendGNToDocumentId = (docId) => {
    // Insert "GN" right after "KT" if "KT" is present
    const index = docId.indexOf("KT");
    if (index !== -1) {
      return `${docId.slice(0, index + 2)}GN${docId.slice(index + 2)}`;
    }
    return docId; // Return the original document ID if "KT" is not found
  };

  // Ensure the state updates correctly
  useEffect(() => {
    console.log("parentTableData has been updated:", parentTableData);
  }, [parentTableData]);

  const getAllChildPartNo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getPartNOByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&warehouse=${warehouse}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        setChildPartNoList(response.data.paramObjectsMap.kittingVO);
      } else {
        console.error("Error: Unable to fetch part numbers:", response.message);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
    }
  };

  const getAvailableChildPartNos = (currentRowId) => {
    const selectedPartNos = childTableData
      .filter((row) => row.id !== currentRowId && row.partNo) // Exclude current row and empty partNos
      .map((row) => row.partNo);

    console.log("THE SELECTED PART NOS:", selectedPartNos);

    // Filter out selected part numbers from the available options
    return childPartNoList.filter(
      (partDetail) => !selectedPartNos.includes(partDetail.partNo)
    );
  };

  // Add this utility function at the top of your component
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return "";

    // Handle different date formats from API
    let dateObj;
    if (dateString.includes(" ")) {
      // Format: "2025-09-01 00:00:00.0"
      dateObj = new Date(dateString.split(" ")[0]);
    } else {
      // Format: "2025-09-01"
      dateObj = new Date(dateString);
    }

    // Format as dd-mm-yyyy
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const handleChildPartNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedPartNo = childPartNoList.find((b) => b.partNo === value);
    setChildTableData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              partNo: selectedPartNo ? selectedPartNo.partNo : "",
              partDescription: selectedPartNo ? selectedPartNo.partDesc : "",
              sku: selectedPartNo ? selectedPartNo.Sku : "",
              grnNo: "",
              rowGrnNoList: [],
              batchNo: "",
              rowBatchNoList: [],
              avlQty: "",
              remainQty: "",
              toBin: "",
              toBinType: "",
            }
          : r
      )
    );
    setChildTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        partNo: !value ? "Part number is required" : "",
      };
      return newErrors;
    });

    if (value) {
      getAllChildGrnNo(value, row);
    }
  };

  const getAllChildGrnNo = async (selectedPartNo, row) => {
    try {
      if (!selectedPartNo) return;

      const response = await axios.get(
        `${API_URL}/api/kitting/getGrnNOByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${selectedPartNo}&warehouse=${warehouse}`
      );
      console.log("API Response for GRN:", response);

      if (response.data.status === true) {
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowGrnNoList: response.data.paramObjectsMap.kittingVO || [],
                }
              : r
          )
        );
        return response;
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching GRN data:", error);
    }
  };

  const handleChildGrnNoChange = (row, index, event) => {
    const value = event.target.value;
    const selectedGrnNo = row.rowGrnNoList.find((row) => row.grnNo === value);
    setChildTableData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              grnNo: selectedGrnNo.grnNo,
              grnDate: selectedGrnNo ? selectedGrnNo.grnDate : "",
              batchNo: "",
              rowBatchNoList: [],
              toBin: "",
              toBinType: "",
              avlQty: "",
              remainQty: "",
            }
          : r
      )
    );
    setChildTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        grnNo: !value ? "GRN No is required" : "",
      };
      return newErrors;
    });
    getAllChildBatchNo(value, row);
  };
  const getAllChildBatchNo = async (selectedGrnNo, row) => {
    try {
      if (!selectedGrnNo || !row.partNo) return;

      const response = await axios.get(
        `${API_URL}/api/kitting/getBatchByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${row.partNo}&warehouse=${warehouse}&grnNo=${selectedGrnNo}`
      );
      console.log("API Response for Batch:", response);

      if (response.data.status === true) {
        const batchData = response.data.paramObjectsMap.kittingVO.map(
          (item) => ({
            batchNo: item.batchNo,
            batchDate: item.batchDate,
            expDate: item.expDate,
          })
        );
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, rowBatchNoList: batchData } : r
          )
        );
        return response;
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching batch data:", error);
    }
  };

  const handleChildBatchNoChange = (row, index, e) => {
    const value = e.target.value;
    console.log("Selected Batch No:", value);

    const selectedBatchNo = row.rowBatchNoList.find(
      (option) => option.batchNo === value
    );
    console.log("Selected Batch Details:", selectedBatchNo);

    setChildTableData((prev) => {
      return prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              batchNo: selectedBatchNo ? selectedBatchNo.batchNo : "",
              batchDate: selectedBatchNo ? selectedBatchNo.batchDate : "",
              expDate: selectedBatchNo ? selectedBatchNo.expDate : "",
            }
          : r
      );
    });

    setChildTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        batchNo: "",
      };
      return newErrors;
    });

    // Call getAllChildBin with the batch number (could be empty string)
    getAllChildBin(row.partNo, row.grnNo, value, row);
  };

  useEffect(() => {
    getAllKitting();
    getDocId();
    getAllBinDetails();
    getAllChildPartNo();
    getAllParentPart();
  }, []);

  const getAllChildBin = async (
    selectedPartNo,
    selectedGrnNo,
    selectedBatchNo,
    row
  ) => {
    try {
      if (!selectedPartNo || !selectedGrnNo) return;

      let url = `${API_URL}/api/kitting/getBinByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${selectedPartNo}&warehouse=${warehouse}&grnNo=${selectedGrnNo}`;

      if (selectedBatchNo) {
        url += `&batch=${selectedBatchNo}`;
      }

      const response = await axios.get(url);
      console.log("API Response for Bin:", response);

      if (response.data.status === true || response.data.statusFlag === "Ok") {
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowBinList: response.data.paramObjectsMap.kittingVO || [],
                }
              : r
          )
        );
        return response;
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching bin data:", error);
    }
  };
  const handleChildBinChange = (row, index, event) => {
    const value = event.target.value;
    const selectedToBin = row.rowBinList.find((row) => row.bin === value);
    setChildTableData((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              bin: selectedToBin.bin,
              binClass: selectedToBin ? selectedToBin.binClass : "",
              binType: selectedToBin ? selectedToBin.binType : "",
              cellType: selectedToBin ? selectedToBin.cellType : "",
              core: selectedToBin ? selectedToBin.core : "",
            }
          : r
      )
    );
    setChildTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        toBin: !value ? "To Bin is required" : "",
      };
      return newErrors;
    });
    // getFromQty(row.batchNo, row.fromBin, row.grnNo, row.partNo, row);
    getAllAvlQty(row, value);
  };
  const getAllAvlQty = async (row, selectedBin) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getSqtyByKitting?orgId=${orgId}&batch=${row.batchNo}&branchCode=${branchCode}&client=${client}&partNo=${row.partNo}&warehouse=${warehouse}&grnNo=${row.grnNo}&bin=${selectedBin}`
      );

      if (response.data.status === true) {
        const avlQty = response.data.paramObjectsMap.avlQty; // Update to match the response format
        setChildTableData((prevData) =>
          prevData.map((r) =>
            r.partNo === row.partNo && r.grnNo === row.grnNo
              ? {
                  ...r,
                  avlQty: avlQty, // Update the avlQty for the corresponding row
                }
              : r
          )
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllBinDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllBinDetails?warehouse=${warehouse}&branchCode=${branchCode}&client=${client}&orgId=${orgId}`
      );
      console.log("API Response:", response);

      if (response.data.status === true || response.data.statusFlag === "Ok") {
        console.log(
          "response.data.paramObjectsMap.Bins:",
          response.data.paramObjectsMap.Bins
        );
        const optionsBin = response.data.paramObjectsMap.Bins.map((item) => ({
          binClass: item.binClass,
          binType: item.binType, // Ensure these fields exist in the response
          cellType: item.cellType, // Ensure these fields exist in the response
          core: item.core,
          bin: item.bin,
        }));
        setBinOptions(optionsBin);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllParentGRnNo = async (selectedPart, partNo) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getGrnNOByParent?bin=${selectedPart.bin}&orgId=${orgId}&branch=${branch}&branchCode=${branchCode}&client=${client}&partDesc=${selectedPart.partDescription}&partNo=${partNo}&sku=${selectedPart.sku}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        const options = response.data.paramObjectsMap.kittingVO.map((item) => ({
          value: item.partNo,
          partDescription: item.partDesc, // Ensure these fields exist in the response
          sku: item.Sku, // Ensure these fields exist in the response
        }));
        // setPartNoOptions(options);
        console.log("Mapped Part No Options:", options);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getKittingInDocId?orgId=${orgId}&branchCode=${branchCode}&client=${client}&branch=${branch}&finYear=${finYear}`
      );
      console.log("API Response:", response);

      if (response.data.status === true) {
        setDocId(response.data.paramObjectsMap.KittingDocId);
        setFormData((prevFormData) => ({
          ...prevFormData,
          docId: response.data.paramObjectsMap.KittingDocId,
        }));
        const modifiedDocId = appendGNToDocumentId(
          response.data.paramObjectsMap.KittingDocId
        );
        console.log("Modified docId:", modifiedDocId); // Log the modified docId to verify it

        setParentTableData((prevParentTableData) =>
          prevParentTableData.map((row) => ({
            ...row,
            grnNo: modifiedDocId, // Ensure this line correctly sets grnNo
            grnDate: today,
          }))
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
              className="form-containerSG"
              style={{
                minHeight: "80vh",
                background: "var(--bg-body-gradient)",
                marginTop: "40px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-body-gradient)",
                  padding: "0 20px",
                }}
              >
                <Typography.Title
                  level={3}
                  style={{ color: "#fff", margin: 0 }}
                >
                  Kitting List
                </Typography.Title>
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

              {/* Search and Filter Controls */}
              <div
                style={{
                  margin: "20px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Input
                  placeholder="Search kitting entries..."
                  allowClear
                  value={searchParams.docId}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, docId: e.target.value })
                  }
                  style={{
                    width: "300px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                  prefix={
                    <SearchOutlined
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    />
                  }
                />

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <DatePicker
                    placeholder="From Date"
                    value={dayjs(searchParams.fromDate)}
                    onChange={(date) =>
                      setSearchParams({ ...searchParams, fromDate: date })
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  />
                  <DatePicker
                    placeholder="To Date"
                    value={dayjs(searchParams.toDate)}
                    onChange={(date) =>
                      setSearchParams({ ...searchParams, toDate: date })
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  />
                  <Select
                    value={searchParams.status}
                    onChange={(value) =>
                      setSearchParams({ ...searchParams, status: value })
                    }
                    style={{
                      width: "150px",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Option value="ALL">All Status</Option>
                    <Option value="PENDING">Pending</Option>
                    <Option value="COMPLETED">Completed</Option>
                  </Select>

                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => console.log("Search clicked", searchParams)}
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
                    onClick={() => {
                      setSearchParams({
                        fromDate: dayjs().startOf("month"),
                        toDate: dayjs(),
                        docId: "",
                        status: "ALL",
                      });
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Clear
                  </Button>

                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => console.log("Export to Excel")}
                    style={{
                      background: "rgba(108, 99, 255, 0.3)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Export to Excel
                  </Button>
                </div>
              </div>

              {/* Data Table */}
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
                  <thead>
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
                        Ref Id
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Ref Date
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
                    {listViewData
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(255, 255, 255, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)";
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
                            {item.docDate
                              ? formatDateFromAPI(item.docDate)
                              : "-"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.refNo || "-"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {item.refDate
                              ? formatDateFromAPI(item.refDate)
                              : "-"}
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
                              style={{
                                padding: "4px 8px",
                                borderRadius: "12px",
                                backgroundColor:
                                  item.status === "COMPLETED"
                                    ? "rgba(76, 175, 80, 0.3)"
                                    : "rgba(255, 193, 7, 0.3)",
                                color:
                                  item.status === "COMPLETED"
                                    ? "#4CAF50"
                                    : "#FFC107",
                              }}
                            >
                              {item.status || "PENDING"}
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
                            <Space>
                              <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => getKittingById(item)}
                                style={{ color: "white" }}
                              />
                            </Space>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Custom Pagination */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                    padding: "0 20px",
                    color: "white",
                    alignItems: "center",
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
                      padding: "4px 8px",
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
                          padding: "4px 8px",
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
                      padding: "4px 8px",
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
                      padding: "4px 8px",
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
                    Kitting
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Manage kitting entries
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
                  icon={<SaveOutlined />}
                  loading={isLoading}
                  onClick={handleSave}
                  type="primary"
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
                <Tabs
                  defaultActiveKey="1"
                  className="white-tabs"
                  activeKey={value.toString()}
                  onChange={(key) => handleChange(null, parseInt(key))}
                >
                  <TabPane tab="Kitting Child" key="0">
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
                                className="white-datepicker"
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.docDate)}
                                disabled
                                format="DD-MM-YYYY"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Ref Id</span>
                              }
                            >
                              <Input
                                value={formData.refNo}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    refNo: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label={
                                <span style={{ color: "#fff" }}>Ref Date</span>
                              }
                            >
                              <DatePicker
                                className="white-datepicker"
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={
                                  formData.refDate
                                    ? dayjs(formData.refDate)
                                    : null
                                }
                                format="DD-MM-YYYY"
                                onChange={(date) =>
                                  handleDateChange("refDate", date)
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </div>

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
                            justifyContent: "flex-end",
                            marginBottom: "16px",
                          }}
                        >
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
                              <col style={{ width: "120px" }} /> {/* Part No */}
                              <col style={{ width: "200px" }} />{" "}
                              {/* Part Desc */}
                              <col style={{ width: "100px" }} /> {/* SKU */}
                              <col style={{ width: "100px" }} /> {/* GRN No */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* GRN Date */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* Batch No */}
                              <col style={{ width: "120px" }} /> {/* Bin */}
                              <col style={{ width: "100px" }} /> {/* Avl Qty */}
                              <col style={{ width: "100px" }} /> {/* Qty */}
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
                                  Bin *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "white",
                                  }}
                                >
                                  Avl Qty
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
                              {childTableData.map((row, index) => (
                                <tr
                                  key={row.id}
                                  style={{
                                    borderBottom:
                                      "1px dashed rgba(255, 255, 255, 0.2)",
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
                                      onClick={() => handleDeleteRow(row.id)}
                                      style={{
                                        color: "white",
                                        background: "transparent",
                                        border: "none",
                                      }}
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
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.partNo}
                                      onChange={(value) => {
                                        const selectedPart =
                                          childPartNoList.find(
                                            (option) => option.partNo === value
                                          );
                                        if (selectedPart) {
                                          handleChildPartNoChange(row, index, {
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
                                      <Option value="">--Select--</Option>
                                      {childPartNoList?.map((option) => (
                                        <Option
                                          key={option.partNo}
                                          value={option.partNo}
                                        >
                                          {option.partNo}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.partDescription}
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
                                        handleChildGrnNoChange(row, index, {
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
                                      disabled={!row.partNo}
                                    >
                                      <Option value="">--Select--</Option>
                                      {row.rowGrnNoList?.map((grn) => (
                                        <Option
                                          key={grn.grnNo}
                                          value={grn.grnNo}
                                        >
                                          {grn.grnNo}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="text" // Changed from date to text since we're displaying formatted date
                                      value={
                                        row.grnDate
                                          ? formatDateFromAPI(row.grnDate)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        // You might want to handle date input differently
                                        // If you need to edit dates, consider using a date picker
                                        const value = e.target.value;
                                        setChildTableData((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id
                                              ? { ...r, grnDate: value }
                                              : r
                                          )
                                        );
                                      }}
                                      style={inputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.batchNo}
                                      onChange={(value) => {
                                        handleChildBatchNoChange(row, index, {
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
                                      disabled={!row.grnNo}
                                    >
                                      <Option value="">Select batch No</Option>
                                      {row.rowBatchNoList?.map((batch) => (
                                        <Option
                                          key={batch.batchNo}
                                          value={batch.batchNo}
                                        >
                                          {batch.batchNo}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.bin}
                                      onChange={(value) => {
                                        handleChildBinChange(row, index, {
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
                                      {row.rowBinList?.map((bin) => (
                                        <Option key={bin.bin} value={bin.bin}>
                                          {bin.bin}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
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
                                        setChildTableData((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id
                                              ? { ...r, qty: value }
                                              : r
                                          )
                                        );
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
                  </TabPane>

                  <TabPane tab="Kitting Parent" key="1">
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
                          {parentTableData.length > 0 ? null : (
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
                              <col style={{ width: "50px" }} /> {/* Action */}
                              <col style={{ width: "50px" }} /> {/* S.No */}
                              <col style={{ width: "120px" }} />{" "}
                              {/* P Part No */}
                              <col style={{ width: "200px" }} />{" "}
                              {/* P Part Description */}
                              <col style={{ width: "100px" }} /> {/* P SKU */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P GRN No */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P GRN Date */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P Batch No */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P Batch Date */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P Lot No */}
                              <col style={{ width: "120px" }} /> {/* P Bin */}
                              <col style={{ width: "100px" }} /> {/* P Qty */}
                              <col style={{ width: "100px" }} />{" "}
                              {/* P Exp Date */}
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
                                  P Part No *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Part Description
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P SKU
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P GRN No *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P GRN Date
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Batch No *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Batch Date
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Lot No
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Bin *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "white",
                                  }}
                                >
                                  P Qty *
                                </th>
                                <th
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    color: "white",
                                  }}
                                >
                                  P Exp Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {parentTableData.map((row, index) => (
                                <tr
                                  key={row.id}
                                  style={{
                                    borderBottom:
                                      "1px dashed rgba(255, 255, 255, 0.2)",
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
                                      onClick={() => handleDeleteRow1(row.id)}
                                      style={{
                                        color: "white",
                                        background: "transparent",
                                        border: "none",
                                      }}
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
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.partNo}
                                      onChange={(value) => {
                                        const selectedPart =
                                          partNoOptions1.find(
                                            (option) =>
                                              String(option.value) ===
                                              String(value)
                                          );
                                        if (selectedPart) {
                                          setParentTableData((prev) => {
                                            return prev.map((r) =>
                                              r.id === row.id
                                                ? {
                                                    ...r,
                                                    partNo: value,
                                                    partDescription:
                                                      selectedPart.partDescription,
                                                    sku: selectedPart.sku,
                                                  }
                                                : r
                                            );
                                          });
                                          getAllParentGRnNo(
                                            selectedPart,
                                            value
                                          );
                                        }
                                        setParentTableErrors((prev) => {
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
                                      <Option value="">--Select--</Option>
                                      {partNoOptions1?.map((option) => (
                                        <Option
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.value}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.partDescription}
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
                                      value={
                                        row.grnDate
                                          ? formatDateToDDMMYYYY(row.grnDate)
                                          : currentFormattedDate
                                      }
                                      readOnly
                                      style={readOnlyInputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.batchNo}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setParentTableData((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, batchNo: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
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
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="date"
                                      value={row.batchDate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setParentTableData((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, batchDate: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
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
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      value={row.lotNo}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setParentTableData((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, lotNo: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            lotNo: !value
                                              ? "Lot No is required"
                                              : "",
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      style={inputStyle}
                                    />
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Select
                                      value={row.bin}
                                      onChange={(value) => {
                                        const selectedBin = binOptions.find(
                                          (option) => option.bin === value
                                        );
                                        if (selectedBin) {
                                          setParentTableData((prev) => {
                                            return prev.map((r) =>
                                              r.id === row.id
                                                ? {
                                                    ...r,
                                                    bin: selectedBin.bin,
                                                    core: selectedBin.core,
                                                    cellType:
                                                      selectedBin.cellType,
                                                    binType:
                                                      selectedBin.binType,
                                                    binClass:
                                                      selectedBin.binClass,
                                                  }
                                                : r
                                            );
                                          });
                                        }
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
                                      <Option value="">--Select--</Option>
                                      {binOptions?.map((option) => (
                                        <Option
                                          key={option.bin}
                                          value={option.bin}
                                        >
                                          {option.bin}
                                        </Option>
                                      ))}
                                    </Select>
                                  </td>
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
                                        setParentTableData((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, qty: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
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
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    <Input
                                      type="date"
                                      value={row.expDate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setParentTableData((prev) =>
                                          prev.map((r, i) =>
                                            i === index
                                              ? { ...r, expDate: value }
                                              : r
                                          )
                                        );
                                        setParentTableErrors((prev) => {
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

export default Kitting;
