import React from 'react';
import { Container, Grid, Typography, Avatar, Box } from '@mui/material';
import aboutUsData from './AboutUsData.json'
import Title from '../SupportComponents/Title';

// Component for the "About us" Section of the landing page
// Pictures and description are feteched from a JSON file to allow dynamic changes

const AboutUs = () => {
  // Returning JSX structure of component
  return (
    <Container id="about" maxWidth={false} sx={{ backgroundColor: '#f6f6f6', py: 4 }}>
      <Box textAlign="center" my={2}>
        <Title text={'About Us'} textAlign={'center'} />
        <Typography variant="body1" color="textSecondary" my={2}>
          Meet the team behind Craftify
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center" my={2}>
        {aboutUsData.teamMembers.map((member) => (
          <Grid item xs={12} sm={6} md={2.5} key={member.name}>
            <Box textAlign="center">
              <Avatar
                alt={member.name}
                src={member.image}
                sx={{ width: 150, height: 150, margin: '0 auto 20px' }}
              />
              <Typography variant="h6">
                {member.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {member.role}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutUs;
