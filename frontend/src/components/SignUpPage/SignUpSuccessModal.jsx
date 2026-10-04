import React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccessModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleCloseModal = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Registration Successful
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Please check your email to verify your account.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleCloseModal}
        >
          Go to Login
        </Button>
      </Box>
    </Modal>
  );
};

export default RegistrationSuccessModal;
