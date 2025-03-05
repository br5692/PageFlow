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
  Stack
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

const BookList: React.FC<BookListProps> = ({ featured = false, featuredCount = 4 }) => {
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(!featured);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(featured);
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
  const [pageSize] = useState(20);
  const [displayedBooks, setDisplayedBooks] = useState<BookDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  
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
        const allBooks = await bookService.getAllBooks();
        const uniqueCategories = [...new Set(allBooks.map(book => book.category).filter(Boolean))];
        const uniqueAuthors = [...new Set(allBooks.map(book => book.author))];
        
        setAllCategories(uniqueCategories as string[]);
        setAllAuthors(uniqueAuthors);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    if (!featured) {
      fetchAllOptions();
    }
  }, [featured]);

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
        let fetchedBooks: BookDto[];
        
        if (featured) {
          // Explicitly request only the exact number we need for featured books
          fetchedBooks = await bookService.getFeaturedBooks(featuredCount);
        } else if (searchParams.query || searchParams.category || searchParams.author || searchParams.isAvailable !== undefined) {
          fetchedBooks = await bookService.searchBooks(searchParams);
        } else {
          fetchedBooks = await bookService.getAllBooks(searchParams.sortBy, searchParams.ascending);
        }
        
        setBooks(fetchedBooks);
        
        // Reset to first page whenever the book list changes in non-featured mode
        if (!featured) {
          setPage(1);
        }
        
        if (!featured) {
          const uniqueCategories = [...new Set(fetchedBooks.map(book => book.category).filter(Boolean))];
          const uniqueAuthors = [...new Set(fetchedBooks.map(book => book.author))];
          
          setCategories(uniqueCategories as string[]);
          setAuthors(uniqueAuthors);
        }
      } catch (error) {
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
  }, [featured, featuredCount, searchParams, showAlert]);

  // Update displayed books when books array or page changes
  useEffect(() => {
    if (featured) {
      // Featured books don't use pagination
      setDisplayedBooks(books);
    } else {
      // Calculate the books to display for current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setDisplayedBooks(books.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(books.length / pageSize));
    }
  }, [books, page, pageSize, featured]);

  useEffect(() => {
    if (!loading && searchWasActive && searchInputRef.current) {
      searchInputRef.current.focus();
      setSearchWasActive(false);
    }
  }, [loading, searchWasActive]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchParams(prev => ({ ...prev, query: value }));
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
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, sortBy: event.target.value });
  };

  const handleSortDirectionChange = () => {
    setSearchParams({ ...searchParams, ascending: !searchParams.ascending });
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, category: event.target.value || undefined });
  };

  const handleAuthorChange = (event: SelectChangeEvent) => {
    setSearchParams({ ...searchParams, author: event.target.value || undefined });
  };

  const handleAvailabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, isAvailable: event.target.checked ? true : undefined });
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Optionally scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Check appropriate loading state based on mode
  if ((featured && featuredLoading) || (!featured && loading)) {
    return <Loading />;
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
            {displayedBooks.map((book, index) => (
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
          
          {/* Pagination controls - only show for non-featured pages with multiple pages */}
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
                Page {page} of {totalPages} • Showing {displayedBooks.length} of {books.length} books
              </Typography>
            </Stack>
          )}
        </>
      )}
    </>
  );
};

export default BookList;