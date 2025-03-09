import { render, screen } from '@testing-library/react';
import BooksPage from './BooksPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in BooksPage
jest.mock('../components/common/PageTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-title">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

jest.mock('../components/books/BookList', () => ({
  __esModule: true,
  default: () => <div data-testid="book-list">Book List Component</div>,
}));

describe('BooksPage', () => {
  it('renders page title and book list', () => {
    render(
      <BrowserRouter>
        <BooksPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Book Catalog')).toBeInTheDocument();
    expect(screen.getByText('Browse our collection of books')).toBeInTheDocument();
    
    // Check if BookList is rendered
    expect(screen.getByTestId('book-list')).toBeInTheDocument();
  });
});