import React, {useState} from 'react';
import {Box, Typography, Button, Modal, TextField} from '@mui/material';
import styled from '@emotion/styled';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const StarRating = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const Star = styled(StarIcon)`
  cursor: pointer;
  color: ${props => (props.filled ? '#FF6F00' : '#d3d3d3')};
`;

const ReviewModal = ({open, handleClose, handleError, inquiry}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        console.log(inquiry._id);
        try {
            const bookingsResponse = await axios.get(`/serviceBookings/getBookingsByRequests/${[inquiry._id]}`);
            const selectedBooking = bookingsResponse.data[0];

            if (selectedBooking.hasOwnProperty('analytics')) {
                handleError("Analytic already exists for this service booking.", 'error');
                return;
            }

            const token = localStorage.getItem('logInInfo');
            if (!token) {
                console.log('No token found');
                return;
            }

            if (selectedBooking) {
                const response = await axios.post('/analytics/create', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    serviceBookingId: selectedBooking._id,
                    rating: {
                        value: rating,
                        content: comment
                    }
                });
                if (response.status === 201) {
                    console.log('Rating submitted successfully');
                    handleClose();
                } else {
                    handleError(response.data.message,'error');
                }  
            } else {
                handleError('No matching booking found for the selected inquiry','error');  
            }
        } catch (error) {
            handleError('Unknown error when submitting rating','error');
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography variant="h6" mb={2}>Leave a Rating</Typography>
                <StarRating>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            filled={star <= rating}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </StarRating>
                <TextField
                    label="Comment"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    variant="outlined"
                    fullWidth
                    sx={{mb: 2}}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
            </Box>
        </Modal>
    );
};

export default ReviewModal;