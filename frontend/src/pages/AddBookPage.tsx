import React from 'react';
import { Box } from '@mui/material';
import BookForm from '../components/books/BookForm';
import PageTitle from '../components/common/PageTitle';

const AddBookPage: React.FC = () => {
  return (
    <Box>
      <PageTitle 
        title="Add New Book" 
        subtitle="Add a new book to the library collection" 
      />
      <BookForm />
    </Box>
  );
};

export default AddBookPage;