import React, { useState, useEffect } from "react";
import {
  Typography,
  Input,
  Button,
  Tag,
  Form,
  InputNumber,
  message,
} from "antd";
import { getUserBranch } from "../services/api";
import { useNavigate } from "react-router-dom";
import { notification, Select, Spin, Breadcrumb } from "antd"; // Import Select and Spin from Ant Design
import axios from "axios";
import "./ARCurrentOS.css";
const { Option } = Select;
const { Title } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const DocumentMapping = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [form] = Form.useForm();
  const [documentData, setDocumentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [branchNames, setBranchNames] = useState([]);
  const [branchName, setBranchName] = useState("");

  // Fetch API Data
  const fetchDocumentData = async (branchCode, branch, finYear, finYearId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/master/getPendingMappingDetails`,
        {
          params: { branchCode, branch, finYear, finYearId },
        }
      );

      if (response.data.statusFlag === "Ok") {
        const pendingData =
          response.data.paramObjectsMap.pendingDocTypeMappingDetails || [];

        const mappedData = pendingData.map((item, index) => ({
          key: `${index + 1}`,
          branch: item.branch,
          branchCode: item.branchCode,
          createdBy: "admin",
          finYear: item.finYear,
          finYearId: item.finYearId,
          docTypeMappingDetailsDTO: [
            {
              branch: item.branch,
              branchCode: item.branchCode,
              docCode: item.docCode,
              finYear: item.finYear,
              finYearId: item.finYearId,
              lastNo: item.lastNo,
              prefix: item.prefix,
              screenCode: item.screenCode,
              screenName: item.screenName,
            },
          ],
        }));

        setDocumentData(mappedData);
        setFilteredData(mappedData);
        setLoading(false);
      } else {
        message.warning("No pending mapping details found!");
        setDocumentData([]);
        setFilteredData([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch document mapping details");
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
  }, []);

  const handleBranchChange = (selectedBranchName) => {
    setBranchName(selectedBranchName); // Update state
    const selectedBranch = branchNames.find(
      (branch) => branch.branchName === selectedBranchName
    );

    if (selectedBranch) {
      form.setFieldsValue({
        branchCode: selectedBranch.branchCode,
      });
    }
  };

  useEffect(() => {
    const { branch, branchCode, finYear, finYearId } = form.getFieldsValue();

    // Only call API if all fields are filled AND we haven't fetched yet
    if (branch && branchCode && finYear && finYearId && !hasFetchedData) {
      fetchDocumentData(branchCode, branch, finYear, finYearId);
      setHasFetchedData(true); // Mark as fetched
    }
  }, [form.getFieldsValue(), hasFetchedData]);

  const onFinish = (values) => {
    const { branch, branchCode, finYear, finYearId } = values;
    fetchDocumentData(branchCode, branch, finYear, finYearId);
  };
  // Filter search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(documentData);
      return;
    }

    const filtered = documentData.filter((item) => {
      const searchString =
        `${item.branchCode} ${item.branch} ${item.finYear}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, documentData]);

  // Flatten data
  const tableData = filteredData.flatMap((item) =>
    item.docTypeMappingDetailsDTO.map((detail) => ({
      key: `${item.key}-${detail.screenCode}`,
      ...item,
      ...detail,
    }))
  );

  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(tableData.length / pageSize);

  const handleSubmit = async () => {
    try {
      // Build payload using the form values and tableData
      const values = form.getFieldsValue();
      const payload = {
        branch: values.branch,
        branchCode: values.branchCode,
        createdBy: "admin",
        docTypeMappingDetailsDTO: tableData.map((row) => ({
          branch: row.branch,
          branchCode: row.branchCode,
          docCode: row.docCode || null,
          finYear: parseInt(row.finYear),
          finYearId: row.finYearId,
          lastNo: row.lastNo,
          prefix: row.prefix,
          screenCode: row.screenCode,
          screenName: row.screenName,
        })),
        finYear: parseInt(values.finYear),
        finYearId: values.finYearId,
        orgId: 0,
      };

      console.log("Payload being sent:", payload);

      const response = await axios.put(
        `${API_URL}/api/master/createDocTypeMapping`, // Update with correct API endpoint
        payload
      );

      if (response.data.statusFlag === "Ok") {
        message.success("Document mapping saved successfully!");
      } else {
        message.warning(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error saving document mapping:", error);
      message.error("Failed to save document mapping");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        minHeight: "80vh",
        padding: "20px",
        marginTop: "50px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "20px",
          color: "white",
          minWidth: "180vh",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            onClick={() => navigate(-1)}
            style={{
              border: "1px solid white",
              background: "transparent",
              color: "white",
            }}
          >
            Back
          </Button>
          <Title level={3} style={{ color: "white", margin: "0 auto" }}>
            Document Numbering Configuration
          </Title>
          <div style={{ width: "100px" }}></div>
        </div>
        <br />

        {/* Form for Branch, Year details */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginBottom: "20px" }}
          //   onValuesChange={() => {
          //     // Trigger useEffect by changing dependency
          //     setFilteredData([]); // just to re-render
          //   }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))",
              gap: "16px",
            }}
          >
            <Form.Item
              name="branch"
              label={<span style={{ color: "white" }}>Branch</span>}
              rules={[{ required: true }]}
            >
              <Select
                id="branch-select"
                value={branchName}
                onChange={handleBranchChange}
                style={{
                  marginBottom: "8px",
                  marginLeft: "32px",
                  background: "transparent",
                  color: "white", // White text for selected value
                  border: "1px solid white",
                  marginLeft: "5px",
                }}
                dropdownStyle={{
                  background: "transparent", // Dark background for dropdown
                  color: "white", // White text for options
                }}
                placeholder="Select Branch"
                popupClassName="white-dropdown" // For additional custom styling
              >
                <Option
                  value=""
                  style={{ color: "white", background: "transparent" }}
                >
                  Select Branch
                </Option>
                {branchNames && branchNames.length > 0 ? (
                  branchNames.map((branch) => (
                    <Option
                      key={branch.branchCode}
                      value={branch.branchName}
                      style={{ color: "white" }} // White text for each option
                    >
                      {branch.branchName}
                    </Option>
                  ))
                ) : (
                  <Option value="" style={{ color: "white" }}>
                    No branches available
                  </Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name="branchCode"
              label={
                <span style={{ color: "white", marginLeft: "15px" }}>
                  Branch Code
                </span>
              }
              rules={[{ required: true }]}
            >
              <Input
                readOnly // Recommended to prevent manual edits
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                }}
              />
              
            </Form.Item>
            <Form.Item
              name="finYear"
              label={<span style={{ color: "white" }}>Financial Year</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
                className="white-number-input"
              />
            </Form.Item>
            <Form.Item
              name="finYearId"
              label={<span style={{ color: "white" }}>Fin Year ID</span>}
              rules={[{ required: true }]}
            >
              <Input
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                }}
                className="white-number-input"
              />
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                style={{
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                }}
              >
                Fetch Data
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  height: "40px",
                  marginTop: "16px",
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </div>
        </Form>

        {/* Custom Table */}
        <table
          style={{
            width: "100%",
            borderSpacing: "0 8px",
            background: "transparent",
            lineHeight: "2",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Branch</th>
              <th style={thStyle}>Branch Code</th>
              <th style={thStyle}>Financial Year</th>
              <th style={thStyle}>Screen Name</th>
              <th style={thStyle}>Screen Code</th>
              <th style={thStyle}>Prefix</th>
              <th style={thStyle}>Last Number</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.key} style={{ color: "white" }}>
                <td style={tdStyle}>{row.branch}</td>
                <td style={tdStyle}>{row.branchCode}</td>
                <td style={tdStyle}>{row.finYear}</td>
                <td style={tdStyle}>
                  <Tag color="blue">{row.screenName}</Tag>
                </td>
                <td style={tdStyle}>{row.screenCode}</td>
                <td style={tdStyle}>{row.prefix}</td>
                <td style={tdStyle}>{row.lastNo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {tableData.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
              color: "white",
            }}
          >
            <span style={{ marginRight: "16px", fontSize: "12px" }}>
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, tableData.length)} of{" "}
              {tableData.length}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={paginationBtnStyle}
            >
              Prev
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={paginationBtnStyle}
            >
              Next
            </Button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                marginLeft: "8px",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  color: "white",
  fontWeight: "500",
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  fontSize: "12px",
};

const tdStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "11px",
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(255,255,255,0.05)",
};

const paginationBtnStyle = {
  backgroundColor: "rgba(255,255,255,0.1)",
  color: "white",
  border: "none",
  margin: "0 4px",
  padding: "4px 12px",
  borderRadius: "6px",
};

export default DocumentMapping;
