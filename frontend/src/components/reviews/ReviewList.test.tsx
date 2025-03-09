import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReviewList from './ReviewList';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';
import { ReviewDto } from '../../types/review.types';

// Mock dependencies
jest.mock('../../services/reviewService');
jest.mock('../../utils/dateUtils', () => ({
  formatDate: jest.fn((date) => date ? 'January 1, 2023' : 'N/A'),
}));

describe('ReviewList Component', () => {
  const mockReviews: ReviewDto[] = [
    {
      id: 1,
      bookId: 1,
      userId: 'user1',
      userName: 'John Doe',
      rating: 4,
      comment: 'Great book!',
      createdAt: '2023-01-01T00:00:00'
    },
    {
      id: 2,
      bookId: 1,
      userId: 'user2',
      userName: 'Jane Smith',
      rating: 5,
      comment: 'One of my favorites!',
      createdAt: '2023-01-02T00:00:00'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderReviewList = (props = { bookId: 1 }) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ReviewList {...props} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };
  
  it('shows "no reviews" message when empty', async () => {
    // Setup mock to return empty array
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    
    renderReviewList();
    
    // Wait for the no-reviews message
    const message = await screen.findByText(/No reviews yet/i);
    expect(message).toBeInTheDocument();
  });
  
  it('renders list of reviews correctly', async () => {
    // Setup mock to return reviews
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue(mockReviews);
    
    renderReviewList();
    
    // Wait for first review to appear
    const firstUserName = await screen.findByText('John Doe');
    expect(firstUserName).toBeInTheDocument();
    
    // Check that both reviews are rendered
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Great book!')).toBeInTheDocument();
    expect(screen.getByText('One of my favorites!')).toBeInTheDocument();
    
    // Check for formatted dates
    const dates = screen.getAllByText('January 1, 2023');
    expect(dates.length).toBe(2);
  });
  
  it('handles API errors gracefully', async () => {
    // Mock console.error to prevent error output in tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup mock to throw error
    (reviewService.getReviewsByBookId as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch reviews')
    );
    
    renderReviewList();
    
    // After error, component should show the no-reviews message
    const message = await screen.findByText(/No reviews yet/i);
    expect(message).toBeInTheDocument();
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch reviews:',
      expect.any(Error)
    );
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
  
  it('passes bookId to the service', async () => {
    // Setup mock
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    
    // Render with specific bookId
    renderReviewList({ bookId: 42 });
    
    // Wait for service call
    await waitFor(() => {
      expect(reviewService.getReviewsByBookId).toHaveBeenCalledWith(42);
    });
  });
  
  it('renders reviews without comments', async () => {
    // Setup mock with a review that has no comment
    const reviewWithoutComment = { ...mockReviews[0], comment: null };
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([reviewWithoutComment]);
    
    renderReviewList();
    
    // Wait for review to load
    await screen.findByText('John Doe');
    
    // There should be no text for the comment
    expect(screen.queryByText('Great book!')).not.toBeInTheDocument();
  });
});