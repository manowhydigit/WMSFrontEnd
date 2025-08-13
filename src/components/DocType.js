import React, { useState } from "react";
import {
  Typography,
  Input,
  Button,
  Table,
  Tag,
  Form,
  Select,
  Card,
  message,
  InputNumber,
} from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import "./ARCurrentOS.css";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";
const DocType = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  // Sample data with the new structure
  const [documentData, setDocumentData] = useState([
    {
      key: "1",
      branchCodePos: 1,
      codePattern: "${branchCode}/${finYear}/${seq}",
      docCode: null,
      docCodePos: 0,
      finYearPos: 2,
      orgId: "0",
      screenCode: "PO",
      screenName: "PURCHASE ORDER",
      seqDigit: 6,
      seqPos: 3,
    },
  ]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Prepare the payload
      const payload = {
        branchCodePos: parseInt(values.branchCodePos, 10),
        codePattern: values.codePattern,
        docCode: values.docCode || null,
        docCodePos: parseInt(values.docCodePos, 10),
        finYearPos: parseInt(values.finYearPos, 10),
        orgId: "0", // Assuming orgId is always "0" as in sample data
        screenCode: values.screenCode,
        screenName: values.screenName,
        seqDigit: parseInt(values.seqDigit, 10),
        seqPos: parseInt(values.seqPos, 10),
      };

      // Make PUT request to the endpoint
      const response = await axios.put(
        `${API_URL}/api/master/createDocType`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Add any additional headers like authorization if needed
            // 'Authorization': `Bearer ${yourToken}`
          },
        }
      );

      if (response.status === 200) {
        message.success("Document type created successfully!");
        // Optionally update local state or refresh data
        setDocumentData([
          ...documentData,
          {
            key: `${documentData.length + 1}`,
            ...payload,
          },
        ]);
        form.resetFields();
      } else {
        throw new Error("Failed to create document type");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        error.response?.data?.message || "Failed to create document type"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const columns = [
    {
      title: "Screen Code",
      dataIndex: "screenCode",
      key: "screenCode",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Screen Name",
      dataIndex: "screenName",
      key: "screenName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Code Pattern",
      dataIndex: "codePattern",
      key: "codePattern",
    },
    {
      title: "Sequence Digits",
      dataIndex: "seqDigit",
      key: "seqDigit",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Branch Code Position",
      dataIndex: "branchCodePos",
      key: "branchCodePos",
    },
    {
      title: "Fin Year Position",
      dataIndex: "finYearPos",
      key: "finYearPos",
    },
    {
      title: "Sequence Position",
      dataIndex: "seqPos",
      key: "seqPos",
    },
  ];

  return (
    <div
      className="ar-current-os-unique-container"
      style={{
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        minHeight: "80vh",
        padding: "20px",
        marginTop: "50px",
      }}
    >
      <Card
        className="glass-card"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          color: "white",
          minWidth: "150vh",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            onClick={handleBack}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
            }}
          >
            Back
          </Button>
          <Title
            level={3}
            style={{ color: "white", margin: "0 auto", textAlign: "center" }}
          >
            Document Type
          </Title>
          <div style={{ width: "100px" }}></div>
        </div>
        <br />

        <Form
          form={form}
          layout="vertical"
          style={{ marginBottom: "20px", color: "white" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
              color: "white",
            }}
          >
            <Form.Item
              name="screenCode"
              label={<span style={{ color: "white" }}>Screen Code</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="e.g., PO"
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              name="screenName"
              label={<span style={{ color: "white" }}>Screen Name</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="e.g., PURCHASE ORDER"
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              name="codePattern"
              label={<span style={{ color: "white" }}>Code Pattern</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="e.g., ${branchCode}/${finYear}/${seq}"
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              name="seqDigit"
              label={<span style={{ color: "white" }}>Sequence Digits</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                max={10}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item
              name="branchCodePos"
              label={
                <span style={{ color: "white" }}>Branch Code Position</span>
              }
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item
              name="finYearPos"
              label={
                <span style={{ color: "white" }}>Financial Year Position</span>
              }
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item
              name="seqPos"
              label={<span style={{ color: "white" }}>Sequence Position</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item
              name="docCodePos"
              label={<span style={{ color: "white" }}>Doc Code Position</span>}
            >
              <InputNumber
                min={0}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  width: "100%",
                }}
                className="summary-row"
              />
            </Form.Item>
          </div>

          <Form.Item>
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
        </Form>
      </Card>
    </div>
  );
};

export default DocType;
