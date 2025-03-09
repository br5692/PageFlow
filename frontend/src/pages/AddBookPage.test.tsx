import { render, screen } from '@testing-library/react';
import AddBookPage from './AddBookPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in AddBookPage
jest.mock('../components/common/PageTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-title">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

jest.mock('../components/books/BookForm', () => ({
  __esModule: true,
  default: () => <div data-testid="book-form">Book Form Component</div>,
}));

describe('AddBookPage', () => {
  it('renders page title and book form', () => {
    render(
      <BrowserRouter>
        <AddBookPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
    expect(screen.getByText('Add a new book to the library collection')).toBeInTheDocument();
    
    // Check if BookForm is rendered
    expect(screen.getByTestId('book-form')).toBeInTheDocument();
  });
});