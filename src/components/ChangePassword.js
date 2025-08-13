import { Alert, Button, Card, Input, Space, Typography, notification } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { encryptPassword } from "../utils/passEnc";
import "./style.css";
import "./logintest1.css";

const { Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const ChangePassword = () => {
  const [currentPasscode, setCurrentPasscode] = useState(["", "", "", "", "", ""]);
  const [newPasscode, setNewPasscode] = useState(["", "", "", "", "", ""]);
  const [confirmPasscode, setConfirmPasscode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (value, index, type) => {
    const updatedPasscode = type === "current"
      ? [...currentPasscode]
      : type === "new"
      ? [...newPasscode]
      : [...confirmPasscode];

    if (/^\d*$/.test(value)) {
      updatedPasscode[index] = value;
      type === "current"
        ? setCurrentPasscode(updatedPasscode)
        : type === "new"
        ? setNewPasscode(updatedPasscode)
        : setConfirmPasscode(updatedPasscode);

      if (value && index < 5) {
        document.getElementById(`${type}-otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index, type) => {
    if (e.key === "Backspace") {
      const updatedPasscode = type === "current"
        ? [...currentPasscode]
        : type === "new"
        ? [...newPasscode]
        : [...confirmPasscode];

      if (updatedPasscode[index]) {
        updatedPasscode[index] = "";
        type === "current"
          ? setCurrentPasscode(updatedPasscode)
          : type === "new"
          ? setNewPasscode(updatedPasscode)
          : setConfirmPasscode(updatedPasscode);
      } else if (index > 0) {
        updatedPasscode[index - 1] = "";
        type === "current"
          ? setCurrentPasscode(updatedPasscode)
          : type === "new"
          ? setNewPasscode(updatedPasscode)
          : setConfirmPasscode(updatedPasscode);
        document.getElementById(`${type}-otp-${index - 1}`).focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (currentPasscode.join("").length !== 6) {
      setError("Current passcode must be exactly 6 digits");
      return;
    }

    if (newPasscode.join("").length !== 6) {
      setError("New passcode must be exactly 6 digits");
      return;
    }

    if (newPasscode.join("") !== confirmPasscode.join("")) {
      setError("New passcodes do not match");
      return;
    }

    // setLoading(true);
    // try {
    //   const response = await axios.post(`${API_URL}/api/auth/change-passcode`, {
    //     currentPassword: encryptPassword(currentPasscode.join("")),
    //     newPassword: encryptPassword(newPasscode.join("")),
    //   });

    //   if (response.data.status === true) {
    //     notification.success({
    //       message: "Success",
    //       description: "Passcode changed successfully!",
    //       duration: 2, // Display toast for 2 seconds
    //     });
    //     setTimeout(() => navigate("/listingPage"), 2000); // Redirect to ListingPage
    //   } else {
    //     setError("Passcode change failed. Please try again.");
    //   }
    // } catch (error) {
    //   const errorMessage =
    //     error.response?.data?.paramObjectsMap?.errorMessage ||
    //     error.response?.data?.message ||
    //     "An unexpected error occurred.";
    //   setError(errorMessage);
    // } finally {
    //   setLoading(false);
    // }

    navigate('/listing');
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "95vh",
        background: "#fff",
      }}
    >
      {error && (
        <div
          style={{
            position: "absolute",
            top: 30,
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <Alert message={error} type="error" showIcon />
        </div>
      )}

      <Card
        title={
          <Text
            strong
            style={{
              fontSize: 20,
              textAlign: "center",
              color: "#000",
            }}
          >
            Change Passcode
          </Text>
        }
        style={{
          borderRadius: 12,
          padding: "25px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
        <Text>Enter Current Passcode</Text>
          <Space size="middle" style={{ justifyContent: "center" }}>
            {currentPasscode.map((digit, index) => (
              <Input
                key={index}
                id={`current-otp-${index}`}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index, "current")}
                onKeyDown={(e) => handleKeyDown(e, index, "current")}
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center",
                  fontSize: "16px",
                  borderRadius: "8px",
                //   ...inputStyle,
                }}
              />
            ))}
          </Space>
          <Text>Enter New Passcode</Text>
          <Space size="middle" style={{ justifyContent: "center" }}>
            {newPasscode.map((digit, index) => (
              <Input
                key={index}
                id={`new-otp-${index}`}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index, "new")}
                onKeyDown={(e) => handleKeyDown(e, index, "new")}
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center",
                  fontSize: "16px",
                  borderRadius: "8px",
                }}
              />
            ))}
          </Space>

          <Text>Confirm New Passcode</Text>
          <Space size="middle" style={{ justifyContent: "center" }}>
            {confirmPasscode.map((digit, index) => (
              <Input
                key={index}
                id={`confirm-otp-${index}`}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index, "confirm")}
                onKeyDown={(e) => handleKeyDown(e, index, "confirm")}
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center",
                  fontSize: "16px",
                  borderRadius: "8px",
                }}
              />
            ))}
          </Space>

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
            style={{
              marginTop: "20px",
              borderRadius: "8px",
            }}
          >
            Change Passcode
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ChangePassword;
