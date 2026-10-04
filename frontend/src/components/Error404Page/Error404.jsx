import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Title from '../SupportComponents/Title';

// Component to display if an url path is entered which is not defined in App.js
const Error404 = () => {
  const navigate = useNavigate();

  // Function to navigate back to the previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Title
          text={'404 Error'}
          textAlign={'center'}
        />
        <Typography variant="body1" color="textSecondary" my={2}>
          Page Not Found
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGoBack}>
          Go Back
        </Button>
      </Box>
    </Container>
  );
}

export default Error404;
