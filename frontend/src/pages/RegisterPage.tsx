import React from 'react';
import { Box } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';
import PageTitle from '../components/common/PageTitle';

const RegisterPage: React.FC = () => {
  return (
    <Box>
      <PageTitle title="Register" subtitle="Create a new account" />
      <RegisterForm />
    </Box>
  );
};

export default RegisterPage;