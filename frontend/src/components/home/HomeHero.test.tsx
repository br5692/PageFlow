import { render, screen, fireEvent } from '@testing-library/react';
import HomeHero from './HomeHero';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Set up mocks
const mockNavigate = jest.fn();
let mockAuth = {
  isAuthenticated: false,
  isCustomer: false,
  isLibrarian: false,
};

describe('HomeHero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHomeHero = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <HomeHero />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renders hero section with headings', () => {
    renderHomeHero();
    expect(screen.getByText('YOUR JOURNEY')).toBeInTheDocument();
    expect(screen.getByText('BEGINS HERE')).toBeInTheDocument();
    expect(screen.getByText('Let your next read shape your world.')).toBeInTheDocument();
  });

  it('renders call-to-action buttons for unauthenticated users', () => {
    // Setup mock for unauthenticated user
    mockAuth = {
      isAuthenticated: false,
      isCustomer: false,
      isLibrarian: false,
    };

    renderHomeHero();
    expect(screen.getByText('GET STARTED')).toBeInTheDocument();
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    
    // Verify other user types' buttons are not present
    expect(screen.queryByText('BROWSE BOOKS')).not.toBeInTheDocument();
    expect(screen.queryByText('MANAGE BOOKS')).not.toBeInTheDocument();
  });

  it('navigates to register page when GET STARTED button is clicked', () => {
    mockAuth = { isAuthenticated: false, isCustomer: false, isLibrarian: false };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('GET STARTED'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates to login page when LOGIN button is clicked', () => {
    mockAuth = { isAuthenticated: false, isCustomer: false, isLibrarian: false };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('LOGIN'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders customer-specific buttons for authenticated customers', () => {
    // Setup mock for authenticated customer
    mockAuth = {
      isAuthenticated: true,
      isCustomer: true,
      isLibrarian: false,
    };

    renderHomeHero();
    expect(screen.getByText('BROWSE BOOKS')).toBeInTheDocument();
    expect(screen.getByText('MY CHECKOUTS')).toBeInTheDocument();
    
    // Verify other user types' buttons are not present
    expect(screen.queryByText('GET STARTED')).not.toBeInTheDocument();
    expect(screen.queryByText('MANAGE BOOKS')).not.toBeInTheDocument();
  });

  it('navigates to books page when BROWSE BOOKS button is clicked', () => {
    mockAuth = { isAuthenticated: true, isCustomer: true, isLibrarian: false };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('BROWSE BOOKS'));
    expect(mockNavigate).toHaveBeenCalledWith('/books');
  });

  it('navigates to checkouts page when MY CHECKOUTS button is clicked', () => {
    mockAuth = { isAuthenticated: true, isCustomer: true, isLibrarian: false };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('MY CHECKOUTS'));
    expect(mockNavigate).toHaveBeenCalledWith('/checkouts');
  });

  it('renders librarian-specific buttons for authenticated librarians', () => {
    // Setup mock for authenticated librarian
    mockAuth = {
      isAuthenticated: true,
      isCustomer: false,
      isLibrarian: true,
    };

    renderHomeHero();
    expect(screen.getByText('MANAGE BOOKS')).toBeInTheDocument();
    expect(screen.getByText('VIEW CHECKOUTS')).toBeInTheDocument();
    
    // Verify other user types' buttons are not present
    expect(screen.queryByText('GET STARTED')).not.toBeInTheDocument();
    expect(screen.queryByText('MY CHECKOUTS')).not.toBeInTheDocument();
  });

  it('navigates to admin books page when MANAGE BOOKS button is clicked', () => {
    mockAuth = { isAuthenticated: true, isCustomer: false, isLibrarian: true };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('MANAGE BOOKS'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/books');
  });

  it('navigates to admin checkouts page when VIEW CHECKOUTS button is clicked', () => {
    mockAuth = { isAuthenticated: true, isCustomer: false, isLibrarian: true };
    renderHomeHero();
    
    fireEvent.click(screen.getByText('VIEW CHECKOUTS'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/checkouts');
  });
});