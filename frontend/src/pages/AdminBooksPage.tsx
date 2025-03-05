import React from 'react';
import { Box } from '@mui/material';
import BookList from '../components/books/BookList';
import PageTitle from '../components/common/PageTitle';

const AdminBooksPage: React.FC = () => {
  return (
    <Box>
      <PageTitle 
        title="Manage Books" 
        subtitle="Add, edit, or remove books from the library" 
      />
      <BookList admin={true} />
    </Box>
  );
};

export default AdminBooksPage;