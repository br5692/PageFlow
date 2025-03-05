import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Alert,
  Chip,
  Stack,
  FormHelperText,
} from '@mui/material';
import { Save, ArrowBack, Delete, Info } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { BookCreateDto, BookUpdateDto } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import { useAlert } from '../../context/AlertContext';
import { getCurrentDateISOString } from '../../utils/dateUtils';

interface BookFormProps {
  isEdit?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const initialValues: BookCreateDto = {
    title: '',
    author: '',
    isbn: '',
    publishedDate: getCurrentDateISOString(),
    description: '',
    coverImage: '',
    publisher: '',
    category: '',
    pageCount: 100,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    author: Yup.string().required('Author is required'),
    isbn: Yup.string().nullable(),
    publishedDate: Yup.date().required('Publication date is required'),
    description: Yup.string().nullable(),
    coverImage: Yup.string().url('Must be a valid URL').nullable(),
    publisher: Yup.string().nullable(),
    category: Yup.string().nullable(),
    pageCount: Yup.number()
      .min(1, 'Must be at least 1 page')
      .max(10000, 'Must be less than 10,000 pages')
      .required('Page count is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        if (isEdit && id) {
          const bookId = parseInt(id);
          const updateDto: BookUpdateDto = {
            id: bookId,
            ...values,
          };
          await bookService.updateBook(updateDto);
          showAlert('success', 'Book updated successfully');
        } else {
          await bookService.createBook(values);
          showAlert('success', 'Book created successfully');
        }
        navigate('/admin/books');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
          (isEdit ? 'Failed to update book' : 'Failed to create book');
        showAlert('error', errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchBookCategories = async () => {
        try {
          const response = await bookService.getAllBooks();
          // Extract books from the response, handling both formats
          const books = Array.isArray(response) ? response : response.books;
          
          const uniqueCategories = [...new Set(books
            .map(book => book.category)
            .filter(Boolean)
          )];
          
          // Add some standard categories if they're not in the list
          const standardCategories = [
            'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 
            'Mystery', 'Thriller', 'Romance', 'Biography', 
            'History', 'Science', 'Technology', 'Self-Help'
          ];
          
          const allCategories = Array.from(
            new Set([...uniqueCategories, ...standardCategories])
          ).sort();
          
          setCategories(allCategories as string[]);
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      };

    fetchBookCategories();
  }, []);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const bookId = parseInt(id);
          const book = await bookService.getBookById(bookId);
          
          formik.setValues({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            publishedDate: book.publishedDate.split('T')[0], // Format date for input field
            description: book.description || '',
            coverImage: book.coverImage || '',
            publisher: book.publisher || '',
            category: book.category || '',
            pageCount: book.pageCount,
          });
          setError(null);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to load book details';
          setError(errorMessage);
          showAlert('error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();
  }, [id, isEdit, showAlert]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" height={40} width="50%" />
          <Skeleton variant="text" height={20} width="70%" />
        </Box>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Skeleton variant="rectangular" height={56} width="100%" />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={120} width="100%" />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/admin/books')}>
            Back to Books
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/books')}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h5" component="h1">
          {isEdit ? 'Edit Book' : 'Add New Book'}
        </Typography>
      </Stack>
      
      {/* Form help information box */}
      <Alert 
        severity="info" 
        icon={<Info />} 
        sx={{ mb: 3 }}
      >
        {isEdit 
          ? 'Update the book information using the form below. All fields marked with * are required.'
          : 'Add a new book to the library collection. All fields marked with * are required.'}
      </Alert>
      
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              required
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="author"
              name="author"
              label="Author"
              value={formik.values.author}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.author && Boolean(formik.errors.author)}
              helperText={formik.touched.author && formik.errors.author}
              required
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="isbn"
              name="isbn"
              label="ISBN"
              value={formik.values.isbn || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.isbn && Boolean(formik.errors.isbn)}
              helperText={formik.touched.isbn && formik.errors.isbn}
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="publishedDate"
              name="publishedDate"
              label="Publication Date"
              type="date"
              value={formik.values.publishedDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.publishedDate && Boolean(formik.errors.publishedDate)}
              helperText={formik.touched.publishedDate && formik.errors.publishedDate}
              required
              disabled={submitting}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="publisher"
              name="publisher"
              label="Publisher"
              value={formik.values.publisher || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.publisher && Boolean(formik.errors.publisher)}
              helperText={formik.touched.publisher && formik.errors.publisher}
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={formik.touched.category && Boolean(formik.errors.category)}
            >
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category || ''}
                label="Category"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={submitting}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.category && formik.errors.category && (
                <FormHelperText>{formik.errors.category as string}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="pageCount"
              name="pageCount"
              label="Page Count"
              type="number"
              value={formik.values.pageCount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.pageCount && Boolean(formik.errors.pageCount)}
              helperText={formik.touched.pageCount && formik.errors.pageCount}
              required
              disabled={submitting}
              variant="outlined"
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="coverImage"
              name="coverImage"
              label="Cover Image URL"
              value={formik.values.coverImage || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.coverImage && Boolean(formik.errors.coverImage)}
              helperText={formik.touched.coverImage && formik.errors.coverImage || 'Enter a valid image URL for the book cover'}
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              disabled={submitting}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/books')}
            startIcon={<ArrowBack />}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Box>
            {isEdit && (
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this book?')) {
                    bookService.deleteBook(parseInt(id as string))
                      .then(() => {
                        showAlert('success', 'Book deleted successfully');
                        navigate('/admin/books');
                      })
                      .catch((error: any) => {
                        showAlert('error', error.response?.data?.message || 'Failed to delete book');
                      });
                  }
                }}
                startIcon={<Delete />}
                sx={{ mr: 2 }}
                disabled={submitting}
              >
                Delete
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Save />}
              disabled={submitting || !formik.isValid}
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookForm;