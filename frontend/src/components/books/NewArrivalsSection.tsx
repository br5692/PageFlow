import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { bookService } from '../../services/bookService';
import { BookDto } from '../../types/book.types';
import BookCard from './BookCard';
import Loading from '../common/Loading';
import { bookCache } from '../../utils/bookCache';

// Define a constant for the expected number of books
const EXPECTED_BOOK_COUNT = 8;

const NewArrivalsSection: React.FC = () => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Try to get books from cache first
        const cachedBooks = bookCache.getNewArrivalsBooks();
        if (cachedBooks) {
          setBooks(cachedBooks);
          
          // Check if we need to fetch additional books
          if (cachedBooks.length < EXPECTED_BOOK_COUNT) {
            const missingCount = EXPECTED_BOOK_COUNT - cachedBooks.length;
            const response = await bookService.getAllBooks("id", false, 1, missingCount);
            const newBooks = response.data || [];
            
            // Append new books to the cache
            const updatedBooks = [...cachedBooks, ...newBooks];
            bookCache.setNewArrivalsBooks(updatedBooks);
            
            setBooks(updatedBooks);
          }
        } else {
          // If cache is empty, fetch all books from API
          const response = await bookService.getAllBooks("id", false, 1, EXPECTED_BOOK_COUNT);
          const newestBooks = response.data || [];
          
          // Cache the books
          bookCache.setNewArrivalsBooks(newestBooks);
          
          setBooks(newestBooks);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (books.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No new books available at this time.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {books.map((book, index) => (
        <Grid 
          item 
          key={book.id} 
          xs={12} 
          sm={6} 
          md={3} 
          lg={3}
          sx={{ transition: 'all 0.3s ease' }}
        >
          <BookCard book={book} index={index} />
        </Grid>
      ))}
    </Grid>
  );
};

export default NewArrivalsSection;