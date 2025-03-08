import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';

// Mock the component dependencies
jest.mock('./Header', () => () => <div data-testid="header-component">Header Component</div>);
jest.mock('./Footer', () => () => <div data-testid="footer-component">Footer Component</div>);
jest.mock('../common/AlertMessage', () => () => <div data-testid="alert-component">Alert Component</div>);
jest.mock('../chat/ChatWidget', () => () => <div data-testid="chat-widget">Chat Widget</div>);

// Mock the contexts
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isLibrarian: false,
    isCustomer: false,
    logout: jest.fn(),
  }),
}));

jest.mock('../../context/AlertContext', () => ({
  useAlert: () => ({
    alert: null,
    showAlert: jest.fn(),
    hideAlert: jest.fn(),
  }),
}));

describe('Layout Component', () => {
  it('renders header, footer, alert message, and chat widget', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('header-component')).toBeInTheDocument();
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
    expect(screen.getByTestId('alert-component')).toBeInTheDocument();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });
  
  it('renders children content', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('contains main content in a container', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Use getByRole instead of closest to avoid direct node access
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toContainElement(screen.getByTestId('test-content'));
  });
});