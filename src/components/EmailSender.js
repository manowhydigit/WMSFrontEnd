import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiMail,
  FiDownload,
  FiFileText,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiX,
  FiPlus,
  FiList,
  FiEye,
  FiFile,
} from "react-icons/fi";
import {
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Modal,
  Upload,
  Switch,
  notification,
  Spin,
  ConfigProvider,
  Divider,
  Form,
  Descriptions,
} from "antd";
import "./EmailSender.css";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const EmailSender = () => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const tableContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const scrollHandlerRef = useRef();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bccAddress, setBccAddress] = useState("");

  // Add these state variables near your other useState declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/mail`);
      setFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      notification.error({
        message: "Error",
        description: "Failed to load documents",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchFiles();

    // Set up interval for periodic fetching
    const intervalId = setInterval(fetchFiles, 10000); // 10 seconds

    // Scroll event listener setup
    const container = tableContainerRef.current;
    const handleScroll = () => {
      setIsScrolling(true);
      const timeout = setTimeout(() => setIsScrolling(false), 300);
      return () => clearTimeout(timeout);
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    // Cleanup function
    return () => {
      clearInterval(intervalId); // Clear the interval
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  //   useEffect(() => {
  //     fetchFiles();

  //     const container = tableContainerRef.current;

  //     const handleScroll = () => {
  //       setIsScrolling(true);
  //       const timeout = setTimeout(() => setIsScrolling(false), 300);
  //       return () => clearTimeout(timeout);
  //     };

  //     // Add event listener
  //     if (container) {
  //       container.addEventListener("scroll", handleScroll);
  //     }

  //     // Cleanup function - removes event listener when component unmounts
  //     // or before re-running the effect
  //     return () => {
  //       if (container) {
  //         container.removeEventListener("scroll", handleScroll);
  //       }
  //     };
  //   }, [fetchFiles]); // Add any dependencies that should trigger re-establishing the listener

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleFileSelection = (employeeCode) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(employeeCode)) {
      newSelection.delete(employeeCode);
    } else {
      newSelection.add(employeeCode);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((file) => file.employeeCode)));
    }
  };

  const previewTextFile = async (filename) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/mail/content/${filename}`
      );
      setPreviewContent(response.data);
      setPreviewFile(filename);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error previewing file:", error);
      notification.error({
        message: "Error",
        description: "Failed to load document content",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = (filename) => {
    window.open(`${API_URL}/api/mail/download/${filename}`, "_blank");
  };

  const sendSelectedEmails = async () => {
    if (selectedFiles.size === 0) {
      notification.warning({
        message: "Warning",
        description: "Please select at least one document to send",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        employeeCodes: Array.from(selectedFiles),
        bccAddress: bccAddress,
      };

      await axios.post(`${API_URL}/api/mail/send-emails`, payload);

      notification.success({
        message: "Success",
        description: `Successfully sent ${selectedFiles.size} email(s)`,
      });
      setSelectedFiles(new Set());
      await fetchFiles();
      handleCelebrate();
    } catch (error) {
      console.error("Error sending emails:", error);

      // Properly handle the error response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send emails";

      notification.error({
        message: "Error",
        description: errorMessage, // Only show the message string
      });
    } finally {
      setLoading(false);
    }
  };

  //   const sendSelectedEmails = async () => {
  //     if (selectedFiles.size === 0) {
  //       notification.warning({
  //         message: "Warning",
  //         description: "Please select at least one document to send",
  //       });
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       await axios.post(
  //         `${API_URL}/api/mail/send-emails`,
  //         Array.from(selectedFiles)
  //       );
  //       notification.success({
  //         message: "Success",
  //         description: `Successfully sent ${selectedFiles.size} email(s)`,
  //       });
  //       setSelectedFiles(new Set());
  //       await fetchFiles();
  //       handleCelebrate();
  //     } catch (error) {
  //       console.error("Error sending emails:", error);
  //       notification.error({
  //         message: "Error",
  //         description: error.response?.data || "Failed to send emails",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const filteredFiles = files.filter(
    (file) =>
      file.employeeCode.toLowerCase().includes(searchText.toLowerCase()) ||
      file.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate paginated data
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
  };

  const handleImageClick = () => {
    // window.history.back(); // Takes the user to the previous page
    navigate("/PS");
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className={`performance-goals-gd-container ${
          theme === "dark" ? "dark-mode" : ""
        }`}
      >
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
                // className="form-headerSG"
                style={{
                  padding: "1px",
                  color: "white",
                  textAlign: "center",
                  maxHeight: "500px",
                  marginTop: "-20px",
                }}
              >
                <h3 className="performance-heading">EMail Sender</h3>
                <p style={{ opacity: 0.9, fontWeight: 500, fontSize: "16px" }}>
                  Manage and send employee documents
                </p>
              </div>

              <div className="content-section">
                <div
                  className="action-bar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px", // Reduced overall gap
                    marginLeft: "200px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Search Input - slightly wider */}
                  <div style={{ flex: 1, maxWidth: "300px" }}>
                    {" "}
                    {/* Increased from 200px */}
                    <Input
                      placeholder="Search by employee code or email"
                      prefix={<FiSearch style={{ color: "white" }} />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid #ADB5BD",
                        color: "white",
                      }}
                    />
                  </div>

                  {/* BCC Input - slightly wider */}

                  {/* Buttons with reduced gap */}
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "auto",
                      alignItems: "center", // Ensures vertical alignment
                    }}
                  >
                    <Button
                      onClick={selectAllFiles}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "1px solid white",
                        padding: "0 10px",
                        marginRight: "5px", // Negative margin to pull buttons together
                      }}
                    >
                      {selectedFiles.size === files.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    <Button
                      type="primary"
                      icon={<FiMail />}
                      onClick={sendSelectedEmails}
                      disabled={loading || selectedFiles.size === 0}
                      loading={loading}
                      style={{
                        backgroundColor:
                          loading || selectedFiles.size === 0
                            ? "transparent"
                            : "rgba(48, 207, 208, 0.3)",
                        color: "white",
                        border: "1px solid white",
                        cursor:
                          loading || selectedFiles.size === 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: loading || selectedFiles.size === 0 ? 0.6 : 1,
                        transition: "all 0.3s ease",
                        padding: "0 10px",
                        marginLeft: "0", // Remove any default margin
                      }}
                    >
                      Send Selected ({selectedFiles.size})
                    </Button>
                  </div>
                </div>

                <Divider
                  orientation="left"
                  style={{ color: "white", marginLeft: "200px" }}
                >
                  Mailing Details
                </Divider>

                <div
                  style={{
                    flex: 1,
                    maxWidth: "250px",
                    marginLeft: "400px",
                    marginTop: "-40px",
                  }}
                >
                  {" "}
                  {/* Increased from 200px */}
                  <Input
                    placeholder="BCC Email Address"
                    value={bccAddress}
                    onChange={(e) => setBccAddress(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid #ADB5BD",
                      color: "white",
                    }}
                  />
                </div>
                <div
                  className="table-container"
                  ref={tableContainerRef}
                  style={{
                    position: "relative",
                    overflowX: "auto",
                    // backgroundColor: "transparent",
                    maxHeight: "400px",
                    overflowY: "auto",
                    marginTop: "20px",
                    maxWidth: "900px",
                    marginLeft: "200px",
                  }}
                >
                  <table
                    style={{
                      width: "max-content",
                      minWidth: "90%",
                      borderCollapse: "collapse",
                      backgroundColor: "transparent",
                      marginLeft: "10px",
                      lineHeight: "1.5", // Add this for base line height
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "30px" }} /> {/* Checkbox */}
                      <col style={{ width: "30px" }} /> {/* Employee Code */}
                      <col style={{ width: "350px" }} /> {/* Email */}
                      <col style={{ width: "50px" }} /> {/* Actions */}
                    </colgroup>
                    <thead style={{ lineHeight: "2" }}>
                      <tr
                        style={{
                          borderBottom: "1px dashed #000",
                          zIndex: 2,
                          position: "sticky",
                          top: 0,
                          backgroundColor: isScrolling ? "#000" : "transparent",
                        }}
                      >
                        <th
                          style={{
                            padding: "4px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                            lineHeight: "2",
                          }}
                        >
                          #
                        </th>
                        <th
                          style={{
                            padding: "4px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                            lineHeight: "2",
                          }}
                        >
                          Emp Code
                        </th>
                        <th
                          style={{
                            padding: "4px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                            lineHeight: "2",
                          }}
                        >
                          Email
                        </th>
                        <th
                          style={{
                            padding: "4px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "11px",
                            lineHeight: "2",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedFiles.map((file, index) => (
                        <tr
                          key={file.employeeCode}
                          style={{
                            borderBottom: "1px dashed white",
                            color: "white",
                            padding: "4px",
                            fontSize: "12px",
                            lineHeight: "1",
                          }}
                        >
                          <td
                            style={{
                              padding: "4px",
                              textAlign: "center",
                              color: "white",
                              fontSize: "12px",
                              lineHeight: "1",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.employeeCode)}
                              onChange={() =>
                                toggleFileSelection(file.employeeCode)
                              }
                              style={{
                                cursor: "pointer",
                                appearance: "none", // Removes default styling
                                WebkitAppearance: "none", // For Safari
                                width: "16px",
                                height: "16px",
                                border: "1px solid white", // White border
                                borderRadius: "2px", // Optional: if you want rounded corners
                                backgroundColor: "transparent",
                                position: "relative",
                              }}
                              // Add this CSS to your stylesheet or style tag
                              className="custom-checkbox"
                            />
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "12px",
                              lineHeight: "1",
                            }}
                          >
                            {file.employeeCode}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "12px",
                              lineHeight: "1",
                            }}
                          >
                            {file.email || "No email found"}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "8px", // Remove gap completely
                              }}
                            >
                              <Button
                                icon={<FiEye />}
                                onClick={() =>
                                  previewTextFile(file.textFileName)
                                }
                                style={{
                                  backgroundColor: "transparent",
                                  color: "white",
                                  border: "1px solid white",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  height: "auto",
                                  marginRight: "-1px", // Negative margin pulls next button closer
                                }}
                              >
                                View
                              </Button>

                              <Button
                                icon={<FiFile />}
                                onClick={() => downloadPdf(file.pdfFileName)}
                                style={{
                                  backgroundColor: "transparent",
                                  color: "white",
                                  border: "1px solid white",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  height: "auto",
                                  marginLeft: "0px", // Reset any default margin
                                }}
                              >
                                PDF
                              </Button>
                            </div>
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
                      paddingRight: "250px",
                      color: "white",
                    }}
                  >
                    <span style={{ marginRight: "16px", fontSize: "12px" }}>
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, filteredFiles.length)}{" "}
                      of {filteredFiles.length} items
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
                      { length: Math.ceil(filteredFiles.length / pageSize) },
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
                            Math.ceil(filteredFiles.length / pageSize)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(filteredFiles.length / pageSize)
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
                          Math.ceil(filteredFiles.length / pageSize)
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          currentPage ===
                          Math.ceil(filteredFiles.length / pageSize)
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

              <Modal
                title={null}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width="80%"
                closable={false}
                className="glass-card-modal"
                bodyStyle={{
                  padding: 0,
                  background: "transparent",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  marginTop: "-50px",
                }}
              >
                <div
                  className="glass-card"
                  style={{
                    width: "100%",
                    maxWidth: "1000px",
                    border: "1px white solid",
                  }}
                >
                  <button
                    className="close-popup"
                    onClick={() => setIsModalVisible(false)}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "20px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "24px",
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                  >
                    &times;
                  </button>

                  <div className="card-header">
                    <p>Document Preview - {previewFile}</p>
                  </div>

                  <div
                    className="document-content"
                    style={{
                      padding: "20px",
                      maxHeight: "70vh",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      color: "white",
                    }}
                  >
                    {previewContent}
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EmailSender;
