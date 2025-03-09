import { render, screen } from '@testing-library/react';
import CheckoutsPage from './CheckoutsPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components and context
jest.mock('../components/common/PageTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-title">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

jest.mock('../components/checkouts/CheckoutList', () => ({
  __esModule: true,
  default: ({ admin }: { admin?: boolean }) => (
    <div data-testid="checkout-list" data-admin={admin?.toString() || 'false'}>
      Checkout List Component
    </div>
  ),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isLibrarian: false }),
}));

describe('CheckoutsPage', () => {
  it('renders customer view when user is not a librarian', () => {
    render(
      <BrowserRouter>
        <CheckoutsPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props for customer
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('My Checkouts')).toBeInTheDocument();
    expect(screen.getByText('Track your borrowed books and due dates')).toBeInTheDocument();
    
    // Check if CheckoutList is rendered without admin=true
    const checkoutList = screen.getByTestId('checkout-list');
    expect(checkoutList).toBeInTheDocument();
    expect(checkoutList.getAttribute('data-admin')).toBe('false');
  });

  it('renders librarian view when user is a librarian', () => {
    // Override the mock for this test only
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({ isLibrarian: true });
    
    render(
      <BrowserRouter>
        <CheckoutsPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props for librarian
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Library Checkouts')).toBeInTheDocument();
    expect(screen.getByText('View and manage book checkouts')).toBeInTheDocument();
    
    // Check if CheckoutList is rendered with admin=true
    const checkoutList = screen.getByTestId('checkout-list');
    expect(checkoutList).toBeInTheDocument();
    expect(checkoutList.getAttribute('data-admin')).toBe('true');
  });
});