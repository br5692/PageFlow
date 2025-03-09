import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from './ReviewForm';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';

// Mock dependencies
jest.mock('../../services/reviewService');
jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ReviewForm Component', () => {
  const mockShowAlert = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    require('../../context/AlertContext').useAlert.mockReturnValue({
      showAlert: mockShowAlert,
    });
    
    // Default localStorage implementation
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ id: 'user1', name: 'Test User' });
      }
      return null;
    });
  });
  
  const renderReviewForm = (props: { bookId: number; disabled?: boolean } = { bookId: 1 }) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ReviewForm {...props} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('shows message when user has already reviewed', async () => {
    // Set up mock to return a review by the current user
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([
      { id: 1, bookId: 1, userId: 'user1', userName: 'Test User', rating: 4, comment: 'Great!', createdAt: '2023-01-01' }
    ]);
    
    renderReviewForm();
    
    // Wait for the already-reviewed message
    const message = await screen.findByText(/You have already reviewed this book/i);
    expect(message).toBeInTheDocument();
  });
  
  it('renders form when user has not reviewed', async () => {
    // User hasn't reviewed this book yet
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    
    renderReviewForm();
    
    // Wait for form to appear
    const formTitle = await screen.findByText(/Write a Review/i);
    expect(formTitle).toBeInTheDocument();
    
    // Check key form elements
    expect(screen.getByText(/Your Rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Review \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument();
  });
  
  it('submits the form with valid data', async () => {
    // Setup mocks
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    (reviewService.createReview as jest.Mock).mockResolvedValue({});
    
    renderReviewForm();
    
    // Wait for form to load
    await screen.findByText(/Write a Review/i);
    
    // Set rating to 4 stars
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[3]); // 4th star (0-indexed)
    
    // Enter a comment
    const commentField = screen.getByLabelText(/Your Review \(Optional\)/i);
    fireEvent.change(commentField, { target: { value: 'This is a test review' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    // Verify the service was called with the correct data
    await waitFor(() => {
      expect(reviewService.createReview).toHaveBeenCalledWith({
        bookId: 1,
        rating: 4,
        comment: 'This is a test review',
      });
    });
    
    // Verify success alert was shown
    expect(mockShowAlert).toHaveBeenCalledWith('success', 'Review submitted successfully');
  });
  
  it('shows error when submission fails', async () => {
    // Setup mocks
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    (reviewService.createReview as jest.Mock).mockRejectedValue(new Error('Submission failed'));
    
    renderReviewForm();
    
    // Wait for form to load
    await screen.findByText(/Write a Review/i);
    
    // Set rating to 5 stars
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[4]); // 5th star
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    // Verify error alert was shown
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('error', 'Failed to submit review');
    });
  });
  
  it('validates form and prevents empty submissions', async () => {
    // Setup mocks
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    
    renderReviewForm();
    
    // Wait for form to load
    await screen.findByText(/Write a Review/i);
    
    // Submit without setting a rating
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    // Verify validation error is shown
    const errorText = await screen.findByText(/Please select a rating/i);
    expect(errorText).toBeInTheDocument();
    
    // Service should not be called
    expect(reviewService.createReview).not.toHaveBeenCalled();
  });
  
  it('disables form when disabled prop is true', async () => {
    // Setup mocks
    (reviewService.getReviewsByBookId as jest.Mock).mockResolvedValue([]);
    
    renderReviewForm({ bookId: 1, disabled: true });
    
    // Wait for form to load
    await screen.findByText(/Write a Review/i);
    
    // Check if form elements are disabled
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    expect(submitButton).toBeDisabled();
    
    const commentField = screen.getByLabelText(/Your Review \(Optional\)/i);
    expect(commentField).toHaveAttribute('disabled');
  });
});