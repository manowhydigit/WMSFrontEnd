import React, { useEffect, useState, useRef } from "react";
import {
  getUserBranch,
  getGoalsByUserName,
  getGoalsById,
} from "../services/api";
import { notification, Select, Spin, Table } from "antd"; // Added Table
import {
  DeleteOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons"; // Added UnorderedListOutlined
import {
  Space,
  DatePicker,
  Col,
  Button,
  Switch,
  ConfigProvider,
  Input,
} from "antd";
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
import "./PartyMasterUpdate.css";
import "./AddExpense.css";
import Nobills from "../Nobills.jpg";
import rewindbutton from ".././rewindbutton.png";
import { useNavigate } from "react-router-dom";
import ButtonTrans from "./ButtonTrans";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import "./Ticket.css";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const SelfReview = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partyNames, setPartyNames] = useState([]);
  const [selectedPartyName, setSelectedPartyName] = useState("");
  const createdBy = localStorage.getItem("userName");
  const [ptype, setPtype] = useState("");

  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [preGoalId, setPreGoalId] = useState(null);

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

  const [rows, setRows] = useState([
    { id: 1, area: "", goal: "", selfinput: "" },
  ]);
  const [viewMode, setViewMode] = useState("form"); // 'form' or 'list'
  const [preGoalsData, setPreGoalsData] = useState([]); // State for pre-goals data
  const [deletedRowIds, setDeletedRowIds] = useState([]);
  const [preGoalsList, setPreGoalsList] = useState([]); // or whatever name
  const [editingData, setEditingData] = useState(null);

  const [appraiseeDetailsData, setAppraiseeDetailsData] = useState([]);

  const [appraiseeDetailsErrors, setAppraiseeDetailsErrors] = useState([]);

  const [goalsData, setGoalsData] = useState([]);

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now() + Math.floor(Math.random() * 1000), // Ensures uniqueness
        area: "",
        goal: "",
        selfinput: "",
      },
    ]);
  };

  // Update your deleteRow function to handle both new and existing rows
  const deleteRow = (idToDelete) => {
    setRows((prevRows) => {
      // If we're editing an existing record
      if (preGoalId) {
        // For existing records, we want to mark for deletion rather than remove
        return prevRows.map((row) =>
          row.id === idToDelete ? { ...row, _markedForDeletion: true } : row
        );
      }
      // For new records being created
      else {
        // If only one row remains, don't delete it - just clear the values
        if (prevRows.length <= 1) {
          return [{ id: prevRows[0].id, area: "", goal: "" }];
        }
        // Otherwise filter out the row with matching ID
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

  // Update your handleSubmit to handle marked for deletion rows
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    const isValid = rows.every(
      (row) => !row._markedForDeletion && row.area && row.goal
    );
    if (!isValid) {
      notification.error({
        message: "Validation Error",
        description: "Please fill all required fields (Area and Goals).",
        duration: 3,
      });
      return;
    }

    const isUpdate = preGoalId !== null;

    const payload = {
      apprisalYear: new Date().getFullYear().toString(),
      empCode: localStorage.getItem("userName"),
      empName: localStorage.getItem("nickName"),
      createdBy: localStorage.getItem("userName"),
      userName: null,
      approve: "F",
      preGoalsDtlDTO: rows
        .filter((row) => !row._markedForDeletion) // Exclude marked for deletion
        .map((row) => ({
          id: row.id || 0,
          area: row.area,
          goals: row.goal,
          selfinput: row.selfinput,
        })),
      ...(isUpdate && { id: preGoalId }),
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/pregoals/createPreGoal`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: "Success",
          description: `Goals ${isUpdate ? "updated" : "saved"} successfully!`,
          duration: 3,
        });

        handleCelebrate();
        setRows([{ id: 0, area: "", goal: "" }]);
        setPreGoalId(null);
        setEditId("");
        fetchPreGoals();
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
    }
  };
  const handleInputChange = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const handleEdit = (goal) => {
    setPreGoalId(goal.gst_pregoalsid);
    setRows(goal.rows); // where `goal.rows` is detail list (area, goal, id)
  };

  const themeConfig =
    theme === "dark"
      ? {
          token: {
            colorPrimary: "#5D576B",
            colorTextBase: "black",
            colorLink: "#40a9ff",
          },
        }
      : {};

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const table = document.querySelector(".expense-table table");
    const tableHeaders = document.querySelectorAll(".expense-table th");
    const tableRows = document.querySelectorAll(".expense-table tr");

    if (theme === "dark") {
      document.body.style.backgroundColor = "#333";
      document.body.style.color = "#000";

      table.style.color = "#000";

      tableHeaders.forEach((header) => {
        header.style.backgroundColor = "#FFED86";
      });

      tableRows.forEach((row) => {
        row.style.backgroundColor = "#444";
      });
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";

      table.style.backgroundColor = "#fff";
      table.style.color = "#000";

      tableHeaders.forEach((header) => {
        header.style.backgroundColor = "#FFED86";
      });

      tableRows.forEach((row) => {
        row.style.backgroundColor = "#fff";
      });
    }
  }, [theme]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#5D576B";
      document.body.style.color = "#fff";
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.style.backgroundColor = "white";
        input.style.color = "#000";
      });
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.style.backgroundColor = "#fff";
        input.style.color = "#000";
      });
    }
  }, [theme]);

  // Fetch pre-goals data

  const fetchPreGoals = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/pregoals/getPreGoals?userName=${localStorage.getItem(
          "userName"
        )}`
      );
      if (
        response.data &&
        response.data.paramObjectsMap &&
        response.data.paramObjectsMap.getPreGoals
      ) {
        setPreGoalsData(response.data.paramObjectsMap.getPreGoals);
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

    // Fetch pre-goals data when component mounts
    fetchPreGoals();
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
        colors: ["#757AE9", "#28224B", "#EBF4FF"],
      });

      fireConfetti(0.2, {
        spread: 60,
        startVelocity: 20,
        colors: ["#757AE9", "#28224B", "#EBF4FF"],
      });

      fireConfetti(0.35, {
        spread: 100,
        startVelocity: 15,
        decay: 0.91,
        colors: ["#757AE9", "#28224B", "#EBF4FF"],
      });

      fireConfetti(0.1, {
        spread: 120,
        startVelocity: 10,
        decay: 0.92,
        colors: ["#757AE9", "#28224B", "#EBF4FF"],
      });

      fireConfetti(0.1, {
        spread: 120,
        startVelocity: 20,
        colors: ["#757AE9", "#28224B", "#EBF4FF"],
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

  const [formData, setFormData] = useState({
    area: "",
    goal: "",
    selfinput: "",
    empCode: "",
    empName: "",
    createdBy: "",
    expenseId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatDate = (date) => {
    const dateParts = date.split("/");
    if (dateParts.length !== 3) {
      console.error("Invalid date format:", date);
      return "";
    }

    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");

    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const button = document.getElementById("celebrateBtn");
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }
  };

  const handleButtonClick = (e) => {
    handleSubmit(e);
  };

  const handleImageClick = () => {
    navigate("/Transactions");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  // Update your handleRowClick function
  const handleRowClick = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/pregoals/getPreGoalsDetails?id=${id}`
      );

      if (response.data?.paramObjectsMap?.getPreGoalsDetails) {
        const goalsData = response.data.paramObjectsMap.getPreGoalsDetails;

        // Set the main preGoalId
        setPreGoalId(id);
        setEditId(id);

        // Transform the data to match your rows structure
        const formattedRows = goalsData.map((goal) => ({
          id:
            goal.gst_pregoalsdtlid ||
            Date.now() + Math.floor(Math.random() * 1000),
          area: goal.area,
          goal: goal.goal,
          selfinput: goal.selfinput,
        }));

        setRows(formattedRows);
        setViewMode("form");
        setEditId(id);
      }
    } catch (error) {
      console.error("Error fetching goal details:", error);
      notification.error({
        message: "Error",
        description: "Failed to load goal details",
      });
    }
  };

  //   const handleSubmit = async (event) => {
  //     if (event) event.preventDefault();

  //     const isValid = rows.every((row) => row.area && row.goal);
  //     if (!isValid) {
  //       notification.error({
  //         message: "Validation Error",
  //         description: "Please fill all required fields (Area and Goals).",
  //         duration: 3,
  //       });
  //       return;
  //     }

  //     const isUpdate = preGoalId !== null;

  //     const payload = {
  //       apprisalYear: new Date().getFullYear().toString(),
  //       empCode: localStorage.getItem("userName"),
  //       empName: localStorage.getItem("nickName"),
  //       createdBy: localStorage.getItem("userName"),
  //       preGoalsDtlDTO: rows.map((row) => ({
  //         id: row.id || 0, // Only meaningful for update
  //         area: row.area,
  //         goals: row.goal,
  //       })),
  //       ...(isUpdate && { id: preGoalId }), // 👈 Only include `id` for updates
  //     };

  //     try {
  //       const response = await axios.put(
  //         `${API_URL}/api/pregoals/createPreGoal`,
  //         payload
  //       );

  //       if (response.status === 200 || response.status === 201) {
  //         notification.success({
  //           message: "Success",
  //           description: `Goals ${isUpdate ? "updated" : "saved"} successfully!`,
  //           duration: 3,
  //         });

  //         handleCelebrate();
  //         setRows([{ id: 0, area: "", goal: "" }]);
  //         setPreGoalId(null);
  //         setEditId("");
  //         fetchPreGoals();
  //       } else {
  //         notification.error({
  //           message: "Save Failed",
  //           description: "Failed to save goals.",
  //           duration: 3,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error saving goals:", error);
  //       notification.error({
  //         message: "Error",
  //         description: "An error occurred while saving the goals.",
  //         duration: 3,
  //       });
  //     }
  //   };

  // Table columns for the list view
  // Update your columns to include an onCell property
  const columns = [
    {
      title: "ID",
      dataIndex: "gst_pregoalsid",
      key: "gst_pregoalsid",
      onCell: (record) => ({
        onClick: () => handleRowClick(record.gst_pregoalsid),
      }),
      render: (text) => <a>{text}</a>, // Make it look clickable
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

  return (
    <ConfigProvider theme={themeConfig}>
      <br />
      <br />
      <div
        className="card w-full p-6 bg-base-100 shadow-xl "
        style={{ padding: "20px", borderRadius: "10px", height: "100%" }}
      >
        <div className="row d-flex ml" style={{ marginTop: "-80px" }}>
          <div
            className="d-flex flex-wrap justify-content-start mb-4"
            style={{ marginBottom: "20px" }}
          ></div>
          <div className="container">
            <ButtonTrans />
            <div
              className="label-customer"
              style={{
                textAlign: "center",
                width: "100%",
                marginTop: "-40px",
                fontSize: "24px",
                marginLeft: "-20px",
              }}
            >
              Self Review
            </div>
            <br />

            <Button
              className="button1"
              type="text"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              size="small"
              style={{ marginLeft: "250px", marginTop: "-30px" }}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
            <br />

            {/* Toggle between form and list view */}
            <Button
              className="button1"
              icon={<UnorderedListOutlined />}
              onClick={toggleViewMode}
              style={{
                marginRight: "10px",
                marginLeft: "320px",
                marginTop: "-30px",
              }}
            >
              {viewMode === "form" ? "List" : "Form"}
            </Button>

            {viewMode === "form" && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  //   marginLeft: "80px",
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    className="button1"
                    onClick={handleButtonClick}
                    ref={buttonRef}
                    style={{ marginLeft: "450px", marginTop: "-50px" }}
                  >
                    {rows.some((row) => row.id && typeof row.id > 0)
                      ? "Update"
                      : "Save"}
                  </Button>
                  <Button
                    className="button1"
                    //   icon={<PlusOutlined />}
                    style={{ marginLeft: "-10px", marginTop: "-50px" }}
                    onClick={() => {
                      setRows([{ id: Date.now(), area: "", goal: "" }]);
                    }}
                    // style={{ marginLeft: "-80px" }}
                  >
                    New
                  </Button>
                </Box>
              </Box>
            )}
            {viewMode === "form" ? (
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    margin: "20px auto",
                    padding: "20px 30px",
                    width: "95%",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    marginTop: "-30px",
                    marginLeft: "1px",
                  }}
                >
                  {/* <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      rowGap: "12px",
                      columnGap: "12px",
                      alignItems: "center",
                      maxWidth: "400px",
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#444" }}>
                      Employee:
                    </div>
                    <div style={{ color: "#0052cc", fontWeight: "500" }}>
                      {localStorage.getItem("nickName")}
                    </div>

                    <div style={{ fontWeight: "600", color: "#444" }}>
                      Code:
                    </div>
                    <div style={{ color: "#0052cc", fontWeight: "500" }}>
                      {localStorage.getItem("userName")}
                    </div>
                  </div> */}

                  <div className="form-row">
                    <div className="input-data">
                      <input
                        type="text"
                        name="description"
                        value={localStorage.getItem("nickName")}
                        required
                        readOnly
                        style={{
                          width: "100px",
                          // color: theme === "dark" ? "white" : "#3498db",
                        }}
                      />
                      <label
                        style={{
                          width: "100px",
                          marginBottom: "8px",
                          marginLeft: "2px",
                          // color: theme === "dark" ? "white" : "#3498db",
                          fontWeight: "bold",
                        }}
                      >
                        Employee
                      </label>
                    </div>

                    <div className="input-data">
                      <input
                        type="text"
                        name="description"
                        value={localStorage.getItem("userName")}
                        required
                        readOnly
                        style={{
                          width: "100px",
                          // color: theme === "dark" ? "white" : "#3498db",
                        }}
                      />
                      <label
                        style={{
                          width: "100px",
                          marginBottom: "8px",
                          marginLeft: "2px",
                          // color: theme === "dark" ? "white" : "#3498db",
                          fontWeight: "bold",
                        }}
                      >
                        Code
                      </label>
                    </div>

                    <div className="input-data">
                      <input
                        type="text"
                        name="description"
                        // value={localStorage.getItem("nickName")}
                        required
                        readOnly
                        style={{
                          width: "100px",
                          // color: theme === "dark" ? "white" : "#3498db",
                        }}
                      />
                      <label
                        style={{
                          width: "100px",
                          marginBottom: "8px",
                          marginLeft: "2px",
                          // color: theme === "dark" ? "white" : "#3498db",
                          fontWeight: "bold",
                        }}
                      >
                        Reporting To
                      </label>
                    </div>

                    <div className="input-data">
                      <input
                        type="text"
                        name="description"
                        // value={localStorage.getItem("userName")}
                        required
                        readOnly
                        style={{
                          width: "100px",
                          // color: theme === "dark" ? "white" : "#3498db",
                        }}
                      />
                      <label
                        style={{
                          width: "100px",
                          marginBottom: "8px",
                          marginLeft: "2px",
                          // color: theme === "dark" ? "white" : "#3498db",
                          fontWeight: "bold",
                        }}
                      >
                        Code
                      </label>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      fontSize: "14px",
                      color: "#d32f2f",
                      backgroundColor: "#fff3f3",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <strong>Area:</strong> BO - Business Operation, VC - Value
                    Creation, PE - People Engagement
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "95%",
                    marginTop: "-50px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    padding: "20px",
                  }}
                >
                  <div className="expense-table">
                    <table style={{ width: "100%", tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>#</th>
                          <th style={{ width: "100px" }}>Area</th>
                          <th>Goals</th>
                          <th>Self Input</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr
                            key={`row-${index}-${row.id}`}
                            style={{
                              borderBottom: `1px solid ${
                                theme === "dark" ? "#555" : "#ddd"
                              }`,
                              backgroundColor: row._markedForDeletion
                                ? theme === "dark"
                                  ? "#333"
                                  : "#eee"
                                : theme === "dark"
                                ? "#444"
                                : "#fff",
                              opacity: row._markedForDeletion ? 0.7 : 1,
                            }}
                          >
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {index + 1}
                            </td>

                            <td style={{ padding: "8px" }}>
                              <Select
                                className="custom-disabled-select"
                                style={{ width: "100%" }}
                                disabled
                                value={row.area}
                                onChange={(value) =>
                                  handleInputChange(row.id, "area", value)
                                }
                              >
                                <Option value="BO">BO</Option>
                                <Option value="VC">VC</Option>
                                <Option value="PE">PE</Option>
                              </Select>
                            </td>
                            <td style={{ padding: 8, maxWidth: 150 }}>
                              {" "}
                              {/* set your desired max width */}
                              <div
                                style={{
                                  width: "100%",
                                  maxWidth: "250px", // same as td’s maxWidth
                                  overflowX: "auto",
                                  whiteSpace: "nowrap", // prevent wrapping
                                }}
                              >
                                <Input
                                  placeholder="Enter goals"
                                  value={row.goal}
                                  disabled
                                  style={{ width: "auto", minWidth: "100%" }}
                                  onChange={(e) =>
                                    handleInputChange(
                                      row.id,
                                      "goal",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </td>

                            <td style={{ padding: "8px" }}>
                              <Input
                                placeholder="Self Input"
                                value={row.selfinput}
                                onChange={(e) =>
                                  handleInputChange(
                                    row.id,
                                    "selfinput",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </form>
            ) : (
              <div
                style={{
                  margin: "20px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "10px",
                }}
              >
                <Table
                  columns={columns}
                  dataSource={preGoalsData}
                  rowKey="gst_pregoalsid"
                  pagination={{
                    pageSize: 10,
                    style: {
                      marginTop: "1200px",
                      paddingBottom: "10px",
                    },
                  }}
                  style={{
                    width: "100%",
                    overflow: "hidden",
                  }}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record.gst_pregoalsid),
                    style: { cursor: "pointer" },
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SelfReview;
