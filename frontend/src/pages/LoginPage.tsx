import React from 'react';
import { Box } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';
import PageTitle from '../components/common/PageTitle';

const LoginPage: React.FC = () => {
  return (
    <Box>
      <PageTitle title="Login" subtitle="Sign in to your account" />
      <LoginForm />
    </Box>
  );
};

export default LoginPage;