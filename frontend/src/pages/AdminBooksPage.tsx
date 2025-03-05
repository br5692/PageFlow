import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Typography, 
  IconButton, 
  Tooltip, 
  Chip, 
  TableContainer,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  useTheme,
  Pagination,
  Stack
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  Visibility, 
  Clear,
  FilterList 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BookDto } from '../types/book.types';
import { bookService } from '../services/bookService';
import { useAlert } from '../context/AlertContext';
import PageTitle from '../components/common/PageTitle';

const AdminBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const theme = useTheme();
  
  const [books, setBooks] = useState<BookDto[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [displayedBooks, setDisplayedBooks] = useState<BookDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await bookService.getAllBooks();
        setBooks(data);
        setFilteredBooks(data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to load books:', error);
        setError(error.response?.data?.message || 'Failed to load books');
        showAlert('error', 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [showAlert]);

  // Filter books based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = books.filter(
        book => 
          book.title.toLowerCase().includes(lowercaseSearch) ||
          book.author.toLowerCase().includes(lowercaseSearch) ||
          (book.category && book.category.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredBooks(filtered);
    }
    // Reset to first page whenever the filtered list changes
    setPage(1);
  }, [searchTerm, books]);

  // Update displayed books when filtered books or page changes
  useEffect(() => {
    // Calculate the books to display for current page
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedBooks(filteredBooks.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredBooks.length / pageSize));
  }, [filteredBooks, page, pageSize]);

  const handleAddBook = () => {
    navigate('/admin/books/add');
  };

  const handleEditBook = (id: number) => {
    navigate(`/admin/books/edit/${id}`);
  };

  const handleViewBook = (id: number) => {
    navigate(`/books/${id}`);
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        setDeletingBookId(id);
        await bookService.deleteBook(id);
        setBooks(books.filter(book => book.id !== id));
        setFilteredBooks(filteredBooks.filter(book => book.id !== id));
        showAlert('success', 'Book deleted successfully');
      } catch (error: any) {
        showAlert('error', error.response?.data?.message || 'Failed to delete book');
      } finally {
        setDeletingBookId(null);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Optionally scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        <Skeleton variant="rectangular" height={52} sx={{ mb: 2 }} />
        <Paper sx={{ bgcolor: 'background.paper' }}>
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          color="text.primary" 
          gutterBottom
        >
          Manage Books
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          Add, edit, or remove books from the library
        </Typography>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            color="text.primary" 
            gutterBottom
          >
            Manage Books
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
          >
            Add, edit, or remove books from the library
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddBook}
          sx={{ height: 'fit-content' }}
        >
          Add New Book
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by title, author or category..."
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'background.default'
              } 
            }}
          />
        </Box>
      </Paper>

      {filteredBooks.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h5" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
            No books found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm 
              ? "No books match your search criteria" 
              : "There are no books in the library yet"}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              sx={{ mt: 3 }}
              startIcon={<Add />}
              onClick={handleAddBook}
            >
              Add Your First Book
            </Button>
          )}
          {searchTerm && (
            <Button 
              variant="outlined" 
              sx={{ mt: 3 }}
              onClick={clearSearch}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Title</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Author</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Category</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedBooks.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell sx={{ color: 'text.primary' }}>{book.id}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          fontWeight: 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px',
                          color: 'text.primary'
                        }}
                      >
                        {book.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.primary' }}>{book.author}</TableCell>
                    <TableCell sx={{ color: 'text.primary' }}>{book.category || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={book.isAvailable ? 'Available' : 'Checked Out'}
                        color={book.isAvailable ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Book">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewBook(book.id)}
                            size="small"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Book">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditBook(book.id)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Book">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteBook(book.id)}
                            size="small"
                            disabled={deletingBookId === book.id}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination controls - only show if we have multiple pages */}
          {totalPages > 1 && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size="large"
              />
              <Typography variant="body2" color="text.secondary">
                Page {page} of {totalPages} • Showing {displayedBooks.length} of {filteredBooks.length} books
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminBooksPage;