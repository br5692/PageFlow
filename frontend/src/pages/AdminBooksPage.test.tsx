import { render, screen } from '@testing-library/react';
import AdminBooksPage from './AdminBooksPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in AdminBooksPage
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
  default: ({ admin }: { admin: boolean }) => (
    <div data-testid="book-list" data-admin={admin.toString()}>
      Book List Component
    </div>
  ),
}));

describe('AdminBooksPage', () => {
  it('renders page title and book list with admin mode', () => {
    render(
      <BrowserRouter>
        <AdminBooksPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Manage Books')).toBeInTheDocument();
    expect(screen.getByText('Add, edit, or remove books from the library')).toBeInTheDocument();
    
    // Check if BookList is rendered with admin=true
    const bookList = screen.getByTestId('book-list');
    expect(bookList).toBeInTheDocument();
    expect(bookList.getAttribute('data-admin')).toBe('true');
  });
});