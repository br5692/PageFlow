import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Setup navigate mock
const mockNavigate = jest.fn();

describe('Header Component', () => {
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderHeader = (authState = {}) => {
    // Default auth state
    const defaultAuth = {
      isAuthenticated: false,
      user: null,
      isLibrarian: false,
      isCustomer: false,
      logout: mockLogout,
    };
    
    // Override with provided values
    const authValue = { ...defaultAuth, ...authState };
    
    // Mock the useAuth hook
    require('../../context/AuthContext').useAuth.mockReturnValue(authValue);
    
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Header />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renders the library logo and name', () => {
    renderHeader();
    expect(screen.getByText('Summit Library')).toBeInTheDocument();
  });

  it('navigates to home when logo is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Summit Library'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Fix for waitFor side effects warning - use findByText instead
  it('logs out the user when logout option is clicked', async () => {
    renderHeader({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', role: 'Customer' },
      isCustomer: true,
    });
    
    // With MUI, we need to find the account icon button
    const accountButton = screen.getByLabelText('account of current user');
    fireEvent.click(accountButton);
    
    // Use findByText instead of waitFor with side effects
    const logoutButton = await screen.findByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});