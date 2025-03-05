import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Paper, Table, TableHead, TableBody, TableRow, TableCell, 
  Typography, IconButton, Tooltip, Chip, TableContainer, TextField,
  InputAdornment, Alert, Pagination, Stack 
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, Clear, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BookDto, BookFilterParams } from '../types/book.types';
import { bookService } from '../services/bookService';
import { useAlert } from '../context/AlertContext';
import PageTitle from '../components/common/PageTitle';

const AdminBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params: BookFilterParams = {
          query: searchTerm,
          page,
          pageSize
        };
        
        const response = await bookService.searchBooks(params);
        setBooks(response.data);
        setTotalPages(response.totalPages);
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
  }, [page, searchTerm, showAlert]);

  const handleAddBook = () => navigate('/admin/books/add');

  const handleEditBook = (id: number) => navigate(`/admin/books/edit/${id}`);

  const handleViewBook = (id: number) => navigate(`/books/${id}`);

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setDeletingBookId(id);
        await bookService.deleteBook(id);
        setBooks(prev => prev.filter(book => book.id !== id));
        showAlert('success', 'Book deleted successfully');
        
        // Refresh books if we're on the last page with one item
        if (books.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        }
      } catch (error: any) {
        showAlert('error', error.response?.data?.message || 'Failed to delete book');
      } finally {
        setDeletingBookId(null);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <PageTitle 
        title="Manage Books"
        subtitle="Add, edit, or remove books from the library"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleAddBook}>
            Add New Book
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search books..."
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {books.length === 0 && !loading ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {searchTerm ? "No books found" : "No books in the library"}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" sx={{ mt: 3 }} onClick={handleAddBook}>
              Add Your First Book
            </Button>
          )}
        </Paper>
      ) : (
        <>
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
                {books.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>{book.id}</TableCell>
                    <TableCell>{book.title}</TableCell>
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
                        <Tooltip title="View">
                          <IconButton onClick={() => handleViewBook(book.id)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditBook(book.id)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={deletingBookId === book.id}
                            color="error"
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

          {totalPages > 1 && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
              <Typography variant="body2">
                Page {page} of {totalPages} • Showing {books.length} books
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminBooksPage;