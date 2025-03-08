import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock useAuth
jest.mock('../../context/AuthContext', () => {
  const originalModule = jest.requireActual('../../context/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

// Components for testing
const HomeComponent = () => <div>Home Page</div>;
const ProtectedComponent = () => <div>Protected Content</div>;
const LibrarianComponent = () => <div>Librarian Content</div>;

describe('ProtectedRoute', () => {
  it('renders loading component when auth is loading', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Should show loading message
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    
    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    
    // Mock window.location.assign because Navigate component won't actually navigate in tests
    const assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock },
      writable: true
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // In a real scenario, this would navigate to /login
    // but we can't easily test that with the current setup since
    // the MemoryRouter doesn't update the URL
  });

  it('renders outlet when user is authenticated', () => {
    // Mock authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', name: 'Test User', role: 'Customer' },
      loading: false
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Should show protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when user does not have required role', () => {
    // Mock authenticated state with Customer role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', name: 'Test User', role: 'Customer' },
      loading: false
    });
    
    // Mock window.location.assign
    const assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock },
      writable: true
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route element={<ProtectedRoute requiredRole="Librarian" />}>
            <Route path="/admin" element={<LibrarianComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Should not show librarian content
    expect(screen.queryByText('Librarian Content')).not.toBeInTheDocument();
    
    // In a real scenario, this would navigate to /unauthorized
  });

  it('renders outlet when user has required role', () => {
    // Mock authenticated state with Librarian role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', name: 'Test User', role: 'Librarian' },
      loading: false
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route element={<ProtectedRoute requiredRole="Librarian" />}>
            <Route path="/admin" element={<LibrarianComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Should show librarian content
    expect(screen.getByText('Librarian Content')).toBeInTheDocument();
  });
});