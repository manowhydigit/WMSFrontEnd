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
  const [finYear, setFinYear] = useState("2024");
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
    console.log("THE SELECTED EMPLOYEE ID IS:", row.original.id);
    setEditId(row.original.id);
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getKittingById?id=${row.original.id}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setListView(false);
        const particularCustomer = response.paramObjectsMap.kittingVO;
        console.log("THE PARTICULAR CUSTOMER IS:", particularCustomer);

        // Update form data
        setFormData({
          docId: particularCustomer.docId,
          docDate: particularCustomer.docDate
            ? dayjs(particularCustomer.docDate)
            : dayjs(),
          refNo: particularCustomer.refNo || "",
          refDate: particularCustomer.refDate
            ? dayjs(particularCustomer.refDate)
            : "",
          active: particularCustomer.active === true,
          customer: particularCustomer.customer,
          branch: particularCustomer.branch,
          warehouse: particularCustomer.warehouse,
        });

        // Update childTableData with kittingDetails1VO data
        const childTableDetails = particularCustomer.kittingDetails1VO.map(
          (detail) => ({
            id: detail.id,
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
          })
        );

        setChildTableData(childTableDetails);

        // Call getAllChildGrnNo for each part number in childTableDetails
        const grnPromises = childTableDetails.map((row) =>
          getAllChildGrnNo(row.partNo, row)
        );
        const batchPromises = childTableDetails.map((row) =>
          getAllChildBatchNo(row.grnNo, row)
        );
        const binPromises = childTableDetails.map((row) =>
          getAllChildBin(row.partNo, row.grnNo, row.batchNo, row)
        );

        // Wait for all the getAllChildGrnNo API calls to complete
        await Promise.all(grnPromises, batchPromises, binPromises);

        // Update parentTableData with kittingDetails2VO data
        setParentTableData(
          particularCustomer.kittingDetails2VO.map((detail) => ({
            id: detail.id,
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
            bin: detail.pbin,
            core: detail.pcore,
            cellType: detail.pcellType,
            binType: detail.pbinType,
            binClass: detail.pbinClass,
          }))
        );

        const alreadySelectedBranch = particularCustomer.clientBranchVO.map(
          (br) => {
            const foundBranch = branchList.find(
              (branch) => branch.branchCode === br.branchCode
            );
            console.log(
              `Searching for branch with code ${br.branchCode}:`,
              foundBranch
            );
            return {
              id: br.id,
              branchCode: foundBranch ? foundBranch.branchCode : "Not Found",
              branch: foundBranch ? foundBranch.branch : "Not Found",
            };
          }
        );
        setParentTableData(alreadySelectedBranch);
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = async () => {
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
        docDate: formData.docDate,
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
        if (response.status === true) {
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

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.kittingVOs);
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

      if (response.status === true) {
        const options1 = response.paramObjectsMap.kittingVO.map((item) => ({
          value: item.partNo,
          partDescription: item.partDesc, // Ensure these fields exist in the response
          sku: item.Sku, // Ensure these fields exist in the response
        }));
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

      if (response.status === true) {
        setChildPartNoList(response.paramObjectsMap.kittingVO);
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
      const response = await axios.get(
        `${API_URL}/api/kitting/getGrnNOByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${selectedPartNo}&warehouse=${warehouse}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowGrnNoList: response.paramObjectsMap.kittingVO,
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
      const response = await axios.get(
        `${API_URL}/api/kitting/getBatchByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${row.partNo}&warehouse=${warehouse}&grnNo=${selectedGrnNo}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        const batchData = response.paramObjectsMap.kittingVO.map((item) => ({
          batchNo: item.batchNo,
          batchDate: item.batchDate,
          expDate: item.expDate,
        }));
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, rowBatchNoList: batchData } : r
          )
        );
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

    getAllChildBin(row.partNo, row.grnNo, value, row);
  };

  const getAllChildBin = async (
    selectedPartNo,
    selectedGrnNo,
    selectedBatchNo,
    row
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/kitting/getBinByChild?orgId=${orgId}&branchCode=${branchCode}&client=${client}&partNo=${selectedPartNo}&warehouse=${warehouse}&grnNo=${selectedGrnNo}&batch=${selectedBatchNo}`
      );
      console.log("API Response:", response);

      if (response.status === true) {
        setChildTableData((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  rowBinList: response.paramObjectsMap.kittingVO,
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

      if (response.status === true) {
        const avlQty = response.paramObjectsMap.avlQty; // Update to match the response format
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

      if (response.status === true) {
        console.log(
          "response.paramObjectsMap.Bins:",
          response.paramObjectsMap.Bins
        );
        const optionsBin = response.paramObjectsMap.Bins.map((item) => ({
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

      if (response.status === true) {
        const options = response.paramObjectsMap.kittingVO.map((item) => ({
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

      if (response.status === true) {
        setDocId(response.paramObjectsMap.KittingDocId);
        setFormData((prevFormData) => ({
          ...prevFormData,
          docId: response.paramObjectsMap.KittingDocId,
        }));
        const modifiedDocId = appendGNToDocumentId(
          response.paramObjectsMap.KittingDocId
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
                    Kitting List
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    View and manage kitting entries
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
                                style={{ width: "100%", ...readOnlyInputStyle }}
                                value={dayjs(formData.docDate)}
                                disabled
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
                                style={{ width: "100%" }}
                                value={
                                  formData.refDate
                                    ? dayjs(formData.refDate)
                                    : null
                                }
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
                                        color: "#ff4d4f",
                                        background: "transparent",
                                        border: "none",
                                      }}
                                    />
                                  </td>
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
                                      type="date"
                                      value={row.grnDate}
                                      onChange={(e) => {
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
                                        color: "#ff4d4f",
                                        background: "transparent",
                                        border: "none",
                                      }}
                                    />
                                  </td>
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
