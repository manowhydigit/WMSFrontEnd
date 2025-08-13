import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Toolbar,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
  Paper,
  Grid,
} from "@mui/material";
import { notification } from "antd";
import { useWindowSize } from "react-use";
import axios from "axios";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordPopup from "../utils/ResetPassword";
import idea from "../idea.png";
import { gsap } from "gsap";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { ArrowDropDown, ArrowDropUp, Clear } from "@mui/icons-material";
import "./Header.css";
import confetti from "canvas-confetti";
import {
  getHaiCustomerDetails,
  getPartyLedgerPartyName,
  getHaiBranchCustomerDetails,
  getHaiInvCustomerDetails,
  getHaiCustomerRankDetails,
  getHaiProductSummary,
  getHaiCustomerYearProfit,
  getJobFullDetails,
} from "../services/api";
import GaugeSpeedometer from "./GaugeSpeedometer";
import { Doughnut } from "react-chartjs-2";
import DChart from "./DChart";
import SplitChart from "./SplitChart";
import Confetti from "react-confetti";
import TiltCard from "./TiltCard";
import userpng from "../user.png";
import logoonly from "../logoonly.png";
import MonthGraph from "./MonthGraph";
import Typewriter from "./Typewriter";
import giphybrain5 from "../giphybrain5.gif";
import aibrain1 from "../aibrain1.png";
const { Text } = Typography;
const getPowerEmoji = (index) => {
  const emojis = ["💫", "⚡", "🧠", "🔮", "💪", "🦅", "👻"];
  return emojis[index];
};

const SuperPowerModal = ({ open, onClose }) => {
  const powers = [
    {
      name: "Customer",
      description: "View and manage customer information",
      color: "#FF6B6B",
      type: "CUSTOMER",
    },
    {
      name: "Vendor",
      description: "View and manage vendor information",
      color: "#4ECDC4",
      type: "VENDOR",
    },
    {
      name: "Product",
      description: "View and manage product information",
      color: "#45B7D1",
      type: "PRODUCT",
    },
    {
      name: "AI",
      description: "View and manage employee information",
      color: "#96C93D",
      type: "AI",
    },
    {
      name: "Job",
      description: "View and manage employee information",
      color: "#96C93D",
      type: "JOB",
    },
  ];

  const [currentPower, setCurrentPower] = useState(0);
  const [particles, setParticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [cusdata, setCusData] = useState([]);
  const [party, setParty] = useState("");
  const [ptype, setPtype] = useState("");
  const [partyNames, setPartyNames] = useState([]);
  const [showConfetti, setShowConfetti] = useState(true);
  const [selectedType, setSelectedType] = useState(powers[0].type);

  const [showDropdown, setShowDropdown] = useState(false);
  const [totalDue, setTotalDue] = useState(0); // Initialize with 0
  const [selectedParty, setSelectedParty] = useState(null); // Track the selected party
  const [filteredParties, setFilteredParties] = useState([]);
  const [invdata, setInvData] = useState([]);
  const [yeardata, setYearData] = useState([]);
  const [rankinvdata, setRankInvData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [jobFullData, setJobFullData] = useState([]);
  const { width, height } = useWindowSize(); // Automatically adjusts confetti to window size
  const buttonRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [isYearSelected, setIsYearSelected] = useState(false);

  const [rawData, setRawData] = useState([]);
  const [totDue, setTotDue] = useState(0);
  const [brcusdata, setBrCusData] = useState([]);
  const textRef = useRef(null);
  const iconRef = useRef(null);
  const hasCelebrated = useRef(false);
  const [yearchartData, setYearChartData] = useState([]);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Completely prevent calculations when modal is closed
  const shouldCalculate = useMemo(() => {
    return open && mountedRef.current;
  }, [open]);

  // Null all data when closing
  const handleClose = useCallback(() => {
    if (mountedRef.current) {
      setCusData(null);
      setPartyNames(null);
      setInvData(null);
      setRankInvData(null);
      setProductData(null);
      setBrCusData(null);
      setYearData(null);
    }
    onClose();
  }, [onClose]);

  const backgroundColors = [
    "#2b92d8",
    "#2ab96a",
    "#e9c061",
    "#d95d6b",
    "#9173d8",
    "#9966FF",
    "#FF66B2",
    "#FF6666",
    "#66FF66",
    "#66FFFF",
    "#FF9966",
    "#FF33FF",
    "#00FFFF",
    "#99CCFF",
    "#CC99FF",
    "#FFCC99",
  ];

  const hoverBackgroundColors = [
    "#2b92d8",
    "#2ab96a",
    "#e9c061",
    "#d95d6b",
    "#9173d8",
    "#9966FF",
    "#FF66B2",
    "#FF6666",
    "#66FF66",
    "#66FFFF",
    "#FF9966",
    "#FF33FF",
    "#00FFFF",
    "#99CCFF",
    "#CC99FF",
    "#FFCC99",
  ];

  useEffect(() => {
    console.log("Current productData:", productData);
  }, [productData]);

  useEffect(() => {
    console.log("Current jobFullData:", jobFullData);
  }, [jobFullData]);

  const [periodType, setPeriodType] = useState("month");

  const togglePeriod = () => {
    setPeriodType((prev) => (prev === "month" ? "year" : "month"));
  };

  const handleCheckboxChange = () => {
    const newValue = !isYearSelected;
    console.log("Toggling checkbox to:", isYearSelected);
    setIsYearSelected(newValue);
  };

  // const customerDetails = cusdata.flatMap((item) => [
  //   {
  //     name: (
  //       <>
  //         Category: <br /> {item.category}
  //         <br />
  //         Credit Days / Limit
  //         <br />
  //         {item.creditDays} / {item.creditLimit.toLocaleString("en-IN")}
  //       </>
  //     ),
  //     description: `Credit Days / Limit: ${item.creditDays} / ${item.creditLimit}`,
  //     color: "#4ECDC4",
  //     type: "VENDOR",
  //   },
  //   {
  //     name: (
  //       <>
  //         Ctrl Office: <br /> {item.ctrlOffice}
  //         <br />
  //         SalesPerson
  //         <br />
  //         {item.salesPersonName}
  //       </>
  //     ),
  //     description: `Salesperson: ${item.salesPersonName}`,
  //     color: "#96C93D",
  //     type: "EMPLOYEE",
  //   },
  //   {
  //     name: (
  //       <>
  //         On Year:
  //         <br />
  //         {item.onYear}
  //         <br />
  //         Total Due: <br /> {item.totDue.toLocaleString("en-IN")}
  //         <br />
  //       </>
  //     ),
  //     description: `Category: ${item.category}, Ctrl Office: ${item.ctrlOffice}, On Year: ${item.onYear}`,
  //     color: "#45B7D1",
  //     type: "PRODUCT",
  //   },
  // ]);

  const fetchPartyNames = useCallback(async (type = "JOB") => {
    setLoading(true);
    try {
      const actualType = type === "AI" ? "CUSTOMER" : type;
      const response = await getPartyLedgerPartyName(actualType);
      setPartyNames(response || []);
      console.log("partyName", response); // Use response directly as state may not update immediately
    } catch (error) {
      console.error("Error fetching party names:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch party names",
      });
      setPartyNames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // For daily fetching
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastFetchDate = localStorage.getItem("lastPartyNamesFetchDate");

    if (lastFetchDate !== today) {
      fetchPartyNames("Job"); // Default to "Job" on first load
      localStorage.setItem("lastPartyNamesFetchDate", today);
    }
  }, [fetchPartyNames]);

  const uniqueCusData =
    selectedType === "PRODUCT"
      ? [
          ...new Map(
            productData.map((item) => {
              const key = JSON.stringify({
                jobs: item.jobs,
                openJobs: item.openJobs,
                closedJobs: item.closedJobs,
                salesPersonName: item.salesPersonName ?? null,
              });
              return [key, item];
            })
          ).values(),
        ]
      : [
          ...new Map(
            cusdata.map((item) => {
              const key = JSON.stringify({
                category: item.category,
                creditDays: item.creditDays,
                creditLimit: item.creditLimit,
                ctrlOffice: item.ctrlOffice,
                salesPersonName: item.salesPersonName,
                onYear: item.onYear,
              });
              return [key, item];
            })
          ).values(),
        ];
  // console.log("uniqueCusData", uniqueCusData);

  // Handle window resize

  // Show confetti only if rank is 1, and stop it after 5 seconds

  // const customerDetails = uniqueCusData.flatMap((item) => [
  //   {
  //     name: (
  //       <>
  //         On Year
  //         <br />
  //         Rank
  //         <br />
  //         Credit Days
  //         <br />
  //         Limit
  //         <br />
  //         SalesPerson
  //         <br />
  //       </>
  //     ),
  //     description: (
  //       <>
  //         {item.onYear} <br /> {0} <br /> {item.creditDays} <br />
  //         {item.creditLimit.toLocaleString("en-IN")}
  //         <br />
  //         {item.salesPersonName}
  //       </>
  //     ),
  //     color: "#4ECDC4",
  //     type: "VENDOR",
  //   },
  //   // {
  //   //   name: (
  //   //     <>
  //   //       Ctrl Office: <br /> {item.ctrlOffice}
  //   //       <br />
  //   //       SalesPerson
  //   //       <br />
  //   //       {item.salesPersonName}
  //   //     </>
  //   //   ),
  //   //   description: `Salesperson: ${item.salesPersonName}`,
  //   //   color: "#96C93D",
  //   //   type: "EMPLOYEE",
  //   // },
  //   {
  //     name: (
  //       <>
  //         Invoice
  //         <br />
  //         Credit Note
  //         <br />
  //         Collection
  //         <br />
  //         Service
  //       </>
  //     ),
  //     description: (
  //       <>
  //         {0} <br /> {0} <br /> {0} <br />
  //         {0}
  //       </>
  //     ),
  //     color: "#45B7D1",
  //     type: "PRODUCT",
  //   },
  // ]);

  // const customerDetails = uniqueCusData.flatMap((item) => {

  //   const getAmount = (screen) => {
  //     const entry = invdata.find(
  //       (inv) => inv.screen === screen && inv.partyCode === item.partyCode
  //     );
  //     return entry
  //       ? (Number(entry.amt) / 100000).toFixed(0).toLocaleString("en-IN") + " L"
  //       : "0";
  //   };

  //   return [
  //     {
  //       name: (
  //         <>
  //           On Board
  //           <br />
  //           Rank
  //           <br />
  //           Credit Days
  //           <br />
  //           Limit
  //         </>
  //       ),
  //       description: (
  //         <>
  //           {item.onYear} <br /> {0} <br /> {item.creditDays} <br />
  //           {item.creditLimit.toLocaleString("en-IN")}
  //         </>
  //       ),
  //       color: "#4ECDC4",
  //       type: "VENDOR",
  //     },
  //     {
  //       name: (
  //         <>
  //           Invoice
  //           <br />
  //           Credit Note
  //           <br />
  //           Collection
  //           <br />
  //           Service
  //         </>
  //       ),
  //       description: (
  //         <>
  //           {getAmount("Invoice")} <br />
  //           {getAmount("Credit Note")} <br />
  //           {getAmount("Receipt")} <br />
  //           {getAmount("Service")}
  //         </>
  //       ),
  //       color: "#45B7D1",
  //       type: "PRODUCT",
  //     },
  //   ];
  // });

  const topRankCustomer = rankinvdata.find((rank) => rank.r === 1);
  useEffect(() => {
    if (topRankCustomer) {
      setShowConfetti(true);

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [topRankCustomer]);

  const customerDetails = uniqueCusData.flatMap((item) => {
    const getAmount = (screen) => {
      const entry = invdata.find(
        (inv) => inv.screen === screen && inv.partyCode === item.partyCode
      );
      return entry
        ? (Number(entry.amt) / 100000).toFixed(0).toLocaleString("en-IN") + " L"
        : "0";
    };

    const rankEntry = rankinvdata.find(
      (rank) => rank.customer === item.partyName
    );

    // Only define product-related functions when needed
    let getProductCount;
    if (selectedType === "PRODUCT") {
      getProductCount = (label) => {
        if (!productData || !Array.isArray(productData)) {
          console.warn("Product data not available");
          return 0;
        }
        const entry = productData.find((prod) => prod.jobs === label);
        console.log(`Looking for ${label}, found:`, entry);
        return entry ? entry.count : 0;
      };
    }

    return [
      // About section - for CUSTOMER or VENDOR
      (selectedType === "CUSTOMER" || selectedType === "VENDOR") && {
        name: (
          <>
            <strong style={{ marginLeft: "100px" }}>About</strong>
            <br />
            On Board
            <br />
            Code
            <br />
            Credit Days
            <br />
            Limit
          </>
        ),
        description: (
          <>
            {}
            <br />
            {item.onYear} <br /> {item.partyCode || 0} <br /> {item.creditDays}{" "}
            <br />₹
            {(item.creditLimit / 100000).toFixed(2).toLocaleString("en-IN") +
              " L"}
          </>
        ),
        color: "#4ECDC4",
        type: "VENDOR",
      },

      // Product Summary - only for PRODUCT type
      selectedType === "PRODUCT" && {
        name: (
          <>
            <strong style={{ marginLeft: "70px" }}>Summary</strong>
            <br />
            Total Jobs
            <br />
            Open Jobs
            <br />
            Closed Jobs
          </>
        ),
        description: (
          <>
            {}
            <br />
            {item.jobs} <br />
            {item.openJobs} <br />
            {item.closedJobs}
          </>
        ),
        color: "#FFA726",
        type: "PRODUCT",
      },

      // Recent section - CUSTOMER specific
      selectedType === "CUSTOMER" && {
        name: (
          <>
            <strong style={{ marginLeft: "100px" }}>Recent</strong>
            <br />
            Invoice
            <br />
            Credit Note
            <br />
            Collection
            <br />
            Service
          </>
        ),
        description: (
          <>
            {}
            <br />₹{getAmount("Invoice")} <br />₹{getAmount("Credit Note")}{" "}
            <br />₹{getAmount("Receipt")} <br />
            {getAmount("Service")}
          </>
        ),
        color: "#45B7D1",
        type: "PRODUCT",
      },

      // Recent section - VENDOR specific
      selectedType === "VENDOR" && {
        name: (
          <>
            <strong style={{ marginLeft: "100px" }}>Recent</strong>
            <br />
            Cost Invoice
            <br />
            Debit Note
            <br />
            Payment
            <br />
            Service
          </>
        ),
        description: (
          <>
            {}
            <br />₹{getAmount("Cost Invoice")} <br />₹{getAmount("Debit Note")}{" "}
            <br />₹{getAmount("Payment")} <br />
            {getAmount("Service")}
          </>
        ),
        color: "#45B7D1",
        type: "PRODUCT",
      },

      // Analytics section - CUSTOMER specific
      (selectedType === "CUSTOMER" || selectedType === "PRODUCT") && {
        name: (
          <>
            <strong style={{ marginLeft: "70px" }}>Last Month</strong>
            <br />
            Rank
            <br />
            Jobs
            <br />
            Income
            <br />
            {selectedType != "PRODUCT" && "Profit"}
          </>
        ),
        description: (
          <>
            {}
            <br />
            <span className={rankEntry?.r === 1 ? "highlight" : ""}>
              {rankEntry?.r || 0}
            </span>{" "}
            {rankEntry?.r === 1 && showConfetti && (
              <Confetti width={width} height={height} />
            )}
            <br />
            {rankEntry?.totJob} <br />₹
            {(rankEntry?.income / 100000)?.toFixed(0).toLocaleString("en-IN") ||
              "0"}{" "}
            L <br />
            {selectedType !== "PRODUCT" && (
              <>
                ₹
                {(rankEntry?.profit / 100000)
                  ?.toFixed(0)
                  .toLocaleString("en-IN") || "0"}{" "}
                L
              </>
            )}
          </>
        ),
        color: "#FF6B6B",
        type: "ANALYTICS",
      },
    ].filter(Boolean); // This removes any falsey values (including null/undefined)
  });

  // console.log("customerDetails", customerDetails);

  const handleClearSelection = () => {
    setSelectedParty(null);
    setSearchTerm("");
    setShowDropdown(true);
  };
  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch data when modal opens or selectedType changes
  useEffect(() => {
    if (open && selectedType) {
      fetchPartyNames(selectedType);
    }
  }, [open, selectedType]);

  // Fetch party names with wildcard search
  // const fetchPartyNames = useCallback(async (type) => {
  //   setLoading(true);
  //   try {
  //     const actualType = type === "AI" ? "CUSTOMER" : type;
  //     const response = await getPartyLedgerPartyName(actualType);
  //     setPartyNames(response || []);
  //     console.log("partyName", partyNames);
  //   } catch (error) {
  //     console.error("Error fetching party names:", error);
  //     notification.error({
  //       message: "Error",
  //       description: "Failed to fetch party names",
  //     });
  //     setPartyNames([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((type, searchTerm) => {
      fetchPartyNames(type, searchTerm);
    }, 500),
    [fetchPartyNames]
  );

  // Handle search term changes
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (selectedType) {
      debouncedSearch(selectedType, value);
    }
  };

  // Handle power selection
  const handlePowerClick = (index) => {
    setCurrentPower(index);
    const type = powers[index].type;
    setSelectedType(type);
    setSearchTerm("");
    fetchPartyNames(type);
  };

  const handlePartySelect = (party) => {
    setSelectedParty(party);
    setShowDropdown(false);
    // You can add additional handling here
    console.log("Selected party:", party);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = partyNames.filter((party) =>
        (party.subledgerName || party)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredParties(filtered);
    } else {
      setFilteredParties(partyNames);
    }
  }, [searchTerm, partyNames]);

  // const fetchData = (selectedValue) => {
  //   setLoading(true);

  //   getHaiCustomerDetails(selectedValue)
  //     .then((response) => {
  //       // Set data state with the updated data (result + grand total)
  //       setCusData(response);

  //       // totalDue = response.paramObjectsMap.gethaiCustomerDetails.totDue || 0;

  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       notification.error({
  //         message: "Data Fetch Error",
  //         description: "Failed to fetch updated data for the GET HAI.",
  //       });
  //       setLoading(true);

  //       getHaiBranchCustomerDetails(selectedValue)
  //         .then((response) => {
  //           setBrCusData(response);
  //           console.log("brCusData", brcusdata);
  //           setLoading(false);
  //         })
  //         .catch(() => {
  //           notification.error({
  //             message: "Data Fetch Error",
  //             description:
  //               "Failed to fetch updated data for the GET HAI (Branch).",
  //           });
  //           setLoading(false);
  //         });

  //       setLoading(false);
  //     });
  // };

  const fetchData = (selectedValue, selectedType) => {
    setLoading(true);

    getHaiCustomerDetails(selectedValue, selectedType)
      .then((response) => {
        if (response) {
          setCusData(response);
          setLoading(false); // ✅ Important to end loading on success
        } else {
          throw new Error("Empty response"); // force fallback
        }
      })
      .catch(() => {
        notification.error({
          message: "Data Fetch Error",
          description:
            "Failed to fetch data from GET HAI. Trying branch-level...",
        });
        setLoading(false); // ✅ Important to end loading on success
        // ✅ Now trigger fallback
      });
  };

  const fetchData1 = async (selectedValue, selectedType) => {
    setLoading(true);
    try {
      const response = await getHaiBranchCustomerDetails(
        selectedValue,
        selectedType
      );
      setBrCusData(response);
      console.log("Branch API Response:", brcusdata); // Debug log

      // Check if response has data
      if (
        response &&
        response.paramObjectsMap &&
        response.paramObjectsMap.gethaiBranchCustomerDetails
      ) {
        setBrCusData(response.paramObjectsMap.gethaiBranchCustomerDetails);
      } else {
        console.warn("No branch data found in response");
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branch customer data",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData2 = async (selectedValue, selectedType) => {
    setLoading(true);
    try {
      const response = await getHaiInvCustomerDetails(
        selectedValue,
        selectedType
      );
      setInvData(response);
      console.log("Branch API Response:", invdata); // Debug log

      // Check if response has data
      if (
        response &&
        response.paramObjectsMap &&
        response.paramObjectsMap.gethaiInvCustomerDetails
      ) {
        setInvData(response.paramObjectsMap.gethaiInvCustomerDetails);
      } else {
        console.warn("No branch data found in response");
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branch customer data",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData3 = async (selectedValue, selectedType) => {
    setLoading(true);
    try {
      const response = await getHaiCustomerRankDetails(
        selectedValue,
        selectedType
      );
      setRankInvData(response);
      console.log("Branch API Response rankinvdata:", rankinvdata); // Debug log

      // Check if response has data
      if (
        response &&
        response.paramObjectsMap &&
        response.paramObjectsMap.gethaiCustomerRankDetails
      ) {
        setInvData(response.paramObjectsMap.gethaiCustomerRankDetails);
      } else {
        console.warn("No branch data found in response");
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branch customer data",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData4 = async (selectedValue) => {
    setLoading(true);
    try {
      const response = await getHaiProductSummary(selectedValue);
      console.log("API Response:", response); // Debug the full response

      // Extract the array from the nested structure
      const productSummary = response;

      // console.log("Extracted product data:", productSummary); // Debug extracted data
      setProductData(productSummary);
      console.log("Extracted productData:", productData); // Debug extracted data
    } catch (error) {
      console.error("Error fetching product data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch product data",
      });
      setProductData([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchData5 = async (selectedValue, selectedType) => {
    setLoading(true);
    try {
      const response = await getHaiCustomerYearProfit(
        selectedValue,
        selectedType
      );
      setYearData(response);
      console.log("Branch API Response Year Data:", yeardata); // Debug log

      // Check if response has data
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branch customer data",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData6 = async (selectedValue) => {
    setLoading(true);
    try {
      const response = await getJobFullDetails(selectedValue);
      setJobFullData(response);
      console.log("Job Full Details Data:", jobFullData); // Debug log

      // Check if response has data
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Data Fetch Error",
        description: "Failed to fetch branch customer data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only when modal is open and selectedType/selectedParty changes

  const monthMap = {
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
  };

  const convertToChartData = (yearDataArray = [], year = "2024") => {
    const result = [];

    // Handle case where data might be empty or invalid
    if (!Array.isArray(yearDataArray) || yearDataArray.length === 0) {
      console.warn("Invalid or empty yearDataArray:", yearDataArray);
      return result;
    }

    // Get the first object from the array (assuming that's what you want)
    const yearDataObj = yearDataArray[0];

    Object.keys(monthMap).forEach((key) => {
      // Convert key to lowercase to match your API response (e.g., "apr" vs "APR")
      const lowercaseKey = key.toLowerCase();
      const rawValue = yearDataObj[lowercaseKey] ?? 0;
      const valueInLacs = (rawValue / 100000).toFixed(0);
      const valueNum = parseFloat(valueInLacs);

      result.push({
        value: valueNum,
        height: `${Math.min(
          Math.max(Math.round((valueNum / 100) * 100), 0),
          100
        )}%`,
        caption: `${monthMap[key]}`,
      });
    });

    return result;
  };
  useEffect(() => {
    if (yeardata) {
      // Check if yeardata exists and has data
      const convertedData = convertToChartData(yeardata); // Pass yeardata to the function
      setYearChartData(convertedData);
      console.log("yearchartData:", convertedData); // Log the converted data directly
    }
  }, [yeardata]);

  const chartData1a = {
    total: 64,
    wedges: [
      { id: "a", color: "#4FC1E9", value: 10 },
      { id: "b", color: "#A0D468", value: 16 },
      { id: "c", color: "#ED5565", value: 24 },
      { id: "d", color: "#AC92EC", value: 14 },
    ],
  };

  // const chartData = {
  //   total: brcusdata?.reduce((sum, item) => sum + (item.totDue || 0), 0) || 0,
  //   wedges:
  //     brcusdata?.map((item, index) => ({
  //       id: item.branchCode || `branch-${index}`,
  //       color: ["#4FC1E9", "#A0D468", "#ED5565", "#AC92EC"][index % 4],
  //       value: item.totDue || 0,
  //     })) || [],
  // };

  const [data1, setData1] = useState({
    total: 0,
    wedges: [],
  });
  useEffect(() => {
    const newData = {
      total:
        brcusdata
          ?.reduce((sum, item) => sum + item.totDue / 100000, 0)
          .toFixed(0) || 0,

      wedges:
        brcusdata
          ?.map((item, index) => ({
            id: item.branchCode || `branch-${index}`,
            color: ["#4FC1E9", "#A0D468", "#ED5565", "#AC92EC"][index % 4],
            value: (item.totDue / 100000).toFixed(0) || 0,
          }))
          .sort((a, b) => b.value - a.value) || [], // ✅ sort descending || [],
    };

    setData1(newData);
    // console.log("chardata1", data1);
  }, [brcusdata]);

  useEffect(() => {
    console.log("brcusdata updated:", brcusdata);
  }, [brcusdata]);

  useEffect(() => {
    console.log("data1 updated:", data1);
  }, [data1]);

  const updatePower = (index) => {
    setCurrentPower(index);
  };

  // const chartData = [
  //   { title: "Tokyo", value: 120, color: "#2C3E50" },
  //   { title: "San Francisco", value: 80, color: "#FC4349" },
  //   { title: "New York", value: 70, color: "#6DBCDB" },
  //   { title: "London", value: 50, color: "#F7E248" },
  //   { title: "Sydney", value: 40, color: "#D7DADB" },
  //   { title: "Berlin", value: 20, color: "#FFF" },
  // ];

  const handleTypeChange = (value) => {
    setPtype(value); // Update the Type state
    fetchPartyByType(value); // Fetch Party Names based on selected Type
  };

  // Fetch parties based on selected Type
  const fetchPartyByType = (selectedType) => {
    setLoading(true); // Set loading to true when fetching data
    getPartyLedgerPartyName(selectedType)
      .then((response) => {
        setParty(response); // Update party state with fetched data
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(() => {
        notification.error({
          message: "Data Fetch Error",
          description: "Failed to fetch Party Names based on selected Type.",
        });
        setLoading(false);
      });
  };

  const colors = [
    "#0669AD",
    "#E62A39",
    "#FEDA3E",
    "#4CAF50",
    "#FF9800",
    "#FF66B2",
    "#FF6666",
    "#66FF66",
    "#66FFFF",
    "#FF9966",
    "#FF33FF",
    "#00FFFF",
    "#99CCFF",
    "#CC99FF",
    "#FFCC99",
  ];
  const multiGraphData = brcusdata
    .slice() // optional: to avoid mutating original array
    .sort((a, b) => b.totDue - a.totDue) // sort descending
    .map((item, index) => ({
      name: item.branchCode,
      percentage: Number((item.totDue / 100000).toFixed(0)) || 0,
      fill: colors[index % colors.length],
      due: item.totDue,
    }));

  // console.log("multiGraphData", multiGraphData);

  let currentAngle = 0;
  const graphData = multiGraphData.map((item) => {
    const angle = item.percentage * 1.8; // Each percentage = 1.8 deg (180 total)
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      startAngle,
      angle,
    };
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          overflow: "hidden",
          maxHeight: "100vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(78,205,196,0.2) 100%)",
          color: "white",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          height: "100px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "'Playfair Display', serif",
            fontWeight: "bold",
          }}
        >
          HAI
        </Typography>
        <Box
          sx={{
            display: "flex",
            // justifyContent: "space-between",
            marginBottom: "2rem",
            gap: "0.7rem",
            flexWrap: "wrap",
            marginLeft: "-300px",
          }}
        >
          {powers.map((power, index) => (
            <Box
              key={index}
              onClick={() => {
                updatePower(index);
                setSelectedType(power.type); // Sets the selected type (e.g., "VENDOR")
              }}
              sx={{
                flex: 1,
                minWidth: "30px",
                maxWidth: "60px",
                minHeight: "30px",
                maxHeight: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                opacity: currentPower === index ? 1 : 0.6,
                transition: "all 0.3s ease",
                cursor: "pointer",
                padding: "0.7rem",
                borderRadius: "12px",
                // background: "rgba(255, 255, 255, 0.1)",
                // border:
                //   currentPower === index
                //     ? "1px solid rgba(255, 255, 255, 0.3)"
                //     : "1px solid transparent",
                // backdropFilter: "blur(5px)",
                // boxShadow:
                //   currentPower === index
                //     ? "0 8px 15px rgba(255, 255, 255, 0.1)"
                //     : "0 4px 6px rgba(0, 0, 0, 0.1)",
                // "&:hover": {
                //   opacity: 1,
                //   transform: "scale(1.05)",
                //   borderColor: "rgba(255, 255, 255, 0.3)",
                //   background: "rgba(255, 255, 255, 0.15)",
                // },
              }}
            >
              <Typography sx={{ fontSize: "1.6rem" }}>
                {getPowerEmoji(index)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  textAlign: "center",
                  fontWeight: 500,
                  color: "white",
                }}
              >
                {power.name}
              </Typography>
            </Box>
          ))}

          {/* <div
            class="form__group field"
            style={{ marginRight: "-300px", marginTop: "20px" }}
          >
            <input
              type="input"
              class="form__field"
              placeholder="Search..."
              required=""
            />
            <label for="name" class="form__label">
              Search
            </label>
          </div>{" "} */}
          {/* } */}
          <div
            class="form__group field"
            // style={{ marginRight: "-300px", marginTop: "20px" }}
            style={{
              marginRight: "-300px",
              marginTop: "20px",
              position: "relative",
              width: "300px",
              backgroundColor: "transparent",
              color: "white",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                backgroundColor: "transparent",
                color: "white",
              }}
            >
              {/* Search Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder={`Search ${powers[currentPower].name}...`}
                style={{
                  width: "125%",
                  padding: "10px 16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {/* Dropdown List */}
              {showDropdown && searchTerm && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 5px)",
                    left: 0,
                    right: 0,
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "300px",
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        color: "#333",
                      }}
                    >
                      Loading...
                    </div>
                  ) : partyNames.length > 0 ? (
                    partyNames
                      .filter((party) => {
                        const partyName = (party.subledgerName || party)
                          .toString()
                          .toLowerCase();
                        return partyName.includes(searchTerm.toLowerCase());
                      })
                      .map((party, index) => (
                        <div
                          key={`party-${index}`}
                          style={{
                            padding: "8px 16px",
                            color: "#333",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            transition: "background-color 0.2s ease",
                            backgroundColor:
                              selectedParty === party ? "#f5f5f5" : "white",
                            ":hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                          onClick={() => {
                            const selectedValue = party.subledgerName || party;
                            setSearchTerm(selectedValue);
                            setSelectedParty(party);
                            setShowDropdown(false);

                            // Fetch data based on selected type
                            if (selectedType === "AI") {
                              // For AI, we still want to fetch customer data
                              fetchData(selectedValue, "CUSTOMER");
                              fetchData1(selectedValue, "CUSTOMER");
                              fetchData2(selectedValue, "CUSTOMER");
                              fetchData3(selectedValue, "CUSTOMER");
                              fetchData5(selectedValue, "CUSTOMER");
                            } else {
                              fetchData(selectedValue, selectedType);
                              fetchData1(selectedValue, selectedType);
                              fetchData2(selectedValue, selectedType);
                              fetchData3(selectedValue, selectedType);
                              if (selectedType === "PRODUCT") {
                                fetchData4(selectedValue);
                              }
                              fetchData5(selectedValue, selectedType);
                              if (selectedType === "JOB") {
                                fetchData6(selectedValue);
                              }
                            }
                          }}
                        >
                          {party.subledgerName || party}
                        </div>
                      ))
                  ) : (
                    <div
                      style={{
                        padding: "12px 16px",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No results found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Search and Dropdown */}
        </Box>

        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "2rem",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(69, 183, 209, 0.1) 0%, transparent 50%)",
        }}
      >
        <Box
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              opacity: 0.8,
              marginBottom: "2rem",
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 200,
            }}
          >
            {/* Discover Your Ultimate Power */}
          </Typography>

          {/* <Box
            sx={{
              position: "relative",
              marginBottom: "2rem",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {particles.map((particle) => (
                <Box
                  key={particle.id}
                  sx={{
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    backgroundColor: particle.color,
                    borderRadius: "50%",
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </Box>
          </Box> */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2rem",
              gap: "0.7rem",
              flexWrap: "wrap",
            }}
          >
            {customerDetails.map((power, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  minWidth: "90px",
                  // maxWidth: "400px",
                  maxWidth: "250px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.7rem",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backdropFilter:
                    showDropdown || searchTerm ? "none" : "blur(5px)",
                  boxShadow: "0 8px 15px rgba(255, 255, 255, 0.1)",
                  opacity: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.15)",
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.6rem" }}>
                  {/* {getPowerEmoji(index)} */}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    textAlign: "center",
                    fontWeight: 500,
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span style={{ textAlign: "left" }}>{power.name}</span>
                  <span style={{ textAlign: "right" }}>
                    {power.description}
                  </span>
                </Typography>
              </Box>
            ))}
          </Box>

          {/* {multiGraphData[0].name && ( */}
          {customerDetails.length > 0 && (
            <Box
              sx={{
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter:
                  showDropdown || searchTerm ? "none" : "blur(5px)",
                height: "250px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  marginBottom: "1rem",
                  background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {/* {powers[currentPower].name} */}
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                {/* <label
                  className="cyberpunk-checkbox-label"
                  style={{
                    marginTop: "-30px",
                    marginBottom: "30px",
                    fontSize: "14px",
                    width: "100px",
                  }}
                >
                  <input
                    type="checkbox"
                    className="cyberpunk-checkbox"
                    checked={isYearSelected}
                    onChange={handleCheckboxChange}
                    // onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                  />
                  Year Profit
                </label> */}

                <div class="checkbox-container">
                  <input
                    class="checkbox-input"
                    id="hacker-checkbox"
                    type="checkbox"
                    checked={isYearSelected}
                    onChange={handleCheckboxChange}
                  />
                  <label class="checkbox-label" for="hacker-checkbox">
                    <span class="checkmark"></span>
                    <div class="grid-bg"></div>
                    <div class="glitch-overlay-h"></div>
                    <div class="glitch-overlay-v"></div>
                    <div class="binary-particles">
                      <span
                        style={{ left: "10%", animationDelay: "-0s" }}
                        class="particle"
                      >
                        1
                      </span>
                      <span
                        style={{ left: "30%", animationDelay: "-0.2s" }}
                        class="particle"
                      >
                        0
                      </span>
                      <span
                        style={{ left: "50%", animationDelay: "-0.4s" }}
                        class="particle"
                      >
                        1
                      </span>
                      <span
                        style={{ left: "70%", animationDelay: "-0.6s" }}
                        class="particle"
                      >
                        0
                      </span>
                      <span
                        style={{ left: "90%", animationDelay: "-0.8s" }}
                        class="particle"
                      >
                        1
                      </span>
                    </div>
                  </label>
                </div>
                <div
                  style={{
                    marginTop: "-60px",
                    marginLeft: "-580px",
                    marginBottom: "40px",
                  }}
                >
                  Year Profit
                </div>

                {/* {powers[currentPower].description} */}
                {/* {multiGraphData[0].name && ( */}
                {customerDetails.length > 0 && !isYearSelected && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "80px", // Increase this value as needed
                      marginTop: "1px",
                    }}
                  >
                    <GaugeSpeedometer
                      // value={(cusdata[0].totDue / 100000).toFixed(0)}
                      value={
                        data1.wedges.reduce(
                          (sum, wedge) => sum + wedge.value * 100000,
                          0
                        ) / 100000
                      }
                      // display={`L - Due`}
                      display={
                        selectedType === "CUSTOMER" || selectedType === "VENDOR"
                          ? "L - Due"
                          : "L - Profit"
                      }
                    />
                  </div>
                )}
                {!isYearSelected && (
                  <SplitChart
                    multiGraphData={multiGraphData}
                    display={
                      selectedType === "CUSTOMER"
                        ? uniqueCusData[0]?.salesPersonName
                        : null
                    }
                    selectedType={selectedType}
                  />
                )}

                {isYearSelected && (
                  <div>
                    <MonthGraph yearchartData={yearchartData} />
                  </div>
                )}

                {/* <TiltCard /> */}
                {/* <div className="data-summary">
                  {multiGraphData.map((item, index) => (
                    <div key={index} style={{ color: item.fill }}>
                      {item.name}: {item.percentage}
                    </div>
                  ))}
                </div> */}
                {/* <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "80px", // Increase this value as needed
                  marginTop: "-150px",
                  marginLeft: "550px",
                }}
              >
                {cusdata[0]?.totDue && (
                  <GaugeSpeedometer
                    value={(cusdata[0].totDue / 100000).toFixed(0)}
                    display={`L - OS`}
                  />
                )}
              </div> */}
              </Typography>
            </Box>
          )}

          {selectedType == "AI" && (
            <Box
              sx={{
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter:
                  showDropdown || searchTerm ? "none" : "blur(5px)",
                minHeight: "250px", // Minimum height
                maxHeight: "600px", // Maximum height to prevent excessive growth
              }}
            >
              <Typewriter
                uniqueCusData={uniqueCusData}
                selectedParty={selectedParty}
                searchTerm={searchTerm}
                rankinvdata={rankinvdata}
                brcusdata={brcusdata}
              />
            </Box>
          )}

          {selectedType === "JOB" && (
            <Box
              sx={{
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter:
                  showDropdown || searchTerm ? "none" : "blur(5px)",
                minHeight: "250px",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              {jobFullData?.length > 0 && jobFullData[0] ? (
                <Grid container spacing={2}>
                  {Object.entries(jobFullData[0]).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Typography variant="caption" sx={{ color: "#ccc" }}>
                        {key.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#fff" }}>
                        {value?.toString() || "-"}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography sx={{ color: "#ccc" }}>
                  No job details available.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "1rem 2rem",
          background: "rgba(15, 23, 42, 0.7)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      ></DialogActions>
    </Dialog>
  );
};

export default SuperPowerModal;
