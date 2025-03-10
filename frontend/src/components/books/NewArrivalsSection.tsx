// src/components/books/NewArrivalsSection.tsx
import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { bookService } from '../../services/bookService';
import { BookDto } from '../../types/book.types';
import BookCard from './BookCard';
import Loading from '../common/Loading';
import { bookCache } from '../../utils/bookCache';

const NewArrivalsSection: React.FC = () => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Try to get books from cache first
        const cachedBooks = bookCache.getNewArrivalsBooks();
        if (cachedBooks) {
          setBooks(cachedBooks);
          setLoading(false);
          return;
        }
        
        // If not in cache, fetch from API
        const response = await bookService.getAllBooks("id", false, 1, 8);
        const newestBooks = response.data || [];
        
        // Cache the books
        bookCache.setNewArrivalsBooks(newestBooks);
        
        setBooks(newestBooks);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [refreshTrigger]);

  // Subscribe to cache changes when component mounts
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('newArrivals')) {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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