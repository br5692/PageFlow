import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import { AccountCircle, Book, ExitToApp, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLibrarian } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Book sx={{ mr: 1 }} />
              Library Management System
            </Box>
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => navigate('/books')}>
              Browse Books
            </Button>

            {isAuthenticated ? (
              <>
                {isLibrarian && (
                  <>
                    <Button color="inherit" onClick={() => navigate('/admin/books')}>
                      Manage Books
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/admin/checkouts')}>
                      View Checkouts
                    </Button>
                  </>
                )}

                <Button color="inherit" onClick={() => navigate('/checkouts')}>
                  My Checkouts
                </Button>

                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled>
                    {user?.name} ({user?.role})
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={handleMobileMenu}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Menu */}
          <Menu
            id="menu-mobile"
            anchorEl={mobileAnchorEl}
            keepMounted
            open={Boolean(mobileAnchorEl)}
            onClose={handleMobileClose}
          >
            <MenuItem onClick={() => { navigate('/books'); handleMobileClose(); }}>
              Browse Books
            </MenuItem>

            {isAuthenticated ? (
              <>
                {isLibrarian && (
                  <>
                    <MenuItem onClick={() => { navigate('/admin/books'); handleMobileClose(); }}>
                      Manage Books
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/admin/checkouts'); handleMobileClose(); }}>
                      View Checkouts
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={() => { navigate('/checkouts'); handleMobileClose(); }}>
                  My Checkouts
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout ({user?.name})
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => { navigate('/login'); handleMobileClose(); }}>
                  Login
                </MenuItem>
                <MenuItem onClick={() => { navigate('/register'); handleMobileClose(); }}>
                  Register
                </MenuItem>
              </>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;