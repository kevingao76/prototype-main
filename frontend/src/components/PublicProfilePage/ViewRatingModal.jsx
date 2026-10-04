import React from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  Rating,
} from '@mui/material';

const RatingModal = ({ open, onClose, ratings }) => (
  console.log('ratings in modal', ratings),
  <Modal
    open={open}
    onClose={onClose}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: 600,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        overflowY: 'auto',  // Ensure content is scrollable
      }}
    >
      <Typography variant="h6" component="h2">
        Ratings
      </Typography>
      <Box sx={{ mt: 2 }}>
        {ratings.map((rating, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Rating value={rating.value} readOnly precision={0.1} />
            <Typography variant="body2">{rating.content}</Typography>
          </Box>
        ))}
      </Box>
      <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
        Close
      </Button>
    </Box>
  </Modal>
);

export default RatingModal;