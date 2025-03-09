import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';
import { BrowserRouter } from 'react-router-dom';

// Mock components and context
jest.mock('../components/home/HomeHero', () => ({
  __esModule: true,
  default: () => <div data-testid="home-hero">Home Hero Component</div>,
}));

jest.mock('../components/books/BookList', () => ({
  __esModule: true,
  default: ({ featured, featuredCount }: { featured?: boolean; featuredCount?: number }) => (
    <div data-testid="book-list" data-featured={featured?.toString() || 'false'} data-count={featuredCount}>
      Book List Component
    </div>
  ),
}));

jest.mock('../components/books/NewArrivalsSection', () => ({
  __esModule: true,
  default: () => <div data-testid="new-arrivals">New Arrivals Component</div>,
}));

jest.mock('../components/common/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading Component</div>,
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, isLibrarian: false }),
}));

describe('HomePage', () => {
  it('renders home hero and featured content for authenticated users', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // HomeHero should always be rendered
    expect(screen.getByTestId('home-hero')).toBeInTheDocument();
    
    // Featured content sections should be rendered for authenticated users
    expect(screen.getByText('FEATURED BOOKS')).toBeInTheDocument();
    expect(screen.getByText('NEW ARRIVALS')).toBeInTheDocument();
  });

  it('shows only home hero for unauthenticated users', () => {
    // Override the mock for this test only
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({ isAuthenticated: false });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // HomeHero should be rendered
    expect(screen.getByTestId('home-hero')).toBeInTheDocument();
    
    // Featured content sections should not be rendered
    expect(screen.queryByText('FEATURED BOOKS')).not.toBeInTheDocument();
    expect(screen.queryByText('NEW ARRIVALS')).not.toBeInTheDocument();
  });
});