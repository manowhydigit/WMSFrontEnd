import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Input, Space } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { encryptPassword } from "./encPassword";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const ResetPasswordPopup = () => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName || "");
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (value, index) => {
    const newPasscode = [...passcode];
    if (/^\d*$/.test(value)) {
      newPasscode[index] = value;
      setPasscode(newPasscode);

      if (value && index < passcode.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleSave = () => {
    if (passcode.includes("") || passcode.some((digit) => digit === "")) {
      setError("Please fill all passcode fields.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      userName: userName,
      newPassword: encryptPassword(passcode.join("")),
      ppassword: passcode.join(""),
    };

    axios
      .post(`${API_URL}/api/auth/resetPassword`, payload)
      .then((response) => {
        console.log("Password reset successfully:", response.data);
        setLoading(false);
        handleClose();
        toast.success("Passcode changed successfully!"); // Show success toast
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to reset password. Please try again.");
        console.error("Error resetting password:", err);
      });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newPasscode = [...passcode];
      if (passcode[index]) {
        newPasscode[index] = "";
        setPasscode(newPasscode);
      } else if (index > 0) {
        newPasscode[index - 1] = "";
        setPasscode(newPasscode);
        const previousInput = document.getElementById(`otp-${index - 1}`);
        if (previousInput) {
          previousInput.focus();
        }
      }
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="5vh"
    >
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          // color: "#00FFFF",
          // backgroundColor: "#f44336",
          backgroundColor: "transparent",
          // "&:hover": { backgroundColor: "#f44336" },

          "&:hover": { boxShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF" },

          width: "bold",
        }}
      >
        Reset Password
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Typography variant="h5" align="center">
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="UserName" value={userName} readOnly />
          <Typography align="center" sx={{ margin: "20px 0" }}>
            Enter 6-Digit Passcode
          </Typography>
          <Space size="middle">
            {passcode.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                maxLength={1}
                value={digit}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleChange(e.target.value, index)}
                style={{
                  width: "40px",
                  textAlign: "center",
                  fontSize: "16px",
                }}
              />
            ))}
          </Space>
          {error && (
            <Typography color="error" align="center" sx={{ marginTop: "20px" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer /> {/* Add Toast Container */}
    </Box>
  );
};

export default ResetPasswordPopup;
