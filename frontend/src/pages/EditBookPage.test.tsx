import { render, screen } from '@testing-library/react';
import EditBookPage from './EditBookPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in EditBookPage
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
  default: ({ isEdit }: { isEdit?: boolean }) => (
    <div data-testid="book-form" data-edit={isEdit?.toString() || 'false'}>
      Book Form Component
    </div>
  ),
}));

describe('EditBookPage', () => {
  it('renders page title and book form in edit mode', () => {
    render(
      <BrowserRouter>
        <EditBookPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Edit Book')).toBeInTheDocument();
    expect(screen.getByText('Update book information')).toBeInTheDocument();
    
    // Check if BookForm is rendered with isEdit=true
    const bookForm = screen.getByTestId('book-form');
    expect(bookForm).toBeInTheDocument();
    expect(bookForm.getAttribute('data-edit')).toBe('true');
  });
});