import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';
import Title from './Title'

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
  content: {
    backgroundColor: '#fff',
    padding: theme.spacing(4),
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionHeader: {
    marginBottom: theme.spacing(2),
  },
}));

function Imprint() {
  const classes = useStyles();

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6' }}>
      <Box textAlign="center" sx={{ py: 4 }}>
        <Title
          text={'Imprint'}
          textAlign={'center'}
        />
        <Container>
          <Box className={classes.content}>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="h6" className={classes.sectionHeader}>
                Company Information
              </Typography>
              <Typography variant="body1">
                Craftify Inc.<br />
                Boltzmannstra0e 15<br />
                85748 München<br />
                Germany<br />
              </Typography>
            </Box>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="h6" className={classes.sectionHeader}>
                Contact Information
              </Typography>
              <Typography variant="body1">
                Phone: +1 234 567 890<br />
                Email: info@craftify.com<br />
                Website: www.craftify.com<br />
              </Typography>
            </Box>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="h6" className={classes.sectionHeader}>
                Legal Representatives
              </Typography>
              <Typography variant="body1">
                Leon Wilhelm Weniger, Co-CEO<br />
                Tom Konstantin Ege, Co-CEO<br />
                Felix Luca Mengele, Co-CEO<br />
                Kevin Kaiwen Gao, Co-CEO
              </Typography>
            </Box>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="h6" className={classes.sectionHeader}>
                Register Entry
              </Typography>
              <Typography variant="body1">
                Registered in: München<br />
                Registration Number: 85748<br />
              </Typography>
            </Box>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="h6" className={classes.sectionHeader}>
                VAT ID
              </Typography>
              <Typography variant="body1">
                VAT Identification Number: CR123456789<br />
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box textAlign="center">
        <Title
          text={'Copyright Disclaimer'}
          textAlign={'center'}
        />
        <Container>
          <Box className={classes.content}>
            <Box sx={{ py: 2 }} className={classes.section}>
              <Typography variant="body1">
                © 2024 Craftify Inc. All rights reserved. All content on this website, including text, images, graphics,
                and code, is the property of Craftify Inc. and is protected by international copyright laws.
                Unauthorized use or reproduction of any content is strictly prohibited.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Container>
  );
}

export default Imprint;
