import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Paper, Typography, Alert, Chip, Stack, FormHelperText,
} from '@mui/material';
import { Save, ArrowBack, Delete, Info } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { BookCreateDto, BookUpdateDto } from '../../types/book.types';
import { bookService } from '../../services/bookService';
import { useAlert } from '../../context/AlertContext';
import { getCurrentDateISOString } from '../../utils/dateUtils';

const BookForm: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
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
    title: Yup.string().required('Required'),
    author: Yup.string().required('Required'),
    isbn: Yup.string().nullable(),
    publishedDate: Yup.date().required('Required'),
    description: Yup.string().nullable(),
    coverImage: Yup.string().url('Invalid URL').nullable(),
    publisher: Yup.string().nullable(),
    category: Yup.string().nullable(),
    pageCount: Yup.number().min(1).max(10000).required('Required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        if (isEdit && id) {
          await bookService.updateBook({ id: parseInt(id), ...values });
        } else {
          await bookService.createBook(values);
        }
        navigate('/admin/books');
      } catch (error: any) {
        showAlert('error', error.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await bookService.getAllBooks(undefined, true, 1, 1000);
        const uniqueCategories = Array.from(
          new Set(data.map(book => book.category).filter(Boolean))
        ) as string[];
        setCategories([...uniqueCategories, 'Fiction', 'Non-Fiction', 'Science', 'Technology']);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      if (!isEdit || !id) return;
      
      try {
        const book = await bookService.getBookById(parseInt(id));
        formik.setValues({
          ...book,
          publishedDate: book.publishedDate.split('T')[0]
        });
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load book');
      }
    };
    fetchBook();
  }, [id, isEdit]);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5">{isEdit ? 'Edit Book' : 'Add Book'}</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        {isEdit ? 'Update book details below' : 'Fill in the form to add a new book'}
      </Alert>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
        {(['title', 'author', 'isbn', 'publisher'] as (keyof BookCreateDto)[]).map((field) => (
        <Grid item xs={12} sm={6} key={field}>
            <TextField
            fullWidth
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            {...formik.getFieldProps(field)}
            error={formik.touched[field] && !!formik.errors[field]}
            helperText={formik.touched[field] && formik.errors[field]}
            disabled={submitting}
            />
        </Grid>
        ))}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Publication Date"
              {...formik.getFieldProps('publishedDate')}
              InputLabelProps={{ shrink: true }}
              error={formik.touched.publishedDate && !!formik.errors.publishedDate}
              helperText={formik.touched.publishedDate && formik.errors.publishedDate}
              disabled={submitting}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={formik.touched.category && !!formik.errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                {...formik.getFieldProps('category')}
                label="Category"
                disabled={submitting}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formik.errors.category}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Page Count"
              {...formik.getFieldProps('pageCount')}
              error={formik.touched.pageCount && !!formik.errors.pageCount}
              helperText={formik.touched.pageCount && formik.errors.pageCount}
              disabled={submitting}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cover Image URL"
              {...formik.getFieldProps('coverImage')}
              error={formik.touched.coverImage && !!formik.errors.coverImage}
              helperText={formik.touched.coverImage && formik.errors.coverImage}
              disabled={submitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              {...formik.getFieldProps('description')}
              error={formik.touched.description && !!formik.errors.description}
              helperText={formik.touched.description && formik.errors.description}
              disabled={submitting}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/books')}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Box>
            {isEdit && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  if (window.confirm('Delete this book?')) {
                    bookService.deleteBook(parseInt(id!))
                      .then(() => navigate('/admin/books'))
                      .catch(error => showAlert('error', error.message));
                  }
                }}
                sx={{ mr: 2 }}
                disabled={submitting}
              >
                Delete
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting || !formik.isValid}
            >
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookForm;