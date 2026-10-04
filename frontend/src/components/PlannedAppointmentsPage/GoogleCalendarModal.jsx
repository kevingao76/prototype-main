import React from 'react';
import { Modal, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const GoogleCalendarModal = ({ open, onClose, googleCalendarId, onGoogleCalendarIdChange, onImportGoogleCalendar }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2" gutterBottom>
          Import your Google Calendar
        </Typography>
        <Typography variant="body2" gutterBottom>
          Attention: Please make sure your Calendar is public, else it cannot be synchronized.
        </Typography>
        <TextField
          label="Enter your Google Calendar ID"
          variant="outlined"
          fullWidth
          value={googleCalendarId}
          onChange={onGoogleCalendarIdChange}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={onImportGoogleCalendar} fullWidth>
          Import Google Calendar
        </Button>
      </Box>
    </Modal>
  );
};

export default GoogleCalendarModal;
