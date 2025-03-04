import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { BookDto, BookFilterParams } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import BookCard from './BookCard';
import Loading from '../common/Loading';
import { useAlert } from '../../context/AlertContext';

export {};

interface BookListProps {
  featured?: boolean;
  featuredCount?: number;
}

const BookList: React.FC<BookListProps> = ({ featured = false, featuredCount = 10 }) => {
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
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let fetchedBooks: BookDto[];
        
        if (featured) {
          fetchedBooks = await bookService.getFeaturedBooks(featuredCount);
        } else if (searchParams.query || searchParams.category || searchParams.author || searchParams.isAvailable !== undefined) {
          fetchedBooks = await bookService.searchBooks(searchParams);
        } else {
          fetchedBooks = await bookService.getAllBooks(searchParams.sortBy, searchParams.ascending);
        }
        
        setBooks(fetchedBooks);
        
        // Extract unique categories and authors for filters
        if (!featured) {
          const uniqueCategories = [...new Set(fetchedBooks.map(book => book.category).filter(Boolean))];
          const uniqueAuthors = [...new Set(fetchedBooks.map(book => book.author))];
          
          setCategories(uniqueCategories as string[]);
          setAuthors(uniqueAuthors);
        }
      } catch (error) {
        showAlert('error', 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [
    featured,
    featuredCount,
    searchParams.query,
    searchParams.category,
    searchParams.author,
    searchParams.isAvailable,
    searchParams.sortBy,
    searchParams.ascending,
    showAlert,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, query: event.target.value });
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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {!featured && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Books"
                variant="outlined"
                value={searchParams.query || ''}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={searchParams.category || ''}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="author-label">Author</InputLabel>
                <Select
                  labelId="author-label"
                  value={searchParams.author || ''}
                  label="Author"
                  onChange={handleAuthorChange}
                >
                  <MenuItem value="">All Authors</MenuItem>
                  {authors.map((author) => (
                    <MenuItem key={author} value={author}>
                      {author}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
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
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          No books found. Try adjusting your search criteria.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default BookList;