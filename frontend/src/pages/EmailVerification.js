import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import Navbar from "../components/SupportComponents/Navbar";
import Footer from "../components/SupportComponents/Footer";

const EmailVerification = () => {
    const location = useLocation();
    const [message, setMessage] = useState('Verifying your email...');
    const [isVerified, setIsVerified] = useState(null);

    useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        console.log("token ", token);

        const abortController = new AbortController();

        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`, {
                    signal: abortController.signal
                });
                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message);
                    setIsVerified(true);
                } else {
                    setMessage(data.message);
                    setIsVerified(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setMessage('An error occurred during verification. Please try again later.');
                    setIsVerified(false);
                }
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setMessage('Invalid verification link.');
            setIsVerified(false);
        }

        return () => {
            abortController.abort();
        };
    }, [location.search]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar userType="receiver" />
            <Container maxWidth="sm" style={{ marginTop: '100px', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {isVerified ? 'Success' : 'Error'}
                    </Typography>
                    <Typography variant="body1">
                        {message}
                    </Typography>
                </Box>
            </Container>
            <Footer />
        </Box>
    );
};

export default EmailVerification;
