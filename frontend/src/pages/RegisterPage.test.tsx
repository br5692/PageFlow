import { render, screen } from '@testing-library/react';
import RegisterPage from './RegisterPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the components used in RegisterPage
jest.mock('../components/common/PageTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-title">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

jest.mock('../components/auth/RegisterForm', () => ({
  __esModule: true,
  default: () => <div data-testid="register-form">Register Form Component</div>,
}));

describe('RegisterPage', () => {
  it('renders page title and register form', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
    
    // Check if PageTitle is rendered with correct props
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Create a new account')).toBeInTheDocument();
    
    // Check if RegisterForm is rendered
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});