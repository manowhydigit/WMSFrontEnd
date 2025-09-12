import React, { useRef, useState, useEffect } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ClearOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  RightCircleOutlined,
  BarcodeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Typography,
  Checkbox,
  Modal,
  message,
  InputNumber,
} from "antd";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import axios from "axios";
import Barcode from "react-barcode";
import { getAllActiveGroups } from "../utils/CommonFunctions";
import CommonListViewTable from "./CommonListViewTable";
import GeneratePdfTempPick from "./PickRequestPdf";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import WMSGeneratePdfTempPick from "./WMSPickRequestPdf";
import JsBarcode from "jsbarcode";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="ant-modal-content"]'}
    >
      <div {...props} />
    </Draggable>
  );
}

const LabelPrintModal = ({ visible, onClose, formData, items }) => {
  const [numberOfLabels, setNumberOfLabels] = useState(1);
  const labelRef = useRef(null);

  // Function to generate barcode for customer name and buyer order number
  const generateBarcodeData = () => {
    return `${formData.buyerOrderNo || "ORDER"}`;
  };

  const handlePrintLabels = () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }

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
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              width: 4in;
              height: 2in;
            }
            .label {
              width: 4in;
              height: 2in;
              padding: 5px;
              box-sizing: border-box;
              border: 1px dotted #ccc;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .label-header {
              text-align: center;
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .label-content {
              display: flex;
              flex-direction: column;
              gap: 2px;
              flex-grow: 1;
            }
            .address-section {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 3px;
              line-height: 1.2;
            }
            .company-address, .customer-address {
              width: 48%;
            }
            .info-row {
              font-size: 10px;
              margin: 1px 0;
              display: flex;
              justify-content: space-between;
            }
            .barcode-section {
              text-align: center;
              margin: 2px 0;
            }
            .label-footer {
              text-align: center;
              font-size: 12px;
              margin-top: 2px;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
          <script src="https://unpkg.com/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          ${Array.from(
            { length: numberOfLabels },
            (_, i) => `
            <div class="label">
              <div class="label-header">SHIPPING LABEL</div>
              <div class="label-content">
                <div class="address-section">
                  <div class="company-address">
                    <strong>From:</strong><br/>
                    Uniworld Logistics pvt ltd<br/>
                    Bilapur tauru road mewat 122105
                  </div>
                  <div class="customer-address">
                    <strong>To:</strong><br/>
                    ${formData.customerName || "N/A"}<br/>
                    ${formData.customerAddress || "N/A"}
                  </div>
                </div>
                <div class="info-row">
                  <span><strong>Order No:</strong> ${
                    formData.buyerOrderNo || "N/A"
                  }</span>
                  
                </div>
                <div class="info-row">
                  <span><strong>Date:</strong> ${
                    formData.docDate || "N/A"
                  }</span>
                </div>
                <div class="barcode-section">
                  <svg id="barcode-${i}" width="180" height="30"></svg>
                </div>
              </div>
              <div class="label-footer">
                Label ${i + 1} of ${numberOfLabels}
              </div>
            </div>
            `
          ).join("")}
          <div class="no-print" style="margin-top:20px; text-align:center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script>
            // Generate barcodes after page loads
            window.onload = function() {
              ${Array.from(
                { length: numberOfLabels },
                (_, i) => `
                JsBarcode("#barcode-${i}", "${generateBarcodeData()}", {
                  format: "CODE128",
                  width: 1,
                  height: 30,
                  displayValue: false,
                  margin: 0
                });
                `
              ).join("")}
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadLabels = async () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }

    const sessionId = Date.now();

    // Clean up previous containers
    const existingContainers = document.querySelectorAll(
      ".temp-label-container"
    );
    existingContainers.forEach((container) => container.remove());

    const container = document.createElement("div");
    container.className = "temp-label-container";
    container.style.cssText = `
    display: flex; flex-direction: column; gap: 0; width: 4in;
    position: absolute; left: -9999px; top: -9999px;
  `;

    // Create labels
    for (let i = 0; i < numberOfLabels; i++) {
      const label = document.createElement("div");
      label.style.cssText = `
      width: 4in; height: 2in; padding: 5px; box-sizing: border-box;
      border: 1px dotted #ccc; display: flex; flex-direction: column;
      justify-content: space-between;
    `;

      label.innerHTML = `
      <div style="text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 3px;">
        SHIPPING LABEL
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; line-height: 1.2;">
          <div style="width: 48%;">
            <strong>From:</strong><br/>
            Uniworld Logistics pvt ltd<br/>
            Bilapur tauru road mewat 122105
          </div>
          <div style="width: 48%;">
            <strong>To:</strong><br/>
            ${formData.customerName || "N/A"}<br/>
            ${formData.customerAddress || "N/A"}
          </div>
        </div>
        <div style="font-size: 10px; margin: 1px 0; display: flex; justify-content: space-between;">
          <span><strong>Order No:</strong> ${
            formData.buyerOrderNo || "N/A"
          }</span>
        </div>
        <div style="font-size: 10px; margin: 1px 0; display: flex; justify-content: space-between;">
          <span><strong>Date:</strong> ${formData.docDate || "N/A"}</span>
        </div>
        <div style="text-align: center; margin: 2px 0;">
          <svg id="barcode-${sessionId}-${i}" width="180" height="30"></svg>
        </div>
      </div>
      <div style="text-align: center; font-size: 12px; margin-top: 2px;">
        Label ${i + 1} of ${numberOfLabels}
      </div>
    `;

      container.appendChild(label);
    }

    document.body.appendChild(container);

    try {
      // Generate barcodes
      await Promise.all(
        Array.from({ length: numberOfLabels }, (_, i) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              JsBarcode(`#barcode-${sessionId}-${i}`, generateBarcodeData(), {
                format: "CODE128",
                width: 1,
                height: 30,
                displayValue: false,
                margin: 0,
              });
              resolve();
            }, 50);
          });
        })
      );

      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        width: 384,
        height: numberOfLabels * 192,
        windowWidth: 384,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 2 * numberOfLabels],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 4, 2 * numberOfLabels);
      pdf.save(`shipping_labels_${formData.buyerOrderNo || "labels"}.pdf`);
    } catch (error) {
      console.error("Error generating labels:", error);
      message.error("Failed to generate labels");
    } finally {
      // Always clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  };

  return (
    <Modal
      title="Print Shipping Labels"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="print"
          icon={<PrinterOutlined />}
          onClick={handlePrintLabels}
        >
          Print Labels
        </Button>,
        <Button key="download" onClick={handleDownloadLabels}>
          Download PDF
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <div>
        <p>
          This will generate shipping labels with company and customer
          addresses.
        </p>

        <div style={{ margin: "16px 0" }}>
          <label style={{ marginRight: "8px" }}>
            Number of labels to print:
          </label>
          <InputNumber
            min={1}
            max={100}
            value={numberOfLabels}
            onChange={setNumberOfLabels}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <p>
            <strong>Label Preview (4" x 2"):</strong>
          </p>
          <div
            ref={labelRef}
            style={{
              width: "4in",
              height: "2in",
              border: "1px solid #d9d9d9",
              padding: "5px",
              fontSize: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              lineHeight: "1.2",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "3px",
                fontSize: "12px",
              }}
            >
              SHIPPING LABEL
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flexGrow: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "3px",
                }}
              >
                <div style={{ width: "48%" }}>
                  <strong>From:</strong>
                  <br />
                  Uniworld Logistics pvt ltd
                  <br />
                  Bilapur tauru road mewat 122105
                </div>
                <div style={{ width: "48%" }}>
                  <strong>To:</strong>
                  <br />
                  {formData.customerName || "N/A"}
                  <br />
                  {formData.customerAddress || "N/A"}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>Order No:</strong>{" "}
                  <strong>{formData.buyerOrderNo || "N/A"}</strong>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>Date:</strong> {formData.docDate || "N/A"}
                </span>
              </div>
              <div style={{ textAlign: "center", margin: "2px 0" }}>
                <Barcode
                  value={generateBarcodeData()}
                  width={1}
                  height={30}
                  fontSize={10}
                  margin={0}
                  displayValue={false}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "2px",
                fontSize: "8px",
              }}
            >
              Label 1 of {numberOfLabels}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Add this modal component for single order printing
const RowLabelPrintModal = ({ visible, onClose, order }) => {
  const [numberOfLabels, setNumberOfLabels] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [toName, setToName] = useState("");

  // Initialize toAddress and toName when order changes
  useEffect(() => {
    if (order) {
      const defaultToAddress = order.customerAddress || "";
      const defaultToName = order.customerName || "";
      setToAddress(defaultToAddress);
      setToName(defaultToName);
    }
  }, [order]);

  // Reset when modal closes
  const handleClose = () => {
    setNumberOfLabels(1);
    setIsDownloading(false);
    if (order) {
      setToAddress(order.customerAddress || "");
      setToName(order.customerName || "");
    }
    onClose();
  };

  const generateBarcodeData = () => {
    return `${order.buyerOrderNo || "ORDER"}`;
  };

  const handlePrintLabels = () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }

    const printWindow = window.open("", "_blank");
    const barcodeData = generateBarcodeData();

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @page {
              size: 4in 2in;
              margin: 0;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              width: 4in;
              height: 2in;
            }
            .label {
              width: 4in;
              height: 2in;
              padding: 5px;
              box-sizing: border-box;
              border: 1px dotted #ccc;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .label-header {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .label-content {
              display: flex;
              flex-direction: column;
              gap: 2px;
              flex-grow: 1;
            }
            .address-section {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 3px;
              line-height: 1.2;
            }
            .company-address, .customer-address {
              width: 48%;
              font-size: 12px;
            }
            .info-row {
              font-size: 16px;
              margin: 1px 0;
              display: flex;
              justify-content: space-between;
              font-weight:bold;
            }
            .barcode-section {
              text-align: center;
              margin: 2px 0;
            }
            .label-footer {
              text-align: center;
              font-size: 12px;
              margin-top: 2px;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
          <script src="https://unpkg.com/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          ${Array.from(
            { length: numberOfLabels },
            (_, i) => `
            <div class="label">
              <div class="label-header">SHIPPING LABEL</div>
              <div class="label-content">
                <div class="address-section">
                  <div class="company-address">
                    <strong>From:</strong><br/>
                    Uniworld Logistics pvt ltd<br/>
                    Bilapur tauru road mewat 122105
                  </div>
                  <div class="customer-address">
                    <strong>To:</strong><br/>
                    ${toName || order.customerName || "N/A"}<br/>
                    ${toAddress || order.customerAddress || "N/A"}
                  </div>
                </div>
                <div style="font-size: 16px; margin: 1px 0; display: flex; justify-content: space-between;">
                  <span><strong>Order No:</strong> <strong> ${
                    order.buyerOrderNo || "N/A"
                  } </strong> </span>
                </div>
                <div class="barcode-section">
                  <svg id="barcode-${i}" width="180" height="30"></svg>
                </div>
              </div>
              <div class="label-footer">
                Label ${i + 1} of ${numberOfLabels}
              </div>
            </div>
            `
          ).join("")}
          <div class="no-print" style="margin-top:20px; text-align:center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script>
            // Generate barcodes after page loads
            window.onload = function() {
              ${Array.from(
                { length: numberOfLabels },
                (_, i) => `
                try {
                  JsBarcode("#barcode-${i}", "${barcodeData}", {
                    format: "CODE128",
                    width: 1,
                    height: 30,
                    displayValue: false,
                    margin: 0
                  });
                } catch (e) {
                  console.error('Barcode error:', e);
                }
                `
              ).join("")}
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadLabels = async () => {
    if (numberOfLabels <= 0) {
      message.error("Number of labels must be greater than 0");
      return;
    }

    if (isDownloading) return; // Prevent multiple clicks

    setIsDownloading(true);

    try {
      // Create a unique container ID to avoid conflicts
      const containerId = `label-container-${Date.now()}`;
      const container = document.createElement("div");
      container.id = containerId;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "10px";
      container.style.width = "4in";

      // Create labels
      for (let i = 0; i < numberOfLabels; i++) {
        const label = document.createElement("div");
        label.style.width = "4in";
        label.style.height = "2in";
        label.style.padding = "5px";
        label.style.boxSizing = "border-box";
        label.style.border = "1px dotted #ccc";
        label.style.display = "flex";
        label.style.flexDirection = "column";
        label.style.justifyContent = "space-between";

        label.innerHTML = `
          <div style="text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 3px;">
            SHIPPING LABEL
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; line-height: 1.2;">
              <div style="width: 48%;">
                <strong>From:</strong><br/>
                Uniworld Logistics pvt ltd<br/>
                Bilapur tauru road mewat 122105
              </div>
              <div style="width: 48%;">
                <strong>To:</strong><br/>
                ${order.customerName || "N/A"}<br/>
                ${order.customerAddress || "N/A"}
              </div>
            </div>
            <div style="font-size: 16px; margin: 1px 0; display: flex; justify-content: space-between;">
              <span><strong>Order No:</strong> <strong>${
                order.buyerOrderNo || "N/A"
              }</strong></span>
            </div>
            <div style="text-align: center; margin: 2px 0;">
              <svg id="barcode-download-${containerId}-${i}" width="180" height="30"></svg>
            </div>
          </div>
          <div style="text-align: center; font-size: 12px; margin-top: 2px;">
            Label ${i + 1} of ${numberOfLabels}
          </div>
        `;

        container.appendChild(label);
      }

      // Append to body
      document.body.appendChild(container);

      // Generate barcodes with a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const barcodeData = generateBarcodeData();
      Array.from({ length: numberOfLabels }, (_, i) => {
        const barcodeElement = document.getElementById(
          `barcode-download-${containerId}-${i}`
        );
        if (barcodeElement) {
          JsBarcode(barcodeElement, barcodeData, {
            format: "CODE128",
            width: 1,
            height: 30,
            displayValue: false,
            margin: 0,
          });
        }
      });

      // Wait a bit more for barcodes to render
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        width: 384,
        height: numberOfLabels * 192 + (numberOfLabels - 1) * 10,
        windowWidth: 384,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 2 * numberOfLabels + (numberOfLabels - 1) * 0.1],
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        4,
        2 * numberOfLabels + (numberOfLabels - 1) * 0.1
      );
      pdf.save(`shipping_labels_${order.buyerOrderNo || "labels"}.pdf`);
    } catch (error) {
      console.error("Download error:", error);
      message.error("Failed to download labels");
    } finally {
      // Clean up all temporary containers
      const containers = document.querySelectorAll('[id^="label-container-"]');
      containers.forEach((container) => document.body.removeChild(container));
      setIsDownloading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      title={`Print Labels for Order: ${order.buyerOrderNo || "N/A"}`}
      visible={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="print"
          icon={<PrinterOutlined />}
          onClick={handlePrintLabels}
          disabled={isDownloading}
        >
          Print Labels
        </Button>,
        <Button
          key="download"
          onClick={handleDownloadLabels}
          loading={isDownloading}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>,
        <Button key="close" onClick={handleClose} disabled={isDownloading}>
          Close
        </Button>,
      ]}
      width={700}
    >
      <div>
        <p>This will generate shipping labels for this specific order.</p>

        <div style={{ margin: "16px 0" }}>
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            Number of labels to print:
          </label>
          <InputNumber
            min={1}
            max={100}
            value={numberOfLabels}
            onChange={setNumberOfLabels}
            disabled={isDownloading}
          />
        </div>

        {/* Editable Ship To Section */}
        <div style={{ margin: "16px 0" }}>
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            Ship To (Editable):
          </label>
          <div style={{ marginTop: "8px" }}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Name:
              </label>
              <Input
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Enter recipient name"
                style={{ fontSize: "14px" }}
                disabled={isDownloading}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Address:
              </label>
              <TextArea
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Enter shipping address"
                rows={3}
                style={{ fontSize: "14px" }}
                disabled={isDownloading}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <p>
            <strong>Label Preview (4" x 2"):</strong>
          </p>
          <div
            style={{
              width: "4in",
              height: "2in",
              border: "1px solid #d9d9d9",
              padding: "5px",
              fontSize: "12px",
              marginBottom: "10px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              lineHeight: "1.2",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "3px",
                fontSize: "14px",
              }}
            >
              SHIPPING LABEL
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flexGrow: "1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "3px",
                }}
              >
                <div style={{ width: "48%", fontSize: "12px" }}>
                  <strong>From:</strong>
                  <br />
                  Uniworld Logistics pvt ltd
                  <br />
                  Bilapur tauru road mewat 122105
                </div>
                <div style={{ width: "48%", fontSize: "12px" }}>
                  <strong>To:</strong>
                  <br />
                  {toName || order.customerName || "N/A"}
                  <br />
                  {toAddress || order.customerAddress || "N/A"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                }}
              >
                <span>
                  <strong>Order No:</strong>{" "}
                  <strong>{order.buyerOrderNo || "N/A"}</strong>
                </span>
              </div>
              <div style={{ textAlign: "center", margin: "2px 0" }}>
                <Barcode
                  value={generateBarcodeData()}
                  width={1}
                  height={30}
                  fontSize={10}
                  margin={0}
                  displayValue={false}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "2px",
                fontSize: "8px",
              }}
            >
              Label 1 of {numberOfLabels}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const BulkBarcodePrint = ({ visible, onClose, items, formData }) => {
  const printRef = useRef(null);

  // Generate barcode data with only the required fields
  const generateBarcodeData = (item) => {
    // Create a compact format without JSON structure
    return `${formData.buyerRefNo}_${item.partNo}_${item.bin}_${
      item.sqty || item.pickQty || 0
    }`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Barcode Print</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 15px;
            }
            .barcode-sheet {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              width: 100%;
            }
            .barcode-item {
              border: 1px solid #ddd;
              padding: 8px;
              page-break-inside: avoid;
              break-inside: avoid;
              text-align: center;
            }
            .barcode-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .barcode-info {
              font-size: 11px;
              margin: 3px 0;
              line-height: 1.2;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-header">
            <h2>Barcodes for ${formData.buyerRefNo || "N/A"}</h2>
            <p><strong>Customer:</strong> ${formData.customerName || "N/A"}</p>
          </div>
          <div class="barcode-sheet">
            ${items
              .map(
                (item) => `
              <div class="barcode-item">
                <div class="barcode-info"><strong>${
                  item.partNo || "N/A"
                }</strong></div>
                <div class="barcode-info">${item.partDesc || "N/A"}</div>
                <div style="margin:5px 0;">
                  <!-- Barcode will be generated by the browser's print function -->
                </div>
                <div class="barcode-info"><strong>Bin:</strong> ${
                  item.bin || "N/A"
                }</div>
                <div class="barcode-info"><strong>Qty:</strong> ${
                  item.sqty || item.pickQty || 0
                }</div>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="no-print" style="margin-top:20px; text-align:center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Add the return statement with the modal JSX
  return (
    <Modal
      title="Print All Barcodes"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print All
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      <div>
        <Text>
          This will generate a printable sheet with barcodes for all{" "}
          {items.length} items.
        </Text>
        <div style={{ marginTop: "16px" }}>
          <Text strong>Details:</Text>
          <br />
          <Text>Buyer Ref: {formData.buyerRefNo || "N/A"}</Text>
          <br />
          <Text>Customer: {formData.customerName || "N/A"}</Text>
          <br />
          <Text>Items: {items.length}</Text>
        </div>

        {/* Preview of barcodes */}
        <div
          style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}
        >
          <Row gutter={[16, 16]}>
            {items.map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    padding: "8px",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Text strong style={{ display: "block", fontSize: "11px" }}>
                    {item.partNo || "N/A"}
                  </Text>
                  <Text
                    style={{
                      display: "block",
                      fontSize: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    {item.partDesc || "N/A"}
                  </Text>
                  <div style={{ margin: "5px 0" }}>
                    <Barcode
                      value={generateBarcodeData(item)}
                      width={0.8}
                      height={25}
                      fontSize={7}
                      margin={1}
                    />
                  </div>
                  <Text style={{ display: "block", fontSize: "9px" }}>
                    <strong>Bin:</strong> {item.bin || "N/A"}
                  </Text>
                  <Text style={{ display: "block", fontSize: "9px" }}>
                    <strong>Qty:</strong> {item.sqty || item.pickQty || 0}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export const WMSPickRequest = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [isLoading, setIsLoading] = useState(false);
  const [buyerOrderNoList, setBuyerOrderNoList] = useState([]);
  const [listView, setListView] = useState(false);
  const [editId, setEditId] = useState("");
  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginUserName, setLoginUserName] = useState(
    localStorage.getItem("userName")
  );
  const [branch, setBranch] = useState(localStorage.getItem("branch"));
  const [branchCode, setBranchCode] = useState("HARW");

  const [client, setClient] = useState("CASIO WATCH");
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [warehouse, setWarehouse] = useState(localStorage.getItem("warehouse"));
  const [orderItems, setOrderItems] = useState([]);
  const [bulkPrintVisible, setBulkPrintVisible] = useState(false);
  const [finYear, setFinYear] = useState(localStorage.getItem("finYear"));

  // const [downloadPdf, setDownloadPdf] = useState(false);
  // const [pdfData, setPdfData] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [form] = Form.useForm();
  const [scannedItems, setScannedItems] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [selectedItemForBarcode, setSelectedItemForBarcode] = useState(null);
  const [generatedBarcodes, setGeneratedBarcodes] = useState({});
  const barcodeRef = useRef(null);

  // Barcode generation function with all required fields

  // Generate barcode for an item

  // Print barcode

  // Add this to your component's state
  const [labelPrintModalVisible, setLabelPrintModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Add this function to handle printing for a single order
  const handleRowLabelPrint = (order) => {
    setCurrentOrder(order);
    setLabelPrintModalVisible(true);
  };

  // Download barcode as PDF
  const handleDownloadBarcode = () => {
    if (barcodeRef.current && selectedItemForBarcode) {
      html2canvas(barcodeRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`barcode_${selectedItemForBarcode.partNo}.pdf`);
      });
    }
  };
  const handleGenerateBarcode = (item) => {
    const barcodeData = generateBarcodeData(item);
    setSelectedItemForBarcode({ ...item, barcodeData });
    setBarcodeModalVisible(true);

    // Store the generated barcode
    setGeneratedBarcodes((prev) => ({
      ...prev,
      [item.id]: barcodeData,
    }));
  };

  const handlePrintBarcode = () => {
    if (barcodeRef.current) {
      html2canvas(barcodeRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body { 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  margin: 0; 
                }
                img { 
                  max-width: 100%; 
                  max-height: 100%; 
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
    }
  };
  // Enhanced barcode scanning with validation

  // Validate scanned barcode against expected data
  const validateBarcode = (scannedData) => {
    // Check if all required fields are present
    const requiredFields = [
      "buyerRefNo",
      "customerName",
      "partNo",
      "partDesc",
      "bin",
      "sqty",
      "dtlId",
    ];
    const hasAllFields = requiredFields.every((field) =>
      scannedData.hasOwnProperty(field)
    );

    if (!hasAllFields) return false;

    // Check if the scanned data matches our form data and item data
    const itemMatch = fillGridData.find(
      (item) => item.id === scannedData.dtlId
    );

    if (!itemMatch) return false;

    return (
      scannedData.buyerRefNo === formData.buyerRefNo &&
      scannedData.customerName === formData.customerName &&
      scannedData.partNo === itemMatch.partNo &&
      scannedData.partDesc === itemMatch.partDesc &&
      scannedData.bin === itemMatch.bin &&
      Number(scannedData.sqty) ===
        Number(itemMatch.sqty || itemMatch.pickQty || 0)
    );
  };

  // Add a column for barcode actions in the table
  const addBarcodeColumnToTable = () => {
    return <col style={{ width: "100px" }} />;
  };

  // Add barcode action cell to each row
  const addBarcodeActionCell = (item) => {
    return (
      <td
        style={{
          padding: "2px", // reduce padding inside cell
          textAlign: "center",
          maxHeight: "8px",
          maxWidth: "40px",
        }}
      >
        <Button
          icon={<BarcodeOutlined />}
          onClick={() => handleGenerateBarcode(item)}
          type="text"
          style={{ color: "white" }}
          title="Generate Barcode"
        />
      </td>
    );
  };

  const [formData, setFormData] = useState({
    docId: "",
    docDate: dayjs().format("DD-MM-YYYY"),
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: null,
    clientName: "",
    customerName: "",
    customerShortName: "",
    outTime: "",
    clientAddress: "",
    customerAddress: "",
    status: "Confirm",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
    pickOrder: "FIFO",
    buyerOrderDate: null,
    freeze: false,
    InputNumber: 0,
  });

  const [value, setValue] = useState(0);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [itemTableData, setItemTableData] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [buyerOrderList, setBuyerOrderList] = useState([]);
  const [pickRequestItems, setPickRequestItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pdfVisible, setPdfVisible] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [labelPrintVisible, setLabelPrintVisible] = useState(false);

  const [loginFinYear, setLoginFinYear] = useState("2025");
  const [loginBranchCode, setLoginBranchCode] = useState(
    localStorage.getItem("branchcode")
  );
  const [loginBranch, setLoginBranch] = useState(
    localStorage.getItem("branch")
  );
  const [loginClient, setLoginClient] = useState(
    localStorage.getItem("client")
  );
  const [loginWarehouse, setLoginWarehouse] = useState(
    localStorage.getItem("warehouse")
  );
  const [loginCustomer, setLoginCustomer] = useState(
    localStorage.getItem("customer")
  );

  const [bulkLabelPrintVisible, setBulkLabelPrintVisible] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // State for bulk barcode printing

  const [barcodePrintItems, setBarcodePrintItems] = useState([]);
  const [barcodeFormData, setBarcodeFormData] = useState({});

  // Function to handle bulk barcode printing
  const handleBulkPrintClick = (order) => {
    if (order && order.wmsPickrequestdtlVO) {
      setBarcodePrintItems(order.wmsPickrequestdtlVO);
      setBarcodeFormData({
        buyerRefNo: order.buyerRefNo,
        customerName: order.customerName,
      });
    } else {
      // Use the current form data and items
      setBarcodePrintItems(fillGridData);
      setBarcodeFormData({
        buyerRefNo: formData.buyerRefNo,
        customerName: formData.customerName,
      });
    }
    setBulkPrintVisible(true);
  };

  // First, ensure buyerOrderList is an array

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme === "dark" ? "dark" : "light",
      success: {
        main: theme === "dark" ? "#4caf50" : "#2e7d32",
        light:
          theme === "dark"
            ? "rgba(76, 175, 80, 0.1)"
            : "rgba(46, 125, 50, 0.1)",
        dark: theme === "dark" ? "#388e3c" : "#1b5e20",
      },
      orange: {
        main: theme === "dark" ? "#ff9800" : "#f57c00",
        light:
          theme === "dark"
            ? "rgba(255, 152, 0, 0.1)"
            : "rgba(245, 124, 0, 0.1)",
        dark: theme === "dark" ? "#f57c00" : "#e65100",
      },
    },
  });

  const [itemTableErrors, setItemTableErrors] = useState([
    {
      availQty: "",
      batchDate: "",
      batchNo: "",
      binClass: "",
      binType: "",
      cellType: "",
      clientCode: "",
      core: "",
      bin: "",
      orderQty: "",
      partDesc: "",
      partNo: "",
      pcKey: "",
      pickQty: "",
      remainQty: "",
      sku: "",
      ssku: "",
      status: "",
      grnNo: "",
      grnDate: "",
      expDate: "",
      stockDate: "",
      qcFlag: "",
      remarks: "",
    },
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    docId: "",
    docDate: dayjs(),
    buyerOrderNo: "",
    buyerRefNo: "",
    buyerRefDate: null,
    clientName: "",
    customerName: "",
    customerShortName: "",
    outTime: "",
    clientAddress: "",
    customerAddress: "",
    buyerOrderDate: "",
    buyersReference: "",
    invoiceNo: "",
    clientShortName: "",
    InputNumber: 0,
  });

  const listViewColumns = [
    { title: "Doc Id", dataIndex: "docId", key: "docId", width: 140 },
    {
      title: "Buyer Order No",
      dataIndex: "buyerOrderNo",
      key: "buyerOrderNo",
      width: 140,
    },
    {
      title: "Buyer order RefNo",
      dataIndex: "buyerRefNo",
      key: "buyerRefNo",
      width: 140,
    },
    { title: "Status", dataIndex: "status", key: "status", width: 140 },
  ];

  const [listViewData, setListViewData] = useState([]);

  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "80%",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    background: "rgba(255, 255, 255, 0.05)",
    cursor: "not-allowed",
    width: "100%",
  };

  const datePickerStyle = {
    width: "80%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const selectStyle = {
    width: "90%",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  // Barcode generation function
  const generateBarcodeData = (item) => {
    return `${formData.docId}_${formData.customerName}_${item.partNo}_${
      item.bin
    }_${item.sqty || item.pickQty || item.id || 0}`;
  };

  // Handle barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter") {
      try {
        const scannedData = JSON.parse(barcodeInput);
        const matchingItem = fillGridData.find(
          (item) =>
            item.partNo === scannedData.partNo && item.id === scannedData.dtlId
        );

        if (matchingItem) {
          // Update the item's qcFlag
          const updatedData = fillGridData.map((item) =>
            item.id === matchingItem.id
              ? { ...item, qcFlag: "T", scanned: true }
              : item
          );

          setFillGridData(updatedData);
          setScannedItems((prev) => [...prev, matchingItem.id]);

          message.success(`Scanned: ${matchingItem.partNo}`);
        } else {
          message.error("No matching item found");
        }
        setBarcodeInput("");
      } catch (error) {
        console.error("Invalid barcode format", error);
        message.error("Invalid barcode format");
        setBarcodeInput("");
      }
    }
  };

  // Update picked items
  const handleUpdatePickedItems = async () => {
    if (scannedItems.length === 0) {
      message.warning("No items scanned");
      return;
    }

    try {
      const updateData = {
        pickRequestHdrId: editId,
        pickRequestDtlId: scannedItems,
        status: "COMPLETED",
      };

      const response = await axios.post(
        `${API_URL}/api/wmspickrequest/updatePick`,
        updateData
      );

      if (response.data.status === true) {
        message.success("Pick updated successfully");
        setScannedItems([]);
        setIsEditMode(false);
        // Refresh data or update local state
        getAllPickRequest();
      } else {
        message.error("Update failed");
      }
    } catch (error) {
      console.error("Error updating pick:", error);
      message.error("Update failed");
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setScannedItems([]);
    }
  };

  const getAllPickRequest = async () => {
    try {
      setLoading(true);
      console.log(
        "API URL:",
        `${API_URL}/api/wmspickrequest/findAllPick?branchCode=${branchCode}&client=${client}&finYear=${loginFinYear}`
      );

      const response = await axios.get(
        `${API_URL}/api/wmspickrequest/findAllPick?branchCode=${branchCode}&client=${client}&finYear=${loginFinYear}`
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response data type:", typeof response.data);

      // Check if response.data exists and log its properties
      if (response.data) {
        console.log("Response data keys:", Object.keys(response.data));
        console.log("Is array:", Array.isArray(response.data));

        // Check common response patterns
        if (Array.isArray(response.data)) {
          console.log("Direct array response received");
          setBuyerOrderList(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log("Response with data property containing array");
          setBuyerOrderList(response.data.data);
        } else if (
          response.data.result &&
          Array.isArray(response.data.result)
        ) {
          console.log("Response with result property containing array");
          setBuyerOrderList(response.data.result);
        } else if (response.data.items && Array.isArray(response.data.items)) {
          console.log("Response with items property containing array");
          setBuyerOrderList(response.data.items);
        } else if (response.data.paramObjectsMap) {
          console.log("Response with paramObjectsMap");
          // Check if there's a specific property inside paramObjectsMap
          const mapKeys = Object.keys(response.data.paramObjectsMap);
          console.log("paramObjectsMap keys:", mapKeys);

          if (
            mapKeys.length > 0 &&
            Array.isArray(response.data.paramObjectsMap[mapKeys[0]])
          ) {
            setBuyerOrderList(response.data.paramObjectsMap[mapKeys[0]]);
          } else {
            throw new Error("Unexpected paramObjectsMap structure");
          }
        } else if (response.data.status !== undefined) {
          console.log("Response with status property");
          // Many APIs return {status: true, data: [...]} or {status: true, result: [...]}
          if (response.data.data && Array.isArray(response.data.data)) {
            setBuyerOrderList(response.data.data);
          } else if (
            response.data.result &&
            Array.isArray(response.data.result)
          ) {
            setBuyerOrderList(response.data.result);
          } else {
            throw new Error("Status response but no array data found");
          }
        } else {
          console.error("Unknown response format:", response.data);
          throw new Error("Unexpected data format received");
        }
      } else {
        throw new Error("No data in response");
      }
    } catch (error) {
      console.error("Error fetching pick requests:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      }
      message.error(error.message || "Failed to fetch pick requests");
      setBuyerOrderList([]);
    } finally {
      setLoading(false);
    }
  };

  // Get all pick request (example function)
  // const getAllPickRequest = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${API_URL}/api/wmspickrequest/findAllPick?branchCode=${branchCode}&client=${client}&finYear=${loginFinYear}`
  //     );
  //     setBuyerOrderList(response.data);
  //     console.log("buyerOrderlist", response.data); // Use response.data directly
  //   } catch (error) {
  //     console.error("Error fetching pick requests:", error);
  //     message.error("Failed to fetch pick requests");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Add safety checks
  const safeBuyerOrderList = buyerOrderList ? buyerOrderList : [];

  console.log("safeBuyerOrderList", safeBuyerOrderList);
  // Use the safe array for pagination
  const paginatedData = safeBuyerOrderList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    console.log("buyerOrderList updated:", buyerOrderList);
    console.log(
      "safeBuyerOrderList:",
      Array.isArray(buyerOrderList) ? buyerOrderList : []
    );
    console.log("paginatedData", paginatedData);
  }, [buyerOrderList]);

  console.log("paginatedData", paginatedData);

  // Get item by ID (example function)
  const getAllItemById = async (order) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/wmspickrequest/${order.id}`
      );
      setFormData({
        ...formData,
        docId: response.data.docId,
        buyerOrderNo: response.data.buyerOrderNo,
        clientName: response.data.clientName,
        customerName: response.data.customerName,
        clientAddress: response.data.clientAddress,
        customerAddress: response.data.customerAddress,
        // Set other fields as needed
      });
      setFillGridData(response.data.wmsPickrequestdtlVO || []);
      setEditId(response.data.id);
    } catch (error) {
      console.error("Error fetching item:", error);
      message.error("Failed to fetch item details");
    } finally {
      setLoading(false);
    }
  };

  // Handle clear function
  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: dayjs().format("DD-MM-YYYY"),
      buyerOrderNo: "",
      buyerRefNo: "",
      buyerRefDate: null,
      clientName: "",
      customerName: "",
      customerShortName: "",
      outTime: "",
      clientAddress: "",
      customerAddress: "",
      status: "Confirm",
      buyersReference: "",
      invoiceNo: "",
      clientShortName: "",
      pickOrder: "FIFO",
      buyerOrderDate: null,
      freeze: false,
      InputNumber: 0,
    });
    setFillGridData([]);
    setScannedItems([]);
    setIsEditMode(false);
  };

  // Handle save function
  const handleSave = async () => {
    // Implement save logic here
    message.info("Save functionality to be implemented");
  };

  // Handle add item function
  const handleAddItem = () => {
    // Implement add item logic here
    message.info("Add item functionality to be implemented");
  };

  // Get all fill grid function
  const getAllFillGrid = () => {
    // Implement fill grid logic here
    message.info("Fill grid functionality to be implemented");
  };

  // Handle item change function
  const handleItemChange = (id, field, value) => {
    const updatedData = fillGridData.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFillGridData(updatedData);
  };

  // Handle delete item function
  const handleDeleteItem = (id) => {
    const updatedData = fillGridData.filter((item) => item.id !== id);
    setFillGridData(updatedData);
  };

  // Handle buyer ref no select function
  const handleBuyerRefNoSelect = (value) => {
    setFormData({ ...formData, buyerRefNo: value });
  };

  // Handle date change function
  const handleDateChange = (field, date) => {
    setFormData({ ...formData, [field]: date });
  };

  useEffect(() => {
    // Fetch initial data
    getAllPickRequest();
  }, []);

  useEffect(() => {
    console.log("buyerOrderList state:", buyerOrderList);
    console.log("Type of buyerOrderList:", typeof buyerOrderList);
    console.log("Is array:", Array.isArray(buyerOrderList));
    if (Array.isArray(buyerOrderList)) {
      console.log("Number of items:", buyerOrderList.length);
    }
  }, [buyerOrderList]);

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: theme === "dark" ? "dark-mode" : "" },
      }}
    >
      <div
        className={`performance-goals-gd-container ${
          theme === "dark" ? "dark-mode" : ""
        }`}
      >
        {/* Barcode Modal */}
        <Modal
          title="Barcode"
          visible={barcodeModalVisible}
          onCancel={() => setBarcodeModalVisible(false)}
          footer={[
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={handlePrintBarcode}
            >
              Print
            </Button>,
            <Button key="download" onClick={handleDownloadBarcode}>
              Download PDF
            </Button>,
            <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={400}
        >
          {selectedItemForBarcode && (
            <div style={{ textAlign: "center" }} ref={barcodeRef}>
              <Typography.Title level={5}>
                {selectedItemForBarcode.partNo}
              </Typography.Title>
              <Typography.Text>
                {selectedItemForBarcode.partDesc}
              </Typography.Text>
              <div style={{ margin: "20px 0" }}>
                <Barcode
                  value={selectedItemForBarcode.barcodeData}
                  width={0.2}
                  height={40}
                  fontSize={10}
                  margin={5}
                />
              </div>
              <Typography.Text type="secondary">
                Buyer Ref: {formData.buyerRefNo}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Customer: {formData.customerName}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Bin: {selectedItemForBarcode.bin}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Qty:{" "}
                {selectedItemForBarcode.sqty ||
                  selectedItemForBarcode.pickQty ||
                  0}
              </Typography.Text>
            </div>
          )}
        </Modal>
        {isSubmitting && (
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
              {/* Barcode Modal */}
              <Modal
                title="Barcode"
                visible={barcodeModalVisible}
                onCancel={() => setBarcodeModalVisible(false)}
                footer={[
                  <Button
                    key="print"
                    icon={<PrinterOutlined />}
                    onClick={handlePrintBarcode}
                  >
                    Print
                  </Button>,
                  <Button key="download" onClick={handleDownloadBarcode}>
                    Download PDF
                  </Button>,
                  <Button
                    key="close"
                    onClick={() => setBarcodeModalVisible(false)}
                  >
                    Close
                  </Button>,
                ]}
                width={400}
              >
                {selectedItemForBarcode && (
                  <div style={{ textAlign: "center" }} ref={barcodeRef}>
                    <Typography.Title level={5}>
                      {selectedItemForBarcode.partNo}
                    </Typography.Title>
                    <Typography.Text>
                      {selectedItemForBarcode.partDesc}
                    </Typography.Text>
                    <div style={{ margin: "20px 0" }}>
                      <Barcode
                        value={selectedItemForBarcode.barcodeData}
                        width={0.2}
                        height={40}
                        fontSize={10}
                        margin={5}
                      />
                    </div>
                    <Typography.Text type="secondary">
                      Buyer Ref: {formData.buyerRefNo}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      Customer: {formData.customerName}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      Bin: {selectedItemForBarcode.bin}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      Qty:{" "}
                      {selectedItemForBarcode.sqty ||
                        selectedItemForBarcode.pickQty ||
                        0}
                    </Typography.Text>
                  </div>
                )}
              </Modal>

              {/* Bulk Barcode Print Modal - MOVED OUTSIDE THE TABLE */}
              <BulkBarcodePrint
                visible={bulkPrintVisible}
                onClose={() => setBulkPrintVisible(false)}
                items={barcodePrintItems}
                formData={barcodeFormData}
              />
              {/* Header */}
              <div
                className="form-containerSG"
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
                    style={{ color: "#fff", margin: 0 }}
                  >
                    Delivery Challan
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create and manage Delivery Challans
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

              {/* Action Buttons */}
              <div className="action-buttons">
                <Button
                  icon={<SearchOutlined />}
                  className="action-btn"
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
                  className="action-btn"
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
                  loading={isSubmitting}
                  onClick={handleSave}
                  className="primary-action-btn"
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
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Upload
                </Button>

                <Button
                  icon={<CloudDownloadOutlined />}
                  className="action-btn"
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Download
                </Button>

                <Button
                  icon={<BarcodeOutlined />}
                  onClick={() => setBulkPrintVisible(true)}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                    marginRight: "8px",
                  }}
                >
                  Print All Barcodes
                </Button>

                {/* Bulk barcode print modal */}
                <BulkBarcodePrint
                  visible={bulkPrintVisible}
                  onClose={() => setBulkPrintVisible(false)}
                  items={fillGridData}
                  formData={formData}
                />

                {/* Edit Mode Toggle Button */}
                <Button
                  icon={<BarcodeOutlined />}
                  onClick={toggleEditMode}
                  className="action-btn"
                  style={{
                    background: isEditMode
                      ? "rgba(76, 175, 80, 0.5)"
                      : "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
                </Button>

                {/* Update Picked Items Button */}
                {isEditMode && (
                  <Button
                    onClick={handleUpdatePickedItems}
                    className="action-btn"
                    style={{
                      background: "rgba(255, 193, 7, 0.5)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Update Picked Items
                  </Button>
                )}
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => setLabelPrintVisible(true)}
                  style={{
                    background: "rgba(108, 99, 255, 0.3)",
                    color: "#fff",
                    border: "none",
                    marginRight: "8px",
                  }}
                >
                  Print Labels
                </Button>

                <LabelPrintModal
                  visible={labelPrintVisible}
                  onClose={() => setLabelPrintVisible(false)}
                  formData={formData}
                  items={fillGridData}
                />
              </div>

              {/* Barcode Scanner Input */}
              {isEditMode && (
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Input
                    placeholder="Scan barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={handleBarcodeScan}
                    style={{
                      width: "300px",
                      marginRight: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  />
                  <span style={{ color: "white", fontSize: "12px" }}>
                    Press Enter after scanning
                  </span>
                </div>
              )}

              {/* Main Form */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                }}
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
                      tab="Order Information"
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
                        <Form layout="vertical" form={form}>
                          {/* First Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>Doc ID</span>
                                }
                              >
                                <Input
                                  value={formData.docId}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      docId: e.target.value,
                                    })
                                  }
                                  readOnly
                                  style={readOnlyInputStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Doc Date
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.docDate || ""}
                                  style={readOnlyInputStyle}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Ref No
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyerRefNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyerRefNo: e.target.value,
                                    })
                                  }
                                  style={readOnlyInputStyle}
                                  readOnly
                                />

                                {fieldErrors.buyerRefNo && (
                                  <div
                                    style={{ color: "red", fontSize: "12px" }}
                                  >
                                    {fieldErrors.buyerRefNo}
                                  </div>
                                )}
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Order Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={readOnlyInputStyle}
                                  readOnly
                                  value={formData.buyerOrderDate}
                                  format="DD-MM-YYYY"
                                  onChange={(date) =>
                                    handleDateChange("buyerOrderDate", date)
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Ref No
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyerOrderNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyerOrderNo: e.target.value,
                                    })
                                  }
                                  style={readOnlyInputStyle}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>

                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer Ref Date
                                  </span>
                                }
                              >
                                <DatePicker
                                  style={readOnlyInputStyle}
                                  value={formData.buyerRefDate}
                                  onChange={(date) =>
                                    setFormData({
                                      ...formData,
                                      buyerRefDate: date,
                                    })
                                  }
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Second Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Client Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.clientName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientName: e.target.value,
                                    })
                                  }
                                  style={readOnlyInputStyle}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Customer Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.customerName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerName: e.target.value,
                                    })
                                  }
                                  style={readOnlyInputStyle}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Customer Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.customerShortName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerShortName: e.target.value,
                                    })
                                  }
                                  style={readOnlyInputStyle}
                                  readOnly
                                />
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
                          color: "#fff",
                        }}
                      >
                        <Form layout="vertical">
                          {/* Third Row - 5 columns */}
                          <Row gutter={16}>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Buyer's Reference
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.buyersReference}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      buyersReference: e.target.value,
                                    })
                                  }
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
                                    Invoice No
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.invoiceNo}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      invoiceNo: e.target.value,
                                    })
                                  }
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
                                    Client Short Name
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.clientShortName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientShortName: e.target.value,
                                    })
                                  }
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
                                    Pick Order
                                  </span>
                                }
                              >
                                <Select
                                  value={formData.pickOrder}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      pickOrder: value,
                                    })
                                  }
                                  style={selectStyle}
                                >
                                  <Option value="FIFO">FIFO</Option>
                                  <Option value="LIFO">LIFO</Option>
                                  <Option value="FEFO">FEFO</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Out Time
                                  </span>
                                }
                              >
                                <Input
                                  value={formData.outTime}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      outTime: e.target.value,
                                    })
                                  }
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

                          {/* Address Fields */}
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Client Address
                                  </span>
                                }
                              >
                                <TextArea
                                  rows={2}
                                  value={formData.clientAddress}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      clientAddress: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label={
                                  <span style={{ color: "#fff" }}>
                                    Customer Address
                                  </span>
                                }
                              >
                                <TextArea
                                  rows={2}
                                  value={formData.customerAddress}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      customerAddress: e.target.value,
                                    })
                                  }
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

                  <div className="table-section">
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
                        className="table-container"
                        style={{
                          position: "relative",
                          width: "100%",
                          overflowX: "auto",
                          fontSize: "11px",
                          marginLeft: "0",
                          backgroundColor: "transparent",
                          maxHeight: "500px",
                          overflowY: "auto",
                          marginTop: "10px",
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
                            {/* <col style={{ width: "68px" }} />  */}
                            <col style={{ width: "50px" }} /> {/* S.No */}
                            <col style={{ width: "50px" }} /> {/* Part No */}
                            <col style={{ width: "120px" }} /> {/* Part Desc */}
                            <col style={{ width: "250px" }} /> {/* Bin */}
                            <col style={{ width: "120px" }} /> {/* SKU */}
                            {/* Batch Date */}
                            <col style={{ width: "100px" }} /> {/* Order Qty */}
                            <col style={{ width: "80px" }} /> {/* Avail Qty */}
                            <col style={{ width: "80px" }} /> {/* Pick Qty */}
                            <col style={{ width: "80px" }} /> {/* Pick Qty */}
                          </colgroup>
                          <thead
                            style={{
                              backgroundColor: "revert",
                            }}
                          >
                            <tr
                              style={{
                                borderBottom: "1px dashed #000",
                                zIndex: 2,
                                position: "sticky",
                                top: 0,
                                backgroundColor: "transparent",
                              }}
                            >
                              {/* <th
                                style={{
                                  padding: "8px",
                                  textAlign: "center",
                                  color: "white",
                                }}
                              >
                                Action
                              </th> */}
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
                                  textAlign: "center",
                                  color: "white",
                                }}
                              >
                                Barcode
                              </th>
                              <th
                                style={{
                                  padding: "8px",
                                  textAlign: "left",
                                  color: "white",
                                }}
                              >
                                Part No
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
                                Bin
                              </th>
                              <th
                                style={{
                                  padding: "8px",
                                  textAlign: "left",
                                  color: "white",
                                }}
                              >
                                SKU
                              </th>

                              <th
                                style={{
                                  padding: "8px",
                                  textAlign: "left",
                                  color: "white",
                                }}
                              >
                                Order Qty
                              </th>
                              <th
                                style={{
                                  padding: "8px",
                                  textAlign: "left",
                                  color: "white",
                                }}
                              >
                                Avail Qty
                              </th>
                              <th
                                style={{
                                  padding: "8px",
                                  textAlign: "left",
                                  color: "white",
                                }}
                              >
                                Pick Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {fillGridData.map((item, index) => (
                              <tr
                                key={item.id}
                                style={{
                                  borderBottom: "1px dashed white",
                                  color: "white",
                                }}
                              >
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

                                <td>{addBarcodeActionCell(item)}</td>

                                {/* Part No */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.partNo}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Part Desc */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.partDesc}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Bin */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.bin}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* SKU */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.sku}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Order Qty */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.orderQty}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Avail Qty */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.availQty}
                                    readOnly
                                    style={readOnlyInputStyle}
                                  />
                                </td>

                                {/* Pick Qty */}
                                <td style={{ padding: "8px" }}>
                                  <Input
                                    value={item.sqty}
                                    onChange={(e) =>
                                      handleItemChange(
                                        item.id,
                                        "pickQty",
                                        e.target.value
                                      )
                                    }
                                    style={readOnlyInputStyle}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="form-containerSG"
              style={{
                minHeight: "80vh",
                background: "var(--bg-body-gradient)",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-body-gradient)",
                  padding: "0 60px",
                }}
              >
                <Typography.Title
                  level={3}
                  style={{ color: "#fff", margin: "20px 0" }}
                >
                  Delivery Challan List
                </Typography.Title>
                {/* <Button
                  icon={<PlusOutlined />}
                  onClick={toggleViewMode}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    marginTop: "20px",
                    border: "none",
                  }}
                >
                  New Order
                </Button> */}
              </div>

              <div
                className="table-container"
                style={{
                  position: "relative",
                  width: "80%",
                  overflowX: "auto",
                  fontSize: "11px",
                  maxHeight: "500px",
                  overflowY: "auto",
                  margin: "40px auto",
                  background: "var(--bg-body-gradient)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
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
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Action
                      </th>
                      {listViewColumns.map((column) => (
                        <th
                          key={column.key}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "white",
                          }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(buyerOrderList) &&
                    buyerOrderList.length > 0 ? (
                      buyerOrderList?.map((order, index) => (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            {/* View Button */}
                            <Button
                              type="link"
                              icon={<RightCircleOutlined />}
                              onClick={() => {
                                getAllItemById(order);
                                toggleViewMode();
                              }}
                              style={{ color: "white", marginRight: "8px" }}
                              title="View Details"
                            />
                            {/* PDF Download Button */}
                            {/* <Button
                              type="link"
                              icon={<CloudDownloadOutlined />}
                              onClick={() => {
                                if (order && order.wmsPickrequestdtlVO) {
                                  setCurrentPdfData(order);
                                  setPdfVisible(true);
                                } else {
                                  message.warning(
                                    "No order data available for PDF generation!"
                                  );
                                }
                              }}
                              style={{ color: "white" }}
                              title="Download PDF"
                            />{" "} */}
                            <Button
                              icon={<BarcodeOutlined />}
                              onClick={() => handleRowLabelPrint(order)}
                              style={{
                                background: order.customerAddress
                                  ? "rgba(108, 99, 255, 0.3)" // blue
                                  : "rgba(255, 99, 99, 0.8)", // red
                                color: "#fff",
                                border: "none",
                                marginRight: "8px",
                              }}
                              title="Print Labels"
                            >
                              Print Labels
                            </Button>
                            <RowLabelPrintModal
                              visible={labelPrintModalVisible}
                              onClose={() => setLabelPrintModalVisible(false)}
                              order={currentOrder}
                            />
                          </td>

                          {/* Table Columns */}
                          {listViewColumns.map((column) => (
                            <td
                              key={column.key}
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                color: "white",
                                fontSize: "11px",
                              }}
                            >
                              {column.render
                                ? column.render(
                                    order[column.dataIndex],
                                    order,
                                    index
                                  )
                                : order[column.dataIndex]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          style={{
                            textAlign: "center",
                            color: "white",
                            padding: "20px",
                          }}
                        >
                          {loading ? "Loading..." : "No data available"}
                        </td>
                      </tr>
                    )}
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
                    {Math.min(currentPage * pageSize, paginatedData.length)} of{" "}
                    {paginatedData.length} items
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
                    { length: Math.ceil(paginatedData.length / pageSize) },
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
                          Math.ceil(paginatedData.length / pageSize)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(paginatedData.length / pageSize)
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
                        Math.ceil(paginatedData.length / pageSize)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        currentPage ===
                        Math.ceil(paginatedData.length / pageSize)
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

        {/* Fill Grid Modal */}
        {/* PDF Generation Component - Add this at the end of your component */}
        <WMSGeneratePdfTempPick
          row={currentPdfData}
          visible={pdfVisible}
          onComplete={() => {
            setPdfVisible(false);
            setCurrentPdfData(null);
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default WMSPickRequest;
