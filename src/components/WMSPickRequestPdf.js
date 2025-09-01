import React, { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const WMSGeneratePdfTempPick = ({ row, onComplete, visible }) => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    if (visible && row) {
      setOpen(true);

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentDateTime(`${formattedDate} ${formattedTime}`);
    }
  }, [visible, row]);

  const handleClose = () => {
    setOpen(false);
    if (onComplete) onComplete();
  };

  const handleDownloadPdf = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`PICK_${row?.docId || "document"}.pdf`);

    handleClose();
  };

  if (!row) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(45deg, #673ab7 30%, #9575cd 90%)",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        PICK REQUEST - PREVIEW
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <div
          id="pdf-content"
          style={{
            padding: "25px",
            backgroundColor: "#ffffff",
            width: "210mm",
            minHeight: "297mm",
            margin: "0 auto",
            fontFamily: "'Roboto','Helvetica','Arial',sans-serif",
            color: "#333",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #673ab7",
              paddingBottom: "15px",
              marginBottom: "25px",
            }}
          >
            <div style={{ color: "#673ab7", fontWeight: "bold", fontSize: 20 }}>
              UNIWORLD WMS
            </div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>PICK REQUEST</div>
            <div style={{ textAlign: "right", fontSize: 12 }}>
              <div style={{ fontWeight: "bold" }}>Haryana</div>
              <div>{currentDateTime}</div>
            </div>
          </div>

          {/* DETAILS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "25px",
              backgroundColor: "#f9f5ff",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <div>
              <div>
                <b style={{ color: "#673ab7" }}>Customer:</b> {row.customerName}
              </div>
              <div>
                <b style={{ color: "#673ab7" }}>Pick No:</b> {row.docId}
              </div>
              <div>
                <b style={{ color: "#673ab7" }}>Pick Date:</b>
                {row.docDate
                  ? new Date(row.docDate).toLocaleDateString("en-GB")
                  : ""}
              </div>
            </div>
            <div>
              <div>
                <b style={{ color: "#673ab7" }}>Order No:</b> {row.buyerRefNo}
              </div>
              <div>
                <b style={{ color: "#673ab7" }}>Buyer Order No:</b>{" "}
                {row.buyerOrderNo}
              </div>
              <div>
                <b style={{ color: "#673ab7" }}>Buyer Order Date:</b>{" "}
                {row.buyerOrderDate
                  ? new Date(row.buyerOrderDate).toLocaleDateString("en-GB")
                  : ""}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
              marginBottom: "25px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#673ab7", color: "black" }}>
                {[
                  "Sl.",
                  "Part Code",
                  "Part Description",
                  "Batch",
                  "Unit",
                  "Pick Qty",
                  "Location",
                  "Tick",
                  "Avl Qty",
                ].map((head, idx) => (
                  <th
                    key={idx}
                    style={{
                      border: "1px solid #d4c6ff",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {row.wmsPickrequestdtlVO.map((item, index) => (
                <tr
                  key={index}
                  style={{ background: index % 2 ? "#fff" : "#fafafa" }}
                >
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td style={{ border: "1px solid #eee" }}>{item.partNo}</td>
                  <td style={{ border: "1px solid #eee" }}>{item.partDesc}</td>
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    {item.batchNo || "-"}
                  </td>
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    {item.sku}
                  </td>
                  <td
                    style={{
                      border: "1px solid #eee",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#2e7d32",
                    }}
                  >
                    {item.sqty}
                  </td>
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    {item.bin}
                  </td>
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid #673ab7",
                        borderRadius: 3,
                        margin: "auto",
                      }}
                    />
                  </td>
                  <td style={{ border: "1px solid #eee", textAlign: "center" }}>
                    {item.availQty}
                  </td>
                </tr>
              ))}
              {/* TOTAL ROW */}
              <tr style={{ background: "#f3e5f5", fontWeight: "bold" }}>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #d4c6ff",
                    textAlign: "right",
                    padding: "8px",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    border: "1px solid #d4c6ff",
                    textAlign: "center",
                    color: "#d32f2f",
                    fontWeight: "bold",
                  }}
                >
                  {row.wmsPickrequestdtlVO.reduce(
                    (sum, item) => sum + (Number(item.sqty) || 0),
                    0
                  )}
                </td>
                <td colSpan={3} style={{ border: "1px solid #d4c6ff" }}></td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER */}
          <div style={{ marginTop: 40, textAlign: "center", fontSize: 11 }}>
            <div>Uniworld Logistics - Warehouse Management System</div>
            <div>Haryana • {localStorage.getItem("address")}</div>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button
          onClick={handleDownloadPdf}
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ borderRadius: 2, fontWeight: "bold" }}
        >
          Download PDF
        </Button>
        <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WMSGeneratePdfTempPick;
