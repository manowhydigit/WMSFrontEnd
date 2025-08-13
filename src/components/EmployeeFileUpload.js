import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  message,
  Form,
  Row,
  Col,
  Card,
  Input,
  DatePicker,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "./VendorModal.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const EmployeeFileUpload = () => {
  const [employeeRows, setEmployeeRows] = useState([
    {
      email: "",
      emailSubject: "",
      scheduledTime: null,
      textFile: null,
      pdfFile: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/employeemaster/getAllEmployees`
      );
      setAvailableEmployees(response.data.paramObjectsMap.empMasVO || []);
    } catch (error) {
      message.error("Failed to fetch employees");
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...employeeRows];
    newRows[index][field] = value;
    setEmployeeRows(newRows);
  };

  const handleFileChange = (index, field, info) => {
    const newRows = [...employeeRows];

    if (info.file.status === "removed") {
      newRows[index][field] = null;
    } else {
      // Store the file object directly when selected (before upload)
      newRows[index][field] = info.file.originFileObj || info.file;
    }

    setEmployeeRows(newRows);
  };

  const addEmployeeRow = () => {
    setEmployeeRows([
      ...employeeRows,
      {
        email: "",
        emailSubject: "",
        scheduledTime: null,
        textFile: null,
        pdfFile: null,
      },
    ]);
  };

  const removeEmployeeRow = (index) => {
    if (employeeRows.length <= 1) {
      message.warning("You need at least one employee row");
      return;
    }
    const newRows = [...employeeRows];
    newRows.splice(index, 1);
    setEmployeeRows(newRows);
  };

  const validateForm = () => {
    for (let i = 0; i < employeeRows.length; i++) {
      const row = employeeRows[i];
      if (!row.email) {
        message.error(`Please enter email for employee ${i + 1}`);
        return false;
      }
      if (!row.textFile && !row.pdfFile) {
        message.error(`Please upload at least one file for employee ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();

      employeeRows.forEach((row, index) => {
        // Append employee data
        formData.append(`employees[${index}][employeeEmail]`, row.email);
        formData.append(
          `employees[${index}][emailSubject]`,
          row.emailSubject || ""
        );

        if (row.scheduledTime) {
          formData.append(
            `employees[${index}][scheduledTime]`,
            moment(row.scheduledTime).toISOString()
          );
        }

        // Handle text file with proper filename

        const textFilename = row.textFile.name || `employee_${index}_text.txt`;
        formData.append(
          `employees[${index}][textFile]`,
          new Blob([row.textFile], {
            type: row.textFile.type || "text/plain",
          }),
          textFilename
        );

        // Handle PDF file with proper filename

        const pdfFilename =
          row.pdfFile.name || `employee_${index}_document.pdf`;
        formData.append(
          `employees[${index}][pdfFile]`,
          new Blob([row.pdfFile], {
            type: row.pdfFile.type || "application/pdf",
          }),
          pdfFilename
        );
      });

      // Debug the FormData before sending
      for (let [key, value] of formData.entries()) {
        console.log(
          key,
          value instanceof Blob
            ? `${value.name || "Blob"} (${value.size} bytes, ${value.type})`
            : value
        );
      }

      const response = await axios.post(
        `${API_URL}/api/employeeattachment/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Files uploaded successfully!");
      setEmployeeRows([
        {
          email: "",
          emailSubject: "",
          scheduledTime: null,
          textFile: null,
          pdfFile: null,
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      message.error(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to upload files. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //   const handleSubmit = async () => {
  //     if (!validateForm()) return;

  //     setLoading(true);
  //     try {
  //       const formData = new FormData();

  //       employeeRows.forEach((row, index) => {
  //         formData.append(`employees[${index}][employeeEmail]`, row.email);
  //         formData.append(
  //           `employees[${index}][emailSubject]`,
  //           row.emailSubject || ""
  //         );

  //         if (row.scheduledTime) {
  //           formData.append(
  //             `employees[${index}][scheduledTime]`,
  //             moment(row.scheduledTime).toISOString()
  //           );
  //         }

  //         // Handle text file upload
  //         if (row.textFile) {
  //           formData.append(
  //             `employees[${index}][textFile]`,
  //             row.textFile,
  //             row.textFile.name || "textfile.txt"
  //           );
  //         }

  //         // Handle PDF file upload
  //         if (row.pdfFile) {
  //           formData.append(
  //             `employees[${index}][pdfFile]`,
  //             row.pdfFile,
  //             row.pdfFile.name || "pdffile.pdf"
  //           );
  //         }
  //       });

  //       const response = await axios.post(
  //         `${API_URL}/api/employeeattachment/upload`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       message.success("Files uploaded successfully!");
  //       // Reset form but keep one empty row
  //       setEmployeeRows([
  //         {
  //           email: "",
  //           emailSubject: "",
  //           scheduledTime: null,
  //           textFile: null,
  //           pdfFile: null,
  //         },
  //       ]);
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //       message.error(
  //         error.response?.data?.message ||
  //           "Failed to upload files. Please try again."
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleSubmit = async () => {
  //     if (!validateForm()) return;

  //     setLoading(true);
  //     try {
  //       const formData = new FormData();

  //       // First add all metadata as JSON
  //       const employeeData = employeeRows.map((row) => ({
  //         employeeEmail: row.email,
  //         emailSubject: row.emailSubject || "",
  //         scheduledTime: row.scheduledTime
  //           ? moment(row.scheduledTime).toISOString()
  //           : null,
  //       }));
  //       formData.append("employeeData", JSON.stringify(employeeData));

  //       // Then add all files in order (text1, pdf1, text2, pdf2, ...)
  //       employeeRows.forEach((row) => {
  //         if (row.textFile) {
  //           formData.append("files", row.textFile);
  //         }
  //         if (row.pdfFile) {
  //           formData.append("files", row.pdfFile);
  //         }
  //       });

  //       const response = await axios.post(
  //         `${API_URL}/api/employeeattachment/bulk-upload`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       message.success(response.data.message || "Files uploaded successfully!");
  //       // Reset form but keep one empty row
  //       setEmployeeRows([
  //         {
  //           email: "",
  //           emailSubject: "",
  //           scheduledTime: null,
  //           textFile: null,
  //           pdfFile: null,
  //         },
  //       ]);
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //       message.error(
  //         error.response?.data?.message ||
  //           error.response?.data ||
  //           "Failed to upload files. Please try again."
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <div
      className="ar-current-os-unique-container"
      style={{
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        minHeight: "70vh",
        padding: "20px",
        marginTop: "60px",
        color: "white",
      }}
    >
      <Card
        title={
          <span style={{ color: "white" }}>
            Employee File Upload & Email Scheduling
          </span>
        }
        className="glass-card"
        style={{
          margin: 20,
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        headStyle={{
          color: "white",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Form layout="vertical">
          {employeeRows.map((row, index) => (
            <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
              <Col span={5}>
                <Form.Item
                  label={<span style={{ color: "white" }}>Employee Email</span>}
                  required
                >
                  <Input
                    placeholder="Enter email"
                    value={row.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value)
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span style={{ color: "white" }}>Email Subject</span>}
                >
                  <Input
                    placeholder="Email subject"
                    value={row.emailSubject}
                    onChange={(e) =>
                      handleInputChange(index, "emailSubject", e.target.value)
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span style={{ color: "white" }}>Schedule Time</span>}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Select schedule time"
                    value={row.scheduledTime ? moment(row.scheduledTime) : null}
                    onChange={(date, dateString) =>
                      handleInputChange(
                        index,
                        "scheduledTime",
                        date ? date.toISOString() : null
                      )
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label={<span style={{ color: "white" }}>TXT File</span>}
                >
                  <Upload
                    accept=".txt"
                    beforeUpload={() => false}
                    onChange={(info) =>
                      handleFileChange(index, "textFile", info)
                    }
                    onRemove={() =>
                      handleFileChange(index, "textFile", {
                        file: { status: "removed" },
                      })
                    }
                    fileList={row.textFile ? [row.textFile] : []}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ color: "white" }}
                    >
                      Upload TXT
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label={<span style={{ color: "white" }}>PDF File</span>}
                >
                  <Upload
                    accept=".pdf"
                    beforeUpload={() => false}
                    onChange={(info) =>
                      handleFileChange(index, "pdfFile", info)
                    }
                    onRemove={() =>
                      handleFileChange(index, "pdfFile", {
                        file: { status: "removed" },
                      })
                    }
                    fileList={row.pdfFile ? [row.pdfFile] : []}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ color: "white" }}
                    >
                      Upload PDF
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={1} style={{ display: "flex", alignItems: "flex-end" }}>
                <Button
                  danger
                  onClick={() => removeEmployeeRow(index)}
                  style={{ marginBottom: 24 }}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Row gutter={16}>
            <Col span={24}>
              <Button
                type="dashed"
                onClick={addEmployeeRow}
                icon={<PlusOutlined />}
                style={{
                  marginBottom: 16,
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                Add Employee
              </Button>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={employeeRows.some((row) => !row.email)}
              style={{ color: "white" }}
            >
              {loading ? "Processing..." : "Submit All"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EmployeeFileUpload;
