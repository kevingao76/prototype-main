import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Title from '../SupportComponents/Title';
import { Box } from '@mui/material';
import blogPosts from './BlogData.json';

// Simple blog page, using Acccordions to display different blog posts, fetching data from a JSON file

export default function Blog({ userType }) {
  const data = userType === 'provider' ? blogPosts.providers : blogPosts.receivers;
  const [expandedPanels, setExpandedPanels] = useState(data.map((_, index) => index === 0));

  const handleChange = (index) => (event, isExpanded) => {
    setExpandedPanels((prev) => {
      const newExpandedPanels = [...prev];
      newExpandedPanels[index] = isExpanded;
      return newExpandedPanels;
    });
  };

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5 }}>
      <Box textAlign="center" mb={3}>
        <Title text={'Leverage Craftify'} textAlign={'center'} />
        <Typography variant="body1" color="textSecondary" my={2}>
          Find out how you can use Craftify to leverage your business
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {data.map((post, index) => (
          <Grid item xs={12} key={post.title}>
            <Accordion expanded={expandedPanels[index]} onChange={handleChange(index)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`By ${post.author} on ${post.date}`}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ whiteSpace: 'pre-line' }}>{post.blogText}</Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
