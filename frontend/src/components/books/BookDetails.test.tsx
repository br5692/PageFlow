import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BookDetails from './BookDetails';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { checkoutService } from '../../services/checkoutService';
import { BookDto } from '../../types/book.types';

// Mock dependencies - set up once for all tests
const mockNavigate = jest.fn();
const mockShowAlert = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn().mockReturnValue({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../services/bookService', () => ({
  bookService: {
    getBookById: jest.fn(),
    deleteBook: jest.fn()
  }
}));

jest.mock('../../services/checkoutService', () => ({
  checkoutService: {
    checkoutBook: jest.fn()
  }
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn()
}));

jest.mock('../../utils/imageUtils', () => ({
  getFallbackImageForBook: jest.fn(() => 'fallback-image-url'),
  isFallbackImage: jest.fn(() => false)
}));

jest.mock('../../utils/dateUtils', () => ({
  formatDate: jest.fn().mockImplementation(date => date ? 'January 1, 2023' : 'N/A'),
}));

// Mock ReviewList and ReviewForm components
jest.mock('../reviews/ReviewList', () => ({
  __esModule: true,
  default: ({ bookId }: { bookId: number }) => <div data-testid="review-list">Reviews for book {bookId}</div>
}));

jest.mock('../reviews/ReviewForm', () => ({
  __esModule: true,
  default: ({ bookId }: { bookId: number }) => <div data-testid="review-form">Add review for book {bookId}</div>
}));

describe('BookDetails Component', () => {
  const mockBook: BookDto = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    isbn: '1234567890',
    publishedDate: '2023-01-01',
    description: 'Test description',
    coverImage: 'test-image-url',
    publisher: 'Test Publisher',
    category: 'Fiction',
    pageCount: 200,
    isAvailable: true,
    averageRating: 4.5
  };

  // Original window.confirm
  const originalConfirm = window.confirm;

  beforeAll(() => {
    // Override window.confirm for all tests
    window.confirm = jest.fn(() => true);
  });

  afterAll(() => {
    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mocks for each test
    require('../../context/AuthContext').useAuth.mockReturnValue({
      isAuthenticated: true,
      isLibrarian: false,
      isCustomer: true
    });

    require('../../context/AlertContext').useAlert.mockReturnValue({
      showAlert: mockShowAlert
    });

    // Make sure the ID is consistent
    require('react-router-dom').useParams.mockReturnValue({ id: '1' });
    
    // Set default mock implementation for the book service - using implementation instead of resolved value
    (bookService.getBookById as jest.Mock).mockImplementation(() => Promise.resolve({...mockBook}));
  });
  
  afterEach(() => {
    jest.clearAllTimers();
    cleanup();
  });
  
  it('renders error state when book fetch fails', async () => {
    // Set up mock to reject for this test only
    (bookService.getBookById as jest.Mock).mockImplementation(() => Promise.reject(new Error('Failed to load book')));
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/Failed to load book details/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Should show a "Browse Books" button
    expect(screen.getByRole('button', { name: /Browse Books/i })).toBeInTheDocument();
  });
  
  it('renders checkout button for authenticated customers when book is available', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Checkout button should be visible
    expect(screen.getByRole('button', { name: /Check Out Book/i })).toBeInTheDocument();
  });
  
  it('does not render checkout button when book is not available', async () => {
    const unavailableBook = { ...mockBook, isAvailable: false };
    (bookService.getBookById as jest.Mock).mockImplementation(() => Promise.resolve(unavailableBook));
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Checkout button should not be visible
    expect(screen.queryByRole('button', { name: /Check Out Book/i })).not.toBeInTheDocument();
    expect(screen.getByText('Checked Out')).toBeInTheDocument();
  });
  
  it('renders edit and delete buttons for librarians', async () => {
    require('../../context/AuthContext').useAuth.mockReturnValue({
      isAuthenticated: true,
      isLibrarian: true,
      isCustomer: false
    });
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Edit and delete buttons should be visible
    expect(screen.getByRole('button', { name: /Edit Book/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete Book/i })).toBeInTheDocument();
  });
  
  it('calls checkoutBook service when checkout button is clicked', async () => {
    (checkoutService.checkoutBook as jest.Mock).mockImplementation(() => Promise.resolve({ id: 1 }));
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click checkout button
    fireEvent.click(screen.getByRole('button', { name: /Check Out Book/i }));
    
    // Check service was called
    await waitFor(() => {
      expect(checkoutService.checkoutBook).toHaveBeenCalledWith(mockBook.id);
    });
    
    // Check alert was shown
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('success', expect.stringContaining('Book checked out successfully'));
    });
    
    // Check navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/checkouts');
    });
  });
  
  it('navigates to edit page when edit button is clicked', async () => {
    require('../../context/AuthContext').useAuth.mockReturnValue({
      isAuthenticated: true,
      isLibrarian: true,
      isCustomer: false
    });
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /Edit Book/i }));
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith(`/admin/books/edit/${mockBook.id}`);
  });
  
  it('deletes book when delete button is clicked and confirmed', async () => {
    require('../../context/AuthContext').useAuth.mockReturnValue({
      isAuthenticated: true,
      isLibrarian: true,
      isCustomer: false
    });
    
    (bookService.deleteBook as jest.Mock).mockImplementation(() => Promise.resolve(undefined));
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /Delete Book/i }));
    
    // Confirm was shown and responded to
    expect(window.confirm).toHaveBeenCalled();
    
    // Check service was called
    await waitFor(() => {
      expect(bookService.deleteBook).toHaveBeenCalledWith(mockBook.id);
    });
    
    // Check alert was shown
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('success', expect.stringContaining('Book deleted'));
    });

    // Check navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books');
    });
  });
  
  it('navigates back when back button is clicked', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookDetails />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click back button
    fireEvent.click(screen.getByRole('button', { name: /Back to Books/i }));
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/books');
  });
});