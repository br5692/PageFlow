import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BookForm from './BookForm';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { BookDto } from '../../types/book.types';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: jest.fn().mockReturnValue({}),
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../services/bookService', () => ({
  bookService: {
    getBookById: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    getAllBooks: jest.fn()
  }
}));

jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn()
}));

const mockShowAlert = jest.fn();
const mockConfirm = window.confirm;

describe('BookForm Component', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useParams.mockReturnValue({});
    require('../../context/AlertContext').useAlert.mockReturnValue({
      showAlert: mockShowAlert
    });
    
    (bookService.getBookById as jest.Mock).mockResolvedValue(mockBook);
    (bookService.getAllBooks as jest.Mock).mockResolvedValue({
      data: [
        { id: 1, title: 'Book 1', category: 'Fiction' },
        { id: 2, title: 'Book 2', category: 'Non-Fiction' },
        { id: 3, title: 'Book 3', category: 'Science' }
      ],
      totalCount: 3
    });
    
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    window.confirm = mockConfirm;
    cleanup();
  });

  it('renders edit book form with prefilled data', async () => {
    const editMockBook = { ...mockBook, id: 111 };
    require('react-router-dom').useParams.mockReturnValue({ id: '111' });
    (bookService.getBookById as jest.Mock).mockResolvedValue(editMockBook);
  
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookForm isEdit={true} />
        </ThemeProvider>
      </BrowserRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByDisplayValue(editMockBook.title)).toBeInTheDocument();
    });
  
    expect(screen.getByDisplayValue(editMockBook.author)).toBeInTheDocument();
    expect(screen.getByDisplayValue(editMockBook.isbn || '')).toBeInTheDocument();
    expect(screen.getByDisplayValue(editMockBook.publisher || '')).toBeInTheDocument();
    expect(screen.getByDisplayValue(editMockBook.pageCount.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(editMockBook.description || '')).toBeInTheDocument();
    expect(screen.getByDisplayValue(editMockBook.coverImage || '')).toBeInTheDocument();
  
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  it('creates a new book when form is submitted', async () => {
    const createdBook = { ...mockBook, id: 222 };
    (bookService.createBook as jest.Mock).mockResolvedValue(createdBook);

    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookForm />
        </ThemeProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Book Title' } });
    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByLabelText(/Page Count/i), { target: { value: '300' } });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(bookService.createBook).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Book Title',
        author: 'New Author',
        pageCount: 300
      }));
    });

    expect(mockShowAlert).toHaveBeenCalledWith('success', 'Book created');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/books');
  });

  it('navigates back when cancel button is clicked', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <BookForm />
        </ThemeProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/books');
  });
});