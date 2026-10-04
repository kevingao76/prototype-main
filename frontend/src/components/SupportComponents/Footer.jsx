import React from 'react';
import { Box, Stack, styled, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import Craftify_Logo from '../../assets/Craftify_Logo.jpg';

const StackColumn = styled(Stack)(() => ({
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flex: 1,
  gap: 8,
  textAlign: 'center',
}));

const BoxRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: '#FF743A',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: 30,
  },
}));

function Footer() {
  return (
    <BoxRow
      component="footer"
      sx={{
        py: 1,
        px: 2,
        mt: 'auto',
        width: '100%',
      }}
    >
      <StackColumn>
        <Box component="img" src={Craftify_Logo} alt="Logo" sx={{ height: 60, width: 60 }} />
        <Stack
          direction="row"
          width="70px"
          maxWidth="100%"
          justifyContent="space-between"
        >
          <Link
            href="https://www.instagram.com"
            variant="body2"
            sx={{
              color: '#414141',
              '&:hover': {
                color: '#1c2859',
              },
            }}
          >
            <InstagramIcon />
          </Link>
          <Link
            href="https://www.facebook.com"
            variant="body2"
            sx={{
              color: '#414141',
              '&:hover': {
                color: '#1c2859',
              },
            }}
          >
            <FacebookIcon />
          </Link>
        </Stack>
        <Stack alignItems="center" direction="row" gap={2}>
          <Typography variant="caption" component="p">
            &copy; 2024 Craftify Inc.
          </Typography>
          <Link
            href="/Imprint"
            variant="caption"
            sx={{
              color: 'black',
              '&:hover': {
                color: '#1c2859',
              },
            }}
          >
            Imprint
          </Link>
        </Stack>
      </StackColumn>
    </BoxRow>
  );
}

export default Footer;
