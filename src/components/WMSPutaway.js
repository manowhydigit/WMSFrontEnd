import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, message } from "antd";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Input,
  notification,
  Row,
  Space,
  Spin,
  Typography,
  Table,
  Select,
  Form,
  Checkbox,
  Divider,
  Tabs,
  InputNumber,
} from "antd";
import {
  LogoutOutlined,
  MoonOutlined,
  RightCircleOutlined,
  SunOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  SearchOutlined,
  ClearOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

import sampleFile from "../assets/sample-files/sample_Putaway.xls";
import * as XLSX from "xlsx";
import CommonBulkUpload from "../utils/CommonBulkUpload";
import { Modal } from "antd";
import jsPDF from "jspdf";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  MenuItem,
  InputLabel,
  TextField,
  Tab,
} from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { ExcelRenderer } from "react-excel-renderer";
import dayjs from "dayjs";
import axios from "axios";
import "./PS.css";
import { showToast } from "../utils/toast-component";
import samplePutawayExcelFile from "../assets/sample-files/sample_Putaway.xls";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { initCaps } from "../utils/CommonFunctions";
import GeneratePdfTemp from "./PutawayPdf";
import Barcode from "react-barcode";
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const PutawayTable = ({
  putawayTableData,
  setPutawayTableData,
  partNoList,
  binList,
  handleDeleteRow,
  handleTableChange,
  handlePartNoChange,
  handleBinChange,
  freeze,
}) => {
  const columns = [
    {
      title: "Action",
      key: "action",
      fixed: "left",
      width: 80,
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record.id)}
          danger
          type="text"
          style={{ color: "white" }}
          disabled={freeze}
        />
      ),
    },
    {
      title: "S.No",
      key: "sno",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "qrCode", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
    {
      title: "GRN No *",
      dataIndex: "grnNo",
      key: "grnNo",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "grnNo", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
    {
      title: "Part No *",
      dataIndex: "partNo",
      key: "partNo",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Part No"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handlePartNoChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={freeze}
        >
          {partNoList.map((part) => (
            <Option key={part.id} value={part.partno}>
              {part.partno}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Part Desc",
      dataIndex: "partDesc",
      key: "partDesc",
      width: 200,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      render: (text) => (
        <Input value={text} readOnly style={readOnlyInputStyle} />
      ),
    },
    {
      title: "Batch No *",
      dataIndex: "batchNo",
      key: "batchNo",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "batchNo", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
    {
      title: "Bin Location *",
      dataIndex: "bin",
      key: "bin",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Bin"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handleBinChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={freeze}
        >
          {binList.map((bin) => (
            <Option key={bin.id} value={bin.binCode}>
              {bin.binCode}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Batch Date",
      dataIndex: "batchDate",
      key: "batchDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text, "DD-MM-YYYY") : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "batchDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
          format="DD-MM-YYYY"
          disabled={freeze}
        />
      ),
    },
    {
      title: "Exp Date",
      dataIndex: "expDate",
      key: "expDate",
      width: 120,
      render: (text, record) => (
        <DatePicker
          style={datePickerStyle}
          value={text ? dayjs(text, "DD-MM-YYYY") : null}
          onChange={(date) =>
            handleTableChange(
              record.id,
              "expDate",
              date ? date.format("DD-MM-YYYY") : null
            )
          }
          format="DD-MM-YYYY"
          disabled={freeze}
        />
      ),
    },
    {
      title: "Available Qty *",
      dataIndex: "availableQty",
      key: "availableQty",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "availableQty", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
    {
      title: "Putaway Qty *",
      dataIndex: "putawayQty",
      key: "putawayQty",
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "putawayQty", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
    {
      title: "Bin Location *",
      dataIndex: "binLocation",
      key: "binLocation",
      width: 150,
      render: (text, record, index) => (
        <Select
          showSearch
          style={selectStyle}
          placeholder="Select Bin"
          optionFilterProp="children"
          value={text}
          onChange={(value) =>
            handleBinChange(record, index, { target: { value } })
          }
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={freeze}
        >
          {binList.map((bin) => (
            <Option key={bin.id} value={bin.binCode}>
              {bin.binCode}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.id, "remarks", e.target.value)
          }
          style={inputStyle}
          disabled={freeze}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={putawayTableData}
      scroll={{ x: 1500 }}
      bordered
      size="small"
      pagination={false}
    />
  );
};

const { TextArea } = Input;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

// Label Printing Modal Component - Updated to match RowLabelPrintModal style
const LabelPrintModal = ({ visible, onCancel, selectedItems }) => {
  const [numberOfLabels, setNumberOfLabels] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract all items from the selected putaway documents
  const allItems = selectedItems.flatMap((doc) =>
    doc.wtPutawaydtlList.map((item) => ({
      ...item,
      // Add document-level information to each item
      docId: doc.docId,
      docDate: doc.docDate,
      supplier: doc.supplier,
      customer: doc.customer,
    }))
  );

  // Function to generate concatenated barcode value
  const generateBarcodeValue = (item) => {
    let barcodeValue = "";

    if (item.partNo) {
      barcodeValue += `PN:${item.partNo}|`;
    }

    if (item.batchNo) {
      barcodeValue += `BATCH:${item.batchNo}|`;
    }

    if (item.palletNo) {
      barcodeValue += `LOC:${item.palletNo}|`;
    }

    // Remove trailing pipe if exists
    if (barcodeValue.endsWith("|")) {
      barcodeValue = barcodeValue.slice(0, -1);
    }

    return barcodeValue || "NO_DATA";
  };

  const handleClose = () => {
    setPrinting(false);
    setIsDownloading(false);
    onCancel();
  };

  const handlePrint = () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }

    setPrinting(true);

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <html>
            <head>
            <title>Print Labels</title>
            <style>
                @page {
                size: 4in 2in;
                margin: 0;
                }
                html, body {
                margin: 0;
                padding: 0;
                width: 4in;
                height: 2in;
                font-family: Arial, sans-serif;
                background: white;
                color: black;
                }
                .label {
                width: 4in;
                height: 2in;
                position: relative;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                overflow: hidden;
                padding: 0;
                background: white;
                color: black;
                }
                .label-header {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin: 2px 0;
                color: black;
                }
                .info-section {
                display: flex;
                flex-direction: column;
                font-size: 11px;
                line-height: 1.2;
                padding: 0 6px;
                color: black;
                }
                .info-row {
                margin-bottom: 3px;
                color: black;
                }
                .barcode-section {
                text-align: center;
                margin-top: 2px;
                height: 30px;
                }
                .label-footer {
                position: absolute;
                bottom: 2px;
                left: 0;
                width: 100%;
                text-align: center;
                font-size: 10px;
                color: black;
                }
                @media print {
                .label {
                    border: none;
                }
                }
            </style>
            <script src="https://unpkg.com/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            </head>
            <body>
            ${Array.from({ length: numberOfLabels }, (_, labelIndex) =>
              allItems
                .map((item, itemIndex) => {
                  const barcodeValue = generateBarcodeValue(item);
                  return `
                <div class="label">
                    <div class="label-header">PUTAWAY LABEL</div>
                    <div class="info-section">
                    <div class="info-row"><strong>Doc No:</strong> ${
                      item.docId || "N/A"
                    }</div>
                    <div class="info-row"><strong>Part No:</strong> ${
                      item.partNo || "N/A"
                    }</div>
                    <div class="info-row"><strong>Description:</strong> ${
                      item.partDesc || "N/A"
                    }</div>
                    <div class="info-row"><strong>Batch:</strong> ${
                      item.batchNo || "N/A"
                    }</div>
                    <div class="info-row"><strong>Location:</strong> ${
                      item.palletNo || "N/A"
                    }</div>
                    <div class="info-row"><strong>Qty:</strong> ${
                      item.sqty || item.recQty || "N/A"
                    } ${item.sku || "NOS"}</div>
                    </div>
                    <div class="barcode-section">
                    <svg id="barcode-${labelIndex}-${itemIndex}" width="240" height="30"></svg>
                    </div>
                    
                    <div class="label-footer">
                    ${dayjs().format("DD/MM/YYYY")} | Label ${
                    labelIndex * allItems.length + itemIndex + 1
                  } of ${numberOfLabels * allItems.length}
                    </div>
                </div>
                `;
                })
                .join("")
            ).join("")}
            <script>
                window.onload = function() {
                ${Array.from({ length: numberOfLabels }, (_, labelIndex) =>
                  allItems
                    .map((item, itemIndex) => {
                      const barcodeValue = generateBarcodeValue(item);
                      return `
                    JsBarcode("#barcode-${labelIndex}-${itemIndex}", "${barcodeValue}", {
                        format: "CODE128",
                        width: 1.2,
                        height: 30,
                        displayValue: false,
                        margin: 0
                    });
                    `;
                    })
                    .join("")
                ).join("")}
                setTimeout(() => { 
                    window.print(); 
                    window.close();
                }, 300);
                }
            </script>
            </body>
        </html>
        `);

    printWindow.document.close();
    setPrinting(false);
  };

  const handleDownload = async () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const containerId = `label-container-${Date.now()}`;
      const container = document.createElement("div");
      container.id = containerId;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.width = "384px";
      container.style.background = "#fff";
      container.style.color = "#000";
      document.body.appendChild(container);

      for (let labelIndex = 0; labelIndex < numberOfLabels; labelIndex++) {
        for (let itemIndex = 0; itemIndex < allItems.length; itemIndex++) {
          const item = allItems[itemIndex];
          const barcodeValue = generateBarcodeValue(item);
          const label = document.createElement("div");
          label.style.width = "384px";
          label.style.height = "192px";
          label.style.boxSizing = "border-box";
          label.style.position = "relative";
          label.style.border = "1px dotted #ccc";
          label.style.display = "flex";
          label.style.flexDirection = "column";
          label.style.justifyContent = "flex-start";
          label.style.padding = "6px";
          label.style.overflow = "hidden";
          label.style.background = "#fff";
          label.style.color = "#000";

          label.innerHTML = `
                <div style="text-align:center; font-size:16px; font-weight:bold; margin-bottom:4px; color:#000;">PUTAWAY LABEL</div>
                <div style="display:flex; flex-direction:column; font-size:11px; line-height:1.2; margin-bottom:4px; color:#000;">
                <div style="margin-bottom:2px; color:#000;"><strong>Doc No:</strong> ${
                  item.docId || "N/A"
                }</div>
                <div style="margin-bottom:2px; color:#000;"><strong>Part No:</strong> ${
                  item.partNo || "N/A"
                }</div>
                <div style="margin-bottom:2px; color:#000;"><strong>Description:</strong> ${
                  item.partDesc || "N/A"
                }</div>
                <div style="margin-bottom:2px; color:#000;"><strong>Batch:</strong> ${
                  item.batchNo || "N/A"
                }</div>
                <div style="margin-bottom:2px; color:#000;"><strong>Location:</strong> ${
                  item.palletNo || "N/A"
                }</div>
                <div style="margin-bottom:2px; color:#000;"><strong>Qty:</strong> ${
                  item.sqty || item.recQty || "N/A"
                } ${item.sku || "NOS"}</div>
                </div>
                <div style="text-align:center; margin-bottom:2px;">
                <svg id="barcode-download-${containerId}-${labelIndex}-${itemIndex}" width="240" height="30"></svg>
                </div>
                <div style="position:absolute; bottom:4px; left:0; width:100%; text-align:center; font-size:10px; color:#000;">
                ${dayjs().format("DD/MM/YYYY")} | Label ${
            labelIndex * allItems.length + itemIndex + 1
          } of ${numberOfLabels * allItems.length}
                </div>
            `;
          container.appendChild(label);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      for (let labelIndex = 0; labelIndex < numberOfLabels; labelIndex++) {
        for (let itemIndex = 0; itemIndex < allItems.length; itemIndex++) {
          const item = allItems[itemIndex];
          const barcodeValue = generateBarcodeValue(item);

          const barcodeEl = document.getElementById(
            `barcode-download-${containerId}-${labelIndex}-${itemIndex}`
          );
          if (barcodeEl) {
            JsBarcode(barcodeEl, barcodeValue, {
              format: "CODE128",
              width: 1.2,
              height: 30,
              displayValue: false,
              margin: 0,
            });
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const totalHeight = 192 * numberOfLabels * allItems.length;

      const canvas = await html2canvas(container, {
        scale: 2,
        width: 384,
        height: totalHeight,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, numberOfLabels * allItems.length * 2],
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        4,
        numberOfLabels * allItems.length * 2
      );
      pdf.save(`putaway_labels_${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
      message.error("Failed to download labels");
    } finally {
      document
        .querySelectorAll(`[id^="label-container-"]`)
        .forEach((el) => el.remove());
      setIsDownloading(false);
    }
  };

  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <Modal
      title="Print Putaway Labels"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={isDownloading}
          disabled={isDownloading}
        >
          Download PDF
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          loading={printing}
          onClick={handlePrint}
          disabled={printing}
        >
          Print Labels
        </Button>,
      ]}
      width={700}
      styles={{
        body: {
          backgroundColor: "#fff",
          color: "#000",
        },
        content: {
          backgroundColor: "#fff",
          color: "#000",
        },
        header: {
          backgroundColor: "#fff",
          color: "#000",
        },
      }}
    >
      <div style={{ backgroundColor: "#fff", color: "#000", padding: "16px" }}>
        <p style={{ color: "#000" }}>
          This will generate putaway labels for {allItems.length} items across{" "}
          {selectedItems.length} documents.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#000" }}>
            <strong>Number of labels per item:</strong>
          </label>
          <InputNumber
            min={1}
            max={100}
            value={numberOfLabels}
            onChange={(value) => setNumberOfLabels(value)}
            disabled={isDownloading || printing}
            style={{ marginLeft: 8 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <strong style={{ color: "#000" }}>Label Preview (4" x 2"):</strong>
          <div
            style={{
              width: "4in",
              height: "2in",
              border: "1px solid #d9d9d9",
              padding: "8px",
              fontSize: "12px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 8,
              position: "relative",
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "5px",
                color: "#000",
              }}
            >
              PUTAWAY LABEL
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
                marginBottom: "8px",
                fontSize: "11px",
                color: "#000",
              }}
            >
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Doc No:</strong> {allItems[0]?.docId || "N/A"}
              </div>
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Part No:</strong> {allItems[0]?.partNo || "N/A"}
              </div>
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Description:</strong> {allItems[0]?.partDesc || "N/A"}
              </div>
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Batch:</strong> {allItems[0]?.batchNo || "N/A"}
              </div>
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Location:</strong> {allItems[0]?.palletNo || "N/A"}
              </div>
              <div style={{ marginBottom: "2px", color: "#000" }}>
                <strong>Qty:</strong>{" "}
                {allItems[0]?.sqty || allItems[0]?.recQty || "N/A"}{" "}
                {allItems[0]?.sku || "NOS"}
              </div>
            </div>
            <div style={{ textAlign: "center", margin: "5px 0" }}>
              <Barcode
                value={generateBarcodeValue(allItems[0] || {})}
                width={1.2}
                height={30}
                displayValue={false}
                margin={0}
              />
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                position: "absolute",
                bottom: "5px",
                left: 0,
                right: 0,
                color: "#000",
              }}
            >
              {dayjs().format("DD/MM/YYYY")} | Label 1 of{" "}
              {numberOfLabels * allItems.length}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
const WMSPutaway = () => {
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [locationTypeList, setLocationTypeList] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numberOfLabels, setNumberOfLabels] = useState(1);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [loginFinYear, setLoginFinYear] = useState(
    localStorage.getItem("finYear")
  );
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [loginUserId, setLoginUserId] = useState(
    localStorage.getItem("userId")
  );
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginBranch, setLoginBranch] = useState(
    localStorage.getItem("branch")
  );
  const [client, setClient] = useState("CASIO WATCH");
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState("HARW");
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [checkedState, setCheckedState] = useState({});
  const [checkAll, setCheckAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [performanceGoalsData, setPerformanceGoalsData] = useState([]);
  const paginatedData = listViewData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [viewMode, setViewMode] = useState("form");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [gridDetailsTableData, setGridDetailsTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleViewMode = () => {
    if (viewMode === "form") {
      // When switching to list view, refresh the data
      getAllPutAway();
    }
    setViewMode(viewMode === "form" ? "list" : "form");
    handleClear();
  };

  const themeConfig = {
    token: {
      colorPrimary: theme === "dark" ? "#6C63FF" : "#1890ff",
    },
    components: {
      Modal: {
        contentBg: "rgba(255, 255, 255, 0.1)",
        headerBg: "transparent",
        titleColor: "white",
        colorText: "white",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.2)",
      },
    },
  };
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [putawayItems, setPutawayItems] = useState([]);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [selectedItemsForLabels, setSelectedItemsForLabels] = useState([]);

  // Add this function to handle label printing
  const handlePrintLabels = (items = null, count = 1) => {
    const itemsToPrint = items || putawayItems;
    if (itemsToPrint.length === 0) {
      message.warning("No items selected for printing");
      return;
    }

    setSelectedItemsForLabels(itemsToPrint);
    setNumberOfLabels(count);
    setLabelModalVisible(true);
  };

  // Add print button to your table actions
  const addPrintButtonToTable = () => {
    return (
      <Button
        icon={<PrinterOutlined />}
        onClick={() => handlePrintLabels()}
        style={{
          marginRight: "8px",
          background: "rgba(108, 99, 255, 0.3)",
          color: "#fff",
          border: "none",
        }}
        // disabled={putawayItems.length === 0}
      >
        Print Labels
      </Button>
    );
  };

  // Add this function to handle individual row printing
  const handlePrintRowLabel = (row) => {
    handlePrintLabels([row], 1);
  };

  // Modify your table to include a print action for each row
  // In your table columns, add a print action:
  const addPrintActionToRow = () => {
    return {
      title: "Print",
      key: "print",
      width: 80,
      render: (_, record) => (
        <Button
          icon={<PrinterOutlined />}
          onClick={() => handlePrintRowLabel(record)}
          type="text"
          style={{ color: "white" }}
          disabled={formData.freeze}
        />
      ),
    };
  };

  const [formData, setFormData] = useState({
    binClass: "Fixed",
    binPick: "Empty",
    binType: "",
    branch: loginBranch,
    branchCode: loginBranchCode,
    briefDesc: "",
    carrier: "",
    client: loginClient,
    contact: "",
    core: "Multi",
    createdBy: loginUserName,
    customer: loginCustomer,
    docId: "",
    docDate: dayjs().format("DD-MM-YYYY"),
    enteredPerson: "",
    driverName: "",
    entryNo: "",
    entryDate: null,
    finYear: loginFinYear,
    grnDate: null,
    grnNo: "",
    lotNo: "",
    modeOfShipment: "",
    orgId: orgId,
    status: "Edit",
    securityName: "",
    supplier: "",
    supplierShortName: "",
    totalGrnQty: "",
    vehicleType: "",
    vehicleNo: "",
    warehouse: loginWarehouse,
    freeze: false,
    createdOn: dayjs().format("DD-MM-YYYY"),
  });

  const [putAwayDetailsTableData, setPutAwayDetailsTableData] = useState([
    {
      batchNo: "",
      recQty: "",
      binType: "",
      cellType: "ACTIVE",
      noOfBins: "",
      bin: "",
      batchDate: "",
      expDate: "",
      partDesc: "",
      shortQty: "",
      grnQty: "",
      damageQty: "",
      pQty: "",
      invQty: "",
      sku: "",
      ssku: "",
      partNo: "",
    },
  ]);

  const [putAwayTableErrors, setPutAwayTableErrors] = useState([
    {
      batch: "",
      bin: "",
      binType: "",
      cellType: "",
      grnQty: "",
      invNo: "",
      invQty: "",
      partDesc: "",
      partNo: "",
      putAwayQty: "",
      recQty: "",
      remarks: "",
      sku: "",
      ssku: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    binClass: "",
    binPick: "",
    binType: "",
    branch: loginBranch,
    branchCode: loginBranchCode,
    carrier: "",
    client: loginClient,
    core: "",
    createdBy: loginUserName,
    customer: loginCustomer,
    enteredPerson: "",
    entryNo: "",
    entryDate: null,
    finYear: "",
    grnDate: null,
    grnNo: "",
    lotNo: "",
    modeOfShipment: "",
    orgId: orgId,
    status: "",
    supplier: "",
    supplierShortName: "",
    warehouse: loginWarehouse,
    docDate: new Date(),
  });

  const listViewColumns = [
    { accessorKey: "status", header: "Status", size: 140 },
    { accessorKey: "docId", header: "Document No", size: 140 },
    { accessorKey: "docDate", header: "Document Date", size: 140 },
    { accessorKey: "grnNo", header: "GRN No", size: 140 },
    { accessorKey: "grnDate", header: "GRN Date", size: 140 },
    { accessorKey: "entryNo", header: "Entry No", size: 140 },
    { accessorKey: "entryDate", header: "Entry Date", size: 140 },
    { accessorKey: "totalGrnQty", header: "Total Grn Qty", size: 140 },
    { accessorKey: "totalPutawayQty", header: "Total Putaway Qty", size: 140 },
  ];

  const formatPutAwayDataForExcel = (putAwayData) => {
    const excelData = [];

    putAwayData.forEach((mainRecord) => {
      if (
        mainRecord.putAwayDetailsVO &&
        mainRecord.putAwayDetailsVO.length > 0
      ) {
        // Create a row for each detail record
        mainRecord.putAwayDetailsVO.forEach((detail) => {
          excelData.push({
            "Putaway No": mainRecord.docId,
            "Putaway Date": formatDateForDisplay(mainRecord.docDate),
            "GRN No": mainRecord.grnNo,
            "GRN Date": formatDateForDisplay(mainRecord.grnDate),
            "Entry No": mainRecord.entryNo,
            "Entry Date": formatDateForDisplay(mainRecord.entryDate),
            Supplier: mainRecord.supplier,
            "Supplier Short Name": mainRecord.supplierShortName,
            "Mode of Shipment": mainRecord.modeOfShipment,
            Carrier: mainRecord.carrier,
            "Vehicle Type": mainRecord.vehicleType,
            "Vehicle No": mainRecord.vehicleNo,
            "Driver Name": mainRecord.driverName,
            "Security Name": mainRecord.securityName,
            "Bin Type": mainRecord.binType,
            "Bin Class": mainRecord.binClass,
            "Bin Pick": mainRecord.binPick,
            Core: mainRecord.core,
            "Total GRN Qty": mainRecord.totalGrnQty,
            "Total Putaway Qty": mainRecord.totalPutawayQty,
            Status: mainRecord.status,
            Warehouse: mainRecord.warehouse,
            Branch: mainRecord.branch,
            "Created By": mainRecord.createdBy,
            "Created On": formatDateForDisplay(mainRecord.createdOn),
            "Part No": detail.partNo,
            "Part Description": detail.partDesc,
            SKU: detail.sku,
            "Batch No": detail.batch,
            "Batch Date": formatDateForDisplay(detail.batchDt),
            "Expiry Date": formatDateForDisplay(detail.expdate),
            "GRN Qty": detail.grnQty,
            "Putaway Qty": detail.putAwayQty,
            "Bin Location": detail.bin,
            "Bin Type (Detail)": detail.binType,
            "Cell Type": detail.cellType,
            Remarks: detail.remarks,
          });
        });
      } else {
        // Create a row even if there are no details
        excelData.push({
          "Putaway No": mainRecord.docId,
          "Putaway Date": formatDateForDisplay(mainRecord.docDate),
          "GRN No": mainRecord.grnNo,
          "GRN Date": formatDateForDisplay(mainRecord.grnDate),
          "Entry No": mainRecord.entryNo,
          "Entry Date": formatDateForDisplay(mainRecord.entryDate),
          Supplier: mainRecord.supplier,
          "Supplier Short Name": mainRecord.supplierShortName,
          "Mode of Shipment": mainRecord.modeOfShipment,
          Carrier: mainRecord.carrier,
          "Vehicle Type": mainRecord.vehicleType,
          "Vehicle No": mainRecord.vehicleNo,
          "Driver Name": mainRecord.driverName,
          "Security Name": mainRecord.securityName,
          "Bin Type": mainRecord.binType,
          "Bin Class": mainRecord.binClass,
          "Bin Pick": mainRecord.binPick,
          Core: mainRecord.core,
          "Total GRN Qty": mainRecord.totalGrnQty,
          "Total Putaway Qty": mainRecord.totalPutawayQty,
          Status: mainRecord.status,
          Warehouse: mainRecord.warehouse,
          Branch: mainRecord.branch,
          "Created By": mainRecord.createdBy,
          "Created On": formatDateForDisplay(mainRecord.createdOn),
          "Part No": "",
          "Part Description": "",
          SKU: "",
          "Batch No": "",
          "Batch Date": "",
          "Expiry Date": "",
          "GRN Qty": "",
          "Putaway Qty": "",
          "Bin Location": "",
          "Bin Type (Detail)": "",
          "Cell Type": "",
          Remarks: "",
        });
      }
    });

    return excelData;
  };

  const filterDataByDateRange = (data, dateRange) => {
    if (dateRange.length !== 2) return data;

    const fromDate = dayjs(dateRange[0], "DD-MM-YYYY");
    const toDate = dayjs(dateRange[1], "DD-MM-YYYY");

    return data.filter((item) => {
      if (!item.docDate) return false;

      // Convert item date to dayjs object for comparison
      let itemDate;
      try {
        itemDate = dayjs(item.docDate, "DD-MM-YYYY");
        if (!itemDate.isValid()) {
          // Try other date formats if DD-MM-YYYY fails
          itemDate = dayjs(item.docDate);
        }
      } catch (error) {
        console.warn("Error parsing date:", item.docDate, error);
        return false;
      }

      // Check if item date is within the selected range (inclusive)
      return (
        itemDate.isValid() &&
        itemDate.isAfter(fromDate.subtract(1, "day")) &&
        itemDate.isBefore(toDate.add(1, "day"))
      );
    });
  };

  const downloadPutAwayExcel = () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      message.error("Please select both from and to dates");
      return;
    }

    try {
      // Filter data based on selected date range
      const filteredData = filterDataByDateRange(
        listViewData,
        selectedDateRange
      );

      if (filteredData.length === 0) {
        message.error("No data found for the selected date range");
        return;
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Prepare data for Excel - use the filtered data
      const excelData = formatPutAwayDataForExcel(filteredData);

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "PutAway Data");

      // Generate file name with date range
      const fileName = `PutAway_Data_${selectedDateRange[0]}_to_${selectedDateRange[1]}.xlsx`;

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, fileName);

      // Show notification
      notification.success({
        message: "Excel Downloaded",
        description: `PutAway data from ${selectedDateRange[0]} to ${selectedDateRange[1]} has been exported to Excel successfully!`,
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      notification.error({
        message: "Export Failed",
        description: "Error exporting to Excel. Please try again.",
        placement: "topRight",
      });
    }
  };

  useEffect(() => {
    const totalPutawayQty = putawayItems.reduce(
      (sum, row) => sum + (parseFloat(row.putawayQty) || 0),
      0
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      totalPutawayQty: totalPutawayQty,
    }));
  }, [putawayItems]);

  useEffect(() => {
    const initialCheckedState = {};
    gridDetailsTableData.forEach((row) => {
      initialCheckedState[row.id] = false;
    });
    setCheckedState(initialCheckedState);
  }, [gridDetailsTableData]);

  const handleCheckboxChange = (id) => {
    setCheckedState((prevCheckedState) => ({
      ...prevCheckedState,
      [id]: !prevCheckedState[id],
    }));

    const allChecked = gridDetailsTableData.every(
      (row) => checkedState[row.id] || row.id === id
    );
    setCheckAll(allChecked);
  };

  const handleCheckAllChange = () => {
    const updatedCheckAll = !checkAll;
    const newCheckedState = {};
    gridDetailsTableData.forEach((row) => {
      newCheckedState[row.id] = updatedCheckAll;
    });
    setCheckedState(newCheckedState);
    setCheckAll(updatedCheckAll);
  };

  const handlePutawayGrid = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllBinDetails?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );

      const bins = response.data.paramObjectsMap.Bins;

      const selectedRows = gridDetailsTableData.filter(
        (row) => checkedState[row.id]
      );

      const updatedPutawayItems = selectedRows.map((row) => ({
        id: Date.now() + Math.random(),
        partNo: row.partNo || "",
        partDesc: row.partDesc || "",
        batchNo: row.batchNo || "",
        batchDate: row.batchDate || null,
        expDate: row.expDate || null,
        grnQty: row.grnQty || "",
        putawayQty: row.pQty || "",
        location: row.bin || "",
      }));

      setPutawayItems(updatedPutawayItems);
    } catch (error) {
      console.error("Error fetching bin details:", error);
    }

    handleCloseModal();
  };

  const getPutAwayDocId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/putaway/getPutAwayDocId?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}`
      );
      console.log("API Response:", response);

      if (response.data && response.data.paramObjectsMap) {
        setFormData((prevData) => ({
          ...prevData,
          docId: response.data.paramObjectsMap.PutAwayDocId || "",
        }));
      } else {
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getGrnForPutaway = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/putaway/getGrnForPutaway?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`
      );
      setGrnList(response.data.paramObjectsMap.grnVO);
      console.log("grnVo", response.data.paramObjectsMap.grnVO);
    } catch (error) {
      console.error("Error fetching gate passes:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCheckAll(false);
  };

  const getAllLocationTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/locationtype/warehouse?orgid=${orgId}&warehouse=${loginWarehouse}`
      );

      setLocationTypeList(response.data.paramObjectsMap.Locationtype);
      console.log(
        "THE LOCATIONTYPE IS:",
        response.data.paramObjectsMap.Locationtype
      );
    } catch (error) {
      console.error("Error fetching locationType data:", error);
    }
  };

  const getPutawayGridDetails = async () => {
    const errors = {};
    if (!formData.grnNo) {
      errors.grnNo = "Grn No is required";
    }
    if (!formData.binType) {
      errors.binType = "Bin Type is required";
    }
    if (Object.keys(errors).length === 0) {
      setModalOpen(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/putaway/getPutawayGridDetails?binClass=${formData.binClass}&binPick=${formData.binPick}&binType=${formData.binType}&branchCode=${loginBranchCode}&client=${loginClient}&grnNo=${formData.grnNo}&orgId=${orgId}&warehouse=${loginWarehouse}`
        );

        const gridDetails = response.data.paramObjectsMap.gridDetails;

        setGridDetailsTableData(
          gridDetails.map((row) => ({
            id: row.id,
            batchNo: row.batchNo,
            recQty: row.recQty,
            invoiceNo: row.invoiceNo,
            binType: row.binType,
            noOfBins: row.noOfBins,
            bin: row.bin,
            remarks: row.remarks,
            batchDate: row.batchDate,
            expDate: row.expDate,
            partDesc: row.partDesc,
            shortQty: row.shortQty,
            grnQty: row.grnQty,
            damageQty: row.damageQty,
            pQty: row.pQty,
            invQty: row.invQty,
            sku: row.sku, // Ensure SKU is included
            ssku: row.ssku,
            partNo: row.partNo,
          }))
        );

        setPutawayItems(
          gridDetails.map((row) => ({
            id: Date.now() + Math.random(),
            partNo: row.partNo || "",
            partDesc: row.partDesc || "",
            batchNo: row.batchNo || "",
            batchDate: row.batchDate || null,
            expDate: row.expDate || null,
            grnQty: row.grnQty || "",
            putawayQty: row.pQty || "",
            location: row.bin || "",
            sku: row.sku || "", // Add SKU here too
          }))
        );
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getAllPutAway = async () => {
    try {
      setLoading(true);
      console.log(
        "API URL:",
        `${API_URL}/api/wmsputaway/findAllPutaway?branchCode=${branchCode}&client=${client}&finYr=${loginFinYear}`
      );

      const response = await axios.get(
        `${API_URL}/api/wmsputaway/findAllPutaway?branchCode=${branchCode}&client=${client}&finYr=${loginFinYear}`
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response data type:", typeof response.data);

      // Check if response.data exists and log its properties
      if (response.data) {
        console.log("Response data keys:", Object.keys(response.data));
        console.log("Is array:", Array.isArray(response.data));

        let putAwayData = [];

        // Check common response patterns
        if (Array.isArray(response.data)) {
          console.log("Direct array response received");
          putAwayData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log("Response with data property containing array");
          putAwayData = response.data.data;
        } else if (
          response.data.result &&
          Array.isArray(response.data.result)
        ) {
          console.log("Response with result property containing array");
          putAwayData = response.data.result;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          console.log("Response with items property containing array");
          putAwayData = response.data.items;
        } else if (response.data.paramObjectsMap) {
          console.log("Response with paramObjectsMap");
          const mapKeys = Object.keys(response.data.paramObjectsMap);
          console.log("paramObjectsMap keys:", mapKeys);

          // Try common keys that might contain putaway data
          const possibleKeys = [
            "PutAwayVO",
            "putAwayList",
            "putawayList",
            "wmsPutawayList",
            "putawayData",
            "data",
            "result",
            "list",
          ];

          let foundData = false;
          for (const key of possibleKeys) {
            if (
              response.data.paramObjectsMap[key] &&
              Array.isArray(response.data.paramObjectsMap[key])
            ) {
              console.log(`Found data in paramObjectsMap.${key}`);
              putAwayData = response.data.paramObjectsMap[key];
              foundData = true;
              break;
            }
          }

          if (!foundData && mapKeys.length > 0) {
            // Try the first key that contains an array
            for (const key of mapKeys) {
              if (Array.isArray(response.data.paramObjectsMap[key])) {
                console.log(`Using first array key found: ${key}`);
                putAwayData = response.data.paramObjectsMap[key];
                foundData = true;
                break;
              }
            }
          }

          if (!foundData) {
            throw new Error(
              "Unexpected paramObjectsMap structure - no array data found"
            );
          }
        } else if (response.data.status !== undefined) {
          console.log("Response with status property");
          if (response.data.data && Array.isArray(response.data.data)) {
            putAwayData = response.data.data;
          } else if (
            response.data.result &&
            Array.isArray(response.data.result)
          ) {
            putAwayData = response.data.result;
          } else if (
            response.data.putawayList &&
            Array.isArray(response.data.putawayList)
          ) {
            putAwayData = response.data.putawayList;
          } else {
            throw new Error("Status response but no array data found");
          }
        } else if (
          response.data.putawayList &&
          Array.isArray(response.data.putawayList)
        ) {
          console.log("Response with putawayList property");
          putAwayData = response.data.putawayList;
        } else if (
          response.data.wmsPutawayList &&
          Array.isArray(response.data.wmsPutawayList)
        ) {
          console.log("Response with wmsPutawayList property");
          putAwayData = response.data.wmsPutawayList;
        } else {
          console.error("Unknown response format:", response.data);
          throw new Error("Unexpected data format received");
        }

        console.log("Extracted putaway data:", putAwayData);
        console.log("Number of records:", putAwayData.length);

        if (putAwayData.length > 0) {
          console.log("First record sample:", putAwayData[0]);
        }

        setListViewData(putAwayData);
      } else {
        throw new Error("No data in response");
      }
    } catch (error) {
      console.error("Error fetching putaway requests:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);

        // Handle specific HTTP error codes
        if (error.response.status === 404) {
          message.error("Putaway API endpoint not found");
        } else if (error.response.status === 500) {
          message.error("Server error occurred while fetching putaway data");
        } else if (error.response.status === 401) {
          message.error("Unauthorized access to putaway data");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        message.error("Network error - unable to connect to server");
      } else {
        message.error(error.message || "Failed to fetch putaway requests");
      }
      setListViewData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;

    try {
      // Handle various date formats
      let date;

      if (typeof dateString === "string") {
        // Try different date formats
        if (dateString.includes("-")) {
          const parts = dateString.split("-");
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            date = dayjs(dateString, "YYYY-MM-DD");
          } else if (parts[0].length === 2) {
            // DD-MM-YYYY format
            date = dayjs(dateString, "DD-MM-YYYY");
          }
        } else {
          // Try parsing as ISO string
          date = dayjs(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dayjs(dateString);
      } else if (dayjs.isDayjs(dateString)) {
        date = dateString;
      }

      return date && date.isValid() ? date.format("DD-MM-YYYY") : null;
    } catch (error) {
      console.warn("Date conversion error:", error, dateString);
      return null;
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 4
      ) {
        return dateString;
      }

      // Convert from DD-MM-YYYY to YYYY-MM-DD
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.split("-")[0].length === 2
      ) {
        const date = dayjs(dateString, "DD-MM-YYYY");
        return date.isValid() ? date.format("YYYY-MM-DD") : null;
      }

      // Handle dayjs objects
      if (dayjs.isDayjs(dateString)) {
        return dateString.format("YYYY-MM-DD");
      }

      return null;
    } catch (error) {
      console.warn("Date API conversion error:", error, dateString);
      return null;
    }
  };

  const getPutAwayById = async (row) => {
    console.log("THE SELECTED PUTAWAY ID IS:", row);
    setEditId(row.id);

    try {
      const response = await axios.get(`${API_URL}/api/wmsputaway/${row.id}`);
      console.log("API Response:", response.data);

      // The response is the putaway object directly, not wrapped in status/paramObjectsMap
      const particularPutaway = response.data;
      console.log("THE PARTICULAR PUTAWAY IS:", particularPutaway);

      if (!particularPutaway) {
        throw new Error("No putaway data found");
      }

      setViewMode("form");
      setListView(false);

      // Set form data with proper field mapping
      setFormData({
        docDate: formatDateForDisplay(particularPutaway.docDate),
        grnNo: particularPutaway.grnNo,
        docId: particularPutaway.docId,
        grnDate: formatDateForDisplay(particularPutaway.grnDate),
        entryNo: particularPutaway.entryNo,
        entryDate: formatDateForDisplay(particularPutaway.entryDate),
        core: particularPutaway.core,
        supplierShortName: particularPutaway.shortName, // Changed from supplierShortName to shortName
        supplier: particularPutaway.supplier,
        modeOfShipment: particularPutaway.modeOfShipment,
        carrier: particularPutaway.carrier,
        binType: particularPutaway.locationType, // Changed from binType to locationType
        contact: particularPutaway.contact,
        status: particularPutaway.wStatus, // Changed from status to wStatus
        lotNo: particularPutaway.lotNo,
        enteredPerson: particularPutaway.enteredBy, // Changed from enteredPerson to enteredBy
        binClass: particularPutaway.locationClass, // Changed from binClass to locationClass
        binPick: particularPutaway.palletPick, // Changed from binPick to palletPick
        totalGrnQty: particularPutaway.totGrnQty, // Changed from totalGrnQty to totGrnQty
        totalPutawayQty: particularPutaway.totPutawayQty, // Changed from totalPutawayQty to totPutawayQty
        screenName: particularPutaway.docTypeCode, // Using docTypeCode as screen name
        screenCode: particularPutaway.docTypeCode,
        orgId: particularPutaway.orgId || localStorage.getItem("orgId"), // Added fallback
        customer: particularPutaway.customer,
        client: particularPutaway.client,
        finYear: particularPutaway.finYr, // Changed from finYear to finYr
        vehicleType: particularPutaway.vehicleType,
        vehicleNo: particularPutaway.vehicleNo,
        driverName: particularPutaway.driverName,
        branch: particularPutaway.branch,
        branchCode: particularPutaway.branchCode,
        warehouse: particularPutaway.warehouse,
        freeze: particularPutaway.freeze || "F", // Added default value
        supplierAddress: particularPutaway.supplierAddress, // Added if available
        remarks: particularPutaway.remarks, // Added if available
      });

      // Fetch bin details
      const binResponse = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllBinDetails?branchCode=${
          particularPutaway.branchCode
        }&client=${particularPutaway.client}&orgId=${
          particularPutaway.orgId || localStorage.getItem("orgId")
        }&warehouse=${particularPutaway.warehouse}`
      );

      console.log("Bin Response:", binResponse.data);

      let bins = [];
      if (binResponse.data && Array.isArray(binResponse.data)) {
        // Direct array response
        bins = binResponse.data.map(
          (bin) => bin.bin || bin.binCode || bin.name
        );
      } else if (binResponse.data?.paramObjectsMap?.Bins) {
        // paramObjectsMap structure
        bins = binResponse.data.paramObjectsMap.Bins.map(
          (bin) => bin.bin || bin.binCode || bin.name
        );
      } else if (binResponse.data?.data) {
        // data property structure
        bins = binResponse.data.data.map(
          (bin) => bin.bin || bin.binCode || bin.name
        );
      }

      // Map the putaway items from wtPutawaydtlList
      if (
        particularPutaway.wtPutawaydtlList &&
        Array.isArray(particularPutaway.wtPutawaydtlList)
      ) {
        setPutawayItems(
          particularPutaway.wtPutawaydtlList.map((pa, index) => ({
            id: pa.id || Date.now() + index,
            key: pa.id || Date.now() + index,
            partNo: pa.partNo,
            batchNo: pa.batchNo,
            partDesc: pa.partDesc,
            sku: pa.sku,
            invoiceNo: pa.lrHawbHblNo, // Using lrHawbHblNo as invoiceNo
            invQty: pa.invQty,
            recQty: pa.recQty,
            putawayQty: pa.putawayQty || pa.recQty, // Default to recQty if putawayQty not available
            location: pa.palletNo, // Using palletNo as location
            binOptions: bins,
            remarks: pa.remarks,
            binType: pa.locationType, // Using locationType as binType
            shortQty: pa.shortQty,
            damageQty: pa.damageQty, // Added damageQty
            grnQty: pa.grnQty,
            binClass: pa.locationClass, // Using locationClass as binClass
            cellType: pa.cellType || pa.locationType, // Fallback to locationType
            batchDate: formatDateForDisplay(pa.batchDt), // Using batchDt
            status: pa.dstatus || "ACTIVE", // Using dstatus
            expDate: formatDateForDisplay(pa.expDate),
            qcFlag: pa.qcFlag,
            ssku: pa.ssku,
            ssqty: pa.ssQty, // Using ssQty
            rowNo: pa.rowNo,
            bay: pa.bay,
            levelNo: pa.levelNo,
            palletNo: pa.palletNo,
            weight: pa.weight,
            indcNo: pa.indcNo,
            itemType: pa.itemType,
            rate: pa.rate,
            amount: pa.amount,
          }))
        );
      } else {
        console.warn("No putaway details found in response");
        setPutawayItems([]);
      }
    } catch (error) {
      console.error("Error fetching putaway data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      message.error("Failed to fetch putaway details");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } =
      e.target;

    let errorMessage = "";

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      if (name === "grnNo") {
        const selectedGrn = grnList.find((grn) => grn.docId === value);
        if (selectedGrn) {
          setFormData((prevData) => ({
            ...prevData,
            grnNo: selectedGrn.docId,
            grnDate: formatDateForDisplay(selectedGrn.grnDate),
            entryNo: selectedGrn.entryNo,
            entryDate: formatDateForDisplay(selectedGrn.entryDate),
            supplierShortName: selectedGrn.supplierShortName,
            supplier: selectedGrn.supplier,
            carrier: selectedGrn.carrier,
            modeOfShipment: selectedGrn.modeOfShipment?.toUpperCase() || "",
            vehicleType: selectedGrn.vehicleType?.toUpperCase() || "",
            contact: selectedGrn.contact,
            driverName: selectedGrn.driverName?.toUpperCase() || "",
            securityName: selectedGrn.securityName?.toUpperCase() || "",
            briefDesc: selectedGrn.goodsDescripition?.toUpperCase() || "",
            vehicleNo: selectedGrn.vehicleNo,
            lotNo: selectedGrn.lotNo,
            totalGrnQty: selectedGrn.totalGrnQty,
          }));
        }
      } else if (name === "binClass" || name === "binPick") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      } else if (name === "status" || name === "core") {
        setFormData({
          ...formData,
          [name]: name === "core" ? initCaps(value) : value,
        });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: "" });

      setTimeout(() => {
        const inputElement = document.querySelector(`[name=${name}]`);
        if (
          inputElement &&
          (inputElement.tagName === "INPUT" ||
            inputElement.tagName === "TEXTAREA") &&
          (type === "text" ||
            type === "password" ||
            type === "search" ||
            type === "tel" ||
            type === "url")
        ) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? date.format("DD-MM-YYYY") : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };

  const handleDeleteRow = (id) => {
    setPutawayItems(putawayItems.filter((row) => row.id !== id));
  };

  const handleTableChange = (id, field, value) => {
    setPutawayItems((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now() + Math.random(),
      partNo: "",
      partDesc: "",
      batchNo: "",
      batchDate: null,
      expDate: null,
      grnQty: "",
      putawayQty: "",
      location: "",
      sku: "",
    };
    setPutawayItems([...putawayItems, newRow]);
  };

  const handleClear = () => {
    setFormData({
      binClass: "Fixed",
      binPick: "Empty",
      binType: "",
      branch: loginBranch,
      branchCode: loginBranchCode,
      briefDesc: "",
      carrier: "",
      client: loginClient,
      contact: "",
      core: "Multi",
      createdBy: loginUserName,
      customer: loginCustomer,
      docDate: dayjs().format("DD-MM-YYYY"),
      enteredPerson: "",
      driverName: "",
      entryNo: "",
      entryDate: null,
      finYear: loginFinYear,
      grnDate: null,
      grnNo: "",
      lotNo: "",
      modeOfShipment: "",
      orgId: orgId,
      status: "Edit",
      securityName: "",
      supplier: "",
      supplierShortName: "",
      totalGrnQty: "",
      vehicleType: "",
      vehicleNo: "",
      warehouse: loginWarehouse,
      freeze: false,
      createdOn: dayjs().format("DD-MM-YYYY"),
    });
    setPutawayItems([]);
    setPutAwayTableErrors("");
    setFieldErrors({
      binClass: "",
      binPick: "",
      binType: "",
      branch: loginBranch,
      branchCode: loginBranchCode,
      carrier: "",
      client: loginClient,
      core: "",
      createdBy: loginUserName,
      customer: loginCustomer,
      enteredPerson: "",
      entryNo: "",
      entryDate: null,
      finYear: "",
      grnDate: null,
      grnNo: "",
      lotNo: "",
      modeOfShipment: "",
      orgId: orgId,
      status: "",
      supplier: "",
      supplierShortName: "",
      warehouse: loginWarehouse,
    });
    setEditId("");
    getPutAwayDocId();
  };

  useEffect(() => {
    getPutAwayDocId();
    getAllPutAway();
    getGrnForPutaway();
    getAllLocationTypes();
  }, []);

  const handleSave = async () => {
    if (loading) return;
    const errors = {};

    // Form validation
    if (!formData.grnNo) {
      errors.grnNo = "Grn No is required";
    }
    if (!formData.binType) {
      errors.binType = "Bin Type is required";
    }
    if (!formData.status) {
      errors.status = "Status is required";
    }

    // Table validation - Check if putawayItems has data
    let tableDataValid = true;
    const newTableErrors = putawayItems.map((row) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = "Part No is required";
        tableDataValid = false;
      }
      if (!row.location) {
        rowErrors.bin = "Bin is required";
        tableDataValid = false;
      }
      if (!row.putawayQty || parseFloat(row.putawayQty) <= 0) {
        rowErrors.putawayQty = "Valid Putaway Qty is required";
        tableDataValid = false;
      }
      if (!row.batchNo) {
        rowErrors.batchNo = "Batch No is required";
        tableDataValid = false;
      }
      return rowErrors;
    });

    // if (!tableDataValid || Object.keys(errors).length > 0) {
    //   // Show validation errors
    //   setFieldErrors(errors);
    //   setPutAwayTableErrors(newTableErrors);
    //   notification.error({
    //     message: "Validation Error",
    //     description: "Please fix the validation errors before saving.",
    //     placement: "topRight",
    //   });
    //   setIsLoading(false);
    //   return;
    // }

    setIsLoading(true);

    // Format dates to YYYY-MM-DD before sending (as expected in payload)
    const putAwayDetailsDTO = putawayItems.map((row) => ({
      batch: row.batchNo,
      batchDt: row.batchDate ? formatDateForAPI(row.batchDate) : null,
      bin: row.location,
      binType: formData.binType,
      cellType: "ACTIVE",
      expdate: row.expDate ? formatDateForAPI(row.expDate) : null,
      grnQty: parseFloat(row.grnQty) || 0,
      invoiceNo: row.invoiceNo || "",
      invQty: parseFloat(row.invQty) || 0,
      partDesc: row.partDesc || "",
      partNo: row.partNo,
      putAwayPiecesQty: 0,
      putAwayQty: parseFloat(row.putawayQty) || 0,
      recQty: parseFloat(row.recQty) || 0,
      remarks: row.remarks || "",
      sku: row.sku || "",
      ssku: row.ssku || "",
    }));

    const saveFormData = {
      ...(editId && { id: parseInt(editId) }),
      binClass: formData.binClass,
      binPick: formData.binPick,
      binType: formData.binType,
      branch: formData.branch,
      branchCode: formData.branchCode,
      carrier: formData.carrier,
      client: formData.client,
      contact: formData.contact,
      core: formData.core,
      createdBy: formData.createdBy,
      customer: formData.customer,
      driverName: formData.driverName,
      enteredPerson: formData.enteredPerson,
      entryDate: formData.entryDate
        ? formatDateForAPI(formData.entryDate)
        : null,
      entryNo: formData.entryNo,
      finYear: formData.finYear,
      grnDate: formData.grnDate ? formatDateForAPI(formData.grnDate) : null,
      grnNo: formData.grnNo,
      // id: editId ? parseInt(editId) : 0,
      lotNo: formData.lotNo,
      modeOfShipment: formData.modeOfShipment,
      orgId: parseInt(formData.orgId),
      putAwayDetailsDTO: putAwayDetailsDTO,
      status: formData.status,
      supplier: formData.supplier,
      supplierShortName: formData.supplierShortName,
      vehicleNo: formData.vehicleNo,
      vehicleType: formData.vehicleType,
      warehouse: formData.warehouse,
      docDate: formData.docDate ? formatDateForAPI(formData.docDate) : null,
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/putaway/createUpdatePutAway`,
        saveFormData
      );

      console.log("Save response:", response.data);

      if (response.data.status === true) {
        notification.success({
          message: "Success",
          description: "Putaway saved successfully!",
          placement: "topRight",
        });
        handleClear();
        getAllPutAway();
        setListView(true);
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to save putaway",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error saving putaway:", error);
      notification.error({
        message: "Error",
        description: "Error saving putaway. Please try again.",
        placement: "topRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocationList = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/warehousemastercontroller/getAllBinDetails?branchCode=${loginBranchCode}&client=${loginClient}&orgId=${orgId}&warehouse=${loginWarehouse}`
        );

        // Add proper null checks and transform the data
        if (
          response.data &&
          response.data.paramObjectsMap &&
          response.data.paramObjectsMap.Bins
        ) {
          // Transform the data to match what your Select component expects
          const transformedLocations = response.data.paramObjectsMap.Bins.map(
            (bin, index) => ({
              id: index + 1, // Create an ID since it doesn't exist in the response
              name: bin.bin || `Location ${index + 1}`, // Use the bin property as name
              bin: bin.bin,
              binType: bin.binType,
              core: bin.core,
              cellType: bin.cellType,
              binClass: bin.binClass,
            })
          );

          setLocationList(transformedLocations);
        } else {
          setLocationList([]); // Set empty array if no data
          console.warn("No location data found in response");
        }
      } catch (error) {
        console.error("Error fetching location list:", error);
        setLocationList([]); // Set empty array on error
      }
    };

    fetchLocationList();
  }, [loginBranchCode, loginClient, orgId, loginWarehouse]);

  const handleView = () => {
    setListView(!listView);
    setDownloadPdf(false);
  };

  const GeneratePdf = (row) => {
    console.log("PDF-Data =>", row.original);
    setPdfData(row.original);
    setDownloadPdf(true);
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    handleBulkUploadClose();
  };

  // Styles
  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    color: "rgba(255, 255, 255, 0.7)",
  };

  const selectStyle = {
    ...inputStyle,
    width: "100%",
  };

  const datePickerStyle = {
    ...inputStyle,
    width: "100%",
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className={`performance-goals-gd-container ${
          theme === "dark" ? "dark-mode" : ""
        }`}
      >
        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
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
            padding: "40px",
            height: "calc(100% - 100px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {viewMode === "form" ? (
            <div
              style={{
                padding: "20px",
                marginTop: "20px",
                display: "revert",
                placeContent: "center",
                overflowY: "none",
                minHeight: "20dvh",
                background: "#159957",
                background: "var(--bg-body-gradient)",
              }}
            >
              {/* Header */}
              <div className="form-containerSG">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#159957",
                    background: "var(--bg-body-gradient)",
                  }}
                >
                  <div>
                    <Typography.Title
                      level={3}
                      style={{
                        color: "#fff",
                        margin: 0,
                        alignItems: "center",
                      }}
                    >
                      Putaway
                    </Typography.Title>
                    <Typography.Text
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Create and manage Putaway operations
                    </Typography.Text>
                  </div>
                  <div>
                    <Button
                      icon={<UnorderedListOutlined />}
                      onClick={toggleViewMode}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none",
                      }}
                    >
                      List View
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => console.log("Search Clicked")}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Search
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Clear
                </Button>

                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isLoading}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={handleBulkUploadOpen}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Upload
                </Button>

                <Button
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Print
                </Button>
              </div>

              {/* Main Form */}
              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
                {/* Left Form Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    width: "100%",
                  }}
                >
                  <Tabs
                    className="white-tabs"
                    defaultActiveKey="1"
                    style={{ color: "#fff" }}
                  >
                    <TabPane
                      tab="Basic Information"
                      key="1"
                      style={{ color: "#fff" }}
                    >
                      <div
                        style={{
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "20px",
                          padding: "20px",
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      >
                        <Form layout="vertical">
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Putaway No
                                  </span>
                                }
                              >
                                <Input
                                  name="putawayNo"
                                  value={formData.docId}
                                  onChange={handleInputChange}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Putaway Date *
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  className="white-datepicker"
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.docDate
                                      ? dayjs(formData.docDate, "DD-MM-YYYY")
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("docDate", date)
                                  }
                                  disabled={formData.freeze}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GRN No *
                                  </span>
                                }
                              >
                                <Select
                                  showSearch
                                  value={formData.grnNo}
                                  onChange={(value) => {
                                    handleInputChange({
                                      target: { name: "grnNo", value },
                                    });
                                  }}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {grnList?.map((row) => (
                                    <Option key={row.id} value={row.docId}>
                                      {row.docId}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    GRN Date
                                  </span>
                                }
                                validateStatus={
                                  fieldErrors.grnDate ? "error" : ""
                                }
                                help={fieldErrors.grnDate}
                              >
                                <DatePicker
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.grnDate
                                      ? dayjs(formData.grnDate, "DD-MM-YYYY")
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange("grnDate", date)
                                  }
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier
                                  </span>
                                }
                              >
                                <Input
                                  name="supplier"
                                  value={formData.supplier}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Status</span>
                                }
                              >
                                <select
                                  name="status"
                                  value={formData.status}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      status: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    width: "100%",
                                  }}
                                >
                                  <option value="Edit">Edit</option>
                                  <option value="Confirm">Confirm</option>
                                </select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Created By
                                  </span>
                                }
                              >
                                <Input
                                  name="createdBy"
                                  value={formData.createdBy}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Created On
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={{
                                    width: "100%",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                  className="white-datepicker"
                                  format="DD-MM-YYYY"
                                  value={
                                    formData.createdOn
                                      ? dayjs(formData.createdOn, "DD-MM-YYYY")
                                      : dayjs()
                                  } // Show today's date by default
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Total Qty
                                  </span>
                                }
                              >
                                <Input
                                  name="totalQty"
                                  value={formData.totalGrnQty}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Remarks</span>
                                }
                              >
                                <Input
                                  name="remarks"
                                  value={formData.remarks}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Class
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.binClass}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      binClass: value,
                                    })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Fixed">Fixed</Option>
                                  <Option value="Open">Open</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Pick
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.binPick}
                                  onChange={(value) =>
                                    setFormData({ ...formData, binPick: value })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Empty">Empty</Option>
                                  <Option value="Occupied">Occupied</Option>
                                  <Option value="Both">Both</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Bin Type
                                  </span>
                                }
                              >
                                <Select
                                  id="binType"
                                  name="binType"
                                  disabled={formData.freeze}
                                  value={formData.binType}
                                  onChange={(value) =>
                                    setFormData({ ...formData, binType: value })
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  {locationTypeList?.map((row) => (
                                    <Option
                                      key={row.id}
                                      value={row.ltype.toUpperCase()}
                                    >
                                      {row.ltype.toUpperCase()}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Core</span>
                                }
                              >
                                <Select
                                  value={formData.core}
                                  onChange={(value) =>
                                    setFormData({ ...formData, core: value })
                                  }
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                >
                                  <Option value="Multi">Multi</Option>
                                  <Option value="Single">Single</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>

                    <TabPane tab="Additional Information" key="2">
                      <div
                        style={{
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "20px",
                          padding: "20px",
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <Form layout="vertical">
                          {/* First Row - 6 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Supplier Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.supplierShortName}
                                  disabled
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vehicle Type
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleType"
                                  value={formData.vehicleType}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Vehicle No
                                  </span>
                                }
                              >
                                <Input
                                  name="vehicleNo"
                                  value={formData.vehicleNo}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>

                            {/* Second Row - 6 columns */}

                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Security Person Name
                                  </span>
                                }
                              >
                                <Input
                                  name="securityName"
                                  value={formData.securityName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Driver Name
                                  </span>
                                }
                              >
                                <Input
                                  name="driverName"
                                  value={formData.driverName}
                                  onChange={handleInputChange}
                                  disabled={formData.freeze}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
              {/* Table Section */}
              <div
                style={{
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    {!formData.freeze && (
                      <Button
                        icon={<PlusOutlined />}
                        onClick={handleAddRow}
                        style={{
                          marginRight: "8px",
                          background: "rgba(108, 99, 255, 0.3)",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Add Row
                      </Button>
                    )}

                    <Button
                      icon={<DownloadOutlined />}
                      onClick={getPutawayGridDetails}
                      style={{
                        marginRight: "8px",
                        background: "rgba(108, 99, 255, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Fill from GRN
                    </Button>
                    <Button
                      icon={<ClearOutlined />}
                      style={{
                        marginRight: "8px",
                        background: "rgba(255, 99, 132, 0.3)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div
                  className="table-container"
                  style={{
                    position: "relative",
                    width: "100%",
                    overflowX: "auto",
                    fontSize: "11px",
                    marginLeft: "0",
                    maxHeight: "500px",
                    overflowY: "auto", // Vertical scrolling
                    marginTop: "10px",
                    // Scrollbar styling for webkit browsers (Chrome, Safari)
                    "&::-webkit-scrollbar": {
                      height: "8px",
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },
                    // Scrollbar styling for Firefox
                    scrollbarWidth: "thin",
                    scrollbarColor:
                      "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <table
                    style={{
                      width: "max-content",
                      minWidth: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "transparent",
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "60px" }} /> {/* Action */}
                      <col style={{ width: "60px" }} /> {/* S.No */}
                      <col style={{ width: "150px" }} /> {/* Part No */}
                      <col style={{ width: "200px" }} /> {/* Part Desc */}
                      <col style={{ width: "80px" }} /> {/* S.No */}
                      <col style={{ width: "120px" }} /> {/* Batch No */}
                      <col style={{ width: "120px" }} /> {/* Batch Date */}
                      <col style={{ width: "120px" }} /> {/* Exp Date */}
                      <col style={{ width: "100px" }} /> {/* GRN Qty */}
                      <col style={{ width: "100px" }} /> {/* Putaway Qty */}
                      <col style={{ width: "120px" }} /> {/* Location */}
                    </colgroup>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px dashed #000",
                          zIndex: 2,
                          position: "sticky",
                          top: 0,
                          backgroundColor: "transparent",
                        }}
                      >
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "white",
                          }}
                        >
                          Action
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "white",
                          }}
                        >
                          S.No
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Part No *
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Part Desc
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Sku
                        </th>

                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          GRN Qty
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Putaway Qty *
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Location *
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Batch No *
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Batch Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          Exp Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {putawayItems.map((row, index) => (
                        <tr
                          key={`row-${index}-${row.id}`}
                          style={{
                            borderBottom: "1px dashed white",
                            color: "white",
                          }}
                        >
                          {/* Action */}
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleDeleteRow(
                                  row.id,
                                  putawayItems,
                                  setPutawayItems
                                )
                              }
                              danger
                              type="text"
                              style={{ color: "white" }}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* S.No */}
                          <td
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "white",
                              fontSize: "14px",
                            }}
                          >
                            {index + 1}
                          </td>

                          {/* Part No */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.partNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "partNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Part Desc */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.partDesc}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.sku}
                              onChange={(e) =>
                                handleTableChange(row.id, "sku", e.target.value)
                              }
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Batch No */}

                          {/* GRN Qty */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.grnQty}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </td>

                          {/* Putaway Qty */}
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.putawayQty}
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Location */}
                          <td style={{ padding: "8px" }}>
                            <Select
                              showSearch
                              style={selectStyle}
                              placeholder="Select Location"
                              optionFilterProp="children"
                              value={row.location}
                              onChange={(value) =>
                                handleTableChange(row.id, "location", value)
                              }
                              disabled={formData.freeze}
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {locationList.map((loc) => (
                                <Option key={loc.id} value={loc.bin}>
                                  {" "}
                                  {/* Use loc.bin as value */}
                                  {loc.bin} {/* Display the bin name */}
                                </Option>
                              ))}
                            </Select>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Input
                              value={row.batchNo}
                              onChange={(e) =>
                                handleTableChange(
                                  row.id,
                                  "batchNo",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Batch Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              style={datePickerStyle}
                              value={
                                row.batchDate
                                  ? dayjs(row.batchDate, "DD-MM-YYYY")
                                  : null
                              }
                              format="DD-MM-YYYY"
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "batchDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              disabled={formData.freeze}
                            />
                          </td>

                          {/* Exp Date */}
                          <td style={{ padding: "8px" }}>
                            <DatePicker
                              format="DD-MM-YYYY"
                              style={datePickerStyle}
                              value={
                                row.expDate
                                  ? dayjs(row.expDate, "DD-MM-YYYY")
                                  : null
                              }
                              onChange={(date) =>
                                handleTableChange(
                                  row.id,
                                  "expDate",
                                  date ? date.format("DD-MM-YYYY") : null
                                )
                              }
                              disabled={formData.freeze}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "16px",
                  }}
                >
                  <div>
                    <Typography.Text style={{ color: "white" }}>
                      Total Putaway Qty: {formData.totalPutawayQty}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "80vh",
                background: "#159957",
                background: "var(--bg-body-gradient)",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{
                      color: "#fff",
                      margin: 0,
                      paddingLeft: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    Putaway List
                  </Typography.Title>
                  <Typography.Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      paddingLeft: "20px",
                    }}
                  >
                    View and manage Putaway entries
                  </Typography.Text>
                </div>
                <div></div>
              </div>

              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "80%",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  marginTop: "40px",
                  marginLeft: "60px",
                  background: "#159957",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <Input
                  placeholder="Search by GRN No, Supplier, or Gate Pass ID"
                  allowClear
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "300px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                  prefix={
                    <SearchOutlined
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    />
                  }
                />

                <Space>
                  <RangePicker
                    className="white-datepicker"
                    value={
                      selectedDateRange.length > 0
                        ? [
                            dayjs(selectedDateRange[0], "DD-MM-YYYY"),
                            dayjs(selectedDateRange[1], "DD-MM-YYYY"),
                          ]
                        : null
                    }
                    onChange={(dates) => {
                      if (dates && dates.length === 2) {
                        setSelectedDateRange([
                          dates[0].format("DD-MM-YYYY"),
                          dates[1].format("DD-MM-YYYY"),
                        ]);
                      } else {
                        setSelectedDateRange([]);
                      }
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                    placeholder={["From Date", "To Date"]}
                    format="DD-MM-YYYY"
                  />

                  <Button
                    icon={<DownloadOutlined />}
                    loading={downloadLoading}
                    onClick={downloadPutAwayExcel}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Download Excel
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={toggleViewMode}
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Add Entry
                  </Button>
                </Space>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#159957",
                    background: "var(--bg-body-gradient)",
                  }}
                >
                  <thead style={{ backgroundColor: "revert" }}>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "white",
                        }}
                      >
                        Action
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                          fontWeight: "500",
                        }}
                      >
                        Putaway Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Putaway No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        GRN No
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Warehouse
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Total Qty
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData
                      .filter(
                        (item) =>
                          !searchTerm ||
                          (item.docId &&
                            item.docId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.supplier &&
                            item.supplier
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (item.gatePassId &&
                            item.gatePassId
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((row, index) => (
                        <tr
                          key={`row-${index}-${row.id}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <td>
                            {" "}
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() =>
                                row && row.id
                                  ? getPutAwayById(row)
                                  : alert("Invalid row data")
                              }
                              style={{ color: "white" }}
                            ></Button>
                            <Button
                              type="link"
                              icon={<CloudDownloadOutlined />}
                              onClick={() => {
                                if (row) {
                                  setPdfData(row); // store the order data for PDF
                                  setDownloadPdf(true);
                                } else {
                                  message.warning("No order selected for PDF!");
                                }
                              }}
                              style={{ color: "white" }}
                            />
                            {downloadPdf && <GeneratePdfTemp row={pdfData} />}
                            {/* Row-Wise Print */}
                            <Button
                              icon={<PrinterOutlined />}
                              onClick={() => handlePrintRowLabel(row)} // <-- row-specific
                              style={{
                                marginRight: "8px",
                                background: "rgba(108, 99, 255, 0.3)",
                                color: "#fff",
                                border: "none",
                              }}
                            >
                              Print Row Label
                            </Button>
                            {/* Modal */}
                            <LabelPrintModal
                              visible={labelModalVisible}
                              onCancel={() => setLabelModalVisible(false)}
                              selectedItems={selectedItemsForLabels}
                              numberOfLabels={numberOfLabels}
                            />
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {dayjs(row.docDate).format("DD-MM-YYYY")}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {row.docId}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {row.grnNo}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {row.warehouse}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {row.status}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {row.totalQty}
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
                    paddingRight: "50px",
                    color: "white",
                  }}
                >
                  <span style={{ marginRight: "16px", fontSize: "12px" }}>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, listViewData.length)} of{" "}
                    {listViewData.length} items
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
                    { length: Math.ceil(listViewData.length / pageSize) },
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
                          Math.ceil(listViewData.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(listViewData.length / pageSize)
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
                        Math.ceil(listViewData.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(listViewData.length / pageSize)
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
          )}
        </div>
      </div>

      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload Gate Pass In Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSubmit}
        sampleFileDownload={sampleFile}
        handleFileUpload={handleFileUpload}
        apiUrl={`${API_URL}/api/putaway/ExcelUploadForPutAway?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}&warehouse=${loginWarehouse}`}
        screen="Putaway"
      />
      {/* </Modal> */}
    </ConfigProvider>
  );
};

// Styles
const inputStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
};

const readOnlyInputStyle = {
  ...inputStyle,
  color: "rgba(255, 255, 255, 0.7)",
};

const selectStyle = {
  ...inputStyle,
  width: "100%",
};

const datePickerStyle = {
  ...inputStyle,
  width: "100%",
};

export default WMSPutaway;
