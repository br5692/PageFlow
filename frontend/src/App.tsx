import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CheckoutsPage from './pages/CheckoutsPage';
import AdminBooksPage from './pages/AdminBooksPage';
import AdminCheckoutsPage from './pages/AdminCheckoutsPage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />

                {/* Protected Routes - Any authenticated user */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkouts" element={<CheckoutsPage />} />
                </Route>

                {/* Protected Routes - Librarian only */}
                <Route element={<ProtectedRoute requiredRole="Librarian" />}>
                  <Route path="/admin/books" element={<AdminBooksPage />} />
                  <Route path="/admin/books/add" element={<AddBookPage />} />
                  <Route path="/admin/books/edit/:id" element={<EditBookPage />} />
                  <Route path="/admin/checkouts" element={<AdminCheckoutsPage />} />
                </Route>

                {/* Not Found */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
};

export default App;