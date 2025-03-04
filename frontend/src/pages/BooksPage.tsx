import React from 'react';
import { Box } from '@mui/material';
import BookList from '../components/books/BookList';
import PageTitle from '../components/common/PageTitle';

const BooksPage: React.FC = () => {
  return (
    <Box>
      <PageTitle 
        title="Book Catalog" 
        subtitle="Browse our collection of books" 
      />
      <BookList />
    </Box>
  );
};

export default BooksPage;