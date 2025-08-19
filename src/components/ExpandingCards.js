import React, { useState, useEffect } from "react";
import "./ExpandingCards.css"; // Make sure to add your CSS here for styling
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Input,
  notification,
  Popover,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  Modal,
  Table,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getAllOpenJobs,
  getUserBranch,
  getJobUnApproveDetails,
  getJobIncome,
  getJobExpense,
  getJobCloseddt,
  getJobCostDetails,
  getJobCostSummary,
} from "../services/api"; // mock API call
import EmailConfig from "../utils/emailConfig";
import NoDataFallback from "../utils/fallBack";
import CommonTable from "./CommonTable";
import JobCostSheetDetails from "./JobCostSheetDetails";
//   import "./date.css";

import confetti from "canvas-confetti";
import ButtonTrans from "./ButtonTrans";
import JobCostSheetSummary from "./JobCostSheetSummary";
const { Option } = Select;
const { Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const ExpandingCards = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [cardsMargin, setCardsMargin] = useState(50); // Initial margin for the cards
  const [data, setData] = useState([]);
  const [dataIncome, setDataIncome] = useState([]);
  const [dataExpense, setDataExpense] = useState([]);
  const [dataUnApp, setDataUnApp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailFlag, setEmailFlag] = useState(false);
  const [emailFlag2, setEmailFlag2] = useState(false);
  const [closeddt, setCloseddt] = useState([]);
  const [emailData, setEmailData] = useState([]);
  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [response, setResponse] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState([]);
  const [selectedJobSummary, setSelectedJobSummary] = useState([]);

  const [unappbills, setUnAppBills] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
    branchCode: "",
    amount: "",
    startDate: null,
    endDate: null,
  });
  const [selectedItem, setSelectedItem] = useState(null); // Modal data
  const [pbranchname, setPbranchName] = useState("");
  const [jobClosures, setJobClosures] = useState(false);
  const [branchNames, setBranchNames] = useState([]); // Initialize as empty array
  const [pjobNo, setpJobNo] = useState("");
  const [closed, setClosed] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  // State for modal visibility and data
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Store the selected job details
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { RangePicker } = DatePicker; // Destructure RangePicker

  const loginemail = localStorage.getItem("email");

  // Handle window resizing to adjust the layout dynamically
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const fetchData = () => {
    setLoading(true);
    const pclosed = "T";
    // Fetch all open jobs
    getAllOpenJobs(pbranchname)
      .then((response) => {
        setData(response);
        console.log("Open jobs data fetched:", response);

        const jobRequests = response.map((item) => {
          const jobNo = item.jobNo;
          console.log("Fetching data for jobNo:", jobNo);

          // Fetch income data
          const incomePromise = getJobIncome(jobNo)
            .then((incomeResponse) => {
              console.log("Income Response for Job No:", jobNo, incomeResponse);
              return { jobNo, income: incomeResponse || null }; // Return null if no unapproved data
            })
            .catch((error) => {
              console.error("Error fetching job income for", jobNo, error);
              return { jobNo, income: 0 }; // Default to 0 on error
            });

          // Fetch expense data
          const expensePromise = getJobExpense(jobNo)
            .then((expenseResponse) => {
              console.log(
                "Expense Response for Job No:",
                jobNo,
                expenseResponse
              );
              return { jobNo, expense: expenseResponse || null }; // Return null if no unapproved data
            })
            .catch((error) => {
              console.error("Error fetching job expense for", jobNo, error);
              return { jobNo, expense: 0 }; // Default to 0 on error
            });

          // Fetch unapproved bills data
          const unapprovePromise = getJobUnApproveDetails(jobNo)
            .then((unapproveResponse) => {
              console.log(
                "Unapproved Response for Job No:",
                jobNo,
                unapproveResponse
              );
              return { jobNo, unapprove: unapproveResponse || null }; // Return null if no unapproved data
            })
            .catch((error) => {
              console.error(
                "Error fetching unapproved bills for",
                jobNo,
                error
              );
              return { jobNo, unapprove: null }; // Return null on error
            });

          return Promise.all([incomePromise, expensePromise, unapprovePromise]);
        });

        // Wait for all job data promises to resolve
        Promise.all(jobRequests)
          .then((results) => {
            const incomeData = {};
            const expenseData = {};
            const unapprovedData = {};

            // Populate state with the resolved data
            results.forEach(([income, expense, unapprove]) => {
              incomeData[income.jobNo] = income.income;
              expenseData[expense.jobNo] = expense.expense;
              unapprovedData[unapprove.jobNo] = unapprove.unapprove;
            });

            // Update state with the fetched data
            setDataIncome(incomeData);
            setDataExpense(expenseData);
            setDataUnApp(unapprovedData);

            console.log("Income Data:", incomeData);
            console.log("Expense Data:", expenseData);
            console.log("Unapproved Data:", unapprovedData);
            setLoading(false); // Set loading to false once data has been fetched
          })
          .catch((error) => {
            console.error("Error fetching job details:", error);
            setLoading(false); // Handle loading state on error
          });
      })
      .catch((error) => {
        console.error("Error fetching open jobs:", error);
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch updated data for the listing.",
        });
        setLoading(false); // Set loading to false when there’s an error
      });
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      startDate: dates ? dates[0] : null,
      endDate: dates ? dates[1] : null,
    }));
  };

  // Filter the data by date range, name, amount, and currency
  const filteredData = data.filter((item) => {
    const nameMatch =
      filter.name === "" ||
      (item.name &&
        item.name.toLowerCase().includes(filter.name?.toLowerCase() || ""));

    const branchMatch =
      filter.branchCode === "" ||
      (item.branchCode &&
        item.branchCode
          .toLowerCase()
          .includes(filter.branchCode?.toLowerCase() || ""));

    const amountMatch =
      filter.amount === null ||
      (item.amount && item.amount.includes(filter.amount));

    const currencyMatch =
      filter.currency === "" ||
      (item.currency &&
        item.currency
          .toLowerCase()
          .includes(filter.currency?.toLowerCase() || ""));

    const startDateMatch =
      !filter.startDate || new Date(item.docDate) >= new Date(filter.startDate);

    const endDateMatch =
      !filter.endDate || new Date(item.docDate) <= new Date(filter.endDate);

    return (
      nameMatch &&
      branchMatch &&
      amountMatch &&
      currencyMatch &&
      startDateMatch &&
      endDateMatch
    );
  });

  useEffect(() => {
    getUserBranch()
      .then((response) => {
        setBranchNames(response); // Assuming the API returns a list of branch objects
      })
      .catch((error) => {
        notification.error({
          message: "Failed to fetch Branches",
          description: "Error occurred while fetching branch names.",
        });
      });
  }, []);

  const handleModalClose = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedJob(null); // Clear the selected job details
  };

  const handleDetailsClick = (branchName, jobNo) => {
    setSelectedJobDetails({ branchName, jobNo }); // Set the selected job for Details
    setIsDetailsModalVisible(true); // Open the Details modal
  };

  const handleSummaryClick = (branchName, jobNo) => {
    setSelectedJobSummary({ branchName, jobNo }); // Set the selected job for Summary
    setIsSummaryModalVisible(true); // Open the Summary modal
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalVisible(false); // Close the Details modal
    setSelectedJobDetails(null); // Clear the selected job for Details
  };

  const handleSummaryModalClose = () => {
    setIsSummaryModalVisible(false); // Close the Summary modal
    setSelectedJobSummary(null); // Clear the selected job for Summary
  };
  // Determine styles based on expansion state
  const containerStyles = {
    height: isExpanded ? (windowWidth >= 800 ? "400px" : "800px") : "400px",
    width: isExpanded && windowWidth >= 800 ? "1235px" : "500px",
    transition: "all 1s",
  };

  const expandImgStyles = {
    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "all 1s",
  };

  const cardsContainerStyles = {
    position: "relative",
  };

  const getCardStyle = (index) => {
    return {
      position: "absolute",
      marginLeft:
        isExpanded && windowWidth >= 700
          ? `${index * 300}px`
          : `${index * cardsMargin}px`,
      marginTop: !isExpanded && windowWidth < 700 ? `${index * 300}px` : "0",
      transition: "margin 1s, box-shadow 0.5s",
    };
  };

  return (
    <div className="container" style={{ width: "600px" }}>
      <div className="branch-name">
        <label
          htmlFor="branch-select"
          style={{
            marginBottom: "8px",
            fontWeight: "bold",
            marginTop: "200px",
          }}
        >
          Branch Name
        </label>
        <Select
          id="branch-select"
          value={pbranchname}
          onChange={(value) => setPbranchName(value)}
          placeholder="Select Branch"
        >
          <Option value="">Select Branch</Option>
          {branchNames && branchNames.length > 0 ? (
            branchNames.map((branch) => (
              <Option key={branch.branchCode} value={branch.branchName}>
                {branch.branchName}
              </Option>
            ))
          ) : (
            <Option value="">No branches available</Option>
          )}
        </Select>
        <button
          className="Btn"
          style={{ marginLeft: "300px", marginTop: "-30px" }}
        >
          <span className="leftContainer">
            <span className="like" onClick={fetchData} loading={loading}>
              Search
            </span>
          </span>
          <span
            className="likeCount"
            onClick={() => {
              setPbranchName("");
              //   fetchData(); // Re-fetch data without filters
            }}
          >
            Clear
          </span>
        </button>
      </div>
      {data.map((item, index) => (
        <div
          className="spectacledcoder-expanding-cards-container"
          key={index}
          id="maincontainer"
          style={containerStyles}
        >
          <div className="spectacledcoder-cards" style={cardsContainerStyles}>
            {item.jobNo}
            <div className="card" style={getCardStyle(index)}>
              <h2></h2>
              <div className="bigsquare"></div>
            </div>
            ))
          </div>

          <div className="expanding-btn" onClick={handleExpand}>
            <div className="square1"></div>
            <div className="expand-btn-container">
              <img
                id="expandimg"
                width="35"
                height="35"
                src="https://img.icons8.com/forma-regular-filled/100/000000/forward.png"
                alt="forward"
                style={expandImgStyles}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpandingCards;
