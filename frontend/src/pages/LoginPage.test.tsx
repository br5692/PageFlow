import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in LoginPage
jest.mock('../components/common/PageTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-title">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

jest.mock('../components/auth/LoginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">Login Form Component</div>,
}));

describe('LoginPage', () => {
  it('renders page title and login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    
    // Check if LoginForm is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});