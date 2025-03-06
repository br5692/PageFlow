// src/components/books/BookList.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Box,
  Typography, SelectChangeEvent, FormControlLabel, Checkbox, InputAdornment,
  IconButton, Pagination, Stack, Table, TableHead, TableBody, TableRow,
  TableCell, Tooltip, Chip, TableContainer, Paper, Button
} from '@mui/material';
import { Search, Clear, Add, Edit, Delete, Visibility } from '@mui/icons-material';
import debounce from 'lodash/debounce';
import { BookDto, BookFilterParams } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import BookCard from './BookCard';
import Loading from '../common/Loading';
import { useAlert } from '../../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { bookCache } from '../../utils/bookCache';

interface BookListProps {
  featured?: boolean;
  featuredCount?: number;
  admin?: boolean;
}

const BookList: React.FC<BookListProps> = ({ featured = false, featuredCount = 4, admin = false }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(!featured);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(featured);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const pageSize = 20;
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  const [searchWasActive, setSearchWasActive] = useState(false);
  const [searchParams, setSearchParams] = useState<BookFilterParams>({
    query: '',
    category: undefined,
    author: undefined,
    isAvailable: undefined,
    sortBy: 'title',
    ascending: true,
  });

  const { showAlert } = useAlert();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch filter options (categories, authors)
    useEffect(() => {
        if (!featured) {
        const fetchAllOptions = async () => {
            try {
            const response = await bookService.getAllBooks(undefined, true, 1, 1000);
            const booksData = response.data;
            
            // Get unique categories and sort them alphabetically
            const uniqueCategories = [...new Set(booksData
                .map(book => book.category)
                .filter((c): c is string => c !== undefined && c !== null)
            )].sort();
            
            // Get unique authors
            const uniqueAuthors = [...new Set(booksData.map(book => book.author))];
            
            // Sort authors by last name
            const sortedAuthors = uniqueAuthors.sort((a, b) => {
                const aLastName = a.split(' ').pop() || '';
                const bLastName = b.split(' ').pop() || '';
                return aLastName.localeCompare(bLastName);
            });
            
            setAllCategories(uniqueCategories);
            setAllAuthors(sortedAuthors);
            } catch (error) {
            console.error('Failed to load filter options:', error);
            }
        };
        fetchAllOptions();
        }
    }, [featured]);

  // Fetch books based on search parameters and pagination
  useEffect(() => {
    const fetchBooks = async () => {
      if (featured) {
        setFeaturedLoading(true);
      } else {
        setLoading(true);
      }
  
      if (searchInputRef.current === document.activeElement) {
        setSearchWasActive(true);
      }
  
      try {
        if (featured) {
          // Use the bookCache utility instead of direct variable
          const cachedBooks = bookCache.getFeaturedBooks();
          if (cachedBooks) {
            setBooks(cachedBooks);
          } else {
            const response = await bookService.getFeaturedBooks(featuredCount);
            // Here's the fix - properly access data from the PaginatedResponse
            setBooks(response.data);
            // Store in cache using the utility
            bookCache.setFeaturedBooks(response.data);
          }
        } else {
          const params = {
            ...searchParams,
            page,
            pageSize
          };
  
          let response;
          if (searchParams.query || searchParams.category || searchParams.author || searchParams.isAvailable !== undefined) {
            response = await bookService.searchBooks(params);
          } else {
            response = await bookService.getAllBooks(params.sortBy, params.ascending, page, pageSize);
          }
  
          setBooks(response.data);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        showAlert('error', 'Failed to load books');
      } finally {
        if (featured) {
          setFeaturedLoading(false);
        } else {
          setLoading(false);
        }
      }
    };
  
    fetchBooks();
  }, [featured, featuredCount, searchParams, page, pageSize, showAlert]);

  // Refocus search input when search completes
  useEffect(() => {
    if (!loading && searchWasActive && searchInputRef.current) {
      searchInputRef.current.focus();
      setSearchWasActive(false);
    }
  }, [loading, searchWasActive]);

  // Search debouncing
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchParams(prev => ({ ...prev, query: value }));
      setPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSearchParams(prev => ({ ...prev, query: '' }));
    setPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSortChange = useCallback((event: SelectChangeEvent) => {
    setSearchParams(prev => ({ ...prev, sortBy: event.target.value }));
    setPage(1);
  }, []);

  const handleSortDirectionChange = useCallback(() => {
    setSearchParams(prev => ({ ...prev, ascending: !prev.ascending }));
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((event: SelectChangeEvent) => {
    setSearchParams(prev => ({ ...prev, category: event.target.value || undefined }));
    setPage(1);
  }, []);

  const handleAuthorChange = useCallback((event: SelectChangeEvent) => {
    setSearchParams(prev => ({ ...prev, author: event.target.value || undefined }));
    setPage(1);
  }, []);

  const handleAvailabilityChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, isAvailable: event.target.checked ? true : undefined }));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  }, []);

  // Admin-specific functions
  const handleAddBook = () => navigate('/admin/books/add');
  const handleEditBook = (id: number) => navigate(`/admin/books/edit/${id}`);
  const handleViewBook = (id: number) => navigate(`/books/${id}`);

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        setDeletingBookId(id);
        await bookService.deleteBook(id);
        
        // Update local state to remove the deleted book
        setBooks(prev => prev.filter(book => book.id !== id));
        showAlert('success', 'Book deleted successfully');
        
        // If this was the last book on the current page and not the first page, go to previous page
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

  if ((featured && featuredLoading) || (!featured && loading)) {
    return <Loading />;
  }

  return (
    <>
      {!featured && (
        <Box sx={{ mb: 4 }}>
          {admin && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddBook}
              >
                Add New Book
              </Button>
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                inputRef={searchInputRef}
                fullWidth
                label="Search Books"
                variant="outlined"
                value={searchText}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchText ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleClearSearch}
                        edge="end"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: 'background.paper'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ bgcolor: 'background.paper' }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={searchParams.category || ''}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {allCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ bgcolor: 'background.paper' }}>
                <InputLabel id="author-label">Author</InputLabel>
                <Select
                  labelId="author-label"
                  value={searchParams.author || ''}
                  label="Author"
                  onChange={handleAuthorChange}
                >
                  <MenuItem value="">All Authors</MenuItem>
                  {allAuthors.map((author) => (
                    <MenuItem key={author} value={author}>
                      {author}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ bgcolor: 'background.paper' }}>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  value={searchParams.sortBy || 'title'}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                  <MenuItem value="availability">Availability</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={searchParams.ascending}
                      onChange={handleSortDirectionChange}
                    />
                  }
                  label="Ascending"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={searchParams.isAvailable === true}
                      onChange={handleAvailabilityChange}
                    />
                  }
                  label="Available Only"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {books.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ my: 4, color: 'text.primary' }}>
          {featured 
            ? "No featured books available at this time."
            : "No books found. Try adjusting your search criteria."}
        </Typography>
      ) : (
        <>
          {admin && !featured ? (
            // Admin Table View
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
                  {books.map((book) => (
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
          ) : (
            // Regular Card View
            <Grid container spacing={3}>
              {books.map((book, index) => (
                <Grid 
                  item 
                  key={book.id} 
                  xs={12} 
                  sm={6} 
                  md={featured ? 3 : 4} 
                  lg={featured ? 3 : 3}
                  sx={{ transition: 'all 0.3s ease' }}
                >
                  <BookCard 
                    book={book} 
                    featured={featured}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          
          {!featured && totalPages > 1 && (
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
                Page {page} of {totalPages} • Showing {books.length} books
              </Typography>
            </Stack>
          )}
        </>
      )}
    </>
  );
};

export default BookList;