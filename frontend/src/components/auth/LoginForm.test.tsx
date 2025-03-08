import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  
  it('renders login form with email and password fields', () => {
    renderLoginForm();
    
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });
  
  it('validates required fields on submit', async () => {
    renderLoginForm();
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Use findByText instead of waitFor with getAllByText
    const requiredError = await screen.findByText(/Required/i);
    expect(requiredError).toBeInTheDocument();
    
    // Ensure login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
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
  
  it('submits the form with valid credentials', async () => {
    // Setup successful login
    mockLogin.mockResolvedValueOnce({});
    
    renderLoginForm();
    
    // Enter valid credentials
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Wait for login to be called without using waitFor with side effects
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  
  it('displays error message on login failure', async () => {
    // Setup login failure
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    renderLoginForm();
    
    // Enter credentials
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'WrongPassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Use findByText instead of waitFor with side effects
    const error = await screen.findByText(errorMessage);
    expect(error).toBeInTheDocument();
  });
  
  it('toggles password visibility when visibility icon is clicked', () => {
    renderLoginForm();
    
    // Password field should initially be of type password
    const passwordField = screen.getByLabelText(/Password/i);
    expect(passwordField).toHaveAttribute('type', 'password');
    
    // Click the visibility toggle button
    const visibilityToggle = screen.getByLabelText(/toggle password visibility/i);
    fireEvent.click(visibilityToggle);
    
    // Password field should now be of type text
    expect(passwordField).toHaveAttribute('type', 'text');
    
    // Click again to toggle back
    fireEvent.click(visibilityToggle);
    
    // Password field should be back to type password
    expect(passwordField).toHaveAttribute('type', 'password');
  });
  
  it('navigates to register page when register link is clicked', () => {
    renderLoginForm();
    
    // Click the register link
    fireEvent.click(screen.getByText(/Don't have an account\? Register/i));
    
    // Verify navigation to register page
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});