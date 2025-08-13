import { Card, Result } from "antd";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action"); // 'approve' or 'reject'
  const actionId = searchParams.get("id");
  const actionEmail = searchParams.get("toEmail");
  const isApprove = action === "approve";

  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isSuccess, setIsSuccess] = useState(false); // Track success state
  const [errorMessage, setErrorMessage] = useState(""); // Track error message

  const handleApprove = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/InvoiceApproval/approval3?approval=${
          isApprove ? "1" : "0"
        }&createdby=${actionEmail}&id=${actionId}`
      );

      if (response.data.status === true) {
        setIsSuccess(isApprove); // Set success based on approval status
        setIsLoading(false); // Stop loading
        // Optionally play success sound
        // const audio = new Audio("/success.wav");
        // audio.play();
      } else {
        setAlreadyApproved(true); // Mark as already handled
        setErrorMessage(
          response.data.paramObjectsMap?.errorMessage ||
            response.data.message ||
            "This request has already been processed."
        );
        setIsLoading(false); // Stop loading
      }
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      setErrorMessage(
        error.response?.data?.paramObjectsMap?.errorMessage ||
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
      setIsLoading(false); // Stop loading
    }
  };


  const handleCelebrate = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Button animation
    const button = document.getElementById('celebrateBtn');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  }
  
  useEffect(() => {
    // Call the API when the page loads
    handleApprove();
  }, [actionId, isApprove]);

  if (isSuccess) {
    handleCelebrate();
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "95vh",
          background: "linear-gradient(135deg, #7b2ff7 0%, #f107a3 100%)",
        }}
      >
        <div>Redirecting...</div> {/* Loading message or spinner */}
      </div>
    );
  }

  

  

  
  
  

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "95vh",
        background: "#ffffff",
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          textAlign: "center",
          borderRadius: "15px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            maxHeight:550
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          
        >
          {/* Add icon logic here if needed */}
        </motion.div>
        {isSuccess ? (
          <Result
            status="success"
            title={
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ color: "green" }}
                
              >
                Approval Successful
              </motion.h4>
            }
            subTitle={
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Thank you for approving the request. Your response has been
                recorded.
              </motion.p>
            }
            extra={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              ></motion.div>
            }
          />
        ) : (
          <Result
            status="error"
            title={
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ color: "red" }}
              >
                {alreadyApproved ? errorMessage : "Rejection Confirmed"}
              </motion.h4>
            }
            subTitle={
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {alreadyApproved
                  ? "Can't be revert this request"
                  : "You have rejected the request. Your response has been recorded."}
              </motion.p>
            }
            extra={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              ></motion.div>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ConfirmationPage;
