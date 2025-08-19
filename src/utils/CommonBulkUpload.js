import React, { useState } from "react";
import axios from "axios";
import { Button, Typography, message } from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { showToast } from "./toast-component";

const { Text } = Typography;

const CommonBulkUpload = ({
  open,
  handleClose,
  dialogTitle = "Upload File",
  uploadText = "Upload file",
  downloadText = "Sample File",
  onSubmit,
  sampleFileDownload,
  handleFileUpload,
  apiUrl,
  screen,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validExtensions = [".xls", ".xlsx"];
      const fileName = file.name.toLowerCase();
      const isValidFile = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValidFile) {
        message.error("Please upload a valid Excel file (.xls, .xlsx)");
        return;
      }

      setSelectedFile(file);
      if (handleFileUpload) {
        handleFileUpload(event);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      message.warning("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status) {
        const successMsg =
          response.data.paramObjectsMap?.paramObjectsMap?.message ||
          `${screen} uploaded successfully`;
        const successfulUploads =
          response.data.paramObjectsMap?.successfulUploads || 0;

        showToast("success", successMsg);
        message.success(`${successMsg} (${successfulUploads} records)`);
      } else {
        const errorMsg =
          response.data.paramObjectsMap?.errorMessage ||
          `${screen} upload failed`;
        showToast("error", errorMsg);
      }

      handleClose();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Upload error:", error);
      showToast("error", error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="glass-card"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "450px",
        maxWidth: "90%",
        padding: "25px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        zIndex: 1000,
      }}
    >
      {/* Close button */}
      <button
        className="close-popup"
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "20px",
          cursor: "pointer",
          "&:hover": {
            color: "white",
          },
        }}
      >
        <CloseOutlined />
      </button>

      {/* Header */}
      <div
        className="card-header"
        style={{
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          {dialogTitle}
        </Text>
      </div>

      {/* Content */}
      <div
        className="form-content"
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        {/* Upload area */}
        <div
          style={{
            padding: "30px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            border: "2px dashed rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s",
            "&:hover": {
              borderColor: "rgba(24, 144, 255, 0.5)",
            },
          }}
          onClick={() => document.getElementById("file-upload").click()}
        >
          <CloudUploadOutlined
            style={{ fontSize: "48px", color: "rgba(24, 144, 255, 0.8)" }}
          />
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "16px",
            }}
          >
            Drag and drop your file here or click to browse
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
            }}
          >
            Supported formats: .xls, .xlsx
          </Text>
        </div>

        {/* Selected file info */}
        {selectedFile && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
            }}
          >
            <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Selected: {selectedFile.name}
            </Text>
            <Button
              type="link"
              onClick={() => setSelectedFile(null)}
              style={{
                color: "white",
                marginLeft: "10px",
              }}
            >
              Remove
            </Button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />

        {/* Sample File Download */}
        <div style={{ marginTop: "25px" }}>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              display: "block",
              marginBottom: "5px",
              color: "white",
            }}
          >
            Download sample file
          </Text>
          <Button
            type="link"
            href={sampleFileDownload}
            download
            style={{
              // color: "rgba(24, 144, 255, 0.9)",
              padding: 0,
              height: "auto",
              color: "white",
            }}
            icon={<DownloadOutlined />}
          >
            {downloadText}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div
        className="form-actions"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <Button
          onClick={handleClose}
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "6px 20px",
            "&:hover": {
              borderColor: "white",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={uploading}
          style={{
            background: "rgba(108, 99, 255, 0.3)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "6px 20px",
            "&:hover": {
              background: "rgba(108, 99, 255, 0.5)",
            },
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default CommonBulkUpload;
