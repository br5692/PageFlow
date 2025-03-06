import React from 'react';
import { Box } from '@mui/material';
import CheckoutList from '../components/checkouts/CheckoutList';
import PageTitle from '../components/common/PageTitle';
import { useAuth } from '../context/AuthContext';

const CheckoutsPage: React.FC = () => {
  const { isLibrarian } = useAuth();

  // For librarians, show a list of all checkouts
  if (isLibrarian) {
    return (
      <Box>
        <PageTitle 
          title="Library Checkouts" 
          subtitle="View and manage book checkouts"
        />
        <CheckoutList admin={true} />
      </Box>
    );
  }

  // For customers, show their personal checkouts
  return (
    <Box>
      <PageTitle 
        title="My Checkouts" 
        subtitle="Track your borrowed books and due dates" 
      />
      <CheckoutList />
    </Box>
  );
};

export default CheckoutsPage;