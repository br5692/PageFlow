import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';

describe('Footer Component', () => {
  beforeEach(() => {
    // Set up a fixed date for testing the copyright year
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-08'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with correct copyright year', () => {
    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/© 2025 Summit Library/)).toBeInTheDocument();
  });

  it('contains link to Home page', () => {
    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );
    
    // Use getByRole instead of .closest() to avoid direct node access
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('contains link to Books page', () => {
    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );
    
    // Use getByRole instead of .closest() to avoid direct node access
    const booksLink = screen.getByRole('link', { name: 'Books' });
    expect(booksLink).toBeInTheDocument();
    expect(booksLink).toHaveAttribute('href', '/books');
  });
});