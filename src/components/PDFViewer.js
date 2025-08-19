// PDFViewer.js
import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import PurchaseOrderPDF from "./PurchaseOrderPDF";

const PDFViewer = ({ open, onClose, formData, items }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "680px",
          maxWidth: "680px", // Ensures it doesn't exceed 800px
        },
      }}
      fullWidth
    >
      <DialogContent>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <PurchaseOrderPDF formData={formData} items={items} />
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
