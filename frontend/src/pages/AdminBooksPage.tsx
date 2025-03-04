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
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  Visibility, 
  LibraryBooks,
  FilterList,
  Clear,
  Book as BookIcon
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [books, setBooks] = useState<BookDto[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);

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
  }, [searchTerm, books]);

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
        console.error('Failed to delete book:', error);
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

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        <Skeleton variant="rectangular" height={52} sx={{ mb: 2 }} />
        <Paper>
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageTitle title="Manage Books" subtitle="Add, edit, or remove books from the library" />
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

  // Mobile view - card-based layout
  if (isMobile) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <PageTitle title="Manage Books" subtitle="Add, edit, or remove books from the library" />
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search books..."
            variant="outlined"
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
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddBook}
          >
            Add
          </Button>
        </Stack>

        {filteredBooks.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <BookIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No books found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm 
                  ? "No books match your search criteria" 
                  : "There are no books in the library yet"}
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                startIcon={<Add />}
                onClick={handleAddBook}
              >
                Add Your First Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filteredBooks.map((book) => (
              <Card key={book.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {book.title}
                    </Typography>
                    <Chip
                      label={book.isAvailable ? 'Available' : 'Checked Out'}
                      color={book.isAvailable ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    by {book.author}
                  </Typography>
                  {book.category && (
                    <Typography variant="body2" color="text.secondary">
                      Category: {book.category}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewBook(book.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditBook(book.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteBook(book.id)}
                      disabled={deletingBookId === book.id}
                    >
                      {deletingBookId === book.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  // Desktop view - table-based layout
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <PageTitle title="Manage Books" subtitle="Add, edit, or remove books from the library" />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddBook}
        >
          Add New Book
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
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
          />
        </Box>
      </Paper>

      {filteredBooks.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <LibraryBooks sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3 }} />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.id}</TableCell>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        fontWeight: 'medium',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '300px'
                      }}
                    >
                      {book.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category || '—'}</TableCell>
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
      )}
    </Box>
  );
};

export default AdminBooksPage;