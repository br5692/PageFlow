import { render, screen } from '@testing-library/react';
import BookDetailsPage from './BookDetailsPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the BookDetails component
jest.mock('../components/books/BookDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="book-details">Book Details Component</div>,
}));

describe('BookDetailsPage', () => {
  it('renders book details component', () => {
    render(
      <BrowserRouter>
        <BookDetailsPage />
      </BrowserRouter>
    );
    
    // Check if BookDetails component is rendered
    expect(screen.getByTestId('book-details')).toBeInTheDocument();
  });
});