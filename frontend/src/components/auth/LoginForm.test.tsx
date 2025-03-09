import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import LoginForm from './LoginForm';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the AlertContext
jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn(),
}));

// Setup mocks
const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockShowAlert = jest.fn();

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    require('../../context/AuthContext').useAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
    });
    
    require('../../context/AlertContext').useAlert.mockReturnValue({
      showAlert: mockShowAlert,
    });
  });
  
  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <LoginForm />
        </ThemeProvider>
      </BrowserRouter>
    );
  };
  
  it('validates email format', async () => {
    renderLoginForm();
    
    // Enter invalid email
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'invalid-email' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Use findByText instead of waitFor
    const emailError = await screen.findByText(/Invalid email address/i);
    expect(emailError).toBeInTheDocument();
  });
  
  it('navigates to register page when register link is clicked', () => {
    renderLoginForm();
    
    // Click the register link
    fireEvent.click(screen.getByText(/Don't have an account\? Register/i));
    
    // Verify navigation to register page
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});