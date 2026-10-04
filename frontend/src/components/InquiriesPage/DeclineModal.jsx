import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Title from '../SupportComponents/Title';
import SnackbarMessage from '../SupportComponents/SnackbarMessage';
import { fetchLogIn } from "../AuthContext";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  height: '80%',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const ModalBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow: auto;
`;

function DeclineRequestModal({ inquiry, open, handleClose, handleSnackbar }) {
  const [declineReason, setDeclineReason] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDeclineClick = async () => {
    try {
      const response = await fetchLogIn();
      const receiverDecline = !(response.data.logIn.isServiceProvider);
      await axios.put('/serviceRequests/cancel', { serviceRequestId: inquiry._id, declineReason, receiverDecline });
      handleSnackbar('Request declined successfully', 'success');
      handleClose();
    } catch (error) {
      handleSnackbar('Error declining request', 'error');
    }
  };

  useEffect(() => {
    if (!open) {
      setDeclineReason('');
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="decline-modal-title"
        aria-describedby="decline-modal-description"
      >
        <Box sx={style}>
          <Box position="absolute" top={8} right={8}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <ModalBox>
            <Box display="flex" justifyContent="center" mb={2}>
              <Title text={'Decline Request'} />
            </Box>
            <Box>
              <Typography id="decline-modal-title" variant="h6" component="h2">
                Reason for Decline
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Please provide a short explanation why you are declining this request.
              </Typography>
            </Box>
            <TextField
              label="Decline Reason"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" color="primary" onClick={handleDeclineClick}>
                Decline
              </Button>
            </Box>
          </ModalBox>
        </Box>
      </Modal>
      <SnackbarMessage
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </>
  );
}

export default DeclineRequestModal;
