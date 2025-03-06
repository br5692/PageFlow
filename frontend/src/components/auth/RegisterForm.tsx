import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Link,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle as CheckIcon, 
  Cancel as CancelIcon 
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { showAlert } = useAlert();
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password validation criteria
  const passwordRequirements = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Check each requirement
  const checkPasswordCriteria = (password: string) => {
    return {
      minLength: password.length >= passwordRequirements.minLength,
      hasUppercase: passwordRequirements.hasUppercase.test(password),
      hasLowercase: passwordRequirements.hasLowercase.test(password),
      hasNumber: passwordRequirements.hasNumber.test(password),
      hasSpecialChar: passwordRequirements.hasSpecialChar.test(password)
    };
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Customer',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string()
        .min(passwordRequirements.minLength, `Must be at least ${passwordRequirements.minLength} characters`)
        .matches(passwordRequirements.hasUppercase, 'Must contain at least one uppercase letter')
        .matches(passwordRequirements.hasLowercase, 'Must contain at least one lowercase letter')
        .matches(passwordRequirements.hasNumber, 'Must contain at least one number')
        .matches(passwordRequirements.hasSpecialChar, 'Must contain at least one special character')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
      role: Yup.string().required('Required'),
    }),
    // In RegisterForm.tsx, update the onSubmit function:
    onSubmit: async (values) => {
        try {
          await register({
            email: values.email,
            password: values.password,
            role: values.role,
          });
          
          setRegisterSuccess(true);
          showAlert('success', 'Registration successful! Please login.');
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } catch (error: any) {
          // Get the specific error response data
          const errorData = error.response?.data;
          
          // Check specifically for the DuplicateUserName error code from the screenshot
          if (errorData?.code === "DuplicateUserName") {
            formik.setFieldError('email', 'This email is already registered. Please use another email or login.');
            showAlert('error', 'This email is already registered');
          } 
          // Check for the presence of a description field containing "already taken"
          else if (errorData?.description && errorData.description.includes('already taken')) {
            formik.setFieldError('email', 'This email is already registered. Please use another email or login.');
            showAlert('error', 'This email is already registered');
          }
          // For debugging - log the full error structure
          else {
            console.error('Registration error:', errorData);
            
            // Check for an array of errors that ASP.NET Identity sometimes returns
            if (Array.isArray(errorData)) {
              const duplicateError = errorData.find(err => 
                err.code === "DuplicateUserName" || 
                (err.description && err.description.includes('already taken'))
              );
              
              if (duplicateError) {
                formik.setFieldError('email', 'This email is already registered. Please use another email or login.');
                showAlert('error', 'This email is already registered');
                return;
              }
            }
            
            // Default error handling
            const errorMessage = 
              errorData?.message || 
              errorData?.description || 
              'Registration failed. Please try again.';
            
            showAlert('error', errorMessage);
          }
        }
      },
    });

  // Password validation feedback
  const passwordCriteria = checkPasswordCriteria(formik.values.password);
  const showPasswordFeedback = formik.touched.password && formik.values.password.length > 0;

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
          Register
        </Typography>
        {registerSuccess ? (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="success.main">
              Registration successful! Redirecting to login...
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
              onChange={formik.handleChange}
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
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Password requirements feedback */}
            {showPasswordFeedback && (
              <List dense sx={{ bgcolor: 'background.paper', mt: 1, borderRadius: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    {passwordCriteria.minLength ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <CancelIcon fontSize="small" color="error" />}
                  </ListItemIcon>
                  <ListItemText primary={`At least ${passwordRequirements.minLength} characters`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {passwordCriteria.hasUppercase ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <CancelIcon fontSize="small" color="error" />}
                  </ListItemIcon>
                  <ListItemText primary="At least one uppercase letter" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {passwordCriteria.hasLowercase ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <CancelIcon fontSize="small" color="error" />}
                  </ListItemIcon>
                  <ListItemText primary="At least one lowercase letter" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {passwordCriteria.hasNumber ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <CancelIcon fontSize="small" color="error" />}
                  </ListItemIcon>
                  <ListItemText primary="At least one number" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {passwordCriteria.hasSpecialChar ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <CancelIcon fontSize="small" color="error" />}
                  </ListItemIcon>
                  <ListItemText primary="At least one special character" />
                </ListItem>
              </List>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              fullWidth
              margin="normal"
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formik.values.role}
                label="Role"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Librarian">Librarian</MenuItem>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <FormHelperText>{formik.errors.role}</FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link variant="body2" onClick={() => navigate('/login')} sx={{ cursor: 'pointer' }}>
                  {'Already have an account? Login'}
                </Link>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RegisterForm;