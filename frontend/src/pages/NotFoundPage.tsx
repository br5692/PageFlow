import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home Page
        </Button>
      </Box>
    </Paper>
  );
};

export default NotFoundPage;