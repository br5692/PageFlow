import { render, screen } from '@testing-library/react';
import NewArrivalsSection from './NewArrivalsSection';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { BookDto, PaginatedResponse } from '../../types/book.types';

// Mock dependencies
jest.mock('../../services/bookService', () => ({
  bookService: {
    getAllBooks: jest.fn()
  }
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

describe('NewArrivalsSection Component', () => {
  const mockBooks: BookDto[] = [
    { 
      id: 1, 
      title: 'New Book 1', 
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
      title: 'New Book 2', 
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
    },
    { 
      id: 3, 
      title: 'New Book 3', 
      author: 'Author 3', 
      averageRating: 5.0, 
      isAvailable: true, 
      category: 'Science',
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
    totalCount: 3,
    page: 1,
    pageSize: 50,
    totalPages: 1
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    (bookService.getAllBooks as jest.Mock).mockResolvedValue(mockResponse);
  });
  
  it('renders new arrival books when loaded', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <NewArrivalsSection />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Should show loading state initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Wait for books to load using findByTestId
    const bookCard1 = await screen.findByTestId('book-card-1');
    expect(bookCard1).toBeInTheDocument();
    expect(screen.getByTestId('book-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-3')).toBeInTheDocument();
  });
});