import React from 'react';
import { Box } from '@mui/material';
import CheckoutList from '../components/checkouts/CheckoutList';
import PageTitle from '../components/common/PageTitle';

const AdminCheckoutsPage: React.FC = () => {
  return (
    <Box>
      <PageTitle 
        title="Manage Library Checkouts" 
        subtitle="View active checkouts and process book returns"
      />
      
      <CheckoutList admin={true} />
    </Box>
  );
};

export default AdminCheckoutsPage;