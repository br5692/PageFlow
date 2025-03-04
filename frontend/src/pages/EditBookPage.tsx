import React from 'react';
import { Box } from '@mui/material';
import BookForm from '../components/books/BookForm';
import PageTitle from '../components/common/PageTitle';

const EditBookPage: React.FC = () => {
  return (
    <Box>
      <PageTitle 
        title="Edit Book" 
        subtitle="Update book information" 
      />
      <BookForm isEdit />
    </Box>
  );
};

export default EditBookPage;