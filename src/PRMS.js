import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getUserBranch,
  getPerformanceGoalsByUserName,
  getPerformanceGoalsById,
} from "../services/api";
import { notification, Select, Spin, Table, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  DeleteOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Space,
  DatePicker,
  Col,
  Button,
  Switch,
  ConfigProvider,
  Input,
  Rate,
  Slider,
  Checkbox,
} from "antd";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SendIcon from "@mui/icons-material/Send";
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import axios from "axios";
import confetti from "canvas-confetti";
import gsap from "gsap";
import Nobills from "../Nobills.jpg";
import rewindbutton from ".././rewindbutton.png";
import { useNavigate } from "react-router-dom";
import ButtonTrans from "./ButtonTrans";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import "./PerformanceGoalsGD.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { debounce } from "lodash";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const PRMS = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partyNames, setPartyNames] = useState([]);
  const [selectedPartyName, setSelectedPartyName] = useState("");
  const createdBy = localStorage.getItem("userName");
  const [ptype, setPtype] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [performanceGoalId, setPerformanceGoalId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 20, y: 20 });

  const [branchName, setBranchName] = useState("");
  const [fbranchName, setFBranchName] = useState("");
  const [tbranchName, setTBranchName] = useState("");
  const [status, setStatus] = useState("idle");
  const textRef = useRef(null);
  const iconRef = useRef(null);
  const [branchNames, setBranchNames] = useState([]);
  const [proforma, setProforma] = useState([]);
  const [docid, setDocid] = useState([]);
  const [selectedProfoma, setSelectedProfoma] = useState("");
  const [profoms, setProfoms] = useState([]);
  const [crRemarks, setCrRemarks] = useState([]);
  const [editId, setEditId] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [data1, setData1] = useState([]);

  const [empName, setEmpName] = useState(localStorage.getItem("nickName"));

  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [attachments, setAttachments] = useState({});
  const [previews, setPreviews] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const defaultImagePath = "src/Nobills.jpg";
  const [filePreviews, setFilePreviews] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [tableData, setTableData] = useState([
    { id: 1, perspective: "", objective: "" },
  ]);

  const REQUIRED_PERSPECTIVES = [
    "Financial",
    "Customer",
    "Internal Processes",
    "Learning & Growth",
  ];

  const hasAllRequiredPerspectives = () => {
    const selected = tableData.map((row) => row.perspective);
    return REQUIRED_PERSPECTIVES.every((req) => selected.includes(req));
  };

  const handleAddRow = () => {
    if (!hasAllRequiredPerspectives()) {
      notification.warning({
        message: "Missing Required Perspectives",
        description:
          "Please select all 4 required perspectives before adding more.",
      });
      return;
    }

    const newRow = {
      id: Date.now(),
      perspective: "",
      objective: "",
    };

    setTableData([...tableData, newRow]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validPerspectives = new Set([
      "Financial",
      "Customer",
      "Internal Processes",
      "Learning & Growth",
    ]);

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.getWorksheet(1);
      const newRows = [];

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          const perspective = row.getCell("A").text;

          if (!validPerspectives.has(perspective)) {
            throw new Error(
              `Row ${rowNumber}: Invalid perspective "${perspective}"`
            );
          }

          newRows.push({
            id: Date.now() + rowNumber,
            perspective,
            objectivedesc: row.getCell("B").text,
            perassigned: row.getCell("C").text,
            measurement: row.getCell("D").text,
            qtrtarget: row.getCell("E").text,
            performance: row.getCell("F").text,
            comments: row.getCell("G").text,
            performanceself: row.getCell("H").text,
            selfrating: row.getCell("I").text,
            appraiserrating: row.getCell("J").text,
          });
        }
      });

      setRows(newRows);
      notification.success({
        message: "Success",
        description: `Loaded ${newRows.length} valid goals`,
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: "Upload Error",
        description: error.message,
        duration: 5,
      });
    }
    e.target.value = "";
  };

  const downloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("PerformanceGoals");

      const perspectiveOptions = [
        "Financial",
        "Customer",
        "Internal Processes",
        "Learning & Growth",
      ];

      worksheet.columns = [
        { header: "Perspective", key: "perspective", width: 20 },
        { header: "Objective Description", key: "objective", width: 40 },
        { header: "% Assigned", key: "assigned", width: 12 },
        { header: "Measurement", key: "measurement", width: 25 },
        { header: "Qtr Target", key: "target", width: 20 },
        { header: "Performance", key: "performance", width: 15 },
        { header: "Comments", key: "comments", width: 20 },
        { header: "Self Rating", key: "selfRating", width: 12 },
        { header: "Performance Self", key: "performanceself", width: 12 },
        { header: "Appraiser Rating", key: "appraiserRating", width: 15 },
      ];

      const ratingOptions = ["1", "2", "3", "4", "5"];

      worksheet.addRow({
        perspective: "Financial",
        objective: "Example: Increase revenue by 10%",
        assigned: "30",
        measurement: "Example: Revenue growth percentage",
        target: "Example: 2.5% growth per quarter",
        performance: "",
        comments: "",
        selfRating: "",
        appraiserRating: "",
      });

      for (let i = 2; i <= 100; i++) {
        const cellAddress = `A${i}`;
        worksheet.dataValidations.add(cellAddress, {
          type: "list",
          allowBlank: false,
          formulae: [`"${perspectiveOptions.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Input",
          error: "Select a valid Perspective from the dropdown only.",
          showInputMessage: true,
          promptTitle: "Perspective Required",
          prompt: "Select from the dropdown only.",
        });
        // Self Rating dropdown in column H
        worksheet.dataValidations.add(`H${i}`, {
          type: "list",
          allowBlank: false,
          formulae: [`"${ratingOptions.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Rating",
          error: "Choose a number between 1 and 5.",
          showInputMessage: true,
          promptTitle: "Self Rating",
          prompt: "Choose between 1 and 5.",
        });
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "PerformanceGoals_Template.xlsx");
    } catch (error) {
      console.error("Error generating template:", error);
      notification.error({
        message: "Error",
        description: "Failed to generate template file.",
        duration: 3,
      });
    }
  };

  const [rows, setRows] = useState([
    {
      id: 1,
      perspective: "",
      objectivedesc: "",
      perassigned: "",
      measurement: "",
      qtrtarget: "",
      performance: "",
      comments: "",
      selfrating: "",
      appraiserrating: "",
    },
  ]);

  const [viewMode, setViewMode] = useState("form");
  const [preGoalsData, setPreGoalsData] = useState([]);
  const [deletedRowIds, setDeletedRowIds] = useState([]);
  const [preGoalsList, setPreGoalsList] = useState([]);
  const [editingData, setEditingData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [performanceGoalMainData, setPerformanceGoalMainData] = useState(null);

  const [appraiseeDetailsData, setAppraiseeDetailsData] = useState([]);
  const [appraiseeDetailsErrors, setAppraiseeDetailsErrors] = useState([]);
  const [performanceGoalsData, setPerformanceGoalsData] = useState([]);

  const [activeInput, setActiveInput] = useState(null);
  const [showControls, setShowControls] = useState(false);

  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [hoverDirection, setHoverDirection] = useState(null);
  const tableContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const startScrolling = (direction) => {
    setHoverDirection(direction);
    const container = scrollRef.current;
    if (!container) return;

    stopScrolling();
    scrollIntervalRef.current = setInterval(() => {
      if (direction === "left") {
        container.scrollLeft -= 10;
      } else if (direction === "right") {
        container.scrollLeft += 10;
      }
    }, 20);
  };

  const stopScrolling = () => {
    clearInterval(scrollIntervalRef.current);
    setHoverDirection(null);
  };

  useEffect(() => {
    let scrollTimeout;
    const container = tableContainerRef.current;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // First check if all required perspectives are present
    const selectedPerspectives = rows
      .filter((row) => !row._markedForDeletion)
      .map((row) => row.perspective);

    const missingPerspectives = REQUIRED_PERSPECTIVES.filter(
      (req) => !selectedPerspectives.includes(req)
    );

    if (missingPerspectives.length > 0) {
      notification.error({
        message: "Missing Required Perspectives",
        description: `Please include at least one goal for each of these perspectives: ${missingPerspectives.join(
          ", "
        )}`,
        duration: 5,
      });
      setIsSubmitting(false);
      return;
    }

    // Then check if all rows have required fields
    const isValid = rows.every(
      (row) => !row._markedForDeletion && row.perspective && row.objectivedesc
    );

    if (!isValid) {
      notification.error({
        message: "Validation Error",
        description:
          "Please fill all required fields (Perspective and Objective).",
        duration: 3,
      });
      setIsSubmitting(false);
      return;
    }

    // Rest of your submit logic...
    const isUpdate = performanceGoalId !== null;

    const payload = {
      apprisalYear:
        performanceGoalMainData?.appraisalYear ||
        new Date().getFullYear().toString(),
      empCode:
        performanceGoalMainData?.empcode || localStorage.getItem("userName"),
      empName:
        performanceGoalMainData?.empname || localStorage.getItem("nickName"),
      createdBy: localStorage.getItem("userName"),
      pmonth: performanceGoalMainData?.pmonth || currentMonthYear(),
      performanceGoalsDtlDTO: rows
        .filter((row) => !row._markedForDeletion)
        .map((row) => ({
          id: row.id || 0,
          perspective: row.perspective,
          objectivedesc: row.objectivedesc,
          perassigned: row.perassigned,
          measurement: row.measurement,
          qtrtarget: row.qtrtarget,
          performance: row.performance,
          comments: row.comments,
          performanceself: row.performanceself,
          selfrating: row.selfrating,
        })),
      ...(isUpdate && { id: performanceGoalId }),
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/performancegoals/createPerformanceGoal`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: "Success",
          description: `Goals ${isUpdate ? "updated" : "saved"} successfully!`,
          duration: 3,
        });

        handleCelebrate();

        setRows([
          {
            id: Date.now(),
            perspective: "",
            objectivedesc: "",
            perassigned: "",
            measurement: "",
            qtrtarget: "",
            performance: "",
            comments: "",
            performanceself: "",
            selfrating: "",
            appraiserrating: "",
            apprjustification: "",
          },
        ]);

        setPerformanceGoalId(null);
        setEditId("");
        fetchPerformanceGoals();
        setIsModalVisible(true);
      } else {
        notification.error({
          message: "Save Failed",
          description: "Failed to save goals.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error saving goals:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while saving the goals.",
        duration: 3,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // const handleSubmit = async (event) => {
  //   if (event) event.preventDefault();

  //   if (isSubmitting) return;

  //   setIsSubmitting(true);

  //   const isValid = rows.every(
  //     (row) => !row._markedForDeletion && row.perspective && row.objectivedesc
  //   );

  //   if (!isValid) {
  //     notification.error({
  //       message: "Validation Error",
  //       description:
  //         "Please fill all required fields (Perspective and Objective).",
  //       duration: 3,
  //     });
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const isUpdate = performanceGoalId !== null;

  //   const payload = {
  //     apprisalYear: new Date().getFullYear().toString(),
  //     empCode: localStorage.getItem("userName"),
  //     empName: localStorage.getItem("nickName"),
  //     createdBy: localStorage.getItem("userName"),
  //     pmonth: currentMonthYear(),
  //     performanceGoalsDtlDTO: rows
  //       .filter((row) => !row._markedForDeletion)
  //       .map((row) => ({
  //         id: row.id || 0,
  //         perspective: row.perspective,
  //         objectivedesc: row.objectivedesc,
  //         perassigned: row.perassigned,
  //         measurement: row.measurement,
  //         qtrtarget: row.qtrtarget,
  //         performance: row.performance,
  //         comments: row.comments,
  //         performanceself: row.performanceself,
  //         selfrating: row.selfrating,
  //       })),
  //     ...(isUpdate && { id: performanceGoalId }),
  //   };

  //   try {
  //     const response = await axios.put(
  //       `${API_URL}/api/performancegoals/createPerformanceGoal`,
  //       payload
  //     );

  //     if (response.status === 200 || response.status === 201) {
  //       notification.success({
  //         message: "Success",
  //         description: `Goals ${isUpdate ? "updated" : "saved"} successfully!`,
  //         duration: 3,
  //       });

  //       handleCelebrate();

  //       setRows([
  //         {
  //           id: Date.now(),
  //           perspective: "",
  //           objectivedesc: "",
  //           perassigned: "",
  //           measurement: "",
  //           qtrtarget: "",
  //           performance: "",
  //           comments: "",
  //           performanceself: "",
  //           selfrating: "",
  //           appraiserrating: "",
  //           apprjustification: "",
  //         },
  //       ]);

  //       setPerformanceGoalId(null);
  //       setEditId("");
  //       fetchPerformanceGoals();
  //       setIsModalVisible(true);
  //     } else {
  //       notification.error({
  //         message: "Save Failed",
  //         description: "Failed to save goals.",
  //         duration: 3,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error saving goals:", error);
  //     notification.error({
  //       message: "Error",
  //       description: "An error occurred while saving the goals.",
  //       duration: 3,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const debouncedSubmit = useCallback(
    debounce((e) => handleSubmit(e), 1000, { leading: true, trailing: false }),
    [rows, performanceGoalId]
  );

  const handleButtonClick = (e) => {
    debouncedSubmit(e);
  };

  const handleInputChange = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const handleEdit = (goal) => {
    setPerformanceGoalId(goal.gst_performancegoalsid);
    setRows(goal.rows);
  };

  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const currentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${month}/${year}`;
  };

  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#1A1A2E";
      document.body.style.color = "#FFFFFF";
    } else {
      document.body.style.backgroundColor = "#F9FAFE";
      document.body.style.color = "#32325D";
    }
  }, [theme]);

  const fetchPerformanceGoals = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/performancegoals/getPerformanceGoals?userName=${localStorage.getItem(
          "userName"
        )}`
      );
      if (
        response.data &&
        response.data.paramObjectsMap &&
        response.data.paramObjectsMap.getPerformanceGoals
      ) {
        setPerformanceGoalsData(
          response.data.paramObjectsMap.getPerformanceGoals
        );
        // Store the first record as main data (you might need to adjust this based on your needs)
        if (response.data.paramObjectsMap.getPerformanceGoals.length > 0) {
          setPerformanceGoalMainData(
            response.data.paramObjectsMap.getPerformanceGoals[0]
          );
        }
      }
    } catch (error) {
      console.error("Error fetching pre-goals:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch pre-goals data",
      });
    }
  };

  useEffect(() => {
    getUserBranch()
      .then((response) => {
        setBranchNames(response);
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });

    fetchPerformanceGoals();
  }, []);

  const fireConfetti = (particleRatio, opts) => {
    confetti(
      Object.assign({}, opts, {
        particleCount: Math.floor(100 * particleRatio),
      })
    );
  };

  const startConfetti = () => {
    setStatus("loading");
    if (textRef.current) {
      textRef.current.textContent = "";
      textRef.current.className = "text hidden";
    }

    if (iconRef.current) {
      iconRef.current.className = "fa-solid fa-spinner animate-spin";
    }

    if (buttonRef.current) {
      buttonRef.current.className = "loading";
    }

    setTimeout(() => {
      if (iconRef.current) {
        iconRef.current.className = "";
      }

      if (buttonRef.current) {
        buttonRef.current.className = "success";
      }

      fireConfetti(0.25, {
        spread: 26,
        startVelocity: 10,
        colors: ["#6C63FF", "#42EADD", "#FF6584"],
      });

      fireConfetti(0.2, {
        spread: 60,
        startVelocity: 20,
        colors: ["#6C63FF", "#42EADD", "#FF6584"],
      });

      fireConfetti(0.35, {
        spread: 100,
        startVelocity: 15,
        decay: 0.91,
        colors: ["#6C63FF", "#42EADD", "#FF6584"],
      });

      fireConfetti(0.1, {
        spread: 120,
        startVelocity: 10,
        decay: 0.92,
        colors: ["#6C63FF", "#42EADD", "#FF6584"],
      });

      fireConfetti(0.1, {
        spread: 120,
        startVelocity: 20,
        colors: ["#6C63FF", "#42EADD", "#FF6584"],
      });
    }, 300);

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.textContent = "";
        textRef.current.className = "text";
      }

      if (iconRef.current) {
        iconRef.current.className = "fa-solid fa-check";
      }
    }, 2000);

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.textContent = "";
      }

      if (iconRef.current) {
        iconRef.current.className = "fa-solid fa-play";
      }

      if (buttonRef.current) {
        buttonRef.current.className = "";
      }

      setStatus("idle");
    }, 2000);
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const handleRowClick = async (id) => {
    try {
      // First find the main record from performanceGoalsData
      const mainRecord = performanceGoalsData.find(
        (goal) => goal.gst_performancegoalsid === id
      );

      if (mainRecord) {
        setPerformanceGoalMainData(mainRecord);
        setPerformanceGoalId(id);
        setEditId(id);
      }

      // Then fetch the details
      const response = await axios.get(
        `${API_URL}/api/performancegoals/getPerformanceGoalsDetails?id=${id}`
      );

      if (response.data?.paramObjectsMap?.getPerformanceGoalsDetails) {
        const goalsData =
          response.data.paramObjectsMap.getPerformanceGoalsDetails;

        const formattedRows = goalsData.map((goal) => ({
          id:
            goal.gst_performancegoalsid ||
            Date.now() + Math.floor(Math.random() * 1000),
          perspective: goal.perspective,
          objectivedesc: goal.objectivedesc,
          perassigned: goal.perassigned,
          measurement: goal.measurement,
          qtrtarget: goal.qtrtarget,
          performance: goal.performance,
          comments: goal.comments,
          performanceself: goal.performanceself,
          selfrating: goal.selfrating,
          appraiserrating: goal.appraiserrating,
          apprjustification: goal.apprjustification,
          pmonth: mainRecord ? mainRecord.pmonth : currentMonthYear(),
        }));

        setRows(formattedRows);
        setViewMode("form");
      }
    } catch (error) {
      console.error("Error fetching goal details:", error);
      notification.error({
        message: "Error",
        description: "Failed to load goal details",
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "gst_pregoalsid",
      key: "gst_pregoalsid",
      onCell: (record) => ({
        onClick: () => handleRowClick(record.gst_pregoalsid),
      }),
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Employee Name",
      dataIndex: "empname",
      key: "empname",
      onCell: (record) => ({
        onClick: () => handleRowClick(record.gst_pregoalsid),
      }),
    },
    {
      title: "Employee Code",
      dataIndex: "empcode",
      key: "empcode",
      onCell: (record) => ({
        onClick: () => handleRowClick(record.gst_pregoalsid),
      }),
    },
    {
      title: "Appraisal Year",
      dataIndex: "appraisalYear",
      key: "appraisalYear",
      onCell: (record) => ({
        onClick: () => handleRowClick(record.gst_pregoalsid),
      }),
    },
  ];

  const addRow = () => {
    const newRow = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      perspective: "",
      objective: "",
      assignedPercentage: "",
      measurement: "",
      quarterlyTarget: "",
      performance: "",
      comments: "",
      performanceself: "",
      selfrating: "",
      appraiserrating: "",
      apprjustification: "",
    };

    setRows((prevRows) => [...prevRows, newRow]);

    setTimeout(() => {
      const container = document.querySelector(".table-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  };

  const deleteRow = (idToDelete) => {
    setRows((prevRows) => {
      if (performanceGoalId) {
        return prevRows.map((row) =>
          row.id === idToDelete ? { ...row, _markedForDeletion: true } : row
        );
      } else {
        if (prevRows.length <= 1) {
          return [{ id: prevRows[0].id, area: "", goal: "" }];
        }
        return prevRows.filter((row) => row.id !== idToDelete);
      }
    });
  };

  const handleDeleteRow = (rowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
    if (rowId > 0) {
      setDeletedRowIds((prev) => [...prev, rowId]);
    }
  };

  useEffect(() => {
    if (editId && performanceGoalsData) {
      setRows({
        ...rows,
        pmonth: performanceGoalsData.pmonth || currentMonthYear(),
        // other fields...
      });
    }
  }, [editId, performanceGoalsData]);

  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/Transactions");
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
              // backgroundColor: "rgba(0,0,0,0.5)",
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
            display: "revert",
            placecontent: "center",
            minheight: "90dvh",
            background: "#159957",
            background: "var(--bg-body-gradient)",
          }}
        >
          <div
            className="containerSG"
            style={{
              padding: "20px",
              marginTop: "50px",
              display: "revert",
              placecontent: "center",
              overflowY: "none",
              minheight: "80dvh",
              background: "#159957",
              background: "var(--bg-body-gradient)",
            }}
          >
            <div
              className="form-containerSG"
              style={{
                backdropFilter: "blur(10px)",
                borderRadius: "25px",
                boxShadow: "0 15px 35px rgba(108, 99, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                overflow: "hidden",
                position: "relative",
                height: "80vh",
                minHeight: "350px",
                minWidth: "1000px",
                marginTop: "-10px",
              }}
            >
              <Button
                type="primary"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  margin: "0",
                  padding: "4px 8px",
                  borderRadius: "0",
                }}
                onClick={handleImageClick}
                icon={<UnorderedListOutlined />}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <div
                className="form-headerSG"
                style={{
                  padding: "1px",
                  color: "white",
                  textAlign: "center",
                  maxHeight: "500px",
                }}
              >
                <h3 className="performance-heading">Performance Goals</h3>
                <p style={{ opacity: 0.9, fontWeight: 500, fontSize: "16px" }}>
                  Set your performance goals for the upcoming appraisal period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PRMS;
