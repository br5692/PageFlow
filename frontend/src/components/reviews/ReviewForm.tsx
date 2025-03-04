// src/components/reviews/ReviewForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { reviewService } from '../../services/reviewService';
import { useAlert } from '../../context/AlertContext';

interface ReviewFormProps {
  bookId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookId }) => {
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const checkIfUserReviewed = async () => {
      try {
        const reviews = await reviewService.getReviewsByBookId(bookId);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const hasAlreadyReviewed = reviews.some(review => review.userId === user.id);
        setHasReviewed(hasAlreadyReviewed);
      } catch (error) {
        console.error('Error checking if user has reviewed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkIfUserReviewed();
  }, [bookId]);

  const formik = useFormik({
    initialValues: {
      rating: 0,
      comment: '',
    },
    validationSchema: Yup.object({
      rating: Yup.number().min(1, 'Please select a rating').max(5).required('Rating is required'),
      comment: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      try {
        await reviewService.createReview({
          bookId,
          rating: values.rating,
          comment: values.comment,
        });
        
        showAlert('success', 'Review submitted successfully');
        setHasReviewed(true);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to submit review';
        showAlert('error', errorMessage);
      }
    },
  });

  if (loading) {
    return <Box sx={{ py: 2 }}></Box>;
  }

  if (hasReviewed) {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        You have already reviewed this book. Thank you for your feedback!
      </Alert>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>
      
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="rating"
            value={formik.values.rating}
            onChange={(_, newValue) => {
              formik.setFieldValue('rating', newValue);
            }}
            precision={1}
            size="large"
          />
          {formik.touched.rating && formik.errors.rating && (
            <Typography variant="caption" color="error">
              {formik.errors.rating}
            </Typography>
          )}
        </Box>
        
        <TextField
          fullWidth
          id="comment"
          name="comment"
          label="Your Review (Optional)"
          multiline
          rows={4}
          value={formik.values.comment}
          onChange={formik.handleChange}
          variant="outlined"
          margin="normal"
        />
        
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewForm;