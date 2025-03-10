import React from 'react';
import { Typography, Divider, Box } from '@mui/material';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default PageTitle;