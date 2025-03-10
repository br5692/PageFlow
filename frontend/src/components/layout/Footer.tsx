import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Summit Library
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link color="inherit" href="/">
            Home
          </Link>{' | '}
          <Link color="inherit" href="/books">
            Books
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;