import { render, screen, waitFor } from '@testing-library/react';  // Add waitFor here
import BookList from './BookList';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { BookDto, PaginatedResponse } from '../../types/book.types';

// Mock dependencies
jest.mock('../../services/bookService', () => ({
  bookService: {
    getAllBooks: jest.fn(),
    getFeaturedBooks: jest.fn(),
    searchBooks: jest.fn()
  }
}));

jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn().mockReturnValue({
    showAlert: jest.fn()
  })
}));

// Mock BookCard component to simplify testing
jest.mock('./BookCard', () => {
  return {
    __esModule: true,
    default: ({ book }: { book: BookDto }) => (
      <div data-testid={`book-card-${book.id}`}>
        {book.title} by {book.author}
      </div>
    )
  };
});

describe('BookList Component', () => {
  const mockBooks: BookDto[] = [
    { 
      id: 1, 
      title: 'Book 1', 
      author: 'Author 1', 
      averageRating: 4.5, 
      isAvailable: true, 
      category: 'Fiction',
      isbn: null,
      publishedDate: '2023-01-01',
      description: null,
      coverImage: null,
      publisher: null,
      pageCount: 100
    },
    { 
      id: 2, 
      title: 'Book 2', 
      author: 'Author 2', 
      averageRating: 3.5, 
      isAvailable: false, 
      category: 'Non-Fiction',
      isbn: null,
      publishedDate: '2023-01-01',
      description: null,
      coverImage: null,
      publisher: null,
      pageCount: 100
    }
  ];

  const mockResponse: PaginatedResponse<BookDto> = {
    data: mockBooks,
    totalCount: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    (bookService.getAllBooks as jest.Mock).mockResolvedValue(mockResponse);
    (bookService.getFeaturedBooks as jest.Mock).mockResolvedValue(mockResponse);
    (bookService.searchBooks as jest.Mock).mockResolvedValue(mockResponse);
  });
  
  it('renders books when loaded', async () => {
    // Make sure mock returns instantly, not using a real timeout
    (bookService.getAllBooks as jest.Mock).mockResolvedValue(mockResponse);
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookList />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Add timeout to prevent infinite hanging
    await waitFor(() => {
      expect(screen.getByTestId('book-card-1')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByTestId('book-card-2')).toBeInTheDocument();
  });
  
  it('renders featured books when featured prop is true', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookList featured={true} featuredCount={2} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Wait for books to load using findByTestId
    const bookCard1 = await screen.findByTestId('book-card-1');
    expect(bookCard1).toBeInTheDocument();
    expect(screen.getByTestId('book-card-2')).toBeInTheDocument();
    
    // Should have called getFeaturedBooks, not getAllBooks
    expect(bookService.getFeaturedBooks).toHaveBeenCalled();
    expect(bookService.getAllBooks).not.toHaveBeenCalled();
  });
});