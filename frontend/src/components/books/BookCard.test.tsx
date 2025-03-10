import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from './BookCard';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock image utils
jest.mock('../../utils/imageUtils', () => ({
  getFallbackImageForBook: jest.fn(() => 'fallback-image-url'),
  isFallbackImage: jest.fn(() => false),
}));

const mockNavigate = jest.fn();

describe('BookCard Component', () => {
  const mockBook = {
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
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders book information correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookCard book={mockBook} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(`By ${mockBook.author}`)).toBeInTheDocument();
    expect(screen.getByText(mockBook.category)).toBeInTheDocument();
    expect(screen.getByText(`(${mockBook.averageRating.toFixed(1)})`)).toBeInTheDocument();
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
  });
  
  it('renders "CHECKED OUT" status when book is not available', () => {
    const unavailableBook = { ...mockBook, isAvailable: false };
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookCard book={unavailableBook} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('CHECKED OUT')).toBeInTheDocument();
  });
  
  it('uses fallback image when no cover image is provided', () => {
    const noImageBook = { ...mockBook, coverImage: null };
    
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookCard book={noImageBook} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    const imgElement = screen.getByAltText(`Cover of ${noImageBook.title}`);
    expect(imgElement).toHaveAttribute('src', 'fallback-image-url');
  });
  
  it('navigates to book details page when clicked', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookCard book={mockBook} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText(mockBook.title));
    
    expect(mockNavigate).toHaveBeenCalledWith(`/books/${mockBook.id}`);
  });
  
  it('renders featured book with different styling', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookCard book={mockBook} featured={true} />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Featured books have taller images
    const imgElement = screen.getByAltText(`Cover of ${mockBook.title}`);
    expect(imgElement).toHaveAttribute('height', '380');
  });
});