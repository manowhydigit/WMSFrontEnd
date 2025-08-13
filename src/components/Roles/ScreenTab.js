import { Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import React from "react";

const ScreenTab = ({ screenData, handleScreenChange }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <TextField
          label="Screen Code"
          name="screenCode"
          value={screenData.screenCode}
          onChange={handleScreenChange}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Screen Name"
          name="screenName"
          value={screenData.screenName}
          onChange={handleScreenChange}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <Checkbox
              name="active"
              checked={screenData.active}
              onChange={(e) =>
                handleScreenChange({
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

export default ScreenTab;
