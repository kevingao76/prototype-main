import React from 'react';
import { Stack, Box, Typography, Grid, Avatar, Container } from '@mui/material';
import { styled } from '@mui/system';
import Title from '../SupportComponents/Title'
import testimonialsData from './TestimonialsData.json'

// Component for the "About us" Section of the landing page
// Pictures and content are feteched from a JSON file to allow dynamic changes


// Defining custom style of MUI elements
const useStyles = styled((theme) => ({
  root: {
    backgroundColor: '#f5f5f5',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  testimonial: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginBottom: theme.spacing(2),
  },
}));

function Testimonials() {
  const classes = useStyles();

  // Returning JSX structure of component
  return (
    <Container sx={{ backgroundColor: 'white', py: 4 }} maxWidth={false}>
      <Box className={classes.root}>
        <Container>
          <Box textAlign="center" my={2}>
            <Title text={'What Our Users Say'} textAlign={'center'}
            />
            <Typography variant="body1" color="textSecondary" my={2}>
              Find out what our users say about Craftify
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center" my={2}>
            {testimonialsData.testimonials.map((item, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Box className={classes.testimonial}>
                  <Stack alignItems="flex-start" direction="row" spacing={2}>
                    <Avatar src={item.image} className={classes.avatar} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        "{item.text}"
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        - {item.name}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Container>
  );
}

export default Testimonials;
