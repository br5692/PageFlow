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
  useTheme
} from '@mui/material';
import { AccountCircle, MenuBook as BookIcon, ExitToApp, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer', color: 'text.primary' }}
            onClick={() => navigate('/')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Summit Library
            </Box>
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated ? (
              <div>
                <Button color="inherit" onClick={() => navigate('/books')} sx={{ color: 'text.primary' }}>
                  Browse Books
                </Button>

                {isLibrarian ? (
                  <div style={{ display: 'inline' }}>
                    <Button color="inherit" onClick={() => navigate('/admin/books')} sx={{ color: 'text.primary' }}>
                      Manage Books
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/admin/checkouts')} sx={{ color: 'text.primary' }}>
                      View Checkouts
                    </Button>
                  </div>
                ) : (
                  <Button color="inherit" onClick={() => navigate('/checkouts')} sx={{ color: 'text.primary' }}>
                    My Checkouts
                  </Button>
                )}

                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ color: 'text.primary', display: 'inline-flex' }}
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
              </div>
            ) : (
              <div>
                {/* Login/Register buttons for non-authenticated users */}
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ color: 'text.primary' }}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')} sx={{ color: 'text.primary' }}>
                  Register
                </Button>
              </div>
            )}
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
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
            {isAuthenticated ? (
              <div>
                <MenuItem onClick={() => { navigate('/books'); handleMobileClose(); }}>
                  Browse Books
                </MenuItem>

                {isLibrarian ? (
                  <div>
                    <MenuItem onClick={() => { navigate('/admin/books'); handleMobileClose(); }}>
                      Manage Books
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/admin/checkouts'); handleMobileClose(); }}>
                      View Checkouts
                    </MenuItem>
                  </div>
                ) : (
                  <MenuItem onClick={() => { navigate('/checkouts'); handleMobileClose(); }}>
                    My Checkouts
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  Logout ({user?.name})
                </MenuItem>
              </div>
            ) : (
              <div>
                <MenuItem onClick={() => { navigate('/login'); handleMobileClose(); }}>
                  Login
                </MenuItem>
                <MenuItem onClick={() => { navigate('/register'); handleMobileClose(); }}>
                  Register
                </MenuItem>
              </div>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;