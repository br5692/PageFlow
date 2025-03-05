import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    SelectChangeEvent,
    FormControlLabel,
    Checkbox,
    InputAdornment,
    IconButton,
    useTheme,
    Pagination,
    Stack,
    Paper
  } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import debounce from 'lodash/debounce';
import { BookDto, BookFilterParams } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import BookCard from './BookCard';
import Loading from '../common/Loading';
import { useAlert } from '../../context/AlertContext';

interface BookListProps {
  featured?: boolean;
  featuredCount?: number;
}

const BookList: React.FC<BookListProps> = ({ featured = false, featuredCount = 10 }) => {
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<BookFilterParams>({
    query: '',
    category: undefined,
    author: undefined,
    isAvailable: undefined,
    sortBy: 'title',
    ascending: true,
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12 looks good in grid
  const [totalItems, setTotalItems] = useState(0);
  const [loadingMoreBooks, setLoadingMoreBooks] = useState(false);
  
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  
  const [searchWasActive, setSearchWasActive] = useState(false);
  
  const { showAlert } = useAlert();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        // Use the new cached filter options endpoint
        const { categories, authors } = await bookService.getFilterOptions();
        setAllCategories(categories);
        setAllAuthors(authors);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
  
    if (!featured) {
      fetchAllOptions();
    }
  }, [featured]);

  useEffect(() => {
    // For tracking load time
    const startTime = performance.now();
    
    // Flag to track first render
    const isFirstLoad = page === 1 && !searchParams.query && !searchParams.category && !searchParams.author;
    
    const fetchBooks = async () => {
        const isFirstLoad = page === 1 && !searchParams.query && !searchParams.category && !searchParams.author;
        
        if (isFirstLoad) {
          setLoading(true);
          try {
            // Use the quick load method for first render
            const quickData = await bookService.getQuickBooks();
            
            // Immediately display the first books
            setBooks(quickData.books);
            setTotalItems(quickData.totalCount);
            
            // Set filter options from the quick load
            setAllCategories(quickData.categories);
            setAllAuthors(quickData.authors);
            
            // Then silently load the actual first page in the background
            setTimeout(() => {
              bookService.getAllBooks(
                searchParams.sortBy,
                searchParams.ascending,
                page,
                pageSize
              ).then(response => {
                setBooks(response.books);
              });
            }, 100);
          } catch (error) {
            console.error('Failed to load books:', error);
            showAlert('error', 'Failed to load books');
          } finally {
            setLoading(false);
          }
        } else {
          // Regular pagination loading
          setLoadingMoreBooks(true);
          try {
            const response = await bookService.getAllBooks(
              searchParams.sortBy,
              searchParams.ascending,
              page,
              pageSize
            );
            
            setBooks(response.books);
            setTotalItems(response.totalCount);
          } catch (error) {
            console.error('Failed to load books:', error);
            showAlert('error', 'Failed to load books');
          } finally {
            setLoadingMoreBooks(false);
          }
        }
      };
  
    fetchBooks();
  }, [featured, featuredCount, searchParams, showAlert, page, pageSize]);

    useEffect(() => {
        if (!loading && searchWasActive && searchInputRef.current) {
        searchInputRef.current.focus();
        setSearchWasActive(false);
        }
    }, [loading, searchWasActive]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchParams(prev => ({ ...prev, query: value }));
      setPage(1); // Reset to first page on new search
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchParams(prev => ({ ...prev, query: '' }));
    setPage(1); // Reset to first page when clearing search
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, sortBy: event.target.value });
    setPage(1); // Reset to first page on sort change
  };

  const handleSortDirectionChange = () => {
    setSearchParams({ ...searchParams, ascending: !searchParams.ascending });
    setPage(1); // Reset to first page on sort direction change
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, category: event.target.value || undefined });
    setPage(1); // Reset to first page on category change
  };

  const handleAuthorChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, author: event.target.value || undefined });
    setPage(1); // Reset to first page on author change
  };

  const handleAvailabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, isAvailable: event.target.checked ? true : undefined });
    setPage(1); // Reset to first page on availability change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setLoadingMoreBooks(true);
    setPage(value);
    // Scroll to top when changing page for better UX
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Paper sx={{ p: 2, height: '320px' }}>
              <Box sx={{ width: '100%', height: '180px', bgcolor: 'grey.300', mb: 2 }} />
              <Box sx={{ width: '80%', height: '24px', bgcolor: 'grey.300', mb: 1 }} />
              <Box sx={{ width: '50%', height: '18px', bgcolor: 'grey.300', mb: 1 }} />
              <Box sx={{ width: '100%', height: '60px', bgcolor: 'grey.300', mb: 1 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      {!featured && (
        <Box sx={{ mb: 4 }}>
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
          <Grid 
            container 
            spacing={3}
          >
            {books.map((book: BookDto, index: number) => (
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
          
          {/* Pagination - only show for non-featured views with enough items */}
          {!featured && totalItems > pageSize && (
            <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                <Pagination 
                count={Math.ceil(totalItems / pageSize)} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                disabled={loadingMoreBooks}
                />
                {loadingMoreBooks ? (
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
                ) : (
                <Typography variant="body2" color="text.secondary">
                    Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)} of {totalItems} books
                </Typography>
                )}
            </Stack>
            )}
        </>
      )}
    </>
  );
};

export default BookList;