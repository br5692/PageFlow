import { render, screen, fireEvent } from '@testing-library/react';
import UnauthorizedPage from './UnauthorizedPage';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UnauthorizedPage', () => {
  it('renders 403 message and home button', () => {
    render(
      <BrowserRouter>
        <UnauthorizedPage />
      </BrowserRouter>
    );
    
    // Check if 403 message is displayed
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to access this page.')).toBeInTheDocument();
    
    // Check if home button is rendered
    const homeButton = screen.getByRole('button', { name: /Go to Home Page/i });
    expect(homeButton).toBeInTheDocument();
    
    // Test navigation when button is clicked
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});