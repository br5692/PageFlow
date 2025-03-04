// src/components/books/BookDetails.tsx
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
} from '@mui/material';
import {
  CalendarToday,
  MenuBook,
  Category,
  Numbers,
  Store,
  Edit,
  Delete,
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
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={4}>
        {/* Book Cover */}
        <Grid item xs={12} md={3}>
          <Box
            component="img"
            src={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
            alt={book.title}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box sx={{ pr: 2, flex: '1 1 auto' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="h6" gutterBottom color="text.secondary">
                by {book.author}
              </Typography>
            </Box>
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Chip
                label={book.isAvailable ? 'Available' : 'Checked Out'}
                color={book.isAvailable ? 'success' : 'error'}
                sx={{ fontWeight: 'bold', mb: 1 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={book.averageRating} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({book.averageRating.toFixed(1)})
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Published:</strong> {formatDate(book.publishedDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Store fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Publisher:</strong> {book.publisher || 'Unknown'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBook fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>ISBN:</strong> {book.isbn || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Numbers fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Pages:</strong> {book.pageCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Category fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Category:</strong> {book.category || 'Uncategorized'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {book.description || 'No description available.'}
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {isAuthenticated && isCustomer && book.isAvailable && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                disabled={checkingOut}
                sx={{ minWidth: 150 }}
              >
                {checkingOut ? 'Checking out...' : 'Check Out Book'}
              </Button>
            )}

            {isAuthenticated && isLibrarian && (
              <>
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
              </>
            )}

            <Button
              variant="outlined"
              onClick={() => navigate('/books')}
            >
              Back to Books
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Reviews Section */}
      <Typography variant="h5" gutterBottom>
        Customer Reviews
      </Typography>

      {isAuthenticated && isCustomer && (
        <Box sx={{ mb: 4 }}>
          <ReviewForm bookId={book.id} />
        </Box>
      )}

      <ReviewList bookId={book.id} />
    </Paper>
  );
};

export default BookDetails;