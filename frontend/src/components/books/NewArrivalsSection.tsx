import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { bookService } from '../../services/bookService';
import { BookDto } from '../../types/book.types';
import BookCard from './BookCard';
import Loading from '../common/Loading';

const NewArrivalsSection: React.FC = () => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedBooks, setDisplayedBooks] = useState<BookDto[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Fetch more books than we need to account for filtering (sort by ID descending to get newest first)
        const response = await bookService.getAllBooks("id", false, 1, 50);
        setBooks(response.data || []);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Process books to get the most recent ones
  useEffect(() => {
    if (books.length > 0) {
      // Take the 8 newest books, regardless of cover image
      // (BookCard will handle fallback images)
      const newestBooks = books.slice(0, 8);
      setDisplayedBooks(newestBooks);
    }
  }, [books]);

  if (loading) {
    return <Loading />;
  }

  if (displayedBooks.length === 0) {
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
      {displayedBooks.map((book, index) => (
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