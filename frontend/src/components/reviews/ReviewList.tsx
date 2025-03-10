import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Card,
  CardContent,
  Avatar,
  Grid,
  Skeleton,
} from '@mui/material';
import { PersonOutline } from '@mui/icons-material';
import { reviewService } from '../../services/reviewService';
import { ReviewDto } from '../../types/review.types';
import { formatDate } from '../../utils/dateUtils';

interface ReviewListProps {
  bookId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ bookId }) => {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const fetchedReviews = await reviewService.getReviewsByBookId(bookId);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [bookId]);

  if (loading) {
    return (
      <Box>
        {[1, 2].map((n) => (
          <Card variant="outlined" sx={{ mb: 2 }} key={n}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="100%" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body1">No reviews yet. Be the first to leave a review!</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonOutline />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly precision={0.5} size="small" />
                    {review.comment && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.comment}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReviewList;