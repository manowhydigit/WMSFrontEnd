import DownloadIcon from "@mui/icons-material/Download";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";

const GeneratePdfTempPick = ({ row, callBackFunction }) => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const theme = useTheme();

  // Function to open the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Function to generate and download the PDF
  const handleDownloadPdf = async () => {
    const input = document.getElementById("pdf-content");
    if (input) {
      const canvas = await html2canvas(input, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PICK_${row.docId}.pdf`);

      handleClose();
    } else {
      console.error("Element not found: 'pdf-content'");
    }
  };

  // Automatically open the dialog when the component is rendered
  useEffect(() => {
    if (row) {
      handleOpen();
    }
    console.log("RowData =>", row);

    // Call the callback function to pass handleDownloadPdf if needed
    if (callBackFunction) {
      callBackFunction(handleDownloadPdf);
    }

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
  }, [row, callBackFunction]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
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
            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            boxSizing: "border-box",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              paddingBottom: "15px",
              borderBottom: "2px solid #673ab7",
            }}
          >
            <div style={{ textAlign: "left", width: "30%" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#673ab7",
                }}
              >
                UNIWORLD WMS
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Warehouse Management System
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                width: "40%",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              PICK REQUEST
            </div>
            <div
              style={{
                textAlign: "right",
                width: "30%",
                fontSize: "14px",
                color: "#555",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {localStorage.getItem("branch")}
              </div>
              <div style={{ fontSize: "12px" }}>{currentDateTime}</div>
            </div>
          </div>

          {/* Details Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "25px",
              padding: "15px",
              backgroundColor: "#f9f5ff",
              borderRadius: "8px",
              border: "1px solid #e0d6ff",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "120px",
                    fontWeight: "bold",
                    color: "#673ab7",
                  }}
                >
                  Customer:
                </div>
                <div>{row.customerName || row.customer}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "120px",
                    fontWeight: "bold",
                    color: "#673ab7",
                  }}
                >
                  Pick No:
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {row.docId}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "120px",
                    fontWeight: "bold",
                    color: "#673ab7",
                  }}
                >
                  Pick Date:
                </div>
                <div>{row.docDate}</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "140px",
                    fontWeight: "bold",
                    color: "#673ab7",
                    textAlign: "left",
                  }}
                >
                  Order No:
                </div>
                <div>{row.buyerRefNo}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "140px",
                    fontWeight: "bold",
                    color: "#673ab7",
                    textAlign: "left",
                  }}
                >
                  Buyer Order No:
                </div>
                <div>{row.buyerOrderNo}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    minWidth: "140px",
                    fontWeight: "bold",
                    color: "#673ab7",
                    textAlign: "right",
                  }}
                >
                  Buyer Order Date:
                </div>
                <div>{row.buyerOrderDate}</div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "25px",
              fontSize: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#673ab7",
                  color: "black",
                  textAlign: "center",
                }}
              >
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Sl.
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Part Code
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Part Description
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Batch
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Pick Qty
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Location
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Tick
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #d4c6ff",
                    fontWeight: "bold",
                  }}
                >
                  Avl Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {row.pickRequestDetailsVO?.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                    transition: "background-color 0.2s",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      fontWeight: "500",
                    }}
                  >
                    {item.partNo}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {item.partDesc}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {item.batchNo || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {item.sku}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#2e7d32",
                    }}
                  >
                    {item.pickQty}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {item.bin}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        width: "18px",
                        height: "18px",
                        borderRadius: "3px",
                        border: "2px solid #673ab7",
                        textAlign: "center",
                        lineHeight: "18px",
                        margin: "0 auto",
                      }}
                    ></div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {item.availQty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f3e5f5",
                borderRadius: "8px",
                width: "45%",
                minHeight: "100px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "#673ab7",
                }}
              >
                Remarks:
              </div>
              <div
                style={{ borderBottom: "1px dashed #ccc", height: "60px" }}
              ></div>
            </div>

            <div
              style={{
                textAlign: "right",
                padding: "15px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                width: "45%",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2e7d32",
                  marginBottom: "10px",
                }}
              >
                TOTAL:{" "}
                {row.pickRequestDetailsVO?.reduce(
                  (sum, item) => sum + (item.pickQty || 0),
                  0
                )}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontStyle: "italic",
                }}
              >
                Printed By: {localStorage.getItem("userName")}
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "60px",
              paddingTop: "20px",
              borderTop: "1px dashed #ccc",
            }}
          >
            <div
              style={{
                textAlign: "center",
                width: "30%",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #673ab7",
                  paddingBottom: "25px",
                  marginBottom: "5px",
                  width: "80%",
                  margin: "0 auto",
                }}
              ></div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                Prepared By
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                width: "30%",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #673ab7",
                  paddingBottom: "25px",
                  marginBottom: "5px",
                  width: "80%",
                  margin: "0 auto",
                }}
              ></div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                Checked By
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                width: "30%",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #673ab7",
                  paddingBottom: "25px",
                  marginBottom: "5px",
                  width: "80%",
                  margin: "0 auto",
                }}
              ></div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                Authorized Signatory
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div
            style={{
              marginTop: "30px",
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              color: "#777",
              borderTop: "2px solid #673ab7",
            }}
          >
            <div>Uniworld Logistics - Warehouse Management System</div>
            <div>
              {localStorage.getItem("branch")} •{" "}
              {localStorage.getItem("address")}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button
          onClick={handleDownloadPdf}
          color="primary"
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Download PDF
        </Button>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratePdfTempPick;
