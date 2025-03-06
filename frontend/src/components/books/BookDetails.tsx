import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Rating,
  Button,
  Chip,
  Divider,
  Paper,
  Alert,
  Skeleton,
  Stack,
  Card,
} from '@mui/material';
import {
  MenuBook,
  CalendarToday,
  LocalLibrary,
  Edit,
  Delete,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { BookDto } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import { checkoutService } from '../../services/checkoutService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { formatDate } from '../../utils/dateUtils';
import ReviewList from '../reviews/ReviewList';
import ReviewForm from '../reviews/ReviewForm';
import { getFallbackImageForBook, isFallbackImage } from '../../utils/imageUtils'

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLibrarian, isCustomer } = useAuth();
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError("Book ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const bookId = parseInt(id);
        const fetchedBook = await bookService.getBookById(bookId);
        setBook(fetchedBook);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching book details:", error);
        setError(error.response?.data?.message || "Failed to load book details");
        showAlert('error', 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, showAlert]);

  const handleCheckout = async () => {
    if (!book) return;
    
    try {
      setCheckingOut(true);
      await checkoutService.checkoutBook(book.id);
      showAlert('success', 'Book checked out successfully');
      
      // Update book to show it's no longer available
      setBook({ ...book, isAvailable: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to check out book';
      showAlert('error', errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleEditBook = () => {
    if (book) {
      navigate(`/admin/books/edit/${book.id}`);
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    
    // Confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await bookService.deleteBook(book.id);
        showAlert('success', 'Book deleted successfully');
        navigate('/books');
      } catch (error: any) {
        showAlert('error', error.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Skeleton variant="rectangular" height={450} width="100%" />
          </Grid>
          <Grid item xs={12} md={9}>
            <Skeleton variant="text" height={60} width="80%" />
            <Skeleton variant="text" height={30} width="50%" />
            <Skeleton variant="text" height={30} width="30%" />
            <Box sx={{ mt: 3 }}>
              <Skeleton variant="text" height={20} width="100%" />
              <Skeleton variant="text" height={20} width="100%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="95%" />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/books')}>
            Browse Books
          </Button>
        </Box>
      </Alert>
    );
  }

  if (!book) {
    return (
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h5">Book not found</Typography>
        <Button variant="contained" onClick={() => navigate('/books')} sx={{ mt: 2 }}>
          Browse Books
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/books')} 
        sx={{ mb: 2 }}
      >
        Back to Books
      </Button>

      {/* Main content */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Book Cover */}
          <Grid item xs={12} md={3}>
          <Box
            component="img"
            src={book.coverImage || getFallbackImageForBook(book)}
            alt={book.title}
            onError={(e) => {
                const currentSrc = e.currentTarget.src;
                if (!isFallbackImage(currentSrc)) {
                e.currentTarget.src = getFallbackImageForBook(book);
                }
            }}
            sx={{
                width: '100%',
                maxHeight: 450,
                objectFit: 'contain',
                borderRadius: 1,
                boxShadow: 3,
            }}
            />
          </Grid>

          {/* Book Details */}
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              {/* Book header - combines important info in a prominent way */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    {book.title}
                  </Typography>
                  <Chip
                    label={book.isAvailable ? 'Available' : 'Checked Out'}
                    color={book.isAvailable ? 'success' : 'error'}
                    size="medium"
                    sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                  />
                </Box>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  by {book.author}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={book.averageRating} precision={0.5} readOnly />
                  <Typography variant="body1" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {book.averageRating.toFixed(1)} out of 5
                  </Typography>
                </Box>
              </Box>

              {/* Key book metadata in a card format */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        Published in {new Date(book.publishedDate).getFullYear()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MenuBook fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {book.pageCount} pages
                      </Typography>
                    </Box>
                  </Grid>
                  {book.category && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalLibrary fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {book.category}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Publisher and ISBN in a more human-readable format */}
                <Box sx={{ mt: 2 }}>
                  {book.publisher && (
                    <Typography variant="body2" color="text.secondary">
                      Published by {book.publisher}
                      {book.isbn ? ` • ISBN: ${book.isbn}` : ''}
                    </Typography>
                  )}
                </Box>
              </Card>

              {/* Description */}
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  About this book
                </Typography>
                <Typography variant="body1" paragraph>
                  {book.description || 'No description available.'}
                </Typography>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {isAuthenticated && isCustomer && book.isAvailable && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    size="large"
                    sx={{ 
                      minWidth: 200,
                      fontWeight: 'bold',
                      py: 1
                    }}
                  >
                    {checkingOut ? 'Checking out...' : 'Check Out Book'}
                  </Button>
                )}

                {isAuthenticated && isLibrarian && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Edit />}
                      onClick={handleEditBook}
                    >
                      Edit Book
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteBook}
                    >
                      Delete Book
                    </Button>
                  </Box>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews Section */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Customer Reviews
        </Typography>

        {isAuthenticated && isCustomer && (
          <Box sx={{ mb: 4 }}>
            <ReviewForm bookId={book.id} />
          </Box>
        )}

        <ReviewList bookId={book.id} />
      </Paper>
    </Box>
  );
};

export default BookDetails;