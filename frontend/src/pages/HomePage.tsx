import React from 'react';
import { Box, Typography } from '@mui/material';
import DirectApiTest from '../components/common/DirectApiTest';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Library Management System
      </Typography>
      <Typography variant="body1">
        This is the home page. Content will be added later.
      </Typography>
      <DirectApiTest />
    </Box>
  );
};

export default HomePage;