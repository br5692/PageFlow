import { render, screen } from '@testing-library/react';
import AdminCheckoutsPage from './AdminCheckoutsPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in AdminCheckoutsPage
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
  default: ({ admin }: { admin: boolean }) => (
    <div data-testid="checkout-list" data-admin={admin.toString()}>
      Checkout List Component
    </div>
  ),
}));

describe('AdminCheckoutsPage', () => {
  it('renders page title and checkout list with admin mode', () => {
    render(
      <BrowserRouter>
        <AdminCheckoutsPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Manage Library Checkouts')).toBeInTheDocument();
    expect(screen.getByText('View active checkouts and process book returns')).toBeInTheDocument();
    
    // Check if CheckoutList is rendered with admin=true
    const checkoutList = screen.getByTestId('checkout-list');
    expect(checkoutList).toBeInTheDocument();
    expect(checkoutList.getAttribute('data-admin')).toBe('true');
  });
});