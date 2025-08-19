import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllExpense } from "../services/api";
import "./PartyMasterUpdate.css";
import "./AddExpense.css"; // Assuming you ha
import axios from "axios";
import rewindbutton from ".././rewindbutton.png";
import {
  Space,
  DatePicker,
  Col,
  Button,
  Switch,
  ConfigProvider,
  notification,
} from "antd";
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";

// ve the necessary styles
import confetti from "canvas-confetti";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";
const ViewExpense = () => {
  const [expense, setExpense] = useState({
    empCode: "",
    empName: "",
    category: "",
    expenseName: "",
    amount: "",
    date: "",
    files: [],
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  // const [editId, setEditId] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Modal data
  const [editId, setEditId] = useState(null); // Modal data
  const expenseId = location.state?.expenseId;
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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

  useEffect(() => {
    if (location.state && location.state.expenseId) {
      setEditId(location.state.expenseId); // Set expenseId in state
    } else {
      console.error("Expense ID is undefined in location.state");
    }
  }, [location.state]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#5D576B";
      document.body.style.color = "#fff"; // White text for dark mode
      // Update styles for inputs and date fields
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.style.backgroundColor = "white";
        input.style.color = "#000";
      });
    } else {
      document.body.style.backgroundColor = "#fff"; // Light background for the body
      document.body.style.color = "#000"; // Black text for light mode
      // Update styles for inputs and date fields
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.style.backgroundColor = "#fff";
        input.style.color = "#000";
      });
    }
  }, [theme]);

  // Check if the expense data is passed from ExpenseList
  useEffect(() => {
    if (location.state && location.state.expense) {
      setExpense(location.state.expense); // Set the expense data from the list
    }
  }, [location.state]);

  const handleImageClick = () => {
    window.history.back(); // Takes the user to the previous page
  };

  const EditExpEmp = () => {
    navigate("/ExpenseList"); // Navigate to the approved list page
  };

  const handleCelebrate = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Button animation
    const button = document.getElementById("celebrateBtn");
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }
  };
  const handleCardClick = (item) => {
    setSelectedItem(item);
    // setIsModalOpen(true);
  };

  // Use useEffect to log the updated editId after it's set
  useEffect(() => {
    if (editId !== null) {
      console.log("EditId updated to:", editId);
    }
  }, [editId]); // This will run every time editId is updated

  useEffect(() => {
    if (expenseId) {
      fetchData(expenseId); // Fetch data using the expenseId
    }
  }, [expenseId]);

  const fetchData = async (expenseId) => {
    setLoading(true);
    try {
      // Making the API call using axios with async/await
      const response = await axios.get(
        `${API_URL}/api/expense/getExpenseById?id=${expenseId}`
      );

      // Log the response to check
      console.log("View API Response:", response);
      setData1(response.data.paramObjectsMap.employeeExpensesVO);

      // Extract the employeeExpensesVO object from the response
      const employeeExpensesVO =
        response.data.paramObjectsMap.employeeExpensesVO;

      // Store the "id" from employeeExpensesVO in setEditId
      // setEditId(response.data.paramObjectsMap.employeeExpensesVO.id);
      console.log("Fetching data for expenseId:", expenseId);

      // Assuming the response data is in response.data (default axios behavior)
      setData(
        response.data.paramObjectsMap.employeeExpensesVO
          .employeeExpensesAttachmentVO
      ); // Set the data state with the response data
      console.log(data.attachment);
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch updated data for the listing.",
      });
    } finally {
      setLoading(false); // Ensure loading is set to false regardless of success or failure
    }
  };

  // Open modal for the clicked image
  const openModal = (expense) => {
    setSelectedExpense(expense); // Set selected expense
    setShowModal(true); // Show modal
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false); // Hide modal
    setSelectedExpense(null); // Clear selected expense
  };
  // Fetch a single expense by ID

  // const handleApprove = async (item) => {
  //   try {
  //     const response = await axios.put(
  //       `${API_URL}/api/expense/approval1?approval=${"1"}&createdby=${localStorage.getItem(
  //         "userName"
  //       )}&id=${editId}&userType=${localStorage.getItem("userType")}`
  //     );

  //     if (response.data.status === true) {
  //       const audio = new Audio("/success.wav"); // Replace with your sound file path
  //       audio.play();

  //       notification.success({
  //         message: `Expense Claim ${expenseId} Approved`,
  //         description: `You have successfully approved the Expense Claim ${expenseId}.`,
  //       });

  //       const expenseVOid = response.data.paramObjectsMap.expenseVO.id;

  //       const expenseAttachments =
  //         response.data.paramObjectsMap.expenseVO.employeeExpensesAttachmentVO;

  //       const approvedItems = selectedExpenses.filter(
  //         (item) => item.approve === "T"
  //       );
  //       console.log("approvedItems", approvedItems);

  //       const payload = {
  //         id: expenseAttachments.id,
  //         approveAmount: item.approveamount,
  //       };

  //       for (const item of selectedExpenses) {
  //         const response = await axios.put(
  //           `${API_URL}/api/expense/approveExp`,
  //           payload
  //         );

  //         if (response.data.status === true) {
  //           const audio = new Audio("/success.wav");
  //           audio.play();

  //           notification.success({
  //             message: `Expense Claim ${item.id} Approved`,
  //             description: `You have successfully approved the Expense Claim ${item.id}.`,
  //           });

  //           const expenseAttachments =
  //             response.data.paramObjectsMap.expenseVO
  //               .employeeExpensesAttachmentVO;
  //         }
  //       }

  //       EditExpEmp();

  //       // setIsModalOpen(false); // Uncomment if necessary
  //     } else {
  //       notification.error({
  //         message: `Item ${expenseId} failed`,
  //       });
  //     }
  //   } catch (error) {
  //     console.log("Error Response:", error.response?.data);
  //     const errorMessage =
  //       error.response?.data?.paramObjectsMap?.errorMessage ||
  //       error.response?.data?.message ||
  //       "An unexpected error occurred. Please try again.";
  //     notification.error({
  //       message: "Error",
  //       description: errorMessage,
  //     });
  //     EditExpEmp();
  //   }
  // };

  const handleApprove = async () => {
    try {
      // First approve the main expense claim
      const mainApprovalResponse = await axios.put(
        `${API_URL}/api/expense/approval1`,
        null,
        {
          params: {
            approval: "1",
            createdby: localStorage.getItem("userName"),
            id: editId,
            userType: localStorage.getItem("userType"),
          },
        }
      );

      if (mainApprovalResponse.data.status === true) {
        const audio = new Audio("/success.wav");
        audio.play();

        // Prepare attachmentDTO array
        const attachmentDTO = selectedExpenses.map((item) => ({
          // eeExpensesAttachmentVO.id
          amount: 0,
          approvedAmount: item.approveamount || item.amount,
          category: null,
          expDate: null,
          expense: null,
          id: item.id, // employ

          // Include any other required fields from your DTO
        }));

        // Send the array of attachmentDTOs
        if (attachmentDTO.length > 0) {
          try {
            const response = await axios.put(
              `${API_URL}/api/expense/approveExp`,
              attachmentDTO, // Send the entire array
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data.status === true) {
              notification.success({
                message: "Items Approved",
                description: `${attachmentDTO.length} items approved successfully.`,
              });
            }
          } catch (error) {
            console.error("Error approving items:", error);
          }
        }

        notification.success({
          message: "Approval Complete",
          description: "Expense claim and items processed successfully.",
        });

        EditExpEmp();
      }
    } catch (error) {
      console.error("Approval error:", error);
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Approval failed",
      });
    }
  };

  const handleReject = async (item) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/expense/approval1?approval=${"0"}&createdby=${localStorage.getItem(
          "userName"
        )}&id=${parseInt(expenseId)}&userType=${localStorage.getItem(
          "userType"
        )}`
      );

      if (response.data.status === true) {
        const audio = new Audio("/success.wav"); // Replace with your sound file path
        audio.play();

        notification.error({
          message: `Item ${expenseId} Rejected`,
          description: `You have rejected item ${expenseId}.`,
        });
        EditExpEmp();
        // setIsModalOpen(false);
      } else {
        notification.error({
          message: `Item ${expenseId} failed`,
        });
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
    }
    EditExpEmp();
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <br />
      <br />

      <div
        className="card w-full p-6 bg-base-100 shadow-xl "
        style={{ padding: "20px", borderRadius: "10px", height: "100%" }}
      >
        {/* Filter Section */}
        <div className="row d-flex ml" style={{ marginTop: "-40px" }}>
          <div
            className="d-flex flex-wrap justify-content-start mb-4"
            style={{ marginBottom: "20px" }}
          ></div>
          <div className="container" style={{ width: "2200px" }}>
            <br />
            <br />
            {/* <br/> */}
            {/* <p >Expense Claim List</p> */}
            <div
              className="label-customer"
              style={{
                textAlign: "center",
                width: "100%",
                marginTop: "-40px",
                // color: theme === "dark" ? "white" : "#3498db",
                fontSize: "24px",

                // marginLeft: "-20px",
              }}
            >
              Expense Claim View
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
              style={{
                marginLeft: "20px",
                marginTop: "10px",
                marginBottom: "20px",
              }}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Button>

            <br />

            <form>
              {/* <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "40px", // Adjusts the space between the two <p> elements
                  width: "100%",
                  marginLeft: "60px",
                }}
                className="label-customer"
              >
                <p style={{ fontSize: "1.1rem", marginRight: "10px" }}>
                  Employee:
                </p>
                <p style={{ fontSize: "1.1rem" }}>{data1.empName}</p>
                <p style={{ fontSize: "1.1rem", marginRight: "10px" }}>Code:</p>
                <p style={{ fontSize: "1.1rem" }}>{data1.empCode}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "40px",
                  width: "100%",
                  marginLeft: "60px",
                }}
                className="label-customer"
              >
                <p style={{ fontSize: "1.1rem", marginRight: "30px" }}>From:</p>
                <p style={{ fontSize: "1.1rem" }}>{data1.visitFrom}</p>
                <p style={{ fontSize: "1.1rem", marginRight: "30px" }}>To:</p>
                <p style={{ fontSize: "1.1rem" }}>{data1.visitTo}</p>
              </div> */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  margin: "0 0 20px 60px",
                  width: "70%",
                }}
              >
                {/* Employee Info Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, auto)",
                    gap: "2px",
                    alignItems: "left",
                  }}
                >
                  <span style={{ fontWeight: "500", minWidth: "80px" }}>
                    Employee:
                  </span>
                  <span style={{ alignItems: "left" }}>{data1.empName}</span>
                  <span style={{ fontWeight: "500", minWidth: "50px" }}>
                    Code:
                  </span>
                  <span>{data1.empCode}</span>
                </div>

                {/* Visit Info Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, auto)",
                    gap: "2px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "500", minWidth: "80px" }}>
                    From:
                  </span>
                  <span>{data1.visitFrom}</span>
                  <span style={{ fontWeight: "500", minWidth: "50px" }}>
                    To:
                  </span>
                  <span>{data1.visitTo}</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
                className="label-customer"
              >
                <div className="expense-table">
                  <table style={{ width: "100%", tableLayout: "fixed" }}>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Category</th>
                        <th>Expense</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>App. Amt</th>
                        <th>Attachment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length > 0 ? (
                        data.map((expense) => (
                          <tr key={expense.id}>
                            <td>
                              <div class="checkbox-wrapper-19">
                                <input
                                  id={`cbtest-${expense.id}`}
                                  type="checkbox"
                                  name="approve"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedExpenses((prev) => [
                                        ...prev,
                                        expense,
                                      ]);
                                    } else {
                                      setSelectedExpenses((prev) =>
                                        prev.filter(
                                          (item) => item.id !== expense.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <label
                                  class="check-box"
                                  htmlFor={`cbtest-${expense.id}`}
                                ></label>
                              </div>
                            </td>

                            <td>{expense.category}</td>
                            <td>{expense.expense}</td>
                            <td>
                              {expense.expDate &&
                                new Date(expense.expDate).toLocaleDateString(
                                  "en-GB"
                                )}
                            </td>
                            <td>{expense.amount}</td>
                            <td>
                              <input
                                type="number"
                                defaultValue={expense.amount} // Default to original amount
                                onChange={(e) => {
                                  // Update the selectedExpenses with modified amount
                                  setSelectedExpenses((prev) =>
                                    prev.map((item) =>
                                      item.id === expense.id
                                        ? {
                                            ...item,
                                            approveamount: e.target.value,
                                          }
                                        : item
                                    )
                                  );
                                  // Also update the main data if needed
                                  setData((prev) =>
                                    prev.map((item) =>
                                      item.id === expense.id
                                        ? {
                                            ...item,
                                            approveamount: e.target.value,
                                          }
                                        : item
                                    )
                                  );
                                }}
                                style={{
                                  width: "80px",
                                  padding: "4px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: "4px",
                                }}
                              />
                            </td>
                            <td>
                              {/* Render image using base64 string */}
                              <img
                                src={`data:image/png;base64,${expense.attachment}`}
                                alt="No Files"
                                style={{ maxWidth: "50px" }}
                                onClick={() => openModal(expense)}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No expenses found
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <Space style={{ marginTop: "10px", marginLeft: "50px" }}>
                      <Button
                        id="celebrateBtn"
                        type="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(expenseId);
                          handleCelebrate();
                        }}
                        size="small"
                        style={{
                          borderColor: "green",
                          color: "green",
                          backgroundColor: "transparent",

                          cursor: "pointer",
                          transition: "transform 0.1s ease",
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        type="default"
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(expenseId);
                        }}
                        size="small"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      >
                        Reject
                      </Button>
                    </Space>
                  </table>
                  {/* Modal for previewing image */}
                  {showModal && selectedExpense && (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        // backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        overflow: "hidden", // Prevent scrolling when modal is open
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          maxWidth: "90vw", // Allow for some spacing around the image
                          maxHeight: "90vh", // Prevent image from being too large
                          padding: "10px",
                          textAlign: "center",
                          //   backgroundColor: 'black',
                        }}
                      >
                        <img
                          src={`data:image/png;base64,${selectedExpense.attachment}`}
                          alt="No Files"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain", // Ensure the image scales proportionally
                          }}
                        />
                        <button
                          onClick={closeModal}
                          style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="total-amount">
                    <strong>Total:</strong> {data1.totamt}
                  </div>
                </div>
              </div>

              {/* <Button type="primary" onClick={handleSubmit}>Approve</Button>
            <Button type="warning" onClick={handleSubmit}>Reject</Button> */}
            </form>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ViewExpense;
