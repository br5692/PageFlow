import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Link,
  Grid,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  // We'll track a local error if we need to override or show it in this component
  const [loginError, setLoginError] = useState<string | null>(null);

  // On mount, check for error param in URL or fallback to AuthContext error
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get('error');

    // If there's an error in the URL, use it
    if (errorParam) {
      setLoginError(decodeURIComponent(errorParam));
      // Remove the error param from the URL so it doesn't stay forever
      navigate('/login', { replace: true });
    }
    // Otherwise, if the AuthContext has an error, use that
    else if (authError) {
      setLoginError(authError);
    }
  }, [authError, location, navigate]);

  // Toggle password visibility for the password field
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      // Email format is validated here
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      try {
        await login(values);
        // On success, navigate away
        navigate('/');
      } catch (err: any) {
        console.error('Login failed:', err);
        // The AuthContext sets sessionStorage and local state.
        // Here, just reflect that error in the local UI:
        const fallbackMessage = 'Invalid email or password';
        const errorMessage = err.response?.data?.message || fallbackMessage;
        setLoginError(errorMessage);

        // Mark form as not submitting so user can try again
        setSubmitting(false);
      }
    },
  });

  // As soon as user types again, we can clear the local error
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loginError) {
      setLoginError(null);
    }
    formik.handleChange(e);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <Box
          component="form"
          // Prevent default to avoid real HTML submission
          onSubmit={(e) => {
            e.preventDefault();
            if (!formik.isSubmitting) {
              formik.handleSubmit(e);
            }
          }}
          noValidate
          sx={{ mt: 1, width: '100%' }}
        >
          {/* If we have an error, show it */}
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    type="button"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link
                variant="body2"
                component="button"
                type="button"
                onClick={() => navigate('/register')}
                sx={{ cursor: 'pointer' }}
              >
                {"Don't have an account? Register"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;
