import React, { useEffect, useState, useRef } from "react";
import {
  getAllCreditParties,
  getInvoices,
  getUserBranch,
} from "../services/api";
import { notification, Select, Spin } from "antd"; // Impor
import {
  DeleteOutlined,
  PlusOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Space, DatePicker, Col, Button, Switch, ConfigProvider } from "antd";
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import confetti from "canvas-confetti";
import gsap from "gsap";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "./PartyMasterUpdate.css";
import "./AddExpense.css";
import Nobills from "../Nobills.jpg";
import rewindbutton from ".././rewindbutton.png";
import { useNavigate } from "react-router-dom";
import ButtonTrans from "./ButtonTrans";
import { getAllHeaderDetails, getAllHeaderDetailsById } from "../services/api";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const HeaderDetail = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partyNames, setPartyNames] = useState([]);
  const [selectedPartyName, setSelectedPartyName] = useState("");
  const createdBy = localStorage.getItem("userName");
  const [ptype, setPtype] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [headerList, setHeaderList] = useState([]); // To hold fetched headers

  const buttonRef = useRef(null);
  const navigate = useNavigate();

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

  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [empName, setEmpName] = localStorage.getItem("nickName");

  const [userName, setUserName] = localStorage.getItem("userName");
  const [attachments, setAttachments] = useState({});
  const [previews, setPreviews] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const defaultImagePath = "src/Nobills.jpg";
  const [filePreviews, setFilePreviews] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [showListView, setShowListView] = useState(false); // New state for list view visibility

  const [editId, setEditId] = useState("");

  const [formData, setFormData] = useState({
    docdt: "",
    docid: "",
    total: 0,
    id: 0,
  });
  const [details, setDetails] = useState([
    { id: 1, category: "", description: "", rate: 0, qty: 0, amount: 0 },
  ]);

  const themeConfig =
    theme === "dark"
      ? {
          token: {
            // colorPrimary: '#1890ff', // Adjust as needed for dark mode
            colorPrimary: "#5D576B",
            // colorBgBase: '#1c1c1c', // Dark background
            // colorBgBase: "#5D576B",
            colorTextBase: "black", // White text for dark mode
            // colorTextBase: 'black',
            colorLink: "#40a9ff", // Link color for dark mode
          },
        }
      : {};
  useEffect(() => {
    const table = document.querySelector(".expense-table table");
    const tableHeaders = document.querySelectorAll(".expense-table th");
    const tableRows = document.querySelectorAll(".expense-table tr");

    if (theme === "dark") {
      document.body.style.backgroundColor = "#333"; // Dark background
      document.body.style.color = "#000"; // White text

      // Dark theme for table
      // table.style.backgroundColor = "#444"; // Dark background for table
      table.style.color = "#000"; // White text for table

      tableHeaders.forEach((header) => {
        header.style.backgroundColor = "#FFED86"; // Dark header background
      });

      tableRows.forEach((row) => {
        row.style.backgroundColor = "#444"; // Dark row background
      });
    } else {
      document.body.style.backgroundColor = "#fff"; // Light background
      document.body.style.color = "#000"; // Black text

      // Light theme for table
      table.style.backgroundColor = "#fff"; // Light background for table
      table.style.color = "#000"; // Black text for table

      tableHeaders.forEach((header) => {
        header.style.backgroundColor = "#FFED86"; // Light header background
      });

      tableRows.forEach((row) => {
        row.style.backgroundColor = "#fff"; // Light row background
      });
    }
  }, [theme]);
  // Handle header input changes
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    getAllHeaderDetails()
      .then((response) => {
        setHeaderList(response);
        console.log("res", response);
      })
      .catch((error) => {
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch data for the Header Detail.",
        });
        setLoading(false);
      });
  }, []);
  // Handle detail input changes
  const handleDetailChange = (id, field, value) => {
    const updatedDetails = details.map((detail) =>
      detail.id === id ? { ...detail, [field]: value } : detail
    );
    setDetails(updatedDetails);
    calculateTotals(updatedDetails);
  };

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

    // After 3 seconds, trigger confetti
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

    // Update text after 3.5 seconds
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.textContent = "";
        textRef.current.className = "text";
      }

      if (iconRef.current) {
        iconRef.current.className = "fa-solid fa-check";
      }
    }, 2000);

    // Reset everything after 6 seconds
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
  // Add a new detail row
  const handleAddDetail = () => {
    const newDetail = {
      id: details.length + 1,
      category: "",
      description: "",
      rate: 0,
      qty: 0,
      amount: 0,
    };
    setDetails([...details, newDetail]);
  };

  // Delete a detail row
  const handleDeleteDetail = (id) => {
    const updatedDetails = details.filter((detail) => detail.id !== id);
    setDetails(updatedDetails);
    calculateTotals(updatedDetails);
  };

  const handleSave = async () => {
    if (!formData.docdt || !formData.docid || !details.length) {
      // Validate that necessary fields are filled
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      createdBy: "string", // Replace with the actual value if you have it
      docDt: formData.docdt,
      docId: formData.docid,
      // id: formData.id,
      headerDetailDto: details.map((detail) => ({
        id: detail.id || 0, // If editing, send the existing ID. For new details, use 0.
        category: detail.category,
        description: detail.description,
        rate: detail.rate,
        qty: detail.qty,
        amount: detail.amount,
      })),
      ...(editId && { id: editId }),
    };

    try {
      let response;

      // Check if we are creating or updating the entry
      if (formData.id) {
        // If formData.id exists, it's an update
        response = await axios.put(
          `${API_URL}/api/HeaderDetail/createHeaderDetail`,
          payload
        );
      } else {
        // If formData.id doesn't exist, it's a new entry
        response = await axios.put(
          `${API_URL}/api/HeaderDetail/createHeaderDetail`,
          payload
        );
      }

      // Success handling
      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: "Success",
          description:
            "The Header Detail information has been successfully saved.",
          duration: 3,
        });

        startConfetti(); // If you want to show confetti after success
        handleClear(); // Clear the form
      } else {
        notification.error({
          message: "Error",
          description: "Failed to save the Header Detail information.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error saving HeaderDetail:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while saving the HeaderDetail.",
        duration: 3,
      });
    }
  };

  const handleEditHeader = async (header) => {
    console.log("Selected Header for Edit:", header); // Log the entire header object
    setStatus("loading");
    setEditId(header.id);

    try {
      // Call the API to fetch detailed data by headerId
      const headerData = await getAllHeaderDetailsById(header.id);

      console.log("Fetched Header Data:", headerData); // Log the fetched data

      // Set the form data and details state based on the fetched data
      setFormData({
        docdt: headerData.docDt, // Ensure you are using the correct data from API response
        docid: headerData.docId,
        id: headerData.id,
        total: headerData.headerDetails.reduce(
          (acc, detail) => acc + detail.amount,
          0
        ), // Calculate total from details
      });

      setDetails(headerData.headerDetails); // Set the details for editing
      setStatus("success"); // Set success state
      setShowListView(false);
    } catch (error) {
      console.error("Error fetching Header data:", error);
      setStatus("idle"); // Set to idle state in case of error
      notification.error({
        message: "Error",
        description: "Failed to fetch header details for editing.",
      });
    }
  };

  const handleButtonClick = (e) => {
    handleSave(e);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Clear the form data
  const handleClear = () => {
    setFormData({ docdt: "", docid: "", total: 0 });
    setDetails([{ category: "", description: "", rate: 0, qty: 0, amount: 0 }]);
  };

  // Calculate subtotal, tax, and total
  const calculateTotals = (details) => {
    let newSubtotal = 0;
    details.forEach((detail) => {
      const itemTotal = detail.rate * detail.qty;
      newSubtotal += itemTotal;
    });

    setSubtotal(newSubtotal);
    setInvoiceTotal(newSubtotal + totalTax);
  };

  // Toggle list view visibility
  const handleToggleListView = () => {
    setShowListView((prev) => !prev);
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className="card w-full p-6 bg-base-100 shadow-xl "
        style={{ padding: "20px", borderRadius: "10px", height: "100%" }}
      >
        {/* Filter Section */}
        <div className="row d-flex ml" style={{ marginTop: "-80px" }}>
          <div
            className="d-flex flex-wrap justify-content-start mb-4"
            style={{ marginBottom: "20px" }}
          ></div>
          <div className="container">
            <ButtonTrans />
            {/* <button
              className="button1"
              ref={buttonRef}
              onClick={handleToggleListView}
              style={{ marginLeft: "450px", marginTop: "-10px" }}
            >
              {showListView ? "Form" : "List"}
            </button> */}
            <div>
              <Tooltip title="View List">
                <IconButton onClick={handleToggleListView}>
                  <ListAltIcon sx={{ color: "#28a745" }} />
                </IconButton>
              </Tooltip>
              {!showListView && (
                <>
                  <Tooltip title="Close">
                    <IconButton onClick={handleClear}>
                      <CloseIcon sx={{ color: "#dc3545" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save">
                    <IconButton onClick={handleSave}>
                      <SaveIcon sx={{ color: "#ffc107" }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
            <div
              className="label-customer"
              style={{
                textAlign: "center",
                width: "100%",
                marginTop: "-40px",
                // color: theme === "dark" ? "white" : "#3498db",
                fontSize: "24px",

                marginLeft: "-20px",
              }}
            >
              Header & Detail
              {/* <img
          src={rewindbutton}
          alt="Go back"
          style={{ width: "30px", marginLeft: "30px", cursor: "pointer" }}
          onClick={handleImageClick}
        /> */}
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

            {/* <button
              className="button1"
              onClick={handleButtonClick}
              ref={buttonRef}
              style={{ marginLeft: "610px", marginTop: "-50px" }}
            >
              {" "}
              Save
            </button> */}

            {!showListView ? (
              <form onSubmit={handleSave}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row", // Changed to 'row' to display items side by side
                    justifyContent: "space-between", // Add some space between the two
                    width: "80%", // Ensure the width is full for both elements
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row", // Changed to 'row' to display items side by side
                    justifyContent: "space-between", // Add some space between the two
                    width: "80%", // Ensure the width is full for both elements
                  }}
                ></div>

                <div className="form-row">
                  <div className="input-data">
                    <input
                      type="text"
                      name="docid"
                      value={formData.docid}
                      onChange={handleHeaderChange}
                      // required
                      style={{
                        width: "150px",
                        background: "white", // Always white background
                        color: "black",
                      }}
                    />

                    <label
                      style={{
                        marginBottom: "8px",
                        marginLeft: "-10px",
                        marginTop: "-20px",
                        // color: theme === "dark" ? "white" : "#3498db",
                      }}
                      className="label-customer"
                    >
                      Invoice # <span style={{ color: "red" }}>*</span>
                    </label>
                  </div>

                  <div className="input-data">
                    <input
                      type="date"
                      name="docdt"
                      value={formData.docDt}
                      onChange={handleHeaderChange}
                      // required
                      style={{
                        width: "150px",
                        background: "white", // Always white background
                        color: "black",
                      }}
                    />
                    <label
                      style={{
                        marginBottom: "8px",
                        marginLeft: "-12px",
                        // color: theme === "dark" ? "white" : "#3498db",
                      }}
                      className="label-customer"
                    >
                      Date
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "60%",
                  }}
                >
                  {/* Expense Table */}
                  <div className="expense-table">
                    <table
                      style={{
                        width: "160%",
                        tableLayout: "fixed",
                      }}
                    >
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Description</th>
                          <th>Unit</th>
                          <th>Price</th>
                          <th>Total Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((detail) => (
                          <tr key={detail.id}>
                            <td>
                              <TextField
                                type="text"
                                value={detail.category}
                                onChange={(e) =>
                                  handleDetailChange(
                                    detail.id,
                                    "category",
                                    e.target.value
                                  )
                                }
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "30px", // Reduce height
                                    padding: "4px 8px", // Adjust padding to fit
                                  },
                                }}
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                value={detail.description}
                                onChange={(e) =>
                                  handleDetailChange(
                                    detail.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "30px", // Reduce height
                                    padding: "4px 8px", // Adjust padding to fit
                                  },
                                }}
                              />
                            </td>
                            <td>
                              <TextField
                                type="number"
                                value={detail.qty}
                                onChange={(e) =>
                                  handleDetailChange(
                                    detail.id,
                                    "qty",
                                    parseFloat(e.target.value)
                                  )
                                }
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "30px", // Reduce height
                                    padding: "4px 8px", // Adjust padding to fit
                                  },
                                }}
                              />
                            </td>
                            <td>
                              <TextField
                                type="number"
                                value={detail.rate}
                                onChange={(e) =>
                                  handleDetailChange(
                                    detail.id,
                                    "rate",
                                    parseFloat(e.target.value)
                                  )
                                }
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "30px", // Reduce height
                                    padding: "4px 8px", // Adjust padding to fit
                                  },
                                }}
                              />
                            </td>
                            <td>
                              <TextField
                                type="number"
                                value={detail.rate * detail.qty}
                                disabled
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "30px", // Reduce height
                                    padding: "4px 8px", // Adjust padding to fit
                                  },
                                }}
                              />
                            </td>

                            {/* <IconButton
                                onClick={() => handleDeleteDetail(detail.id)}
                              >
                                <DeleteIcon />
                              </IconButton> */}

                            <td style={{ textAlign: "center" }}>
                              <IconButton
                                onClick={() => handleDeleteDetail(detail.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <br />
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddDetail}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "black",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        marginTop: "-22px",
                        marginLeft: "-12px",
                      }}
                    >
                      {/* <PlusOutlined style={{ fontSize: '24px', marginRight: '12px' }} /> */}

                      <PlusCircleOutlined
                        style={{ fontSize: "24px", marginRight: "12px" }}
                      />
                    </Button>

                    {/* Total Amount */}
                    <div className="total-amount">
                      {/* <strong>Total:</strong> {totalAmount} */}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="expense-table">
                <table
                  style={{
                    width: "100%",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Docid</th>
                      <th>Docdate</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headerList.map((detail) => (
                      <tr key={detail.id}>
                        <td>{detail.docid}</td>
                        <td>{detail.docdt}</td>
                        <td>{detail.total}</td>

                        <td>
                          <Button
                            onClick={() => handleEditHeader(detail)}
                            variant="outlined"
                            color="primary"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br />
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default HeaderDetail;
