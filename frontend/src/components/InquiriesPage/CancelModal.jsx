import React from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const confirmModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CancelModal = ({ open, handleClose, handleConfirm }) => (
  <Modal open={open} onClose={handleClose}>
    <Box sx={confirmModalStyle}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Cancel Work
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography variant="body1" gutterBottom>
        Are you sure you want to cancel the work?
      </Typography>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Box>
    </Box>
  </Modal>
);

export default CancelModal;
