import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Box, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Title from '../SupportComponents/Title';
import faqData from './FAQData.json';

// Component for the "FAQ" Section of the landing page
// Content is feteched from a JSON file to allow dynamic changes

const FAQ = () => {
  // Declaring state variable using the useState hook
  const [expanded, setExpanded] = React.useState(false);

  // Function to handle the trigger of the expand icon to display answer to question
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Returning JSX structure of component
  return (
    <Container id='faq' maxWidth={false} sx={{ backgroundColor: '#f6f6f6', py: 4 }}>
      <Box textAlign="center" my={2}>
        <Title text={'FAQ'} textAlign={'center'} />
        <Typography variant="body1" color="textSecondary" my={2}>
          Want to offer your Craftsman Skills?
        </Typography>
      </Box>
      <Container>
        {faqData.faqProvider.map((item, index) => (
          <Box key={index}>
            <Divider />
            <Accordion sx={{ backgroundColor: '#f6f6f6' }} elevation={0} disableGutters expanded={expanded === item.id} onChange={handleChange(item.id)}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography sx={{ fontWeight: 'bold' }}>
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        ))}
      </Container>
      <Box textAlign="center" my={2}>
        <Typography variant="body1" color="textSecondary" my={2}>
          Looking for a Craftsman?
        </Typography>
      </Box>
      <Container>
        {faqData.faqReceiver.map((item, index) => (
          <Box key={index}>
            <Divider />
            <Accordion sx={{ backgroundColor: '#f6f6f6' }} elevation={0} disableGutters expanded={expanded === item.id} onChange={handleChange(item.id)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`panel${index}-header`}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        ))}
      </Container>
    </Container>
  );
};

export default FAQ;
