import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Box, Typography } from '@mui/material';
import Title from '../SupportComponents/Title'
import ReactCardFlip from 'react-card-flip';
import ServiceCardFront from '../SupportComponents/ServiceCardFront';
import ServiceCardBack from '../SupportComponents/ServiceCardBack';

function Services() {
    // Declaring state variable using the useState hook
    const [serviceTypes, setServiceTypes] = useState([]);
    const [flippedCards, setFlippedCards] = useState(Array(Object.keys(serviceTypes).length).fill(false));

    // Function to handle card flip action
    const flipCard = (index) => {
        const newFlippedCards = Array(Object.keys(serviceTypes).length).fill(false);
        newFlippedCards[index] = !flippedCards[index];
        setFlippedCards(newFlippedCards);
    }

    // useEffect hook to fetch service types from the API when the component mounts
    useEffect(() => {
        const fetchTypesAndSubTypes = async () => {
            try {
                const response = await axios.get('/serviceTypes/getAll');
                const serviceTypes = response.data;
                setServiceTypes(serviceTypes);
                console.log("Service types set successfully")
            } catch (error) {
                console.error('Error fetching inquiries:', error);
            }
        };
        fetchTypesAndSubTypes();
    }, []);

    // Returning JSX structure of component
    return (
        <Container id='services' maxWidth={false} sx={{ backgroundColor: '#f6f6f6', py: 4 }}>
            <Box textAlign="center" my={2}>
                <Title text={'Discover Different Services'} textAlign={'center'} />
                <Typography variant="body1" color="textSecondary" my={2}>
                    Click on a Card to find out the different services you can browse and book on Craftify
                </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center" my={2}>
                {serviceTypes.map((service, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.5} key={index}>
                        <ReactCardFlip
                            isFlipped={flippedCards[index]}
                            flipDirection="vertical"
                        >
                            <Box onClick={() => flipCard(index, service)}>
                                <ServiceCardFront
                                    image={service.image}
                                    title={service.title}
                                    description={service.description}
                                />
                            </Box>
                            <Box onClick={() => flipCard(index, service)}>
                                <ServiceCardBack
                                    title={service.title}
                                    subServices={service.subServices}
                                />
                            </Box>
                        </ReactCardFlip>
                    </Grid>
                ))}
            </Grid>
        </Container >
    );
}

export default Services;
