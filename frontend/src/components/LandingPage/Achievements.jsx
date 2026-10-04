import React, { useState } from "react";
import { Box, Container, Grid, Typography } from '@mui/material'
import Title from '../SupportComponents/Title';

// Component for the "Achievements" Section of the landing page

function Achievements() {
    // Declaring state variable using the useState hook
    const [counterOn, setCounterOn] = useState(false);

    // Returning JSX structure of component
    return (
        <Box sx={{ backgroundColor: 'white' }}>
            <Container maxWidth={false} sx={{ py: 4 }}>
                <Box textAlign="center" my={2}>
                    <Title
                        text={'Our Achievements'}
                        textAlign={'center'}
                    />
                    <Typography variant="body1" color="textSecondary" my={2}>
                        With you as users we have already been able to celebrate great successes in our short existence!
                    </Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center" my={2}>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Box textAlign="center">
                            <Typography variant="h2" sx={{ color: 'primary.main' }}>
                                5000+
                            </Typography>
                            <Typography variant="h6">Users</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Box textAlign="center">
                            <Typography variant="h2" sx={{ color: 'primary.main' }}>
                                3000+
                            </Typography>
                            <Typography variant="h6">Craftsmen</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Box textAlign="center">
                            <Typography variant="h2" sx={{ color: 'primary.main' }}>
                                2500+
                            </Typography>
                            <Typography variant="h6">Commissions</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Box textAlign="center">
                            <Typography variant="h2" sx={{ color: 'primary.main' }}>
                                25+
                            </Typography>
                            <Typography variant="h6">Services</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    )
}

export default Achievements
