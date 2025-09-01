import React, { useState } from "react";
import { Button } from "@mui/material";
import BinWiseData from "./BinWiseData";

// This is a wrapper component to open the BinWiseData dialog
const Dashboard1 = ({ userName = "User", open, onClose }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div>
        {" "}
        <p>Hi welcome</p>
        <Button onClick={() => setIsDialogOpen(true)}>View Bin Details</Button>
        <BinWiseData
          open={isDialogOpen || open}
          onClose={() => {
            setIsDialogOpen(false);
            if (onClose) onClose();
          }}
        />
      </div>
    </>
  );
};

export default Dashboard1;
