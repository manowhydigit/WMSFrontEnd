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
import axios from "axios"; // Make sure axios is imported
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const ResponsibilitiesTab = ({
  responsibilitiesData,
  handleResponsibilitiesChange,
}) => {
  const [screenData, setScreenData] = useState([]);

  useEffect(() => {
    getScreenNames();
  }, []);

  const getScreenNames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/getAllScreenNames`);

      if (response.status === 200) {
        // Extract only the screenName values and set them in screenData
        const screenNames = response.data.paramObjectsMap.screenNamesVO.map(
          (screen) => screen.screenName
        );
        setScreenData(screenNames); // Setting only screenName values in the state
      } else {
        console.error("Failed to fetch screen names");
      }
    } catch (error) {
      console.error("Error fetching screen names:", error);
      alert("Error occurred while fetching screen names.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="Responsibility"
          name="responsibility"
          value={responsibilitiesData.responsibility}
          onChange={handleResponsibilitiesChange}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="screen-select-label">Screen</InputLabel>
          <Select
            labelId="screen-select-label" // Associates the label with the Select
            name="screenName"
            value={responsibilitiesData.screenName || []} // Ensure this is an array
            onChange={handleResponsibilitiesChange}
            multiple // Enables multi-select
            renderValue={(selected) => selected.join(", ")} // Displays selected values as a comma-separated string
          >
            {/* Map the screenData to MenuItems */}
            {screenData.map((screenName) => (
              <MenuItem key={screenName} value={screenName}>
                <Checkbox
                  checked={responsibilitiesData.screenName?.includes(
                    screenName
                  )} // Check if screen is selected
                />
                <ListItemText primary={screenName} />
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
              checked={responsibilitiesData.active} // Ensure this is a boolean
              onChange={(e) =>
                handleResponsibilitiesChange({
                  target: { name: e.target.name, value: e.target.checked },
                })
              }
              size="small"
            />
          }
          label="Active"
        />
      </Grid>
    </Grid>
  );
};

export default ResponsibilitiesTab;
