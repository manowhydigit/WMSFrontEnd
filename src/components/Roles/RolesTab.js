import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const RolesTab = ({ rolesData, handleRolesChange }) => {
  const [resData, setResData] = useState([]);

  useEffect(() => {
    getResponsibility();
  }, []);

  const getResponsibility = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/allActiveResponsibility`
      );

      if (response.status === 200) {
        // Extract only the responsibility values and set them in resData
        const responsibilities =
          response.data.paramObjectsMap.resposResponsibilityVO.map(
            (screen) => screen.responsibility
          );
        setResData(responsibilities); // Setting responsibility values in the state
      } else {
        console.error("Failed to fetch responsibilities");
      }
    } catch (error) {
      console.error("Error fetching responsibilities:", error);
      alert("Error occurred while fetching responsibilities.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="Role"
          name="role"
          value={rolesData.role}
          onChange={handleRolesChange}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="responsibility-select-label">
            Responsibility
          </InputLabel>
          <Select
            labelId="responsibility-select-label"
            name="responsibility"
            value={rolesData.responsibility || []} // Ensure it's an array
            onChange={handleRolesChange}
            multiple // Enables multi-select
            renderValue={(selected) => selected.join(", ")} // Displays selected values as a comma-separated string
          >
            {/* Dynamically map responsibilities */}
            {resData.map((responsibility, index) => (
              <MenuItem key={index} value={responsibility}>
                <Checkbox
                  checked={rolesData.responsibility?.includes(responsibility)} // Check if selected
                />
                <ListItemText primary={responsibility} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <Checkbox
              name="active"
              checked={rolesData.active || false} // Default to false if undefined
              onChange={(e) =>
                handleRolesChange({
                  target: { name: e.target.name, value: e.target.checked },
                })
              }
            />
          }
          label="Active"
        />
      </Grid>
    </Grid>
  );
};

export default RolesTab;
